const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createLead,
    getLeads,
    getLeadById,
    updateLead
} = require("../controllers/leadController");

// =====================================
// CREATE LEAD
// POST /api/leads
// =====================================
router.post("/", authMiddleware, createLead);

// =====================================
// GET ALL LEADS
// GET /api/leads
// =====================================
router.get("/", authMiddleware, getLeads);

// =====================================
// GET SINGLE LEAD
// GET /api/leads/:id
// =====================================
router.get("/:id", authMiddleware, getLeadById);

// =====================================
// UPDATE LEAD
// PUT /api/leads/:id
// =====================================
router.put("/:id", authMiddleware, updateLead);

module.exports = router;