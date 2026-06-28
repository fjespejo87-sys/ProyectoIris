from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import pathlib

load_dotenv()

from database import engine, Base
import models
from auth import verify_token
from routers import patients, alerts, auth
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

# Ruta pública: login (sin autenticación)
app.include_router(auth.router)

# Rutas protegidas: requieren token válido
app.include_router(patients.router, dependencies=[Depends(verify_token)])
app.include_router(alerts.router, dependencies=[Depends(verify_token)])

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
