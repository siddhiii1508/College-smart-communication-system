// ── LOGOUT ────────────────────────────────────────────────────────────
function doLogout() {
    localStorage.removeItem("loggedEmail");
    localStorage.removeItem("loggedRole");
    window.location.replace("index.html");
}

// ── TIME AGO ──────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const past = new Date(dateStr);
    const diff = Math.floor((now - past) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) { const m = Math.floor(diff / 60); return m + " minute" + (m > 1 ? "s" : "") + " ago"; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return h + " hour" + (h > 1 ? "s" : "") + " ago"; }
    if (diff < 604800) { const d = Math.floor(diff / 86400); return d + " day" + (d > 1 ? "s" : "") + " ago"; }
    if (diff < 2592000) { const w = Math.floor(diff / 604800); return w + " week" + (w > 1 ? "s" : "") + " ago"; }
    if (diff < 31536000) { const mo = Math.floor(diff / 2592000); return mo + " month" + (mo > 1 ? "s" : "") + " ago"; }
    const y = Math.floor(diff / 31536000); return y + " year" + (y > 1 ? "s" : "") + " ago";
}

document.addEventListener("DOMContentLoaded", () => {
    const noticeBoard = document.getElementById("noticeboard");
    let allNotices = [];

    // ── Get logged-in email FIRST (before any function calls) ──────────
    const userEmail = localStorage.getItem("loggedEmail");

    // ── Category meta ──────────────────────────────────────────────────
    const categoryMeta = {
        Examination: { icon: "📋", color: "#e74c3c" },
        Academic: { icon: "📚", color: "#2980b9" },
        Events: { icon: "🎉", color: "#8e44ad" },
        Placement: { icon: "💼", color: "#27ae60" },
        Syllabus: { icon: "📖", color: "#16a085" },
        "Academic Calendar": { icon: "🗓️", color: "#d35400" },
        General: { icon: "📢", color: "#f39c12" }
    };

    // ── Fetch notices (filtered by student's branch + batch) ────────────
    async function loadNotices() {
        let url = "http://localhost:3000/notice/all";

        if (userEmail) {
            try {
                const token = localStorage.getItem("authToken");
                const pRes = await fetch(`http://localhost:3000/profile/${encodeURIComponent(userEmail)}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const pData = await pRes.json();
                if (pData.branch && pData.batch_start) {
                    url += `?branch=${encodeURIComponent(pData.branch)}&batch=${pData.batch_start}`;
                }
            } catch (_) { /* profile fetch failed — show all */ }
        }

        try {
            const res = await fetch(url);
            allNotices = await res.json();
            renderNotices(allNotices);
            setupQuickLinks(); 
            showImportantNotices(allNotices); // Restored auto-popup logic
        } catch (err) {
            console.error(err);
            noticeBoard.innerHTML = "<p>Error loading notices</p>";
        }
    }

    loadNotices();

    // ── Render notices ──────────────────────────────────────────────────
    function renderNotices(notices) {
        noticeBoard.innerHTML = "";
        if (!notices || notices.length === 0) {
            noticeBoard.innerHTML = "<p style='color:#888; text-align:center; padding:30px;'>No notices found.</p>";
            return;
        }
        notices.forEach(n => {
            const meta = categoryMeta[n.category] || categoryMeta["General"];
            const branch = (n.target_branch && n.target_branch !== "All") ? n.target_branch : "All Branches";
            const batch = (n.target_batch && n.target_batch !== "All") ? `Batch ${n.target_batch}` : "All Batches";
            const when = timeAgo(n.created_at);

            const card = document.createElement("div");
            card.className = "notice-card";
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; gap:8px;">
                    <h4 style="margin:0; flex:1;">${n.title}</h4>
                    <span style="background:${meta.color}; color:white; padding:3px 10px; border-radius:20px; font-size:12px; white-space:nowrap; flex-shrink:0;">
                        ${meta.icon} ${n.category || 'General'}
                    </span>
                </div>
                ${when ? `<div style="font-size:11px; color:#999; margin-bottom:6px;">🕐 ${when}</div>` : ""}
                <p>${n.description}</p>
                <span class="dept">🎓 ${branch} &nbsp;|&nbsp; 📅 ${batch}</span>
            `;
            // click → open detail modal
            card.addEventListener("click", () => openNoticeDetail(n, meta));
            noticeBoard.appendChild(card);
        });
    }

    // ── Notice Detail Modal ─────────────────────────────────────────────
    const detailModal = document.getElementById("noticeDetailModal");
    const ndClose = document.getElementById("ndClose");

    function openNoticeDetail(n, meta) {
        const categoryMeta2 = meta || categoryMeta[n.category] || categoryMeta["General"];
        const branch = (n.target_branch && n.target_branch !== "All") ? n.target_branch : "All Branches";
        const batch = (n.target_batch && n.target_batch !== "All") ? `Batch ${n.target_batch}` : "All Batches";
        const when = timeAgo(n.created_at);

        document.getElementById("ndTitle").textContent = n.title;

        document.getElementById("ndMeta").innerHTML = `
            <span class="nd-badge" style="background:${categoryMeta2.color}">${categoryMeta2.icon} ${n.category || 'General'}</span>
            <span class="nd-badge" style="background:#555">🎓 ${branch}</span>
            <span class="nd-badge" style="background:#2c7bb6">📅 ${batch}</span>
            ${when ? `<span class="nd-badge" style="background:#888">🕐 ${when}</span>` : ""}
        `;

        document.getElementById("ndDesc").textContent = n.description;
        document.getElementById("ndInfo").innerHTML = `Dept ID: ${n.department_id || "—"}`;

        // File preview
        const preview = document.getElementById("ndPreview");
        preview.innerHTML = "";
        if (n.file_name) {
            const fileUrl = `http://localhost:3000/uploads/${n.file_name}`;
            const ext = n.file_name.split(".").pop().toLowerCase();
            const imgExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

            if (ext === "pdf") {
                preview.innerHTML = `
                    <iframe src="${fileUrl}" class="nd-pdf-frame" title="PDF Preview"></iframe>
                    <a href="${fileUrl}" target="_blank" download class="nd-download">⬇️ Download PDF</a>
                `;
            } else if (imgExts.includes(ext)) {
                preview.innerHTML = `
                    <img src="${fileUrl}" class="nd-img-preview" alt="Attached Image">
                    <a href="${fileUrl}" target="_blank" download class="nd-download" style="margin-top:8px;">⬇️ Download Image</a>
                `;
            } else {
                preview.innerHTML = `<a href="${fileUrl}" target="_blank" download class="nd-download">⬇️ Download Attachment</a>`;
            }
        }

        detailModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeNoticeDetail() {
        detailModal.style.display = "none";
        document.body.style.overflow = "";
        document.getElementById("ndPreview").innerHTML = ""; // stop PDF loading
    }

    ndClose.addEventListener("click", closeNoticeDetail);
    detailModal.addEventListener("click", e => { if (e.target === detailModal) closeNoticeDetail(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeNoticeDetail(); });

    // ── Filter by category checkboxes ────────────────────────────────────
    const checkboxes = document.querySelectorAll(".cat-filter");
    checkboxes.forEach(cb => cb.addEventListener("change", applyFilter));

    function applyFilter() {
        const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
        renderNotices(selected.length === 0 ? allNotices : allNotices.filter(n => selected.includes(n.category)));
    }

    const clearBtn = document.getElementById("clearFilter");
    if (clearBtn) clearBtn.addEventListener("click", () => {
        checkboxes.forEach(cb => cb.checked = false);
        renderNotices(allNotices);
    });

    // ── AUTOMATED IMPORTANT POPUPS (Restored) ─────────────────────────
    function showImportantNotices(notices) {
        const keywords = ['Exam Form', 'Internal Assessment', 'Holiday'];
        const important = notices.filter(n => {
            const isImportantCategory = ['Examination', 'Academic Calendar'].includes(n.category);
            const isImportantKeyword = keywords.some(k => n.title.toLowerCase().includes(k.toLowerCase()));
            return isImportantCategory || isImportantKeyword;
        });

        if (important.length > 0) {
            setTimeout(() => { openNoticeDetail(important[0]); }, 800);
        }
    }

    // ── IMPORTANT & QUICK LINKS HANDLERS ──────────────────────────────
    function setupQuickLinks() {
        const links = {
            linkExamForm: { query: 'Exam Form', type: 'title' },
            linkInternal: { query: 'Internal Assessment', type: 'title' },
            linkHoliday: { query: 'Holiday', type: 'title' },
            linkSyllabus: { query: 'Syllabus', type: 'category' },
            linkPortal: { url: 'https://witlnmu.ac.in/' }
        };

        for (const [id, config] of Object.entries(links)) {
            const el = document.getElementById(id);
            if (!el) continue;

            // Remove existing listener if any (to avoid duplicates)
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);

            newEl.addEventListener('click', () => {
                if (config.url) {
                    window.open(config.url, '_blank');
                    return;
                }

                let found;
                if (config.type === 'title') {
                    // Search in titles
                    found = allNotices.find(n => n.title.toLowerCase().includes(config.query.toLowerCase()));
                } else if (config.type === 'category') {
                    // Search in categories
                    found = allNotices.find(n => n.category === config.query);
                }

                if (found) {
                    openNoticeDetail(found);
                } else {
                    alert(`No recent ${config.query} found for your branch/batch.`);
                }
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // ── PROFILE SECTION ─────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════

    function loadProfile() {
        if (!userEmail) {
            document.getElementById("profileName").textContent = "Not logged in";
            return;
        }
        const token = localStorage.getItem("authToken");
        fetch(`http://localhost:3000/profile/${encodeURIComponent(userEmail)}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(u => displayProfile(u))
            .catch(() => { document.getElementById("profileName").textContent = "Error loading profile"; });
    }

    function displayProfile(u) {
        document.getElementById("profileName").textContent = u.name || "—";
        document.getElementById("profileEmail").textContent = u.email || "—";
        document.getElementById("profileBranch").textContent = u.branch ? `🎓 ${u.branch}` : "🎓 Branch not set";
        document.getElementById("profileSemester").textContent = u.semester ? `📖 Semester ${u.semester}` : "📖 Semester not set";
        document.getElementById("profileBatch").textContent = (u.batch_start && u.batch_end)
            ? `📅 ${u.batch_start} – ${u.batch_end}` : "📅 Batch not set";

        const img = document.getElementById("profileImg");
        img.src = u.profile_pic
            ? `http://localhost:3000/uploads/${u.profile_pic}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Student')}&background=0b7a3c&color=fff&size=120`;

        // Pre-fill edit form
        document.getElementById("editEmail").value = u.email || "";
        document.getElementById("editName").value = u.name || "";
        document.getElementById("editBranch").value = u.branch || "";
        document.getElementById("editSemester").value = u.semester || "";
        document.getElementById("editBatchStart").value = u.batch_start || "";
        document.getElementById("editBatchEnd").value = u.batch_end || "";
    }

    loadProfile();

    // ── Open / Close Edit Modal ──────────────────────────────────────
    const editModal = document.getElementById("editProfileModal");

    document.getElementById("openEditProfile").addEventListener("click", () => {
        editModal.style.display = "flex";
    });

    window.addEventListener("click", e => {
        if (e.target === editModal) editModal.style.display = "none";
    });

    // ── Quick photo change via 📷 icon ────────────────────────────────
    const picOnlyInput = document.getElementById("picOnlyInput");
    document.getElementById("triggerPicUpload").addEventListener("click", () => picOnlyInput.click());

    picOnlyInput.addEventListener("change", () => {
        if (!picOnlyInput.files[0]) return;
        const fd = new FormData();
        fd.append("email", userEmail);
        fd.append("profile_pic", picOnlyInput.files[0]);
        const token = localStorage.getItem("authToken");
        fetch("http://localhost:3000/profile/update", { 
            method: "PUT", 
            body: fd,
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => {
                if (d.profile_pic) {
                    document.getElementById("profileImg").src =
                        `http://localhost:3000/uploads/${d.profile_pic}?t=${Date.now()}`;
                }
                alert("Profile picture updated!");
            })
            .catch(() => alert("Failed to upload picture"));
    });

    // ── Edit Profile Form Submit ────────────────────────────────────
    document.getElementById("editProfileForm").addEventListener("submit", async e => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("email", document.getElementById("editEmail").value);
        fd.append("name", document.getElementById("editName").value);
        fd.append("branch", document.getElementById("editBranch").value);
        fd.append("semester", document.getElementById("editSemester").value);
        fd.append("batch_start", document.getElementById("editBatchStart").value);
        fd.append("batch_end", document.getElementById("editBatchEnd").value);
        const picFile = document.getElementById("editPicFile").files[0];
        if (picFile) fd.append("profile_pic", picFile);

        try {
           const token = localStorage.getItem("authToken");
            const res = await fetch("http://localhost:3000/profile/update", { 
                method: "PUT", 
                body: fd,
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message);
            editModal.style.display = "none";
            loadProfile();
            loadNotices(); // reload notices in case branch/batch changed
        } catch {
            alert("Update failed. Please try again.");
        }
    });
});
