document.addEventListener("DOMContentLoaded", () => {

    // ─── Populate batch year dropdowns dynamically ───────────────────────
    const currentYear = new Date().getFullYear();
    const startSelect = document.getElementById("batch_start");
    const endSelect   = document.getElementById("batch_end");

    // Start years: from 8 years ago to current year
    for (let y = currentYear - 8; y <= currentYear; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        startSelect.appendChild(opt);
    }

    // When start year chosen, auto-populate end year (+4 for B.Tech)
    startSelect.addEventListener("change", () => {
        const start = parseInt(startSelect.value);
        endSelect.innerHTML = `<option value="">End Year</option>`;
        if (!start) return;
        for (let y = start + 2; y <= start + 6; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === start + 4) opt.selected = true; // default 4-year course
            endSelect.appendChild(opt);
        }
    });

    // ─── Form submit ─────────────────────────────────────────────────────
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const name        = document.getElementById("name").value.trim();
        const email       = document.getElementById("email").value.trim();
        const password    = document.getElementById("password").value;
        const role        = document.getElementById("role").value;
        const branch      = document.getElementById("branch").value;
        const semester    = document.getElementById("semester").value;
        const batch_start = document.getElementById("batch_start").value;
        const batch_end   = document.getElementById("batch_end").value;
        
        // Password validation: min 8 chars, uppercase and lowercase
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("Password must be at least 8 characters long and contain both uppercase and lowercase letters.");
            return;
        }

        if (!branch || !semester || !batch_start || !batch_end) {
            alert("Please fill in all academic details (Branch, Semester, Batch).");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role, branch, semester, batch_start, batch_end })
            });

            const data = await res.json();
            alert(data.message);

            if (res.ok) {
                window.location.href = "login.html";
            }
        } catch (err) {
            alert("Registration failed. Please try again.");
        }
    });

});
