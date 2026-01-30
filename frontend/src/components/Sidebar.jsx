import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* ======================================
   PROFESSIONAL SIDEBAR COMPONENT
====================================== */

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState("");

  const navigate = useNavigate();

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", { replace: true });
    window.location.reload();
  };

  /* ================= MENU ================= */

  const menuItems = [
    { section: "MAIN" },
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },

    { section: "AI MODULES" },
    { path: "/crop", label: "Crop Recommendation", icon: "🌱" },
    { path: "/fertilizer", label: "Fertilizer", icon: "🧪" },
    { path: "/disease", label: "Disease Detection", icon: "🍃" },
    { path: "/market", label: "Market Prediction", icon: "📈" },

    { section: "ACCOUNT" },
    { path: "/my-profile", label: "Profile", icon: "👤" },

   
  ];

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {
    if (!q.trim()) return menuItems;

    return menuItems.filter((x) => {
      if (!x.path) return true;
      return x.label.toLowerCase().includes(q.toLowerCase());
    });
  }, [q]);

  /* ================= UI ================= */

  return (
    <div
      className="sidebar d-flex flex-column text-white"
      style={{
        width: collapsed ? "85px" : "280px",
        height: "100vh",
        background: "linear-gradient(180deg,#020617,#0f172a)",
        transition: "all 0.3s ease",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* =================================
          HEADER
      ================================= */}

      <div className="p-3 border-bottom border-secondary-subtle">

        {/* Brand */}
        <div className="d-flex justify-content-between align-items-center">

          <div className="d-flex align-items-center gap-3">

            <div className="logo-box">
              🌾
            </div>

            {!collapsed && (
              <div>
                <div className="fw-bold fs-6">
                  Smart Agri AI
                </div>
                <small className="text-secondary">
                  Farmer Dashboard
                </small>
              </div>
            )}

          </div>

          {/* Collapse */}
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "➡" : "⬅"}
          </button>

        </div>

        {/* Search */}
        {!collapsed && (
          <div className="mt-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu..."
              className="form-control sidebar-search"
            />
          </div>
        )}

      </div>

   

      {/* =================================
          MENU
      ================================= */}

      <div className="flex-grow-1 overflow-auto px-2 pt-2">

        <ul className="nav flex-column gap-1">

          {filtered.map((item, idx) => {

            /* Section */
            if (!item.path) {
              return (
                <li key={idx} className="mt-3 mb-1">
                  {!collapsed && (
                    <small className="section-title">
                      {item.section}
                    </small>
                  )}
                </li>
              );
            }

            /* Menu */
            return (
              <li key={item.path}>

                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) =>
                    `nav-link sidebar-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="icon">
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="label">
                      {item.label}
                    </span>
                  )}

                  {/* Active Bar */}
                  <span className="active-indicator" />

                </NavLink>

              </li>
            );
          })}

        </ul>

      </div>

      {/* =================================
          FOOTER
      ================================= */}

      <div className="p-3 border-top border-secondary-subtle footer">

        {!collapsed && (
          <div className="text-secondary small mb-2">
            Logged in as Farmer
          </div>
        )}

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          🔓 Logout
        </button>

        {!collapsed && (
          <div className="copyright">
            © {new Date().getFullYear()} Smart Agri AI
          </div>
        )}

      </div>

      {/* =================================
          STYLES
      ================================= */}

      <style>
        {`

/* LOGO */

.logo-box{
  width:40px;
  height:40px;
  border-radius:12px;
  background:rgba(34,197,94,0.2);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
}


/* SEARCH */

.sidebar-search{
  background:#020617;
  border:1px solid #1e293b;
  color:white;
}

.sidebar-search:focus{
  background:#020617;
  color:white;
  border-color:#22c55e;
  box-shadow:none;
}


/* USER CARD */

.user-card{
  display:flex;
  gap:12px;
  align-items:center;
  padding:12px 16px;
  margin:10px;
  border-radius:12px;
  background:rgba(255,255,255,0.04);
}

.avatar{
  width:45px;
  height:45px;
  border-radius:50%;
  background:rgba(34,197,94,0.2);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
}


/* VERIFIED BADGE */

.verified-badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:3px 10px;
  margin-top:3px;

  font-size:11px;
  font-weight:600;

  color:#16a34a;
  background:rgba(34,197,94,0.15);

  border:1px solid rgba(34,197,94,0.3);
  border-radius:999px;

  box-shadow:0 0 8px rgba(34,197,94,0.25);
}

.check-icon{
  width:16px;
  height:16px;

  background:#22c55e;
  color:#020617;

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:10px;
  font-weight:bold;

  border-radius:50%;
}


/* SECTION */

.section-title{
  padding-left:12px;
  font-weight:700;
  color:#64748b;
  letter-spacing:0.08em;
  font-size:11px;
}


/* LINKS */

.sidebar-link{
  position:relative;
  display:flex;
  align-items:center;
  gap:12px;
  padding:10px 14px;
  border-radius:12px;
  color:rgba(255,255,255,0.85);
  font-weight:500;
  transition:all 0.2s ease;
}

.sidebar-link:hover{
  background:rgba(255,255,255,0.06);
  color:white;
}

.sidebar-link.active{
  background:rgba(34,197,94,0.18);
  color:white;
  font-weight:700;
}


/* ACTIVE BAR */

.active-indicator{
  position:absolute;
  right:0;
  top:20%;
  width:4px;
  height:60%;
  background:#22c55e;
  border-radius:5px;
  opacity:0;
}

.sidebar-link.active .active-indicator{
  opacity:1;
}


/* ICON */

.icon{
  font-size:18px;
  min-width:22px;
}

.label{
  white-space:nowrap;
}


/* FOOTER */

.footer{
  background:rgba(2,6,23,0.9);
}

.logout-btn{
  width:100%;
  border:none;
  background:linear-gradient(135deg,#16a34a,#22c55e);
  color:white;
  padding:8px;
  border-radius:12px;
  font-weight:600;
  transition:0.2s;
}

.logout-btn:hover{
  transform:scale(1.02);
  box-shadow:0 0 15px rgba(34,197,94,0.4);
}

.copyright{
  margin-top:8px;
  text-align:center;
  font-size:11px;
  color:#64748b;
}

        `}
      </style>
    </div>
  );
}
