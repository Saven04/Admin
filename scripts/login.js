document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email"); // Or "username" if unchanged
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const loginButton = loginForm.querySelector(".btn-login");
    const spinner = loginButton.querySelector(".spinner-border");
    const errorMessage = document.getElementById("errorMessage");

    if (!loginForm || !emailInput || !passwordInput || !rememberMeCheckbox || !loginButton || !spinner || !errorMessage) {
        console.error("Form element missing. Check HTML IDs.");
        return;
    }

    if (localStorage.getItem("rememberMe") === "true") {
        emailInput.value = localStorage.getItem("adminEmail") || "";
        passwordInput.value = localStorage.getItem("adminPassword") || "";
        rememberMeCheckbox.checked = true;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }

        loginButton.disabled = true;
        spinner.classList.remove("d-none");
        errorMessage.classList.add("d-none");

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            const { token } = data;
            console.log("Token received:", token); // Debug log

            localStorage.setItem("adminToken", token);
            console.log("Token stored:", localStorage.getItem("adminToken")); // Verify storage

            if (rememberMeCheckbox.checked) {
                localStorage.setItem("adminEmail", email);
                localStorage.setItem("adminPassword", password);
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("adminEmail");
                localStorage.removeItem("adminPassword");
                localStorage.setItem("rememberMe", "false");
            }

            setTimeout(() => window.location.href = "/index.html", 100); // Slight delay
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