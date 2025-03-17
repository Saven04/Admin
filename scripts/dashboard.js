document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('cookieTableBody');
    const searchInput = document.getElementById('searchInput');

    // Fetch data from the backend
    async function fetchData(searchTerm = '') {
        try {
            let url = 'https://backendcookie-8qc1.onrender.com/api/gdpr-data';
            if (searchTerm) {
                url = `https://backendcookie-8qc1.onrender.com/api/gdpr-data/${searchTerm}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            renderTable(Array.isArray(data) ? data : [data]); // Handle single or multiple results
        } catch (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }

    // Render table rows
    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.consentId}</td>
                <td>${item.ipAddress || 'N/A'}</td>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td>${JSON.stringify(item.preferences)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-btn" data-id="${item.consentId}">View</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${item.consentId}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => viewDetails(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
        });
    }

    // Initial data load
    fetchData();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        fetchData(searchTerm);
    });

    // View details
    function viewDetails(consentId) {
        fetchData(consentId); // Fetch and display single entry details
    }

    // Delete entry (placeholder - implement DELETE route in backend if needed)
    function deleteEntry(consentId) {
        if (confirm(`Are you sure you want to delete ${consentId}?`)) {
            // Add DELETE API call here if implemented in backend
            alert(`Delete functionality for ${consentId} not implemented in this example.`);
        }
    }
});