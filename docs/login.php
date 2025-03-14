<?php
session_start();
if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="assets/logo.png" type="image/x-icon" />
    <title>Admin Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-image: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='69.141' height='40' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='%23ffffffff'/><path d='M69.212 40H46.118L34.57 20 46.118 0h23.094l11.547 20zM57.665 60H34.57L23.023 40 34.57 20h23.095l11.547 20zm0-40H34.57L23.023 0 34.57-20h23.095L69.212 0zM34.57 60H11.476L-.07 40l11.547-20h23.095l11.547 20zm0-40H11.476L-.07 0l11.547-20h23.095L46.118 0zM23.023 40H-.07l-11.547-20L-.07 0h23.094L34.57 20z'  stroke-width='0.5' stroke='%2321212153' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(-276,-160)' fill='url(%23a)'/></svg>")
        }

        .login-wrapper {
            display: flex;
            background: white;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            width: 700px;
            height: 400px;
        }

        .image-container {
            flex: 1;
            background: url('lcc.png') center center/cover;
        }

        .login-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 50px 50px 50px 0;
        }

        .login-container h2 {
            margin-bottom: 20px;
            color: #333;
        }

        .form-group {
            width: 100%;
            max-width: 250px;
            display: flex;
            flex-direction: column;
        }

        .input-box {
            width: 100%;
            padding: 8px;
            margin: 0 0 15px 0;
            border: none;
            border-bottom: 1px solid black;
            font-size: 16px;
        }

        .login-button {
            width: 100%;
            padding: 12px;
            background: rgb(51, 51, 51);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: 0.3s;
            margin-top: 10px;
        }

        .login-button:hover {
            background: #0056b3;
        }

        .error-message {
            color: red;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>

    <div class="login-wrapper">
        <div class="image-container"></div>
        <div class="login-container">
            <h2 style="margin-bottom: 30px;">Admin Login</h2>
            <?php if (isset($_GET['error'])) echo "<p class='error-message'>Invalid credentials!</p>"; ?>
            <form action="auth.php" method="POST" class="form-group">
                <p>Username</p>
                <input type="text" name="username" class="input-box" required>
                <p>Password</p>
                <input type="password" name="password" class="input-box" required>
                <button type="submit" class="login-button">Login</button>
            </form>
        </div>
    </div>

</body>

</html>