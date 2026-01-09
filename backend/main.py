"""
KidLearn API - FastAPI Backend
Educational platform for kids from Kindergarten to Grade 5
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import auth, materials, stats, users

app = FastAPI(
    title="KidLearn Education Platform API",
    description="""
    API for the KidLearn education platform. This platform provides educational materials
    for children from Kindergarten to Grade 5, including worksheets, activity books,
    drawing pages, puzzles, and interactive games.
    
    ## Features
    - **Authentication**: Parents and educators can register and login
    - **Materials**: Browse, search, and filter educational materials
    - **Submissions**: Educators can submit new materials
    - **Interactions**: Download, print, and like materials
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENV") != "production" else [],
    allow_origin_regex="http://localhost:.*|http://127.0.0.1:.*|http://192.168.18..*:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(materials.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")

# Static files for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "materials"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "KidLearn API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
