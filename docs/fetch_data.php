<?php
$selectedMonth = $_GET['month'] ?? 'All Months';

// Filter based on selected month
if ($selectedMonth === 'All Months') {
    $query = "SELECT * FROM students";
} else {
    $query = "SELECT * FROM students WHERE DATE_FORMAT(dateRegistered, '%M') = '$selectedMonth'";
}

$result = mysqli_query($conn, $query);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

// Send JSON response for JavaScript to handle
echo json_encode($data);
