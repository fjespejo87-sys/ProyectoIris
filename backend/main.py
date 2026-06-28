from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os
import pathlib

load_dotenv()

from database import engine, Base
import models
from routers import patients, alerts
from scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Iris - Gestión de Residencias", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes — deben registrarse ANTES del catch-all del frontend
app.include_router(patients.router)
app.include_router(alerts.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

scheduler = None

@app.on_event("startup")
def startup():
    global scheduler
    scheduler = start_scheduler()

@app.on_event("shutdown")
def shutdown():
    if scheduler:
        scheduler.shutdown()

# Servir el frontend en producción — catch-all al final
FRONTEND_BUILD = pathlib.Path(__file__).parent / "frontend_dist"
if FRONTEND_BUILD.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_BUILD / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(str(FRONTEND_BUILD / "index.html"))
