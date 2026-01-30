import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: "240px",
          background: "#0f172a",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>⚙️ Admin Panel</h3>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            flex: 1,
          }}
        >
          <Link to="/admin/dashboard" className="admin-link">
            📊 Dashboard
          </Link>

          <Link to="/admin/users" className="admin-link">
            👥 Users
          </Link>

          <Link to="/admin/reviews" className="admin-link">
            ⭐ Reviews
          </Link>

          <Link to="/admin/stories" className="admin-link">
            📖 Stories
          </Link>
        </nav>

        <button
          onClick={logout}
          style={{
            background: "crimson",
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          flex: 1,
          padding: "25px",
          minHeight: "100vh", // ✅ FIX FOR CHART
          overflowY: "auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
