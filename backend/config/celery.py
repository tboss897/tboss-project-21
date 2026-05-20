import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('smartschool_wallet')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'check-expired-tokens-every-hour': {
        'task': 'authentication.tasks.cleanup_expired_tokens',
        'schedule': crontab(minute=0),  # Every hour
    },
    'send-daily-spending-reports': {
        'task': 'notifications.tasks.send_daily_spending_reports',
        'schedule': crontab(hour=18, minute=0),  # 6 PM daily
    },
}
