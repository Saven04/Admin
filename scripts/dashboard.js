document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('cookieTableBody');
    const searchInput = document.getElementById('searchInput');

    // Function to render table rows
    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.consentId}</td>
                <td>${item.ipAddress}</td>
                <td>${item.timestamp}</td>
                <td>${JSON.stringify(item.preferences)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-btn" data-id="${item.consentId}">View</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${item.consentId}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => viewDetails(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
        });
    }

    // Initial render
    renderTable(mockData);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = mockData.filter(item => 
            item.consentId.toLowerCase().includes(searchTerm) || 
            item.ipAddress.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
    });

    // View details function (example implementation)
    function viewDetails(consentId) {
        const entry = mockData.find(item => item.consentId === consentId);
        alert(`Details for ${consentId}:\nIP: ${entry.ipAddress}\nTimestamp: ${entry.timestamp}\nPreferences: ${JSON.stringify(entry.preferences)}`);
        // In a real app, this could open a modal with more details
    }

    // Delete entry function (example implementation)
    function deleteEntry(consentId) {
        if (confirm(`Are you sure you want to delete ${consentId}?`)) {
            const index = mockData.findIndex(item => item.consentId === consentId);
            if (index !== -1) {
                mockData.splice(index, 1);
                renderTable(mockData);
            }
        }
    }
});