from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/", response_model=List[schemas.AlertItem])
def get_alerts(db: Session = Depends(get_db)):
    patients = crud.get_all_patients(db)
    return crud.compute_alerts(patients)


@router.get("/count")
def get_alert_count(db: Session = Depends(get_db)):
    patients = crud.get_all_patients(db)
    alerts = crud.compute_alerts(patients)
    urgent = [a for a in alerts if a.level == "red"]
    return {"total": len(alerts), "urgent": len(urgent)}
