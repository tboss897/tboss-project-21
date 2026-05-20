from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
import requests


@shared_task
def send_daily_spending_reports():
    """Send daily spending reports to parents."""
    # TODO: Implement daily spending report generation and email sending
    pass


@shared_task
def send_fcm_notification(device_token, title, body, data=None):
    """Send FCM push notification to a device."""
    if not settings.FIREBASE_SERVER_KEY:
        return
    
    url = 'https://fcm.googleapis.com/fcm/send'
    headers = {
        'Authorization': f'key={settings.FIREBASE_SERVER_KEY}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'to': device_token,
        'notification': {
            'title': title,
            'body': body,
        },
    }
    
    if data:
        payload['data'] = data
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
    except Exception as e:
        print(f"FCM notification failed: {e}")
        return None


@shared_task
def send_sms(phone_number, message):
    """Send SMS using Africa's Talking."""
    if not settings.AFRICASTALKING_USERNAME or not settings.AFRICASTALKING_API_KEY:
        return
    
    url = 'https://api.africastalking.com/version1/messaging'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    
    data = {
        'username': settings.AFRICASTALKING_USERNAME,
        'to': phone_number,
        'message': message,
        'from': settings.AFRICASTALKING_SENDER_ID,
    }
    
    try:
        response = requests.post(url, data=data, headers=headers)
        return response.json()
    except Exception as e:
        print(f"SMS sending failed: {e}")
        return None


@shared_task
def send_email(subject, message, recipient_list):
    """Send email using SendGrid."""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False


@shared_task
def notify_payment(parent_email, parent_phone, student_name, amount):
    """Notify parent about a payment made by their child."""
    # Send email
    send_email.delay(
        subject='Payment Notification',
        message=f'Your child {student_name} has made a payment of ₦{amount}.',
        recipient_list=[parent_email],
    )
    
    # Send SMS
    send_sms.delay(
        phone_number=parent_phone,
        message=f'Your child {student_name} has made a payment of ₦{amount}.',
    )
    
    # Send FCM notification if device token exists
    # TODO: Get parent's FCM device token and send notification
