<?php
// EDIT: Connected this PHP endpoint to update room status via Staff UI or check-in forms
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$roomNum = $data['roomNumber'] ?? '';
$status  = $data['status'] ?? ''; // available, occupied, maintenance
// Optional fields for check-in logic
$guestName = $data['guestName'] ?? '';
$action    = $data['action'] ?? '';

try {
    // EDIT: Update room status in the database
    $stmt = $pdo->prepare("UPDATE room SET status = ? WHERE roomNumber = ?");
    $stmt->execute([$status, $roomNum]);
    
    // Check-in logic: if checking in, might also log transaction or guest linkage
    if ($action === 'checkin' && $guestName) {
        // EDIT: Example of adding transaction log / check-in tie (assuming transaction table)
        // $stmtTx = $pdo->prepare("INSERT INTO transaction (guestName, roomNumber, type) VALUES (?, ?, ?)");
        // $stmtTx->execute([$guestName, $roomNum, 'checkin']);
    }
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to update room: ' . $e->getMessage()]);
}
?>
