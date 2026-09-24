import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AddFollowUp.css";
import Sidebar from "../components/Sidebar";

function AddFollowUp() {
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        lead_id: "",
        followup_date: "",
        followup_time: "",
        type: "Call",
        notes: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            navigate("/login");
            return;
        }

        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoadingLeads(true);

            const response = await api.get("/leads");

            if (response.data.success) {
                setLeads(response.data.leads || []);
            }
        } catch (error) {
            console.error("Leads error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load leads."
            );
        } finally {
            setLoadingLeads(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !formData.lead_id ||
            !formData.followup_date ||
            !formData.followup_time ||
            !formData.type
        ) {
            setError(
                "Please fill in all required fields."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await api.post(
                "/followups",
                formData
            );

            if (response.data.success) {
                navigate("/followups");
            }
        } catch (error) {
            console.error(
                "Create follow-up error:",
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
                "Unable to create follow-up."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/followups");
    };

    return (
        <div className="dashboard-page">

            {/* ================= SIDEBAR ================= */}

           <Sidebar />
            {/* ================= MAIN ================= */}

            <main className="dashboard-main">

                <header className="dashboard-topbar">

                    <div>
                        <h2>Add Follow-up</h2>

                        <p>
                            Schedule a student interaction
                        </p>
                    </div>

                    {(() => {
                        const user = JSON.parse(
                            localStorage.getItem("user")
                        );

                        return user ? (
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
                        ) : null;
                    })()}

                </header>

                {/* ================= CONTENT ================= */}

                <section className="add-followup-content">

                    <div className="add-followup-heading">

                        <button
                            className="back-button"
                            onClick={handleCancel}
                        >
                            ← Back to Follow-ups
                        </button>

                        <p className="page-label">
                            ADMISSIONS
                        </p>

                        <h1>
                            Schedule Follow-up
                        </h1>

                        <p>
                            Plan the next interaction with
                            a prospective student.
                        </p>

                    </div>

                    <form
                        className="add-followup-card"
                        onSubmit={handleSubmit}
                    >

                        {/* ================= FOLLOW-UP DETAILS ================= */}

                        <div className="form-section">

                            <div className="section-heading">

                                <h3>
                                    Follow-up Details
                                </h3>

                                <p>
                                    Select the lead and schedule
                                    the next interaction.
                                </p>

                            </div>

                            <div className="form-grid">

                                <div className="form-field full-width">

                                    <label>
                                        Lead
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="lead_id"
                                        value={
                                            formData.lead_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loadingLeads
                                        }
                                    >
                                        <option value="">
                                            {loadingLeads
                                                ? "Loading leads..."
                                                : "Select a lead"}
                                        </option>

                                        {leads.map(
                                            (lead) => (
                                                <option
                                                    key={
                                                        lead.id
                                                    }
                                                    value={
                                                        lead.id
                                                    }
                                                >
                                                    {lead.name} —{" "}
                                                    {lead.course}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="form-field">

                                    <label>
                                        Follow-up Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="followup_date"
                                        value={
                                            formData.followup_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Follow-up Time
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="time"
                                        name="followup_time"
                                        value={
                                            formData.followup_time
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Interaction Type
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="type"
                                        value={
                                            formData.type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="Call">
                                            Call
                                        </option>

                                        <option value="WhatsApp">
                                            WhatsApp
                                        </option>

                                        <option value="Email">
                                            Email
                                        </option>

                                        <option value="Meeting">
                                            Meeting
                                        </option>
                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* ================= NOTES ================= */}

                        <div className="form-section">

                            <div className="section-heading">

                                <h3>
                                    Follow-up Notes
                                </h3>

                                <p>
                                    Add context for the next
                                    interaction.
                                </p>

                            </div>

                            <div className="form-field">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    rows="5"
                                    placeholder="e.g. Discuss course fees and admission process."
                                    value={
                                        formData.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>

                        {/* ================= ERROR ================= */}

                        {error && (
                            <div className="add-followup-error">
                                {error}
                            </div>
                        )}

                        {/* ================= ACTIONS ================= */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-followup-button"
                                disabled={
                                    saving ||
                                    loadingLeads
                                }
                            >
                                {saving
                                    ? "Scheduling..."
                                    : "Schedule Follow-up"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}

export default AddFollowUp;