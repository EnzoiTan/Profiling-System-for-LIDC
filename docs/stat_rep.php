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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
</head>


<body>



    <div class="container">
        <nav>
            <div class="left-nav">
                <img class="sidebar-img" src="zppsu-logo.png" alt="ZPPSU Logo">
                <!-- <img class="sidebar-img" src="assets/logo.png" alt="ZPPSU Logo"> -->
                <h2>Library Users Database</h2>
            </div>
            <div class="right-nav">
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="stat_rep.php">Statistics</a></li>
                    <li><a href="scanner.php" target="_blank">QR Link Scanner</a></li>
                    <li><a href="logout.php" class="logout-btn">logout</a></li>
                </ul>
            </div>
        </nav>

        <label for="month">Select Month:</label>
        <select id="month" onchange="fetchData()">
            <option value="">--Select--</option>
            <option value="03">March 2025</option>
            <option value="04">April 2025</option>
            <option value="05">May 2025</option>
        </select>

        <!-- Department Usage Table -->
        <table id="reportTable">
            <thead>
                <tr>
                    <th>DEPARTMENT</th>
                    <th>NO. OF USERS</th>
                    <th>TIMES USED</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr>
                    <th>TOTAL</th>
                    <th id="totalUsers">0</th>
                    <th id="totalTimesUsed">0</th>
                </tr>
            </tfoot>
        </table>

        <!-- Department Tables Container -->
        <div id="departmentTablesContainer">
            <label for="departmentSelect">Department:</label>
            <select id="departmentSelect" onchange="showDepartmentTable()">
                <option value="">-- Select Department --</option>
            </select>

            <div id="topDepartmentContainer"></div>
            <div id="selectedDepartmentContainer" style="display: none;"></div>
        </div>

        <!-- Names and Entry Count Table -->
        <table id="namesTable" style="display: none;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Course/Strand</th>
                    <th>Gender</th>
                    <th>Times used</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <div class="loading-container" id="loadingIndicator">
            <div class="spinner"></div>
        </div>

        <div id="chartContainer">
            <canvas id="usageChart"></canvas>
        </div>

        <script>
            // Global variables
            let departmentStudentsData = {};
            let departmentRows = [];
            let nameRows = [];

            const acronyms = {
                "BS Information Technology": "BSINFOTECH",
                "BS Information System": "BSIS",
                "Bachelor of Science in Computer Science": "BSCS",
                "Bachelor of Science in Electronics Engineering": "BSECE",
                "Bachelor of Science in Electrical Engineering": "BSEE",
                "Bachelor of Science in Mechanical Engineering": "BSME",
                "Bachelor of Science in Civil Engineering": "BSCE",
                "BS Industrial Technology": "BSIT",
                "BS Civil Engineering": "BSCE",
                "2-Year Trade Technical Education Curriculum": "TTEC",
                "BS Automotive Technology": "BSAT",
                "BS Electrical Technology": "BSET",
                "BS Electronics Technology": "BSELEXT",
                "BS Industrial Technology (BSIT)": "BSIT",
                "BS Mechanical Technology": "BSMT",
                "BS Refrigeration and Air Conditioning Technology": "BSRACT",
                "BS Computer Technology": "BSCOMPTECH",
                "Bachelor of Industrial Technology": "BINDTECH",
                "BIndTech": "BINDTECH",
                "BS Development Communication": "BSDEVCOM",
                "Bachelor of Fine Arts": "BFA",
                "Batsilyer sa Sining ng Filipino (BATSIFIL)": "BATSIFIL",
                "BS Entrepreneurship": "BSENTREP",
                "BS Hospitality Management": "BSHM",
                "BS Marine Engineering": "BSMARE",
                "Bachelor of Physical Education": "BPED",
                "BS Exercise and Sports Sciences": "BSESS",
                "Bachelor of Elementary Education": "BEED",
                "Bachelor of Technology and Livelihood Education": "BTLED",
                "Bachelor of Secondary Education": "BSED",
                "Bachelor of Technical Vocational Teacher Education": "BTVTED",
                "Professional Education Certificate": "PEC",
                "Diploma of Technology": "DT",
                "3-Year Trade Industrial Technical Education": "TITE",
                "Associate in Industrial Technology": "AIT",
            };

            async function fetchData() {
                const month = document.getElementById('month').value;
                if (!month) return;

                // Show loading indicator
                const loadingIndicator = document.getElementById('loadingIndicator');
                loadingIndicator.style.display = 'flex';

                let data;
                try {
                    const res = await fetch(`data.php?month=${month}`);
                    const text = await res.text();

                    try {
                        data = JSON.parse(text);
                    } catch (jsonErr) {
                        console.error("❌ JSON parse failed:", text);
                        alert("⚠️ Invalid JSON response. See console.");
                        return;
                    }

                    if (data.error) {
                        console.error("❌ Server error:", data);
                        alert("⚠️ " + data.error);
                        return;
                    }

                    if (!data.success || !data.data || data.data.length === 0) {
                        console.warn("⚠️ No data available for the selected month.");
                        alert(data.message || "⚠️ No data available for the selected month.");
                        return;
                    }

                    processData(data.data);
                    organizeDepartmentTables(data.data);

                } catch (err) {
                    console.error("❌ Fetch failed:", err);
                    alert("⚠️ Unable to fetch data.");
                    return;
                } finally {
                    // Hide loading indicator
                    loadingIndicator.style.display = 'none';
                }
            }

            function processData(data) {
                const departmentMap = {};
                const namesMap = {};

                data.forEach(row => {
                    // Normalize department names before processing
                    let department = row.department.toUpperCase();

                    // Combine similar department names
                    if (department === "BIndTech" ||
                        department === "Bachelor OF INDUSTRIAL TECHNOLOGY") {
                        department = "BINDTECH";
                    } else if (department === "BS INDUSTRIAL TECHNOLOGY" ||
                        department === "BS INDUSTRIAL TECHNOLOGY (BSIT)") {
                        department = "BS INDUSTRIAL TECHNOLOGY (BSIT)";
                    }

                    const id = row.libraryIdNo;
                    const name = row.name.toUpperCase();
                    const entries = row.entries;
                    const course = row.course || '';
                    const gender = row.gender || '';

                    // Department-level aggregation
                    if (!departmentMap[department]) {
                        departmentMap[department] = {
                            users: new Set(),
                            timesUsed: 0
                        };
                    }
                    departmentMap[department].users.add(id);
                    departmentMap[department].timesUsed += entries;

                    // Name-level aggregation
                    if (!namesMap[name]) {
                        namesMap[name] = {
                            name: name,
                            department: department,
                            course: course,
                            gender: gender,
                            entries: 0
                        };
                    }
                    namesMap[name].entries += entries;
                });

                // Update Department Table
                updateDepartmentTable(departmentMap);

                // Update Names Table
                nameRows = Object.values(namesMap);
                updateNamesTable(nameRows);

                // Render Chart
                renderDepartmentChart(departmentMap);
            }

            function updateDepartmentTable(departmentMap) {
                const departmentTbody = document.querySelector("#reportTable tbody");
                departmentTbody.innerHTML = '';

                let totalUsers = 0;
                let totalTimes = 0;
                departmentRows = [];

                for (const [department, stats] of Object.entries(departmentMap)) {
                    const usersCount = stats.users.size;
                    const timesCount = stats.timesUsed;
                    totalUsers += usersCount;
                    totalTimes += timesCount;

                    departmentRows.push({
                        department,
                        usersCount,
                        timesCount
                    });
                }

                // Sort department rows by times used (descending by default)
                departmentRows.sort((a, b) => b.timesCount - a.timesCount);

                departmentRows.forEach(row => {
                    departmentTbody.innerHTML += `<tr>
                    <td>${row.department}</td>
                    <td>${row.usersCount}</td>
                    <td>${row.timesCount}</td>
                </tr>`;
                });

                document.getElementById('totalUsers').textContent = totalUsers;
                document.getElementById('totalTimesUsed').textContent = totalTimes;
            }

            function generateGenderTable(department, students) {
                // Group by course and gender (counting unique users)
                const courseGenderMap = {};

                // First, create a map to track unique users by course and gender
                students.forEach(student => {
                    const course = student.course ?
                        (acronyms[student.course] || student.course) :
                        student.strand || 'N/A';
                    const gender = student.gender ? student.gender.toUpperCase() : 'N/A';
                    const userId = student.libraryIdNo || student.name; // Use ID if available, otherwise name

                    if (!courseGenderMap[course]) {
                        courseGenderMap[course] = {
                            MALE: new Set(),
                            FEMALE: new Set(),
                            TOTAL: new Set()
                        };
                    }

                    if (gender === 'MALE' || gender === 'M') {
                        courseGenderMap[course].MALE.add(userId);
                    } else if (gender === 'FEMALE' || gender === 'F') {
                        courseGenderMap[course].FEMALE.add(userId);
                    }

                    courseGenderMap[course].TOTAL.add(userId);
                });

                // Sort courses alphabetically
                const sortedCourses = Object.keys(courseGenderMap).sort();

                // Generate table HTML
                let tableHTML = `
        <h4>Gender Breakdown by Course (Unique Users)</h4>
        <table class="department-table">
            <thead>
                <tr>
                    <th>COURSE</th>
                    <th>M</th>
                    <th>F</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
    `;

                // Add rows for each course
                sortedCourses.forEach(course => {
                    const counts = courseGenderMap[course];
                    tableHTML += `
            <tr>
                <td>${course}</td>
                <td>${counts.MALE.size}</td>
                <td>${counts.FEMALE.size}</td>
                <td>${counts.TOTAL.size}</td>
            </tr>
        `;
                });

                // Calculate totals
                const totals = {
                    MALE: sortedCourses.reduce((sum, course) => sum + courseGenderMap[course].MALE.size, 0),
                    FEMALE: sortedCourses.reduce((sum, course) => sum + courseGenderMap[course].FEMALE.size, 0),
                    TOTAL: sortedCourses.reduce((sum, course) => sum + courseGenderMap[course].TOTAL.size, 0)
                };

                // Add totals row
                tableHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <th>TOTAL</th>
                    <th>${totals.MALE}</th>
                    <th>${totals.FEMALE}</th>
                    <th>${totals.TOTAL}</th>
                </tr>
            </tfoot>
        </table>
    `;

                return tableHTML;
            }

            function updateNamesTable(rows) {
                const namesTbody = document.querySelector("#namesTable tbody");
                namesTbody.innerHTML = '';

                // Sort name rows by entries (descending by default)
                rows.sort((a, b) => b.entries - a.entries);

                let listNo = 1;
                rows.forEach(row => {
                    const courseOrStrand = row.course ?
                        (acronyms[row.course] || row.course) :
                        row.strand || 'N/A'; // Use course if available, otherwise strand

                    let genderDisplay = 'N/A';
                    if (row.gender) {
                        const g = row.gender.toUpperCase();
                        genderDisplay = g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : g;
                    }

                    namesTbody.innerHTML += `
                    <tr>
                        <td>${listNo++}</td>
                        <td>${row.name.toUpperCase()}</td>
                        <td>${courseOrStrand.toUpperCase()}</td>
                        <td>${genderDisplay}</td>
                        <td>${row.entries}</td>
                    </tr>
                `;
                });
            }

            function renderDepartmentChart(departmentMap) {
                const departmentData = Object.entries(departmentMap).map(([dept, stats]) => ({
                    department: dept,
                    usersCount: stats.users.size,
                    timesCount: stats.timesUsed
                })).sort((a, b) => b.timesCount - a.timesCount);

                renderChart(
                    departmentData.map(row => row.department),
                    departmentData.map(row => ({
                        users: row.usersCount,
                        times: row.timesCount
                    }))
                );
            }

            function organizeDepartmentTables(data) {
                // Group data by department
                departmentStudentsData = data.reduce((acc, row) => {
                    const department = row.department.toUpperCase();
                    if (!acc[department]) acc[department] = [];
                    acc[department].push(row);
                    return acc;
                }, {});

                // Sort departments by total usage (descending)
                const sortedDepartments = Object.keys(departmentStudentsData).sort((a, b) => {
                    const totalA = departmentStudentsData[a].reduce((sum, student) => sum + student.entries, 0);
                    const totalB = departmentStudentsData[b].reduce((sum, student) => sum + student.entries, 0);
                    return totalB - totalA;
                });

                // Populate department dropdown
                const select = document.getElementById('departmentSelect');
                select.innerHTML = '<option value="">-- Select Department --</option>';
                select.innerHTML += '<option value="ALL">Show All</option>'; // Add "Show All" option

                sortedDepartments.forEach(department => {
                    const totalUsage = departmentStudentsData[department].reduce((sum, student) => sum + student.entries, 0);
                    select.innerHTML += `<option value="${department}">${department}</option>`;
                });

                // Show top department by default
                if (sortedDepartments.length > 0) {
                    showTopDepartment(sortedDepartments[0]);
                }
            }

            function showTopDepartment(department) {
                const container = document.getElementById('topDepartmentContainer');
                generateDepartmentTable(container, department, departmentStudentsData[department]);
            }

            function showDepartmentTable() {
                const select = document.getElementById('departmentSelect');
                const selectedDept = select.value;

                const topContainer = document.getElementById('topDepartmentContainer');
                const selectedContainer = document.getElementById('selectedDepartmentContainer');

                if (!selectedDept) {
                    // Show top department by default
                    selectedContainer.style.display = 'none';
                    topContainer.style.display = 'block';
                    return;
                }

                if (selectedDept === "ALL") {
                    // Show all departments in a combined table
                    selectedContainer.style.display = 'block';
                    topContainer.style.display = 'none';

                    let combinedData = [];

                    // Aggregate all students into a single array
                    Object.keys(departmentStudentsData).forEach(department => {
                        departmentStudentsData[department].forEach(student => {
                            combinedData.push({
                                department,
                                name: student.name,
                                courseOrStrand: student.course ?
                                    (acronyms[student.course] || student.course) : student.strand || 'N/A',
                                gender: student.gender || 'N/A',
                                entries: student.entries
                            });
                        });
                    });

                    // Sort combined data by entries (descending)
                    combinedData.sort((a, b) => b.entries - a.entries);

                    // Generate combined table HTML
                    let combinedTableHTML = `
        <h3>All Departments - Combined Student Usage</h3>
        <table class="department-table">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Department</th>
                    <th>Name</th>
                    <th>Course/Strand</th>
                    <th>Gender</th>
                    <th>Times used</th>
                </tr>
            </thead>
            <tbody>
    `;

                    combinedData.forEach((student, index) => {
                        let genderDisplay = 'N/A';
                        if (student.gender) {
                            const g = student.gender.toUpperCase();
                            genderDisplay = g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : g;
                        }
                        combinedTableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.department}</td>
                <td>${student.name.toUpperCase()}</td>
                <td>${student.courseOrStrand.toUpperCase()}</td>
                <td>${genderDisplay}</td>
                <td>${student.entries}</td>
            </tr>
        `;
                    });

                    combinedTableHTML += `
            </tbody>
        </table>
    `;

                    // Add gender breakdown for all departments
                    combinedTableHTML += generateGenderTable("ALL DEPARTMENTS", combinedData);

                    selectedContainer.innerHTML = combinedTableHTML;
                    return;
                }

                // Show selected department
                topContainer.style.display = 'none';
                selectedContainer.style.display = 'block';
                generateDepartmentTable(selectedContainer, selectedDept, departmentStudentsData[selectedDept]);
            }

            function generateDepartmentTable(container, department, students) {
                const tableHTML = generateDepartmentTableHTML(department, students);
                container.innerHTML = tableHTML;
            }

            function generateDepartmentTableHTML(department, students) {
                // Sort students by entries (descending)
                students.sort((a, b) => b.entries - a.entries);

                let tableHTML = `
        <h3>${department} - Student Usage</h3>
        <table class="department-table">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Course/Strand</th>
                    <th>Gender</th>
                    <th>Times used</th>
                </tr>
            </thead>
            <tbody>
    `;

                // Add student rows
                students.forEach((student, index) => {
                    const courseOrStrand = student.course ?
                        (acronyms[student.course] || student.course) :
                        student.strand || 'N/A'; // Use course if available, otherwise strand

                    let genderDisplay = 'N/A';
                    if (student.gender) {
                        const g = student.gender.toUpperCase();
                        genderDisplay = g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : g;
                    }

                    tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name.toUpperCase()}</td>
                <td>${courseOrStrand.toUpperCase()}</td>
                <td>${genderDisplay}</td>
                <td>${student.entries}</td>
            </tr>
        `;
                });

                tableHTML += `
            </tbody>
        </table>
    `;

                // Add the gender breakdown table
                tableHTML += generateGenderTable(department, students);

                return tableHTML;
            }

            let chart;

            function renderChart(labels, data) {
                const ctx = document.getElementById('usageChart').getContext('2d');
                if (chart) chart.destroy();

                const userCounts = data.map(d => d.users);
                const usageCounts = data.map(d => d.times);

                chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                                label: 'No. of users',
                                data: userCounts,
                                backgroundColor: 'rgba(54, 162, 235, 0.7)'
                            },
                            {
                                label: 'Times used',
                                data: usageCounts,
                                backgroundColor: 'rgba(230, 43, 43, 0.7)'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                formatter: Math.round,
                                font: {
                                    weight: 'bold',
                                    size: 10
                                }
                            },
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 50
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            }

            // Initialize with loading indicator hidden
            document.getElementById('loadingIndicator').style.display = 'none';
        </script>
</body>

</html>