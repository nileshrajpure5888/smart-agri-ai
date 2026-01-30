from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, Union

from app.services.ollama_service import ask_ollama


router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


# ================= Request Model =================

class ChatRequest(BaseModel):
    question: str

    # Old frontend fields (keep for compatibility)
    disease: Optional[str] = ""
    confidence: Optional[float] = 0
    details: Optional[Union[str, Dict[str, Any]]] = ""

    language: Optional[str] = "mr"   # mr / hi / en


# ================= Prompt Builder =================

def build_prompt(req: ChatRequest) -> str:

    lang_map = {
        "mr": "Marathi",
        "hi": "Hindi",
        "en": "English"
    }

    lang = lang_map.get(req.language, "Marathi")

    # 🔥 Short + Balanced Prompt (Fast + Good Quality)
    prompt = f"""
You are an agriculture expert for Indian farmers.

Reply only in {lang}.
Give correct and practical advice.

Disease: {req.disease}
Question: {req.question}

Answer in 5 short bullet points:
- Symptoms
- Treatment (medicine + dose)
- Spray interval
- Safety
- Prevention
"""

    return prompt.strip()


# ================= API =================

@router.post("/ask")
def ask_ai(req: ChatRequest):

    try:
        prompt = build_prompt(req)

        answer = ask_ollama(prompt)

        return {
            "answer": answer
        }

    except Exception as e:
        print("❌ Chat API Error:", e)

        return {
            "answer": "⚠️ AI service temporarily unavailable. Please try again."
        }
