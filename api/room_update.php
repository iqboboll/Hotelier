<?php
// api/room_update.php
// Updates the status of a room in the Room table.
// Called with: { roomNumber: <roomID>, status: 'available'|'occupied'|'maintenance' }
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

// JS sends roomNumber (which is actually roomID) and status
$roomID = isset($data['roomNumber']) ? (int)$data['roomNumber'] : 0;
$status = trim($data['status'] ?? '');

$allowedStatuses = ['available', 'occupied', 'maintenance'];
if ($roomID <= 0 || !in_array($status, $allowedStatuses)) {
    echo json_encode(['success' => false, 'error' => 'Invalid room ID or status value.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE `Room` SET status = ? WHERE roomID = ?");
    $stmt->execute([$status, $roomID]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Room not found.']);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to update room: ' . $e->getMessage()]);
}
?>