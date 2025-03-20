const utils = (function () {
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

    return { formatPreferences };
})();
window.utils = utils;