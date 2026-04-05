<?php
// api/room_fetch.php
// Returns all rooms with their display roomNumber (e.g. 301, 302 ... 720)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

try {
    // Return roomNumber as 'number' — this is what script.js uses as room.number
    $stmt = $pdo->query(
        "SELECT roomNumber as number, roomType, priceRate, status
         FROM `Room`
         ORDER BY roomNumber ASC"
    );
    $rooms = $stmt->fetchAll();

    echo json_encode(['success' => true, 'rooms' => $rooms]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch rooms: ' . $e->getMessage()]);
}
?>