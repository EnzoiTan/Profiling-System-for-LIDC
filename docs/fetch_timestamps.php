<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

// Database connection parameters
$host = "localhost";
$username = "root";
$password = "";
$database = "student_datas";

// Create a new MySQLi connection
$conn = new mysqli($host, $username, $password, $database);

// Check for connection errors
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Get the libraryIdNo from the query parameters
$libraryIdNo = $_GET['libraryIdNo'] ?? '';

// Prepare the SQL statement to fetch timestamps for the specific libraryIdNo
$sql = "SELECT timestamps FROM std_details WHERE libraryIdNo = ?"; // Adjust table name if needed
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $libraryIdNo);
$stmt->execute();
$result = $stmt->get_result();

// Fetch the timestamps
$timestamps = [];
while ($row = $result->fetch_assoc()) {
    $timestamps[] = $row['timestamps'];
}

// Return the timestamps as JSON
echo json_encode($timestamps);

// Close the connection
$stmt->close();
$conn->close();
