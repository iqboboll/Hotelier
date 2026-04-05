<?php
// api/booking_create.php
// Creates a new booking in the Booking table.
// The Booking table schema:
//   bookingID INT AUTO_INCREMENT PK
//   userID    INT (FK -> User)
//   guestID   INT (FK -> Guest)
//   roomID    INT (FK -> Room)
//   checkInDate  DATE NOT NULL
//   checkOutDate DATE NOT NULL
//
// The JS sends: { guestName, email, roomType, checkin, checkout, nights, rate, total }
// We resolve guestID from Guest.email and roomID from Room.roomType.
//
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$guestName   = trim($data['guestName']  ?? '');
$email       = trim($data['email']      ?? '');
$roomType    = trim($data['roomType']   ?? '');
$checkInDate = trim($data['checkin']    ?? '');
$checkOutDate= trim($data['checkout']   ?? '');

if (empty($email) || empty($roomType) || empty($checkInDate) || empty($checkOutDate)) {
    echo json_encode(['success' => false, 'error' => 'Missing required booking fields.']);
    exit;
}

try {
    // 1. Look up guestID from Guest table by email
    $stmtG = $pdo->prepare("SELECT guestID FROM `Guest` WHERE email = ?");
    $stmtG->execute([$email]);
    $guestRow = $stmtG->fetch();

    // 2. Look up roomID from Room table by roomType (pick first available room of that type)
    $stmtR = $pdo->prepare(
        "SELECT roomID FROM `Room` WHERE roomType = ? AND status = 'available' LIMIT 1"
    );
    $stmtR->execute([$roomType]);
    $roomRow = $stmtR->fetch();

    if (!$roomRow) {
        // Fallback: grab any room of this type regardless of status
        $stmtR2 = $pdo->prepare("SELECT roomID FROM `Room` WHERE roomType = ? LIMIT 1");
        $stmtR2->execute([$roomType]);
        $roomRow = $stmtR2->fetch();
    }

    if (!$roomRow) {
        echo json_encode(['success' => false, 'error' => 'No room found for the selected type. Please contact reception.']);
        exit;
    }

    $guestID = $guestRow ? (int)$guestRow['guestID'] : null;
    $roomID  = (int)$roomRow['roomID'];

    // 3. Look up userID from User table by email (user who is logged in)
    $stmtU = $pdo->prepare("SELECT userID FROM `User` WHERE username = ?");
    $stmtU->execute([$email]);
    $userRow = $stmtU->fetch();
    $userID  = $userRow ? (int)$userRow['userID'] : null;

    // 4. Insert booking
    $stmt = $pdo->prepare(
        "INSERT INTO `Booking` (userID, guestID, roomID, checkInDate, checkOutDate)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$userID, $guestID, $roomID, $checkInDate, $checkOutDate]);
    $bookingID = (int)$pdo->lastInsertId();

    // 5. Mark the room as occupied
    $stmtStatus = $pdo->prepare("UPDATE `Room` SET status = 'occupied' WHERE roomID = ?");
    $stmtStatus->execute([$roomID]);

    echo json_encode(['success' => true, 'bookingID' => $bookingID]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to create booking: ' . $e->getMessage()]);
}
?>