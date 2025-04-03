<?php
// Prevent favicon.ico 404 error
if ($_SERVER["REQUEST_URI"] == "/favicon.ico") {
    http_response_code(204); // No Content (prevents 404)
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Scanner Link Opener</title>
    <link rel="icon" href="data:,"> <!-- Prevents favicon error -->
    <link rel="icon" href="qr.png" type="image/x-icon" />
    <link rel="stylesheet" href="scanner.css">
    <script>
        window.onload = function() {
            let searchInput = document.getElementById("search");
            searchInput.focus(); // Auto-focus input

            // Keep input focused even if clicked outside
            document.addEventListener("click", function(event) {
                if (event.target !== searchInput) {
                    searchInput.focus();
                }
            });

            let typingTimer; // Timer to delay URL processing
            let doneTypingInterval = 1000; // Time to wait after the last character typed (in milliseconds)

            searchInput.addEventListener("input", function() {
                clearTimeout(typingTimer); // Clear the previous timer
                typingTimer = setTimeout(processInput, doneTypingInterval); // Start a new timer
            });

            function processInput() {
                let query = searchInput.value.trim();
                let urlPattern = /^(https?:\/\/[\w\d\-_]+(\.[\w\d\-_]+)*(:\d+)?(\/[^\s]*)?)$/i;

                if (urlPattern.test(query)) {
                    window.open(query, "_blank"); // Open in a new tab
                    setTimeout(() => {
                        searchInput.value = "";
                        searchInput.focus();
                    }, 500); // Clear input & re-focus
                }
            }
        };
    </script>
</head>
<script>
    window.onload = function() {
        let searchInput = document.getElementById("search");
        searchInput.focus(); // Auto-focus input

        // Keep input focused even if clicked outside
        document.addEventListener("click", function(event) {
            if (event.target !== searchInput) {
                searchInput.focus();
            }
        });

        let typingTimer; // Timer to delay URL processing
        let doneTypingInterval = 1000; // Time to wait after the last character typed (in milliseconds)

        searchInput.addEventListener("input", function() {
            clearTimeout(typingTimer); // Clear the previous timer
            typingTimer = setTimeout(processInput, doneTypingInterval); // Start a new timer
        });

        function processInput() {
            let query = searchInput.value.trim();
            let urlPattern = /^(https?:\/\/[\w\d\-_]+(\.[\w\d\-_]+)*(:\d+)?(\/[^\s]*)?)$/i;

            if (urlPattern.test(query)) {
                window.open(query, "_blank"); // Open in a new tab
                setTimeout(() => {
                    searchInput.value = "";
                    searchInput.focus();
                }, 500); // Clear input & re-focus
            }
        }
    };
</script>
</head>

<body>
    <p>QR Code Scanner</p>
    <input type="text" id="search" placeholder="please scan your QR code..." autofocus>
    <p style="font-size: 12px; color: #fff;">Note: This scanner only works with QR codes that contain a URL.</p>
</body>

</html>