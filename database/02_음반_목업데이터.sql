-- 신규 DB 초기화용: 기존 02_음반_목업데이터.sql 대신 실행하세요.
-- 낙원레코드 실존 음반 목업 18개 / MusicBrainz + Cover Art Archive
-- MySQL 8.0.16+ / 01_테이블_생성.sql 기반
-- 가격, 재고, 공개 상태 및 추천 배치는 기존 테스트용 값을 유지합니다.
-- 장르는 기존 사이트의 분류이며 MusicBrainz 장르를 그대로 복사한 것은 아닙니다.
-- image_url은 500px 앞면 표지 API 주소입니다. 외부 서버의 응답에 의존합니다.
-- 원본 MusicBrainz 링크는 각 INSERT 행의 주석에 기록합니다.
USE nakwon_records;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET SESSION time_zone = '+00:00';

DROP TEMPORARY TABLE IF EXISTS tmp_nakwon_real_seed;
CREATE TEMPORARY TABLE tmp_nakwon_real_seed (
  seq INT PRIMARY KEY,
  old_title VARCHAR(120) NOT NULL,
  old_artist VARCHAR(100) NOT NULL,
  title VARCHAR(120) NOT NULL,
  artist VARCHAR(100) NOT NULL,
  price INT UNSIGNED NOT NULL,
  genre VARCHAR(50) NOT NULL,
  format VARCHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  image_url VARCHAR(2048) NOT NULL,
  stock INT UNSIGNED NOT NULL,
  hidden TINYINT UNSIGNED NOT NULL,
  recommended TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO tmp_nakwon_real_seed
(seq, old_title, old_artist, title, artist, price, genre, format, image_url, stock, hidden, recommended) VALUES
-- https://musicbrainz.org/release/375526b3-aa4a-4cf5-9078-e3688a229dd4
(1, 'Blue Window', 'Morrow Quartet', 'Kind of Blue', 'Miles Davis', 32000, 'Jazz', 'LP', 'https://coverartarchive.org/release/375526b3-aa4a-4cf5-9078-e3688a229dd4/front-500', 10, 0, 1),
-- https://musicbrainz.org/release-group/392e7fcf-5ae9-37f6-b8c9-57901cfbee1f
(2, 'After the Rain', 'Yuna Park Trio', 'Waltz for Debby', 'Bill Evans Trio', 19000, 'Jazz', 'CD', 'https://coverartarchive.org/release-group/392e7fcf-5ae9-37f6-b8c9-57901cfbee1f/front-500', 2, 0, 0),
-- https://musicbrainz.org/release/4ca248f9-8f10-462b-a3bd-6ff48f25f151
(3, 'Quiet Corner', 'Low Tide Jazz', 'Blue Train', 'John Coltrane', 35000, 'Jazz', 'LP', 'https://coverartarchive.org/release/4ca248f9-8f10-462b-a3bd-6ff48f25f151/front-500', 0, 0, 0),
-- https://musicbrainz.org/release-group/f32fab67-77dd-3937-addc-9062e28e4c37
(4, 'Summer Letters', 'The Daylights', 'Thriller', 'Michael Jackson', 29000, 'Pop', 'LP', 'https://coverartarchive.org/release-group/f32fab67-77dd-3937-addc-9062e28e4c37/front-500', 12, 0, 1),
-- https://musicbrainz.org/release-group/e4174758-d333-4a8e-a31f-dd0edd51518e
(5, 'Bright Side', 'Nari Moon', '21', 'Adele', 17000, 'Pop', 'CD', 'https://coverartarchive.org/release-group/e4174758-d333-4a8e-a31f-dd0edd51518e/front-500', 1, 0, 0),
-- https://musicbrainz.org/release/9f6d3b39-9dfb-4961-b70d-fcf61da18e7b
(6, 'Orange Avenue', 'Paper Planet', '1989', 'Taylor Swift', 18000, 'Pop', 'CD', 'https://coverartarchive.org/release/9f6d3b39-9dfb-4961-b70d-fcf61da18e7b/front-500', 0, 0, 0),
-- https://musicbrainz.org/release/b84ee12a-09ef-421b-82de-0441a926375b
(7, 'Midnight Signal', 'Northbound', 'The Dark Side of the Moon', 'Pink Floyd', 34000, 'Rock', 'LP', 'https://coverartarchive.org/release/b84ee12a-09ef-421b-82de-0441a926375b/front-500', 8, 0, 1),
-- https://musicbrainz.org/release/8e061dc4-790e-4587-ba53-011e7852f88d
(8, 'Echoes on Tape', 'Velvet Street', 'Nevermind', 'Nirvana', 18500, 'Rock', 'CD', 'https://coverartarchive.org/release/8e061dc4-790e-4587-ba53-011e7852f88d/front-500', 2, 0, 0),
-- https://musicbrainz.org/release/a1f2ad19-3e0f-4e74-a949-a5f04968cdfe
(9, 'Slow Thunder', 'The Unnamed Road', 'Led Zeppelin IV', 'Led Zeppelin', 31000, 'Rock', 'LP', 'https://coverartarchive.org/release/a1f2ad19-3e0f-4e74-a949-a5f04968cdfe/front-500', 0, 0, 0),
-- https://musicbrainz.org/release/37f0c94a-12bc-4371-bb35-790003c32a75
(10, 'Little Rooms', 'Seoul Pillow', 'Whatever People Say I Am, That’s What I’m Not', 'Arctic Monkeys', 30000, 'Indie', 'LP', 'https://coverartarchive.org/release/37f0c94a-12bc-4371-bb35-790003c32a75/front-500', 9, 0, 1),
-- https://musicbrainz.org/release/9920c28f-e1a6-36a5-9fb4-31fde24b2c43
(11, 'Days in Between', 'Hana and the Trees', 'Is This It', 'The Strokes', 16500, 'Indie', 'CD', 'https://coverartarchive.org/release/9920c28f-e1a6-36a5-9fb4-31fde24b2c43/front-500', 1, 0, 0),
-- https://musicbrainz.org/release/a58f4eb2-9829-37d5-b46c-e8163038e0f5
(12, 'Small Hours', 'River Apartment', 'In Rainbows', 'Radiohead', 28000, 'Indie', 'LP', 'https://coverartarchive.org/release/a58f4eb2-9829-37d5-b46c-e8163038e0f5/front-500', 4, 1, 0),
-- https://musicbrainz.org/release/6dffd7a8-e42c-45db-a0b1-faf47a9eb638
(13, 'Night Transit', 'Mina Gray', 'Voodoo', 'D’Angelo', 33000, 'R&B', 'LP', 'https://coverartarchive.org/release/6dffd7a8-e42c-45db-a0b1-faf47a9eb638/front-500', 7, 0, 1),
-- https://musicbrainz.org/release/952d8e63-8afd-4049-a746-7f50aaeaa3e2
(14, 'Soft Focus', 'Dawn Lee', 'The Miseducation of Lauryn Hill', 'Lauryn Hill', 17500, 'R&B', 'CD', 'https://coverartarchive.org/release/952d8e63-8afd-4049-a746-7f50aaeaa3e2/front-500', 2, 0, 0),
-- https://musicbrainz.org/release/cdbc768e-1962-4c31-a847-a26fa74e089e
(15, 'Between Stations', 'June Satellite', 'Songs in the Key of Life', 'Stevie Wonder', 29500, 'R&B', 'LP', 'https://coverartarchive.org/release/cdbc768e-1962-4c31-a847-a26fa74e089e/front-500', 0, 0, 0),
-- https://musicbrainz.org/release/e1bb14ae-cb3d-4582-b4be-7ed1f558a0cb
(16, 'Morning Chamber', 'Haneul Ensemble', 'Symphonien nos. 5 & 7', 'Beethoven; Wiener Philharmoniker, Carlos Kleiber', 27000, 'Classical', 'CD', 'https://coverartarchive.org/release/e1bb14ae-cb3d-4582-b4be-7ed1f558a0cb/front-500', 11, 0, 1),
-- https://musicbrainz.org/release/15da7592-9359-4da6-9f7a-38f09718c97d
(17, 'A Quiet Waltz', 'Namu Players', 'Variations Goldberg', 'Bach; Glenn Gould', 36000, 'Classical', 'LP', 'https://coverartarchive.org/release/15da7592-9359-4da6-9f7a-38f09718c97d/front-500', 1, 0, 0),
-- https://musicbrainz.org/release/9480dfa9-08dd-4278-9a6e-4682b934c887
(18, 'Winter Notes', 'Sori Chamber', 'The Cello Suites: Inspired by Bach', 'Yo-Yo Ma', 20000, 'Classical', 'CD', 'https://coverartarchive.org/release/9480dfa9-08dd-4278-9a6e-4682b934c887/front-500', 5, 1, 0);

START TRANSACTION;

-- 새 음반 추가: 이미 같은 음반명/아티스트/매체의 상품이 있으면 건너뜁니다.
-- 재실행해도 기존 상품의 재고, 가격, 공개 상태를 덮어쓰지 않습니다.
INSERT INTO albums (title, artist, price, genre, format, image_url, stock, hidden)
SELECT s.title, s.artist, s.price, s.genre, s.format, s.image_url, s.stock, s.hidden
FROM tmp_nakwon_real_seed s
WHERE NOT EXISTS (
  SELECT 1 FROM albums a
  WHERE a.title = s.title AND a.artist = s.artist AND a.format = s.format
)
ORDER BY s.seq;

-- 각 실존 음반의 추천 설정이 없을 때만 생성합니다.
INSERT INTO album_recommendations (album_id, enabled, reason)
SELECT a.id,
       CASE WHEN s.recommended = 1 AND a.hidden = 0 AND a.stock > 0 THEN 1 ELSE 0 END,
       CASE WHEN s.recommended = 1 AND a.hidden = 0 AND a.stock > 0
            THEN '처음 듣기 좋은 음반으로 골랐어요.' ELSE '' END
FROM albums a
JOIN tmp_nakwon_real_seed s ON a.title = s.title AND a.artist = s.artist AND a.format = s.format
LEFT JOIN album_recommendations r ON r.album_id = a.id
WHERE r.album_id IS NULL;

COMMIT;

-- 실존 음반 18개와 공개 상태 확인
SELECT a.id, a.title, a.artist, a.genre, a.format, a.price, a.stock, a.hidden, a.image_url
FROM albums a
JOIN tmp_nakwon_real_seed s ON a.title = s.title AND a.artist = s.artist AND a.format = s.format
ORDER BY s.seq;
DROP TEMPORARY TABLE IF EXISTS tmp_nakwon_real_seed;
