import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AddLead.css";
import Sidebar from "../components/Sidebar";

function AddLead() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        course: "",
        source: "",
        preferred_intake: "",
        notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            !formData.name ||
            !formData.phone ||
            !formData.course ||
            !formData.source
        ) {
            setError(
                "Please fill in all required fields."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/leads",
                formData
            );

            if (response.data.success) {
                navigate("/leads");
            }
        } catch (error) {
            console.error("Create lead error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to create lead."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/leads");
    };

    return (
        <div className="dashboard-page">

            {/* ================= SIDEBAR ================= */}

          <Sidebar />

            {/* ================= MAIN ================= */}

            <main className="dashboard-main">

                <header className="dashboard-topbar">

                    <div>
                        <h2>Add Lead</h2>
                        <p>Create a new admission enquiry</p>
                    </div>

                    <div className="user-profile">

                        <div className="user-avatar">
                            {JSON.parse(
                                localStorage.getItem("user")
                            )?.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-info">
                            <strong>
                                {
                                    JSON.parse(
                                        localStorage.getItem("user")
                                    )?.name
                                }
                            </strong>

                            <span>
                                {
                                    JSON.parse(
                                        localStorage.getItem("user")
                                    )?.role
                                }
                            </span>
                        </div>

                    </div>

                </header>

                {/* ================= CONTENT ================= */}

                <section className="add-lead-content">

                    <div className="add-lead-heading">

                        <p className="page-label">
                            ADMISSIONS
                        </p>

                        <h1>Create New Lead</h1>

                        <p>
                            Enter the student's admission enquiry
                            details below.
                        </p>

                    </div>

                    <form
                        className="add-lead-card"
                        onSubmit={handleSubmit}
                    >

                        {/* ================= PERSONAL DETAILS ================= */}

                        <div className="form-section">

                            <div className="section-heading">
                                <h3>Student Information</h3>
                                <p>
                                    Basic contact details of the
                                    prospective student.
                                </p>
                            </div>

                            <div className="form-grid">

                                <div className="form-field">

                                    <label>
                                        Student Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter student name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Phone Number
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="form-field">

                                    <label>Email</label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>

                        {/* ================= ADMISSION DETAILS ================= */}

                        <div className="form-section">

                            <div className="section-heading">
                                <h3>Admission Details</h3>
                                <p>
                                    Course and enquiry source
                                    information.
                                </p>
                            </div>

                            <div className="form-grid">

                                <div className="form-field">

                                    <label>
                                        Interested Course
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="course"
                                        placeholder="e.g. MCA, MBA, BCA"
                                        value={formData.course}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Lead Source
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select source
                                        </option>

                                        <option value="Website">
                                            Website
                                        </option>

                                        <option value="Walk-in">
                                            Walk-in
                                        </option>

                                        <option value="Phone">
                                            Phone
                                        </option>

                                        <option value="WhatsApp">
                                            WhatsApp
                                        </option>

                                        <option value="Education Fair">
                                            Education Fair
                                        </option>

                                        <option value="Campaign">
                                            Campaign
                                        </option>

                                        <option value="Referral">
                                            Referral
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                                <div className="form-field">

                                    <label>
                                        Preferred Intake
                                    </label>

                                    <input
                                        type="text"
                                        name="preferred_intake"
                                        placeholder="e.g. 2026-27"
                                        value={
                                            formData.preferred_intake
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>

                        {/* ================= NOTES ================= */}

                        <div className="form-section">

                            <div className="section-heading">
                                <h3>Additional Information</h3>
                                <p>
                                    Add any relevant notes about
                                    the enquiry.
                                </p>
                            </div>

                            <div className="form-field">

                                <label>Notes</label>

                                <textarea
                                    name="notes"
                                    rows="5"
                                    placeholder="Add notes about the student's enquiry..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        {/* ================= ERROR ================= */}

                        {error && (
                            <div className="add-lead-error">
                                {error}
                            </div>
                        )}

                        {/* ================= ACTIONS ================= */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-lead-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Lead"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}

export default AddLead;