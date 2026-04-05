-- ================================================================
-- HOTELIER — Facilities Seed Data (MySQL 5.7 Compatible)
-- Database : 4748018_hotelier
-- ================================================================
-- Facilities table columns:
--   facilID    INT  AUTO_INCREMENT PRIMARY KEY  (DB assigns 1-6)
--   type       VARCHAR  — display name  (e.g. 'Fitness Center')
--   location   VARCHAR  — floor / area  (e.g. '4th Floor')
--   priceRate  DECIMAL  — price in RM   (0.00 = complimentary)
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data and reset auto-increment counter
DELETE FROM `Facilities`;
ALTER TABLE `Facilities` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- Insert 6 facilities — facilID omitted; DB auto-assigns 1-6
-- ================================================================
INSERT INTO `Facilities` (type, location, priceRate) VALUES
('Fitness Center', '4th Floor',  20.00),
('Luxury Spa',     '6th Floor',  80.00),
('Infinity Pool',  '5th Floor',  15.00),
('Airport Pickup', 'Lobby',      45.00),
('Fine Dining',    '3rd Floor',  60.00),
('Concierge',      'Lobby',       0.00);

-- ================================================================
-- END OF FILE
-- facilID values will be: 1=Fitness Center, 2=Luxury Spa,
--   3=Infinity Pool, 4=Airport Pickup, 5=Fine Dining, 6=Concierge
-- ================================================================
