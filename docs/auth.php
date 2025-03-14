<?php
session_start();
$host = "localhost";
$user = "root"; // Change if you have a different DB user
$pass = ""; // Change if you have a DB password
$dbname = "lcc_admin_auth"; // Make sure this is the correct DB name

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Fix: Ensure the correct table name
    $stmt = $conn->prepare("SELECT password FROM authentication WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($db_password);
        $stmt->fetch();

        if ($password === $db_password) { // Change this if using password_hash
            $_SESSION['authenticated'] = true;
            $_SESSION['username'] = $username;
            header("Location: index.php");
            exit();
        }
    }

    header("Location: login.php?error=1");
    exit();
}

$conn->close();
