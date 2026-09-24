import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true
        });

        setMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* =========================
                MOBILE / TABLET HEADER
            ========================= */}

            <div className="mobile-header">

                <button
                    className="menu-button"
                    onClick={() =>
                        setMenuOpen(!menuOpen)
                    }
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

                <div className="mobile-brand">

                    <div className="mobile-brand-icon">
                        EL
                    </div>

                    <span>
                        EduLead
                    </span>

                </div>

            </div>


            {/* =========================
                OVERLAY
            ========================= */}

            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setMenuOpen(false)
                    }
                />
            )}


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                className={`dashboard-sidebar ${
                    menuOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                {/* BRAND */}

                <div className="sidebar-brand">

                    <div className="sidebar-brand-icon">
                        EL
                    </div>

                    <span>
                        EduLead
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <button
                        className={`nav-item ${
                            isActive("/dashboard")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "/dashboard"
                            )
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>


                    <button
                        className={`nav-item ${
                            isActive("/leads")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "/leads"
                            )
                        }
                    >
                        <span>◉</span>
                        Leads
                    </button>


                    <button
                        className={`nav-item ${
                            location.pathname.startsWith(
                                "/followups"
                            )
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "/followups"
                            )
                        }
                    >
                        <span>✓</span>
                        Follow-ups
                    </button>


                    <button
                        className={`nav-item ${
                            isActive("/reports")
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "/reports"
                            )
                        }
                    >
                        <span>▤</span>
                        Reports
                    </button>

                </nav>


                {/* LOGOUT */}

                <div className="sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
}

export default Sidebar;