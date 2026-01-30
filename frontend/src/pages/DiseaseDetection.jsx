import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import AgriChatbot from "../components/AgriChatbot";

// ✅ Convert anything (object/array/detail) into string safely
const toText = (data) => {
  if (!data) return "";

  if (typeof data === "string") return data;

  // ✅ FastAPI validation errors: detail = [ {type, loc, msg, input} ]
  if (Array.isArray(data)) {
    return data
      .map((x) => x?.msg || x?.message || JSON.stringify(x))
      .join("\n");
  }

  if (typeof data === "object") {
    if (data?.msg) return data.msg;
    if (data?.message) return data.message;
    if (data?.detail) return toText(data.detail);

    return JSON.stringify(data, null, 2);
  }

  return String(data);
};

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [activeTab, setActiveTab] = useState("info");
  const [showChat, setShowChat] = useState(false);

  // ✅ Language selector
  const [language, setLanguage] = useState("mr"); // mr / hi / en

  // ✅ AI Tab Answer
  const [tabAnswer, setTabAnswer] = useState("");
  const [tabLoading, setTabLoading] = useState(false);

  // ✅ Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("❌ Only image files allowed!");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      alert("❌ Image too large. Upload under 5MB.");
      return;
    }

    setFile(f);
    setResult(null);
    setActiveTab("info");
    setShowChat(false);
    setTabAnswer("");

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  // ✅ Detect Disease
  const detectDisease = async () => {
    if (!file) {
      alert("❌ Please upload leaf image first!");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/disease/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      setActiveTab("info");
    } catch (err) {
      console.log("❌ Disease predict error full:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      const raw =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Disease prediction failed ❌";

      alert(toText(raw));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto fetch AI response for active tab
  useEffect(() => {
    const fetchTabAI = async () => {
      if (!result?.disease) return;

      setTabLoading(true);
      setTabAnswer("");

      const langText =
        language === "mr"
          ? "Marathi"
          : language === "hi"
          ? "Hindi"
          : "English";

      let q = "";

      if (activeTab === "info") {
        q = `Explain disease ${result.disease} in ${langText}. Give symptoms and causes.`;
      } else if (activeTab === "treatment") {
        q = `Give best organic and chemical treatment for ${result.disease} in ${langText}.`;
      } else if (activeTab === "spray") {
        q = `Give spray schedule for ${result.disease} visible on leaf in ${langText}. Include medicine name + dose.`;
      } else if (activeTab === "fertilizer") {
        q = `Give fertilizer advice for plant suffering from ${result.disease} in ${langText}.`;
      }

      try {
        const res = await api.post("/api/chat/ask", {
          question: q,
          disease: result?.disease || "",
          confidence: result?.confidence || 0,
          details: result || {}, // ✅ pass full
          language: language,
        });

        const ans =
          res.data?.answer ||
          res.data?.response ||
          res.data?.message ||
          res.data?.result ||
          res.data;

        setTabAnswer(toText(ans) || "No answer ❌");
      } catch (err) {
        console.log("❌ Tab AI error full:", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });

        const raw =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "❌ AI response failed.";

        setTabAnswer(toText(raw));
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabAI();
  }, [activeTab, result, language]);

  // ✅ Tab Button
  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`btn btn-sm ${
        activeTab === id ? "btn-success" : "btn-outline-secondary"
      }`}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🍃 Crop Disease Detection</h2>
          <p className="text-muted mb-0">
            Upload leaf photo → AI detects disease + gives treatment
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>

          <button
            className={`btn ${result ? "btn-success" : "btn-secondary"}`}
            disabled={!result}
            onClick={() => setShowChat(true)}
            type="button"
          >
            🤖 Ask AI
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Upload Panel */}
        <div className="col-md-4">
          <div className="card shadow-sm p-4" style={{ borderRadius: "16px" }}>
            <h5 className="fw-bold mb-3">📤 Upload Leaf Image</h5>

            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-3 w-100"
                style={{
                  height: "260px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: "1px solid #ddd",
                }}
              />
            )}

            <button
              className="btn btn-success w-100 mt-3"
              onClick={detectDisease}
              disabled={loading}
              type="button"
            >
              {loading ? "Detecting..." : "✅ Detect Disease"}
            </button>

            <small className="text-muted d-block mt-3">
              ✅ Tip: Use clear image (only leaf) | Max size 5MB
            </small>
          </div>
        </div>

        {/* Result Panel */}
        <div className="col-md-8">
          <div className="card shadow-sm p-4" style={{ borderRadius: "16px" }}>
            <h5 className="fw-bold mb-3">📊 Disease Result</h5>

            {!result ? (
              <p className="text-muted mb-0">
                Upload image and click detect to see prediction.
              </p>
            ) : (
              <>
                <div
                  className="p-4 border"
                  style={{ borderRadius: "16px", background: "#f3fff8" }}
                >
                  <h4 className="fw-bold mb-1">{result.disease}</h4>
                  <p className="mb-2 text-muted">
                    Confidence:{" "}
                    <b className="text-dark">{result.confidence}%</b>
                  </p>

                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <TabButton id="info" label="📌 Info" />
                  <TabButton id="treatment" label="💊 Treatment" />
                  <TabButton id="spray" label="🧪 Spray" />
                  <TabButton id="fertilizer" label="🌿 Fertilizer" />
                </div>

                <div
                  className="mt-3 p-4 border bg-light"
                  style={{ borderRadius: "16px", minHeight: "240px" }}
                >
                  {tabLoading ? (
                    <p className="text-muted">⏳ AI generating answer...</p>
                  ) : (
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                      {tabAnswer || "No answer yet."}
                    </pre>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Chatbot Popup */}
      {showChat && result && (
        <AgriChatbot
          disease={result?.disease || ""}
          confidence={result?.confidence || 0}
          details={result}  // ✅ FIXED HERE
          onClose={() => setShowChat(false)}
        />
      )}
    </Layout>
  );
}
