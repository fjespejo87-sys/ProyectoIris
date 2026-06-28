from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("/", response_model=List[schemas.PatientSummary])
def list_patients(
    residence: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_all_patients(db, residence=residence, status=status)


@router.get("/search", response_model=List[schemas.PatientSummary])
def search_patients(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    return crud.search_patients(db, q)


@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    p = crud.get_patient(db, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return p


@router.post("/", response_model=schemas.PatientOut, status_code=201)
def create_patient(data: schemas.PatientCreate, db: Session = Depends(get_db)):
    return crud.create_patient(db, data)


@router.put("/{patient_id}", response_model=schemas.PatientOut)
def update_patient(patient_id: int, data: schemas.PatientUpdate, db: Session = Depends(get_db)):
    p = crud.get_patient(db, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return crud.update_patient(db, p, data)


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    p = crud.get_patient(db, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    crud.delete_patient(db, p)


@router.post("/{patient_id}/notes", response_model=schemas.NoteOut, status_code=201)
def add_note(patient_id: int, data: schemas.NoteCreate, db: Session = Depends(get_db)):
    p = crud.get_patient(db, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return crud.add_note(db, patient_id, data.content)


@router.delete("/{patient_id}/notes/{note_id}", status_code=204)
def delete_note(patient_id: int, note_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_note(db, note_id, patient_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
