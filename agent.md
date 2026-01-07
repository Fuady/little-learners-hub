# Agent Instructions

## Backend Development

For backend development, use `uv` for dependency management.

### Useful Commands

```bash
# Sync dependencies from lockfile
uv sync

# Add a new package
uv add <PACKAGE-NAME>

# Run Python files
uv run python <PYTHON-FILE>

# Run the FastAPI development server
uv run uvicorn backend.main:app --reload

# Run tests
uv run pytest backend/tests/ -v
```

### Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── models.py         # Pydantic models
├── database.py       # Mock database
├── routers/
│   ├── auth.py       # Authentication endpoints
│   ├── materials.py  # Materials endpoints
│   └── stats.py      # Statistics endpoints
└── tests/
    └── test_api.py   # API tests
```

### Running the Backend

1. Install dependencies: `uv sync`
2. Start the server: `uv run uvicorn backend.main:app --reload`
3. Access API docs: http://localhost:8000/docs

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
