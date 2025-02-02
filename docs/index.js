import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKlyckfCUI_Ooc8XiSziJ-iaKR1cbw85I",
  authDomain: "lcc-lidc.firebaseapp.com",
  databaseURL: "https://lcc-lidc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lcc-lidc",
  storageBucket: "lcc-lidc.firebasestorage.app",
  messagingSenderId: "934783227135",
  appId: "1:934783227135:web:4b85df00c1186c8d5fe8ca",
  measurementId: "G-S3X4YSV65S"
};

let sortDirection = 'asc'; // To track the sorting direction

// Function to sort the table based on the clicked column
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  const rows = Array.from(table.rows).slice(1); // Exclude the header row
  const isAscending = sortDirection === 'asc';

  // Sort rows based on the column index and direction
  rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex].innerText.trim();
    const cellB = rowB.cells[columnIndex].innerText.trim();

    const valueA = isNaN(cellA) ? cellA : parseFloat(cellA);
    const valueB = isNaN(cellB) ? cellB : parseFloat(cellB);

    if (valueA < valueB) {
      return isAscending ? -1 : 1;
    } else if (valueA > valueB) {
      return isAscending ? 1 : -1;
    } else {
      return 0;
    }
  });

  // Reinsert sorted rows back into the table
  rows.forEach(row => table.appendChild(row));

  // Update sorting direction for the next click
  sortDirection = isAscending ? 'desc' : 'asc';

  // Update the sort icon
  updateSortIcons(tableId, columnIndex);
}

// Update sort icon based on the sorting direction
function updateSortIcons(tableId, columnIndex) {
  const headers = document.querySelectorAll(`#${tableId} th`);
  headers.forEach((header, index) => {
    const sortIcon = header.querySelector('.sort-icon');
    if (index === columnIndex) {
      sortIcon.classList.remove('asc', 'desc');
      sortIcon.classList.add(sortDirection);
    } else {
      sortIcon.classList.remove('asc', 'desc');
    }
  });
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions for formatting data
function capitalize(text) {
  return text
    ? text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : "N/A";
}

function formatDate(timestamp) {
  return timestamp
    ? new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "None";
}

function formatMiddleInitial(middleInitial) {
  return middleInitial ? `${middleInitial.charAt(0).toUpperCase()}.` : "";
}

function capitalizeSemester(semester) {
  return semester
    ? semester.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "N/A";
}

// Function to fetch and display user data in real-time
function fetchUserData() {
  const adminBody = document.getElementById("admin-body");
  const facultyBody = document.getElementById("faculty-body");
  const visitorBody = document.getElementById("visitor-body");
  const studentBody = document.getElementById("student-body");

  const modal = document.getElementById("timestamp-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const timestampBody = document.getElementById("timestamp-body");
  const modalUserName = document.getElementById("modal-user-name");

  // Close the modal when the close button is clicked
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside the modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Listen for real-time updates
  const usersRef = collection(db, "LIDC_Users");
  onSnapshot(usersRef, (snapshot) => {
    // Clear existing data in all tables
    adminBody.innerHTML = "";
    facultyBody.innerHTML = "";
    visitorBody.innerHTML = "";
    studentBody.innerHTML = "";

    let adminCount = 1;
    let facultyCount = 1;
    let visitorCount = 1;
    let studentCount = 1;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const patronType = data.patron.toLowerCase();

      const row = document.createElement("tr");

      const formattedMiddleInitial = formatMiddleInitial(data.middleInitial);

      if (patronType === "admin") {
        row.innerHTML = `
          <td>
            <a href="${data.qrCodeURL}" target="_blank">View</a>
          </td>
          <td>${adminCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${(data.campusDept || "None")}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        adminBody.appendChild(row);
      } else if (patronType === "faculty") {
        row.innerHTML = `
          <td>
            <a href="${data.qrCodeURL}" target="_blank">View</a>
          </td>
          <td>${facultyCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${(data.collegeSelect).toUpperCase() || "None"}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        facultyBody.appendChild(row);
      } else if (patronType === "visitor") {
        row.innerHTML = `
          <td>
            <a href="${data.qrCodeURL}" target="_blank">View</a>
          </td>
          <td>${visitorCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${data.specifySchool ? data.specifySchool.toUpperCase() : data.schoolSelect ? data.schoolSelect.toUpperCase() : 'None'}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        visitorBody.appendChild(row);
      } else if (patronType === "student") {
        row.innerHTML = `
          <td>
            <a href="${data.qrCodeURL}" target="_blank">View</a>
          </td>
          <td>${studentCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${data.department.toUpperCase()}</td>
          <td>${data.course || "---"}</td>
          <td>${data.major || "---"}</td>
          <td>${data.strand || "---"}</td>
          <td>${data.grade || "---"}</td>
          <td>${data.schoolYear || "N/A"}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        studentBody.appendChild(row);
      }

      // Add click event listener to the row
      row.addEventListener("click", () => {
        timestampBody.innerHTML = "";

        modalUserName.textContent = `${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}`;

        if (data.entryTimestamps && data.entryTimestamps.length > 0) {
          data.entryTimestamps.forEach((timestamp, index) => {
            const tableRow = document.createElement("tr");
            tableRow.innerHTML = `
              <td>${index + 1}</td>
              <td>${new Date(timestamp.seconds * 1000).toLocaleString()}</td>
            `;
            timestampBody.appendChild(tableRow);
          });
        } else {
          const tableRow = document.createElement("tr");
          tableRow.innerHTML = `
            <td colspan="2">No timestamps available.</td>
          `;
          timestampBody.appendChild(tableRow);
        }

        modal.style.display = "block";
      });
    });
  }, (error) => {
    console.error("Error fetching data: ", error);
  });
}

// Enable pagination and sorting on page load
window.onload = () => {
  fetchUserData();
};


let currentPage = 1;
const itemsPerPage = 10;

const data = {
  student: [],
  faculty: [],
  admin: [],
  visitor: [],
};

function displayTable(type) {
  const tableContainer = document.getElementById(`${type}-table-container`);
  const tableBody = document.getElementById(`${type}-body`);

  const paginatedData = data[type].slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  tableBody.innerHTML = paginatedData.map((row, index) => {
    return `<tr>
      <td><a href="#" onclick="showTimestamps('${type}', ${index})">View Timestamps</a></td>
      <td>${index + 1}</td>
      <td>${row.dateRegistered}</td>
      <td>${row.idNumber}</td>
      <td>${row.patronType}</td>
      <td>${row.name}</td>
      <td>${row.timesEntered}</td>
      <td>${row.gender}</td>
      <td>${row.department || row.office || row.school}</td>
      <td>${row.schoolYear}</td>
      <td>${row.semester}</td>
      <td>${row.idValidity}</td>
    </tr>`;
  }).join("");

  updatePagination(type);
  tableContainer.style.display = "block";
}