from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import market_ai_routes
# ================= ADMIN =================
from app.routes.admin_routes import router as admin_router

# ================= CORE =================
from app.routes import auth, crop, weather, market, mandi, disease
from app.routes.market_prediction_routes import router as market_prediction_router
from app.routes.market_sync import router as market_sync_router

# ================= FEATURES =================
from app.routes.chatbot_routes import router as chat_router
from app.routes.activity_routes import router as activity_router
from app.routes.fertilizer import router as fertilizer_router
from app.routes.user_routes import router as user_router
from app.routes.calendar_routes import router as calendar_router
from app.routes.weather_routes import router as weather_router

# ================= MARKETPLACE =================
from app.routes.upload_routes import router as upload_router
from app.routes.products_routes import router as products_router
from app.routes.order_request_routes import router as order_router

# ================= FARMER =================
from app.routes.farmer_routes import router as farmer_router

# ================= NEW: REVIEWS + STORIES =================
from app.routes.reviews import router as review_router
from app.routes.stories import router as story_router


# ================= APP =================
app = FastAPI(title="Smart Agri AI Platform Backend")


# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= STATIC =================
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ================= CORE ROUTES =================
app.include_router(disease.router)
app.include_router(auth.router)
app.include_router(crop.router)
app.include_router(weather.router)
app.include_router(market.router)
app.include_router(mandi.router)
app.include_router(market_prediction_router)


# ================= FEATURE ROUTES =================
app.include_router(activity_router)
app.include_router(chat_router)
app.include_router(calendar_router)
app.include_router(user_router)

# Only one weather
app.include_router(weather_router)


# ================= MARKETPLACE =================
app.include_router(upload_router)
app.include_router(order_router)
app.include_router(products_router)


# ================= FARMER =================
app.include_router(farmer_router)


# ================= FERTILIZER =================
app.include_router(fertilizer_router)


# ================= ADMIN =================
app.include_router(admin_router)


# ================= REVIEWS + STORIES =================
app.include_router(review_router)   # ✅ ADD
app.include_router(story_router)    # ✅ ADD

app.include_router(market_sync_router)
app.include_router(market_ai_routes.router)

from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ================= HOME =================
@app.get("/")
def home():
    return {"message": "Backend Running ✅"}
