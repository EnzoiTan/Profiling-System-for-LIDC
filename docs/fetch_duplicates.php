<?php
// Database connection parameters
$host = "localhost";
$username = "root";
$password = "";
$database = "student_datas";

// Create a connection to the database
$conn = new mysqli($host, $username, $password, $database);

// Check for connection errors
if ($conn->connect_error) {
    // Return a JSON error response
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Set the content type to JSON
header('Content-Type: application/json');

// Query to find duplicate names
$query = "SELECT firstName, lastName, COUNT(*) as count FROM std_details GROUP BY firstName, lastName HAVING count > 1";
$result = $conn->query($query);

// Initialize an array to hold duplicate entries
$duplicates = [];

// Check if the query was successful
if ($result) {
    // Fetch duplicate entries
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $duplicates[] = $row;
        }
    }
    // Free the result set
    $result->free();
} else {
    // Return a JSON error response if the query fails
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit();
}

// Close the database connection
$conn->close();

// Return the duplicates as a JSON response
echo json_encode($duplicates);
