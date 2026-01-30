import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const userInitial = (user?.name?.trim()?.[0] || "F").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-pill fw-semibold text-decoration-none ${
      isActive ? "bg-warning text-dark" : "text-white"
    }`;

  const showSearch = location.pathname.startsWith("/marketplace");

  return (
    <nav
      className="navbar px-3 py-2"
      style={{
        background: "linear-gradient(90deg, #0f5132, #198754)",
        width: "100%",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      {/* ✅ Left side */}
      <div className="d-flex align-items-center gap-2">
        {/* ✅ Mobile menu */}
        <button
          className="btn btn-light d-lg-none"
          style={{ borderRadius: 12 }}
          onClick={onMenuClick}
          title="Menu"
        >
          ☰
        </button>

        <Link
          to="/dashboard"
          className="navbar-brand fw-bold d-flex align-items-center gap-2 mb-0"
          style={{ letterSpacing: "0.5px" }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🌾
          </span>

          <span className="d-none d-md-inline text-white">
            Smart Agri AI Platform
          </span>
          <span className="d-inline d-md-none text-white">Smart Agri</span>
        </Link>
      </div>

      {/* ✅ Desktop links */}
      <div className="d-none d-lg-flex align-items-center gap-2">
        <NavLink to="/dashboard" className={navClass}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/marketplace" className={navClass}>
          🛒 Marketplace
        </NavLink>

        <NavLink to="/sell-product" className={navClass}>
          ➕ Sell
        </NavLink>

        <NavLink to="/my-listings" className={navClass}>
          📦 My Listings
        </NavLink>
      </div>

      {/* ✅ Right side */}
      <div className="ms-auto d-flex align-items-center gap-3">
        {/* ✅ Search only on marketplace pages */}
        {showSearch && (
          <div
            className="d-none d-lg-flex align-items-center px-3"
            style={{
              height: 40,
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.22)",
              minWidth: 320,
            }}
          >
            <span className="text-white me-2">🔍</span>
            <input
              placeholder="Search marketplace..."
              className="form-control border-0 bg-transparent text-white p-0"
              style={{ outline: "none", boxShadow: "none" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  alert(`Search: ${e.target.value}`);
                }
              }}
            />
          </div>
        )}

        {/* ✅ Notifications */}
        <button
          className="btn btn-light d-none d-lg-flex"
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Notifications"
          onClick={() => alert("Notifications coming soon ✅")}
        >
          🔔
        </button>

        {/* ✅ Profile dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light d-flex align-items-center gap-2"
            style={{ borderRadius: 14, padding: "6px 10px" }}
            onClick={() => setOpenProfile(!openProfile)}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {userInitial}
            </div>

            <div className="text-start d-none d-xl-block">
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {user?.name || "Farmer"}
              </div>
              <div style={{ fontSize: 11 }} className="text-muted">
                {user?.email || "Profile"}
              </div>
            </div>

            <span className="ms-1">{openProfile ? "▲" : "▼"}</span>
          </button>

          {openProfile && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow"
              style={{
                width: 230,
                borderRadius: 16,
                overflow: "hidden",
                zIndex: 9999,
              }}
            >
              <Link
                to="/my-profile"
                className="dropdown-item py-2"
                onClick={() => setOpenProfile(false)}
              >
                👤 My Profile
              </Link>

              <Link
                to="/my-listings"
                className="dropdown-item py-2"
                onClick={() => setOpenProfile(false)}
              >
                📦 My Listings
              </Link>

              <Link
                to="/sell-product"
                className="dropdown-item py-2"
                onClick={() => setOpenProfile(false)}
              >
                ➕ Sell Product
              </Link>

              <div className="dropdown-divider m-0"></div>

              <button
                className="dropdown-item text-danger py-2"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
