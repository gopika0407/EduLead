import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Reports.css";
import Sidebar from "../components/Sidebar";

function Reports() {
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !user) {
            navigate("/login");
            return;
        }

        fetchReport();
    }, []);

    // =====================================
    // FETCH REPORT
    // =====================================
    const fetchReport = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/reports/overview");

            console.log("Reports API response:", response.data);

            if (response.data.success) {
                /*
                    Supports both possible backend formats:

                    1. {
                        success: true,
                        report: {...}
                    }

                    2. {
                        success: true,
                        total_leads: 10,
                        ...
                    }
                */
                const reportData =
                    response.data.report ||
                    response.data;

                setReport(reportData);
            } else {
                setError(
                    response.data.message ||
                    "Unable to load reports."
                );
            }

        } catch (error) {
            console.error(
                "Reports fetch error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load reports."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // LOGOUT
    // =====================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
        replace: true
    });
};
    // =====================================
    // PERCENTAGE
    // =====================================
    const getPercentage = (value, total) => {
        if (!total || !value) {
            return 0;
        }

        return Math.round(
            (Number(value) / Number(total)) * 100
        );
    };

    // =====================================
    // LOADING
    // =====================================
    if (loading) {
        return (
            <div className="reports-loading">
                Loading reports...
            </div>
        );
    }

    // =====================================
    // ERROR
    // =====================================
    if (!report) {
        return (
            <div className="reports-loading">

                <p>
                    {error || "Unable to load reports."}
                </p>

                <button onClick={fetchReport}>
                    Try Again
                </button>

            </div>
        );
    }

    // =====================================
    // REPORT DATA
    // =====================================

    const totalLeads =
        Number(report.total_leads) || 0;

    const convertedLeads =
        Number(report.converted_leads) || 0;

    const conversionRate =
        report.conversion_rate !== undefined
            ? report.conversion_rate
            : getPercentage(
                convertedLeads,
                totalLeads
            );

    const statusData =
        report.status_breakdown || [];

    const sourceData =
        report.source_breakdown || [];

    const ageing =
        report.ageing || {};

    const followups =
        report.followups || {};

    return (
        <div className="dashboard-page">

            {/* =====================================
                SIDEBAR
            ===================================== */}
                <Sidebar /> 

            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main className="dashboard-main">

                {/* TOPBAR */}

                <header className="dashboard-topbar">

                    <div>

                        <h2>
                            Reports & Insights
                        </h2>

                        <p>
                            Admission performance and lead analytics
                        </p>

                    </div>

                    {user && (
                        <div className="user-profile">

                            <div className="user-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="user-info">

                                <strong>
                                    {user.name}
                                </strong>

                                <span>
                                    {user.role}
                                </span>

                            </div>

                        </div>
                    )}

                </header>

                {/* =====================================
                    REPORT CONTENT
                ===================================== */}

                <section className="reports-content">

                    {/* =================================
                        KPI CARDS
                    ================================= */}

                    <div className="reports-kpi-grid">

                        {/* TOTAL LEADS */}

                        <div className="report-kpi-card">

                            <div className="report-kpi-icon blue">
                                ◉
                            </div>

                            <div>

                                <span>
                                    Total Leads
                                </span>

                                <strong>
                                    {totalLeads}
                                </strong>

                            </div>

                        </div>

                        {/* CONVERTED */}

                        <div className="report-kpi-card">

                            <div className="report-kpi-icon green">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Converted Leads
                                </span>

                                <strong>
                                    {convertedLeads}
                                </strong>

                            </div>

                        </div>

                        {/* CONVERSION RATE */}

                        <div className="report-kpi-card">

                            <div className="report-kpi-icon purple">
                                %
                            </div>

                            <div>

                                <span>
                                    Conversion Rate
                                </span>

                                <strong>
                                    {conversionRate}%
                                </strong>

                            </div>

                        </div>

                        {/* PENDING FOLLOWUPS */}

                        <div className="report-kpi-card">

                            <div className="report-kpi-icon orange">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Pending Follow-ups
                                </span>

                                <strong>
                                    {Number(
                                        followups.pending
                                    ) || 0}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* =================================
                        STATUS + SOURCE
                    ================================= */}

                    <div className="reports-two-column">

                        {/* =============================
                            LEAD STATUS
                        ============================= */}

                        <div className="report-card">

                            <div className="report-card-header">

                                <div>

                                    <h3>
                                        Lead Status
                                    </h3>

                                    <p>
                                        Current lead lifecycle distribution
                                    </p>

                                </div>

                            </div>

                            <div className="status-report-list">

                                {statusData.length === 0 ? (

                                    <p className="empty-report">
                                        No status data available.
                                    </p>

                                ) : (

                                    statusData.map(
                                        (item, index) => {

                                            const status =
                                                item.status ||
                                                item.name ||
                                                "Unknown";

                                            const count =
                                                Number(
                                                    item.count
                                                ) || 0;

                                            const percentage =
                                                getPercentage(
                                                    count,
                                                    totalLeads
                                                );

                                            return (
                                                <div
                                                    className="status-report-item"
                                                    key={`${status}-${index}`}
                                                >

                                                    <div className="status-report-top">

                                                        <span>
                                                            {status}
                                                        </span>

                                                        <strong>
                                                            {count}
                                                        </strong>

                                                    </div>

                                                    <div className="report-progress">

                                                        <div
                                                            style={{
                                                                width: `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )

                                )}

                            </div>

                        </div>

                        {/* =============================
                            LEAD SOURCES
                        ============================= */}

                        <div className="report-card">

                            <div className="report-card-header">

                                <div>

                                    <h3>
                                        Lead Sources
                                    </h3>

                                    <p>
                                        Where your leads are coming from
                                    </p>

                                </div>

                            </div>

                            <div className="source-report-list">

                                {sourceData.length === 0 ? (

                                    <p className="empty-report">
                                        No source data available.
                                    </p>

                                ) : (

                                    sourceData.map(
                                        (item, index) => {

                                            const source =
                                                item.source ||
                                                item.name ||
                                                "Unknown";

                                            const count =
                                                Number(
                                                    item.count
                                                ) || 0;

                                            const percentage =
                                                getPercentage(
                                                    count,
                                                    totalLeads
                                                );

                                            return (
                                                <div
                                                    className="source-report-item"
                                                    key={`${source}-${index}`}
                                                >

                                                    <div className="source-report-top">

                                                        <span>
                                                            {source}
                                                        </span>

                                                        <strong>
                                                            {count}
                                                        </strong>

                                                    </div>

                                                    <div className="report-progress">

                                                        <div
                                                            style={{
                                                                width: `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )

                                )}

                            </div>

                        </div>

                    </div>

                    {/* =================================
                        LEAD AGEING
                    ================================= */}

                    <div className="report-card">

                        <div className="report-card-header">

                            <div>

                                <h3>
                                    Lead Ageing
                                </h3>

                                <p>
                                    Active leads grouped by how long
                                    they have been in the system
                                </p>

                            </div>

                        </div>

                        <div className="ageing-grid">

                            <div className="ageing-item">

                                <span>
                                    0–3 Days
                                </span>

                                <strong>
                                    {Number(
                                        ageing["0_3_days"]
                                    ) || 0}
                                </strong>

                                <small>
                                    Fresh leads
                                </small>

                            </div>

                            <div className="ageing-item">

                                <span>
                                    4–7 Days
                                </span>

                                <strong>
                                    {Number(
                                        ageing["4_7_days"]
                                    ) || 0}
                                </strong>

                                <small>
                                    Needs attention
                                </small>

                            </div>

                            <div className="ageing-item">

                                <span>
                                    8–14 Days
                                </span>

                                <strong>
                                    {Number(
                                        ageing["8_14_days"]
                                    ) || 0}
                                </strong>

                                <small>
                                    Follow-up risk
                                </small>

                            </div>

                            <div className="ageing-item">

                                <span>
                                    15+ Days
                                </span>

                                <strong>
                                    {Number(
                                        ageing["15_plus_days"]
                                    ) || 0}
                                </strong>

                                <small>
                                    Long-running leads
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* =================================
                        FOLLOW-UP PERFORMANCE
                    ================================= */}

                    <div className="report-card">

                        <div className="report-card-header">

                            <div>

                                <h3>
                                    Follow-up Performance
                                </h3>

                                <p>
                                    Current follow-up activity
                                </p>

                            </div>

                        </div>

                        <div className="followup-report-grid">

                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {Number(
                                        followups.total
                                    ) || 0}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {Number(
                                        followups.pending
                                    ) || 0}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Completed
                                </span>

                                <strong>
                                    {Number(
                                        followups.completed
                                    ) || 0}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Missed
                                </span>

                                <strong>
                                    {Number(
                                        followups.missed
                                    ) || 0}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Reports;