from sqlalchemy.orm import Session
from datetime import date
from dateutil.relativedelta import relativedelta
from typing import Optional, List
import models
import schemas


def calculate_analytic_next(analytic_type: Optional[str], last_date: Optional[date]) -> Optional[date]:
    if not last_date or not analytic_type:
        return None
    if analytic_type == "anual":
        return last_date + relativedelta(years=1)
    if analytic_type == "semestral":
        return last_date + relativedelta(months=6)
    return None  # fecha_fija: se pasa directamente en analytic_next_date


def track_renewal_changes(db: Session, patient: models.Patient, data: dict):
    date_fields = {
        "health_card_renewal": "Renovación tarjeta sanitaria",
        "opioids_renewal": "Renovación opioides",
        "benzodiazepines_renewal": "Renovación benzodiacepinas",
        "analytic_next_date": "Próxima analítica",
    }
    for field, label in date_fields.items():
        old_val = getattr(patient, field)
        new_val = data.get(field)
        if old_val != new_val and (old_val is not None or new_val is not None):
            history = models.RenewalHistory(
                patient_id=patient.id,
                field_name=label,
                old_date=old_val,
                new_date=new_val,
            )
            db.add(history)


def get_all_patients(db: Session, residence: Optional[str] = None, status: Optional[str] = None) -> List[models.Patient]:
    q = db.query(models.Patient)
    if residence:
        q = q.filter(models.Patient.residence == residence)
    if status:
        q = q.filter(models.Patient.status == status)
    return q.order_by(models.Patient.name).all()


def search_patients(db: Session, query: str) -> List[models.Patient]:
    q = db.query(models.Patient).filter(
        (models.Patient.name.ilike(f"%{query}%")) |
        (models.Patient.health_card_number.ilike(f"%{query}%"))
    )
    return q.order_by(models.Patient.name).all()


def get_patient(db: Session, patient_id: int) -> Optional[models.Patient]:
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()


def create_patient(db: Session, data: schemas.PatientCreate) -> models.Patient:
    patient_dict = data.model_dump()
    if patient_dict.get("analytic_type") != "fecha_fija":
        patient_dict["analytic_next_date"] = calculate_analytic_next(
            patient_dict.get("analytic_type"),
            patient_dict.get("analytic_last_date")
        )
    patient = models.Patient(**patient_dict)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update_patient(db: Session, patient: models.Patient, data: schemas.PatientUpdate) -> models.Patient:
    update_dict = data.model_dump()
    if update_dict.get("analytic_type") != "fecha_fija":
        update_dict["analytic_next_date"] = calculate_analytic_next(
            update_dict.get("analytic_type"),
            update_dict.get("analytic_last_date")
        )
    track_renewal_changes(db, patient, update_dict)
    for key, value in update_dict.items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient: models.Patient):
    db.delete(patient)
    db.commit()


def add_note(db: Session, patient_id: int, content: str) -> models.Note:
    note = models.Note(patient_id=patient_id, content=content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note_id: int, patient_id: int) -> bool:
    note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.patient_id == patient_id
    ).first()
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True


def compute_alerts(patients: List[models.Patient]) -> List[schemas.AlertItem]:
    from datetime import datetime
    today = date.today()
    alerts = []

    def days_left(d: Optional[date]) -> int:
        if d is None:
            return 9999
        return (d - today).days

    def level(days: int) -> str:
        if days <= 7:
            return "red"
        if days <= 14:
            return "orange"
        return "green"

    date_fields = [
        ("health_card_renewal", "Tarjeta sanitaria"),
        ("opioids_renewal", "Opioides"),
        ("benzodiazepines_renewal", "Benzodiacepinas"),
        ("analytic_next_date", "Analítica"),
    ]

    for p in patients:
        if p.status == "Fallecido":
            continue
        for field, label in date_fields:
            if field == "opioids_renewal" and not p.opioids:
                continue
            if field == "benzodiazepines_renewal" and not p.benzodiazepines:
                continue
            val = getattr(p, field)
            if val is None:
                continue
            d = days_left(val)
            if d <= 14:
                alerts.append(schemas.AlertItem(
                    patient_id=p.id,
                    patient_name=p.name,
                    residence=p.residence,
                    field=field,
                    field_label=label,
                    date=val,
                    days_left=d,
                    level=level(d),
                ))

    alerts.sort(key=lambda a: a.days_left)
    return alerts
