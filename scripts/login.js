document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const loginButton = loginForm.querySelector(".btn-login");
    const spinner = loginButton.querySelector(".spinner-border");
    const errorMessage = document.getElementById("errorMessage");

    // Load saved credentials if "Remember Me" was checked
    if (localStorage.getItem("rememberMe") === "true") {
        usernameInput.value = localStorage.getItem("adminUsername") || "";
        passwordInput.value = localStorage.getItem("adminPassword") || "";
        rememberMeCheckbox.checked = true;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Please enter both username and password.");
            return;
        }

        // Show loading state
        loginButton.disabled = true;
        spinner.classList.remove("d-none");
        errorMessage.classList.add("d-none");

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            const { token } = data;

            // Store token and redirect
            localStorage.setItem("adminToken", token);

            // Handle "Remember Me"
            if (rememberMeCheckbox.checked) {
                localStorage.setItem("adminUsername", username);
                localStorage.setItem("adminPassword", password);
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("adminUsername");
                localStorage.removeItem("adminPassword");
                localStorage.setItem("rememberMe", "false");
            }

            window.location.href = "/dashboard.html"; // Redirect to dashboard
        } catch (error) {
            console.error("Login error:", error);
            showError(error.message || "An error occurred during login.");
        } finally {
            loginButton.disabled = false;
            spinner.classList.add("d-none");
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("d-none");
    }
});