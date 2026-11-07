-- 낙원레코드 음반 목업 18개 (가상의 제목과 아티스트)
-- 01_테이블_생성.sql 실행 후, 비어 있는 albums 테이블에 한 번만 실행하세요.
-- 다시 실행하면 같은 음반이 추가됩니다. 다른 데이터가 있는 DB에는 실행하지 마세요.
USE nakwon_records;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

START TRANSACTION;

-- image_url이 NULL이면 프론트가 공통 대체 표지를 보여줍니다.
INSERT INTO albums (title, artist, price, genre, format, image_url, stock, hidden) VALUES
('Blue Window', 'Morrow Quartet', 32000, 'Jazz', 'LP', NULL, 10, 0),
('After the Rain', 'Yuna Park Trio', 19000, 'Jazz', 'CD', NULL, 2, 0),
('Quiet Corner', 'Low Tide Jazz', 35000, 'Jazz', 'LP', NULL, 0, 0),
('Summer Letters', 'The Daylights', 29000, 'Pop', 'LP', NULL, 12, 0),
('Bright Side', 'Nari Moon', 17000, 'Pop', 'CD', NULL, 1, 0),
('Orange Avenue', 'Paper Planet', 18000, 'Pop', 'CD', NULL, 0, 0),
('Midnight Signal', 'Northbound', 34000, 'Rock', 'LP', NULL, 8, 0),
('Echoes on Tape', 'Velvet Street', 18500, 'Rock', 'CD', NULL, 2, 0),
('Slow Thunder', 'The Unnamed Road', 31000, 'Rock', 'LP', NULL, 0, 0),
('Little Rooms', 'Seoul Pillow', 30000, 'Indie', 'LP', NULL, 9, 0),
('Days in Between', 'Hana and the Trees', 16500, 'Indie', 'CD', NULL, 1, 0),
('Small Hours', 'River Apartment', 28000, 'Indie', 'LP', NULL, 4, 1),
('Night Transit', 'Mina Gray', 33000, 'R&B', 'LP', NULL, 7, 0),
('Soft Focus', 'Dawn Lee', 17500, 'R&B', 'CD', NULL, 2, 0),
('Between Stations', 'June Satellite', 29500, 'R&B', 'LP', NULL, 0, 0),
('Morning Chamber', 'Haneul Ensemble', 27000, 'Classical', 'CD', NULL, 11, 0),
('A Quiet Waltz', 'Namu Players', 36000, 'Classical', 'LP', NULL, 1, 0),
('Winter Notes', 'Sori Chamber', 20000, 'Classical', 'CD', NULL, 5, 1);

-- 새 음반마다 추천 설정 1개를 생성합니다. 공개·재고가 있는 음반 중 일부를 추천합니다.
INSERT INTO album_recommendations (album_id, enabled, reason)
SELECT id,
       CASE WHEN hidden = 0 AND stock > 0 AND title IN
         ('Blue Window', 'Summer Letters', 'Midnight Signal', 'Little Rooms', 'Night Transit', 'Morning Chamber')
         THEN 1 ELSE 0 END,
       CASE WHEN hidden = 0 AND stock > 0 AND title IN
         ('Blue Window', 'Summer Letters', 'Midnight Signal', 'Little Rooms', 'Night Transit', 'Morning Chamber')
         THEN '처음 듣기 좋은 음반으로 골랐어요.' ELSE '' END
FROM albums;

COMMIT;

-- 장르, 재고 및 공개 상태를 확인합니다.
SELECT genre, format, title, stock, hidden FROM albums ORDER BY genre, id;
