-- ============================================================
-- Hotelier Room Table Rebuild (MySQL 5.7 compatible)
-- Floor Layout:
--   Floor 3: Standard Room   301-320  (20 rooms)
--   Floor 4: Standard Room   401-420  (20 rooms)
--   Floor 5: Deluxe Room     501-520  (20 rooms)
--   Floor 6: Executive Suite 601-620  (20 rooms)
--   Floor 7: Penthouse       701-720  (20 rooms)
--   TOTAL: 100 rooms
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Clear all dependent tables first
DELETE FROM `Transaction`;
DELETE FROM `Booking`;
DELETE FROM `Guest`;
DELETE FROM `Room`;

-- Step 2: Drop roomNumber column if it already exists from a previous run
--         (this will fail silently in phpMyAdmin if column doesn't exist - that's OK)
ALTER TABLE `Room` DROP COLUMN `roomNumber`;

-- Step 3: Add the roomNumber column fresh
ALTER TABLE `Room` ADD COLUMN `roomNumber` INT NOT NULL DEFAULT 0 AFTER `roomID`;

-- Step 4: Reset auto_increment counters
ALTER TABLE `Room` AUTO_INCREMENT = 1;
ALTER TABLE `User` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Step 5: Insert all 100 rooms with floor-based room numbers
INSERT INTO `Room` (roomNumber, roomType, priceRate, status) VALUES
-- Floor 3: Standard Rooms (301-320)
(301, 'Standard Room', 80.00, 'available'),
(302, 'Standard Room', 80.00, 'available'),
(303, 'Standard Room', 80.00, 'available'),
(304, 'Standard Room', 80.00, 'available'),
(305, 'Standard Room', 80.00, 'available'),
(306, 'Standard Room', 80.00, 'available'),
(307, 'Standard Room', 80.00, 'available'),
(308, 'Standard Room', 80.00, 'available'),
(309, 'Standard Room', 80.00, 'available'),
(310, 'Standard Room', 80.00, 'available'),
(311, 'Standard Room', 80.00, 'available'),
(312, 'Standard Room', 80.00, 'available'),
(313, 'Standard Room', 80.00, 'available'),
(314, 'Standard Room', 80.00, 'available'),
(315, 'Standard Room', 80.00, 'available'),
(316, 'Standard Room', 80.00, 'available'),
(317, 'Standard Room', 80.00, 'available'),
(318, 'Standard Room', 80.00, 'available'),
(319, 'Standard Room', 80.00, 'available'),
(320, 'Standard Room', 80.00, 'available'),
-- Floor 4: Standard Rooms (401-420)
(401, 'Standard Room', 80.00, 'available'),
(402, 'Standard Room', 80.00, 'available'),
(403, 'Standard Room', 80.00, 'available'),
(404, 'Standard Room', 80.00, 'available'),
(405, 'Standard Room', 80.00, 'available'),
(406, 'Standard Room', 80.00, 'available'),
(407, 'Standard Room', 80.00, 'available'),
(408, 'Standard Room', 80.00, 'available'),
(409, 'Standard Room', 80.00, 'available'),
(410, 'Standard Room', 80.00, 'available'),
(411, 'Standard Room', 80.00, 'available'),
(412, 'Standard Room', 80.00, 'available'),
(413, 'Standard Room', 80.00, 'available'),
(414, 'Standard Room', 80.00, 'available'),
(415, 'Standard Room', 80.00, 'available'),
(416, 'Standard Room', 80.00, 'available'),
(417, 'Standard Room', 80.00, 'available'),
(418, 'Standard Room', 80.00, 'available'),
(419, 'Standard Room', 80.00, 'available'),
(420, 'Standard Room', 80.00, 'available'),
-- Floor 5: Deluxe Rooms (501-520)
(501, 'Deluxe Room', 150.00, 'available'),
(502, 'Deluxe Room', 150.00, 'available'),
(503, 'Deluxe Room', 150.00, 'available'),
(504, 'Deluxe Room', 150.00, 'available'),
(505, 'Deluxe Room', 150.00, 'available'),
(506, 'Deluxe Room', 150.00, 'available'),
(507, 'Deluxe Room', 150.00, 'available'),
(508, 'Deluxe Room', 150.00, 'available'),
(509, 'Deluxe Room', 150.00, 'available'),
(510, 'Deluxe Room', 150.00, 'available'),
(511, 'Deluxe Room', 150.00, 'available'),
(512, 'Deluxe Room', 150.00, 'available'),
(513, 'Deluxe Room', 150.00, 'available'),
(514, 'Deluxe Room', 150.00, 'available'),
(515, 'Deluxe Room', 150.00, 'available'),
(516, 'Deluxe Room', 150.00, 'available'),
(517, 'Deluxe Room', 150.00, 'available'),
(518, 'Deluxe Room', 150.00, 'available'),
(519, 'Deluxe Room', 150.00, 'available'),
(520, 'Deluxe Room', 150.00, 'available'),
-- Floor 6: Executive Suites (601-620)
(601, 'Executive Suite', 250.00, 'available'),
(602, 'Executive Suite', 250.00, 'available'),
(603, 'Executive Suite', 250.00, 'available'),
(604, 'Executive Suite', 250.00, 'available'),
(605, 'Executive Suite', 250.00, 'available'),
(606, 'Executive Suite', 250.00, 'available'),
(607, 'Executive Suite', 250.00, 'available'),
(608, 'Executive Suite', 250.00, 'available'),
(609, 'Executive Suite', 250.00, 'available'),
(610, 'Executive Suite', 250.00, 'available'),
(611, 'Executive Suite', 250.00, 'available'),
(612, 'Executive Suite', 250.00, 'available'),
(613, 'Executive Suite', 250.00, 'available'),
(614, 'Executive Suite', 250.00, 'available'),
(615, 'Executive Suite', 250.00, 'available'),
(616, 'Executive Suite', 250.00, 'available'),
(617, 'Executive Suite', 250.00, 'available'),
(618, 'Executive Suite', 250.00, 'available'),
(619, 'Executive Suite', 250.00, 'available'),
(620, 'Executive Suite', 250.00, 'available'),
-- Floor 7: Penthouses (701-720)
(701, 'Penthouse', 500.00, 'available'),
(702, 'Penthouse', 500.00, 'available'),
(703, 'Penthouse', 500.00, 'available'),
(704, 'Penthouse', 500.00, 'available'),
(705, 'Penthouse', 500.00, 'available'),
(706, 'Penthouse', 500.00, 'available'),
(707, 'Penthouse', 500.00, 'available'),
(708, 'Penthouse', 500.00, 'available'),
(709, 'Penthouse', 500.00, 'available'),
(710, 'Penthouse', 500.00, 'available'),
(711, 'Penthouse', 500.00, 'available'),
(712, 'Penthouse', 500.00, 'available'),
(713, 'Penthouse', 500.00, 'available'),
(714, 'Penthouse', 500.00, 'available'),
(715, 'Penthouse', 500.00, 'available'),
(716, 'Penthouse', 500.00, 'available'),
(717, 'Penthouse', 500.00, 'available'),
(718, 'Penthouse', 500.00, 'available'),
(719, 'Penthouse', 500.00, 'available'),
(720, 'Penthouse', 500.00, 'available');
