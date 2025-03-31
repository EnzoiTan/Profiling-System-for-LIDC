let currentPage = { student: 1, faculty: 1, admin: 1, visitor: 1 };
const rowsPerPage = 10;
let usersData = { student: [], faculty: [], admin: [], visitor: [] };

document.addEventListener("DOMContentLoaded", function () {
    fetchAndUpdateUsers();
    setInterval(fetchAndUpdateUsers, 5000); // Fetch new data every 5 seconds
});

function fetchAndUpdateUsers() {
    const currentSearch = document.getElementById("search-input").value.toLowerCase(); // Capture current search term
    const currentSort = getCurrentSortState(); // Capture current sort state

    fetch("fetch_users.php")
        .then(response => response.json())
        .then(data => {
            if (JSON.stringify(usersData) !== JSON.stringify(data)) {
                categorizeUsers(data);
                updateTableAndPagination();

                applySearchState(currentSearch); // Reapply search term
                applySortState(currentSort); // Reapply sort state
            }
        })
        .catch(error => console.error("Error fetching data:", error));
}

function getCurrentSortState() {
    const sortableHeaders = document.querySelectorAll("th[onclick]");
    let sortState = null;

    sortableHeaders.forEach((header, index) => {
        const sortIcon = header.querySelector(".sort-icon");
        if (sortIcon && sortIcon.classList.contains("asc")) {
            sortState = { columnIndex: index, order: "asc" };
        } else if (sortIcon && sortIcon.classList.contains("desc")) {
            sortState = { columnIndex: index, order: "desc" };
        }
    });

    return sortState;
}

function applySortState(sortState) {
    if (sortState) {
        sortTable("student-table", sortState.columnIndex, sortState.order);
    }
}

function applySearchState(searchTerm) {
    if (searchTerm) {
        document.getElementById("search-input").value = searchTerm;
        searchTables(); // Reapply the search
    }
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

    // Show "No entries available" if no data is found
    if (users.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="15" class="text-center">No entries available.</td>`;
        tableBody.appendChild(noDataRow);
        return;
    }

    let start = (currentPage[type] - 1) * rowsPerPage;
    let end = Math.min(start + rowsPerPage, users.length);
    let paginatedUsers = users.slice(start, end);

    paginatedUsers.forEach((user, index) => {
        const row = document.createElement("tr");
        const formattedMiddleInitial = user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : "";
        const fullName = `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${formattedMiddleInitial}`;

        let timestampsArray = [];
        const timestampKeys = Object.keys(user).filter(key => key.startsWith("timestamps_"));

        timestampKeys.forEach(key => {
            if (user[key]) {
                try {
                    const data = Array.isArray(user[key]) ? user[key] : JSON.parse(user[key]);
                    if (Array.isArray(data)) {
                        timestampsArray.push(...combineTimestamps(data)); // Combine timestamps
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

        // Calculate times entered based on the combined timestamps
        const timesEntered = timestampsArray.length; // Adjusted count based on combined timestamps

        let rowHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${start + index + 1}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${fullName}</td>
            <td>${timesEntered || "---"}</td>
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

/**
 * Combine timestamps that are within a 1 or 2-minute gap.
 * @param {Array} timestamps
 * @return {Array}
 */
function combineTimestamps(timestamps) {
    // Sort timestamps in ascending order
    timestamps.sort((a, b) => new Date(a) - new Date(b));
    const combined = [];
    let lastTimestamp = null;

    timestamps.forEach(timestamp => {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
            return;
        }

        // Calculate the difference in minutes
        const diff = (new Date(timestamp) - new Date(lastTimestamp)) / (1000 * 60);

        // If the difference is less than or equal to 5 minutes, keep the latest timestamp
        if (diff <= 5) {
            lastTimestamp = timestamp; // Update the last timestamp
        } else {
            combined.push(lastTimestamp); // Add the last timestamp to the combined array
            lastTimestamp = timestamp; // Update the last timestamp
        }
    });

    // Add the last timestamp to the combined array
    if (lastTimestamp) {
        combined.push(lastTimestamp);
    }

    return combined;
}

function sendIDCardToServer(dataURL, libraryIdNo) {
    fetch('download_image.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: dataURL, libraryIdNo }),
    })
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${libraryIdNo}_id_card.png`;
            link.click();
        })
        .catch(err => console.error('Error sending ID card to server:', err));
}

function createPaginationControls(users, type) {
    const paginationContainer = document.getElementById(`${type}-pagination-controls`);
    paginationContainer.innerHTML = "";

    let totalPages = Math.ceil(users.length / rowsPerPage);
    if (totalPages <= 1) return;

    // Create Previous Page button
    const prevPageButton = document.createElement("button");
    prevPageButton.innerHTML = "&#8592;"; // Left arrow
    prevPageButton.classList.add("pagination-button");
    if (currentPage[type] === 1) prevPageButton.classList.add("disabled");
    prevPageButton.addEventListener("click", () => {
        if (currentPage[type] > 1) {
            currentPage[type]--;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(prevPageButton);

    // Create First Page button
    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "1";
    firstPageButton.classList.add("pagination-button");
    if (currentPage[type] === 1) firstPageButton.classList.add("active");
    firstPageButton.addEventListener("click", () => {
        if (currentPage[type] !== 1) {
            currentPage[type] = 1;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(firstPageButton);

    // Show current page info
    const pageInfo = document.createElement("span");
    pageInfo.textContent = `${currentPage[type]} of ${totalPages}`;
    pageInfo.classList.add("pagination-info");
    paginationContainer.appendChild(pageInfo);

    // Create Last Page button
    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = `${totalPages}`;
    lastPageButton.classList.add("pagination-button");
    if (currentPage[type] === totalPages) lastPageButton.classList.add("active");
    lastPageButton.addEventListener("click", () => {
        if (currentPage[type] !== totalPages) {
            currentPage[type] = totalPages;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(lastPageButton);

    // Create Next Page button
    const nextPageButton = document.createElement("button");
    nextPageButton.innerHTML = "&#8594;"; // Right arrow
    nextPageButton.classList.add("pagination-button");
    if (currentPage[type] === totalPages) nextPageButton.classList.add("disabled");
    nextPageButton.addEventListener("click", () => {
        if (currentPage[type] < totalPages) {
            currentPage[type]++;
            displayUsers(users, type);
            createPaginationControls(users, type);
        }
    });
    paginationContainer.appendChild(nextPageButton);
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

function sortTable(tableId, columnIndex, order = null) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const ascending = order ? order === "asc" : table.dataset.sortOrder !== "asc";

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].innerText.trim();
        const cellB = rowB.cells[columnIndex].innerText.trim();
        return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    table.dataset.sortOrder = ascending ? "asc" : "desc";
    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    // Update sorting icon
    const sortIcon = table.querySelector(".sort-icon");
    if (sortIcon) {
        sortIcon.className = "sort-icon";
        sortIcon.classList.add(ascending ? "asc" : "desc");
    }
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

let lastState = {
    currentPage: { ...currentPage }, // Save the current page for each table
    sortState: getCurrentSortState(), // Save the current sort state
};

function searchTables() {
    const input = document.getElementById("search-input").value.toLowerCase();
    const tables = ["student", "faculty", "admin", "visitor"];
    let tableFound = false;

    if (input === "") {
        // If the search bar is cleared, reset to the original dataset
        tables.forEach((type) => {
            displayUsers(usersData[type], type); // Display all users for this type
            createPaginationControls(usersData[type], type); // Reset pagination
        });

        // Restore the last pagination and sort state
        currentPage = { ...lastState.currentPage };
        applySortState(lastState.sortState);

        // Display the last viewed page for each table
        tables.forEach((type) => {
            displayUsers(usersData[type], type);
            createPaginationControls(usersData[type], type);
        });

        removeHighlights(); // Remove highlights when search is cleared
        return;
    }

    // Save the current state before searching
    lastState = {
        currentPage: { ...currentPage },
        sortState: getCurrentSortState(),
    };

    tables.forEach((type) => {
        const filteredUsers = usersData[type].filter((user) => {
            // Check if any field in the user object matches the search term
            return Object.values(user).some((value) => {
                if (typeof value === "string") {
                    return value.toLowerCase().includes(input);
                }
                return false;
            });
        });

        if (filteredUsers.length > 0) {
            tableFound = true;
            currentPage[type] = 1; // Reset to the first page for the filtered results
            displayUsers(filteredUsers, type); // Display filtered users
            createPaginationControls(filteredUsers, type); // Update pagination for filtered results
            highlightMatches(type, input); // Highlight matches in the table
        } else {
            // If no matches, clear the table and show "No entries available"
            const tableBody = document.getElementById(`${type}-body`);
            tableBody.innerHTML = `<tr><td colspan="15" class="text-center">No entries available.</td></tr>`;
            document.getElementById(`${type}-pagination-controls`).innerHTML = ""; // Clear pagination
        }
    });

    if (!tableFound) {
        console.warn("No matches found for the search term.");
    }
}

function highlightMatches(type, searchTerm) {
    const tableBody = document.getElementById(`${type}-body`);
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell) => {
            const text = cell.textContent || "";
            if (text.toLowerCase().includes(searchTerm)) {
                const regex = new RegExp(`(${searchTerm})`, "gi");
                cell.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
            } else {
                cell.innerHTML = text; // Reset cell content if no match
            }
        });
    });
}

function removeHighlights() {
    const highlightedElements = document.querySelectorAll(".highlight");
    highlightedElements.forEach((element) => {
        element.classList.remove("highlight");
        element.outerHTML = element.textContent; // Replace the highlighted element with plain text
    });
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

    const allUsers = usersData[patronPicker]; // Get the entire dataset for the selected patron type
    const exportData = [];

    // Add headers
    exportData.push(table.headers);

    let rowCounter = 1; // Start sequential numbering

    // Filter and process the entire dataset
    allUsers.forEach((user) => {
        const timestampsArray = [];
        const timestampKeys = Object.keys(user).filter(key => key.startsWith("timestamps_"));

        timestampKeys.forEach(key => {
            if (user[key]) {
                try {
                    const data = Array.isArray(user[key]) ? user[key] : JSON.parse(user[key]);
                    if (Array.isArray(data)) {
                        timestampsArray.push(...data);
                    }
                } catch (error) {
                    if (typeof user[key] === "string") {
                        timestampsArray.push(...user[key].split(",").map(ts => ts.trim()));
                    }
                }
            }
        });

        timestampsArray.sort((a, b) => new Date(b) - new Date(a));
        const latestTimestamp = timestampsArray.length > 0 ? formatDate(timestampsArray[0]) : "---";

        const rowMonth = latestTimestamp ? ("0" + (new Date(latestTimestamp).getMonth() + 1)).slice(-2) : null;
        const rowYear = latestTimestamp ? new Date(latestTimestamp).getFullYear().toString() : null;

        // Check if the row matches the selected month and year
        if (selectedMonth === "all" || (rowMonth === selectedMonth && rowYear === selectedYear)) {
            let rowData = [];

            if (patronPicker === "student") {
                rowData = [
                    rowCounter++, // Sequential numbering
                    `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : ""}`, // Name
                    user.department?.toUpperCase() || "---", // Department
                    user.course || "---", // Course
                    user.major || "---", // Major
                    user.grade || "---", // Grade
                    user.strand || "---", // Strand
                    capitalizeWords(user.gender) || "---", // Gender
                    timestampsArray.length // Times Entered
                ];
            } else {
                rowData = [
                    rowCounter++, // Sequential numbering
                    `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : ""}`, // Name
                    user.collegeSelect?.toUpperCase() || user.campusDept || user.schoolSelect?.toUpperCase() || "---", // Department/College/Office/School
                    capitalizeWords(user.gender) || "---", // Gender
                    timestampsArray.length // Times Entered
                ];
            }

            exportData.push(rowData);
        }
    });

    if (exportData.length === 1) {
        console.warn("No data available for the selected month and patron type.");
        return;
    }

    // Generate Excel file using SheetJS (xlsx library)
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Dynamically calculate column widths based on the content
    const columnWidths = exportData[0].map((_, colIndex) => {
        const maxLength = exportData.reduce((max, row) => {
            const cell = row[colIndex] || "";
            return Math.max(max, cell.toString().length);
        }, 0);
        return { wch: maxLength + 2 };
    });
    ws["!cols"] = columnWidths;

    // Apply center alignment for "No." and "Times Entered" columns
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let row = range.s.r; row <= range.e.r; row++) {
        ["A", "I"].forEach((col) => { // "A" is No., "I" is Times Entered
            const cellRef = col + (row + 1);
            if (ws[cellRef]) {
                ws[cellRef].s = { alignment: { horizontal: "center" } };
            }
        });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exported Data");

    const fileName = `${table.title.replace(" ", "_")}_${selectedYear}-${selectedMonth}.xlsx`;

    // Secure download method to prevent "Insecure Download Blocked" warning
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

