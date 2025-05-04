<?php

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = "localhost";
$username = "root";
$password = "";
$database = "student_datas";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed", "details" => $conn->connect_error]);
    exit;
}

$month = $_GET['month'] ?? '';
$timestampColumn = '';

switch ($month) {
    case '03':
        $timestampColumn = 'timestamps_March_2025';
        break;
    case '04':
        $timestampColumn = 'timestamps_April_2025';
        break;
    case '05':
        $timestampColumn = 'timestamps_May_2025';
        break;
    default:
        echo json_encode(["error" => "Invalid or missing month."]);
        exit;
}

// Query to fetch library data for the specified month
$sql = "SELECT libraryIdNo, firstName, lastName, department, course, strand, gender, $timestampColumn AS timestamps 
        FROM std_details 
        WHERE $timestampColumn IS NOT NULL";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query failed", "details" => $conn->error]);
    exit;
}



$data = [];
while ($row = $result->fetch_assoc()) {
    // Decode the JSON timestamps field
    $timestamps = json_decode($row['timestamps'], true);

    if (!is_array($timestamps)) {
        $timestamps = [];
    }

    // Sort timestamps in ascending order
    sort($timestamps);

    $entries = 0;
    $lastEntryTime = null;

    foreach ($timestamps as $timestamp) {
        $currentTime = strtotime($timestamp);

        // Compare with the last timestamp (if it's the same or within 5 minutes, group them)
        if ($lastEntryTime === null || ($currentTime - $lastEntryTime) > 300) {
            $entries++;
            $lastEntryTime = $currentTime;
        } else {
            // Apply the logic for keeping the latest timestamp if within 5 minutes
            $lastEntryTime = max($lastEntryTime, $currentTime);
        }
    }

    $data[] = [
        "libraryIdNo" => $row['libraryIdNo'],
        "name" => $row['lastName'] . ', ' . $row['firstName'],
        "department" => $row['department'],
        "course" => $row['course'],
        "strand" => $row['strand'],
        "gender" => $row['gender'],
        "entries" => $entries,
        "timestamps" => $timestamps // Optional: Include raw timestamps for debugging
    ];
}

// Ensure the response always includes the "data" field
echo json_encode([
    "success" => true,
    "rowCount" => count($data),
    "data" => $data
]);

$conn->close();
