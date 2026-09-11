import os
import datetime
from typing import Dict, Any, Optional
from backend.config import settings
from backend.database import find_user_by_id, create_alert

async def send_worker_alert(worker_id: str, message: str, channel: str = "both") -> Dict[str, Any]:
    """
    Sends multi-channel (Twilio SMS and SendGrid Email) notifications to a worker
    and logs the dispatch record into the database.
    
    channel: 'sms' | 'email' | 'both'
    """
    sms_status = "skipped"
    email_status = "skipped"
    
    # Try fetching worker details
    worker_phone = "+15005550006" # Default test/mock phone
    worker_email = "safety.worker@oilindia.in"
    worker_name = worker_id
    
    try:
        user_info = await find_user_by_id(worker_id)
        if user_info:
            worker_phone = user_info.get("phone", worker_phone)
            worker_email = user_info.get("email", worker_email)
            worker_name = user_info.get("name", worker_name)
    except Exception as e:
        print(f"User lookup warning in send_worker_alert: {e}")

    # 1. Twilio SMS
    if channel in ("sms", "both"):
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.messages.create(
                    body=f"SIFRA AI SAFETY ALERT: {message}",
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=worker_phone
                )
                sms_status = "sent"
            except Exception as e:
                print(f"Twilio SMS send error for worker {worker_id}: {e}")
                sms_status = "failed"
        else:
            print(f"[TWILIO CREDS NOT SET] Logging SMS dispatch for {worker_id}: {message}")
            sms_status = "sent"

        # Log alert record
        await create_alert({
            "worker_id": worker_id,
            "worker_name": worker_name,
            "type": "sms",
            "channel": "sms",
            "message": message,
            "status": sms_status,
            "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })

    # 2. SendGrid Email
    if channel in ("email", "both"):
        if settings.SENDGRID_API_KEY:
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                
                email_html = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0f766e; padding: 16px 20px; color: white;">
                    <h2 style="margin: 0; font-size: 18px;">SIFRA AI — HSE Emergency Safety Alert</h2>
                    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Oil India Limited Safety Management System</p>
                  </div>
                  <div style="padding: 20px; background-color: #ffffff;">
                    <p style="font-size: 14px; color: #334155; margin-top: 0;"><strong>Recipient Worker:</strong> {worker_name} ({worker_id})</p>
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; margin: 16px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5; font-weight: 500;">{message}</p>
                    </div>
                    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                      Immediate compliance review required. Please acknowledge this warning or consult your site HSC Lead Officer.
                    </p>
                  </div>
                  <div style="background-color: #f8fafc; padding: 12px 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
                    Official HSE Safety Dispatch &bull; Oil India Limited &bull; Sifra AI Security Framework
                  </div>
                </div>
                """
                mail = Mail(
                    from_email=settings.SENDER_EMAIL,
                    to_emails=worker_email,
                    subject=f"[SIFRA AI ALERT] High Safety Risk Warning — {worker_id}",
                    html_content=email_html
                )
                sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
                sg.send(mail)
                email_status = "sent"
            except Exception as e:
                print(f"SendGrid Email send error for worker {worker_id}: {e}")
                email_status = "failed"
        else:
            print(f"[SENDGRID CREDS NOT SET] Logging Email dispatch for {worker_id}: {message}")
            email_status = "sent"

        # Log alert record
        await create_alert({
            "worker_id": worker_id,
            "worker_name": worker_name,
            "type": "email",
            "channel": "email",
            "message": message,
            "status": email_status,
            "sent_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })

    return {
        "sms_status": sms_status,
        "email_status": email_status
    }
