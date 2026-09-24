const pool = require("../config/db");

const addActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { activity_type, description } = req.body;

        if (!activity_type || !description) {
            return res.status(400).json({
                success: false,
                message: "Activity type and description are required."
            });
        }

        // Check whether lead exists
        const [leads] = await pool.query(
            "SELECT id, assigned_to FROM leads WHERE id = ?",
            [id]
        );

        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        const lead = leads[0];

        // Counsellor can add activity only to their own lead
        if (
            req.user.role === "counsellor" &&
            lead.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot add activity to this lead."
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO lead_activity
            (
                lead_id,
                user_id,
                activity_type,
                description
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                id,
                req.user.id,
                activity_type,
                description
            ]
        );

        const [activities] = await pool.query(
            `
            SELECT
                a.*,
                u.name AS user_name,
                u.email AS user_email
            FROM lead_activity a
            LEFT JOIN users u
                ON a.user_id = u.id
            WHERE a.id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Activity added successfully",
            activity: activities[0]
        });

    } catch (error) {
        console.error("Add activity error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add activity",
            error: error.message
        });
    }
};


const getActivities = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether lead exists
        const [leads] = await pool.query(
            "SELECT id, assigned_to FROM leads WHERE id = ?",
            [id]
        );

        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        const lead = leads[0];

        // Counsellor can view activity only for their own lead
        if (
            req.user.role === "counsellor" &&
            lead.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot view activities for this lead."
            });
        }

        const [activities] = await pool.query(
            `
            SELECT
                a.*,
                u.name AS user_name,
                u.email AS user_email
            FROM lead_activity a
            LEFT JOIN users u
                ON a.user_id = u.id
            WHERE a.lead_id = ?
            ORDER BY a.created_at DESC
            `,
            [id]
        );

        res.json({
            success: true,
            count: activities.length,
            activities
        });

    } catch (error) {
        console.error("Get activities error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message
        });
    }
};


module.exports = {
    addActivity,
    getActivities
};