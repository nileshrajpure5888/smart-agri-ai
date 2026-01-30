import os
from twilio.rest import Client

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")  # whatsapp:+14155238886
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_whatsapp(to_number: str, message: str):
    return client.messages.create(
        body=message,
        from_=TWILIO_WHATSAPP_FROM,
        to=f"whatsapp:{to_number}"
    )
