// This file contains JavaScript for handling admin dashboard interactions and AJAX requests.

document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('user-list');
    const analyticsButton = document.getElementById('fetch-analytics');

    // Function to fetch and display users
    function fetchUsers() {
        fetch('/api/admin/users')
            .then(response => response.json())
            .then(data => {
                userList.innerHTML = '';
                data.forEach(user => {
                    const li = document.createElement('li');
                    li.textContent = `${user.name} - ${user.email}`;
                    userList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    // Function to fetch analytics data
    function fetchAnalytics() {
        fetch('/api/admin/analytics')
            .then(response => response.json())
            .then(data => {
                // Process and display analytics data
                console.log('Analytics data:', data);
                // Update the dashboard with analytics data
            })
            .catch(error => console.error('Error fetching analytics:', error));
    }

    // Event listener for analytics button
    analyticsButton.addEventListener('click', fetchAnalytics);

    // Initial fetch of users
    fetchUsers();
});