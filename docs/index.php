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
  <link rel="stylesheet" href="style.css" />
  <script src="assets/jquery.min.js"></script>
  <script src="assets/bootstrap.min.js"></script>
  <style>
    /* Enhanced Pagination */
    #pagination-controls {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .pagination-btn {
      margin: 0 5px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f8f9fa;
      cursor: pointer;
    }

    .pagination-btn.active {
      background-color: #007bff;
      color: #fff;
      border-color: #007bff;
    }

    .pagination-btn:hover {
      background-color: #e9ecef;
    }

    /* Enhanced Table Styling */
    .table-responsive {
      margin-bottom: 20px;
    }

    .table-wrapper {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .table-title {
      margin-bottom: 15px;
    }

    .table-title h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .table-striped tbody tr:nth-of-type(odd) {
      background-color: #f9f9f9;
    }

    .table-hover tbody tr:hover {
      background-color: #f1f1f1;
    }

    .table-bordered {
      border: 1px solid #ddd;
    }

    .table-bordered th,
    .table-bordered td {
      border: 1px solid #ddd;
      padding: 12px;
    }

    .table-bordered thead th {
      background-color: #f8f9fa;
      font-weight: bold;
    }

    /* Highlight Search Results */
    .highlight {
      background-color: yellow;
      font-weight: bold;
    }

    /* Sorting Indicators */
    .sort-icon {
      margin-left: 5px;
      font-size: 12px;
    }

    .sort-icon.asc::after {
      content: "▲";
    }

    .sort-icon.desc::after {
      content: "▼";
    }
  </style>
</head>

<body>
  <div class="sidebar">
    <img class="sidebar-img" src="assets/logo.png" alt="">
    <h2>LCC PROFILING SYSTEM</h2>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="borrow">Borrow Books</a></li>
      <li><a href="#student-table-container">Students</a></li>
      <li><a href="#faculty-table-container">Faculty</a></li>
      <li><a href="#admin-table-container">Admin</a></li>
      <li><a href="#visitor-table-container">Visitors</a></li>
    </ul>
    <!-- Logout Button Positioned at the Bottom -->
    <a href="logout.php" class="logout-btn">Logout</a>
  </div>

  <div class="container">
    <!-- Search Input -->
    <div class="form-group">
      <div class="separation1"

        class="btn-group"
        style="
          display: flex;
          margin: 10px 0px 20px 0px;
          align-items: center;
          align-items: center;
        ">
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
      <input type="month" id="month-picker">
      <button onclick="exportData()">Export</button>
    </div>

    <div id="timestamp-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <span class="close-modal" onclick="closeModal()">&times;</span>
        <h3>Entry Timestamps for <span id="modal-user-name"></span></h3>
        <table id="timestamp-table">
          <thead>
            <tr>
              <th>#</th>
              <th onclick="sortTimestampTable(1)">Date and Time <span class="sort-icon"></span></th>
            </tr>
          </thead>
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
          <h2>Student <b>Details</b></h2>
        </div>
        <table id="student-table" class="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th>Link</th>
              <th>#</th>
              <th>Date Registered</th>
              <th>ID Number</th>
              <th>Name</th>
              <th>Times Entered</th>
              <th>Gender</th>
              <th>Department</th>
              <th>Course</th>
              <th>Major</th>
              <th>Strand</th>
              <th>Grade</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>Valid ID Until</th>
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
          <h2>Faculty <b>Details</b></h2>
        </div>
        <table id="faculty-table" class="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th>Link</th>
              <th>#</th>
              <th>Date Registered</th>
              <th>ID Number</th>
              <th>Name</th>
              <th>Times Entered</th>
              <th>Gender</th>
              <th>College/Department</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>ID Validity</th>
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
          <h2>Admin <b>Details</b></h2>
        </div>
        <table id="admin-table" class="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th>Link</th>
              <th>#</th>
              <th>Date Registered</th>
              <th>ID Number</th>
              <th>Name</th>
              <th>Times Entered</th>
              <th>Gender</th>
              <th>Office</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>ID Validity</th>
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
          <h2>Visitor <b>Details</b></h2>
        </div>
        <table id="visitor-table" class="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              <th>Link</th>
              <th>#</th>
              <th>Date Registered</th>
              <th>ID Number</th>
              <th>Name</th>
              <th>Times Entered</th>
              <th>Gender</th>
              <th>School</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>ID Validity</th>
            </tr>
          </thead>
          <tbody id="visitor-body"></tbody>
        </table>
        <div id="visitor-pagination-text" class="pagination-text"></div>
        <div id="visitor-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for visitors -->
      </div>
    </div>

    <script type="module" src="assets/xlsx.full.min.js"></script>
    <script src="script.js" defer></script>
</body>

</html>