const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addActivity,
    getActivities
} = require("../controllers/activityController");

// Add activity to a lead
router.post("/:id/activities", authMiddleware, addActivity);

// Get activities for a lead
router.get("/:id/activities", authMiddleware, getActivities);

module.exports = router;