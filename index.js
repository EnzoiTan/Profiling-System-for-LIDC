// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Function to fetch and display data
async function fetchUserData() {
    const tableBody = document.getElementById("table-body");
  
    try {
      // Fetch users from the "LIDC_Users" collection
      const usersRef = collection(db, "LIDC_Users");
      const querySnapshot = await getDocs(usersRef);
  
      // Debugging: Check if documents are fetched
      console.log("Total documents fetched:", querySnapshot.size);
  
      // Counter for row number
      let rowNumber = 1;
  
      // Loop through the documents and create rows in the table
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${rowNumber++}</td>  <!-- Display row number based on counter -->
          <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' }) : 'January 21, 2024'}</td>
          <td>${data.libraryIdNo}</td>
          <td>${capitalizeName(data.firstName)} ${capitalizeName(data.middleInitial)}. ${capitalizeName(data.lastName)}</td>
          <td>${capitalizeGender(data.gender)}</td>
          <td>${data.department.toUpperCase()}</td>
          <td>${data.course}</td>
          <td>${data.major}</td>
          <td>${data.schoolYear}</td>
          <td>${capitalizeSemester(data.semester)}</td>
          <td>${data.validUntil || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  }

// Helper function to capitalize names
function capitalizeName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Helper function to capitalize gender
function capitalizeGender(gender) {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

// Helper function to capitalize semester and remove dash
function capitalizeSemester(semester) {
  return semester ? semester.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'N/A';
}

// Call the function to fetch and display data when the page loads
window.onload = fetchUserData;
