const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

// =====================================
// DASHBOARD STATISTICS
// GET /api/dashboard/stats
// =====================================
router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;