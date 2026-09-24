const pool = require("../config/db");

// =====================================
// CREATE LEAD
// =====================================
const createLead = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            course,
            source,
            status,
            assigned_to,
            preferred_intake,
            notes,
            last_contacted_at,
            next_followup_at
        } = req.body;

        if (!name || !phone || !course || !source) {
            return res.status(400).json({
                success: false,
                message: "Name, phone, course and source are required."
            });
        }

        // Counsellors automatically get their own leads.
        // Managers can optionally assign a counsellor.
        let finalAssignedTo = null;

        if (req.user.role === "counsellor") {
            finalAssignedTo = req.user.id;
        } else if (req.user.role === "manager") {
            finalAssignedTo = assigned_to || null;
        }

        const [result] = await pool.query(
            `INSERT INTO leads
            (
                name,
                phone,
                email,
                course,
                source,
                status,
                assigned_to,
                preferred_intake,
                notes,
                last_contacted_at,
                next_followup_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                phone,
                email || null,
                course,
                source,
                status || "New",
                finalAssignedTo,
                preferred_intake || null,
                notes || null,
                last_contacted_at || null,
                next_followup_at || null
            ]
        );

        const [leads] = await pool.query(
            `
            SELECT
                l.*,
                u.name AS assigned_name,
                u.email AS assigned_email
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            lead: leads[0]
        });

    } catch (error) {
        console.error("Create lead error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create lead",
            error: error.message
        });
    }
};


// =====================================
// GET ALL LEADS
// =====================================
const getLeads = async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === "manager") {

            query = `
                SELECT
                    l.*,
                    u.name AS assigned_name,
                    u.email AS assigned_email
                FROM leads l
                LEFT JOIN users u
                    ON l.assigned_to = u.id
                ORDER BY l.created_at DESC
            `;

        } else {

            query = `
                SELECT
                    l.*,
                    u.name AS assigned_name,
                    u.email AS assigned_email
                FROM leads l
                LEFT JOIN users u
                    ON l.assigned_to = u.id
                WHERE l.assigned_to = ?
                ORDER BY l.created_at DESC
            `;

            params = [req.user.id];
        }

        const [leads] = await pool.query(query, params);

        res.json({
            success: true,
            count: leads.length,
            leads
        });

    } catch (error) {
        console.error("Get leads error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch leads",
            error: error.message
        });
    }
};


// =====================================
// GET SINGLE LEAD
// =====================================
const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        const [leads] = await pool.query(
            `
            SELECT
                l.*,
                u.name AS assigned_name,
                u.email AS assigned_email
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [id]
        );

        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        const lead = leads[0];

        // Counsellors can only view their own leads.
        if (
            req.user.role === "counsellor" &&
            lead.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. You do not have permission to view this lead."
            });
        }

        res.json({
            success: true,
            lead
        });

    } catch (error) {
        console.error("Get lead by ID error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch lead",
            error: error.message
        });
    }
};


// =====================================
// UPDATE LEAD
// =====================================
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            phone,
            email,
            course,
            source,
            status,
            assigned_to,
            preferred_intake,
            notes,
            last_contacted_at,
            next_followup_at
        } = req.body;

        // Check whether lead exists
        const [existingLeads] = await pool.query(
            "SELECT * FROM leads WHERE id = ?",
            [id]
        );

        if (existingLeads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });
        }

        const existingLead = existingLeads[0];

        // Counsellors can update only their own assigned leads.
        if (
            req.user.role === "counsellor" &&
            existingLead.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. You cannot update this lead."
            });
        }

        // Counsellors cannot change lead assignment.
        // Managers can assign/reassign leads.
        let finalAssignedTo = existingLead.assigned_to;

        if (req.user.role === "manager") {
            finalAssignedTo =
                assigned_to !== undefined
                    ? assigned_to
                    : existingLead.assigned_to;
        }

        await pool.query(
            `
            UPDATE leads
            SET
                name = ?,
                phone = ?,
                email = ?,
                course = ?,
                source = ?,
                status = ?,
                assigned_to = ?,
                preferred_intake = ?,
                notes = ?,
                last_contacted_at = ?,
                next_followup_at = ?
            WHERE id = ?
            `,
            [
                name ?? existingLead.name,
                phone ?? existingLead.phone,
                email ?? existingLead.email,
                course ?? existingLead.course,
                source ?? existingLead.source,
                status ?? existingLead.status,
                finalAssignedTo,
                preferred_intake ?? existingLead.preferred_intake,
                notes ?? existingLead.notes,
                last_contacted_at ?? existingLead.last_contacted_at,
                next_followup_at ?? existingLead.next_followup_at,
                id
            ]
        );

        const [updatedLeads] = await pool.query(
            `
            SELECT
                l.*,
                u.name AS assigned_name,
                u.email AS assigned_email
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Lead updated successfully",
            lead: updatedLeads[0]
        });

    } catch (error) {
        console.error("Update lead error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update lead",
            error: error.message
        });
    }
};


module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead
};