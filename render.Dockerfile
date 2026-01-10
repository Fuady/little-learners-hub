# Build Stage for Frontend
FROM node:20-alpine as frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Set VITE_API_URL to an empty string or /api/v1 to use relative paths
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Final Stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY ./backend /app/backend

# Copy built frontend from build stage
COPY --from=frontend-build /app/dist /app/dist

# Install Python dependencies
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

# Expose port (Render uses PORT env var, typically 10000, but we can default to 8000)
ENV PORT=8000
EXPOSE 8000

# Volume for uploads (though Render disk is better for this)
RUN mkdir -p /app/backend/uploads/materials

# Use a shell script to run migrations and start the app
CMD sh -c "alembic -c backend/alembic.ini upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
