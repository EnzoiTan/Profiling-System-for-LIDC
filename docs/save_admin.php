<?php
session_start();
if (!isset($_SESSION['super_admin'])) {
    die("Access denied!");
}

$conn = new mysqli("localhost", "root", "", "your_database");

$name = $_POST['name'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO admin (name, email, password) 
        VALUES ('$name', '$email', '$password')";

if ($conn->query($sql) === TRUE) {
    echo "Admin added successfully!";
    header("Location: dashboard.php");
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
