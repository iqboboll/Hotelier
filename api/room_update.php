<?php
// api/room_update.php
// Updates status of a room identified by its roomNumber (e.g. 301, 502, 701).
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

// JS sends roomNumber (the display number like 301, 502, 701) and the new status
$roomNumber = isset($data['roomNumber']) ? (int)$data['roomNumber'] : 0;
$status     = trim($data['status'] ?? '');

$allowedStatuses = ['available', 'occupied', 'maintenance'];
if ($roomNumber < 301 || $roomNumber > 720 || !in_array($status, $allowedStatuses)) {
    echo json_encode(['success' => false, 'error' => 'Invalid room number or status value.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE `Room` SET status = ? WHERE roomNumber = ?");
    $stmt->execute([$status, $roomNumber]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => "Room {$roomNumber} not found."]);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to update room: ' . $e->getMessage()]);
}
?>