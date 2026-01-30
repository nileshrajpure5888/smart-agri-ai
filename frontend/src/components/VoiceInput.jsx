import { useEffect, useRef, useState } from "react";

export default function VoiceInput({ onDetected }) {
  const [listening, setListening] = useState(false);
  const [msg, setMsg] = useState("Click Speak to ask in Marathi/Hindi");

  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false); // ✅ prevent multiple start() calls

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("❌ SpeechRecognition not supported");
      setMsg("❌ Voice not supported in this browser");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "mr-IN"; // Marathi (use hi-IN for Hindi)
    recog.interimResults = false;
    recog.continuous = false;

    recog.onstart = () => {
      setListening(true);
      setMsg("🎙️ Listening...");
    };

    recog.onend = () => {
      setListening(false);
      isStartingRef.current = false;
      setMsg("Click Speak to ask in Marathi/Hindi");
    };

    recog.onerror = (e) => {
      // ✅ e.error values: not-allowed | no-speech | audio-capture | aborted | network
      console.log("🎤 Speech recognition error:", e?.error);

      setListening(false);
      isStartingRef.current = false;

      if (e?.error === "not-allowed") {
        setMsg("❌ Mic permission denied (allow microphone access)");
      } else if (e?.error === "no-speech") {
        setMsg("⚠ No speech detected, try again");
      } else if (e?.error === "audio-capture") {
        setMsg("❌ Microphone not found");
      } else if (e?.error === "network") {
        setMsg("❌ Network issue in voice recognition");
      } else {
        setMsg("⚠ Voice error, try again");
      }

      // ✅ stop safely
      try {
        recog.stop();
      } catch (err) {}
    };

    recog.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim();

      if (text) {
        setMsg(`✅ Detected: "${text}"`);
        onDetected(text); // ✅ call only once
      } else {
        setMsg("⚠ Could not detect speech");
      }

      // ✅ stop immediately after one result
      try {
        recog.stop();
      } catch (err) {}
    };

    recognitionRef.current = recog;

    return () => {
      try {
        recog.stop();
      } catch (err) {}
    };
  }, [onDetected]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    // ✅ prevent double start crash
    if (isStartingRef.current || listening) return;

    try {
      isStartingRef.current = true;
      setMsg("Starting mic...");
      recognitionRef.current.start();
    } catch (err) {
      console.log("start error:", err?.message);
      isStartingRef.current = false;
      setMsg("❌ Unable to start voice input");
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {}
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      <button
        type="button"
        className={`btn btn-sm ${
          listening ? "btn-danger" : "btn-outline-success"
        }`}
        onClick={listening ? stopListening : startListening}
      >
        {listening ? "🎙️ Stop" : "🎤 Speak"}
      </button>

      <small className="text-muted">{msg}</small>
    </div>
  );
}
