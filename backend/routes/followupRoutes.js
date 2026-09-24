const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createFollowup,
    getFollowups,
    getFollowupById,
    updateFollowup
} = require("../controllers/followupController");

// =====================================
// CREATE FOLLOW-UP
// POST /api/followups
// =====================================
router.post("/", authMiddleware, createFollowup);

// =====================================
// GET ALL FOLLOW-UPS
// GET /api/followups
// =====================================
router.get("/", authMiddleware, getFollowups);

// =====================================
// GET SINGLE FOLLOW-UP
// GET /api/followups/:id
// =====================================
router.get("/:id", authMiddleware, getFollowupById);

// =====================================
// UPDATE FOLLOW-UP
// PUT /api/followups/:id
// =====================================
router.put("/:id", authMiddleware, updateFollowup);

module.exports = router;