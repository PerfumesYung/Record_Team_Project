-- 60 albums: 5 LP + 5 CD per genre. Existing matched rows keep IDs, prices and stock.
-- Existing images are preserved if no verified local cover is available. No DELETE.
USE nakwon_records;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
DROP TEMPORARY TABLE IF EXISTS tmp_nakwon_60;
CREATE TEMPORARY TABLE tmp_nakwon_60 (seq INT PRIMARY KEY, title VARCHAR(120) NOT NULL, artist VARCHAR(100) NOT NULL, price INT UNSIGNED NOT NULL, genre VARCHAR(50) NOT NULL, format VARCHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, image_url VARCHAR(2048) NULL, stock INT UNSIGNED NOT NULL, recommended TINYINT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO tmp_nakwon_60 (seq,title,artist,price,genre,format,image_url,stock,recommended) VALUES
(1, 'Kind of Blue', 'Miles Davis', 32000, 'Jazz', 'LP', '/images/albums/mb60_01.webp', 10, 1),
(2, 'Waltz for Debby', 'Bill Evans Trio', 19000, 'Jazz', 'CD', '/images/albums/mb60_02.webp', 2, 0),
(3, 'Blue Train', 'John Coltrane', 35000, 'Jazz', 'LP', '/images/albums/mb60_03.webp', 0, 0),
(4, 'Thriller', 'Michael Jackson', 29000, 'Pop', 'LP', '/images/albums/mb60_04.webp', 12, 1),
(5, '21', 'Adele', 17000, 'Pop', 'CD', '/images/albums/mb60_05.webp', 1, 0),
(6, '1989', 'Taylor Swift', 18000, 'Pop', 'CD', '/images/albums/mb60_06.webp', 0, 0),
(7, 'The Dark Side of the Moon', 'Pink Floyd', 34000, 'Rock', 'LP', '/images/albums/mb60_07.webp', 8, 1),
(8, 'Nevermind', 'Nirvana', 18500, 'Rock', 'CD', '/images/albums/mb60_08.webp', 2, 0),
(9, 'Led Zeppelin IV', 'Led Zeppelin', 31000, 'Rock', 'LP', '/images/albums/mb60_09.webp', 0, 0),
(10, 'Whatever People Say I Am, That’s What I’m Not', 'Arctic Monkeys', 30000, 'Indie', 'LP', '/images/albums/mb60_10.webp', 9, 1),
(11, 'Is This It', 'The Strokes', 16500, 'Indie', 'CD', '/images/albums/mb60_11.webp', 1, 0),
(12, 'In Rainbows', 'Radiohead', 28000, 'Indie', 'LP', '/images/albums/mb60_12.webp', 4, 0),
(13, 'Voodoo', 'D’Angelo', 33000, 'R&B', 'LP', '/images/albums/mb60_13.webp', 7, 1),
(14, 'The Miseducation of Lauryn Hill', 'Lauryn Hill', 17500, 'R&B', 'CD', '/images/albums/mb60_14.webp', 2, 0),
(15, 'Songs in the Key of Life', 'Stevie Wonder', 29500, 'R&B', 'LP', '/images/albums/mb60_15.webp', 0, 0),
(16, 'Symphonien nos. 5 & 7', 'Beethoven; Wiener Philharmoniker, Carlos Kleiber', 27000, 'Classical', 'CD', '/images/albums/mb60_16.webp', 11, 1),
(17, 'Variations Goldberg', 'Bach; Glenn Gould', 36000, 'Classical', 'LP', '/images/albums/mb60_17.webp', 1, 0),
(18, 'The Cello Suites: Inspired by Bach', 'Yo-Yo Ma', 20000, 'Classical', 'CD', '/images/albums/mb60_18.webp', 5, 0),
(19, 'A Love Supreme', 'John Coltrane', 29000, 'Jazz', 'LP', '/images/albums/mb60_19.webp', 5, 0),
(20, 'Time Out', 'The Dave Brubeck Quartet', 31000, 'Jazz', 'LP', '/images/albums/mb60_20.webp', 6, 0),
(21, 'Mingus Ah Um', 'Charles Mingus', 33000, 'Jazz', 'LP', '/images/albums/mb60_21.webp', 7, 0),
(22, 'Head Hunters', 'Herbie Hancock', 16000, 'Jazz', 'CD', '/images/albums/mb60_22.webp', 5, 0),
(23, 'Speak No Evil', 'Wayne Shorter', 17500, 'Jazz', 'CD', '/images/albums/mb60_23.webp', 6, 0),
(24, 'The Sidewinder', 'Lee Morgan', 19000, 'Jazz', 'CD', '/images/albums/mb60_24.webp', 7, 0),
(25, 'Saxophone Colossus', 'Sonny Rollins', 20500, 'Jazz', 'CD', '/images/albums/mb60_25.webp', 8, 0),
(26, 'Bad', 'Michael Jackson', 29000, 'Pop', 'LP', '/images/albums/mb60_26.webp', 5, 0),
(27, 'Like a Prayer', 'Madonna', 31000, 'Pop', 'LP', '/images/albums/mb60_27.webp', 6, 0),
(28, 'The Fame', 'Lady Gaga', 33000, 'Pop', 'LP', '/images/albums/mb60_28.webp', 7, 0),
(29, 'Future Nostalgia', 'Dua Lipa', 35000, 'Pop', 'LP', '/images/albums/mb60_29.webp', 8, 0),
(30, '25', 'Adele', 16000, 'Pop', 'CD', '/images/albums/mb60_30.webp', 5, 0),
(31, 'Teenage Dream', 'Katy Perry', 17500, 'Pop', 'CD', '/images/albums/mb60_31.webp', 6, 0),
(32, 'Back to Black', 'Amy Winehouse', 19000, 'Pop', 'CD', '/images/albums/mb60_32.webp', 7, 0),
(33, 'Abbey Road', 'The Beatles', 29000, 'Rock', 'LP', '/images/albums/mb60_33.webp', 5, 0),
(34, 'Wish You Were Here', 'Pink Floyd', 31000, 'Rock', 'LP', '/images/albums/mb60_34.webp', 6, 0),
(35, 'A Night at the Opera', 'Queen', 33000, 'Rock', 'LP', '/images/albums/mb60_35.webp', 7, 0),
(36, 'Ten', 'Pearl Jam', 16000, 'Rock', 'CD', '/images/albums/mb60_36.webp', 5, 0),
(37, 'OK Computer', 'Radiohead', 17500, 'Rock', 'CD', '/images/albums/mb60_37.webp', 6, 0),
(38, 'American Idiot', 'Green Day', 19000, 'Rock', 'CD', '/images/albums/mb60_38.webp', 7, 0),
(39, 'The Colour and the Shape', 'Foo Fighters', 20500, 'Rock', 'CD', '/images/albums/mb60_39.webp', 8, 0),
(40, 'AM', 'Arctic Monkeys', 29000, 'Indie', 'LP', '/images/albums/mb60_40.webp', 5, 0),
(41, 'Funeral', 'Arcade Fire', 31000, 'Indie', 'LP', '/images/albums/mb60_41.webp', 6, 0),
(42, 'For Emma, Forever Ago', 'Bon Iver', 33000, 'Indie', 'LP', '/images/albums/mb60_42.webp', 7, 0),
(43, 'Turn On the Bright Lights', 'Interpol', 16000, 'Indie', 'CD', '/images/albums/mb60_43.webp', 5, 0),
(44, 'Plans', 'Death Cab for Cutie', 17500, 'Indie', 'CD', '/images/albums/mb60_44.webp', 6, 0),
(45, 'The Suburbs', 'Arcade Fire', 19000, 'Indie', 'CD', '/images/albums/mb60_45.webp', 7, 0),
(46, 'Lonerism', 'Tame Impala', 20500, 'Indie', 'CD', '/images/albums/mb60_46.webp', 8, 0),
(47, 'What’s Going On', 'Marvin Gaye', 29000, 'R&B', 'LP', '/images/albums/mb60_47.webp', 5, 0),
(48, 'Innervisions', 'Stevie Wonder', 31000, 'R&B', 'LP', '/images/albums/mb60_48.webp', 6, 0),
(49, 'Baduizm', 'Erykah Badu', 33000, 'R&B', 'LP', '/images/albums/mb60_49.webp', 7, 0),
(50, 'Brown Sugar', 'D’Angelo', 16000, 'R&B', 'CD', '/images/albums/mb60_50.webp', 5, 0),
(51, 'Confessions', 'Usher', 17500, 'R&B', 'CD', '/images/albums/mb60_51.webp', 6, 0),
(52, 'The Diary of Alicia Keys', 'Alicia Keys', 19000, 'R&B', 'CD', '/images/albums/mb60_52.webp', 7, 0),
(53, '4', 'Beyoncé', 20500, 'R&B', 'CD', '/images/albums/mb60_53.webp', 8, 0),
(54, 'Glassworks', 'Philip Glass', 29000, 'Classical', 'LP', '/images/albums/mb60_54.webp', 5, 0),
(55, 'The Blue Notebooks', 'Max Richter', 31000, 'Classical', 'LP', '/images/albums/mb60_55.webp', 6, 0),
(56, 'In a Time Lapse', 'Ludovico Einaudi', 33000, 'Classical', 'LP', NULL, 7, 0),
(57, 're:member', 'Ólafur Arnalds', 35000, 'Classical', 'LP', '/images/albums/mb60_57.webp', 8, 0),
(58, 'Sleep', 'Max Richter', 16000, 'Classical', 'CD', '/images/albums/mb60_58.webp', 5, 0),
(59, 'Divenire', 'Ludovico Einaudi', 17500, 'Classical', 'CD', '/images/albums/mb60_59.webp', 6, 0),
(60, 'Orphée', 'Jóhann Jóhannsson', 19000, 'Classical', 'CD', '/images/albums/mb60_60.webp', 7, 0);
START TRANSACTION;
INSERT INTO albums (title,artist,price,genre,format,image_url,stock,hidden)
SELECT s.title,s.artist,s.price,s.genre,s.format,s.image_url,s.stock,0 FROM tmp_nakwon_60 s
WHERE NOT EXISTS (SELECT 1 FROM albums a WHERE a.title=s.title AND a.artist=s.artist AND a.format=s.format) ORDER BY s.seq;
UPDATE albums a JOIN tmp_nakwon_60 s ON a.title=s.title AND a.artist=s.artist AND a.format=s.format
SET a.image_url=COALESCE(s.image_url,a.image_url), a.hidden=0;
INSERT INTO album_recommendations (album_id,enabled,reason)
SELECT a.id, IF(s.recommended=1 AND a.stock>0,1,0), IF(s.recommended=1 AND a.stock>0,'처음 듣기 좋은 음반으로 골랐어요.','')
FROM albums a JOIN tmp_nakwon_60 s ON a.title=s.title AND a.artist=s.artist AND a.format=s.format
LEFT JOIN album_recommendations r ON r.album_id=a.id WHERE r.album_id IS NULL;
COMMIT;
-- Verify the complete public catalog, including any pre-existing extra products.
SELECT genre, SUM(format='LP') AS LP, SUM(format='CD') AS CD, COUNT(*) AS total FROM albums WHERE hidden=0 GROUP BY genre ORDER BY genre;
DROP TEMPORARY TABLE tmp_nakwon_60;
