document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("calendarGrid");
    const monthYearText = document.getElementById("monthYearDisplay");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const adminPanel = document.getElementById("adminPanel");

    const selBranch = document.getElementById("selBranch");
    const selBatch = document.getElementById("selBatch");
    const btnLoad = document.getElementById("btnLoad");

    const editModal = document.getElementById("editCalendarModal");
    const editForm = document.getElementById("editCalendarForm");
    const editDateInput = document.getElementById("editDate");
    const editDateText = document.getElementById("editDateText");
    const editTargetText = document.getElementById("editTargetText");
    const editStatusInput = document.getElementById("editStatus");
    const editDescInput = document.getElementById("editDescription");

    let isBulkMode = false;
    let selectedDates = [];

    let currentDate = new Date();
    let events = [];
    const userRole = localStorage.getItem("loggedRole");
    const userEmail = localStorage.getItem("loggedEmail");

    if (userRole === "admin") {
        adminPanel.style.display = "flex";
        document.getElementById("backToDash").href = "admin.html";
    }

    // ── TOAST NOTIFICATION ───────────────────────────────────────────
    function showToast(msg, type = "success") {
        const toast = document.createElement("div");
        toast.textContent = msg;
        toast.style = `
            position: fixed; top: 20px; right: 20px; padding: 12px 24px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white; border-radius: 8px; z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.5s";
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    async function fetchEvents() {
        let branch = selBranch.value;
        let batch = selBatch.value;

        if (userRole === "student" && userEmail) {
            try {
                const token = localStorage.getItem("authToken");
               const res = await fetch(`http://localhost:3000/profile/${encodeURIComponent(userEmail)}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const user = await res.json();
                branch = user.branch || "All";
                batch = user.batch_start || "All";
            } catch (e) { console.error("Profile fetch failed", e); }
        }

        try {
          const res = await fetch(`http://localhost:3000/calendar/all?branch=${branch}&batch=${batch}`);
            events = await res.json();
            document.getElementById("statusDisplay").textContent = `Showing Schedule for: ${branch} | ${batch}`;
            renderCalendar();
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    }

    function renderCalendar() {
        grid.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearText.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

        // Day names
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dayNames.forEach(name => {
            const div = document.createElement("div");
            div.className = "day-name";
            div.textContent = name;
            grid.appendChild(div);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement("div");
            div.className = "day-cell empty-cell";
            grid.appendChild(div);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const event = events.find(e => e.event_date === dateStr);
            const status = event ? event.event_type : "Class";

            const div = document.createElement("div");
            div.className = "day-cell" + (selectedDates.includes(dateStr) ? " selected" : "");
            div.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-status status-${status.toLowerCase().replace(' ', '')}">${status}</div>
                ${event && event.description && event.description !== status ? `<div style="font-size:8px; color:#666; margin-top:4px; text-align:center;">${event.description}</div>` : ""}
            `;

            if (userRole === "admin") {
                div.addEventListener("click", () => {
                    if (isBulkMode) {
                        toggleDateSelection(dateStr, div);
                    } else {
                        openEditModal(dateStr, event);
                    }
                });
            }
            grid.appendChild(div);
        }
    }

    function toggleDateSelection(date, el) {
        if (selectedDates.includes(date)) {
            selectedDates = selectedDates.filter(d => d !== date);
            el.classList.remove("selected");
        } else {
            selectedDates.push(date);
            el.classList.add("selected");
        }
        updateBulkUI();
    }

    function updateBulkUI() {
        const btnApply = document.getElementById("btnApplyBulk");
        const btnClear = document.getElementById("btnClearSel");
        const count = selectedDates.length;

        btnApply.style.display = count > 0 ? "inline-block" : "none";
        btnClear.style.display = count > 0 ? "inline-block" : "none";
        btnApply.textContent = `✍️ Edit Selected (${count})`;
    }

    document.getElementById("btnBulkMode").addEventListener("click", function () {
        isBulkMode = !isBulkMode;
        this.style.background = isBulkMode ? "#e74c3c" : "#2c3e50";
        this.textContent = isBulkMode ? "🛑 Stop Selection" : "🖱️ Select Multiple";
        document.getElementById("quickSelect").style.display = isBulkMode ? "flex" : "none";
        if (!isBulkMode) {
            selectedDates = [];
            updateBulkUI();
            renderCalendar();
        }
    });

    document.getElementById("selSundays").addEventListener("click", () => selectByWeekday(0));
    document.getElementById("selSaturdays").addEventListener("click", () => selectByWeekday(6));

    function selectByWeekday(dayIndex) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, month, day);
            if (d.getDay() === dayIndex) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (!selectedDates.includes(dateStr)) {
                    selectedDates.push(dateStr);
                }
            }
        }
        updateBulkUI();
        renderCalendar();
    }

    document.getElementById("btnClearSel").addEventListener("click", () => {
        selectedDates = [];
        updateBulkUI();
        renderCalendar();
    });

    document.getElementById("btnApplyBulk").addEventListener("click", () => {
        editDateInput.value = "BULK"; // Special flag
        editDateText.textContent = `Editing ${selectedDates.length} selected dates`;
        editTargetText.textContent = `Target: ${selBranch.value} | ${selBatch.value}`;
        editModal.style.display = "flex";
    });

    function openEditModal(date, event) {
        editDateInput.value = date;
        editDateText.textContent = `Date: ${date}`;
        editTargetText.textContent = `Target: ${selBranch.value} | ${selBatch.value}`;
        editStatusInput.value = event ? event.event_type : "Class";
        editDescInput.value = event ? (event.description || "") : "";
        editModal.style.display = "flex";
    }

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const isBulk = editDateInput.value === "BULK";
        const url = isBulk ? "http://localhost:3000/calendar/bulk-update" : "http://localhost:3000/calendar/update";

        const payload = {
            event_type: editStatusInput.value,
            branch: selBranch.value,
            batch: selBatch.value,
            description: editDescInput.value
        };

        if (isBulk) {
            payload.dates = selectedDates;
        } else {
            payload.event_date = editDateInput.value;
        }

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.message) {
                showToast(isBulk ? `Updated ${selectedDates.length} dates!` : "Calendar updated!");
                editModal.style.display = "none";
                selectedDates = [];
                isBulkMode = false;
                document.getElementById("btnBulkMode").style.background = "#2c3e50";
                document.getElementById("btnBulkMode").textContent = "🖱️ Select Multiple";
                updateBulkUI();
                fetchEvents(); // Refresh
            }
        } catch (err) {
            showToast("Update failed. Check connection.", "error");
        }
    });

    prevBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchEvents();
    });

    nextBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchEvents();
    });

    btnLoad.addEventListener("click", fetchEvents);

    // Auto-refresh when branch or batch changes
    selBranch.addEventListener("change", fetchEvents);
    selBatch.addEventListener("change", fetchEvents);

    fetchEvents();
});
