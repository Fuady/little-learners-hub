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

# Serve Frontend (only in production or when dist exists)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

@app.get("/api/info")
async def root():
    """API info endpoint"""
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

# Mount frontend static files
if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")
    
    # Catch-all for SPA
    from fastapi.responses import FileResponse
    
    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        # Skip if it's an API route that somehow got here
        if rest_of_path.startswith("api/") or rest_of_path.startswith("docs") or rest_of_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
            
        index_file = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"detail": "Frontend not found"}
else:
    @app.get("/")
    async def root_dev():
        return {"message": "Backend is running. Frontend not found in /dist"}
