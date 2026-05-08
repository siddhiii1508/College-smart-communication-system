// ── Constants & Helpers ─────────────────────────────────────────────
const catClasses = {
    Examination: "cat-exam",
    Academic:    "cat-academic",
    Events:      "cat-events",
    Placement:   "cat-placement",
    General:     "cat-general"
};

const catIcons = {
    Examination: "📋",
    Academic:    "📚",
    Events:      "🎉",
    Placement:   "💼",
    General:     "📢"
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return "Just now";
    if (diff < 3600)  { const m = Math.floor(diff/60);    return `${m}m ago`; }
    if (diff < 86400) { const h = Math.floor(diff/3600);  return `${h}h ago`; }
    const d = Math.floor(diff/86400);
    if (d < 30)  return `${d}d ago`;
    const mo = Math.floor(d/30);
    return `${mo}mo ago`;
}

// ── State ───────────────────────────────────────────────────────────
let allNotices = [];

// ── DOM Elements ────────────────────────────────────────────────────
const tbody        = document.getElementById("noticesTbody");
const totalBadge   = document.getElementById("totalBadge");
const searchInput  = document.getElementById("searchInput");
const catFilter    = document.getElementById("catFilter");
const statusFilter = document.getElementById("statusFilter");

// ── Load Data ───────────────────────────────────────────────────────
async function fetchNotices() {
    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:3000/notice/admin-all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        allNotices = await res.json();
        renderTable();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-msg" style="color:red;">Error loading notices.</td></tr>`;
    }
}

function renderTable() {
    const search = searchInput.value.toLowerCase();
    const cat    = catFilter.value;
    const status = statusFilter.value;
    const today  = new Date().toISOString().slice(0, 10);

    const filtered = allNotices.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search) || n.description.toLowerCase().includes(search);
        const matchesCat    = !cat || n.category === cat;
        const isExpired     = n.expiry_date && n.expiry_date < today;
        const matchesStatus = !status || (status === "expired" ? isExpired : !isExpired);
        return matchesSearch && matchesCat && matchesStatus;
    });

    totalBadge.textContent = `${filtered.length} Notice${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-msg">No notices matching filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((n, idx) => {
        const catClass = catClasses[n.category] || "cat-general";
        const catIcon  = catIcons[n.category]   || "📢";
        const ago      = timeAgo(n.created_at);
        const expired  = n.expiry_date && n.expiry_date < today;
        const branch   = n.target_branch === "All" ? "All" : n.target_branch;
        const batch    = n.target_batch  === "All" ? "All" : n.target_batch;

        let expiryHTML = '<span class="expiry-none">—</span>';
        if (n.expiry_date) {
            expiryHTML = expired 
                ? `<span class="expiry-expired">Expired<br>${n.expiry_date}</span>`
                : `<span class="expiry-active">Active till<br>${n.expiry_date}</span>`;
        }

        return `
            <tr class="${expired ? 'expired-row' : ''}">
                <td>${idx + 1}</td>
                <td><div class="notice-title-cell" title="${n.title}">${n.title}</div></td>
                <td><span class="cat-badge ${catClass}">${catIcon} ${n.category}</span></td>
                <td style="font-size:11px;">${branch}<br>${batch !== "All" ? 'Batch '+batch : 'All Batches'}</td>
                <td>${ago}</td>
                <td>${expiryHTML}</td>
                <td>
                    ${n.file_name ? `<a href="http://localhost:3000/uploads/${n.file_name}" target="_blank" class="file-link">📎 View</a>` : "—"}
                </td>
                <td>
                    <button class="del-btn" onclick="deleteNotice(${n.id})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join("");
}

// ── Actions ─────────────────────────────────────────────────────────
async function deleteNotice(id) {
    if (!confirm("Are you sure you want to permanently delete this notice?")) return;
    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`http://localhost:3000/notice/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            allNotices = allNotices.filter(n => n.id !== id);
            renderTable();
        } else {
            alert("Failed to delete notice.");
        }
    } catch (err) {
        alert("Error deleting notice.");
    }
}

// ── Events ──────────────────────────────────────────────────────────
searchInput.addEventListener("input", renderTable);
catFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);

// ── Init ────────────────────────────────────────────────────────────
fetchNotices();
