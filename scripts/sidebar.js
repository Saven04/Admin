// sidebar.js
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = `
        <div class="sidebar">
            <h4 class="p-3">Dashboard</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <details>
                        <summary class="nav-link">Cookie Tracking Options</summary>
                        <div class="ps-3 pt-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="toggleAnalytics" checked>
                                <label class="form-check-label" for="toggleAnalytics">Track Analytics Cookies</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="toggleAdvertising" checked>
                                <label class="form-check-label" for="toggleAdvertising">Track Advertising Cookies</label>
                            </div>
                        </div>
                    </details>
                </li>
                <li class="nav-item">
                    <details>
                        <summary class="nav-link">Report Options</summary>
                        <div class="ps-3 pt-2">
                            <button class="btn btn-sm btn-info w-100 mb-2" id="exportCSV">Export to CSV</button>
                            <button class="btn btn-sm btn-info w-100" id="generateSummary">Generate Summary</button>
                        </div>
                    </details>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logoutBtn">Logout</a>
                </li>
            </ul>
        </div>
    `;

    const sidebarModule = (function () {
        function initSidebar() {
            // Cookie Tracking Options
            const toggleAnalytics = document.getElementById("toggleAnalytics");
            const toggleAdvertising = document.getElementById("toggleAdvertising");

            toggleAnalytics.addEventListener("change", filterTableByCookieType);
            toggleAdvertising.addEventListener("change", filterTableByCookieType);

            // Report Options
            document.getElementById("exportCSV").addEventListener("click", exportToCSV);
            document.getElementById("generateSummary").addEventListener("click", generateSummaryReport);

            // Logout
            document.getElementById("logoutBtn").addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("adminToken");
                window.location.href = "/admin-login.html";
            });
        }

        function filterTableByCookieType() {
            const analyticsEnabled = document.getElementById("toggleAnalytics").checked;
            const advertisingEnabled = document.getElementById("toggleAdvertising").checked;

            const filteredData = tableModule.getLastFetchedData().filter(item => {
                const prefs = item.preferences || {};
                const hasAnalytics = prefs.analytics === true;
                const hasAdvertising = prefs.advertising === true;

                return (analyticsEnabled && hasAnalytics) || (advertisingEnabled && hasAdvertising) || 
                       (!hasAnalytics && !hasAdvertising);
            });

            tableModule.renderTable(filteredData);
        }

        function exportToCSV() {
            const data = tableModule.getLastFetchedData();
            if (!data || data.length === 0) {
                alert("No data available to export.");
                return;
            }

            const headers = ["Consent ID", "IP Address", "ISP", "City", "Country", "Purpose", 
                             "Consent Status", "Created At", "Deleted At", "Expires At", "Cookie Preferences"];
            const rows = data.map(item => {
                const ts = item.timestamps?.location || {};
                const expiresAt = ts.deletedAt 
                    ? new Date(new Date(ts.deletedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleString() 
                    : "N/A";
                return [
                    item.consentId || "N/A",
                    item.ipAddress || "N/A",
                    item.isp || "N/A",
                    item.city || "N/A",
                    item.country || "N/A",
                    item.purpose || "N/A",
                    item.consentStatus || "N/A",
                    ts.createdAt ? new Date(ts.createdAt).toLocaleString() : "N/A",
                    ts.deletedAt ? new Date(ts.deletedAt).toLocaleString() : "N/A",
                    expiresAt,
                    window.utils.formatPreferences(item.preferences)
                ].map(field => `"${field}"`).join(",");
            });

            const csvContent = [headers.join(","), ...rows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `cookie_tracking_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link); // Append to body to ensure click works
            link.click();
            document.body.removeChild(link); // Clean up
        }

        function generateSummaryReport() {
            const data = tableModule.getLastFetchedData();
            if (!data || data.length === 0) {
                alert("No data available for summary.");
                return;
            }

            const totalRecords = data.length;
            const activeRecords = data.filter(item => !item.timestamps?.location?.deletedAt).length;
            const deletedRecords = totalRecords - activeRecords;
            const analyticsCount = data.filter(item => item.preferences?.analytics).length;
            const advertisingCount = data.filter(item => item.preferences?.advertising).length;

            const summaryModal = `
                <div class="modal fade" id="summaryModal" tabindex="-1" aria-labelledby="summaryModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="summaryModalLabel">Data Summary Report</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p><strong>Total Records:</strong> ${totalRecords}</p>
                                <p><strong>Active Records:</strong> ${activeRecords}</p>
                                <p><strong>Deleted Records:</strong> ${deletedRecords}</p>
                                <p><strong>Analytics Cookies:</strong> ${analyticsCount}</p>
                                <p><strong>Advertising Cookies:</strong> ${advertisingCount}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", summaryModal);
            const modalElement = document.getElementById("summaryModal");
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
            modalElement.addEventListener("hidden.bs.modal", () => modalElement.remove());
        }

        return { initSidebar };
    })();

    sidebarModule.initSidebar();
});