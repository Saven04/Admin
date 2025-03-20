document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        window.location.href = "/admin-login.html";
        return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/admin/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                localStorage.removeItem("adminToken");
                window.location.href = "/admin-login.html";
            } else {
                alert("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout");
        }
    });
});