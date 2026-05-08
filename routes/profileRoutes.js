const express = require("express");
const multer  = require("multer");
const path    = require("path");
const User    = require("../models/User");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

/* ── Profile Picture Upload Config ── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename:    (req, file, cb) => cb(null, "profile-" + Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },          // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        allowed.test(path.extname(file.originalname).toLowerCase())
            ? cb(null, true)
            : cb(new Error("Only image files allowed"));
    }
});

/* ── GET /profile/:email  ── */
router.get("/:email", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.params.email },
            attributes: ["id", "name", "email", "role", "branch", "semester", "batch_start", "batch_end", "profile_pic"]
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("GET PROFILE ERROR:", err);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

/* ── PUT /profile/update  ── save text fields + optional new pic ── */
router.put("/update", isAuthenticated, upload.single("profile_pic"), async (req, res) => {
    try {
        const { email, name, branch, semester, batch_start, batch_end } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name)        user.name        = name;
        if (branch)      user.branch      = branch;
        if (semester)    user.semester    = semester;
        if (batch_start) user.batch_start = parseInt(batch_start);
        if (batch_end)   user.batch_end   = parseInt(batch_end);
        if (req.file)    user.profile_pic = req.file.filename;

        await user.save();
        res.json({ message: "Profile updated successfully", profile_pic: user.profile_pic });
    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

module.exports = router;
