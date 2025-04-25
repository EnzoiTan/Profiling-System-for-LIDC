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
</head>
<script>
    window.onload = function() {
        const searchInput = document.getElementById("search");
        searchInput.focus();

        document.addEventListener("click", function(event) {
            if (event.target !== searchInput) {
                searchInput.focus();
            }
        });

        let typingTimer;
        const doneTypingInterval = 1000;

        searchInput.addEventListener("input", function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(processInput, doneTypingInterval);
        });

        function processInput() {
            let query = searchInput.value.trim();

            try {
                let url = new URL(query);
                let params = new URLSearchParams(url.search);

                let newParams = new URLSearchParams();

                for (let [key, value] of params.entries()) {
                    if (key.toLowerCase() === 'libraryidno') {
                        newParams.set('libraryIdNo', value);
                    } else if (key.toLowerCase() === 'token') {
                        newParams.set('token', value);
                    } else {
                        newParams.set(key, value); // Keep other params as-is
                    }
                }

                let finalUrl = `${url.origin}${url.pathname}?${newParams.toString()}`;

                // Open in new tab
                window.open(finalUrl, "_blank");

                // Reset and refocus for next scan
                searchInput.value = "";
                searchInput.focus();
            } catch (e) {
                // Optional: notify user if URL is invalid
                console.warn("Invalid QR code or not a valid URL");
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