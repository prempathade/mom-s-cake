<?php
// db.php
$host = "sql201.infinityfree.com";
$user = "if0_40072050";
$pass = "Premneha";
$dbname = "if0_40072050_momscake";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    // avoid exposing DB error to client, but log it
    error_log("DB connect error: " . $conn->connect_error);
    die(json_encode(["status"=>"error","message"=>"Database connection failed"]));
}
$conn->set_charset("utf8mb4");
?>
