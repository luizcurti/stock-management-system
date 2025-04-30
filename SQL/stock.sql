CREATE DATABASE stock;

USE stock;

CREATE TABLE `IN_STOCK` (
  `id` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `qtd` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `RESERVED` (
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `SOLD` (
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


