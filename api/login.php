<?php
// api/login.php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$role = trim($data['role'] ?? '');

if (empty($email) || empty($password) || empty($role)) {
    echo json_encode(['success' => false, 'error' => 'Email, password, and role are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM User WHERE username = ? AND role = ?");
    $stmt->execute([$email, $role]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        
        $name = 'User';
        
        // If the user is a guest, fetch their full name from the Guest table
        if ($role === 'guest') {
            $stmtGuest = $pdo->prepare("SELECT fullName FROM Guest WHERE email = ?");
            $stmtGuest->execute([$email]);
            $guest = $stmtGuest->fetch();
            if ($guest) {
                $name = $guest['fullName'];
            }
        } else {
            // For staff/admin, derive name from email for now (or could add a staff table later)
            $name = ucfirst(explode('@', $email)[0]);
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'name' => $name,
                'email' => $email,
                'role' => $role
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials or role.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Login failed: ' . $e->getMessage()]);
}
?>
