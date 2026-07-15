# Hotel Management System

The application is split into independent backend and frontend layers:

- `app/` contains the Flask backend. Flask exposes JSON APIs only and no longer renders the primary web UI.
- `frontend/` contains the React + Vite client. The client talks to Flask through `VITE_API_BASE_URL`.

## Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app main run
```

Available API endpoints are versioned for use by other applications:

- `GET /api/v1/health`
- `GET /api/v1/users`
- `POST /api/v1/auth/login`

The legacy `/api/*` paths remain registered for local compatibility, but new consumers should use `/api/v1/*`.

The backend allows browser requests from `CORS_ORIGINS`, a comma-separated environment variable that defaults to `http://localhost:5173` for local Vite development.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` to point the Vite app at a different Flask API URL. If `VITE_API_BASE_URL` is not set, the frontend uses `/api/v1`, which supports production deployments that route the React app and Flask API through the same origin.

## Flask CLI and database migrations

### Flask-Migrate

Use the Flask-Migrate commands below to manage schema changes:

```bash
flask db init
```

Initializes the migration repository for the app.

```bash
flask db migrate -m "users table"
```

Generates a migration script for model changes. This command does not apply the generated changes to the database.

```bash
flask db upgrade
```

Applies migrations in forward order. The default target is `head`, which is the most recent migration. When using database servers such as MySQL or PostgreSQL, create the database on the server before running this command.

```bash
flask db downgrade base
```

Applies migrations in reverse order down to the initial empty database state. Downgrading and then upgrading can recreate tables, but migration operations generally do not preserve data removed by downgrade steps.

If you prefer explicit database table names, set `__tablename__` on each SQLAlchemy model class.

### Flask shell

Use the Flask shell to start a Python interpreter inside the application context:

```bash
flask shell
```

The shell command is useful for inspecting models, database state, and app configuration while developing.

### Running the development server

Use the default project settings:

```bash
flask run
```

This repository includes a `.flaskenv` file, which `python-dotenv` loads automatically for Flask CLI commands. It sets `FLASK_APP=main`, enables debug mode, and runs the development server on port `5001`.

If Windows shows `An attempt was made to access a socket in a way forbidden by its access permissions`, the default Flask port (`5000`) is usually unavailable, reserved, or blocked by local networking/security software. Run on another port instead:

```bash
flask --app main run --port 5001
```

## Verification

```bash
python -m unittest discover -s tests
python -m compileall app main.py config.py tests
cd frontend && npm run build
```

## Production readiness

- Set `FLASK_ENV=production`, `SECRET_KEY`, `DATABASE_URL`, and explicit `CORS_ORIGINS` values before deployment.
- Production config rejects missing `SECRET_KEY` and wildcard CORS origins.
- Common security headers are applied to API responses, and HTTPS deployments emit HSTS.
- Cross-origin access is centralized in `app/security/cors.py`; business logic lives in `app/services/` so Flask routes stay thin and reusable.
