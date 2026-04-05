<?php
// api/register.php
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

$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');
$phone    = trim($data['phone']    ?? '');
$role     = trim($data['role']     ?? '');

if (empty($name) || empty($email) || empty($password) || empty($role)) {
    echo json_encode(['success' => false, 'error' => 'All required fields must be filled.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters.']);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT userID FROM `User` WHERE username = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Email is already registered.']);
        exit;
    }

    $pdo->beginTransaction();

    // 1. Insert into User table (userID is auto_increment)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO `User` (username, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $role]);
    $userId = (int)$pdo->lastInsertId();

    // 2. If guest, also insert into Guest table.
    // Guest.guestID is NOT auto_increment — we use the same userID as guestID
    // so they stay in sync.
    if ($role === 'guest') {
        $phoneVal = !empty($phone) ? $phone : 'N/A';
        $stmtGuest = $pdo->prepare(
            "INSERT INTO `Guest` (guestID, fullName, email, phoneNumber) VALUES (?, ?, ?, ?)"
        );
        $stmtGuest->execute([$userId, $name, $email, $phoneVal]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'user'    => [
            'name'  => $name,
            'email' => $email,
            'role'  => $role
        ]
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
}
?>