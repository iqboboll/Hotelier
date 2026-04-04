<?php
require_once __DIR__ . '/api/db.php';
try {
    $tables = ['booking', 'facilities', 'guest', 'room', 'transaction', 'user'];
    $schema = "";
    foreach($tables as $t) {
        $stmt = $pdo->query("DESCRIBE `$t`");
        $cols = $stmt->fetchAll();
        $schema .= "Table: $t\n";
        foreach($cols as $c) {
            $schema .= "  - {$c['Field']} ({$c['Type']})\n";
        }
        $schema .= "\n";
    }
    echo $schema;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
