from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Models ---
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class BookingInput(BaseModel):
    turf_id: str
    date: str
    time_slot: str
    duration: int = 1

class TurfCreate(BaseModel):
    name: str
    location: str
    city: str
    sport_types: List[str]
    description: str
    amenities: List[str]
    price_per_hour: float
    rating: float = 4.0
    image_url: str
    open_time: str = "06:00"
    close_time: str = "23:00"

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    email = input.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(input.password)
    user_doc = {
        "email": email,
        "name": input.name,
        "password_hash": hashed,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"_id": user_id, "email": email, "name": input.name, "role": "user"}

@api_router.post("/auth/login")
async def login(input: LoginInput, response: Response, request: Request):
    email = input.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("locked_until")
        if lockout_until and datetime.now(timezone.utc).isoformat() < lockout_until:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Clear attempts on success
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"_id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# --- Turf Routes ---
@api_router.get("/turfs")
async def list_turfs(sport: Optional[str] = None, city: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if sport:
        query["sport_types"] = {"$in": [sport.lower()]}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}}
        ]
    turfs = await db.turfs.find(query, {"_id": 0}).to_list(100)
    return turfs

@api_router.get("/turfs/{turf_id}")
async def get_turf(turf_id: str):
    turf = await db.turfs.find_one({"id": turf_id}, {"_id": 0})
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    return turf

@api_router.get("/turfs/{turf_id}/slots")
async def get_available_slots(turf_id: str, date: str):
    turf = await db.turfs.find_one({"id": turf_id}, {"_id": 0})
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    open_h = int(turf.get("open_time", "06:00").split(":")[0])
    close_h = int(turf.get("close_time", "23:00").split(":")[0])
    all_slots = [f"{h:02d}:00" for h in range(open_h, close_h)]
    booked = await db.bookings.find(
        {"turf_id": turf_id, "date": date, "status": "confirmed"},
        {"_id": 0, "time_slot": 1}
    ).to_list(100)
    booked_slots = set(b["time_slot"] for b in booked)
    slots = []
    for s in all_slots:
        slots.append({"time": s, "available": s not in booked_slots})
    return {"turf_id": turf_id, "date": date, "slots": slots, "price_per_hour": turf.get("price_per_hour", 0)}

# --- Booking Routes ---
@api_router.post("/bookings")
async def create_booking(input: BookingInput, request: Request):
    user = await get_current_user(request)
    turf = await db.turfs.find_one({"id": input.turf_id}, {"_id": 0})
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    # Check slot availability
    existing = await db.bookings.find_one({
        "turf_id": input.turf_id, "date": input.date,
        "time_slot": input.time_slot, "status": "confirmed"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    booking = {
        "id": str(uuid.uuid4()),
        "turf_id": input.turf_id,
        "turf_name": turf.get("name", ""),
        "turf_location": turf.get("location", ""),
        "user_id": user["_id"],
        "user_email": user["email"],
        "user_name": user.get("name", ""),
        "date": input.date,
        "time_slot": input.time_slot,
        "duration": input.duration,
        "total_price": turf.get("price_per_hour", 0) * input.duration,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking)
    booking.pop("_id", None)
    return booking

@api_router.get("/bookings/my")
async def get_my_bookings(request: Request):
    user = await get_current_user(request)
    bookings = await db.bookings.find(
        {"user_id": user["_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return bookings

@api_router.patch("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, request: Request):
    user = await get_current_user(request)
    booking = await db.bookings.find_one({"id": booking_id, "user_id": user["_id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "cancelled"}})
    return {"message": "Booking cancelled"}

# --- Seed Data ---
SEED_TURFS = [
    {
        "id": "turf-001",
        "name": "Champions Arena",
        "location": "MG Road, Sector 14",
        "city": "Mumbai",
        "sport_types": ["football", "cricket"],
        "description": "Premium floodlit turf with FIFA-approved synthetic grass. Perfect for 5-a-side and 7-a-side football matches.",
        "amenities": ["Floodlights", "Changing Rooms", "Parking", "Drinking Water", "First Aid"],
        "price_per_hour": 1500,
        "rating": 4.8,
        "image_url": "https://images.unsplash.com/photo-1759210720456-c9814f721479?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHR1cmYlMjBuaWdodHxlbnwwfHx8fDE3NzYwNjEwOTZ8MA&ixlib=rb-4.1.0&q=85",
        "open_time": "06:00",
        "close_time": "23:00"
    },
    {
        "id": "turf-002",
        "name": "Striker's Ground",
        "location": "Andheri West, Link Road",
        "city": "Mumbai",
        "sport_types": ["football"],
        "description": "State-of-the-art 7-a-side football turf with professional-grade surface and ambient lighting for night games.",
        "amenities": ["Floodlights", "Restrooms", "Parking", "Spectator Seating"],
        "price_per_hour": 1200,
        "rating": 4.5,
        "image_url": "https://images.unsplash.com/photo-1543503430-9bb747e6b206?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwzfHxwZW9wbGUlMjBwbGF5aW5nJTIwZm9vdGJhbGwlMjB0dXJmfGVufDB8fHx8MTc3NjA2MTA5Nnww&ixlib=rb-4.1.0&q=85",
        "open_time": "06:00",
        "close_time": "22:00"
    },
    {
        "id": "turf-003",
        "name": "Green Valley Sports",
        "location": "Koramangala, 5th Block",
        "city": "Bangalore",
        "sport_types": ["football", "cricket", "tennis"],
        "description": "Multi-sport facility featuring top-notch playing surfaces for football, cricket nets, and tennis courts.",
        "amenities": ["Floodlights", "Changing Rooms", "Cafeteria", "Parking", "Equipment Rental"],
        "price_per_hour": 1800,
        "rating": 4.9,
        "image_url": "https://images.unsplash.com/photo-1689574528928-bc796b75e8ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxwZW9wbGUlMjBwbGF5aW5nJTIwZm9vdGJhbGwlMjB0dXJmfGVufDB8fHx8MTc3NjA2MTA5Nnww&ixlib=rb-4.1.0&q=85",
        "open_time": "05:00",
        "close_time": "23:00"
    },
    {
        "id": "turf-004",
        "name": "Power Play Arena",
        "location": "HSR Layout, 27th Main",
        "city": "Bangalore",
        "sport_types": ["cricket", "badminton"],
        "description": "Indoor and outdoor courts for cricket practice and badminton. Professional coaching available on weekends.",
        "amenities": ["Indoor Courts", "Floodlights", "Parking", "Pro Shop", "Coaching"],
        "price_per_hour": 1000,
        "rating": 4.3,
        "image_url": "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&auto=format&fit=crop",
        "open_time": "06:00",
        "close_time": "22:00"
    },
    {
        "id": "turf-005",
        "name": "Elite Sports Hub",
        "location": "Connaught Place, Block A",
        "city": "Delhi",
        "sport_types": ["football", "tennis"],
        "description": "Premium urban sports facility in the heart of Delhi. Features world-class football turf and hard-court tennis.",
        "amenities": ["Floodlights", "Changing Rooms", "Locker Room", "Cafeteria", "Parking"],
        "price_per_hour": 2000,
        "rating": 4.7,
        "image_url": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop",
        "open_time": "06:00",
        "close_time": "23:00"
    },
    {
        "id": "turf-006",
        "name": "Thunder Pitch",
        "location": "Bandra West, Hill Road",
        "city": "Mumbai",
        "sport_types": ["football"],
        "description": "Compact 5-a-side turf perfect for quick weekend matches. Known for its energetic atmosphere and competitive games.",
        "amenities": ["Floodlights", "Drinking Water", "Parking"],
        "price_per_hour": 800,
        "rating": 4.1,
        "image_url": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop",
        "open_time": "07:00",
        "close_time": "22:00"
    }
]

async def seed_turfs():
    count = await db.turfs.count_documents({})
    if count == 0:
        await db.turfs.insert_many(SEED_TURFS)
        logger.info(f"Seeded {len(SEED_TURFS)} turfs")

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.turfs.create_index("id", unique=True)
    await db.bookings.create_index("turf_id")
    await db.bookings.create_index("user_id")
    await seed_admin()
    await seed_turfs()
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {os.environ.get('ADMIN_EMAIL', 'admin@example.com')}\n- Password: {os.environ.get('ADMIN_PASSWORD', 'admin123')}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n\n")
        f.write("## Turf Endpoints\n- GET /api/turfs\n- GET /api/turfs/{id}\n- GET /api/turfs/{id}/slots?date=YYYY-MM-DD\n\n")
        f.write("## Booking Endpoints\n- POST /api/bookings\n- GET /api/bookings/my\n- PATCH /api/bookings/{id}/cancel\n")

@app.on_event("shutdown")
async def shutdown():
    client.close()

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
