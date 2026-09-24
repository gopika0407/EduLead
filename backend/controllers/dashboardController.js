const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        let leadCondition = "";
        let followupCondition = "";
        let params = [];

        // Manager can see all data
        if (req.user.role === "manager") {
            leadCondition = "";
            followupCondition = "";
        }

        // Counsellor can see only their assigned data
        else if (req.user.role === "counsellor") {
            leadCondition = "WHERE assigned_to = ?";
            followupCondition = "WHERE counsellor_id = ?";
            params = [req.user.id];
        }

        // -------------------------------------
        // LEAD COUNTS
        // -------------------------------------
        const leadParams = req.user.role === "counsellor"
            ? [req.user.id]
            : [];

        const [leadStats] = await pool.query(
            `
            SELECT
                COUNT(*) AS total_leads,

                SUM(CASE
                    WHEN status = 'New' THEN 1
                    ELSE 0
                END) AS new_leads,

                SUM(CASE
                    WHEN status = 'Contacted' THEN 1
                    ELSE 0
                END) AS contacted_leads,

                SUM(CASE
                    WHEN status = 'Interested' THEN 1
                    ELSE 0
                END) AS interested_leads,

                SUM(CASE
                    WHEN status = 'Follow-up' THEN 1
                    ELSE 0
                END) AS followup_leads,

                SUM(CASE
                    WHEN status = 'Application' THEN 1
                    ELSE 0
                END) AS application_leads,

                SUM(CASE
                    WHEN status = 'Converted' THEN 1
                    ELSE 0
                END) AS converted_leads,

                SUM(CASE
                    WHEN status = 'Not Interested' THEN 1
                    ELSE 0
                END) AS not_interested_leads

            FROM leads
            ${leadCondition}
            `,
            leadParams
        );

        // -------------------------------------
        // FOLLOW-UP COUNTS
        // -------------------------------------
        const followupParams = req.user.role === "counsellor"
            ? [req.user.id]
            : [];

        const [followupStats] = await pool.query(
            `
            SELECT
                COUNT(*) AS total_followups,

                SUM(CASE
                    WHEN status = 'Pending' THEN 1
                    ELSE 0
                END) AS pending_followups,

                SUM(CASE
                    WHEN status = 'Completed' THEN 1
                    ELSE 0
                END) AS completed_followups,

                SUM(CASE
                    WHEN status = 'Missed' THEN 1
                    ELSE 0
                END) AS missed_followups

            FROM followups
            ${followupCondition}
            `,
            followupParams
        );

        // -------------------------------------
        // LEAD SOURCES
        // -------------------------------------
        const [sourceStats] = await pool.query(
            `
            SELECT
                source,
                COUNT(*) AS count
            FROM leads
            ${leadCondition}
            GROUP BY source
            ORDER BY count DESC
            `,
            leadParams
        );

        // -------------------------------------
        // LEAD STATUS DISTRIBUTION
        // -------------------------------------
        const [statusStats] = await pool.query(
            `
            SELECT
                status,
                COUNT(*) AS count
            FROM leads
            ${leadCondition}
            GROUP BY status
            ORDER BY count DESC
            `,
            leadParams
        );

        // -------------------------------------
        // TODAY'S FOLLOW-UPS
        // -------------------------------------
        const todayFollowupParams = req.user.role === "counsellor"
            ? [req.user.id]
            : [];

        const [todayFollowups] = await pool.query(
            `
            SELECT
                f.id,
                f.lead_id,
                f.followup_date,
                f.followup_time,
                f.type,
                f.status,
                l.name AS lead_name,
                l.phone AS lead_phone
            FROM followups f
            INNER JOIN leads l
                ON f.lead_id = l.id
            WHERE f.followup_date = CURDATE()
            ${req.user.role === "counsellor" ? "AND f.counsellor_id = ?" : ""}
            ORDER BY f.followup_time ASC
            `,
            todayFollowupParams
        );

        res.json({
            success: true,

            stats: {
                leads: {
                    total: Number(leadStats[0].total_leads || 0),
                    new: Number(leadStats[0].new_leads || 0),
                    contacted: Number(leadStats[0].contacted_leads || 0),
                    interested: Number(leadStats[0].interested_leads || 0),
                    followup: Number(leadStats[0].followup_leads || 0),
                    application: Number(leadStats[0].application_leads || 0),
                    converted: Number(leadStats[0].converted_leads || 0),
                    not_interested: Number(
                        leadStats[0].not_interested_leads || 0
                    )
                },

                followups: {
                    total: Number(
                        followupStats[0].total_followups || 0
                    ),
                    pending: Number(
                        followupStats[0].pending_followups || 0
                    ),
                    completed: Number(
                        followupStats[0].completed_followups || 0
                    ),
                    missed: Number(
                        followupStats[0].missed_followups || 0
                    )
                },

                sources: sourceStats,

                status_distribution: statusStats,

                today_followups: todayFollowups
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats
};