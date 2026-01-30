from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from datetime import datetime

# ✅ PDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4


router = APIRouter(prefix="/api/fertilizer", tags=["Fertilizer Recommendation"])


# ✅ Request Model
class FertilizerRequest(BaseModel):
    farmer_name: str = "Farmer"
    village: str = "-"
    crop: str

    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    moisture: float

    language: str = "marathi"  # marathi / hindi / english


# ✅ Soil Score
def calculate_soil_score(n, p, k, ph, moisture):
    nScore = min(100, (n / 50) * 100)
    pScore = min(100, (p / 40) * 100)
    kScore = min(100, (k / 40) * 100)

    phScore = 40
    if 6.5 <= ph <= 7.5:
        phScore = 100
    elif (5.5 <= ph < 6.5) or (7.5 < ph <= 8.5):
        phScore = 70

    mScore = 100 if 25 <= moisture <= 60 else 60

    total = (nScore + pScore + kScore + phScore + mScore) / 5
    return round(total)


# ✅ pH Warning
def get_ph_warning(ph):
    if ph < 0 or ph > 14:
        return "❌ Soil pH invalid. Please enter pH between 0 to 14."
    if ph < 3 or ph > 10:
        return "❌ Soil pH value looks wrong. Please re-check soil test report."
    if ph < 5.5:
        return "⚠️ Soil is acidic. Lime application may be needed."
    if ph > 8.5:
        return "⚠️ Soil is highly alkaline. Gypsum + organic matter is recommended."
    return None


@router.get("/test")
def test_fertilizer():
    return {"message": "Fertilizer API Working ✅"}


# ✅ Recommendation Logic
@router.post("/recommend")
def recommend_fertilizer(data: FertilizerRequest):
    ph_warning = get_ph_warning(data.ph)

    # ✅ if very wrong pH, directly stop
    if ph_warning and ph_warning.startswith("❌"):
        return {"error": ph_warning}

    # ✅ rule-based logic (replace later with ML model)
    if data.nitrogen < 40:
        fertilizer = "Urea"
        dosage = "50 kg per acre"
        timing = "15 days after sowing"
        tip = "खत टाकल्यानंतर लगेच पाणी द्या."
    elif data.phosphorus < 30:
        fertilizer = "DAP"
        dosage = "50 kg per acre"
        timing = "at sowing time"
        tip = "बी पेरणीच्या वेळी DAP टाकणे फायदेशीर."
    elif data.potassium < 30:
        fertilizer = "MOP (Potash)"
        dosage = "25 kg per acre"
        timing = "after first irrigation"
        tip = "पाण्यानंतर माती ओलसर असताना खत द्या."
    else:
        fertilizer = "NPK 19:19:19"
        dosage = "25 kg per acre"
        timing = "spray or drip once in 20 days"
        tip = "फवारणी करताना सकाळी/संध्याकाळी करा."

    soil_score = calculate_soil_score(
        data.nitrogen, data.phosphorus, data.potassium, data.ph, data.moisture
    )

    lang = data.language.lower().strip()

    # ✅ Farmer message
    if lang == "marathi":
        farmer_message = (
            f"✅ पीक: {data.crop}\n"
            f"📌 शिफारस: {fertilizer}\n"
            f"📦 प्रमाण: {dosage}\n"
            f"⏰ कधी टाकायचे: {timing}\n"
            f"💡 टीप: {tip}"
        )
        if ph_warning:
            farmer_message += f"\n\n{ph_warning}"

    elif lang == "hindi":
        farmer_message = (
            f"✅ फसल: {data.crop}\n"
            f"📌 सिफारिश: {fertilizer}\n"
            f"📦 मात्रा: {dosage}\n"
            f"⏰ कब डालना है: {timing}\n"
            f"💡 टिप: खाद डालने के बाद सिंचाई जरूर करें।"
        )
        if ph_warning:
            farmer_message += f"\n\n{ph_warning}"

    else:
        farmer_message = (
            f"✅ Crop: {data.crop}\n"
            f"📌 Recommendation: {fertilizer}\n"
            f"📦 Dosage: {dosage}\n"
            f"⏰ Timing: {timing}\n"
            f"💡 Tip: Irrigate after applying fertilizer."
        )
        if ph_warning:
            farmer_message += f"\n\n{ph_warning}"

    return {
        "farmer_name": data.farmer_name,
        "village": data.village,
        "crop": data.crop,
        "fertilizer": fertilizer,
        "dosage": dosage,
        "timing": timing,
        "soil_score": soil_score,
        "ph_warning": ph_warning,
        "farmer_message": farmer_message,
        "inputs": {
            "nitrogen": data.nitrogen,
            "phosphorus": data.phosphorus,
            "potassium": data.potassium,
            "ph": data.ph,
            "moisture": data.moisture,
            "language": data.language,
        },
    }


# ✅ PROFESSIONAL PDF Report
@router.post("/report")
def fertilizer_report(data: FertilizerRequest):
    rec = recommend_fertilizer(data)

    # ✅ if error from recommend
    if isinstance(rec, dict) and rec.get("error"):
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(50, height - 80, "Fertilizer Recommendation Report")
        pdf.setFont("Helvetica", 12)
        pdf.drawString(50, height - 120, rec["error"])

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=fertilizer_report.pdf"},
        )

    soil_score = rec.get("soil_score", 0)
    ph_warning = rec.get("ph_warning", None)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    def box(x, y, w, h):
        pdf.roundRect(x, y, w, h, 10, stroke=1, fill=0)

    # ✅ header bar
    pdf.setFillColorRGB(0.05, 0.5, 0.2)
    pdf.rect(0, height - 80, width, 80, fill=1, stroke=0)

    pdf.setFillColorRGB(1, 1, 1)
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(50, height - 50, "Fertilizer Recommendation Report")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        50,
        height - 70,
        f"Generated On: {datetime.now().strftime('%d-%m-%Y %I:%M %p')}",
    )

    pdf.setFillColorRGB(0, 0, 0)

    # ✅ Farmer Details
    y = height - 150
    box(40, y - 70, width - 80, 70)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(55, y - 25, "Farmer Details")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(55, y - 45, f"Name: {data.farmer_name}")
    pdf.drawString(300, y - 45, f"Village: {data.village}")
    pdf.drawString(55, y - 62, f"Crop: {data.crop}")

    # ✅ Soil Score meter
    y2 = y - 120
    box(40, y2 - 60, width - 80, 60)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(55, y2 - 20, "Soil Health Score")

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(55, y2 - 42, f"Score: {soil_score}/100")

    # progress bar
    bar_x = 170
    bar_y = y2 - 48
    bar_w = 330
    bar_h = 12

    pdf.setFillColorRGB(0.9, 0.9, 0.9)
    pdf.rect(bar_x, bar_y, bar_w, bar_h, fill=1, stroke=0)

    fill_w = (soil_score / 100) * bar_w

    if soil_score >= 80:
        pdf.setFillColorRGB(0.1, 0.6, 0.2)
    elif soil_score >= 60:
        pdf.setFillColorRGB(0.1, 0.5, 0.8)
    elif soil_score >= 40:
        pdf.setFillColorRGB(0.95, 0.7, 0.1)
    else:
        pdf.setFillColorRGB(0.9, 0.1, 0.1)

    pdf.rect(bar_x, bar_y, fill_w, bar_h, fill=1, stroke=0)
    pdf.setFillColorRGB(0, 0, 0)

    # ✅ Soil Inputs
    y3 = y2 - 120
    box(40, y3 - 120, width - 80, 120)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(55, y3 - 20, "Soil Inputs")

    pdf.setFont("Helvetica", 11)
    lines = [
        f"Nitrogen (N): {data.nitrogen}",
        f"Phosphorus (P): {data.phosphorus}",
        f"Potassium (K): {data.potassium}",
        f"Soil pH: {data.ph}",
        f"Moisture: {data.moisture}%",
        f"Language: {data.language}",
    ]

    yy = y3 - 45
    for line in lines:
        pdf.drawString(60, yy, line)
        yy -= 18

    # ✅ Recommendation
    y4 = y3 - 170
    box(40, y4 - 90, width - 80, 90)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(55, y4 - 20, "Recommendation")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(60, y4 - 45, f"Fertilizer: {rec['fertilizer']}")
    pdf.drawString(60, y4 - 63, f"Dosage: {rec['dosage']}")
    pdf.drawString(60, y4 - 81, f"Timing: {rec['timing']}")

    # ✅ Warning box
    y5 = y4 - 120
    if ph_warning:
        box(40, y5 - 60, width - 80, 60)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(55, y5 - 20, "Important Warning")
        pdf.setFont("Helvetica", 11)
        pdf.drawString(60, y5 - 42, ph_warning)
        y5 -= 85

    # ✅ Farmer Message
    y6 = y5 - 40
    box(40, y6 - 120, width - 80, 120)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(55, y6 - 20, "Farmer Message")

    pdf.setFont("Helvetica", 10.5)
    yy = y6 - 42
    for line in rec["farmer_message"].split("\n"):
        line = line.strip()

        # ✅ FIX: change ■ to •
        if line.startswith("■"):
            line = "• " + line[1:].strip()

        pdf.drawString(60, yy, line)
        yy -= 16

    # footer
    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        50,
        25,
        "Smart Agri AI Platform | AI generated report. Please verify with Agriculture Officer if needed.",
    )

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=fertilizer_report.pdf"},
    )
