import { useMemo, useState } from "react";
import Layout from "../components/Layout";

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

  // ✅ Soil Health Score (UI only)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fertilizer/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch {
      setError("❌ Backend not reachable. Start FastAPI.");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    if (!result?.farmer_message) return;
    await navigator.clipboard.writeText(result.farmer_message);
    alert("✅ Copied!");
  };

  const downloadPDF = async () => {
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fertilizer/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setError("❌ Failed to generate PDF report.");
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
    } catch {
      setError("❌ PDF download failed. Please check backend.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">🌱 Fertilizer Recommendation</h2>
            <p className="text-muted mb-2">
              Soil inputs → AI fertilizer plan + Stage-wise schedule + PDF report
            </p>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#soilGuideModal"
            >
              📌 NPK / pH Value कशी मिळवायची?
            </button>
          </div>

          <span className="badge text-bg-dark px-3 py-2 fs-6">
            Soil Score: {soilScore}/100 ({soilLabel})
          </span>
        </div>

        <div className="row g-4">
          {/* LEFT FORM */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">🧪 Soil + Farmer Inputs</h5>

                {/* Soil meter */}
                <div className="bg-light rounded-3 p-3 mb-4 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">🌍 Soil Health Meter</span>
                    <span className="fw-bold">
                      {soilScore}/100 <span className="text-muted">({soilLabel})</span>
                    </span>
                  </div>

                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className={`progress-bar ${soilBarClass}`}
                      style={{ width: `${soilScore}%` }}
                      role="progressbar"
                    />
                  </div>

                  <small className="text-muted d-block mt-2">
                    Meter updates automatically based on NPK, pH & moisture.
                  </small>
                </div>

                <form onSubmit={submitForm}>
                  {/* Farmer details (send only) */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">👨‍🌾 Farmer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="farmer_name"
                        value={formData.farmer_name}
                        onChange={handleChange}
                        placeholder="Enter farmer name"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">🏡 Village</label>
                      <input
                        type="text"
                        className="form-control"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        placeholder="Enter village name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">🌍 Language</label>
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold">🌾 Crop Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="crop"
                      value={formData.crop}
                      onChange={handleChange}
                      placeholder="e.g. Rice / Wheat / Onion / Cotton"
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Nitrogen (N)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="nitrogen"
                        value={formData.nitrogen}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Phosphorus (P)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="phosphorus"
                        value={formData.phosphorus}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Potassium (K)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="potassium"
                        value={formData.potassium}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Soil pH</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        className="form-control"
                        name="ph"
                        value={formData.ph}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">💧 Moisture (%)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="moisture"
                        value={formData.moisture}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger mt-3 mb-0" role="alert">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 mt-4 fw-bold"
                  >
                    {loading ? "⏳ Generating..." : "✅ Get Recommendation"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT RESULT */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">📌 Recommendation Result</h5>

                {!result && !loading && (
                  <div className="alert alert-secondary mb-0">
                    Fill soil values and click <b>Get Recommendation</b>.
                  </div>
                )}

                {loading && (
                  <div className="alert alert-warning mb-0">
                    ⏳ AI is generating recommendation...
                  </div>
                )}

                {result && (
                  <>
                    {/* Summary box */}
                    <div className="border rounded-3 p-3 bg-success-subtle mb-3">
                      <p className="mb-2">
                        <b>🌾 Crop:</b> {result.crop}
                      </p>
                      <p className="mb-2">
                        <b>🧪 Basal Fertilizer:</b> {result.fertilizer}
                      </p>
                      <p className="mb-2">
                        <b>📦 Dosage:</b> {result.dosage}
                      </p>
                      <p className="mb-0">
                        <b>⏰ Timing:</b> {result.timing}
                      </p>
                    </div>

                    {/* ✅ Stage Plan table */}
                    {Array.isArray(result.stage_plan) && result.stage_plan.length > 0 && (
                      <div className="border rounded-3 p-3 bg-light mb-3">
                        <h6 className="fw-bold mb-2">📅 Stage-wise Fertilizer Plan</h6>

                        <div className="table-responsive">
                          <table className="table table-bordered table-sm align-middle mb-0">
                            <thead className="table-dark">
                              <tr>
                                <th style={{ width: 90 }}>Day</th>
                                <th>Stage</th>
                                <th>Fertilizer</th>
                                <th>Dosage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.stage_plan.map((s, idx) => (
                                <tr key={idx}>
                                  <td className="fw-bold">Day {s.day}</td>
                                  <td>{s.stage}</td>
                                  <td>{s.fertilizer}</td>
                                  <td>{s.dosage}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ✅ Notes */}
                    {Array.isArray(result.notes) && result.notes.length > 0 && (
                      <div className="alert alert-warning">
                        <b>⚠️ Important Notes:</b>
                        <ul className="mb-0 mt-2">
                          {result.notes.map((n, idx) => (
                            <li key={idx}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Farmer message */}
                    <div className="border rounded-3 p-3 bg-primary-subtle mb-3">
                      <h6 className="fw-bold mb-2">📢 Farmer Message</h6>
                      <pre
                        className="mb-0"
                        style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                      >
                        {result.farmer_message}
                      </pre>
                    </div>

                    <div className="d-grid gap-2 d-md-flex">
                      <button className="btn btn-dark w-100" onClick={copyMessage}>
                        📋 Copy
                      </button>
                      <button className="btn btn-primary w-100" onClick={downloadPDF}>
                        📄 Download PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Help Modal */}
      <div className="modal fade" id="soilGuideModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">🌿 NPK आणि Soil pH कसे तपासायचे?</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-info">
                ✅ खत शिफारस अचूक मिळण्यासाठी <b>NPK आणि pH value</b> आवश्यक आहे.
              </div>

              <h6 className="fw-bold mt-3">✅ 1) Soil Testing Laboratory (Best & Accurate)</h6>
              <ul>
                <li>शेतातून मातीचा नमुना घ्या</li>
                <li>Government Soil Testing Lab / KVK / Private Lab मध्ये द्या</li>
                <li>Soil Report मध्ये N, P, K, pH मिळतो</li>
              </ul>

              <h6 className="fw-bold mt-3">✅ 2) Soil Health Card</h6>
              <ul>
                <li>Soil Health Card मध्ये NPK + pH दिलेले असते</li>
                <li>त्या value app मध्ये टाका ✅</li>
              </ul>

              <h6 className="fw-bold mt-3">✅ 3) Mini Soil Testing Kit</h6>
              <ul>
                <li>Portable kit वापरून शेतातच टेस्ट करता येते</li>
                <li>उदा: pH meter, NPK kit, EC meter</li>
              </ul>

              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="border rounded p-2 bg-light">
                    <b>✅ फायदे</b>
                    <ul className="mb-0">
                      <li>Instant result</li>
                      <li>Multiple times use</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-2 bg-warning-subtle">
                    <b>⚠️ तोटे</b>
                    <ul className="mb-0">
                      <li>Lab एवढे accurate नाही</li>
                      <li>Step चुकीचे झाले तर result चुकीचा</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mt-3">✅ 4) pH Meter / pH Paper</h6>
              <ol>
                <li>माती + स्वच्छ पाणी mix करा (1:2)</li>
                <li>pH paper किंवा meter dip करा</li>
                <li>pH वाचून app मध्ये टाका</li>
              </ol>

              <h6 className="fw-bold mt-3">✅ 5) Mobile Soil Testing Vans</h6>
              <ul>
                <li>काही जिल्ह्यात Mobile Soil Testing Van गावात येते</li>
                <li>तात्काळ soil test करून मिळते</li>
              </ul>

              <div className="alert alert-success mt-3 mb-0">
                ✅ Tip: Soil report नसल्यास जवळच्या Agriculture Officer / KVK ला संपर्क करा.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
