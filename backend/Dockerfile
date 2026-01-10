FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY . /app/backend/

# Install dependencies directly
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir \
    "fastapi>=0.109.0" \
    "uvicorn[standard]>=0.27.0" \
    "pydantic[email]>=2.5.0" \
    "email-validator>=2.0.0" \
    "python-jose[cryptography]>=3.3.0" \
    "passlib[bcrypt]>=1.7.4" \
    "python-multipart>=0.0.6" \
    "sqlalchemy[asyncio]>=2.0.0" \
    "alembic>=1.13.0" \
    "aiosqlite>=0.19.0" \
    "asyncpg>=0.29.0" \
    "greenlet>=3.0.0" \
    "cryptography>=41.0.0"

# Expose port
EXPOSE 8000

# Command to run the application
# We run from /app so 'backend.main:app' works
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
