document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("cookieTableBody");
    const searchInput = document.getElementById("searchInput");
    const logoutBtn = document.getElementById("logoutBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    let lastFetchedData = []; // Store the last fetched data

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
            filterTable(searchTerm);
        }, 300);
    });

    // Fetch data from the backend
    async function fetchData() {
        try {
            tableBody.innerHTML = '<tr><td colspan="11">Loading...</td></tr>';
            const response = await fetch("/admin/compliance", { method: "GET" });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            lastFetchedData = data.locations.map(location => {
                const cookiePref = data.cookiePreferences.find(pref => pref.consentId === location.consentId) || {};
                return { ...location, preferences: cookiePref.preferences || {} };
            });
            renderTable(lastFetchedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    // Filter table based on search term
    function filterTable(searchTerm) {
        const filteredData = lastFetchedData.filter(item => {
            const term = searchTerm.toLowerCase();
            return (
                item.consentId.toLowerCase().includes(term) ||
                item.ipAddress.toLowerCase().includes(term)
            );
        });
        renderTable(filteredData);
    }

    // Render table rows
    function renderTable(data) {
        tableBody.innerHTML = "";
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">No data available</td></tr>';
            return;
        }
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.consentId || "N/A"}</td>
                <td>${item.ipAddress || "N/A"}</td>
                <td>${item.isp || "N/A"}</td>
                <td>${item.city || "N/A"}</td>
                <td>${item.country || "N/A"}</td>
                <td>${item.purpose || "N/A"}</td>
                <td>${item.consentStatus || "N/A"}</td>
                <td>${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</td>
                <td>${item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "-"}</td>
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
        if (!item) return;

        const data = {
            consentId: item.consentId || "N/A",
            ipAddress: item.ipAddress || "N/A",
            isp: item.isp || "N/A",
            city: item.city || "N/A",
            country: item.country || "N/A",
            purpose: item.purpose || "N/A",
            consentStatus: item.consentStatus || "N/A",
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
            deletedAt: item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "N/A",
            preferences: formatPreferences(item.preferences)
        };
        showModal(data);
    }

    // Show modal with details
    function showModal(data) {
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Details for ${data.consentId}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Consent ID:</strong> ${data.consentId}</p>
                        <p><strong>IP Address:</strong> ${data.ipAddress}</p>
                        <p><strong>ISP:</strong> ${data.isp}</p>
                        <p><strong>City:</strong> ${data.city}</p>
                        <p><strong>Country:</strong> ${data.country}</p>
                        <p><strong>Purpose:</strong> ${data.purpose}</p>
                        <p><strong>Consent Status:</strong> ${data.consentStatus}</p>
                        <p><strong>Created At:</strong> ${data.createdAt}</p>
                        <p><strong>Deleted At:</strong> ${data.deletedAt}</p>
                        <p><strong>Preferences:</strong> ${data.preferences}</p>
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
                const response = await fetch(`/api/location/${consentId}`, {
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