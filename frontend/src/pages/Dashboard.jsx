import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(JSON.parse(storedUser));

        const fetchDashboardStats = async () => {
            try {
                const response = await api.get("/dashboard/stats");

                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Dashboard error:", error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
        replace: true
    });
};

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>

                <button onClick={handleLogout}>
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* ===============================
                SIDEBAR
            =============================== */}

            <Sidebar />

            {/* ===============================
                MAIN CONTENT
            =============================== */}

            <main className="dashboard-main">

                {/* TOPBAR */}

                <header className="dashboard-topbar">

                    <div>
                        <h2>Dashboard</h2>
                        <p>Admission overview</p>
                    </div>

                    {user && (
                        <div className="user-profile">

                            <div className="user-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="user-info">
                                <strong>{user.name}</strong>
                                <span>{user.role}</span>
                            </div>

                        </div>
                    )}

                </header>


                {/* CONTENT */}

                <section className="dashboard-content">

                    <div className="welcome-section">
                        <p className="welcome-label">
                            OVERVIEW
                        </p>

                        <h1>
                            Welcome back, {user?.name?.split(" ")[0]}
                        </h1>

                        <p>
                            Here's what's happening with your admissions today.
                        </p>
                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="dashboard-inline-error">
                            {error}
                        </div>
                    )}


                    {/* ===============================
                        STAT CARDS
                    =============================== */}

                    <div className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-card-top">
                                <span>Total Leads</span>
                                <div className="stat-icon blue">
                                    ◉
                                </div>
                            </div>

                            <strong>
                                {stats?.leads?.total ?? 0}
                            </strong>

                            <p>All admission leads</p>
                        </div>


                        <div className="stat-card">
                            <div className="stat-card-top">
                                <span>New Leads</span>
                                <div className="stat-icon teal">
                                    +
                                </div>
                            </div>

                            <strong>
                                {stats?.leads?.new ?? 0}
                            </strong>

                            <p>Awaiting first contact</p>
                        </div>


                        <div className="stat-card">
                            <div className="stat-card-top">
                                <span>Follow-ups</span>
                                <div className="stat-icon orange">
                                    ✓
                                </div>
                            </div>

                            <strong>
                                {stats?.followups?.pending ?? 0}
                            </strong>

                            <p>Pending follow-ups</p>
                        </div>


                        <div className="stat-card">
                            <div className="stat-card-top">
                                <span>Converted</span>
                                <div className="stat-icon green">
                                    ↗
                                </div>
                            </div>

                            <strong>
                                {stats?.leads?.converted ?? 0}
                            </strong>

                            <p>Successful admissions</p>
                        </div>

                    </div>


                    {/* ===============================
                        ANALYTICS
                    =============================== */}

                    <div className="dashboard-grid">

                        {/* LEAD STATUS */}

                        <div className="dashboard-card">

                            <div className="card-header">
                                <div>
                                    <h3>Lead Overview</h3>
                                    <p>Current lead distribution</p>
                                </div>
                            </div>

                            <div className="status-list">

                                <div className="status-row">
                                    <span>New</span>
                                    <strong>
                                        {stats?.leads?.new ?? 0}
                                    </strong>
                                </div>

                                <div className="status-row">
                                    <span>Contacted</span>
                                    <strong>
                                        {stats?.leads?.contacted ?? 0}
                                    </strong>
                                </div>

                                <div className="status-row">
                                    <span>Interested</span>
                                    <strong>
                                        {stats?.leads?.interested ?? 0}
                                    </strong>
                                </div>

                                <div className="status-row">
                                    <span>Application</span>
                                    <strong>
                                        {stats?.leads?.application ?? 0}
                                    </strong>
                                </div>

                                <div className="status-row">
                                    <span>Converted</span>
                                    <strong>
                                        {stats?.leads?.converted ?? 0}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* LEAD SOURCES */}

                        <div className="dashboard-card">

                            <div className="card-header">
                                <div>
                                    <h3>Lead Sources</h3>
                                    <p>Where your leads come from</p>
                                </div>
                            </div>

                            <div className="source-list">

                                {stats?.sources?.length > 0 ? (
                                    stats.sources.map((source) => (
                                        <div
                                            className="source-row"
                                            key={source.source}
                                        >
                                            <span>
                                                {source.source}
                                            </span>

                                            <strong>
                                                {source.count}
                                            </strong>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">
                                        No lead source data available.
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;