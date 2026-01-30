import { useEffect, useRef, useState } from "react";
import VoiceInput from "./VoiceInput";

export default function AgriChatbot({ disease, confidence, details, onClose }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्कार 🙏 मी तुमचा कृषी AI सहाय्यक आहे. रोग/फवारणी विषयी प्रश्न विचारा.",
    },
  ]);

  const chatEndRef = useRef(null);

  const suggestions = [
    "यावर कोणती फवारणी करावी?",
    "सेंद्रिय उपाय कोणते?",
    "रासायनिक औषध + डोस किती?",
    "फवारणी किती दिवसांनी करावी?",
    "सेफ्टी/काळजी काय घ्यावी?",
  ];

  // ================= Auto Scroll =================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ================= Bullet Format =================
  const toBullets = (text) => {
    if (!text) return [];

    return text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-*•]\s*/, ""))
      .filter(Boolean);
  };

  // ================= Text To Speech =================
  const speakText = (text) => {
    try {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "mr-IN";
      u.rate = 1;
      u.pitch = 1;

      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  const stopSpeech = () => {
    try {
      window.speechSynthesis?.cancel();
    } catch (e) {}
  };

  // ================= Ask AI =================
  const askAI = async (customQuestion = null) => {
    const finalQ = (customQuestion ?? question).trim();
    if (!finalQ || loading) return;

    setQuestion("");

    // Add user msg
    setMessages((prev) => [...prev, { role: "user", text: finalQ }]);
    setLoading(true);

    // Add placeholder
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "⏳ उत्तर तयार होत आहे..." },
    ]);

    try {
      const payload = {
        question: finalQ,
        disease: disease || "",
        confidence: confidence || 0,
        details: details || {},
        language: "mr",
      };

      const res = await fetch("http://127.0.0.1:8000/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      const answer = data.answer || "⚠️ उत्तर मिळाले नाही.";

      // Update last assistant msg
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: answer,
        };
        return updated;
      });

      speakText(answer);
    } catch (err) {
      console.error("Chat Error:", err);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: "❌ AI error. पुन्हा प्रयत्न करा.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div
      className="fixed inset-0 z-50"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-2"
        style={{ zIndex: 9999 }}
      >
        <div
          className="bg-white shadow-lg d-flex flex-column"
          style={{
            width: "100%",
            maxWidth: "820px",
            height: "92vh",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2"
            style={{ background: "#157347", color: "#fff" }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>🌿 Smart Agri AI Chat</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                Disease: {disease || "N/A"} | Confidence:{" "}
                {confidence ? Math.round(confidence) : 0}%
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={stopSpeech}
                className="btn btn-sm btn-light"
                title="Mute"
              >
                🔇
              </button>

              <button onClick={onClose} className="btn btn-sm btn-light">
                ✖
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-grow-1 p-3"
            style={{ overflowY: "auto", background: "#f6f7f8" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`d-flex mb-2 ${
                  m.role === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: m.role === "user" ? "#198754" : "#ffffff",
                    color: m.role === "user" ? "#fff" : "#111",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.role === "assistant" && m.text ? (
                    <div>
                      {toBullets(m.text).length > 1 ? (
                        <ul className="mb-0 ps-3">
                          {toBullets(m.text).map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        m.text
                      )}
                    </div>
                  ) : (
                    m.text
                  )}
                </div>

                {m.role === "assistant" && m.text && (
                  <button
                    onClick={() => speakText(m.text)}
                    className="btn btn-sm btn-outline-secondary ms-2"
                    title="Speak"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-2">
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px",
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  ⏳ AI typing...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 border-top bg-white">
            <div className="d-flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-outline-success"
                  onClick={() => askAI(s)}
                  disabled={loading}
                >
                  ⚡ {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-top bg-white">
            <div className="d-flex gap-2 align-items-center">
              <VoiceInput onDetected={(text) => setQuestion(text)} />

              <input
                className="form-control"
                value={question}
                placeholder="Type your question..."
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askAI();
                }}
              />

              <button
                className="btn btn-success"
                onClick={() => askAI()}
                disabled={loading}
              >
                Send
              </button>
            </div>

            <div className="text-muted mt-2" style={{ fontSize: 12 }}>
              ✅ Fast AI | Voice Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
