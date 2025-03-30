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
            if (json_last_error() === JSON_ERROR_NONE) {
                // Combine timestamps if they are within 1 or 2 minutes
                $data[$column] = combineTimestamps($decodedData);
            } else {
                $data[$column] = $row[$column];
            }
        } else {
            $data[$column] = []; // ✅ Return an empty array for null values
        }
    }
}

// Return the data as JSON
echo json_encode($data);
$stmt->close();
$conn->close();

/**
 * Combine timestamps that are within a 1 or 2-minute gap.
 *
 * @param array $timestamps
 * @return array
 */
function combineTimestamps(array $timestamps)
{
    // Sort timestamps in ascending order
    sort($timestamps);
    $combined = [];
    $lastTimestamp = null;

    foreach ($timestamps as $timestamp) {
        if ($lastTimestamp === null) {
            $lastTimestamp = $timestamp;
            continue;
        }

        // Calculate the difference in minutes
        $diff = (strtotime($timestamp) - strtotime($lastTimestamp)) / 60;

        // If the difference is less than or equal to 5 minutes, keep the latest timestamp
        if ($diff <= 5) {
            $lastTimestamp = max($lastTimestamp, $timestamp); // Keep the latest timestamp
        } else {
            $combined[] = $lastTimestamp; // Add the last timestamp to the combined array
            $lastTimestamp = $timestamp; // Update the last timestamp
        }
    }

    // Add the last timestamp to the combined array if it exists
    if ($lastTimestamp !== null) {
        $combined[] = $lastTimestamp;
    }

    return $combined;
}
