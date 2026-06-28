from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    residence = Column(String, nullable=False)  # "Juan González" | "Monsalve"
    birth_date = Column(Date, nullable=True)
    health_card_number = Column(String, nullable=True)
    health_card_renewal = Column(Date, nullable=True)

    opioids = Column(Boolean, default=False)
    opioids_renewal = Column(Date, nullable=True)

    benzodiazepines = Column(Boolean, default=False)
    benzodiazepines_renewal = Column(Date, nullable=True)

    analytic_type = Column(String, nullable=True)   # anual | semestral | fecha_fija
    analytic_last_date = Column(Date, nullable=True)
    analytic_next_date = Column(Date, nullable=True)  # calculada o manual

    cognitive_impairment = Column(Boolean, default=False)
    cognitive_degree = Column(String, nullable=True)  # leve | moderado | severo
    cognitive_type = Column(String, nullable=True)    # Alzheimer, demencia, etc.

    status = Column(String, default="Activo")  # Activo | Baja temporal | Fallecido

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    notes = relationship(
        "Note", back_populates="patient",
        cascade="all, delete-orphan",
        order_by="Note.created_at.desc()"
    )
    renewal_history = relationship(
        "RenewalHistory", back_populates="patient",
        cascade="all, delete-orphan"
    )


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="notes")


class RenewalHistory(Base):
    __tablename__ = "renewal_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    field_name = Column(String, nullable=False)
    old_date = Column(Date, nullable=True)
    new_date = Column(Date, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="renewal_history")
