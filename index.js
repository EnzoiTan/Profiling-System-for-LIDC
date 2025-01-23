// Import the necessary Firebase functions
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to capitalize names
function capitalizeName(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper functions for formatting data
function capitalizePatron(patron) {
  return patron.charAt(0).toUpperCase() + patron.slice(1).toLowerCase();
}

function capitalizeGender(gender) {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

function capitalizeSemester(semester) {
  return semester ? semester.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'N/A';
}

// Function to fetch and display data with real-time updates
function fetchUserData() {
  const tableBody = document.getElementById("table-body");
  const usersRef = collection(db, "LIDC_Users");

  // Listen for real-time updates
  onSnapshot(usersRef, (snapshot) => {
    tableBody.innerHTML = ""; // Clear existing table rows

    let rowNumber = 1; // Counter for row numbers

    snapshot.forEach((doc) => {
      const data = doc.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${rowNumber++}</td>
        <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' }) : 'None'}</td>
        <td>${data.libraryIdNo}</td>
        <td>${data.patron ? capitalizePatron(data.patron) : 'None'}</td>
        <td>${capitalizeName(data.lastName)}, ${capitalizeName(data.firstName)} ${capitalizeName(data.middleInitial)}.</td>
        <td>${data.timesEntered}</td>
        <td>${capitalizeGender(data.gender)}</td>
        <td>${data.department.toUpperCase()}</td>
        <td>${data.course || ''}</td>
        <td>${data.major || ''}</td>
        <td>${data.strand || ''}</td>
        <td>${data.grade || ''}</td>
        <td>${data.schoolYear}</td>
        <td>${capitalizeSemester(data.semester)}</td>
        <td>${data.validUntil || ''}</td>
      `;

      tableBody.appendChild(row);
    });
  }, (error) => {
    console.error("Error fetching real-time updates: ", error);
  });
}

// Function to enable sorting functionality on the table
function enableSorting() {
  const headers = document.querySelectorAll("th[data-sort]");

  headers.forEach(header => {
    header.addEventListener("click", function () {
      const columnIndex = Array.from(header.parentNode.children).indexOf(header);
      const sortType = header.getAttribute("data-sort");
      
      // Toggle sort order and update the sorting indicator
      const sortOrder = header.classList.contains("ascending") ? "desc" : "asc";
      header.classList.toggle("ascending", sortOrder === "asc");
      header.classList.toggle("descending", sortOrder === "desc");

      // Perform the sorting
      sortTable(columnIndex, sortType, sortOrder);
    });
  });
}

// Function to sort the table based on column index and sort type
function sortTable(columnIndex, sortType, sortOrder) {
  const table = document.querySelector("table");
  const tableBody = table.querySelector("tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const cellA = a.children[columnIndex].textContent.trim();
    const cellB = b.children[columnIndex].textContent.trim();

    if (sortType === "number") {
      return sortOrder === "asc" ? cellA - cellB : cellB - cellA;
    } else if (sortType === "date") {
      return sortOrder === "asc"
        ? new Date(cellA) - new Date(cellB)
        : new Date(cellB) - new Date(cellA);
    } else {
      return sortOrder === "asc"
        ? cellA.localeCompare(cellB)
        : cellB.localeCompare(cellA);
    }
  });

  tableBody.innerHTML = "";
  rows.forEach(row => tableBody.appendChild(row));
}

// Function to export table data to Excel
function exportToExcel() {
  const table = document.querySelector("table"); // Get the table element
  const ws = XLSX.utils.table_to_sheet(table); // Convert the table to a worksheet
  const wb = XLSX.utils.book_new(); // Create a new workbook

  // Adjust column widths based on the content
  const range = XLSX.utils.decode_range(ws['!ref']); // Get the range of the table
  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxWidth = 10; // Default column width
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.v) {
        const length = cell.v.toString().length;
        maxWidth = Math.max(maxWidth, length);
      }
    }
    ws['!cols'] = ws['!cols'] || [];
    ws['!cols'][col] = { wch: maxWidth }; // Set the column width
  }

  // Ensure 'Library ID No' is treated as text (not a number)
  const libraryIdColIndex = 2; // Assuming libraryIdNo is in the third column (index 2)
  const rowCount = range.e.r; // Number of rows in the table

  for (let row = range.s.r + 1; row <= rowCount; row++) {  // Start from the second row (index 1)
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: libraryIdColIndex });
    const cell = ws[cellAddress];

    if (cell) {
      // Ensure the libraryIdNo is preserved exactly as it is in Firestore (e.g., '00001')
      cell.t = 's';  // Set the type to string (text)
      cell.v = cell.v.toString();  // Force the value to string to prevent Excel from formatting it
    }
  }

  // Ensure 'Valid Until' is treated as text (not a date)
  const validUntilColIndex = 12; // Assuming 'Valid Until' is in the last column
  for (let row = range.s.r + 1; row <= rowCount; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: validUntilColIndex });
    const cell = ws[cellAddress];

    if (cell) {
      // Treat 'Valid Until' as a string (to preserve formatting like 'July 2025')
      cell.t = 's';  // Set the type to string (text)
      cell.v = cell.v || 'N/A'; // Default to 'N/A' if empty
    }
  }

  // Enable autofilter (sorting) in Excel
  ws['!autofilter'] = { ref: ws['!ref'] };

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Library Users");

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, "Library_Users.xlsx");
}

// Add an event listener to the export button
document.getElementById("export-btn").addEventListener("click", exportToExcel);

// Call the function to fetch and display data when the page loads
window.onload = () => {
  fetchUserData(); // Real-time updates
  enableSorting(); // Enable sorting functionality
};
