<?php
session_start();
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <link rel="icon" href="zppsu-logo.png" type="image/x-icon" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Library Users Database</title>
    <link
        href="assets/css.css"
        rel="stylesheet" />
    <link
        rel="stylesheet"
        href="assets/font-awesome.min.css" />
    <link
        rel="stylesheet"
        href="assets/bootstrap.min.css" />
    <link rel="stylesheet" href="style-borrow.css" />
    <script src="assets/jquery.min.js"></script>
    <script src="assets/bootstrap.min.js"></script>
</head>


<body>



    <div class="container">
        <nav>
            <div class="left-nav">
                <img class="sidebar-img" src="zppsu-logo.png" alt="ZPPSU Logo">
                <!-- <img class="sidebar-img" src="assets/logo.png" alt="ZPPSU Logo"> -->
                <h2>Library Users Database</h2>
            </div>
            <div class="right-nav">
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="stat_rep.php">Statistics</a></li>
                    <li><a href="borrow.php" target="_blank">Borrow Book</a></li>
                    <li><a href="scanner.php" target="_blank">QR Link Scanner</a></li>
                    <li><a href="logout.php" class="logout-btn">logout</a></li>
                </ul>
            </div>
        </nav>
        <!-- Search Input -->
        <div class="form-group">
            <div class="separation1"

                class="btn-group">
                <input
                    type="text"
                    id="search-input"
                    class="searchbar"
                    placeholder="Search..."
                    onkeyup="searchTables()" />
                <p style="margin: 0 10px 0px 20px; font-weight: bold">Sort by:</p>
                <select id="sortDropdown" onchange="handleSortChange()" class="dropdown">
                    <option value="all">Show All</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                    <option value="visitor">Visitor</option>
                </select>

                <select id="sortMonth" onchange="handleSortChange()" class="dropdown">
                    <option value="all">All Months</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
            <p style="margin: 0 10px 0px 20px; font-weight: bold">Export Option:</p>
            <select id="patron-picker">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
                <option value="visitor">Visitor</option>
            </select>
            <input type="month" id="month-picker">
            <button onclick="exportData()">Export</button>
            <button id="search-duplicates" onclick="searchForDuplicates()">🔍︎</button>
            <div id="duplicate-modal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close" onclick="closeModal()">&times;</span>
                    <!-- Results will be injected here -->
                </div>
            </div>
        </div>

        <div id="timestamp-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <h3>Enter <span>Book Details</span></h3>
                <table id="timestamp-table">
                    <tbody id="timestamp-body"></tbody>
                </table>
                <div id="pagination-controls"></div>
            </div>
        </div>

        <!-- Patron Type Toggle Buttons -->


        <!-- Student Table -->
        <div class="table-responsive" id="student-table-container">
            <div class="table-wrapper">
                <div class="table-title">
                    <h2>List of <b>Student</b></h2>
                </div>
                <table id="student-table" class="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID Number</th>
                            <th>Status</th>
                            <th style="margin-left: 19;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="student-body"></tbody>
                </table>
                <div id="student-pagination-text" class="pagination-text"></div>
                <div id="student-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for students -->
            </div>
        </div>

        <!-- Faculty Table -->
        <div class="table-responsive" id="faculty-table-container" style="display: none">
            <div class="table-wrapper">
                <div class="table-title">
                    <h2>List of <b>Faculty</b></h2>
                </div>
                <table id="faculty-table" class="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID Number</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="faculty-body"></tbody>
                </table>
                <div id="faculty-pagination-text" class="pagination-text"></div>
                <div id="faculty-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for faculty -->
            </div>
        </div>

        <!-- Admin Table -->
        <div class="table-responsive" id="admin-table-container" style="display: none">
            <div class="table-wrapper">
                <div class="table-title">
                    <h2>List of <b>Admin</b></h2>
                </div>
                <table id="admin-table" class="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID Number</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="admin-body"></tbody>
                </table>
                <div id="admin-pagination-text" class="pagination-text"></div>
                <div id="admin-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for admin -->
            </div>
        </div>

        <!-- Visitor Table -->
        <div class="table-responsive" id="visitor-table-container" style="display: none">
            <div class="table-wrapper">
                <div class="table-title">
                    <h2>List of <b>Visitor</b></h2>
                </div>
                <table id="visitor-table" class="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID Number</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="visitor-body"></tbody>
                </table>
                <div id="visitor-pagination-text" class="pagination-text"></div>
                <div id="visitor-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for visitors -->
            </div>
        </div>

        <script type="module" src="assets/xlsx.full.min.js"></script>
        <script src="script-borrow.js" defer></script>
</body>

</html>