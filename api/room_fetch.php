<?php
// EDIT: Connected this PHP endpoint to fetch live room statuses
header('Content-Type: application/json');
require_once 'db.php';

try {
    // EDIT: Select all rooms from the database
    // Assume columns are roomNumber and status based on script.js
    $stmt = $pdo->query("SELECT roomNumber as number, status FROM room");
    $rooms = $stmt->fetchAll();
    
    // If table is empty, we return empty array, though normally it's pre-populated
    echo json_encode(['success' => true, 'rooms' => $rooms]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch rooms: ' . $e->getMessage()]);
}
?>
