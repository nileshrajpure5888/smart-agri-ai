import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import VoiceInput from "../components/VoiceInput";

const cropMarathiMap = {
  Rice: "तांदूळ (भात)",
  Wheat: "गहू",
  Sugarcane: "ऊस",
  Cotton: "कापूस",
  Soybean: "सोयाबीन",
  Maize: "मका",
  "Bajra (Pearl Millet)": "बाजरी",
  "Jowar (Sorghum)": "ज्वारी",
  "Pulses (Tur/Gram)": "डाळी (तूर/हरभरा)",
  "Gram (Chana)": "हरभरा",
  Mustard: "मोहरी",
  Onion: "कांदा",
  Vegetables: "भाज्या",
  Watermelon: "टरबूज",
  Cucumber: "काकडी",
};

export default function CropRecommendation() {
  const [location, setLocation] = useState("GPS शोधत आहे...");
  const [season, setSeason] = useState("");
  const [soilType, setSoilType] = useState("");
  const [water, setWater] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("GPS उपलब्ध नाही");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(
          `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        );
      },
      () => setLocation("GPS परवानगी नाकारली")
    );
  }, []);

  // ✅ voice load fix
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  const cleanForSpeech = (text) => {
    if (!text) return "";
    return text
      .replaceAll("/", " प्रति ")
      .replaceAll("-", " ते ")
      .replaceAll("₹", "")
      .replaceAll("k", " हजार")
      .replaceAll("L", " लाख");
  };

  const getBestMarathiVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const mr = voices.find((v) => v.lang === "mr-IN");
    if (mr) return mr;
    const hi = voices.find((v) => v.lang === "hi-IN");
    if (hi) return hi;
    const enIn = voices.find((v) => v.lang === "en-IN");
    if (enIn) return enIn;
    return voices[0];
  };

  const profitToMarathi = (profitText) => {
    if (!profitText) return "";
    let p = profitText;
    p = p.replaceAll("₹", "");
    p = p.replaceAll("/acre", " प्रति एकर");
    p = p.replaceAll("/hectare", " प्रति हेक्टर");
    p = p.replaceAll("-", " ते ");
    p = p.replaceAll("k", " हजार");
    p = p.replaceAll("L", " लाख");
    return p;
  };

  const speakCropsStepByStep = (cropsList) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const voice = getBestMarathiVoice();

    const messages = [
      "तुमच्यासाठी सर्वोत्तम तीन पिके आहेत.",
      `पहिलं पीक: ${cropsList[0]?.name}. अपेक्षित नफा: ${profitToMarathi(
        cropsList[0]?.profit
      )}.`,
      `दुसरं पीक: ${cropsList[1]?.name}. अपेक्षित नफा: ${profitToMarathi(
        cropsList[1]?.profit
      )}.`,
      `तिसरं पीक: ${cropsList[2]?.name}. अपेक्षित नफा: ${profitToMarathi(
        cropsList[2]?.profit
      )}.`,
      "धन्यवाद!",
    ];

    let i = 0;

    const speakNext = () => {
      if (i >= messages.length) return;

      const utter = new SpeechSynthesisUtterance(cleanForSpeech(messages[i]));
      utter.lang = "mr-IN";
      utter.rate = 0.95;
      utter.voice = voice;

      utter.onend = () => {
        i++;
        setTimeout(speakNext, 600);
      };

      window.speechSynthesis.speak(utter);
    };

    setTimeout(speakNext, 200);
  };

  // ✅ Predict API
  const handlePredict = async () => {
    if (!season || !soilType || !water) {
      alert("कृपया हंगाम / जमीन / पाणी निवडा ✅");
      return;
    }

    setResult(null);

    try {
      setLoading(true);

      const res = await api.post("/api/crop/simple-predict", {
        location,
        season,
        soil_type: soilType,
        water,
      });

      setResult(res.data);

      const crops = res.data.top_3_crops.map((c) => ({
        name: cropMarathiMap[c.crop] || c.crop,
        profit: c.profit,
      }));

      speakCropsStepByStep(crops);
    } catch (err) {
      alert("Recommendation failed ❌");
      console.log("CROP ERROR:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Voice parsing
  const parseVoiceText = async (text) => {
    try {
      const res = await api.post("/api/crop/parse-voice-smart", { text });
      const parsed = res.data;

      if (parsed.location) setLocation(parsed.location);
      if (parsed.season) setSeason(parsed.season);
      if (parsed.soil_type) setSoilType(parsed.soil_type);
      if (parsed.water) setWater(parsed.water);

      if (!parsed.season || !parsed.soil_type || !parsed.water) {
        alert("Voice partially detected ✅ उरलेले options निवडा");
        return;
      }

      setTimeout(() => handlePredict(), 800);
    } catch (err) {
      alert("Voice detection failed ❌");
      console.log(err?.response?.data || err.message);
    }
  };

  const InputLabel = ({ title, subtitle }) => (
    <div className="mb-2">
      <div className="fw-bold">{title}</div>
      <div className="text-muted" style={{ fontSize: 12 }}>
        {subtitle}
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">🌱 पीक शिफारस प्रणाली (AI)</h2>
        <p className="text-muted mb-0">
          तुमच्या हंगाम + जमिन + पाणी उपलब्धता नुसार सर्वोत्तम पीक निवडा.
        </p>
      </div>

      <div className="row g-4">
        {/* LEFT: INPUT PANEL */}
        <div className="col-lg-5">
          <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">🧾 माहिती भरा</h5>
                <small className="text-muted">
                  📍 Location: <b>{location}</b>
                </small>
              </div>
            </div>

            {/* Voice */}
            <div className="p-3 border rounded-3 mb-3 bg-light">
              <div className="fw-bold mb-1">🎙️ Voice Input</div>
              <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                बोलून season/soil/water सांगा (उदा. "रब्बी काळी जमीन मध्यम पाणी")
              </div>
              <VoiceInput onDetected={parseVoiceText} />
            </div>

            {/* Season */}
            <InputLabel title="🌦️ हंगाम (Season)" subtitle="कृपया हंगाम निवडा" />
            <select
              className="form-select mb-3"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">Select season</option>
              <option value="Kharif">Kharif (पावसाळा)</option>
              <option value="Rabi">Rabi (हिवाळा)</option>
              <option value="Summer">Summer (उन्हाळा)</option>
            </select>

            {/* Soil */}
            <InputLabel
              title="🌍 जमीन प्रकार (Soil Type)"
              subtitle="तुमच्या शेतातील मातीचा प्रकार निवडा"
            />
            <select
              className="form-select mb-3"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              <option value="">Select soil</option>
              <option value="Black">Black (काळी)</option>
              <option value="Red">Red (लाल)</option>
              <option value="Sandy">Sandy (वालुकामय)</option>
              <option value="Clay">Clay (चिकणमाती)</option>
            </select>

            {/* Water */}
            <InputLabel
              title="💧 पाणी उपलब्धता (Water)"
              subtitle="पाणी कमी/मध्यम/जास्त निवडा"
            />
            <select
              className="form-select mb-4"
              value={water}
              onChange={(e) => setWater(e.target.value)}
            >
              <option value="">Select water availability</option>
              <option value="Low">Low (कमी)</option>
              <option value="Medium">Medium (मध्यम)</option>
              <option value="High">High (जास्त)</option>
            </select>

            {/* CTA */}
            <button
              className="btn btn-success btn-lg w-100"
              onClick={handlePredict}
              disabled={loading}
              style={{ borderRadius: 16 }}
            >
              {loading ? "🔄 AI शिफारस करत आहे..." : "✅ पीक शिफारस मिळवा"}
            </button>

            <button
              className="btn btn-outline-danger w-100 mt-2"
              type="button"
              style={{ borderRadius: 16 }}
              onClick={() => {
                window.speechSynthesis.cancel();
              }}
            >
              🔇 आवाज बंद करा
            </button>
          </div>
        </div>

        {/* RIGHT: RESULT PANEL */}
        <div className="col-lg-7">
          <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
            <h5 className="fw-bold mb-3">📊 तुमच्यासाठी Top 3 पिके</h5>

            {!result ? (
              <div className="text-muted">
                ✅ डावीकडून माहिती भरा आणि “पीक शिफारस मिळवा” क्लिक करा.
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {result.top_3_crops.map((item, idx) => (
                    <div key={idx} className="col-md-4">
                      <div
                        className="p-3 border bg-light"
                        style={{ borderRadius: 16, height: "100%" }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-success">
                            Rank #{idx + 1}
                          </span>
                          <span>🌾</span>
                        </div>

                        <h5 className="mt-2 fw-bold text-success mb-2">
                          {cropMarathiMap[item.crop] || item.crop}
                        </h5>

                        <div style={{ fontSize: 14 }}>
                          <div className="mb-1">
                            ⏳ <b>कालावधी:</b> {item.duration}
                          </div>
                          <div>
                            💰 <b>अपेक्षित नफा:</b> {profitToMarathi(item.profit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Speak Again */}
                <button
                  className="btn btn-warning btn-lg mt-4 w-100"
                  type="button"
                  style={{ borderRadius: 16 }}
                  onClick={() => {
                    const crops = result.top_3_crops.map((c) => ({
                      name: cropMarathiMap[c.crop] || c.crop,
                      profit: c.profit,
                    }));
                    speakCropsStepByStep(crops);
                  }}
                >
                  🔊 पुन्हा ऐका (Speak Again)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
