import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Leads.css";
import Sidebar from "../components/Sidebar";
function Leads() {
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
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

        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/leads");

            if (response.data.success) {
                setLeads(response.data.leads);
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

    const filteredLeads = leads.filter((lead) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            lead.name?.toLowerCase().includes(searchValue) ||
            lead.phone?.toLowerCase().includes(searchValue) ||
            lead.email?.toLowerCase().includes(searchValue) ||
            lead.course?.toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "All" ||
            lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusClass = (status) => {
        return status
            ?.toLowerCase()
            .replace(/\s+/g, "-");
    };

    if (loading) {
        return (
            <div className="leads-loading">
                Loading leads...
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
                        <h2>Leads</h2>
                        <p>Manage admission enquiries</p>
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

                <section className="leads-content">

                    <div className="leads-heading">

                        <div>
                            <p className="page-label">
                                ADMISSIONS
                            </p>

                            <h1>Admission Leads</h1>

                            <p>
                                Track and manage your admission enquiries.
                            </p>
                        </div>

                        <button
                            className="add-lead-button"
                            onClick={() => navigate("/leads/add")}
                        >
                            + Add Lead
                        </button>

                    </div>

                    {/* ================= FILTERS ================= */}

                    <div className="leads-toolbar">

                        <div className="search-box">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search leads..."
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

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (
                        <div className="leads-error">
                            {error}
                        </div>
                    )}

                    {/* ================= TABLE ================= */}

                    <div className="leads-card">

                        <div className="leads-card-header">

                            <div>
                                <h3>All Leads</h3>

                                <p>
                                    {filteredLeads.length} lead
                                    {filteredLeads.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            <button
                                className="refresh-button"
                                onClick={fetchLeads}
                            >
                                ↻ Refresh
                            </button>

                        </div>

                        {filteredLeads.length === 0 ? (

                            <div className="empty-leads">

                                <div className="empty-icon">
                                    ◉
                                </div>

                                <h3>No leads found</h3>

                                <p>
                                    Try changing your search or
                                    status filter.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="leads-table">

                                    <thead>

                                        <tr>
                                            <th>Lead</th>
                                            <th>Course</th>
                                            <th>Source</th>
                                            <th>Status</th>
                                            <th>Assigned To</th>
                                            <th>Created</th>
                                            <th></th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredLeads.map((lead) => (

                                            <tr key={lead.id}>

                                                <td>

                                                    <div className="lead-person">

                                                        <div className="lead-avatar">
                                                            {lead.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {lead.name}
                                                            </strong>

                                                            <span>
                                                                {lead.phone}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    <span className="course-name">
                                                        {lead.course}
                                                    </span>
                                                </td>

                                                <td>
                                                    {lead.source}
                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${getStatusClass(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        {lead.status}
                                                    </span>

                                                </td>

                                                <td>
                                                    {lead.assigned_name ||
                                                        "Unassigned"}
                                                </td>

                                                <td>
                                                    {lead.created_at
                                                        ? new Date(
                                                            lead.created_at
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )
                                                        : "-"}
                                                </td>

                                                <td>

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/leads/${lead.id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

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

export default Leads;