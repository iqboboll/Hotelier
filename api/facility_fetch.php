<?php
// api/facility_fetch.php
// Returns all facilities from the Facilities table as JSON.
// facilID is now auto-increment INT (1-6); type/location/priceRate carry the data.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'db.php';

try {
    $stmt = $pdo->query(
        "SELECT facilID, type, location, priceRate
         FROM `Facilities`
         ORDER BY facilID ASC"
    );
    $facilities = $stmt->fetchAll();

    echo json_encode(['success' => true, 'facilities' => $facilities]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch facilities: ' . $e->getMessage()]);
}
?>
