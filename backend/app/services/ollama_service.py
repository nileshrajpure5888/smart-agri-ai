import requests
import json

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

# ✅ FAST + GOOD QUALITY MODEL
OLLAMA_MODEL = "llama3.2:3b"


def ask_ollama(prompt: str) -> str:

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,

        # ⚡ Balanced speed + quality
        "options": {
            "temperature": 0.3,
            "num_predict": 220,   # ✅ Increased limit
            "top_k": 40,
            "top_p": 0.9,
        },
    }

    try:
        res = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=180
        )

        res.raise_for_status()

        data = res.json()

        return data.get("response", "").strip()

    except requests.exceptions.Timeout:
        return "⚠️ AI response timeout. Please try again."

    except Exception as e:
        print("❌ Ollama error:", str(e))

        return "⚠️ AI service error. Please try later."
