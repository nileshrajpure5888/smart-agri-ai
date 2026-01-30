import { useEffect, useState } from "react";
import api from "../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "./admin.css";

export default function AdminDashboard() {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadStats();
  }, []);


  const loadStats = async () => {

    try {

      const res = await api.get("/api/admin/stats");

      setStats(res.data);

    } catch {

      alert("Failed to load stats");

    } finally {

      setLoading(false);

    }
  };


  /* Demo data (replace later) */
  const chartData = [
    { name: "Jan", users: 120 },
    { name: "Feb", users: 200 },
    { name: "Mar", users: 350 },
    { name: "Apr", users: 500 },
    { name: "May", users: 800 },
    { name: "Jun", users: 1100 },
  ];


  if (loading) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="admin-container">


      {/* ================= HEADER ================= */}

      <div className="dashboard-top">

        <div>

          <h2>🌱 SmartAgri Dashboard</h2>

          <p>Welcome back, Admin 👋</p>

        </div>


        <div className="dashboard-date">

          {new Date().toDateString()}

        </div>

      </div>


      {/* ================= KPI ================= */}

      <div className="kpi-bar">

        <KpiCard
          label="Active Users"
          value={stats.users}
          color="green"
        />

        <KpiCard
          label="Total Orders"
          value={stats.orders}
          color="blue"
        />

        <KpiCard
          label="Revenue"
          value={`₹${stats.orders * 120}`}
          color="orange"
        />

        <KpiCard
          label="Reviews"
          value={stats.reviews}
          color="purple"
        />

      </div>


      {/* ================= STATS ================= */}

      <div className="admin-grid">

        <StatCard
          title="👨‍🌾 Farmers"
          value={stats.users}
          color="green"
        />

        <StatCard
          title="📦 Products"
          value={stats.products}
          color="blue"
        />

        <StatCard
          title="🛒 Orders"
          value={stats.orders}
          color="orange"
        />

        <StatCard
          title="⭐ Reviews"
          value={stats.reviews}
          color="purple"
        />

        <StatCard
          title="📖 Stories"
          value={stats.stories}
          color="teal"
        />

      </div>


      {/* ================= CHART ================= */}

      <div className="chart-section">


        <div className="admin-chart-card">

          <h3>📈 User Growth</h3>


          <ResponsiveContainer width="100%" height={320}>

            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />


              <Line
                type="monotone"
                dataKey="users"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* RIGHT PANEL (Future Stats) */}

        <div className="quick-stats">

          <h3>⚡ Quick Insights</h3>

          <p>📌 78% farmers active</p>

          <p>📌 32% growth this month</p>

          <p>📌 94% review approval</p>

          <p>📌 12K+ visitors</p>

        </div>

      </div>

    </div>
  );
}


/* ================= COMPONENTS ================= */


function StatCard({ title, value, color }) {

  return (
    <div className={`stat-card ${color}`}>

      <span>{title}</span>

      <h2>{value}</h2>

    </div>
  );
}


function KpiCard({ label, value, color }) {

  return (
    <div className={`kpi-card ${color}`}>

      <p>{label}</p>

      <h3>{value}</h3>

    </div>
  );
}


/* ================= LOADING ================= */


function DashboardSkeleton() {

  return (
    <div className="admin-container">

      <div className="skeleton-header" />

      <div className="skeleton-row">

        <div />
        <div />
        <div />
        <div />

      </div>


      <div className="skeleton-chart" />

    </div>
  );
}
