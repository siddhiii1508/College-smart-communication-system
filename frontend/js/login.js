document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById('password').value;

        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        const msgEl = document.getElementById("loginMsg");
        
        if (!res.ok) {
            msgEl.style.color = "#e74c3c"; // Red
            msgEl.textContent = data.message;
            return;
        }

        msgEl.style.color = "#0b7a3c"; // Green
        msgEl.textContent = data.message;

        if (res.ok && data.role) {
            // Save session info
            localStorage.setItem("authToken",   data.token);
            localStorage.setItem("loggedEmail", email);
            localStorage.setItem("loggedRole",  data.role);
            // Use replace() so back button from dashboard can't return to login
            if (data.role === "admin") {
                window.location.replace("admin.html");
            } else {
                window.location.replace("index.html");
            }
        }
    });

    // Forgot Password Modal Logic
    const modal = document.getElementById("forgotModal");
    const openBtn = document.getElementById("openForgotModal");
    const closeBtn = document.getElementById("closeForgotModal");
    const forgotForm = document.getElementById("forgotForm");

    console.log("Modal Elements:", { modal, openBtn, closeBtn });

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            console.log("Forgot Password Clicked - Opening Modal");
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });

    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value;
        const newPassword = document.getElementById("newPassword").value;

        const res = await fetch("http://localhost:3000/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            modal.style.display = "none";
            forgotForm.reset();
        }
    });
});
