<?php
// EDIT: Connected this PHP endpoint to handle new database bookings
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$guestName = $data['guestName'] ?? '';
$email     = $data['email'] ?? '';
$roomType  = $data['roomType'] ?? '';
$checkin   = $data['checkin'] ?? '';
$checkout  = $data['checkout'] ?? '';
$nights    = $data['nights'] ?? 0;
$total     = $data['total'] ?? 0;

try {
    // EDIT: Insert booking data directly into the database booking table
    // Adjust column names if they differ in your database schema!
    $stmt = $pdo->prepare("INSERT INTO booking (guestName, email, roomType, checkin, checkout, nights, total) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$guestName, $email, $roomType, $checkin, $checkout, $nights, $total]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to create booking: ' . $e->getMessage()]);
}
?>
