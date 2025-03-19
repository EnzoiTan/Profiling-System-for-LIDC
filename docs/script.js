let currentPage = { student: 1, faculty: 1, admin: 1, visitor: 1 };
const rowsPerPage = 10;
let usersData = { student: [], faculty: [], admin: [], visitor: [] };

document.addEventListener("DOMContentLoaded", function () {
    fetchAndUpdateUsers();
    // setInterval(fetchAndUpdateUsers, 5000);
});

function fetchAndUpdateUsers() {
    fetch("fetch_users.php")
        .then(response => response.json())
        .then(data => {
            if (JSON.stringify(usersData) !== JSON.stringify(data)) {
                categorizeUsers(data);
                updateTableAndPagination();
            }
        })
        .catch(error => console.error("Error fetching data:", error));
}

function categorizeUsers(users) {
    usersData = { student: [], faculty: [], admin: [], visitor: [] };
    users.forEach(user => {
        const type = user.patron.toLowerCase(); // Ensure `patron` field exists and is lowercase
        if (usersData[type]) {
            usersData[type].push(user);
        }
    });
}

function updateTableAndPagination() {
    ["student", "faculty", "admin", "visitor"].forEach(type => {
        displayUsers(usersData[type], type);
        createPaginationControls(usersData[type], type);
        updateEntryCount(usersData[type].length, type);
    });
}

function displayUsers(users, type) {
    const tableBody = document.getElementById(`${type}-body`);
    tableBody.innerHTML = "";

    const selectedMonth = document.getElementById("sortMonth").value;

    // Filter users based on selected month
    let filteredUsers = users.filter(user => {
        if (selectedMonth === "all") return true;
        const timestampKeys = Object.keys(user).filter(key => key.startsWith('timestamps_'));

        return timestampKeys.some(key => {
            if (user[key]) {
                try {
                    const data = Array.isArray(user[key]) ? user[key] : JSON.parse(user[key]);
                    return data.some(ts => new Date(ts).toISOString().startsWith(`2025-${selectedMonth}`));
                } catch (error) {
                    if (typeof user[key] === 'string') {
                        return user[key].split(",").some(ts => new Date(ts.trim()).toISOString().startsWith(`2025-${selectedMonth}`));
                    }
                }
            }
            return false;
        });
    });

    // Show "No entries available" if no data is found
    if (filteredUsers.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="15" class="text-center">No entries available.</td>`;
        tableBody.appendChild(noDataRow);
        return;
    }

    let start = (currentPage[type] - 1) * rowsPerPage;
    let end = Math.min(start + rowsPerPage, filteredUsers.length);
    let paginatedUsers = filteredUsers.slice(start, end);

    paginatedUsers.forEach((user, index) => {
        const row = document.createElement("tr");
        const formattedMiddleInitial = user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : "";
        const fullName = `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${formattedMiddleInitial}`;

        let timestampsArray = [];
        const timestampKeys = Object.keys(user).filter(key => key.startsWith('timestamps_'));

        timestampKeys.forEach(key => {
            if (user[key]) {
                try {
                    const data = Array.isArray(user[key]) ? user[key] : JSON.parse(user[key]);
                    if (Array.isArray(data)) {
                        timestampsArray.push(...data);
                    }
                } catch (error) {
                    if (typeof user[key] === 'string') {
                        timestampsArray.push(...user[key].split(",").map(ts => ts.trim()));
                    }
                }
            }
        });

        timestampsArray.sort((a, b) => new Date(b) - new Date(a));
        const latestTimestamp = timestampsArray.length > 0 ? formatDate(timestampsArray[0]) : "---";

        // Calculate times entered based on the timestamps
        const timesEntered = timestampsArray.length; // Count of timestamps

        let rowHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${start + index + 1}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${fullName}</td>
            <td>${timesEntered || "---"}</td> <!-- Update this line -->
            <td>${capitalizeWords(user.gender) || "---"}</td>
        `;

        if (type === "student") {
            rowHTML += `
                <td>${user.department.toUpperCase() || "---"}</td>
                <td>${user.course || "---"}</td>
                <td>${user.major || "---"}</td>
                <td>${user.strand || "---"}</td>
                <td>${user.grade || "---"}</td>
            `;
        } else if (type === "faculty") {
            rowHTML += `<td>${user.collegeSelect.toUpperCase() || "---"}</td>`;
        } else if (type === "admin") {
            rowHTML += `<td>${user.campusDept || "---"}</td>`;
        } else if (type === "visitor") {
            rowHTML += `<td>${user.schoolSelect?.toUpperCase() || user.specifySchool?.toUpperCase() || "---"}</td>`;
        }

        rowHTML += `
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
        `;

        row.innerHTML = rowHTML;
        tableBody.appendChild(row);

        // Add event listener to open the modal
        row.addEventListener("click", () => {
            openTimestampModal(user.libraryIdNo, fullName);
        });
    });
}

// function updatePaginationText(totalEntries, type, users) {
//     const paginationTextContainer = document.getElementById(`${type}-pagination-text`);
//     let start = (currentPage[type] - 1) * rowsPerPage + 1;
//     let end = Math.min(start + rowsPerPage - 1, totalEntries);

//     const selectedMonth = document.getElementById("sortMonth").value;
//     const monthlyPatronCount = {};

//     if (users) {
//         users.forEach(user => {
//             const timestampKeys = Object.keys(user).filter(key => key.startsWith('timestamps_'));

//             const hasEntryInMonth = timestampKeys.some(key => {
//                 if (user[key]) {
//                     try {
//                         const data = Array.isArray(user[key]) ? user[key] : JSON.parse(user[key]);
//                         return data.some(ts => {
//                             const entryDate = new Date(ts);
//                             return selectedMonth === "all" || entryDate.toISOString().startsWith(`2025-${selectedMonth}`);
//                         });
//                     } catch (error) {
//                         if (typeof user[key] === 'string') {
//                             return user[key].split(",").some(ts => {
//                                 const entryDate = new Date(ts.trim());
//                                 return selectedMonth === "all" || entryDate.toISOString().startsWith(`2025-${selectedMonth}`);
//                             });
//                         }
//                     }
//                 }
//                 return false;
//             });

//             if (hasEntryInMonth) {
//                 const monthYear = selectedMonth === "all"
//                     ? "All Months"
//                     : new Date(`2025-${selectedMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });

//                 monthlyPatronCount[monthYear] = (monthlyPatronCount[monthYear] || 0) + 1;
//             }
//         });
//     }

//     const monthlyCountsText = Object.entries(monthlyPatronCount)
//         .map(([month, count]) => `${month}: ${count}`)
//         .join(" | ");

//     const noDataMessage = Object.keys(monthlyPatronCount).length === 0 ? "No data for selected month" : "";

//     if (totalEntries === 0) {
//         paginationTextContainer.innerHTML = "No entries available.";
//     } else {
//         paginationTextContainer.innerHTML = `Showing ${start} to ${end} of ${totalEntries} entries
//             <br>
//             (${monthlyCountsText || noDataMessage})
//         `;
//     }
// }


function createPaginationControls(users, type) {
    const paginationContainer = document.getElementById(`${type}-pagination-controls`);
    paginationContainer.innerHTML = "";

    let totalPages = Math.ceil(users.length / rowsPerPage);
    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.classList.add("pagination-button");
    prevButton.disabled = currentPage[type] === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage[type] > 1) {
            currentPage[type]--;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("pagination-button");
        if (i === currentPage[type]) pageButton.classList.add("active");
        pageButton.addEventListener("click", () => {
            currentPage[type] = i;
            displayUsers(users, type);
            createPaginationControls(users, type);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.classList.add("pagination-button");
    nextButton.disabled = currentPage[type] === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage[type] < totalPages) {
            currentPage[type]++;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function updateEntryCount(count, type) {
    let tableTitle = document.querySelector(`#${type}-table-container .table-title h2`);
    if (tableTitle) {
        tableTitle.innerHTML = `${capitalizeWords(type)} <b>Details</b>`;
    }
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function capitalizeSemester(semester) {
    return semester ? semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase() : "---";
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return isNaN(date) ? "---" : date.toLocaleString();
}

function openTimestampModal(id, name) {
    alert(`Viewing timestamps for: ${name} (ID: ${id})`);
}


function openTimestampModal(libraryIdNo, fullName) {
    document.getElementById("modal-user-name").textContent = fullName;

    fetch(`fetch_timestamps.php?libraryIdNo=${libraryIdNo}`)
        .then(response => response.text())
        .then(data => {
            console.log("Raw response:", data);

            try {
                const jsonData = JSON.parse(data);

                // Gather all timestamps into one array
                const allTimestamps = [];
                Object.keys(jsonData).forEach(key => {
                    if (key.startsWith("timestamps_") && Array.isArray(jsonData[key])) {
                        allTimestamps.push(...jsonData[key]);
                    }
                });

                displayTimestamps(allTimestamps);
                document.getElementById("timestamp-modal").style.display = "block";
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
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
    const input = document.getElementById("search-input").value.toLowerCase();
    const tables = ["student", "faculty", "admin", "visitor"];
    let tableFound = false;

    if (input === "") {
        // If the search bar is cleared, reapply the last filter state
        tables.forEach((table) => {
            const tbody = document.getElementById(table + "-body");
            const rows = tbody.getElementsByTagName("tr");

            // Reset all rows and remove any highlights
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j]) {
                        // Remove any <span> tags and reset the content
                        cells[j].innerHTML = cells[j].textContent || cells[j].innerText;
                    }
                }
                rows[i].style.display = ""; // Show all rows
            }
        });

        handleSortChange(); // Reapply the last filter state
        return;
    }

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
            document.getElementById(table + "-table-container").style.display = "block";
        } else {
            document.getElementById(table + "-table-container").style.display = "none";
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

function displayTimestamps(timestamps) {
    const timestampBody = document.getElementById("timestamp-body");
    timestampBody.innerHTML = "";

    if (!Array.isArray(timestamps)) {
        console.error("Invalid timestamps data:", timestamps);
        return;
    }

    timestamps.forEach((timestamp, index) => {
        let dateObj = new Date(timestamp);

        if (isNaN(dateObj.getTime())) {
            console.error("Invalid date:", timestamp);
            return;
        }

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

function handleSortChange() {
    const selectedType = document.getElementById("sortDropdown").value.toLowerCase();
    const selectedMonth = document.getElementById("sortMonth").value;

    const tables = {
        student: document.getElementById("student-table-container"),
        faculty: document.getElementById("faculty-table-container"),
        admin: document.getElementById("admin-table-container"),
        visitor: document.getElementById("visitor-table-container")
    };

    let hasVisibleRows = false;

    Object.keys(tables).forEach(type => {
        const tableContainer = tables[type];
        const rows = tableContainer.querySelectorAll("tbody tr");
        const tbody = tableContainer.querySelector("tbody");
        let showTable = false;

        // Reset "No data yet" message
        const noDataRow = tbody.querySelector(".no-data-row");
        if (noDataRow) noDataRow.remove();

        rows.forEach(row => {
            const patronType = type; // Use the current table type
            const dateRegistered = row.querySelector("td:nth-child(3)")?.textContent.trim(); // Date Registered column

            let rowMonth = "";
            if (dateRegistered) {
                const dateObj = new Date(dateRegistered);
                if (!isNaN(dateObj.getTime())) {
                    rowMonth = ("0" + (dateObj.getMonth() + 1)).slice(-2); // Get month as 2-digit
                }
            }

            const monthMatch = selectedMonth === "all" || rowMonth === selectedMonth;
            const typeMatch = selectedType === "all" || selectedType === patronType;

            if (monthMatch && typeMatch) {
                row.style.display = ""; // Show row
                showTable = true;
                hasVisibleRows = true;
            } else {
                row.style.display = "none"; // Hide row
            }
        });

        // Show or hide the table based on whether it has visible rows
        tableContainer.style.display = showTable ? "block" : "none";

        // Add "No data yet" message if no rows are visible
        // if (!showTable) {
        //     const noDataMessage = document.createElement("tr");
        //     noDataMessage.classList.add("no-data-row");
        //     noDataMessage.innerHTML = `<td colspan="15" class="text-center">No data available for the selected filters.</td>`;
        //     tbody.appendChild(noDataMessage);
        // }
    });

    // If no rows are visible in any table, show all tables with "No data yet" messages
    if (!hasVisibleRows) {
        Object.values(tables).forEach(table => {
            table.style.display = "block";
            const tbody = table.querySelector("tbody");
            const noDataMessage = document.createElement("tr");
            noDataMessage.classList.add("no-data-row");
            noDataMessage.innerHTML = `<td colspan="15" class="text-center">No data available for the selected filters.</td>`;
            tbody.appendChild(noDataMessage);
        });
    }
}

function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
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

function exportData() {
    const monthPicker = document.getElementById("month-picker").value;
    const patronPicker = document.getElementById("patron-picker").value;

    const selectedMonth = monthPicker.split("-")[1];
    const selectedYear = monthPicker.split("-")[0];

    const tables = {
        student: {
            title: "Student Details",
            headers: ["No.", "Name", "Department", "Course", "Major", "Grade", "Strand", "Gender", "Times Entered"]
        },
        faculty: {
            title: "Faculty Details",
            headers: ["No.", "Name", "College/Department", "Gender", "Times Entered"]
        },
        admin: {
            title: "Admin Details",
            headers: ["No.", "Name", "Office", "Gender", "Times Entered"]
        },
        visitor: {
            title: "Visitor Details",
            headers: ["No.", "Name", "School", "Gender", "Times Entered"]
        }
    };

    const table = tables[patronPicker];
    if (!table) {
        console.error("Export is not configured for the selected patron type.");
        return;
    }

    const tbody = document.getElementById(`${patronPicker}-body`);
    const rows = tbody.getElementsByTagName("tr");

    const exportData = [];
    if (rows.length > 0) {
        exportData.push(table.headers);
    }

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        const dateRegistered = cells[2]?.textContent.trim();

        if (dateRegistered) {
            const dateObj = new Date(dateRegistered);
            const rowMonth = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const rowYear = dateObj.getFullYear().toString();

            if (rowMonth === selectedMonth && rowYear === selectedYear) {
                let rowData = [];

                if (patronPicker === "student") {
                    rowData = [
                        i + 1,                                // No.
                        cells[4]?.textContent.trim(),         // Name
                        cells[7]?.textContent.trim(),         // Department
                        cells[8]?.textContent.trim(),         // Course
                        cells[9]?.textContent.trim(),         // Major
                        cells[11]?.textContent.trim() || "---",// Grade
                        cells[10]?.textContent.trim() || "---",// Strand
                        cells[6]?.textContent.trim(),         // Gender
                        cells[5]?.textContent.trim()          // Times Entered
                    ];
                } else {
                    rowData = [
                        i + 1,                               // No.
                        cells[4]?.textContent.trim(),        // Name
                        cells[7]?.textContent.trim(),        // Department / College / Office / School
                        cells[6]?.textContent.trim(),        // Gender
                        cells[5]?.textContent.trim()         // Times Entered
                    ];
                }

                exportData.push(rowData);
            }
        }
    }

    if (exportData.length === 0) {
        console.warn("No data available for the selected month and patron type.");
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet(exportData);

    const columnWidths = exportData[0].map((_, colIndex) => {
        const maxLength = exportData.reduce((max, row) => {
            const cell = row[colIndex] || "";
            return Math.max(max, cell.toString().length);
        }, 0);
        return { wch: maxLength + 2 };
    });
    ws["!cols"] = columnWidths;

    ws["!cols"][0] = { wch: 5, alignment: { horizontal: "center" } }; // Center-align "No."
    ws["!cols"][8] = { wch: 15, alignment: { horizontal: "center" } }; // Center-align "Times Entered"

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exported Data");

    const fileName = `${table.title.replace(" ", "_")}_${selectedYear}-${selectedMonth}.xlsx`;

    // Secure download method to prevent "Insecure Download Blocked" warning
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}
