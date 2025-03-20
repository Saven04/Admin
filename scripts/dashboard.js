document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("cookieTableBody");
    const searchInput = document.getElementById("searchInput");
    const logoutBtn = document.getElementById("logoutBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    let lastFetchedData = [];

    // Initial data fetch
    fetchData();

    // Logout
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/admin/logout", { method: "POST" });
            if (response.ok) {
                window.location.reload(); // Redirect to login or home
            } else {
                alert("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout");
        }
    });

    // Refresh data
    refreshBtn.addEventListener("click", fetchData);

    // Search with debounce
    let debounceTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            fetchData(searchTerm ? `https://backendcookie-8qc1.onrender.com/api/gdpr-data/${searchTerm}` : "https://backendcookie-8qc1.onrender.com/api/gdpr-data");
        }, 300);
    });

    // Fetch data from the backend
    async function fetchData(url = "https://backendcookie-8qc1.onrender.com/api/gdpr-data") {
        try {
            tableBody.innerHTML = '<tr><td colspan="11">Loading...</td></tr>';
            const response = await fetch(url, { method: "GET" });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            lastFetchedData = Array.isArray(data) ? data : [data];
            renderTable(lastFetchedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    // Render table rows
    function renderTable(data) {
        tableBody.innerHTML = "";
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">No data available</td></tr>';
            return;
        }
        data.forEach(item => {
            const locationTimestamps = item.timestamps?.location || {};
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.consentId || "N/A"}</td>
                <td>${item.ipAddress || "N/A"}</td>
                <td>${item.isp || "N/A"}</td>
                <td>${item.city || "N/A"}</td>
                <td>${item.country || "N/A"}</td>
                <td>${item.purpose || "N/A"}</td>
                <td>${item.consentStatus || "N/A"}</td>
                <td>${locationTimestamps.createdAt ? new Date(locationTimestamps.createdAt).toLocaleString() : "N/A"}</td>
                <td>${locationTimestamps.deletedAt ? new Date(locationTimestamps.deletedAt).toLocaleString() : "-"}</td>
                <td>${formatPreferences(item.preferences)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-btn" data-id="${item.consentId}">View</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${item.consentId}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for buttons
        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", () => viewDetails(btn.dataset.id));
        });
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteEntry(btn.dataset.id));
        });

        // Re-enable tooltips
        const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
        [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    // Format preferences with badges
    function formatPreferences(preferences) {
        if (!preferences) return "N/A";
        const prefList = Object.entries(preferences)
            .map(([key, value]) => {
                const badgeClass = value ? "badge bg-success" : "badge bg-danger";
                const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                return `<span class="${badgeClass} me-1">${displayKey}: ${value ? "Yes" : "No"}</span>`;
            })
            .join("");
        return `<div>${prefList}</div>`;
    }

    // View details in a modal
    function viewDetails(consentId) {
        const item = lastFetchedData.find(d => d.consentId === consentId);
        if (!item) {
            fetchData(`https://backendcookie-8qc1.onrender.com/api/gdpr-data/${consentId}`).then(() => {
                const fetchedItem = lastFetchedData[0];
                if (fetchedItem) showModal(fetchedItem);
            });
            return;
        }
        showModal(item);
    }

    // Show modal with details
    function showModal(data) {
        const locationTimestamps = data.timestamps?.location || {};
        const cookieTimestamps = data.timestamps?.cookiePreferences || {};
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Details for ${data.consentId}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Consent ID:</strong> ${data.consentId || "N/A"}</p>
                        <p><strong>IP Address:</strong> ${data.ipAddress || "N/A"}</p>
                        <p><strong>ISP:</strong> ${data.isp || "N/A"}</p>
                        <p><strong>City:</strong> ${data.city || "N/A"}</p>
                        <p><strong>Country:</strong> ${data.country || "N/A"}</p>
                        <p><strong>Purpose:</strong> ${data.purpose || "N/A"}</p>
                        <p><strong>Consent Status:</strong> ${data.consentStatus || "N/A"}</p>
                        <p><strong>Cookie Timestamps:</strong> Created: ${cookieTimestamps.createdAt ? new Date(cookieTimestamps.createdAt).toLocaleString() : "N/A"}, Updated: ${cookieTimestamps.updatedAt ? new Date(cookieTimestamps.updatedAt).toLocaleString() : "N/A"}</p>
                        <p><strong>Location Timestamps:</strong> Created: ${locationTimestamps.createdAt ? new Date(locationTimestamps.createdAt).toLocaleString() : "N/A"}, Updated: ${locationTimestamps.updatedAt ? new Date(locationTimestamps.updatedAt).toLocaleString() : "N/A"}, Deleted: ${locationTimestamps.deletedAt ? new Date(locationTimestamps.deletedAt).toLocaleString() : "N/A"}</p>
                        <p><strong>Preferences:</strong> ${formatPreferences(data.preferences)}</p>
                        <p><strong>Username:</strong> ${data.username || "N/A"}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        modal.addEventListener("hidden.bs.modal", () => modal.remove());
    }

    // Delete entry (soft delete)
    async function deleteEntry(consentId) {
        if (confirm(`Are you sure you want to soft-delete ${consentId}?`)) {
            try {
                const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/gdpr-data/${consentId}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error(`Failed to delete: ${response.status}`);
                }
                alert(`Successfully soft-deleted ${consentId}`);
                fetchData();
            } catch (error) {
                console.error("Error deleting entry:", error);
                alert(`Failed to delete: ${error.message}`);
            }
        }
    }
});