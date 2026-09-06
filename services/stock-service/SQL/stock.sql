-- Stock Management System Database Schema
-- Version: 2.0
-- Date: 2024

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS stock
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE stock;

-- Drop tables if they exist (for development purposes)
DROP TABLE IF EXISTS SOLD;
DROP TABLE IF EXISTS RESERVED;
DROP TABLE IF EXISTS IN_STOCK;

-- Create IN_STOCK table
CREATE TABLE `IN_STOCK` (
  `id` int NOT NULL PRIMARY KEY,
  `product` varchar(100) NOT NULL,
  `qtd` int NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product` (`product`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create RESERVED table
CREATE TABLE `RESERVED` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)),
  INDEX `idx_id_stock` (`id_stock`),
  INDEX `idx_reservation_token` (`reservationToken`),
  INDEX `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`id_stock`) REFERENCES `IN_STOCK`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create SOLD table
CREATE TABLE `SOLD` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL,
  `sold_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_sold_reservation_token` (`reservationToken`),
  INDEX `idx_id_stock` (`id_stock`),
  INDEX `idx_reservation_token` (`reservationToken`),
  INDEX `idx_sold_at` (`sold_at`),
  FOREIGN KEY (`id_stock`) REFERENCES `IN_STOCK`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data for testing (optional)
INSERT INTO `IN_STOCK` (`id`, `product`, `qtd`) VALUES
(1, 'Soccer Ball', 50),
(2, 'Basketball', 30),
(3, 'Tennis Ball', 100),
(4, 'Baseball', 25),
(5, 'Volleyball', 15);

-- Create a view for stock summary
CREATE OR REPLACE VIEW stock_summary AS
SELECT 
    s.id,
    s.product,
    s.qtd as available_stock,
    COALESCE(r.reserved_count, 0) as reserved_count,
    COALESCE(sold.sold_count, 0) as sold_count,
    (s.qtd + COALESCE(r.reserved_count, 0) + COALESCE(sold.sold_count, 0)) as total_initial_stock
FROM IN_STOCK s
LEFT JOIN (
    SELECT id_stock, COUNT(*) as reserved_count 
    FROM RESERVED 
    WHERE expires_at > NOW()
    GROUP BY id_stock
) r ON s.id = r.id_stock
LEFT JOIN (
    SELECT id_stock, COUNT(*) as sold_count 
    FROM SOLD 
    GROUP BY id_stock
) sold ON s.id = sold.id_stock;

-- Create a procedure to clean expired reservations
DELIMITER //
CREATE PROCEDURE CleanExpiredReservations()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Return expired reservations to stock
    UPDATE IN_STOCK s
    JOIN (
        SELECT id_stock, COUNT(*) as expired_count
        FROM RESERVED 
        WHERE expires_at <= NOW()
        GROUP BY id_stock
    ) expired ON s.id = expired.id_stock
    SET s.qtd = s.qtd + expired.expired_count;
    
    -- Delete expired reservations
    DELETE FROM RESERVED WHERE expires_at <= NOW();
    
    COMMIT;
END //
DELIMITER ;

-- Create an event to automatically clean expired reservations every hour
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS clean_expired_reservations
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanExpiredReservations();


