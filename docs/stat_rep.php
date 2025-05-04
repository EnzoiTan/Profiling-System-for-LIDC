<?php
// Database connection
$db = new PDO('mysql:host=localhost;dbname=library_system', 'username', 'password');

// Function to get department statistics
function getDepartmentStats($db)
{
    $query = "SELECT 
                d.department_name,
                COUNT(DISTINCT u.user_id) AS total_users,
                COUNT(l.log_id) AS total_visits,
                ROUND(COUNT(l.log_id) / COUNT(DISTINCT u.user_id), 2) AS avg_visits
              FROM users u
              JOIN departments d ON u.department_id = d.department_id
              LEFT JOIN library_logs l ON u.user_id = l.user_id
              GROUP BY d.department_name
              ORDER BY total_visits DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Function to get monthly trends
function getMonthlyTrends($db)
{
    $query = "SELECT 
                DATE_FORMAT(entry_time, '%Y-%m') AS month,
                COUNT(*) AS visits
              FROM library_logs
              WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
              GROUP BY DATE_FORMAT(entry_time, '%Y-%m')
              ORDER BY month";

    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Function to get peak hours
function getPeakHours($db)
{
    $query = "SELECT 
                HOUR(entry_time) AS hour,
                COUNT(*) AS visits
              FROM library_logs
              GROUP BY HOUR(entry_time)
              ORDER BY hour";

    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Function to get user type distribution
function getUserTypeDistribution($db)
{
    $query = "SELECT 
                user_type,
                COUNT(*) AS count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 1) AS percentage
              FROM users
              GROUP BY user_type";

    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get all data
$deptStats = getDepartmentStats($db);
$monthlyTrends = getMonthlyTrends($db);
$peakHours = getPeakHours($db);
$userTypes = getUserTypeDistribution($db);

// Calculate totals
$totalUsers = array_sum(array_column($deptStats, 'total_users'));
$totalVisits = array_sum(array_column($deptStats, 'total_visits'));
$avgVisits = round($totalVisits / $totalUsers, 2);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Library Usage Statistics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        .report-section {
            margin-bottom: 40px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }

        .chart-container {
            width: 80%;
            margin: 20px auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .highlight {
            background-color: #f8f8f8;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <h1>Library Usage Statistics Report</h1>
    <p>Generated on: <?php echo date('Y-m-d H:i:s'); ?></p>

    <!-- 1. Overall Statistics -->
    <div class="report-section">
        <h2>1. Overall Usage Statistics</h2>
        <table>
            <tr>
                <td>Total Users</td>
                <td><?php echo number_format($totalUsers); ?></td>
            </tr>
            <tr>
                <td>Total Visits</td>
                <td><?php echo number_format($totalVisits); ?></td>
            </tr>
            <tr class="highlight">
                <td>Average Visits per User</td>
                <td><?php echo $avgVisits; ?></td>
            </tr>
        </table>
    </div>

    <!-- 2. Department Pie Chart -->
    <div class="report-section">
        <h2>2. Usage by Department (Current Month)</h2>
        <div class="chart-container">
            <canvas id="deptChart"></canvas>
        </div>
        <script>
            const deptCtx = document.getElementById('deptChart').getContext('2d');
            const deptChart = new Chart(deptCtx, {
                type: 'pie',
                data: {
                    labels: <?php echo json_encode(array_column($deptStats, 'department_name')); ?>,
                    datasets: [{
                        data: <?php echo json_encode(array_column($deptStats, 'total_visits')); ?>,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Visits by Department'
                        }
                    }
                }
            });
        </script>
    </div>

    <!-- 3. Monthly Trends -->
    <div class="report-section">
        <h2>3. Monthly Trend Analysis</h2>
        <div class="chart-container">
            <canvas id="monthlyChart"></canvas>
        </div>
        <script>
            const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
            const monthlyChart = new Chart(monthlyCtx, {
                type: 'bar',
                data: {
                    labels: <?php echo json_encode(array_column($monthlyTrends, 'month')); ?>,
                    datasets: [{
                        label: 'Visits',
                        data: <?php echo json_encode(array_column($monthlyTrends, 'visits')); ?>,
                        backgroundColor: '#36A2EB'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Visits (Last 12 Months)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        </script>
    </div>

    <!-- 4. Department Details -->
    <div class="report-section">
        <h2>4. Departmental Usage Breakdown</h2>
        <table>
            <tr>
                <th>Department</th>
                <th>Total Users</th>
                <th>Monthly Visits</th>
                <th>Avg Visits/User</th>
            </tr>
            <?php foreach ($deptStats as $dept): ?>
                <tr>
                    <td><?php echo htmlspecialchars($dept['department_name']); ?></td>
                    <td><?php echo number_format($dept['total_users']); ?></td>
                    <td><?php echo number_format($dept['total_visits']); ?></td>
                    <td><?php echo $dept['avg_visits']; ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>

    <!-- 5. Peak Hours -->
    <div class="report-section">
        <h2>5. Peak Usage Times</h2>
        <div class="chart-container">
            <canvas id="hoursChart"></canvas>
        </div>
        <script>
            const hoursCtx = document.getElementById('hoursChart').getContext('2d');
            const hoursChart = new Chart(hoursCtx, {
                type: 'bar',
                data: {
                    labels: <?php echo json_encode(array_map(function ($h) {
                                return $h['hour'] . ':00';
                            }, $peakHours)); ?>,
                    datasets: [{
                        label: 'Average Visits',
                        data: <?php echo json_encode(array_column($peakHours, 'visits')); ?>,
                        backgroundColor: '#4BC0C0'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Daily Visits by Hour'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        </script>
    </div>

    <!-- 6. User Type Distribution -->
    <div class="report-section">
        <h2>6. User Type Distribution</h2>
        <div class="chart-container">
            <canvas id="userTypeChart"></canvas>
        </div>
        <script>
            const userTypeCtx = document.getElementById('userTypeChart').getContext('2d');
            const userTypeChart = new Chart(userTypeCtx, {
                type: 'pie',
                data: {
                    labels: <?php echo json_encode(array_column($userTypes, 'user_type')); ?>,
                    datasets: [{
                        data: <?php echo json_encode(array_column($userTypes, 'percentage')); ?>,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'User Types'
                        }
                    }
                }
            });
        </script>
    </div>

    <!-- 7. Recommendations -->
    <div class="report-section">
        <h2>7. Recommendations</h2>
        <ul>
            <li><strong>Resource Allocation:</strong> Increase seating capacity during peak hours (10AM-2PM)</li>
            <li><strong>Collection Development:</strong> Expand Computer Science and Psychology sections</li>
            <li><strong>Extended Hours:</strong> Consider extending opening hours during midterms and finals</li>
            <li><strong>Targeted Outreach:</strong> Develop programs to increase usage in Education and Business colleges</li>
        </ul>
    </div>

    <!-- 8. Data Methodology -->
    <div class="report-section">
        <h2>8. Data Collection Methodology</h2>
        <ul>
            <li>Data collected from library entry system timestamps</li>
            <li>Department affiliation determined by user registration records</li>
            <li>Visits counted when user scans ID at library entrance</li>
            <li>Data covers period: <?php echo date('F Y', strtotime('-12 months')) . ' to ' . date('F Y'); ?></li>
        </ul>
    </div>
</body>

</html>