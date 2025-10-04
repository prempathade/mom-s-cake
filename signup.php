<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // OK for dev; tighten in production
include "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status"=>"error","message"=>"Invalid request method"]);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$name || !$email || !$password) {
    echo json_encode(["status"=>"error","message"=>"All fields required"]);
    exit;
}

// simple password length check
if (strlen($password) < 6) {
    echo json_encode(["status"=>"error","message"=>"Password must be at least 6 characters"]);
    exit;
}

// check existing email
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
if (!$stmt) { error_log($conn->error); echo json_encode(["status"=>"error","message"=>"Server error"]); exit; }
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["status"=>"error","message"=>"Email already registered"]);
    exit;
}
$stmt->close();

// insert
$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (name,email,password) VALUES (?, ?, ?)");
if (!$stmt) { error_log($conn->error); echo json_encode(["status"=>"error","message"=>"Server error"]); exit; }
$stmt->bind_param("sss", $name, $email, $hashed);
if ($stmt->execute()) {
    echo json_encode(["status"=>"success","message"=>"User registered"]);
} else {
    error_log("Insert error: " . $stmt->error);
    echo json_encode(["status"=>"error","message"=>"Registration failed"]);
}
$stmt->close();
?>
