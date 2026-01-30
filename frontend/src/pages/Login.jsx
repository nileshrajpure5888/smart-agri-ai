import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

import bg from "../assets/plant-growing-from-soil.jpg";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /* ==========================
     AUTO REDIRECT IF LOGGED IN
  ========================== */
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  /* ==========================
     HANDLE INPUT
  ========================== */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ==========================
     VALIDATION
  ========================== */
  const validateForm = () => {
    if (!formData.email.includes("@")) {
      alert("Enter valid email ❌");
      return false;
    }

    if (formData.password.length < 6) {
      alert("Password must be 6+ characters ❌");
      return false;
    }

    return true;
  };

  /* ==========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", formData);

      /* ==========================
         TOKEN
      ========================== */
      if (!res.data?.token) {
        throw new Error("Token missing");
      }

      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", res.data.token);
        localStorage.removeItem("token");
      }

      /* ==========================
         USER + ROLE (FIXED)
      ========================== */
      if (res.data?.user && res.data?.role) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...res.data.user,
            role: res.data.role,
          })
        );
      }

      alert("Login Successful ✅");

      /* ==========================
         REDIRECT BY ROLE
      ========================== */
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login Failed ❌";

      alert(msg);

    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     UI
  ========================== */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.25)",
          padding: "28px",
          borderRadius: "20px",
          color: "white",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <h2 className="text-center mb-2 fw-bold">🌾 Farmer / Admin Login</h2>

        <p className="text-center text-light mb-4" style={{ fontSize: "14px" }}>
          Smart Agri AI Platform
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              style={{ borderRadius: "12px" }}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <label className="form-label fw-semibold">Password</label>

            <div className="input-group">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                style={{ borderRadius: "12px 0 0 12px" }}
              />

              <button
                type="button"
                className="btn btn-light"
                style={{ borderRadius: "0 12px 12px 0" }}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* REMEMBER */}
          <div className="d-flex justify-content-between align-items-center mb-3">

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />

              <label className="form-check-label">
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              style={{
                color: "#00ff99",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Forgot?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            className="btn btn-success w-100 fw-bold"
            style={{
              borderRadius: "14px",
              padding: "10px",
              fontSize: "16px",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "✅ Login"}
          </button>

          <p className="mt-3 text-center mb-0">
            Don’t have an account?{" "}

            <Link
              to="/register"
              style={{ color: "#00ff99", fontWeight: "bold" }}
            >
              Register
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
