ALTER TABLE `Product`
    ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Other';

CREATE INDEX `Product_category_idx` ON `Product`(`category`);
