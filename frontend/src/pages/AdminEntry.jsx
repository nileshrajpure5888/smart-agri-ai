import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminEntry() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div
        style={{
          background: "#020617",
          padding: "40px",
          borderRadius: "15px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: "0 0 30px rgba(0,255,0,0.2)",
        }}
      >
        <h2>⚙️ Admin Control Panel</h2>

        <p style={{ margin: "15px 0", color: "#94a3b8" }}>
          Authorized Admins Only
        </p>

        <button
          onClick={() => navigate("/login")}
          style={btnStyle("#22c55e")}
        >
          🔐 Login as Admin
        </button>

        <button
          onClick={() => navigate("/")}
          style={btnStyle("#64748b")}
        >
          ⬅ Back to Home
        </button>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: color,
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  };
}
