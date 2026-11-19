UPDATE `Order`
SET `deliveryDate` = DATE_ADD(`createdAt`, INTERVAL 15 DAY)
WHERE `status` IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
  AND `deliveryDate` IS NULL;
