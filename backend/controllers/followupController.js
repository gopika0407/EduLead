const pool = require("../config/db");

// =====================================
// CREATE FOLLOW-UP
// POST /api/followups
// =====================================
const createFollowup = async (req, res) => {
    try {
        const {
            lead_id,
            counsellor_id,
            followup_date,
            followup_time,
            type,
            notes
        } = req.body;

        if (!lead_id || !followup_date || !type) {
            return res.status(400).json({
                success: false,
                message: "Lead, follow-up date and type are required."
            });
        }

        // Check whether lead exists
        const [leads] = await pool.query(
            "SELECT id, assigned_to FROM leads WHERE id = ?",
            [lead_id]
        );

        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        const lead = leads[0];

        // Counsellor can create follow-up only for their own lead
        if (
            req.user.role === "counsellor" &&
            lead.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot create a follow-up for this lead."
            });
        }

        // Manager can assign a counsellor.
        // Counsellor automatically becomes the counsellor.
        const finalCounsellorId =
            req.user.role === "manager"
                ? (counsellor_id || lead.assigned_to)
                : req.user.id;

        if (!finalCounsellorId) {
            return res.status(400).json({
                success: false,
                message: "Counsellor is required."
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO followups
            (
                lead_id,
                counsellor_id,
                followup_date,
                followup_time,
                type,
                notes,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
            `,
            [
                lead_id,
                finalCounsellorId,
                followup_date,
                followup_time || null,
                type,
                notes || null
            ]
        );

        const [followups] = await pool.query(
            `
            SELECT
                f.*,
                l.name AS lead_name,
                l.phone AS lead_phone,
                l.email AS lead_email,
                u.name AS counsellor_name,
                u.email AS counsellor_email
            FROM followups f
            INNER JOIN leads l
                ON f.lead_id = l.id
            LEFT JOIN users u
                ON f.counsellor_id = u.id
            WHERE f.id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Follow-up created successfully",
            followup: followups[0]
        });

    } catch (error) {
        console.error("Create follow-up error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create follow-up",
            error: error.message
        });
    }
};

// GET ALL FOLLOW-UPS
// GET /api/followups

const getFollowups = async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === "manager") {

            query = `
                SELECT
                    f.*,
                    l.name AS lead_name,
                    l.phone AS lead_phone,
                    l.email AS lead_email,
                    l.course,
                    u.name AS counsellor_name,
                    u.email AS counsellor_email
                FROM followups f
                INNER JOIN leads l
                    ON f.lead_id = l.id
                LEFT JOIN users u
                    ON f.counsellor_id = u.id
                ORDER BY f.followup_date ASC, f.followup_time ASC
            `;

        } else {

            query = `
                SELECT
                    f.*,
                    l.name AS lead_name,
                    l.phone AS lead_phone,
                    l.email AS lead_email,
                    l.course,
                    u.name AS counsellor_name,
                    u.email AS counsellor_email
                FROM followups f
                INNER JOIN leads l
                    ON f.lead_id = l.id
                LEFT JOIN users u
                    ON f.counsellor_id = u.id
                WHERE f.counsellor_id = ?
                ORDER BY f.followup_date ASC, f.followup_time ASC
            `;

            params = [req.user.id];
        }

        const [followups] = await pool.query(query, params);

        res.json({
            success: true,
            count: followups.length,
            followups
        });

    } catch (error) {
        console.error("Get follow-ups error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch follow-ups",
            error: error.message
        });
    }
};

// GET SINGLE FOLLOW-UP
// GET /api/followups/:id

const getFollowupById = async (req, res) => {
    try {
        const { id } = req.params;

        const [followups] = await pool.query(
            `
            SELECT
                f.*,
                l.name AS lead_name,
                l.phone AS lead_phone,
                l.email AS lead_email,
                l.course,
                u.name AS counsellor_name,
                u.email AS counsellor_email
            FROM followups f
            INNER JOIN leads l
                ON f.lead_id = l.id
            LEFT JOIN users u
                ON f.counsellor_id = u.id
            WHERE f.id = ?
            `,
            [id]
        );

        if (followups.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Follow-up not found."
            });
        }

        const followup = followups[0];

        if (
            req.user.role === "counsellor" &&
            followup.counsellor_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot view this follow-up."
            });
        }

        res.json({
            success: true,
            followup
        });

    } catch (error) {
        console.error("Get follow-up error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch follow-up",
            error: error.message
        });
    }
};

// UPDATE FOLLOW-UP
// PUT /api/followups/:id
const updateFollowup = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            followup_date,
            followup_time,
            type,
            notes,
            status
        } = req.body;

        // Check whether follow-up exists
        const [existingFollowups] = await pool.query(
            "SELECT * FROM followups WHERE id = ?",
            [id]
        );

        if (existingFollowups.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Follow-up not found."
            });
        }

        const existingFollowup = existingFollowups[0];

        // Counsellor can update only their own follow-up
        if (
            req.user.role === "counsellor" &&
            existingFollowup.counsellor_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot update this follow-up."
            });
        }

        let completedAt = existingFollowup.completed_at;

        // Set completion time when completed
        if (status === "Completed" && existingFollowup.status !== "Completed") {
            completedAt = new Date();
        }

        // Clear completion time if moved away from Completed
        if (status && status !== "Completed") {
            completedAt = null;
        }

        await pool.query(
            `
            UPDATE followups
            SET
                followup_date = ?,
                followup_time = ?,
                type = ?,
                notes = ?,
                status = ?,
                completed_at = ?
            WHERE id = ?
            `,
            [
                followup_date ?? existingFollowup.followup_date,
                followup_time ?? existingFollowup.followup_time,
                type ?? existingFollowup.type,
                notes ?? existingFollowup.notes,
                status ?? existingFollowup.status,
                completedAt,
                id
            ]
        );

        const [updatedFollowups] = await pool.query(
            `
            SELECT
                f.*,
                l.name AS lead_name,
                l.phone AS lead_phone,
                l.email AS lead_email,
                l.course,
                u.name AS counsellor_name,
                u.email AS counsellor_email
            FROM followups f
            INNER JOIN leads l
                ON f.lead_id = l.id
            LEFT JOIN users u
                ON f.counsellor_id = u.id
            WHERE f.id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Follow-up updated successfully",
            followup: updatedFollowups[0]
        });

    } catch (error) {
        console.error("Update follow-up error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update follow-up",
            error: error.message
        });
    }
};


module.exports = {
    createFollowup,
    getFollowups,
    getFollowupById,
    updateFollowup
};