<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Learning Commons Usage Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: auto;
            padding: 20px;
        }

        h2 {
            text-align: center;
        }

        select {
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            margin-top: 20px;
            border: 1px solid #ccc;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px 10px;
            text-align: center;
        }

        tfoot {
            font-weight: bold;
            background-color: #f0f0f0;
        }

        #chartContainer {
            margin-top: 30px;
            height: 350px;
        }

        canvas {
            width: 100% !important;
            height: 100% !important;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 6px solid #ccc;
            border-top-color: #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .loading-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            justify-content: center;
            align-items: center;
        }

        .department-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .department-table th,
        .department-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
        }

        .department-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        #departmentSelect {
            margin: 15px 0;
            padding: 5px;
            font-size: 14px;
            width: 100%;
            max-width: 400px;
        }
    </style>
</head>

<body>

    <h2>Learning Commons Usage Report</h2>

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
        <label for="departmentSelect">Select Department:</label>
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
            "BS Industrial Technology": "BINDTECH",
            "BS Civil Engineering": "BSCE",
            "2-Year Trade Technical Education Curriculum": "TTEC",
            "BS Automotive Technology": "BSAT",
            "BS Electrical Technology": "BSET",
            "BS Electronics Technology": "BSELEXT",
            "BS Industrial Technology (BSIT)": "BSIT",
            "BS Mechanical Technology": "BSMT",
            "BS Refrigeration and Air Conditioning Technology": "BSRACT",
            "BS Computer Technology": "BSCOMPTECH",
            "Bachelor of Industrial Technology": "BSIT",
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
                const department = row.department.toUpperCase();
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

                namesTbody.innerHTML += `
                    <tr>
                        <td>${listNo++}</td>
                        <td>${row.name.toUpperCase()}</td>
                        <td>${courseOrStrand.toUpperCase()}</td>
                        <td>${row.gender.toUpperCase() || 'N/A'}</td>
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
                select.innerHTML += `<option value="${department}">${department} (${totalUsage} uses)</option>`;
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
                                (acronyms[student.course] || student.course) : student.strand || 'N/A', // Use course if available, otherwise strand
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
                    combinedTableHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${student.department}</td>
                            <td>${student.name.toUpperCase()}</td>
                            <td>${student.courseOrStrand.toUpperCase()}</td>
                            <td>${student.gender.toUpperCase()}</td>
                            <td>${student.entries}</td>
                        </tr>
                    `;
                });

                combinedTableHTML += `
                        </tbody>
                    </table>
                `;

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

                tableHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${student.name.toUpperCase()}</td>
                        <td>${courseOrStrand.toUpperCase()}</td>
                        <td>${student.gender.toUpperCase() || 'N/A'}</td>
                        <td>${student.entries}</td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

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