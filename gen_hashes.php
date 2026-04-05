<?php
// Run this once to generate hashes, then embed them in hotelier_seed.sql
$passwords = [
    'guest123',
    'staff123',
    'admin123',
];
foreach ($passwords as $pw) {
    echo password_hash($pw, PASSWORD_BCRYPT, ['cost' => 10]) . "\n";
}
