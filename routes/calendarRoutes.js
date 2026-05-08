const express = require("express");
const { Op } = require("sequelize");
const Calendar = require("../models/Calendar");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /calendar/all?branch=CSE&batch=2023
router.get("/all", async (req, res) => {
    try {
        const { branch, batch } = req.query;
        let whereClause = {};

        if (branch && batch) {
            whereClause = {
                [Op.or]: [
                    { branch: "All", batch: "All" },
                    { branch: branch, batch: "All" },
                    { branch: branch, batch: String(batch) }
                ]
            };
        }

        const events = await Calendar.findAll({
            where: whereClause,
            order: [["event_date", "ASC"]]
        });
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch calendar" });
    }
});

// POST /calendar/update
router.post("/update", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { event_date, event_type, branch, batch, description } = req.body;

        // Use upsert or findOne then update/create
        const [event, created] = await Calendar.findOrCreate({
            where: { event_date, branch, batch },
            defaults: { event_type, description }
        });

        if (!created) {
            event.event_type = event_type;
            event.description = description;
            await event.save();
        }

        res.json({ message: "Calendar updated", event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update calendar" });
    }
});

// POST /calendar/bulk-update
router.post("/bulk-update", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { dates, event_type, branch, batch, description } = req.body;

        // Loop through dates and update each
        const results = await Promise.all(dates.map(date => {
            return Calendar.upsert({
                event_date: date,
                event_type,
                branch,
                batch,
                description
            });
        }));

        res.json({ message: "Bulk update successful", count: results.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to bulk update calendar" });
    }
});

module.exports = router;
