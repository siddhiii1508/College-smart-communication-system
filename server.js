const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/db");

const app = express();

// CORS
app.use(cors());

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(
    session({
        secret: "college_notice_secret",
        resave: false,
        saveUninitialized: true
    })
);

// DB CONNECT
sequelize.authenticate()
    .then(() => console.log("Database connected"))
    .catch(err => console.log("DB error:", err));

// ROUTES (ONLY ONCE)
const authRoutes = require("./routes/authroutes");
const noticeRoutes = require("./routes/noticeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

app.use("/auth", authRoutes);
app.use("/notice", noticeRoutes);
app.use("/profile", profileRoutes);
app.use("/calendar", calendarRoutes);

// UPLOADS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

// TEST ROUTE (ONLY ONE)
app.post("/test", (req, res) => {
    console.log("TEST API HIT");
    console.log(req.body);
    res.json({ message: "Frontend connected successfully" });
});

// ROOT - Serve frontend index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// SERVER
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
