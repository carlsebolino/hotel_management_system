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

Available API endpoints:

- `GET /api/health`
- `GET /api/users`
- `POST /api/auth/login`

The backend allows browser requests from `CORS_ORIGINS`, a comma-separated environment variable that defaults to `http://localhost:5173` for local Vite development.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` to point the Vite app at a different Flask API URL. If `VITE_API_BASE_URL` is not set, the frontend uses `/api`, which supports production deployments that route the React app and Flask API through the same origin.

## Verification

```bash
python -m unittest discover -s tests
python -m compileall app main.py config.py tests
cd frontend && npm run build
```
