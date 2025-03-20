const modal = (function () {
    function showPreferences(consentId, data, timestamps) {
        const item = data.find(d => d.consentId === consentId);
        if (!item) return;

        const modalContent = `
            <div class="modal fade" id="preferencesModal" tabindex="-1" aria-labelledby="preferencesModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="preferencesModalLabel">Consent Details: ${consentId}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h6>Cookie Preferences</h6>
                            <pre>${window.utils.formatPreferences(item.preferences)}</pre>
                            <h6>Timestamps</h6>
                            <ul class="list-group mb-3">
                                <li class="list-group-item"><strong>Created At:</strong> ${timestamps.createdAt}</li>
                                <li class="list-group-item"><strong>Deleted At:</strong> ${timestamps.deletedAt}</li>
                                <li class="list-group-item"><strong>Expires At:</strong> ${timestamps.expiresAt}</li>
                            </ul>
                            <h6>Additional Details</h6>
                            <p><strong>IP Address:</strong> ${item.ipAddress || "N/A"}</p>
                            <p><strong>ISP:</strong> ${item.isp || "N/A"}</p>
                            <p><strong>City:</strong> ${item.city || "N/A"}</p>
                            <p><strong>Country:</strong> ${item.country || "N/A"}</p>
                            <p><strong>Purpose:</strong> ${item.purpose || "N/A"}</p>
                            <p><strong>Consent Status:</strong> ${item.consentStatus || "N/A"}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalContent);
        const modalElement = document.getElementById("preferencesModal");
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();

        modalElement.addEventListener("hidden.bs.modal", () => {
            modalElement.remove(); // Clean up modal after closing
        });
    }

    return { showPreferences };
})();

window.modal = modal;