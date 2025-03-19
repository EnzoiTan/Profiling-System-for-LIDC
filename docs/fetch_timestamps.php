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

// Validate the libraryIdNo to prevent SQL injection
if (!preg_match('/^[a-zA-Z0-9_]+$/', $libraryIdNo)) {
    die(json_encode(["error" => "Invalid libraryIdNo provided."]));
}

// Fetch all timestamp columns dynamically
$sql = "SHOW COLUMNS FROM std_details LIKE 'timestamps_%'";
$result = $conn->query($sql);

$timestampColumns = [];
while ($row = $result->fetch_assoc()) {
    $timestampColumns[] = $row['Field'];
}

// Prepare SQL query to fetch all timestamp data
$sql = "SELECT " . implode(", ", $timestampColumns) . " FROM std_details WHERE libraryIdNo = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode(["error" => "SQL prepare failed: " . $conn->error]));
}

$stmt->bind_param("s", $libraryIdNo);
$stmt->execute();
$result = $stmt->get_result();

// Fetch the data
$data = [];
if ($row = $result->fetch_assoc()) {
    foreach ($timestampColumns as $column) {
        if (!empty($row[$column])) { // ✅ Only decode if data is not null/empty
            $decodedData = json_decode($row[$column], true);
            $data[$column] = json_last_error() === JSON_ERROR_NONE ? $decodedData : $row[$column];
        } else {
            $data[$column] = []; // ✅ Return an empty array for null values
        }
    }
}

// Return the data as JSON
echo json_encode($data);
$stmt->close();
$conn->close();
