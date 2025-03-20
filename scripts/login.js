document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("username"); // Kept as "username" for HTML compatibility
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const loginButton = loginForm.querySelector(".btn-login");
    const spinner = loginButton.querySelector(".spinner-border");
    const errorMessage = document.getElementById("errorMessage");

    // Load saved credentials if "Remember Me" was checked
    if (localStorage.getItem("rememberMe") === "true") {
        emailInput.value = localStorage.getItem("adminEmail") || "";
        passwordInput.value = localStorage.getItem("adminPassword") || "";
        rememberMeCheckbox.checked = true;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic validation
        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }
        if (!isValidEmail(email)) {
            showError("Please enter a valid email address.");
            return;
        }

        // Show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...`;
        errorMessage.classList.add("d-none");

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Login failed with status: ${response.status}`);
            }

            const { token } = await response.json();

            // Store token
            localStorage.setItem("adminToken", token);

            // Handle "Remember Me"
            if (rememberMeCheckbox.checked) {
                localStorage.setItem("adminEmail", email);
                localStorage.setItem("adminPassword", password); // Note: Storing passwords in localStorage is insecure; consider alternatives
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("adminEmail");
                localStorage.removeItem("adminPassword");
                localStorage.setItem("rememberMe", "false");
            }

            // Redirect to index, which will then go to dashboard
            window.location.href = "/dashboard.html";
        } catch (error) {
            console.error("Login error:", error);
            if (error.message.includes("network")) {
                showError("Network error: Unable to reach the server. Please check your connection.");
            } else {
                showError(error.message || "An unexpected error occurred during login.");
            }
        } finally {
            loginButton.disabled = false;
            loginButton.innerHTML = `<i class="fas fa-sign-in-alt me-2"></i> Login`; // Reset button text
        }
    });

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("d-none");
    }
});