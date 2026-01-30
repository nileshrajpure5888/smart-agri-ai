import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

import bg from "../assets/indian-farmer-holding-crop.avif";

export default function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  // ==========================
  // AUTO REDIRECT IF LOGGED IN
  // ==========================
  useEffect(() => {

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }

  }, [navigate]);


  // ==========================
  // HANDLE INPUT
  // ==========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // ==========================
  // VALIDATE
  // ==========================
  const validateForm = () => {

    if (formData.name.trim().length < 3) {
      alert("Name must be 3+ characters ❌");
      return false;
    }

    if (!formData.email.includes("@")) {
      alert("Invalid email ❌");
      return false;
    }

    if (formData.password.length < 6) {
      alert("Password must be 6+ chars ❌");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match ❌");
      return false;
    }

    return true;
  };


  // ==========================
  // SUBMIT
  // ==========================
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };


      const res = await api.post("/api/auth/register", payload);


      // ==========================
      // AUTO LOGIN (IF TOKEN)
      // ==========================
      if (res.data?.token) {

        localStorage.setItem("token", res.data.token);

        if (res.data?.role) {
          localStorage.setItem("role", res.data.role);
        }

        alert("Registered & Logged In ✅");

        navigate("/dashboard");

      } else {

        alert("Registration Successful ✅");

        navigate("/login");

      }


    } catch (err) {

      console.log("REGISTER ERROR:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Registration Failed ❌";

      alert(msg);


    } finally {

      setLoading(false);

    }
  };


  // ==========================
  // UI
  // ==========================
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
          maxWidth: "460px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.25)",
          padding: "28px",
          borderRadius: "20px",
          color: "white",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.4)",
        }}
      >

        <h2 className="text-center mb-2 fw-bold">
          🌾 Farmer Registration
        </h2>

        <p className="text-center text-light mb-4" style={{ fontSize: "14px" }}>
          Smart Agri AI Platform
        </p>


        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="mb-3">

            <label className="form-label fw-semibold">Name</label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ borderRadius: "12px" }}
            />

          </div>


          {/* EMAIL */}
          <div className="mb-3">

            <label className="form-label fw-semibold">Email</label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderRadius: "12px" }}
            />

          </div>


          {/* PASSWORD */}
          <div className="mb-3">

            <label className="form-label fw-semibold">Password</label>

            <div className="input-group">

              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderRadius: "12px 0 0 12px" }}
              />

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>

            </div>

          </div>


          {/* CONFIRM */}
          <div className="mb-3">

            <label className="form-label fw-semibold">
              Confirm Password
            </label>

            <div className="input-group">

              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ borderRadius: "12px 0 0 12px" }}
              />

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? "🙈" : "👁️"}
              </button>

            </div>

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

            {loading ? "Registering..." : "✅ Register"}

          </button>


          <p className="mt-3 text-center mb-0">

            Already have an account?{" "}

            <Link
              to="/login"
              style={{ color: "#00ff99", fontWeight: "bold" }}
            >
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}
