import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./LeadDetails.css";
import Sidebar from "../components/Sidebar";

function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [activities, setActivities] = useState([]);
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

        fetchLeadDetails();
        fetchActivities();
    }, [id]);

    const fetchLeadDetails = async () => {
        try {
            const response = await api.get(`/leads/${id}`);

            if (response.data.success) {
                const leadData = response.data.lead;

                setLead(leadData);
                setStatus(leadData.status || "");
                setNotes(leadData.notes || "");
            }
        } catch (error) {
            console.error("Lead details error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load lead details."
            );
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await api.get(
                `/leads/${id}/activities`
            );

            if (response.data.success) {
                setActivities(response.data.activities || []);
            }
        } catch (error) {
            console.error("Activities error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const response = await api.put(
                `/leads/${id}`,
                {
                    status,
                    notes
                }
            );

            if (response.data.success) {
                setLead(response.data.lead);
            }
        } catch (error) {
            console.error("Update lead error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to update lead."
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

    const getStatusClass = (value) => {
        return value
            ?.toLowerCase()
            .replace(/\s+/g, "-");
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

    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    if (loading) {
        return (
            <div className="lead-details-loading">
                Loading lead details...
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="lead-details-loading">
                <p>
                    {error || "Lead not found."}
                </p>

                <button
                    onClick={() => navigate("/leads")}
                >
                    Back to Leads
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

                {/* TOPBAR */}

                <header className="dashboard-topbar">

                    <div>
                        <h2>Lead Details</h2>
                        <p>
                            View and manage admission enquiry
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

                <section className="lead-details-content">

                    {/* BACK */}

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/leads")
                        }
                    >
                        ← Back to Leads
                    </button>

                    {/* HEADER */}

                    <div className="lead-details-header">

                        <div className="lead-title">

                            <div className="large-lead-avatar">
                                {lead.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <p className="page-label">
                                    ADMISSION LEAD
                                </p>

                                <h1>{lead.name}</h1>

                                <p>
                                    Lead #{lead.id} · Created{" "}
                                    {formatDate(
                                        lead.created_at
                                    )}
                                </p>
                            </div>

                        </div>

                        <span
                            className={`details-status ${getStatusClass(
                                lead.status
                            )}`}
                        >
                            {lead.status}
                        </span>

                    </div>

                    {error && (
                        <div className="lead-details-error">
                            {error}
                        </div>
                    )}

                    <div className="lead-details-grid">

                        {/* ================= LEFT ================= */}

                        <div className="lead-details-left">

                            {/* CONTACT */}

                            <div className="details-card">

                                <div className="details-card-header">
                                    <div>
                                        <h3>
                                            Contact Information
                                        </h3>

                                        <p>
                                            Student contact details
                                        </p>
                                    </div>
                                </div>

                                <div className="details-info-grid">

                                    <div className="info-item">
                                        <span>Phone</span>
                                        <strong>
                                            {lead.phone || "-"}
                                        </strong>
                                    </div>

                                    <div className="info-item">
                                        <span>Email</span>
                                        <strong>
                                            {lead.email || "-"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* ADMISSION */}

                            <div className="details-card">

                                <div className="details-card-header">
                                    <div>
                                        <h3>
                                            Admission Information
                                        </h3>

                                        <p>
                                            Course and enquiry details
                                        </p>
                                    </div>
                                </div>

                                <div className="details-info-grid">

                                    <div className="info-item">
                                        <span>
                                            Interested Course
                                        </span>

                                        <strong>
                                            {lead.course || "-"}
                                        </strong>
                                    </div>

                                    <div className="info-item">
                                        <span>
                                            Lead Source
                                        </span>

                                        <strong>
                                            {lead.source || "-"}
                                        </strong>
                                    </div>

                                    <div className="info-item">
                                        <span>
                                            Preferred Intake
                                        </span>

                                        <strong>
                                            {lead.preferred_intake ||
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="info-item">
                                        <span>
                                            Assigned Counsellor
                                        </span>

                                        <strong>
                                            {lead.assigned_name ||
                                                "Unassigned"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* NOTES */}

                            <div className="details-card">

                                <div className="details-card-header">
                                    <div>
                                        <h3>
                                            Lead Notes
                                        </h3>

                                        <p>
                                            Additional enquiry information
                                        </p>
                                    </div>
                                </div>

                                <textarea
                                    className="details-notes"
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(e.target.value)
                                    }
                                    placeholder="Add notes about this lead..."
                                />

                            </div>

                        </div>

                        {/* ================= RIGHT ================= */}

                        <div className="lead-details-right">

                            {/* UPDATE */}

                            <div className="details-card">

                                <div className="details-card-header">
                                    <div>
                                        <h3>
                                            Update Lead
                                        </h3>

                                        <p>
                                            Update the current lead status
                                        </p>
                                    </div>
                                </div>

                                <div className="update-form">

                                    <label>
                                        Lead Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="New">
                                            New
                                        </option>

                                        <option value="Contacted">
                                            Contacted
                                        </option>

                                        <option value="Interested">
                                            Interested
                                        </option>

                                        <option value="Follow-up">
                                            Follow-up
                                        </option>

                                        <option value="Application">
                                            Application
                                        </option>

                                        <option value="Converted">
                                            Converted
                                        </option>

                                        <option value="Not Interested">
                                            Not Interested
                                        </option>
                                    </select>

                                    <button
                                        className="save-details-button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </div>

                            {/* ACTIVITY */}

                            <div className="details-card activity-card">

                                <div className="details-card-header">
                                    <div>
                                        <h3>
                                            Activity History
                                        </h3>

                                        <p>
                                            Recent lead interactions
                                        </p>
                                    </div>
                                </div>

                                {activities.length === 0 ? (

                                    <div className="empty-activity">
                                        <div className="empty-activity-icon">
                                            ✓
                                        </div>

                                        <p>
                                            No activity recorded yet.
                                        </p>
                                    </div>

                                ) : (

                                    <div className="activity-list">

                                        {activities.map(
                                            (activity) => (

                                                <div
                                                    className="activity-item"
                                                    key={activity.id}
                                                >

                                                    <div className="activity-dot">
                                                    </div>

                                                    <div className="activity-content">

                                                        <div className="activity-top">
                                                            <strong>
                                                                {activity.activity_type}
                                                            </strong>

                                                            <span>
                                                                {formatDateTime(
                                                                    activity.created_at
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p>
                                                            {
                                                                activity.description
                                                            }
                                                        </p>

                                                        {activity.user_name && (
                                                            <small>
                                                                By{" "}
                                                                {
                                                                    activity.user_name
                                                                }
                                                            </small>
                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default LeadDetails;