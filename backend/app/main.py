"""
FastAPI main application entry point
Dynamic Endurance Training Platform - Backend API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import athletes, coaches, workouts, calendar, integrations, pairs
from app.core.config import settings

app = FastAPI(
    title="Dynamic Endurance Training Platform API",
    description="Backend API for dynamic workout scaling based on VDOT and FTP",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(athletes.router, prefix="/api/athletes", tags=["athletes"])
app.include_router(coaches.router, prefix="/api/coaches", tags=["coaches"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])
app.include_router(pairs.router, prefix="/api/pairs", tags=["pairs"])


@app.get("/")
async def root():
    return {
        "message": "Dynamic Endurance Training Platform API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
