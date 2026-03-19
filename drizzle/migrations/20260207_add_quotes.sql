-- Safe creation of supplier_packages and quotes tables for quotation system.
-- Uses IF NOT EXISTS and defaults to avoid breaking existing deployments.

CREATE TABLE IF NOT EXISTS `supplier_packages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `category` varchar(255) NOT NULL,
  `supplierName` varchar(255) NOT NULL,
  `packageName` varchar(255) NOT NULL,
  `clientRate` decimal(12,2) DEFAULT 0,
  `deposit` decimal(12,2) NOT NULL DEFAULT 0,
  `commission` decimal(12,2) NOT NULL DEFAULT 0,
  `notes` text,
  INDEX `supplier_packages_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `quotes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `status` ENUM('draft','submitted','revising','agreed') NOT NULL DEFAULT 'draft',
  `items` JSON NOT NULL DEFAULT (json_array()),
  `plannerNotes` text,
  `totalClient` decimal(14,2) NOT NULL DEFAULT 0,
  `commissionTotal` decimal(14,2) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `quotes_user_idx` (`userId`),
  INDEX `quotes_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
