import { useMemo, useState } from "react";
import Layout from "../components/Layout";

/* ✅ API URL from Vercel Environment */
const API = import.meta.env.VITE_API_URL;
console.log("API URL:", API);

export default function FertilizerRecommendation() {
  const [formData, setFormData] = useState({
    farmer_name: "",
    village: "",
    crop: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    moisture: "",
    language: "english",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /* ===============================
      ✅ Soil Health Score (UI Only)
     =============================== */
  const soilScore = useMemo(() => {
    const N = Number(formData.nitrogen || 0);
    const P = Number(formData.phosphorus || 0);
    const K = Number(formData.potassium || 0);
    const pH = Number(formData.ph || 0);
    const moisture = Number(formData.moisture || 0);

    const nScore = Math.min(100, (N / 50) * 100);
    const pScore = Math.min(100, (P / 40) * 100);
    const kScore = Math.min(100, (K / 40) * 100);

    let phScore = 40;
    if (pH >= 6.5 && pH <= 7.5) phScore = 100;
    else if ((pH >= 5.5 && pH < 6.5) || (pH > 7.5 && pH <= 8.5)) phScore = 70;

    const mScore = moisture >= 25 && moisture <= 60 ? 100 : 60;

    return Math.round((nScore + pScore + kScore + phScore + mScore) / 5);
  }, [formData]);

  const soilLabel =
    soilScore >= 80
      ? "Excellent"
      : soilScore >= 60
      ? "Good"
      : soilScore >= 40
      ? "Average"
      : "Poor";

  const soilBarClass =
    soilScore >= 80
      ? "bg-success"
      : soilScore >= 60
      ? "bg-info"
      : soilScore >= 40
      ? "bg-warning"
      : "bg-danger";

  /* ===============================
      ✅ Handle Input Change
     =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ===============================
      ✅ Get Recommendation
     =============================== */
  const submitForm = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`${API}/api/fertilizer/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,

          nitrogen: Number(formData.nitrogen),
          phosphorus: Number(formData.phosphorus),
          potassium: Number(formData.potassium),
          ph: Number(formData.ph),
          moisture: Number(formData.moisture),

          farmer_name: formData.farmer_name || "Farmer",
          village: formData.village || "-",
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.error) {
        setError(data?.error || "Request failed");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("❌ Backend not reachable. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      ✅ Copy Message
     =============================== */
  const copyMessage = async () => {
    if (!result?.farmer_message) return;

    await navigator.clipboard.writeText(result.farmer_message);
    alert("✅ Copied!");
  };

  /* ===============================
      ✅ Download PDF
     =============================== */
  const downloadPDF = async () => {
    setError("");

    try {
      const res = await fetch(`${API}/api/fertilizer/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,

          nitrogen: Number(formData.nitrogen),
          phosphorus: Number(formData.phosphorus),
          potassium: Number(formData.potassium),
          ph: Number(formData.ph),
          moisture: Number(formData.moisture),

          farmer_name: formData.farmer_name || "Farmer",
          village: formData.village || "-",
        }),
      });

      if (!res.ok) {
        setError("❌ Failed to generate PDF.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "fertilizer_report.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("❌ PDF download failed.");
    }
  };

  /* ===============================
      ✅ UI
     =============================== */
  return (
    <Layout>
      <div className="container-fluid py-3">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

          <div>
            <h2 className="fw-bold mb-1">🌱 Fertilizer Recommendation</h2>

            <p className="text-muted mb-2">
              Soil inputs → AI fertilizer plan + PDF report
            </p>
          </div>

          <span className="badge text-bg-dark px-3 py-2 fs-6">
            Soil Score: {soilScore}/100 ({soilLabel})
          </span>

        </div>

        <div className="row g-4">

          {/* ================= LEFT FORM ================= */}
          <div className="col-12 col-lg-6">

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">

                <h5 className="fw-bold mb-3">🧪 Soil + Farmer Inputs</h5>

                {/* Soil Meter */}
                <div className="bg-light rounded-3 p-3 mb-4 border">

                  <div className="d-flex justify-content-between mb-2">
                    <span>🌍 Soil Health</span>
                    <b>{soilScore}/100</b>
                  </div>

                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className={`progress-bar ${soilBarClass}`}
                      style={{ width: `${soilScore}%` }}
                    />
                  </div>

                </div>

                <form onSubmit={submitForm}>

                  {/* Farmer */}
                  <div className="row g-3 mb-3">

                    <div className="col-md-6">
                      <label>Farmer Name</label>
                      <input
                        className="form-control"
                        name="farmer_name"
                        value={formData.farmer_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Village</label>
                      <input
                        className="form-control"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  {/* Language */}
                  <div className="mb-3">
                    <label>Language</label>

                    <select
                      className="form-select"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                    >
                      <option value="marathi">मराठी</option>
                      <option value="hindi">हिंदी</option>
                      <option value="english">English</option>
                    </select>
                  </div>

                  {/* Crop */}
                  <div className="mb-3">
                    <label>Crop</label>

                    <input
                      className="form-control"
                      name="crop"
                      required
                      value={formData.crop}
                      onChange={handleChange}
                    />
                  </div>

                  {/* NPK */}
                  <div className="row g-3">

                    <div className="col-md-6">
                      <label>Nitrogen</label>
                      <input
                        type="number"
                        className="form-control"
                        name="nitrogen"
                        required
                        value={formData.nitrogen}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Phosphorus</label>
                      <input
                        type="number"
                        className="form-control"
                        name="phosphorus"
                        required
                        value={formData.phosphorus}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Potassium</label>
                      <input
                        type="number"
                        className="form-control"
                        name="potassium"
                        required
                        value={formData.potassium}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label>pH</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        name="ph"
                        required
                        value={formData.ph}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label>Moisture %</label>
                      <input
                        type="number"
                        className="form-control"
                        name="moisture"
                        required
                        value={formData.moisture}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  {error && (
                    <div className="alert alert-danger mt-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 mt-4"
                  >
                    {loading ? "⏳ Generating..." : "✅ Get Recommendation"}
                  </button>

                </form>

              </div>
            </div>

          </div>

          {/* ================= RIGHT RESULT ================= */}
          <div className="col-12 col-lg-6">

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">

                <h5 className="fw-bold mb-3">📌 Result</h5>

                {!result && !loading && (
                  <div className="alert alert-secondary">
                    Enter values and click button.
                  </div>
                )}

                {loading && (
                  <div className="alert alert-warning">
                    AI is working...
                  </div>
                )}

                {result && (
                  <>

                    <div className="border p-3 rounded mb-3 bg-success-subtle">

                      <p><b>Crop:</b> {result.crop}</p>
                      <p><b>Fertilizer:</b> {result.fertilizer}</p>
                      <p><b>Dosage:</b> {result.dosage}</p>
                      <p><b>Timing:</b> {result.timing}</p>

                    </div>

                    <div className="border p-3 rounded bg-primary-subtle mb-3">

                      <h6>Farmer Message</h6>

                      <pre style={{ whiteSpace: "pre-wrap" }}>
                        {result.farmer_message}
                      </pre>

                    </div>

                    <div className="d-grid gap-2 d-md-flex">

                      <button
                        className="btn btn-dark w-100"
                        onClick={copyMessage}
                      >
                        📋 Copy
                      </button>

                      <button
                        className="btn btn-primary w-100"
                        onClick={downloadPDF}
                      >
                        📄 PDF
                      </button>

                    </div>

                  </>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
