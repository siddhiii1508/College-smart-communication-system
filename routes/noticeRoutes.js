const express = require("express");
const multer  = require("multer");
const { Op }  = require("sequelize");
const Notice  = require("../models/Notice");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
console.log("NOTICE ROUTES LOADED");

const router = express.Router();

/* FILE UPLOAD CONFIG */
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads/"); },
    filename:    (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); }
});
const upload = multer({ storage });

/* ───────────────────────────────────────────
   POST /notice/add   (ADMIN)
─────────────────────────────────────────── */
router.post("/add", isAuthenticated, isAdmin, upload.single("file"), async (req, res) => {
    try {
        const { title, description, category, target_branch, target_batch, expiry_date } = req.body;

        const notice = await Notice.create({
            title,
            description,
            department_id: 1,             // kept for DB compatibility but hidden from UI
            category:      category      || "General",
            target_branch: target_branch || "All",
            target_batch:  target_batch  || "All",
            expiry_date:   expiry_date   || null,
            file_name: req.file ? req.file.filename : null
        });

        res.json({ message: "Notice added successfully", notice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add notice" });
    }
});

/* ───────────────────────────────────────────
   GET /notice/all   (STUDENT)
   - Filters expired notices
   - Filters by branch + batch if provided
─────────────────────────────────────────── */
router.get("/all", async (req, res) => {
    try {
        const { branch, batch } = req.query;
        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

        let whereClause = {
            [Op.or]: [
                { expiry_date: null },                // no expiry set
                { expiry_date: { [Op.gte]: today } }  // expiry in future
            ]
        };

        // Branch / batch filter
        if (branch && batch) {
            whereClause = {
                [Op.and]: [
                    // Not expired
                    {
                        [Op.or]: [
                            { expiry_date: null },
                            { expiry_date: { [Op.gte]: today } }
                        ]
                    },
                    // Matches target audience
                    {
                        [Op.or]: [
                            { target_branch: "All" },
                            { target_branch: branch, target_batch: "All" },
                            { target_branch: branch, target_batch: String(batch) }
                        ]
                    }
                ]
            };
        }

        const notices = await Notice.findAll({
            where: whereClause,
            order: [["id", "DESC"]]
        });
        res.json(notices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch notices" });
    }
});

/* ───────────────────────────────────────────
   GET /notice/admin-all   (ADMIN VIEW)
   - Returns ALL notices including expired
─────────────────────────────────────────── */
router.get("/admin-all", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const notices = await Notice.findAll({ order: [["id", "DESC"]] });
        res.json(notices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch notices" });
    }
});

/* ───────────────────────────────────────────
   DELETE /notice/:id   (ADMIN)
─────────────────────────────────────────── */
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);
        if (!notice) return res.status(404).json({ message: "Notice not found" });
        await notice.destroy();
        res.json({ message: "Notice deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete notice" });
    }
});

module.exports = router;
