document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = `
        <div class="position-sticky pt-3">
            <h4 class="text-center text-muted">GDPR Dashboard</h4>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link active" href="#" aria-current="page" data-section="cookie-tracking">
                        <i class="fas fa-cookie-bite me-2"></i> Cookie Tracking
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-section="reports">
                        <i class="fas fa-chart-bar me-2"></i> Reports
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-section="settings">
                        <i class="fas fa-cog me-2"></i> Settings
                    </a>
                </li>
            </ul>
        </div>
    `;

    // Add click handlers for navigation (placeholder for future sections)
    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            sidebar.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            // Add logic here to switch main content if needed
        });
    });
});