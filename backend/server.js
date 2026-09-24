const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const activityRoutes = require("./routes/activityRoutes");
const followupRoutes = require("./routes/followupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/leads", leadRoutes);
app.use("/api/leads", activityRoutes);

app.use("/api/followups", followupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "EduLead API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "Database connection is working",
            result: rows
        });
    } catch (error) {
        console.error("Database test error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        user: req.user
    });
});


app.get(
    "/api/manager-only",
    authMiddleware,
    roleMiddleware("manager"),
    (req, res) => {
        res.json({
            success: true,
            message: "Manager access granted",
            user: req.user
        });
    }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`EduLead server running on port ${PORT}`);
});