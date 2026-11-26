from pathlib import Path
import argparse, collections, io, json, re, time, unicodedata
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
UA = 'NakwonRecordsStudentDemo/2.2 (one-time catalog setup; MusicBrainz student project)'
MB = 'https://musicbrainz.org/ws/2/'
CAA = 'https://coverartarchive.org/'
last_mb = 0.0

def fetch(url, mb=False):
    global last_mb
    for attempt in range(3):
        if mb:
            time.sleep(max(0, 1.2 - (time.monotonic() - last_mb)))
            last_mb = time.monotonic()
        try:
            with urlopen(Request(url, headers={'User-Agent': UA}), timeout=25) as resp:
                data = resp.read(20 * 1024 * 1024 + 1)
            if len(data) > 20 * 1024 * 1024:
                raise ValueError('Response too large')
            return data
        except HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise
        except OSError:
            if attempt == 2:
                raise
        time.sleep(2 ** (attempt + 1))

def mb_json(path, **params):
    return json.loads(fetch(MB + path + '?' + urlencode({'fmt':'json', **params}), mb=True))

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s).casefold() if c.isalnum())

def quote_query(s):
    return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'

def artist_names(r):
    return [n for ac in r.get('artist-credit', []) for n in (ac.get('name',''), ac.get('artist',{}).get('name','')) if n]

def matches(r, d):
    formats = [m.get('format','') for m in r.get('media',[])]
    # LP only 12-inch vinyl or vinyl explicitly marked LP; CD must contain a CD.
    format_ok = any(f in ('12" Vinyl', 'Vinyl') for f in formats) if d['format']=='LP' else 'CD' in formats
    if not format_ok or r.get('status','').lower() != 'official':
        return False
    group = r.get('release-group') or {}
    if group.get('primary-type') and group['primary-type'] != 'Album':
        return False
    allowed = {norm(t) for t in d['search_titles']}
    titles = [r.get('title',''), group.get('title','')]
    title_ok = any(norm(t) in allowed for t in titles)
    if d.get('classical_match'):
        # Classical release titles vary by country; match the specific work and performer.
        for t in titles:
            nt = norm(t)
            if d['title']=='Symphonien nos. 5 & 7':
                title_ok |= ('5' in nt and '7' in nt and ('symphon' in nt or 'sinfon' in nt))
            elif d['title']=='Variations Goldberg':
                title_ok |= 'goldberg' in nt and ('1955' in nt or norm(t) in allowed)
            elif d['title']=='The Cello Suites: Inspired by Bach':
                title_ok |= 'inspiredbybach' in nt and 'cellosuite' in nt
    aliases = {norm(a) for a in d.get('search_artists',[d['search_artist']])}
    credits = [norm(a) for a in artist_names(r)]
    # Some classical credits combine composer, performer and ensemble in one credited name.
    artist_ok = bool(aliases.intersection(credits)) or (d.get('classical_match') and any(a in c for a in aliases for c in credits))
    return title_ok and artist_ok

def candidates(d):
    seen=set()
    # Prefer a previously selected release if it still matches title, artist and format.
    prior=d.get('prior_url','')
    if '/release/' in prior:
        mid=prior.split('/')[-2]
        try:
            r=mb_json('release/'+mid, inc='artist-credits+release-groups')
            if matches(r,d):
                seen.add(mid); yield r
        except HTTPError as e:
            if e.code != 404: raise
    fmt = '12" Vinyl' if d['format']=='LP' else 'CD'
    for title in d['search_titles']:
        for artist in d.get('search_artists',[d['search_artist']]):
            q=f'release:{quote_query(title)} AND artistname:{quote_query(artist)} AND format:{quote_query(fmt)} AND status:official'
            result=mb_json('release',query=q,limit=50)
            for r in result.get('releases',[]):
                if r['id'] not in seen and matches(r,d):
                    seen.add(r['id']); yield r

def decode(data):
    with Image.open(io.BytesIO(data)) as im:
        im.load()
        if min(im.size)<100: raise ValueError('Cover too small')
        im=ImageOps.exif_transpose(im).convert('RGB')
        im.thumbnail((500,500), Image.Resampling.LANCZOS)
        return im.copy()

def resolve(d):
    # The LP edition is retained in the catalog. For this album use the
    # verified MusicBrainz CD release's front art if necessary.
    fallback = d.get('cover_release_id')
    if fallback:
        for size in ('front-500', 'front-250', 'front'):
            url = CAA + 'release/' + fallback + '/' + size
            try:
                im = decode(fetch(url))
                return im, {'release_id': fallback, 'release_title': d['title'],
                            'release_artist': d['artist'], 'media': ['CD'],
                            'source_url': url,
                            'note': 'Same album CD front art used for LP product.'}
            except (HTTPError, OSError, ValueError) as e:
                print('   direct cover unavailable:', str(e), flush=True)
    checked=0
    groups=set()
    for r in candidates(d):
        checked+=1
        group=(r.get('release-group') or {}).get('id')
        urls=[CAA+'release/'+r['id']+'/front-500']
        if group and group not in groups:
            groups.add(group); urls.append(CAA+'release-group/'+group+'/front-500')
        for url in urls:
            try:
                im=decode(fetch(url))
                return im, {'release_id':r['id'],'release_title':r['title'],'release_artist': ' / '.join(artist_names(r)), 'media':[m.get('format') for m in r.get('media',[])], 'source_url':url}
            except (HTTPError, OSError, ValueError) as e:
                print('   cover unavailable:', str(e), flush=True)
        if checked>=12: break
    raise RuntimeError('No matching official release with usable cover. Check search_titles/search_artist in albums60.json.')

def sqlstr(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"

def make_sql(rows):
    out=['-- 60 albums: 5 LP + 5 CD per genre. Existing matched rows keep IDs, prices and stock.',
         '-- Existing rows and references are preserved. Missing In a Time Lapse local cover may use the remote source. No DELETE.',
         'USE nakwon_records;', 'SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;',
         'DROP TEMPORARY TABLE IF EXISTS tmp_nakwon_60;',
         'CREATE TEMPORARY TABLE tmp_nakwon_60 (seq INT PRIMARY KEY, title VARCHAR(120) NOT NULL, artist VARCHAR(100) NOT NULL, price INT UNSIGNED NOT NULL, genre VARCHAR(50) NOT NULL, format VARCHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, image_url VARCHAR(2048) NULL, stock INT UNSIGNED NOT NULL, recommended TINYINT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
         'INSERT INTO tmp_nakwon_60 (seq,title,artist,price,genre,format,image_url,stock,recommended) VALUES']
    for i,d in enumerate(rows):
        out.append('('+', '.join([str(d['seq']),sqlstr(d['title']),sqlstr(d['artist']),str(d['price']),sqlstr(d['genre']),sqlstr(d['format']),sqlstr(d['image_url']),str(d['stock']),str(d['recommended'])])+(');' if i==len(rows)-1 else '),'))
    out += ['START TRANSACTION;',
      'INSERT INTO albums (title,artist,price,genre,format,image_url,stock,hidden)',
      'SELECT s.title,s.artist,s.price,s.genre,s.format,s.image_url,s.stock,0 FROM tmp_nakwon_60 s',
      'WHERE NOT EXISTS (SELECT 1 FROM albums a WHERE a.title=s.title AND a.artist=s.artist AND a.format=s.format) ORDER BY s.seq;',
      'UPDATE albums a JOIN tmp_nakwon_60 s ON a.title=s.title AND a.artist=s.artist AND a.format=s.format',
      'SET a.image_url=COALESCE(s.image_url,a.image_url), a.hidden=0;',
      'INSERT INTO album_recommendations (album_id,enabled,reason)',
      "SELECT a.id, IF(s.recommended=1 AND a.stock>0,1,0), IF(s.recommended=1 AND a.stock>0,'처음 듣기 좋은 음반으로 골랐어요.','')",
      'FROM albums a JOIN tmp_nakwon_60 s ON a.title=s.title AND a.artist=s.artist AND a.format=s.format',
      'LEFT JOIN album_recommendations r ON r.album_id=a.id WHERE r.album_id IS NULL;',
      'UPDATE albums a LEFT JOIN tmp_nakwon_60 s ON a.title=s.title AND a.artist=s.artist AND a.format=s.format',
      'SET a.hidden=1 WHERE s.seq IS NULL AND a.hidden=0;',
      'COMMIT;',
      '-- Verify the public catalog.',
      "SELECT genre, SUM(format='LP') AS LP, SUM(format='CD') AS CD, COUNT(*) AS total FROM albums WHERE hidden=0 GROUP BY genre ORDER BY genre;",
      'SELECT hidden, COUNT(*) AS total FROM albums GROUP BY hidden ORDER BY hidden;',
      'DROP TEMPORARY TABLE tmp_nakwon_60;']
    return '\n'.join(out)+'\n'

def main():
    p=argparse.ArgumentParser(); p.add_argument('--project',default=str(ROOT)); p.add_argument('--sql-only',action='store_true',help='Generate SQL from cached verified covers without network'); args=p.parse_args()
    project=Path(args.project).resolve()
    if not (project/'frontend'/'public').is_dir() or not (project/'database').is_dir():
        raise SystemExit('Run in project root or use --project C:\\middle')
    rows=json.loads((ROOT/'albums60.json').read_text(encoding='utf-8'))
    if len(rows)!=60 or len({(d['title'],d['artist'],d['format']) for d in rows})!=60 or sorted(collections.Counter((d['genre'],d['format']) for d in rows).values())!=[5]*12:
        raise SystemExit('Invalid catalog: expected 60 distinct products, 5 per genre/format.')
    folder=project/'frontend'/'public'/'images'/'albums'; folder.mkdir(parents=True,exist_ok=True)
    cache=project/'database'/'musicbrainz_60_sources.json'
    results=json.loads(cache.read_text(encoding='utf-8')) if cache.exists() else {}
    output=project/'database'/'05_albums_60_local.sql'
    failures=[]
    for d in rows:
        key=str(d['seq']); filename=f'mb60_{d["seq"]:02d}.webp'; dest=folder/filename
        signature=[d['title'],d['artist'],d['format']]
        local_url='/images/albums/'+filename
        d['image_url']=None
        print(f'[{key}/60] {d["artist"]} - {d["title"]} ({d["format"]})',flush=True)
        try:
            if results.get(key,{}).get('signature')==signature and dest.exists():
                try:
                    with Image.open(dest) as im: im.verify()
                    d['image_url']=local_url
                    continue
                except (OSError, ValueError):
                    pass
            if args.sql_only:
                failures.append((d['title'],'No verified cached cover'))
                continue
            im,meta=resolve(d)
            tmp=dest.with_suffix('.tmp'); im.save(tmp,format='WEBP',quality=84,method=4); tmp.replace(dest)
            results[key]={'signature':signature,**meta,'image_url':local_url}
            d['image_url']=local_url
            cache.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
        except Exception as e:
            failures.append((d['title'],str(e))); print('FAILED:',e,flush=True)
    local_count = sum(d['image_url'] is not None for d in rows)
    # A network failure must not produce a broken local filename.
    # The known cover can temporarily use the verified remote source.
    for d in rows:
        if d['image_url'] is None and d.get('cover_release_id'):
            d['image_url'] = CAA + 'release/' + d['cover_release_id'] + '/front-500'
    output.write_text(make_sql(rows),encoding='utf-8')
    print('\nSQL GENERATED:',output,flush=True)
    print(f'Local covers: {local_count}/60',flush=True)
    if failures:
        print('Missing covers:',json.dumps(failures,ensure_ascii=False,indent=2))
        print('In a Time Lapse uses its remote cover temporarily if local download failed. Other missing covers keep existing DB images or NULL. Rerun without --sql-only to retry downloads.',flush=True)

if __name__=='__main__': main()
