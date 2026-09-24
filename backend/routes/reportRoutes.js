const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getReportOverview
} = require("../controllers/reportController");

// =====================================
// REPORT OVERVIEW
// GET /api/reports/overview
// =====================================
router.get(
    "/overview",
    authMiddleware,
    getReportOverview
);

module.exports = router;