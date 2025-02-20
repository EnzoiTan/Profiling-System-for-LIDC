<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <link rel="icon" href="zppsu-logo.png" type="image/x-icon" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Library Users Database</title>
  <link
    href="https://fonts.googleapis.com/css?family=Roboto"
    rel="stylesheet" />
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
  <link rel="stylesheet" href="style.css" />
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
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
  <div class="container">
    <!-- Search Input -->
    <div class="form-group">
      <input
        type="text"
        id="search-input"
        class="form-control"
        placeholder="Search..."
        onkeyup="searchTables()" />
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
    <div
      class="btn-group"
      style="
          display: flex;
          margin: 25px 0px 20px 0px;
          align-items: center;
          align-items: center;
        ">
      <p style="margin: 0 10px; font-weight: bold">Sort by:</p>
      <button class="btn btn-primary" onclick="toggleTable('student')">
        Students
      </button>
      <button class="btn btn-primary" onclick="toggleTable('faculty')">
        Faculty
      </button>
      <button class="btn btn-primary" onclick="toggleTable('admin')">
        Admin
      </button>
      <button class="btn btn-primary" onclick="toggleTable('visitor')">
        Visitors
      </button>
      <button class="btn btn-primary" onclick="showAllTables()">
        Show All
      </button>
    </div>

    <!-- Student Table -->
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
              <th>Type of Patron</th>
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
              <th>Type of Patron</th>
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
              <th>Type of Patron</th>
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
              <th>Type of Patron</th>
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
        <div id="visitor-pagination-controls" class="pagination-controls"></div> <!-- Pagination controls for visitors -->
      </div>
    </div>

    <script
      type="module"
      src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script type="module" src="script.js"></script>
    <script>
      function sortTable(tableId, columnIndex) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const ascending = table.dataset.sortOrder !== "asc";

        rows.sort((rowA, rowB) => {
          const cellA = rowA.cells[columnIndex].innerText.trim();
          const cellB = rowB.cells[columnIndex].innerText.trim();
          return ascending ?
            cellA.localeCompare(cellB) :
            cellB.localeCompare(cellA);
        });

        table.dataset.sortOrder = ascending ? "asc" : "desc";
        tbody.innerHTML = "";
        rows.forEach((row) => tbody.appendChild(row));
        displayPage(1);

        // Update sorting icon
        const sortIcon = table.querySelector(".sort-icon");
        sortIcon.className = "sort-icon";
        sortIcon.classList.add(ascending ? "asc" : "desc");
      }

      function toggleTable(type) {
        // Hide all tables
        document.getElementById("student-table-container").style.display =
          "none";
        document.getElementById("faculty-table-container").style.display =
          "none";
        document.getElementById("admin-table-container").style.display = "none";
        document.getElementById("visitor-table-container").style.display =
          "none";

        // Show the selected table
        document.getElementById(type + "-table-container").style.display =
          "block";
      }

      function showAllTables() {
        // Show all tables
        document.getElementById("student-table-container").style.display =
          "block";
        document.getElementById("faculty-table-container").style.display =
          "block";
        document.getElementById("admin-table-container").style.display =
          "block";
        document.getElementById("visitor-table-container").style.display =
          "block";
      }

      function searchTables() {
        const input = document
          .getElementById("search-input")
          .value.toLowerCase();
        const tables = ["student", "student", "faculty", "admin", "visitor"];
        let tableFound = false;

        tables.forEach((table) => {
          const tbody = document.getElementById(table + "-body");
          const rows = tbody.getElementsByTagName("tr");
          let tableHasMatches = false;

          for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName("td");
            let rowContainsSearchTerm = false;

            for (let j = 0; j < cells.length; j++) {
              if (cells[j]) {
                const cellText = cells[j].textContent || cells[j].innerText;
                if (cellText.toLowerCase().indexOf(input) > -1) {
                  rowContainsSearchTerm = true;
                  tableHasMatches = true;
                  // Highlight the matching text
                  const regex = new RegExp(`(${input})`, "gi");
                  cells[j].innerHTML = cellText.replace(
                    regex,
                    '<span class="highlight">$1</span>'
                  );
                } else {
                  // Reset the cell content if it doesn't match
                  cells[j].innerHTML = cellText;
                }
              }
            }

            rows[i].style.display = rowContainsSearchTerm ? "" : "none";
          }

          if (tableHasMatches) {
            tableFound = true;
            document.getElementById(table + "-table-container").style.display =
              "block";
          } else {
            document.getElementById(table + "-table-container").style.display =
              "none";
          }
        });

        // If no table has matches, hide all tables
        if (!tableFound) {
          showAllTables(); // Show all tables if no matches found
        }
      }

      // Initialize pagination and sort icons on page load
      window.onload = function() {
        // Initialize pagination controls and show the first page
        displayPage(1);

        // Automatically trigger sorting for the "Date and Time" column (column index 1)
        sortTable("timestamp-table", 1); // This will sort the table based on the Date and Time column

        // Initialize sort icons for other sortable columns
        const sortableHeaders = document.querySelectorAll("th[onclick]");
        sortableHeaders.forEach((header) => {
          const sortIcon = document.createElement("span");
          sortIcon.className = "sort-icon";
          header.appendChild(sortIcon);
        });

        // Show all tables by default
        showAllTables();
      };

      function closeModal() {
        document.getElementById("timestamp-modal").style.display = "none";
      }

      function sortTimestampTable(columnIndex) {
        const table = document.getElementById("timestamp-table");
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const ascending = table.dataset.sortOrder !== "asc";

        rows.sort((rowA, rowB) => {
          const cellA = new Date(rowA.cells[columnIndex].dataset.timestamp); // Get raw timestamp
          const cellB = new Date(rowB.cells[columnIndex].dataset.timestamp);
          return ascending ? cellA - cellB : cellB - cellA;
        });

        table.dataset.sortOrder = ascending ? "asc" : "desc";
        tbody.innerHTML = "";
        rows.forEach((row) => tbody.appendChild(row));
        displayPage(1, rows.length); // Reset to the first page after sorting
      }

      function displayTimestamps(timestampText) {
        const timestampBody = document.getElementById("timestamp-body");
        timestampBody.innerHTML = "";

        let timestamps = [];
        try {
          timestamps = JSON.parse(timestampText); // Parse the stored JSON array
        } catch (error) {
          console.error("Error parsing timestamps:", error);
        }

        timestamps.forEach((timestamp, index) => {
          let dateObj = new Date(timestamp);

          let formattedTimestamp = dateObj.toLocaleString("en-US", {
            weekday: "short", // Mon
            month: "long", // February
            day: "2-digit", // 20
            year: "numeric", // 2023
            hour: "2-digit", // 02
            minute: "2-digit", // 31
            second: "2-digit", // 33
            hour12: true // PM
          });

          // Custom formatting to match "Mon, February 20, 2023 02:31:33 PM"
          formattedTimestamp = formattedTimestamp.replace(",", ""); // Remove extra comma
          formattedTimestamp = formattedTimestamp.replace(/(\w{3}) (\d{2})/, "$1, $2"); // Adjust spacing

          // Append "Date Registered" for the first timestamp
          if (index === 0) {
            formattedTimestamp += ` <span style="background-color: #2E7D32; color: white; padding: 3px 15px; margin-left: 20px; border-radius: 4px; font-size: 12px;">Date Registered</span>`;
          }

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td data-timestamp="${timestamp}">${formattedTimestamp}</td>
        `;
          timestampBody.appendChild(row);
        });

        // Implement pagination
        setupPagination(timestamps.length);
      }

      function setupPagination(totalTimestamps) {
        const rowsPerPage = 10;
        const totalPages = Math.ceil(totalTimestamps / rowsPerPage);
        const paginationControls = document.getElementById("pagination-controls");
        paginationControls.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.className = "pagination-btn";
          btn.onclick = () => displayPage(i, totalTimestamps);
          paginationControls.appendChild(btn);
        }

        displayPage(1, totalTimestamps); // Show the first page by default
      }

      function displayPage(page, totalTimestamps) {
        const rowsPerPage = 10;
        const timestampBody = document.getElementById("timestamp-body");
        const rows = timestampBody.querySelectorAll("tr");

        rows.forEach((row, index) => {
          row.style.display = (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) ? "" : "none";
        });
      }
    </script>
</body>

</html>