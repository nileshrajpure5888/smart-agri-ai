import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MarketPrediction() {
  /* ================= STATE ================= */

  const [crop, setCrop] = useState("Onion");
  const [mandi, setMandi] = useState("Pune");
  const [days, setDays] = useState(7);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const crops = useMemo(
    () => ["Onion", "Tomato", "Potato", "Wheat"],
    []
  );

  const mandis = useMemo(
    () => ["Pune", "Nashik", "Nagpur", "Mumbai"],
    []
  );

  /* ================= HELPERS ================= */

  const fmtMoney = (v) => {
    if (!v || isNaN(v)) return "-";
    return `₹${Math.round(v)}`;
  };

  const getTrend = (f) => {
    if (!f?.length) return "UNKNOWN";

    return f[f.length - 1].final_price > f[0].final_price
      ? "UP"
      : "DOWN";
  };

  const calcConfidence = (f) => {
    if (!f?.length) return 0;

    const r = f[0];

    const band =
      (r.yhat_upper || r.final_price) -
      (r.yhat_lower || r.final_price);

    let c = 1 - band / Math.max(r.final_price, 1);

    return Math.max(0.1, Math.min(c, 0.95));
  };

  const riskScore = (f) => {
    if (!f?.length) return 0;

    const p = f.map((x) => Number(x.final_price));

    const avg = p.reduce((a, b) => a + b, 0) / p.length;

    const std = Math.sqrt(
      p.reduce((a, b) => a + (b - avg) ** 2, 0) / p.length
    );

    return Math.max(1, Math.min((std / avg) * 100, 99));
  };

  const getAdvice = (t, c, r) => {
    if (t === "UP" && c > 0.7 && r < 40)
      return "Hold crop, sell later 📈";

    if (t === "DOWN" && r > 60)
      return "Sell immediately 📉";

    return "Monitor market ⚠️";
  };

  /* ================= GOVT DATA SYNC ================= */

  const syncGovtData = async () => {
    try {
      setSyncing(true);

      const res = await api.get("/api/market/sync-live", {
        params: { crop, mandi },
      });

      console.log("✅ Sync Response:", res.data);
    } catch (err) {
      console.log(
        "❌ Sync Error:",
        err.response?.data || err.message
      );

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.msg ||
        err.message ||
        "Govt sync failed";

      alert("Govt Sync Error: " + msg);

      throw err;
    } finally {
      setSyncing(false);
    }
  };

  /* ================= FETCH ================= */

  const fetchPrediction = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 🔄 Sync first
      await syncGovtData();

      // 📊 Predict
      const res = await api.get("/api/market/predict", {
        params: { crop, mandi, days },
      });

      setResult(res.data);
    } catch (err) {
      console.log("❌ Prediction Error:", err);

      setError(
        err.response?.data?.detail ||
          "Prediction failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DATA ================= */

  const trend = getTrend(result?.forecast);

  const confidence = calcConfidence(result?.forecast);

  const risk = riskScore(result?.forecast);

  const advice = getAdvice(trend, confidence, risk);

  const chartData = useMemo(() => {
    if (!result?.forecast) return [];

    return result.forecast.map((x) => ({
      date: x.date,
      final: +x.final_price,
      prophet: +x.prophet_price,
      xgb: +x.xgb_price,
    }));
  }, [result]);

  const bestDay = useMemo(() => {
    if (!result?.forecast) return null;

    return [...result.forecast].sort(
      (a, b) => b.final_price - a.final_price
    )[0];
  }, [result]);

  /* ================= UI ================= */

  return (
    <Layout>
      <div className="container py-4">
        {/* HEADER */}
        <div className="mb-4">
          <h3 className="fw-bold">
            📊 AI Market Prediction
          </h3>
          <p className="text-muted">
            Govt Data + ML + AI System
          </p>
        </div>

        {/* FILTER */}
        <div className="card shadow-sm p-4 mb-4">
          <div className="row g-3">
            {/* Crop */}
            <div className="col-md-3">
              <label className="form-label">Crop</label>

              <select
                className="form-select"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                {crops.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Mandi */}
            <div className="col-md-3">
              <label className="form-label">Mandi</label>

              <select
                className="form-select"
                value={mandi}
                onChange={(e) => setMandi(e.target.value)}
              >
                {mandis.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Days */}
            <div className="col-md-2">
              <label className="form-label">Days</label>

              <select
                className="form-select"
                value={days}
                onChange={(e) => setDays(+e.target.value)}
              >
                <option value={7}>7</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button
                onClick={fetchPrediction}
                disabled={loading || syncing}
                className="btn btn-success w-100"
              >
                {syncing
                  ? "Syncing..."
                  : loading
                  ? "Predicting..."
                  : "Sync + Predict"}
              </button>

              <button
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="btn btn-outline-secondary w-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            ❌ {error}
          </div>
        )}

        {/* SUMMARY */}
        {result && (
          <div className="row g-3 mb-4">
            <Stat
              title="Tomorrow"
              value={fmtMoney(
                result.forecast[0]?.final_price
              )}
            />

            <Stat title="Trend" value={trend} />

            <Stat
              title="Confidence"
              value={`${Math.round(confidence * 100)}%`}
            />

            <Stat
              title="Risk"
              value={`${Math.round(risk)}/100`}
            />

            <Stat title="Advice" value={advice} />
          </div>
        )}

        {/* BEST DAY */}
        {bestDay && (
          <div className="alert alert-success">
            ✅ Best Day: {bestDay.date} —{" "}
            {fmtMoney(bestDay.final_price)}
          </div>
        )}

        {/* GRAPH */}
        {result && (
          <div className="card shadow-sm p-3 mb-4">
            <h5 className="fw-bold mb-2">
              📈 Price Forecast
            </h5>

            <div style={{ height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    dataKey="final"
                    strokeWidth={3}
                  />

                  <Line dataKey="prophet" />

                  <Line dataKey="xgb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ================= SMALL CARD ================= */

function Stat({ title, value }) {
  return (
    <div className="col-md-2">
      <div className="card shadow-sm text-center p-3">
        <p className="text-muted mb-1">{title}</p>

        <h5 className="fw-bold mb-0">{value}</h5>
      </div>
    </div>
  );
}
