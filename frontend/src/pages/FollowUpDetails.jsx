import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./FollowUpDetails.css";
import Sidebar from "../components/Sidebar";

function FollowUpDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [followup, setFollowup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !user) {
            navigate("/login");
            return;
        }

        fetchFollowup();
    }, [id]);

    const fetchFollowup = async () => {
        try {
            const response = await api.get(`/followups/${id}`);

            if (response.data.success) {
                const data = response.data.followup;

                setFollowup(data);
                setStatus(data.status || "Pending");
                setNotes(data.notes || "");
            }
        } catch (error) {
            console.error("Follow-up details error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load follow-up details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const response = await api.put(
                `/followups/${id}`,
                {
                    status,
                    notes
                }
            );

            if (response.data.success) {
                setFollowup(response.data.followup);
            }
        } catch (error) {
            console.error("Update follow-up error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to update follow-up."
            );
        } finally {
            setSaving(false);
        }
    };

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
        replace: true
    });
};

    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatStatus = (value) => {
        return value
            ?.toLowerCase()
            .replace(/\s+/g, "-");
    };

    if (loading) {
        return (
            <div className="followup-details-loading">
                Loading follow-up details...
            </div>
        );
    }

    if (!followup) {
        return (
            <div className="followup-details-loading">

                <p>
                    {error || "Follow-up not found."}
                </p>

                <button
                    onClick={() =>
                        navigate("/followups")
                    }
                >
                    Back to Follow-ups
                </button>

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
                        <h2>Follow-up Details</h2>
                        <p>
                            View and manage scheduled interaction
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

                <section className="followup-details-content">

                    <button
                        className="followup-back-button"
                        onClick={() =>
                            navigate("/followups")
                        }
                    >
                        ← Back to Follow-ups
                    </button>

                    {/* HEADER */}

                    <div className="followup-details-header">

                        <div className="followup-title">

                            <div className="large-followup-avatar">
                                {followup.lead_name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>

                                <p className="page-label">
                                    SCHEDULED FOLLOW-UP
                                </p>

                                <h1>
                                    {followup.lead_name}
                                </h1>

                                <p>
                                    Follow-up #{followup.id}
                                </p>

                            </div>

                        </div>

                        <span
                            className={`followup-details-status ${formatStatus(
                                followup.status
                            )}`}
                        >
                            {followup.status}
                        </span>

                    </div>

                    {error && (
                        <div className="followup-details-error">
                            {error}
                        </div>
                    )}

                    <div className="followup-details-grid">

                        {/* ================= LEFT ================= */}

                        <div className="followup-details-left">

                            <div className="followup-info-card">

                                <div className="followup-card-heading">
                                    <h3>
                                        Follow-up Information
                                    </h3>

                                    <p>
                                        Scheduled interaction details
                                    </p>
                                </div>

                                <div className="followup-info-grid">

                                    <div className="followup-info-item">
                                        <span>
                                            Lead
                                        </span>

                                        <strong>
                                            {followup.lead_name ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="followup-info-item">
                                        <span>
                                            Course
                                        </span>

                                        <strong>
                                            {followup.course ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="followup-info-item">
                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                followup.followup_date
                                            )}
                                        </strong>
                                    </div>

                                    <div className="followup-info-item">
                                        <span>
                                            Time
                                        </span>

                                        <strong>
                                            {followup.followup_time ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="followup-info-item">
                                        <span>
                                            Interaction Type
                                        </span>

                                        <strong>
                                            {followup.type ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="followup-info-item">
                                        <span>
                                            Counsellor
                                        </span>

                                        <strong>
                                            {followup.counsellor_name ||
                                                "Unassigned"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            <div className="followup-info-card">

                                <div className="followup-card-heading">
                                    <h3>
                                        Follow-up Notes
                                    </h3>

                                    <p>
                                        Information for the interaction
                                    </p>
                                </div>

                                <textarea
                                    className="followup-details-notes"
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(e.target.value)
                                    }
                                    placeholder="Add follow-up notes..."
                                />

                            </div>

                        </div>

                        {/* ================= RIGHT ================= */}

                        <div className="followup-details-right">

                            <div className="followup-info-card">

                                <div className="followup-card-heading">

                                    <h3>
                                        Update Follow-up
                                    </h3>

                                    <p>
                                        Change the current status
                                    </p>

                                </div>

                                <div className="followup-update-form">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                    >
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
                                        className="save-followup-details-button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </div>

                            <div className="followup-info-card">

                                <div className="followup-card-heading">
                                    <h3>
                                        Status Guide
                                    </h3>

                                    <p>
                                        Follow-up lifecycle
                                    </p>
                                </div>

                                <div className="status-guide">

                                    <div>
                                        <span className="guide-dot pending">
                                        </span>

                                        <div>
                                            <strong>
                                                Pending
                                            </strong>

                                            <p>
                                                Interaction is scheduled
                                                and awaiting completion.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="guide-dot completed">
                                        </span>

                                        <div>
                                            <strong>
                                                Completed
                                            </strong>

                                            <p>
                                                Interaction has been
                                                successfully completed.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="guide-dot missed">
                                        </span>

                                        <div>
                                            <strong>
                                                Missed
                                            </strong>

                                            <p>
                                                Scheduled interaction
                                                was not completed.
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default FollowUpDetails;