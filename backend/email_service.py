import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date
from typing import List
import schemas


GMAIL_USER = os.getenv("GMAIL_USER", "fjespejo87@gmail.com")
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL", "iris.martell.sspa@juntadeandalucia.es")


def build_html_email(alerts: List[schemas.AlertItem]) -> str:
    today_str = date.today().strftime("%d/%m/%Y")

    rows = ""
    for a in alerts:
        if a.level == "red":
            bg = "#fee2e2"
            badge = "🔴"
        else:
            bg = "#ffedd5"
            badge = "🟠"

        if a.days_left < 0:
            days_text = f"Caducada hace {abs(a.days_left)} días"
        elif a.days_left == 0:
            days_text = "Caduca HOY"
        else:
            days_text = f"{a.days_left} días"

        date_str = a.date.strftime("%d/%m/%Y") if a.date else "-"

        rows += f"""
        <tr style="background-color:{bg};">
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">{badge} {a.patient_name}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">{a.residence}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">{a.field_label}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">{date_str}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:bold;">{days_text}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px;">
        <div style="max-width:700px;margin:0 auto;background:white;border-radius:12px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="color:#1d4ed8;margin-bottom:5px;">🏥 Residencias Juan González & Monsalve</h1>
            <p style="color:#6b7280;margin-top:0;">Alerta de renovaciones — {today_str}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <h2 style="color:#dc2626;">⚠️ Renovaciones urgentes</h2>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#1d4ed8;color:white;">
                        <th style="padding:10px;text-align:left;">Paciente</th>
                        <th style="padding:10px;text-align:left;">Residencia</th>
                        <th style="padding:10px;text-align:left;">Qué renovar</th>
                        <th style="padding:10px;text-align:left;">Fecha</th>
                        <th style="padding:10px;text-align:left;">Tiempo</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <p style="color:#6b7280;font-size:13px;margin-top:30px;">
                Este email se genera automáticamente cada día a las 8:00.<br>
                Accede a la aplicación para ver todos los detalles.
            </p>
        </div>
    </body>
    </html>
    """
    return html


def send_alert_email(alerts: List[schemas.AlertItem]) -> bool:
    urgent = [a for a in alerts if a.level == "red"]
    if not urgent:
        return False  # nada urgente, no se envía

    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("Email no configurado: faltan GMAIL_USER o GMAIL_APP_PASSWORD en .env")
        return False

    html = build_html_email(urgent)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔴 Alerta Iris: {len(urgent)} renovación(es) urgente(s) — {date.today().strftime('%d/%m/%Y')}"
    msg["From"] = GMAIL_USER
    msg["To"] = RECIPIENT_EMAIL
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(GMAIL_USER, GMAIL_PASSWORD)
            smtp.sendmail(GMAIL_USER, RECIPIENT_EMAIL, msg.as_string())
        print(f"Email enviado a {RECIPIENT_EMAIL}: {len(urgent)} alertas urgentes")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False
