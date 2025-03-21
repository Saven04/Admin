// utils.js
const utils = (function () {
    function initTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    function formatPreferences(preferences) {
        if (!preferences) return 'N/A';
        const prefList = Object.entries(preferences)
            .map(([key, value]) => {
                const badgeClass = value ? 'badge bg-success' : 'badge bg-danger';
                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return `<span class="${badgeClass} me-1">${displayKey}: ${value ? 'Yes' : 'No'}</span>`;
            })
            .join('');
        return `<div>${prefList}</div>`;
    }

    // Add other utility functions as needed
    function showError(elementId, message) {
        const errorMessage = document.getElementById(elementId);
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('d-none');
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    return {
        initTooltips,
        formatPreferences,
        showError,
        isValidEmail
    };
})();

window.utils = utils;