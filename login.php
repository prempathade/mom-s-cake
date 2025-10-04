<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
include "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status"=>"error","message"=>"Invalid request method"]);
    exit;
}

$email = trim($_POST["email"] ?? '');
$password = $_POST["password"] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status"=>"error","message"=>"Email and password required"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
if (!$stmt) { error_log($conn->error); echo json_encode(["status"=>"error","message"=>"Server error"]); exit; }
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status"=>"error","message"=>"Invalid email or password"]);
    exit;
}

$user = $result->fetch_assoc();
$hash = $user['password'];

if (password_verify($password, $hash)) {
    unset($user['password']); // never send hash to client
    echo json_encode(["status"=>"success","user"=>$user]);
} else {
    echo json_encode(["status"=>"error","message"=>"Invalid email or password"]);
}
$stmt->close();
?>
