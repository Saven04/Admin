document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("cookieTableBody");
    const searchInput = document.getElementById("searchInput");
    const logoutBtn = document.getElementById("logoutBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const filterStatus = document.getElementById("filterStatus");
    const toggleDeletedBtn = document.getElementById("toggleDeleted");
    let lastFetchedData = [];
    let showDeleted = false;

    // Initial data fetch
    fetchData();

    // Logout
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/admin/logout", { 
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                }
            });
            if (response.ok) {
                localStorage.removeItem("adminToken");
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
    refreshBtn.addEventListener("click", () => {
        console.log("Refresh button clicked, fetching data...");
        fetchData(); // Call fetchData with default URL
    });

    // Search with debounce
    let debounceTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            const url = searchTerm 
                ? `https://backendcookie-8qc1.onrender.com/api/gdpr-data/${encodeURIComponent(searchTerm)}` 
                : "https://backendcookie-8qc1.onrender.com/api/gdpr-data";
            console.log("Search triggered, URL:", url);
            fetchData(url);
        }, 300);
    });

    // Filter status change
    filterStatus.addEventListener("change", () => {
        console.log("Filter status changed to:", filterStatus.value);
        renderTable(lastFetchedData);
    });

    // Toggle deleted visibility
    toggleDeletedBtn.addEventListener("click", () => {
        showDeleted = !showDeleted;
        toggleDeletedBtn.innerHTML = `<i class="fas fa-eye${showDeleted ? "" : "-slash"} me-1"></i> Toggle Deleted`;
        console.log("Toggle deleted:", showDeleted);
        renderTable(lastFetchedData);
    });

    // Fetch data from the backend
    async function fetchData(url = "https://backendcookie-8qc1.onrender.com/api/gdpr-data") {
        try {
            console.log("Fetching data from:", url);
            tableBody.innerHTML = '<tr><td colspan="12">Loading...</td></tr>';
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("No admin token found. Please log in.");
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Data fetched successfully:", data);
            lastFetchedData = Array.isArray(data) ? data : [data];
            renderTable(lastFetchedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            tableBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    // Render table rows with filtering and toggling
    function renderTable(data) {
        tableBody.innerHTML = "";
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center">No data available</td></tr>';
            return;
        }

        const filterValue = filterStatus.value;
        const filteredData = data.filter(item => {
            const deletedAt = item.timestamps?.location?.deletedAt;
            const matchesFilter = 
                filterValue === "all" ||
                (filterValue === "active" && !deletedAt) ||
                (filterValue === "deleted" && !!deletedAt);
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
                : "N/A";
            const row = document.createElement("tr");
            row.className = locationTimestamps.deletedAt ? "table-warning" : "";
            row.innerHTML = `
                <td>${item.consentId || "N/A"}</td>
                <td>${item.ipAddress || "N/A"}</td>
                <td>${item.isp || "N/A"}</td>
                <td>${item.city || "N/A"}</td>
                <td>${item.country || "N/A"}</td>
                <td>${item.purpose || "N/A"}</td>
                <td>${item.consentStatus || "N/A"}</td>
                <td>${locationTimestamps.createdAt ? new Date(locationTimestamps.createdAt).toLocaleString() : "N/A"}</td>
                <td>${locationTimestamps.deletedAt ? new Date(locationTimestamps.deletedAt).toLocaleString() : "N/A"}</td>
                <td>${expiresAt}</td>
                <td>${formatPreferences(item.preferences)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-btn" data-id="${item.consentId}">View</button>
                    ${locationTimestamps.deletedAt ? "" : `<button class="btn btn-sm btn-danger soft-delete-btn" data-id="${item.consentId}">Delete</button>`}
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", () => viewDetails(btn.dataset.id));
        });
        document.querySelectorAll(".soft-delete-btn").forEach(btn => {
            btn.addEventListener("click", () => softDelete(btn.dataset.id));
        });

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

    // Soft delete action
    async function softDelete(consentId) {
        if (!confirm(`Are you sure you want to soft-delete data for Consent ID: ${consentId}?`)) return;

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/admin/soft-delete", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ consentId })
            });
            if (!response.ok) throw new Error("Failed to soft-delete data");
            alert("Data soft-deleted successfully.");
            fetchData();
        } catch (error) {
            console.error("Error soft-deleting data:", error);
            alert("Failed to soft-delete data: " + error.message);
        }
    }

    // Show modal with details
    function showModal(data) {
        const locationTimestamps = data.timestamps?.location || {};
        const cookieTimestamps = data.timestamps?.cookiePreferences || {};
        const expiresAt = locationTimestamps.deletedAt 
            ? new Date(new Date(locationTimestamps.deletedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleString() 
            : "N/A";
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
                        <p><strong>Expires At:</strong> ${expiresAt}</p>
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
});