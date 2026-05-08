// ── Populate Target Batch years ────────────────────────────────────────
const batchSelect  = document.getElementById("targetBatch");
const currentYear  = new Date().getFullYear();
for (let y = currentYear - 8; y <= currentYear + 1; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = `Batch ${y}`;
    batchSelect.appendChild(opt);
}

// ── Set expiry date min to today ───────────────────────────────────────
if (document.getElementById("expiryDate")) {
    document.getElementById("expiryDate").min = new Date().toISOString().slice(0, 10);
}

// ── Add Notice form submit ─────────────────────────────────────────────
document.getElementById("noticeForm").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    const fd  = new FormData(document.getElementById("noticeForm"));

    msg.textContent = "Posting notice...";
    msg.style.color = "#888";

    try {
        const token = localStorage.getItem("authToken");
        const res  = await fetch("http://localhost:3000/notice/add", { 
            method: "POST", 
            body: fd,
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            const branch = fd.get("target_branch");
            const batch  = fd.get("target_batch");
            const expiry = fd.get("expiry_date");
            
            msg.style.color = "#0b7a3c";
            msg.textContent = `✅ Notice posted successfully!`;
            
            document.getElementById("noticeForm").reset();
            if (batchSelect) batchSelect.value = "All";
            
            // Redirect to notices list after 1.5s
            setTimeout(() => {
                window.location.href = "admin-notices.html";
            }, 1500);
        } else {
            msg.style.color = "red";
            msg.textContent = data.message || "Failed to add notice";
        }
    } catch (err) {
        msg.style.color = "red";
        msg.textContent = "Error posting notice";
    }
});
