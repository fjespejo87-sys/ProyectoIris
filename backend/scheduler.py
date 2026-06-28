from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import crud
import email_service
from database import SessionLocal


def daily_email_job():
    db = SessionLocal()
    try:
        patients = crud.get_all_patients(db)
        alerts = crud.compute_alerts(patients)
        email_service.send_alert_email(alerts)
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler(timezone="Europe/Madrid")
    scheduler.add_job(
        daily_email_job,
        trigger=CronTrigger(hour=8, minute=0),
        id="daily_alerts",
        replace_existing=True,
    )
    scheduler.start()
    print("Scheduler iniciado: email diario a las 08:00 (Europe/Madrid)")
    return scheduler
