from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class NoteCreate(BaseModel):
    content: str


class NoteOut(BaseModel):
    id: int
    patient_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class RenewalHistoryOut(BaseModel):
    id: int
    field_name: str
    old_date: Optional[date]
    new_date: Optional[date]
    changed_at: datetime

    class Config:
        from_attributes = True


class PatientBase(BaseModel):
    name: str
    residence: str
    birth_date: Optional[date] = None
    health_card_number: Optional[str] = None
    health_card_renewal: Optional[date] = None

    opioids: bool = False
    opioids_renewal: Optional[date] = None

    benzodiazepines: bool = False
    benzodiazepines_renewal: Optional[date] = None

    analytic_type: Optional[str] = None
    analytic_last_date: Optional[date] = None
    analytic_next_date: Optional[date] = None

    cognitive_impairment: bool = False
    cognitive_degree: Optional[str] = None
    cognitive_type: Optional[str] = None

    status: str = "Activo"


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientOut(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    notes: List[NoteOut] = []
    renewal_history: List[RenewalHistoryOut] = []

    class Config:
        from_attributes = True


class PatientSummary(BaseModel):
    id: int
    name: str
    residence: str
    status: str
    health_card_renewal: Optional[date]
    opioids: bool
    opioids_renewal: Optional[date]
    benzodiazepines: bool
    benzodiazepines_renewal: Optional[date]
    analytic_type: Optional[str]
    analytic_next_date: Optional[date]
    cognitive_impairment: bool
    cognitive_degree: Optional[str]

    class Config:
        from_attributes = True


class AlertItem(BaseModel):
    patient_id: int
    patient_name: str
    residence: str
    field: str
    field_label: str
    date: Optional[date]
    days_left: int
    level: str  # "red" | "orange" | "green"
