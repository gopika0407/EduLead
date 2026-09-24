import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================
    // REDIRECT ALREADY LOGGED-IN USER
    // =====================================

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/dashboard", {
                replace: true
            });
        }
    }, [navigate]);

    // =====================================
    // LOGIN
    // =====================================

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError(
                "Please enter your email and password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            if (response.data.success) {

                // Store JWT token
                localStorage.setItem(
                    "token",
                    response.data.token
                );

                // Store logged-in user
                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        response.data.user
                    )
                );

                // Go to dashboard
                navigate("/dashboard", {
                    replace: true
                });
            }

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =================================
                LEFT SIDE
            ================================= */}

            <div className="login-left">

                <div className="brand">

                    <div className="brand-icon">
                        EL
                    </div>

                    <span>
                        EduLead
                    </span>

                </div>

                <div className="brand-center">

                    <p>
                        ADMISSION MANAGEMENT
                    </p>

                    <h1>
                        Manage admissions.
                        <br />
                        <span>
                            Grow smarter.
                        </span>
                    </h1>

                </div>

            </div>

            {/* =================================
                RIGHT SIDE
            ================================= */}

            <div className="login-right">

                <div className="login-card">

                    <div className="login-heading">

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to continue to EduLead
                        </p>

                    </div>

                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;