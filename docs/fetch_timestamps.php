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

// Get the libraryIdNo, timestampsKey, and timesEnteredKey from the query parameters
$libraryIdNo = $_GET['libraryIdNo'] ?? '';
$timestampsKey = $_GET['timestampsKey'] ?? '';
$timesEnteredKey = $_GET['timesEnteredKey'] ?? '';

// Prepare the SQL statement to fetch the specific columns for the specific libraryIdNo
$sql = "SELECT $timestampsKey, $timesEnteredKey FROM std_details WHERE libraryIdNo = ?"; // Adjust table name if needed
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $libraryIdNo);
$stmt->execute();
$result = $stmt->get_result();

// Fetch the data
$data = [];
if ($row = $result->fetch_assoc()) {
    $data[$timestampsKey] = json_decode($row[$timestampsKey], true); // Decode JSON string to array
    $data[$timesEnteredKey] = $row[$timesEnteredKey];
}

// Return the data as JSON
echo json_encode($data);

// Close the connection
$stmt->close();
$conn->close();
