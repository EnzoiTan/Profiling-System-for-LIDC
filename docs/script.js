let currentPage = 1;
const rowsPerPage = 5; // Limit of 5 users per page
let usersData = []; // Store all users data

document.addEventListener("DOMContentLoaded", function () {
    fetchAndUpdateUsers(); // Initial fetch
    setInterval(fetchAndUpdateUsers, 5000); // Poll every 5 seconds for new data
});

function fetchAndUpdateUsers() {
    fetch("fetch_users.php")
        .then(response => response.json())
        .then(data => {
            if (JSON.stringify(usersData) !== JSON.stringify(data)) {
                usersData = data; // Update stored data
                displayUsers(data); // Re-render table only if data changed
            }
        })
        .catch(error => console.error("Error fetching data:", error));
}

function displayUsers(users) {
    const studentBody = document.getElementById("student-body");
    const facultyBody = document.getElementById("faculty-body");
    const adminBody = document.getElementById("admin-body");
    const visitorBody = document.getElementById("visitor-body");

    // Clear previous table content
    studentBody.innerHTML = "";
    facultyBody.innerHTML = "";
    adminBody.innerHTML = "";
    visitorBody.innerHTML = "";

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        const formattedMiddleInitial = user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : "";
        const fullName = `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${formattedMiddleInitial}`;
        const rowNumber = index + 1; // Auto-incrementing row number

        // Handling timestamps correctly
        let timestampsArray = [];
        try {
            if (Array.isArray(user.timestamps)) {
                timestampsArray = user.timestamps;
            } else if (typeof user.timestamps === "string") {
                timestampsArray = JSON.parse(user.timestamps);
            }
        } catch (error) {
            console.warn("Invalid JSON format, attempting manual parse:", user.timestamps);
            timestampsArray = user.timestamps.split(",").map(ts => ts.trim());
        }

        let latestTimestamp = timestampsArray.length > 0 ? formatDate(timestampsArray[0]) : "---"; // Get latest timestamp

        // Create table row HTML
        let rowHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${rowNumber}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${capitalizeWords(user.patron)}</td>
            <td>${fullName}</td>
            <td>${user.timesEntered || "---"}</td>
            <td>${capitalizeWords(user.gender) || "---"}</td>
        `;

        // Patron-specific fields
        if (user.patron.toLowerCase() === "student") {
            rowHTML += `
                <td>${user.department.toUpperCase() || "---"}</td>
                <td>${user.course || "---"}</td>
                <td>${user.major || "---"}</td>
                <td>${user.strand || "---"}</td>
                <td>${user.grade || "---"}</td>
            `;
        } else if (user.patron.toLowerCase() === "faculty") {
            rowHTML += `
                <td>${user.collegeSelect.toUpperCase() || "---"}</td>
            `;
        } else if (user.patron.toLowerCase() === "admin") {
            rowHTML += `
                <td>${user.campusDept || "---"}</td>
            `;
        } else if (user.patron.toLowerCase() === "visitor") {
            rowHTML += `
                <td>${user.schoolSelect ? user.schoolSelect.toUpperCase() : (user.specifySchool ? user.specifySchool.toUpperCase() : "---")}</td>
            `;
        }

        // Common fields for all patrons
        rowHTML += `
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
        `;

        row.innerHTML = rowHTML;

        // Append row to correct table section
        switch (user.patron.toLowerCase()) {
            case "student":
                studentBody.appendChild(row);
                break;
            case "faculty":
                facultyBody.appendChild(row);
                break;
            case "admin":
                adminBody.appendChild(row);
                break;
            case "visitor":
                visitorBody.appendChild(row);
                break;
        }

        // Add click event to open modal with timestamps
        row.addEventListener("click", () => {
            openTimestampModal(user.libraryIdNo, fullName);
        });
    });
}

function openTimestampModal(libraryIdNo, fullName) {
    document.getElementById("modal-user-name").textContent = fullName;
    fetch(`fetch_timestamps.php?libraryIdNo=${libraryIdNo}`)
        .then(response => response.json())
        .then(data => {
            displayTimestamps(data);
            document.getElementById("timestamp-modal").style.display = "block";
        })
        .catch(error => console.error("Error fetching timestamps:", error));
}

// Format timestamp properly
function formatDate(timestamp) {
    if (!timestamp) return "---";

    let dateObj;
    if (typeof timestamp === "number") {
        dateObj = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    } else {
        dateObj = new Date(timestamp); // Handle MySQL timestamp format
    }

    return dateObj.toLocaleDateString("en-US", {
        weekday: "short",   // Example: "Mon"
        year: "numeric",    // Example: "2024"
        month: "long",      // Example: "February"
        day: "2-digit"      // Example: "19"
    });
}

// Helper functions for formatting
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function capitalizeSemester(semester) {
    return semester ? semester.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";
}

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
    const tables = ["student", "faculty", "admin", "visitor"];
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
window.onload = function () {
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

document.getElementById("download-btn").addEventListener("click", function () {
    let selectedMonth = document.getElementById("month-picker").value;
    exportToExcel(usersData, selectedMonth || "all");
});

function exportToExcel(data, month) {
    const wb = XLSX.utils.book_new();

    // ✅ Include all required fields
    const wsData = [[
        "Library ID", "Name", "Patron Type", "Latest Timestamp", "Department", "Course", "Major",
        "Grade", "Strand", "School Year", "Semester", "College", "School", "Specified School",
        "Campus Dept", "Times Entered"
    ]];

    data.forEach(user => {
        let timestampsArray = [];
        try {
            timestampsArray = Array.isArray(user.timestamps) ? user.timestamps : JSON.parse(user.timestamps);
        } catch {
            timestampsArray = user.timestamps ? user.timestamps.split(",").map(ts => ts.trim()) : [];
        }

        let latestTimestamp = timestampsArray.length > 0 ? formatDate(timestampsArray[0]) : "---";

        wsData.push([
            user.libraryIdNo,
            `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : ""}`,
            capitalizeWords(user.patron),
            latestTimestamp,
            user.department || "---",
            user.course || "---",
            user.major || "---",
            user.grade || "---",
            user.strand || "---",
            user.schoolYear || "---",
            user.semester || "---",
            user.collegeSelect || "---",
            user.schoolSelect || "---",
            user.specifySchool || "---",
            user.campusDept || "---",
            user.timesEntered || 1
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "User Data");

    // ✅ Adjust column width dynamically based on content
    const columnWidths = wsData[0].map((col, index) => ({
        wch: Math.max(...wsData.map(row => (row[index] ? row[index].toString().length : 0)), col.length) + 2
    }));
    ws['!cols'] = columnWidths;

    const filename = `user_data_${month.replace("-", "_")}.xlsx`;
    XLSX.writeFile(wb, filename);
}


























// let currentPage = 1;
// const rowsPerPage = 5;
// let usersData = [];

// document.addEventListener("DOMContentLoaded", function () {
//     const monthPicker = document.getElementById("month-picker");
//     const downloadBtn = document.getElementById("download-btn");

//     monthPicker.addEventListener("change", () => fetchAndUpdateUsers(monthPicker.value));
//     downloadBtn.addEventListener("click", () => exportToExcel(usersData, monthPicker.value));

//     fetchAndUpdateUsers();
//     setInterval(fetchAndUpdateUsers, 5000);
//     showAllTables();
// });

// function fetchAndUpdateUsers(selectedMonth = "") {
//     fetch("fetch_users.php")
//         .then(response => response.json())
//         .then(data => {
//             usersData = data.filter(user => !selectedMonth || user.timestamps.some(ts => new Date(ts).toLocaleString("en-US", { month: "long" }) === selectedMonth));
//             displayUsers(usersData);
//         })
//         .catch(error => console.error("Error fetching data:", error));
// }

// function displayUsers(users) {
//     const tables = { student: "student-body", faculty: "faculty-body", admin: "admin-body", visitor: "visitor-body" };
//     Object.values(tables).forEach(id => document.getElementById(id).innerHTML = "");

//     users.forEach((user, index) => {
//         const row = document.createElement("tr");
//         const formattedMiddleInitial = user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : "";
//         const fullName = `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${formattedMiddleInitial}`;
//         const latestTimestamp = user.timestamps.length > 0 ? formatDate(user.timestamps[0]) : "---";

//         let rowHTML = `
//             <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
//             <td>${index + 1}</td>
//             <td>${latestTimestamp}</td>
//             <td>${user.libraryIdNo}</td>
//             <td>${capitalizeWords(user.patron)}</td>
//             <td>${fullName}</td>
//             <td>${user.timesEntered || "---"}</td>
//             <td>${capitalizeWords(user.gender) || "---"}</td>
//         `;

//         rowHTML += user.patron.toLowerCase() === "student" ? `
//             <td>${user.department.toUpperCase() || "---"}</td>
//             <td>${user.course || "---"}</td>
//             <td>${user.major || "---"}</td>
//             <td>${user.strand || "---"}</td>
//             <td>${user.grade || "---"}</td>` :
//             user.patron.toLowerCase() === "faculty" ? `<td>${user.collegeSelect.toUpperCase() || "---"}</td>` :
//                 user.patron.toLowerCase() === "admin" ? `<td>${user.campusDept || "---"}</td>` :
//                     `<td>${user.schoolSelect ? user.schoolSelect.toUpperCase() : (user.specifySchool ? user.specifySchool.toUpperCase() : "---")}</td>`;

//         rowHTML += `
//             <td>${user.schoolYear || "---"}</td>
//             <td>${capitalizeSemester(user.semester) || "---"}</td>
//             <td>${user.validUntil || "---"}</td>
//         `;

//         row.innerHTML = rowHTML;
//         document.getElementById(tables[user.patron.toLowerCase()]).appendChild(row);
//     });
// }

// function exportToExcel(data, month) {
//     const wb = XLSX.utils.book_new();
//     const wsData = [["Library ID", "Name", "Patron Type", "Latest Timestamp", "Department"]];
//     data.forEach(user => wsData.push([user.libraryIdNo, `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : ""}`, capitalizeWords(user.patron), user.timestamps.length > 0 ? formatDate(user.timestamps[0]) : "---", user.department || "---"]));
//     XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), "User Data");
//     XLSX.writeFile(wb, `user_data_${month}.xlsx`);
// }

// function sortTable(tableId, columnIndex) {
//     const table = document.getElementById(tableId);
//     const tbody = table.querySelector("tbody");
//     const rows = Array.from(tbody.querySelectorAll("tr"));
//     const ascending = table.dataset.sortOrder !== "asc";

//     rows.sort((a, b) => ascending ? a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText) : b.cells[columnIndex].innerText.localeCompare(a.cells[columnIndex].innerText));

//     table.dataset.sortOrder = ascending ? "asc" : "desc";
//     tbody.innerHTML = "";
//     rows.forEach(row => tbody.appendChild(row));
// }

// function toggleTable(type) {
//     ["student", "faculty", "admin", "visitor"].forEach(id => document.getElementById(id + "-table-container").style.display = "none");
//     document.getElementById(type + "-table-container").style.display = "block";
// }

// function showAllTables() {
//     ["student", "faculty", "admin", "visitor"].forEach(id => document.getElementById(id + "-table-container").style.display = "block");
// }

// function searchTables() {
//     const input = document.getElementById("search-input").value.toLowerCase();
//     let tableFound = false;

//     ["student", "faculty", "admin", "visitor"].forEach(table => {
//         const tbody = document.getElementById(table + "-body");
//         const rows = tbody.getElementsByTagName("tr");
//         let tableHasMatches = false;

//         Array.from(rows).forEach(row => {
//             const cells = row.getElementsByTagName("td");
//             let match = Array.from(cells).some(cell => cell.innerText.toLowerCase().includes(input));
//             row.style.display = match ? "" : "none";
//             tableHasMatches ||= match;
//         });

//         document.getElementById(table + "-table-container").style.display = tableHasMatches ? "block" : "none";
//         tableFound ||= tableHasMatches;
//     });
//     if (!tableFound) showAllTables();
// }

// function formatDate(timestamp) {
//     return timestamp ? new Date(timestamp).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "2-digit" }) : "---";
// }

// function capitalizeWords(str) { return str.replace(/\b\w/g, char => char.toUpperCase()); }
// function capitalizeSemester(semester) { return semester ? semester.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase()) : "N/A"; }

// can you include the search highlight yellow
