<?php
// api/room_fetch.php
// Fetches all rooms from the Room table.
// Returns: { success: true, rooms: [ { number, roomType, status }, ... ] }
//
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

try {
    // roomID is aliased as 'number' to match what script.js expects (room.number)
    $stmt = $pdo->query("SELECT roomID as number, roomType, status FROM `Room` ORDER BY roomID ASC");
    $rooms = $stmt->fetchAll();

    echo json_encode(['success' => true, 'rooms' => $rooms]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch rooms: ' . $e->getMessage()]);
}
?>