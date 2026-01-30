import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
} from "recharts";

export default function Dashboard() {
  // ✅ Weather
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ✅ GPS coords stored
  const [coords, setCoords] = useState({ lat: null, lon: null });

  // ✅ Market trend graph
  const [marketTrend, setMarketTrend] = useState([]);
  const [marketCrop, setMarketCrop] = useState("Onion");
  const [marketMandi, setMarketMandi] = useState("Pune");
  const [marketLoading, setMarketLoading] = useState(true);

  // ✅ Mandi live rates
  const [mandiRates, setMandiRates] = useState([]);
  const [mandiRatesLoading, setMandiRatesLoading] = useState(false);

  // ✅ Best mandi today ranking
  const [bestMandi, setBestMandi] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [bestMandiLoading, setBestMandiLoading] = useState(false);

  // ✅ Distance
  const [mandiDistance, setMandiDistance] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  // ✅ AI Best sell time
  const [sellSuggestion, setSellSuggestion] = useState(null);
  const [sellLoading, setSellLoading] = useState(false);

  // ✅ Activity
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ✅ Speak welcome only once (StrictMode safe)
  const welcomeSpokenRef = useRef(false);

  // ✅ prevent duplicate trend logs
  const trendLogRef = useRef("");

  // ✅ TEMP: user id (later connect from login)
  const userId = "nilesh";

  // ✅ Speak English Only
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 0.95;

    setTimeout(() => window.speechSynthesis.speak(utter), 200);
  };

  // ✅ Fetch recent activity
  const fetchActivities = async () => {
    try {
      setActivityLoading(true);

      const res = await api.get("/api/activity/recent", {
        params: { user_id: userId, limit: 5 },
      });

      setActivities(res.data.results || []);
    } catch (err) {
      console.log("Activity fetch error:", err?.response?.data || err.message);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // ✅ Log activity
  const logActivity = async (title, description = "", icon = "✅") => {
    try {
      await api.post("/api/activity/log", {
        user_id: userId,
        title,
        description,
        icon,
      });

      fetchActivities();
    } catch (err) {
      console.log("Activity log error:", err?.response?.data || err.message);
    }
  };

  // ✅ Clear activity
  const clearActivity = async () => {
    if (!window.confirm("Clear all activity history?")) return;

    try {
      await api.delete("/api/activity/clear", {
        params: { user_id: userId },
      });

      fetchActivities();
      alert("Activity cleared ✅");
    } catch (err) {
      console.log(err?.response?.data || err.message);
      alert("Failed to clear activity ❌");
    }
  };

  // ✅ Refresh weather only (NO PAGE reload)
  const refreshWeather = async () => {
    setWeatherLoading(true);

    if (!navigator.geolocation) {
      setWeather({ error: "GPS not supported" });
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });

          const res = await api.get("/api/weather/by-coordinates", {
            params: { lat: latitude, lon: longitude },
          });

          setWeather(res.data);

          // ✅ Speak welcome ONLY ONCE
          if (!welcomeSpokenRef.current) {
            speakText("Welcome! Your smart agriculture dashboard is ready.");
            welcomeSpokenRef.current = true;

            await logActivity("Opened Dashboard", "Weather fetched using GPS", "📊");
          }
        } catch (err) {
          setWeather({ error: "Weather fetch failed ❌" });
          console.log(err?.response?.data || err.message);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeather({ error: "Location permission denied" });
        setWeatherLoading(false);
      }
    );
  };

  // ✅ On load
  useEffect(() => {
    refreshWeather();
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  // ✅ Market trend fetch (Graph)
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setMarketLoading(true);

        const res = await api.get("/api/market/trend", {
          params: { crop: marketCrop, mandi: marketMandi },
        });

        setMarketTrend(res.data.trend || []);

        // ✅ Prevent duplicate logs
        const key = `${marketCrop}-${marketMandi}`;
        if (trendLogRef.current !== key) {
          trendLogRef.current = key;

          await logActivity(
            "Viewed Market Trend",
            `Crop: ${marketCrop}, Mandi: ${marketMandi}`,
            "📈"
          );
        }
      } catch (err) {
        console.log("Market trend error:", err?.response?.data || err.message);
        setMarketTrend([]);
      } finally {
        setMarketLoading(false);
      }
    };

    fetchMarket();
    // eslint-disable-next-line
  }, [marketCrop, marketMandi]);

  // ✅ Fetch mandi live rates
  const fetchMandiRates = async () => {
    try {
      setMandiRatesLoading(true);

      const res = await api.get("/api/mandi/rates", {
        params: { commodity: marketCrop, market: marketMandi },
      });

      setMandiRates(res.data.results || []);

      await logActivity(
        "Checked Live Rates",
        `Crop ${marketCrop} Mandi ${marketMandi}`,
        "🏪"
      );
    } catch (err) {
      console.log("Mandi rates error:", err?.response?.data || err.message);
      setMandiRates([]);
    } finally {
      setMandiRatesLoading(false);
    }
  };

  // ✅ Fetch best mandi today
  const fetchBestMandi = async () => {
    try {
      setBestMandiLoading(true);

      const res = await api.get("/api/mandi/best-mandi", {
        params: { commodity: marketCrop },
      });

      setBestMandi(res.data.best_mandi || null);
      setRanking(res.data.ranking || []);

      if (res.data.best_mandi?.mandi) {
        speakText(`Today best mandi for ${marketCrop} is ${res.data.best_mandi.mandi}`);

        await logActivity(
          "Checked Best Mandi",
          `Crop ${marketCrop} Best ${res.data.best_mandi.mandi}`,
          "🏆"
        );
      }
    } catch (err) {
      console.log("Best mandi error:", err?.response?.data || err.message);
    } finally {
      setBestMandiLoading(false);
    }
  };

  // ✅ GPS → mandi distance
  const fetchDistance = async () => {
    if (!coords.lat || !coords.lon) {
      alert("GPS location not ready yet ❌");
      return;
    }

    try {
      setDistanceLoading(true);

      const res = await api.get("/api/mandi/distance", {
        params: { lat: coords.lat, lon: coords.lon, mandi: marketMandi },
      });

      setMandiDistance(res.data);

      await logActivity("Checked Distance", `Mandi: ${marketMandi}`, "📍");
    } catch (err) {
      console.log("Distance error:", err?.response?.data || err.message);
      setMandiDistance(null);
    } finally {
      setDistanceLoading(false);
    }
  };

  // ✅ AI Best Sell Suggestion (FIXED)
  const getSellSuggestion = async () => {
    try {
      setSellLoading(true);
      setSellSuggestion(null);

      const res = await api.post("/api/market/best-sell-time", {
        crop: marketCrop,
        mandi: marketMandi,
      });

      let parsed;

      if (typeof res.data?.ai_result === "object" && res.data?.ai_result !== null) {
        parsed = res.data.ai_result;
      } else if (typeof res.data?.ai_result === "string") {
        parsed = JSON.parse(res.data.ai_result);
      } else if (res.data?.recommendation) {
        parsed = res.data;
      } else {
        throw new Error("Invalid AI response format");
      }

      setSellSuggestion(parsed);

      if (parsed?.recommendation) {
        speakText(`Market Suggestion: ${parsed.recommendation}`);
      }

      await logActivity("AI Sell Suggestion", `Crop ${marketCrop} Mandi ${marketMandi}`, "🤖");
    } catch (err) {
      console.log("AI sell time error:", err?.response?.data || err.message);
      alert("AI sell time failed ❌");
    } finally {
      setSellLoading(false);
    }
  };

  // ✅ Quick cards
  const quickActions = [
    { title: "Crop Recommendation", desc: "Best crop for your land", icon: "🌱", link: "/crop", color: "success" },
    { title: "Fertilizer Recommendation", desc: "NPK plan based on soil", icon: "🧪", link: "/fertilizer", color: "primary" },
    { title: "Disease Detection", desc: "Upload leaf image", icon: "🍃", link: "/disease", color: "warning" },
    { title: "Market Prediction", desc: "Best time to sell", icon: "📈", link: "/market", color: "dark" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">📊 Farmer Dashboard</h2>
          <p className="text-muted mb-0">Welcome to Smart Agri AI Platform 🌾</p>
        </div>

        <div className="mt-2 mt-md-0 d-flex gap-2">
          <button className="btn btn-outline-success" onClick={() => speakText("Welcome to Smart Agri dashboard!")}>
            🔊 Voice Welcome
          </button>
          <button className="btn btn-danger" onClick={() => window.speechSynthesis.cancel()}>
            🔇 Stop Voice
          </button>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="row g-3 mb-4">
        {quickActions.map((a) => (
          <div className="col-md-3" key={a.title}>
            <Link to={a.link} style={{ textDecoration: "none" }}>
              <div className="card shadow-sm p-3 h-100" style={{ borderRadius: "16px" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">{a.icon}</h4>
                  <span className={`badge bg-${a.color}`}>Open</span>
                </div>
                <h5 className="mt-3 fw-bold text-dark">{a.title}</h5>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>{a.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Weather + Activity */}
      <div className="row g-3">
        {/* Weather card */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100" style={{ borderRadius: "18px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🌦️ Live Weather (GPS)</h4>
              <button className="btn btn-sm btn-outline-success" onClick={refreshWeather} disabled={weatherLoading}>
                {weatherLoading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>

            {weatherLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-3 text-muted">Fetching live weather...</p>
              </div>
            ) : weather?.error ? (
              <div className="alert alert-danger">❌ {weather.error}</div>
            ) : (
              <>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div style={{
                    width: "70px",
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "16px",
                    background: "#eafff2",
                    fontSize: "36px",
                  }}>
                    {weather.weather?.toLowerCase().includes("rain")
                      ? "🌧️"
                      : weather.weather?.toLowerCase().includes("cloud")
                      ? "☁️"
                      : weather.weather?.toLowerCase().includes("clear")
                      ? "☀️"
                      : "🌤️"}
                  </div>

                  <div>
                    <h3 className="mb-0 fw-bold">{weather.temperature}°C</h3>
                    <p className="mb-0 text-muted" style={{ textTransform: "capitalize" }}>{weather.weather}</p>
                    <small className="text-muted">📍 {weather.location}</small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 border rounded-4 bg-light">
                      <p className="mb-1 text-muted">💧 Humidity</p>
                      <h5 className="mb-0 fw-bold">{weather.humidity}%</h5>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="p-3 border rounded-4 bg-light">
                      <p className="mb-1 text-muted">💨 Wind Speed</p>
                      <h5 className="mb-0 fw-bold">{weather.wind_speed} m/s</h5>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="alert alert-success mb-0">
                    ✅ Tip: High humidity increases fungal disease risk.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity card */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100" style={{ borderRadius: "16px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🕒 Recent Activity</h4>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-dark" onClick={fetchActivities}>
                  🔄 Refresh
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={clearActivity}>
                  🗑️ Clear
                </button>
              </div>
            </div>

            {activityLoading ? (
              <p className="text-muted">Loading activity...</p>
            ) : activities.length === 0 ? (
              <p className="text-muted">No activity yet.</p>
            ) : (
              activities.map((a) => (
                <div key={a._id} className="border-bottom py-2">
                  <div className="fw-bold">{a.icon || "✅"} {a.title}</div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>{a.description}</div>
                  <small className="text-muted">
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mandi Controls */}
      <div className="card shadow-sm p-4 mt-4" style={{ borderRadius: "16px" }}>
        <h4 className="fw-bold mb-3">🏪 Live Mandi Rates (Govt Data)</h4>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Commodity</label>
            <select className="form-select" value={marketCrop} onChange={(e) => setMarketCrop(e.target.value)}>
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Potato">Potato</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Mandi</label>
            <select className="form-select" value={marketMandi} onChange={(e) => setMarketMandi(e.target.value)}>
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
              <option value="Solapur">Solapur</option>
            </select>
          </div>

          <div className="col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-success w-100" onClick={fetchMandiRates} disabled={mandiRatesLoading}>
              {mandiRatesLoading ? "Loading..." : "📌 Get Rates"}
            </button>

            <button className="btn btn-outline-dark w-100" onClick={fetchDistance} disabled={distanceLoading}>
              {distanceLoading ? "..." : "📍 Distance"}
            </button>
          </div>
        </div>

        {mandiDistance && (
          <div className="alert alert-info mt-3 d-flex flex-wrap justify-content-between align-items-center">
            <div>
              ✅ Distance to <b>{mandiDistance.mandi}</b>: <b>{mandiDistance.distance_km} km</b>
            </div>

            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${mandiDistance.mandi_lat},${mandiDistance.mandi_lon}&travelmode=driving`;
                window.open(url, "_blank");
              }}
            >
              🗺️ Route Preview
            </button>
          </div>
        )}

        {/* Mandi rates table */}
        <div className="mt-4">
          {mandiRates.length === 0 ? (
            <p className="text-muted">No rates loaded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-success">
                  <tr>
                    <th>Date</th>
                    <th>Market</th>
                    <th>Commodity</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Modal</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {mandiRates.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.arrival_date}</td>
                      <td>{r.market}</td>
                      <td>{r.commodity}</td>
                      <td>₹{r.min_price}</td>
                      <td>₹{r.max_price}</td>
                      <td><b>₹{r.modal_price}</b></td>
                      <td>{r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Best mandi today */}
      <div className="card shadow-sm p-4 mt-4" style={{ borderRadius: "16px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">🏆 Today Best Mandi to Sell</h4>

          <button className="btn btn-warning" onClick={fetchBestMandi} disabled={bestMandiLoading}>
            {bestMandiLoading ? "Checking..." : "✅ Find Best Mandi"}
          </button>
        </div>

        {bestMandi && (
          <div className="alert alert-success mt-3">
            ✅ Best Mandi Today: <b>{bestMandi.mandi}</b> — Modal Price:{" "}
            <b>₹{bestMandi.modal_price}</b> ({bestMandi.unit})
          </div>
        )}

        {ranking.length > 0 && (
          <div className="table-responsive mt-3">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Rank</th>
                  <th>Mandi</th>
                  <th>Date</th>
                  <th>Modal Price</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, idx) => (
                  <tr key={idx}>
                    <td><b>#{idx + 1}</b></td>
                    <td>{r.mandi}</td>
                    <td>{r.arrival_date || "-"}</td>
                    <td><b>₹{r.modal_price}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    














    
    </Layout>
  );
}
