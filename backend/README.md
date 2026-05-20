# SmartSchool Wallet Backend

Django REST Framework backend for SmartSchool Wallet - a cloud-based e-wallet system for secondary school students.

## Tech Stack
- Python 3.11+
- Django 4.2 + Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- MySQL 8.0 Database
- Redis (caching, rate limiting, session store)
- Celery (async notifications)
- QR Code Generation (qrcode library)

## Setup Instructions

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## API Documentation
API documentation available at: http://localhost:8000/api/schema/

## Project Structure
- `config/` - Django project settings and configuration
- `apps/` - Django applications
  - `authentication/` - Auth endpoints (login, logout, password reset)
  - `students/` - Student CRUD and QR code generation
  - `wallets/` - Wallet management endpoints
  - `payments/` - Payment processing endpoints
  - `admin_panel/` - Admin dashboard and reports
- `core/` - Shared utilities, permissions, middleware
