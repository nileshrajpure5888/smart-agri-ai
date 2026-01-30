import os
import requests
from fastapi import APIRouter, Query, HTTPException
from dotenv import load_dotenv
from datetime import datetime
from functools import lru_cache
from math import radians, sin, cos, sqrt, atan2


# =========================
# CONFIG
# =========================

load_dotenv()

router = APIRouter(prefix="/api/mandi", tags=["Mandi"])

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"


# =========================
# VERIFIED MANDI LOCATIONS
# =========================
# (Avoid wrong Google/OSM routing)

MANDI_COORDS = {

    # Maharashtra APMC

    "Pune": (18.5186, 73.8567),        # Pune APMC
    "Nashik": (19.9975, 73.7898),      # Nashik APMC
    "Mumbai": (19.0760, 72.8777),      # Vashi APMC
    "Nagpur": (21.1458, 79.0882),      # Kalamna APMC
    "Solapur": (17.6599, 75.9064),     # Solapur APMC

}


MANDI_LIST = [
    {"name": "Pune", "state": "Maharashtra"},
    {"name": "Nashik", "state": "Maharashtra"},
    {"name": "Mumbai", "state": "Maharashtra"},
    {"name": "Nagpur", "state": "Maharashtra"},
    {"name": "Solapur", "state": "Maharashtra"},
]


# =========================
# HELPERS
# =========================

def normalize(s: str):
    return (s or "").strip().lower()


def parse_date(date_str):

    if not date_str:
        return None

    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except:
            pass

    return None


# =========================
# DATA.GOV FETCH
# =========================

def fetch_records(commodity: str, limit: int = 500):

    if not DATA_GOV_API_KEY:
        return {"error": "DATA_GOV_API_KEY missing"}

    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "limit": limit,
        "filters[commodity]": commodity,
    }

    try:

        res = requests.get(url, params=params, timeout=20)

        if res.status_code != 200:
            return {
                "error": "Govt API error",
                "raw": res.text
            }

        return res.json()

    except Exception as e:

        return {
            "error": f"Request failed: {str(e)}"
        }


def clean_record(r):

    return {
        "market": r.get("market"),
        "district": r.get("districtname"),
        "state": r.get("statename"),
        "commodity": r.get("commodity"),
        "variety": r.get("variety"),
        "arrival_date": r.get("arrival_date"),

        "min_price": float(r.get("min_price", 0) or 0),
        "max_price": float(r.get("max_price", 0) or 0),
        "modal_price": float(r.get("modal_price", 0) or 0),

        "unit": "₹/Quintal",
    }


# =========================
# GEO HELPERS (Fallback OSM)
# =========================

@lru_cache(maxsize=128)
def geocode_mandi(mandi: str, state: str):

    queries = [
        f"{mandi} APMC {state} India",
        f"{mandi} mandi {state} India",
        f"{mandi} market {state} India",
        f"{mandi} {state} India",
        f"{mandi} India",
    ]

    url = "https://nominatim.openstreetmap.org/search"

    headers = {
        "User-Agent": "SmartAgriAI/1.0"
    }

    for q in queries:

        params = {
            "q": q,
            "format": "json",
            "limit": 1,
        }

        try:

            res = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10,
            )

            if res.status_code != 200:
                continue

            data = res.json()

            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])

        except:
            continue

    return None


# =========================
# DISTANCE HELPERS
# =========================

def haversine(lat1, lon1, lat2, lon2):

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(R * c, 2)


def get_osm_route(lat1, lon1, lat2, lon2):

    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"

    params = {
        "overview": "false",
        "steps": "false",
    }

    try:

        res = requests.get(url, params=params, timeout=15)

        if res.status_code != 200:
            return None

        data = res.json()

        if data.get("code") != "Ok":
            return None

        route = data["routes"][0]

        return {
            "distance_km": round(route["distance"] / 1000, 2),
            "duration_min": round(route["duration"] / 60, 1),
        }

    except:
        return None


# =========================
# APIs
# =========================


# ✅ LIVE MANDI RATES
@router.get("/rates")
def get_mandi_rates(
    commodity: str = Query(...),
    market: str = Query(...),
):

    data = fetch_records(commodity)

    if "error" in data:
        return data

    records = data.get("records", [])

    market_norm = normalize(market)

    filtered = [
        clean_record(r)
        for r in records
        if market_norm in normalize(r.get("market"))
    ]

    filtered.sort(
        key=lambda x: parse_date(x.get("arrival_date")) or datetime.min,
        reverse=True,
    )

    return {
        "commodity": commodity,
        "market": market,
        "count": len(filtered),
        "results": filtered[:15],
        "status": "OK",
    }


# ✅ BEST MANDI TODAY
@router.get("/best-mandi")
def best_mandi_today(
    commodity: str = Query(...),
):

    data = fetch_records(commodity, limit=700)

    if "error" in data:
        return data

    records = data.get("records", [])

    ranking = []

    for mandi in MANDI_LIST:

        mandi_name = mandi["name"]
        mandi_norm = normalize(mandi_name)

        mandi_records = [
            r for r in records
            if mandi_norm in normalize(r.get("market"))
        ]

        if not mandi_records:

            ranking.append({
                "mandi": mandi_name,
                "status": "No data",
                "arrival_date": None,
                "modal_price": None,
                "unit": "₹/Quintal",
            })

            continue

        mandi_records.sort(
            key=lambda r: parse_date(r.get("arrival_date")) or datetime.min,
            reverse=True,
        )

        latest = mandi_records[0]

        ranking.append({
            "mandi": mandi_name,
            "status": "OK",
            "arrival_date": latest.get("arrival_date"),
            "modal_price": float(latest.get("modal_price", 0) or 0),
            "unit": "₹/Quintal",
        })

    valid = [x for x in ranking if x["modal_price"] not in [None, 0]]

    if not valid:

        return {
            "commodity": commodity,
            "best_mandi": None,
            "ranking": ranking,
        }

    best = sorted(valid, key=lambda x: x["modal_price"], reverse=True)[0]

    return {
        "commodity": commodity,
        "best_mandi": best,
        "ranking": ranking,
        "status": "OK",
    }


# ✅ DISTANCE + ROUTE (FIXED)
@router.get("/distance")
def mandi_distance(
    lat: float = Query(...),
    lon: float = Query(...),
    mandi: str = Query(...),
    state: str = Query("Maharashtra"),
):

    mandi_name = mandi.strip()

    # ✅ Use verified DB first
    if mandi_name in MANDI_COORDS:

        mandi_lat, mandi_lon = MANDI_COORDS[mandi_name]

        provider = "Internal DB"

    # ✅ Fallback OSM
    else:

        coords = geocode_mandi(mandi, state)

        if not coords:
            raise HTTPException(404, "Mandi location not found")

        mandi_lat, mandi_lon = coords

        provider = "OSM"


    air = haversine(lat, lon, mandi_lat, mandi_lon)

    route = get_osm_route(lat, lon, mandi_lat, mandi_lon)

    if not route:
        raise HTTPException(500, "Routing service failed")


    return {
        "mandi": mandi,
        "state": state,

        "air_distance_km": air,
        "road_distance_km": route["distance_km"],
        "travel_time_min": route["duration_min"],

        "mandi_lat": mandi_lat,
        "mandi_lon": mandi_lon,
        "user_lat": lat,
        "user_lon": lon,

        "provider": provider,
        "status": "OK",
    }
