<?php
// api/register.php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$phone = trim($data['phone'] ?? '');
$role = trim($data['role'] ?? '');

if (empty($name) || empty($email) || empty($password) || empty($role)) {
    echo json_encode(['success' => false, 'error' => 'All required fields must be filled.']);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT userID FROM User WHERE username = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Email is already registered.']);
        exit;
    }

    $pdo->beginTransaction();

    // 1. Create the User (for Authentication)
    // We store email as username in the User table as it uniquely identifies logins
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO User (username, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $role]);
    $userId = $pdo->lastInsertId();

    // 2. If the user is a guest, add them to the Guest table as well
    if ($role === 'guest') {
        $stmtGuest = $pdo->prepare("INSERT INTO Guest (fullName, email, phoneNumber) VALUES (?, ?, ?)");
        $stmtGuest->execute([$name, $email, $phone]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'user' => [
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
}
?>
