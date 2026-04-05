<?php
// api/booking_create.php
// Creates a booking. JS sends: { guestName, email, roomType, checkin, checkout, nights, rate, total }
// We resolve roomID and guestID/userID from the DB.
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

$guestName    = trim($data['guestName']  ?? '');
$email        = trim($data['email']      ?? '');
$roomType     = trim($data['roomType']   ?? '');
$checkInDate  = trim($data['checkin']    ?? '');
$checkOutDate = trim($data['checkout']   ?? '');

if (empty($email) || empty($roomType) || empty($checkInDate) || empty($checkOutDate)) {
    echo json_encode(['success' => false, 'error' => 'Missing required booking fields.']);
    exit;
}

try {
    // 1. Look up guestID by email
    $stmtG = $pdo->prepare("SELECT guestID FROM `Guest` WHERE email = ?");
    $stmtG->execute([$email]);
    $guestRow = $stmtG->fetch();
    $guestID  = $guestRow ? (int)$guestRow['guestID'] : null;

    // 2. Find an available room of the requested type by roomNumber
    $stmtR = $pdo->prepare(
        "SELECT roomID, roomNumber FROM `Room`
         WHERE roomType = ? AND status = 'available'
         ORDER BY roomNumber ASC LIMIT 1"
    );
    $stmtR->execute([$roomType]);
    $roomRow = $stmtR->fetch();

    if (!$roomRow) {
        // Fallback: any room of this type regardless of status
        $stmtR2 = $pdo->prepare(
            "SELECT roomID, roomNumber FROM `Room`
             WHERE roomType = ?
             ORDER BY roomNumber ASC LIMIT 1"
        );
        $stmtR2->execute([$roomType]);
        $roomRow = $stmtR2->fetch();
    }

    if (!$roomRow) {
        echo json_encode(['success' => false, 'error' => 'No room found for the selected type.']);
        exit;
    }

    $roomID     = (int)$roomRow['roomID'];
    $roomNumber = (int)$roomRow['roomNumber'];

    // 3. Look up userID by email
    $stmtU = $pdo->prepare("SELECT userID FROM `User` WHERE username = ?");
    $stmtU->execute([$email]);
    $userRow = $stmtU->fetch();
    $userID  = $userRow ? (int)$userRow['userID'] : null;

    // 4. Insert the booking
    $stmt = $pdo->prepare(
        "INSERT INTO `Booking` (userID, guestID, roomID, checkInDate, checkOutDate)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$userID, $guestID, $roomID, $checkInDate, $checkOutDate]);
    $bookingID = (int)$pdo->lastInsertId();

    // 5. Mark the assigned room as occupied
    $stmtStatus = $pdo->prepare("UPDATE `Room` SET status = 'occupied' WHERE roomID = ?");
    $stmtStatus->execute([$roomID]);

    echo json_encode([
        'success'    => true,
        'bookingID'  => $bookingID,
        'roomNumber' => $roomNumber
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to create booking: ' . $e->getMessage()]);
}
?>