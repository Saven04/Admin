// table.js
const tableModule = (function () {
    let lastFetchedData = [];
    let showDeleted = false;

    function initTable() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <h1 class="h2">Cookie Tracking Information</h1>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm" id="refreshBtn">
                        <i class="fas fa-sync-alt me-1"></i> Refresh
                    </button>
                    <button class="btn btn-secondary btn-sm" id="toggleDeleted">
                        <i class="fas fa-eye-slash me-1"></i> Toggle Deleted
                    </button>
                    <button class="btn btn-success btn-sm" id="exportBtn">
                        <i class="fas fa-download me-1"></i> Export CSV
                    </button>
                </div>
            </div>
            <div class="mb-3 row">
                <div class="col-md-6">
                    <input type="text" class="form-control" id="searchInput" placeholder="Search by Consent ID or IP..." aria-label="Search GDPR data">
                </div>
                <div class="col-md-6">
                    <select class="form-select" id="filterStatus">
                        <option value="all">All Records</option>
                        <option value="active">Active Only</option>
                        <option value="deleted">Deleted Only</option>
                    </select>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th data-bs-toggle="tooltip" title="Unique identifier for consent">Consent ID</th>
                            <th data-bs-toggle="tooltip" title="User's IP address">IP Address</th>
                            <th data-bs-toggle="tooltip" title="Internet Service Provider">ISP</th>
                            <th data-bs-toggle="tooltip" title="City of the user">City</th>
                            <th data-bs-toggle="tooltip" title="Country of the user">Country</th>
                            <th data-bs-toggle="tooltip" title="Purpose of data collection">Purpose</th>
                            <th data-bs-toggle="tooltip" title="User's consent status">Consent Status</th>
                            <th data-bs-toggle="tooltip" title="Creation timestamp">Created At</th>
                            <th data-bs-toggle="tooltip" title="Deletion timestamp (if soft-deleted)">Deleted At</th>
                            <th data-bs-toggle="tooltip" title="Expiration timestamp (if soft-deleted)">Expires At</th>
                            <th data-bs-toggle="tooltip" title="Cookie consent preferences">Cookie Preferences</th>
                            <th data-bs-toggle="tooltip" title="View entry">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="cookieTableBody"></tbody>
                </table>
            </div>
        `;

        // Enable tooltips
        window.utils.initTooltips();

        // Event listeners
        document.getElementById('refreshBtn').addEventListener('click', () => fetchData());
        document.getElementById('toggleDeleted').addEventListener('click', toggleDeleted);
        document.getElementById('filterStatus').addEventListener('change', () => renderTable(lastFetchedData));
        document.getElementById('exportBtn').addEventListener('click', exportToCSV);

        let debounceTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = e.target.value.trim();
                fetchData(searchTerm);
            }, 300);
        });

        fetchData(); // Initial fetch
    }

    async function fetchData(searchTerm = '') {
        const tableBody = document.getElementById('cookieTableBody');
        try {
            tableBody.innerHTML = '<tr><td colspan="12">Loading...</td></tr>';
            const token = localStorage.getItem('adminToken');
            if (!token) throw new Error('No admin token found. Please log in.');

            let url = 'https://backendcookie-8qc1.onrender.com/api/gdpr-data';
            if (searchTerm) {
                // Detect if searchTerm is an IP address or consent ID
                if (searchTerm.includes('.')) {
                    url += `?ipAddress=${encodeURIComponent(searchTerm)}`;
                } else {
                    url += `?consentId=${encodeURIComponent(searchTerm)}`;
                }
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const data = await response.json();
            lastFetchedData = Array.isArray(data) ? data : [data];
            renderTable(lastFetchedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    function renderTable(data) {
        const tableBody = document.getElementById('cookieTableBody');
        tableBody.innerHTML = '';
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center">No data available</td></tr>';
            return;
        }

        const filterValue = document.getElementById('filterStatus').value;
        const filteredData = data.filter(item => {
            const deletedAt = item.timestamps?.location?.deletedAt;
            const matchesFilter =
                filterValue === 'all' ||
                (filterValue === 'active' && !deletedAt) ||
                (filterValue === 'deleted' && !!deletedAt);
            return matchesFilter && (showDeleted || !deletedAt);
        });

        if (filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center">No matching records found</td></tr>';
            return;
        }

        filteredData.forEach(item => {
            const locationTimestamps = item.timestamps?.location || {};
            const expiresAt = locationTimestamps.deletedAt
                ? new Date(new Date(locationTimestamps.deletedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleString()
                : 'N/A';
            const row = document.createElement('tr');
            row.className = locationTimestamps.deletedAt ? 'table-warning' : '';
            row.innerHTML = `
                <td>${item.consentId || 'N/A'}</td>
                <td>${item.ipAddress || 'N/A'}</td>
                <td>${item.isp || 'N/A'}</td>
                <td>${item.city || 'N/A'}</td>
                <td>${item.country || 'N/A'}</td>
                <td>${item.purpose || 'N/A'}</td>
                <td>${item.consentStatus || 'N/A'}</td>
                <td>${locationTimestamps.createdAt ? new Date(locationTimestamps.createdAt).toLocaleString() : 'N/A'}</td>
                <td>${locationTimestamps.deletedAt ? new Date(locationTimestamps.deletedAt).toLocaleString() : 'N/A'}</td>
                <td>${expiresAt}</td>
                <td>${window.utils.formatPreferences(item.preferences)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-btn" data-id="${item.consentId}">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = lastFetchedData.find(d => d.consentId === btn.dataset.id);
                if (item) {
                    const timestamps = {
                        createdAt: item.timestamps?.location?.createdAt
                            ? new Date(item.timestamps.location.createdAt).toLocaleString()
                            : 'N/A',
                        deletedAt: item.timestamps?.location?.deletedAt
                            ? new Date(item.timestamps.location.deletedAt).toLocaleString()
                            : 'N/A',
                        expiresAt: item.timestamps?.location?.deletedAt
                            ? new Date(new Date(item.timestamps.location.deletedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleString()
                            : 'N/A'
                    };
                    window.modal.showPreferences(btn.dataset.id, lastFetchedData, timestamps);
                }
            });
        });
    }

    function toggleDeleted() {
        showDeleted = !showDeleted;
        document.getElementById('toggleDeleted').innerHTML = `<i class="fas fa-eye${showDeleted ? '' : '-slash'} me-1"></i> Toggle Deleted`;
        renderTable(lastFetchedData);
    }

    function exportToCSV() {
        const headers = [
            'Consent ID', 'IP Address', 'ISP', 'City', 'Country', 'Purpose', 'Consent Status',
            'Created At', 'Deleted At', 'Expires At', 'Cookie Preferences'
        ];
        const rows = lastFetchedData.map(item => {
            const locationTimestamps = item.timestamps?.location || {};
            const expiresAt = locationTimestamps.deletedAt
                ? new Date(new Date(locationTimestamps.deletedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleString()
                : 'N/A';
            const preferencesText = Object.entries(item.preferences || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            return [
                item.consentId || 'N/A',
                item.ipAddress || 'N/A',
                item.isp || 'N/A',
                item.city || 'N/A',
                item.country || 'N/A',
                item.purpose || 'N/A',
                item.consentStatus || 'N/A',
                locationTimestamps.createdAt ? new Date(locationTimestamps.createdAt).toLocaleString() : 'N/A',
                locationTimestamps.deletedAt ? new Date(locationTimestamps.deletedAt).toLocaleString() : 'N/A',
                expiresAt,
                `"${preferencesText}"` // Quote preferences to handle commas
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gdpr_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return {
        initTable,
        getLastFetchedData: () => lastFetchedData,
        renderTable: (data) => renderTable(data)
    };
})();

document.addEventListener('DOMContentLoaded', () => tableModule.initTable());