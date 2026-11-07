-- 낙원레코드 DB 설계 기준안 v0.1 / 2026-11-05
-- MySQL 8.0.16+ 전용. 새 데이터베이스 초기 생성용입니다.
-- 기존 테이블의 구조를 변경하는 마이그레이션이 아닙니다.
-- 실제 MySQL 서버에는 실행하지 않았습니다.
CREATE DATABASE IF NOT EXISTS nakwon_records
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE nakwon_records;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET SESSION time_zone = '+00:00';

CREATE TABLE users (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `email` VARCHAR(254) NOT NULL COMMENT '로그인 이메일',
  `username` VARCHAR(50) NOT NULL COMMENT '화면에 표시할 이름',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '비밀번호 해시',
  `role` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'MEMBER' COMMENT '회원 권한',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  CONSTRAINT ck_users_email CHECK (CHAR_LENGTH(TRIM(email)) >= 1),
  CONSTRAINT ck_users_username CHECK (CHAR_LENGTH(TRIM(username)) >= 2),
  CONSTRAINT ck_users_password_hash CHECK (CHAR_LENGTH(password_hash) >= 1),
  CONSTRAINT ck_users_role CHECK (role IN ('MEMBER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='회원';

CREATE TABLE albums (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `title` VARCHAR(120) NOT NULL COMMENT '음반명',
  `artist` VARCHAR(100) NOT NULL COMMENT '아티스트명',
  `price` INT UNSIGNED NOT NULL COMMENT '현재 판매 단가 · 원',
  `genre` VARCHAR(50) NOT NULL COMMENT '장르명',
  `format` VARCHAR(2) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '매체 종류',
  `image_url` VARCHAR(2048) NULL DEFAULT NULL COMMENT '표지 이미지 경로 또는 URL',
  `stock` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '현재 주문 가능한 수량',
  `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '음반 비공개 여부',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (id),
  KEY idx_albums_public_format_genre (hidden, format, genre, id),
  CONSTRAINT ck_albums_title CHECK (CHAR_LENGTH(TRIM(title)) >= 1),
  CONSTRAINT ck_albums_artist CHECK (CHAR_LENGTH(TRIM(artist)) >= 1),
  CONSTRAINT ck_albums_genre CHECK (CHAR_LENGTH(TRIM(genre)) >= 1),
  CONSTRAINT ck_albums_format CHECK (format IN ('LP', 'CD')),
  CONSTRAINT ck_albums_hidden CHECK (hidden IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='음반';

CREATE TABLE cart_items (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '장바구니 소유 회원',
  `album_id` BIGINT UNSIGNED NOT NULL COMMENT '담긴 음반',
  `quantity` INT UNSIGNED NOT NULL COMMENT '담긴 수량',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (id),
  UNIQUE KEY uk_cart_user_album (user_id, album_id),
  KEY idx_cart_album (album_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_cart_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_cart_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='장바구니 항목';

CREATE TABLE orders (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '주문한 회원',
  `status` VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'RECEIVED' COMMENT '주문 진행 상태',
  `total_amount` BIGINT UNSIGNED NOT NULL COMMENT '주문 시점 총액 · 원',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (id),
  KEY idx_orders_user_created (user_id, created_at, id),
  KEY idx_orders_status_created (status, created_at, id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_orders_status CHECK (status IN ('RECEIVED', 'PROCESSING', 'COMPLETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='주문';

CREATE TABLE order_items (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '소속 주문',
  `album_id` BIGINT UNSIGNED NOT NULL COMMENT '주문한 음반',
  `title` VARCHAR(120) NOT NULL COMMENT '주문 당시 음반명 복사본',
  `unit_price` INT UNSIGNED NOT NULL COMMENT '주문 당시 단가 · 원',
  `quantity` INT UNSIGNED NOT NULL COMMENT '주문한 수량',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_item_album (order_id, album_id),
  KEY idx_order_items_album (album_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_order_items_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_order_items_title CHECK (CHAR_LENGTH(TRIM(title)) >= 1),
  CONSTRAINT ck_order_items_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='주문항목';

CREATE TABLE reviews (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '리뷰 작성자',
  `album_id` BIGINT UNSIGNED NOT NULL COMMENT '리뷰 대상 음반',
  `rating` TINYINT UNSIGNED NOT NULL COMMENT '평점',
  `content` VARCHAR(1000) NOT NULL COMMENT '리뷰 내용',
  `hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '관리자 숨김 여부',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (id),
  UNIQUE KEY uk_reviews_user_album (user_id, album_id),
  KEY idx_reviews_album_public_created (album_id, hidden, created_at, id),
  KEY idx_reviews_user (user_id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_reviews_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT ck_reviews_content CHECK (CHAR_LENGTH(TRIM(content)) >= 1),
  CONSTRAINT ck_reviews_hidden CHECK (hidden IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='리뷰';

CREATE TABLE wishlists (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '고유 번호',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '찜한 회원',
  `album_id` BIGINT UNSIGNED NOT NULL COMMENT '찜한 음반',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  PRIMARY KEY (id),
  UNIQUE KEY uk_wish_user_album (user_id, album_id),
  KEY idx_wish_album (album_id),
  CONSTRAINT fk_wish_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_wish_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='찜';

CREATE TABLE album_recommendations (
  `album_id` BIGINT UNSIGNED NOT NULL COMMENT '설정 대상 음반 번호',
  `enabled` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '추천 후보 사용 여부',
  `reason` VARCHAR(160) NOT NULL DEFAULT '' COMMENT '관리자가 입력한 추천 이유',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성일시 · UTC',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정일시 · UTC',
  PRIMARY KEY (album_id),
  CONSTRAINT fk_rec_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_rec_enabled CHECK (enabled IN (0, 1)),
  CONSTRAINT ck_rec_reason CHECK (enabled = 0 OR CHAR_LENGTH(TRIM(reason)) >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='관리자 추천설정';
