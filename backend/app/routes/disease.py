from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.plantid_service import plantid_health_assessment

router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])


@router.get("/test")
def test_disease():
    return {"message": "Disease API Working ✅"}


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image file allowed ❌")

        img_bytes = await file.read()

        # ✅ Call Plant.id API (MUST await)
        data = await plantid_health_assessment(img_bytes)

        result = data.get("result", {})

        # ✅ Healthy Check
        is_healthy = result.get("is_healthy", {}).get("binary", False)
        if is_healthy:
            confidence = round(result.get("is_healthy", {}).get("probability", 0) * 100, 2)

            return {
                "disease": "Healthy Plant ✅",
                "confidence": confidence,
                "details": {
                    "plantid_raw": result
                }
            }

        # ✅ Get disease suggestions
        diseases = result.get("disease", {}).get("suggestions", [])

        if not diseases:
            return {
                "disease": "Unknown Disease",
                "confidence": 0,
                "details": {
                    "plantid_raw": result
                }
            }

        top = diseases[0]
        disease = top.get("name", "Unknown Disease")
        confidence = round(float(top.get("probability", 0)) * 100, 2)

        return {
            "disease": disease,
            "confidence": confidence,
            "details": {
                "plantid_top": top,
                "plantid_all": diseases[:3],   # ✅ top 3 diseases
                "plantid_raw": result
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ disease predict error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

