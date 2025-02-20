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

    studentBody.innerHTML = "";
    facultyBody.innerHTML = "";
    adminBody.innerHTML = "";
    visitorBody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        const formattedMiddleInitial = user.middleInitial ? user.middleInitial.charAt(0).toUpperCase() + "." : "";
        const fullName = `${capitalizeWords(user.lastName)}, ${capitalizeWords(user.firstName)} ${formattedMiddleInitial}`;

        let timestampsArray = [];

        try {
            if (Array.isArray(user.timestamps)) {
                timestampsArray = user.timestamps;
            } else if (typeof user.timestamps === "string") {
                timestampsArray = JSON.parse(user.timestamps);
            }
        } catch (error) {
            console.warn("Invalid JSON format, attempting to parse manually:", user.timestamps);
            timestampsArray = user.timestamps.split(",").map(ts => ts.trim());
        }

        let latestTimestamp = "---"; // Default if no timestamps exist
        if (timestampsArray.length > 0) {
            latestTimestamp = formatDate(timestampsArray[0]); // Convert first timestamp to readable format
        }

        // Make sure to use latestTimestamp inside the row HTML
        row.innerHTML = `
        <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
        <td>${user.libraryIdNo}</td>
        <td>${latestTimestamp}</td>  <!-- FIXED: Now using the correctly defined latestTimestamp -->
        <td>${user.libraryIdNo}</td>
        <td>${capitalizeWords(user.patron)}</td>
        <td>${fullName}</td>
        <td>${user.timesEntered || "---"}</td>
        <td>${capitalizeWords(user.gender) || "---"}</td>
        <td>${user.department ? user.department.toUpperCase() : "---"}</td>
        <td>${user.course || "---"}</td>
        <td>${user.major || "---"}</td>
        <td>${user.strand || "---"}</td>
        <td>${user.grade || "---"}</td>
        <td>${user.schoolYear || "---"}</td>
        <td>${capitalizeSemester(user.semester) || "---"}</td>
        <td>${user.validUntil || "---"}</td>
    `;

        if (user.patron.toLowerCase() === "student") {
            row.innerHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${user.libraryIdNo}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${capitalizeSemester(user.patron)}</td>
            <td>${fullName}</td>
            <td>${user.timesEntered || "---"}</td>
            <td>${capitalizeSemester(user.gender) || "---"}</td>
            <td>${user.department.toUpperCase() || "---"}</td>
            <td>${user.course || "---"}</td>
            <td>${user.major || "---"}</td>
            <td>${user.strand || "---"}</td>
            <td>${user.grade || "---"}</td>
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
            `;
            studentBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "faculty") {
            row.innerHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${user.libraryIdNo}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${capitalizeSemester(user.patron)}</td>
            <td>${fullName}</td>
            <td>${user.timesEntered || "---"}</td>
            <td>${capitalizeSemester(user.gender) || "---"}</td>
            <td>${user.collegeSelect.toUpperCase() || "---"}</td>
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
            `;
            facultyBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "admin") {
            row.innerHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${user.libraryIdNo}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${capitalizeSemester(user.patron)}</td>
            <td>${fullName}</td>
            <td>${user.timesEntered || "---"}</td>
            <td>${capitalizeSemester(user.gender) || "---"}</td>
            <td>${user.campusDept || "---"}</td>
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
            `;
            adminBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "visitor") {
            row.innerHTML = `
            <td><a href="${user.qrCodeURL}" target="_blank">View</a></td>
            <td>${user.libraryIdNo}</td>
            <td>${latestTimestamp}</td>
            <td>${user.libraryIdNo}</td>
            <td>${capitalizeSemester(user.patron)}</td>
            <td>${fullName}</td>
            <td>${user.timesEntered || "---"}</td>
            <td>${capitalizeSemester(user.gender || "---")}</td>
            <td>${user.schoolSelect ? user.schoolSelect.toUpperCase() : (user.specifySchool ? user.specifySchool.toUpperCase() : "---")}</td>
            <td>${user.schoolYear || "---"}</td>
            <td>${capitalizeSemester(user.semester) || "---"}</td>
            <td>${user.validUntil || "---"}</td>
            `;
            visitorBody.appendChild(row);
        }

        // Add click event to open modal with timestamps
        row.addEventListener("click", () => {
            openTimestampModal(user.libraryIdNo, fullName);
        });

        if (user.patron.toLowerCase() === "student") {
            studentBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "faculty") {
            facultyBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "admin") {
            adminBody.appendChild(row);
        } else if (user.patron.toLowerCase() === "visitor") {
            visitorBody.appendChild(row);
        }
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
    })
}

// Helper functions for formatting
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function capitalizeSemester(semester) {
    return semester ? semester.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";
}