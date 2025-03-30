<?php
$libraryIdNo = $_GET['libraryIdNo'] ?? '';

// Database connection parameters
$host = "localhost";
$username = "root";
$password = "";
$database = "student_datas";

// Create a new MySQLi connection
$conn = new mysqli($host, $username, $password, $database);

// Check for connection errors
if ($conn->connect_error) {
    http_response_code(500);
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch the image path based on libraryIdNo
$sql = "SELECT image_path, lastName, firstName, middleInitial, department, course, major, strand, grade, validUntil, patron 
        FROM std_details WHERE libraryIdNo = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $libraryIdNo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $imagePath = $row['image_path']; // Assuming 'image_path' contains the path to the PNG image

    // Check if the file exists and is a PNG
    if (file_exists($imagePath) && strtolower(pathinfo($imagePath, PATHINFO_EXTENSION)) === 'png') {
        header('Content-Description: File Transfer');
        header('Content-Type: image/png');
        header('Content-Disposition: attachment; filename="' . basename($imagePath) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($imagePath));
        readfile($imagePath);
        exit;
    } else {
        // If the file does not exist, generate the ID card dynamically
        generateIdCard($row);
    }
} else {
    http_response_code(404);
    echo "No image found for the provided ID.";
}

$stmt->close();
$conn->close();

/**
 * Generate an ID card dynamically if the image file does not exist.
 *
 * @param array $userData
 */
function generateIdCard($userData)
{
    // Create a blank image
    $width = 550;
    $height = 320;
    $image = imagecreatetruecolor($width, $height);

    // Define colors
    $white = imagecolorallocate($image, 255, 255, 255);
    $black = imagecolorallocate($image, 0, 0, 0);
    $red = imagecolorallocate($image, 139, 0, 0);
    $gray = imagecolorallocate($image, 200, 200, 200);

    // Fill the background
    imagefilledrectangle($image, 0, 0, $width, $height, $white);

    // Add a border
    imagerectangle($image, 0, 0, $width - 1, $height - 1, $black);

    // Add text
    $font = __DIR__ . '/assets/fonts/arial.ttf'; // Ensure this font file exists
    $fontSize = 12;

    imagettftext($image, $fontSize, 0, 20, 40, $red, $font, "Zamboanga Peninsula Polytechnic State University");
    imagettftext($image, $fontSize - 2, 0, 20, 70, $black, $font, "LEARNING COMMONS CENTER");
    imagettftext($image, $fontSize - 4, 0, 20, 100, $black, $font, "R.T. Lim Blvd., Baliwasan, Zamboanga City");

    imagettftext($image, $fontSize, 0, 20, 140, $red, $font, "LIBRARY ID CARD");
    imagettftext($image, $fontSize - 2, 0, 20, 170, $black, $font, "S.Y.: 2024 - 2025");

    // Add user details
    $name = "{$userData['lastName']}, {$userData['firstName']} {$userData['middleInitial']}.";
    imagettftext($image, $fontSize, 0, 20, 210, $black, $font, "Name: $name");

    if ($userData['patron'] === 'student') {
        imagettftext($image, $fontSize, 0, 20, 240, $black, $font, "Department: {$userData['department']}");
        imagettftext($image, $fontSize, 0, 20, 270, $black, $font, "Course: {$userData['course']}");
        imagettftext($image, $fontSize, 0, 20, 300, $black, $font, "Major: {$userData['major']}");
    } elseif ($userData['patron'] === 'faculty') {
        imagettftext($image, $fontSize, 0, 20, 240, $black, $font, "Department: {$userData['department']}");
    } elseif ($userData['patron'] === 'visitor') {
        imagettftext($image, $fontSize, 0, 20, 240, $black, $font, "School: {$userData['strand']}");
    }

    imagettftext($image, $fontSize, 0, 20, 330, $black, $font, "ID Validity: {$userData['validUntil']}");

    // Output the image as a PNG
    header('Content-Type: image/png');
    imagepng($image);

    // Free memory
    imagedestroy($image);
}
