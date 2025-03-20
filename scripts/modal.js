const modalModule = (function () {
    function initModal() {
        const container = document.getElementById("preferencesModalContainer");
        container.innerHTML = `
            <div class="modal fade" id="preferencesModal" tabindex="-1" aria-labelledby="preferencesModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="preferencesModalLabel">Cookie Preferences</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="preferencesModalBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function showPreferences(consentId, data) {
        const item = data.find(d => d.consentId === consentId);
        if (!item) return;

        const modalBody = document.getElementById("preferencesModalBody");
        modalBody.innerHTML = `
            <p><strong>Consent ID:</strong> ${item.consentId || "N/A"}</p>
            <p><strong>IP Address:</strong> ${item.ipAddress || "N/A"}</p>
            <p><strong>ISP:</strong> ${item.isp || "N/A"}</p>
            <p><strong>City:</strong> ${item.city || "N/A"}</p>
            <p><strong>Country:</strong> ${item.country || "N/A"}</p>
            <p><strong>Purpose:</strong> ${item.purpose || "N/A"}</p>
            <p><strong>Consent Status:</strong> ${item.consentStatus || "N/A"}</p>
            <p><strong>Preferences:</strong> ${window.utils.formatPreferences(item.preferences)}</p>
            <p><strong>Username:</strong> ${item.username || "N/A"}</p>
        `;

        const modal = new bootstrap.Modal(document.getElementById("preferencesModal"));
        modal.show();
    }

    document.addEventListener("DOMContentLoaded", initModal);
    return { showPreferences };
})();
window.modal = modalModule;