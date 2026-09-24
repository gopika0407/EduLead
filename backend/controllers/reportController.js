const pool = require("../config/db");

// =====================================
// GET REPORT OVERVIEW
// GET /api/reports/overview
// =====================================
const getReportOverview = async (req, res) => {
    try {
        let leadCondition = "";
        let followupCondition = "";

        const leadParams = [];
        const followupParams = [];

        // Manager sees all data
        if (req.user.role === "manager") {
            leadCondition = "";
            followupCondition = "";
        }

        // Counsellor sees only assigned leads/follow-ups
        else if (req.user.role === "counsellor") {
            leadCondition = "WHERE assigned_to = ?";
            followupCondition = "WHERE counsellor_id = ?";

            leadParams.push(req.user.id);
            followupParams.push(req.user.id);
        }

        // =====================================
        // TOTAL LEADS
        // =====================================
        const [totalResult] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM leads
            ${leadCondition}
            `,
            leadParams
        );

        // =====================================
        // LEADS BY STATUS
        // =====================================
        const [statusResult] = await pool.query(
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

        // =====================================
        // LEADS BY SOURCE
        // =====================================
        const [sourceResult] = await pool.query(
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

        // =====================================
        // CONVERTED LEADS
        // =====================================
        const [convertedResult] = await pool.query(
            `
            SELECT COUNT(*) AS converted
            FROM leads
            ${leadCondition ? leadCondition + " AND status = 'Converted'" : "WHERE status = 'Converted'"}
            `,
            leadParams
        );

        // =====================================
        // FOLLOW-UP SUMMARY
        // =====================================
        const [followupResult] = await pool.query(
            `
            SELECT
                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN status = 'Pending' THEN 1
                        ELSE 0
                    END
                ) AS pending,

                SUM(
                    CASE
                        WHEN status = 'Completed' THEN 1
                        ELSE 0
                    END
                ) AS completed,

                SUM(
                    CASE
                        WHEN status = 'Missed' THEN 1
                        ELSE 0
                    END
                ) AS missed

            FROM followups
            ${followupCondition}
            `,
            followupParams
        );

        // =====================================
        // LEAD AGEING
        // =====================================
        const ageingCondition = leadCondition
            ? `${leadCondition} AND status NOT IN ('Converted', 'Not Interested')`
            : `WHERE status NOT IN ('Converted', 'Not Interested')`;

        const ageingParams = [...leadParams];

        const [ageingResult] = await pool.query(
            `
            SELECT
                SUM(
                    CASE
                        WHEN DATEDIFF(CURDATE(), DATE(created_at)) BETWEEN 0 AND 3
                        THEN 1
                        ELSE 0
                    END
                ) AS age_0_3,

                SUM(
                    CASE
                        WHEN DATEDIFF(CURDATE(), DATE(created_at)) BETWEEN 4 AND 7
                        THEN 1
                        ELSE 0
                    END
                ) AS age_4_7,

                SUM(
                    CASE
                        WHEN DATEDIFF(CURDATE(), DATE(created_at)) BETWEEN 8 AND 14
                        THEN 1
                        ELSE 0
                    END
                ) AS age_8_14,

                SUM(
                    CASE
                        WHEN DATEDIFF(CURDATE(), DATE(created_at)) >= 15
                        THEN 1
                        ELSE 0
                    END
                ) AS age_15_plus

            FROM leads
            ${ageingCondition}
            `,
            ageingParams
        );

        // =====================================
        // CONVERSION RATE
        // =====================================
        const totalLeads = Number(totalResult[0].total || 0);
        const convertedLeads = Number(
            convertedResult[0].converted || 0
        );

        const conversionRate =
            totalLeads > 0
                ? Number(
                    ((convertedLeads / totalLeads) * 100).toFixed(2)
                )
                : 0;

        // =====================================
        // RESPONSE
        // =====================================
        res.json({
            success: true,

            report: {
                total_leads: totalLeads,

                converted_leads: convertedLeads,

                conversion_rate: conversionRate,

                status_breakdown: statusResult,

                source_breakdown: sourceResult,

                followups: {
                    total: Number(
                        followupResult[0].total || 0
                    ),
                    pending: Number(
                        followupResult[0].pending || 0
                    ),
                    completed: Number(
                        followupResult[0].completed || 0
                    ),
                    missed: Number(
                        followupResult[0].missed || 0
                    )
                },

                ageing: {
                    "0_3_days": Number(
                        ageingResult[0].age_0_3 || 0
                    ),
                    "4_7_days": Number(
                        ageingResult[0].age_4_7 || 0
                    ),
                    "8_14_days": Number(
                        ageingResult[0].age_8_14 || 0
                    ),
                    "15_plus_days": Number(
                        ageingResult[0].age_15_plus || 0
                    )
                }
            }
        });

    } catch (error) {
        console.error("Report overview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: error.message
        });
    }
};

module.exports = {
    getReportOverview
};