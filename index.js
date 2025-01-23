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

// Function to fetch and display user data in real-time
function fetchUserData() {
  const adminBody = document.getElementById("admin-body");
  const facultyBody = document.getElementById("faculty-body");
  const visitorBody = document.getElementById("visitor-body");
  const studentBody = document.getElementById("student-body");

  const usersRef = collection(db, "LIDC_Users");

  // Listen for real-time updates
  onSnapshot(usersRef, (snapshot) => {
    // Clear existing data in all tables
    adminBody.innerHTML = "";
    facultyBody.innerHTML = "";
    visitorBody.innerHTML = "";
    studentBody.innerHTML = "";

    // Counters for each table
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
          <td>${adminCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${(data.department || "None").toUpperCase()}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        adminBody.appendChild(row);
      } else if (patronType === "faculty") {
        row.innerHTML = `
          <td>${facultyCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${(data.department).toUpperCase() || "None"}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        facultyBody.appendChild(row);
      } else if (patronType === "visitor") {
        row.innerHTML = `
          <td>${visitorCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${data.schoolSelect ? data.schoolSelect.toUpperCase() : 'None'}</td>
          <td>${capitalize(data.schoolYear)}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        visitorBody.appendChild(row);
      } else if (patronType === "student") {
        row.innerHTML = `
          <td>${studentCount++}</td>
          <td>${formatDate(data.timestamp)}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalize(data.patron)}</td>
          <td>${capitalize(data.lastName)}, ${capitalize(data.firstName)} ${formattedMiddleInitial}</td>
          <td>${data.timesEntered || 0}</td>
          <td>${capitalize(data.gender)}</td>
          <td>${data.course || "N/A"}</td>
          <td>${data.major || "N/A"}</td>
          <td>${data.yearLevel || "N/A"}</td>
          <td>${data.schoolYear || "N/A"}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || "N/A"}</td>
        `;
        studentBody.appendChild(row);
      }
    });
  }, (error) => {
    console.error("Error fetching data: ", error);
  });
}



// Helper function to format middle initial
function formatMiddleInitial(middleInitial) {
  return middleInitial ? `${middleInitial.charAt(0).toUpperCase()}.` : "";
}

// Helper function to capitalize semester and remove dashes
function capitalizeSemester(semester) {
  return semester
    ? semester.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "N/A";
}


// Enable sorting and export features as required
function enableSorting() {
  // Add sorting logic here if needed
}

// Call the fetchUserData function on page load
window.onload = () => {
  fetchUserData();
  enableSorting();
};
 