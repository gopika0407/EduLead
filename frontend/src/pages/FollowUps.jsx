import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./FollowUps.css";
import Sidebar from "../components/Sidebar";
function FollowUps() {
    const navigate = useNavigate();

    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !user) {
            navigate("/login");
            return;
        }

        fetchFollowups();
    }, []);

    const fetchFollowups = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/followups");

            if (response.data.success) {
                setFollowups(response.data.followups || []);
            }
        } catch (error) {
            console.error("Follow-ups error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load follow-ups."
            );
        } finally {
            setLoading(false);
        }
    };

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
        replace: true
    });
};

    const getStatusClass = (status) => {
        return status
            ?.toLowerCase()
            .replace(/\s+/g, "-");
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const filteredFollowups = followups.filter((followup) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            followup.lead_name
                ?.toLowerCase()
                .includes(searchValue) ||
            followup.type
                ?.toLowerCase()
                .includes(searchValue) ||
            followup.notes
                ?.toLowerCase()
                .includes(searchValue);

        const matchesStatus =
            statusFilter === "All" ||
            followup.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalFollowups = followups.length;

    const pendingFollowups = followups.filter(
        (item) => item.status === "Pending"
    ).length;

    const completedFollowups = followups.filter(
        (item) => item.status === "Completed"
    ).length;

    const missedFollowups = followups.filter(
        (item) => item.status === "Missed"
    ).length;

    if (loading) {
        return (
            <div className="followups-loading">
                Loading follow-ups...
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* ================= SIDEBAR ================= */}

           <Sidebar />

            {/* ================= MAIN ================= */}

            <main className="dashboard-main">

                <header className="dashboard-topbar">

                    <div>
                        <h2>Follow-ups</h2>
                        <p>
                            Manage upcoming admission activities
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

                {/* ================= CONTENT ================= */}

                <section className="followups-content">

                    <div className="followups-heading">

                        <div>

                            <p className="page-label">
                                ADMISSIONS
                            </p>

                            <h1>Follow-ups</h1>

                            <p>
                                Stay on top of your student
                                interactions.
                            </p>

                        </div>

                        <button
                            className="add-followup-button"
                            onClick={() =>
                                navigate("/followups/add")
                            }
                        >
                            + Add Follow-up
                        </button>

                    </div>

                    {/* ================= SUMMARY ================= */}

                    <div className="followup-summary">

                        <div className="followup-summary-card">

                            <div className="summary-icon blue">
                                ◉
                            </div>

                            <div>
                                <span>Total</span>
                                <strong>
                                    {totalFollowups}
                                </strong>
                            </div>

                        </div>

                        <div className="followup-summary-card">

                            <div className="summary-icon orange">
                                ◷
                            </div>

                            <div>
                                <span>Pending</span>
                                <strong>
                                    {pendingFollowups}
                                </strong>
                            </div>

                        </div>

                        <div className="followup-summary-card">

                            <div className="summary-icon green">
                                ✓
                            </div>

                            <div>
                                <span>Completed</span>
                                <strong>
                                    {completedFollowups}
                                </strong>
                            </div>

                        </div>

                        <div className="followup-summary-card">

                            <div className="summary-icon red">
                                !
                            </div>

                            <div>
                                <span>Missed</span>
                                <strong>
                                    {missedFollowups}
                                </strong>
                            </div>

                        </div>

                    </div>

                    {/* ================= TOOLBAR ================= */}

                    <div className="followups-toolbar">

                        <div className="followup-search">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search follow-ups..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="All">
                                All Status
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Missed">
                                Missed
                            </option>

                        </select>

                        <button
                            className="followup-refresh"
                            onClick={fetchFollowups}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (
                        <div className="followups-error">
                            {error}
                        </div>
                    )}

                    {/* ================= TABLE ================= */}

                    <div className="followups-card">

                        <div className="followups-card-header">

                            <div>
                                <h3>
                                    Follow-up Schedule
                                </h3>

                                <p>
                                    {filteredFollowups.length} follow-up
                                    {filteredFollowups.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                        </div>

                        {filteredFollowups.length === 0 ? (

                            <div className="empty-followups">

                                <div className="empty-followup-icon">
                                    ✓
                                </div>

                                <h3>
                                    No follow-ups found
                                </h3>

                                <p>
                                    Create a follow-up to keep track
                                    of your next student interaction.
                                </p>

                            </div>

                        ) : (

                            <div className="followups-table-wrapper">

                                <table className="followups-table">

                                    <thead>

                                        <tr>
                                            <th>Lead</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Type</th>
                                            <th>Counsellor</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th></th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredFollowups.map(
                                            (followup) => (

                                                <tr
                                                    key={
                                                        followup.id
                                                    }
                                                >

                                                    <td>
                                                        <div className="followup-lead">

                                                            <div className="followup-avatar">
                                                                {followup.lead_name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        followup.lead_name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Lead #
                                                                    {
                                                                        followup.lead_id
                                                                    }
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="followup-date">
                                                            {formatDate(
                                                                followup.followup_date
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {followup.followup_time ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <span className="followup-type">
                                                            {
                                                                followup.type
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            followup.counsellor_name ||
                                                            "Unassigned"
                                                        }
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`followup-status ${getStatusClass(
                                                                followup.status
                                                            )}`}
                                                        >
                                                            {
                                                                followup.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="followup-notes">
                                                            {followup.notes ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="followup-view-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/followups/${followup.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default FollowUps;