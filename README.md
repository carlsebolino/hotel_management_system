# Reference Application

The application is split into independent backend and frontend layers:

- `app/` contains the Flask backend. Flask exposes JSON APIs only and no longer renders the primary web UI.
- `frontend/` contains the React + Vite client. The client talks to Flask through `VITE_API_BASE_URL`.

## New developer onboarding

Start with the junior-friendly documentation in [`docs/README.md`](docs/README.md).
It includes the local setup, a first-run checklist, architecture and request-flow
illustrations, common development patterns, and a guide for making a change safely.

## Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app main run
```

In Windows PowerShell, use the equivalent setup commands:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
flask --app main run
```

Available API endpoints are versioned for use by other applications:

- `GET /api/v1/health`
- `GET /api/v1/users`
- `POST /api/v1/auth/login`

The legacy `/api/*` paths remain registered for local compatibility, but new consumers should use `/api/v1/*`.

The backend allows browser requests from `CORS_ORIGINS`, a comma-separated environment variable that defaults to `http://localhost:5173` for local Vite development.

## Frontend

The frontend is written in strict TypeScript and TSX. Vite compiles the application, while `npm run typecheck` runs the TypeScript compiler without emitting files. New frontend source files should use `.ts` or `.tsx` extensions.

```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` to point the Vite app at a different Flask API URL. If `VITE_API_BASE_URL` is not set, the frontend uses `/api/v1`, which supports production deployments that route the React app and Flask API through the same origin.

The client uses React Router for `/`, `/users`, and `/about`. Add pages and
navigation in `frontend/src/App.tsx`; see the [frontend pages and routing
guide](docs/frontend-pages-and-routing.md). Production hosts must serve Vite's
`index.html` for unknown non-API URLs while preserving Flask routing for
`/api/*`, so bookmarked routes and browser refreshes work.

## Development tooling and code formatting

The repository includes shared formatter and linter configuration so the same checks can run on a colleague's laptop, in an editor, or in CI.

### One-time setup

```bash
make install-dev
```

This installs Python runtime and development dependencies from `requirements-dev.txt`, then installs frontend dependencies from `frontend/package.json`.

On Windows, use the checked-in PowerShell task runner instead of installing
Make:

```powershell
.\scripts\dev.ps1 install-dev
```

The task runner supports `install-dev`, `format`, `format-check`, `lint`,
`test`, `build`, and `verify`; substitute any of those names in the command
above. If PowerShell blocks local scripts, run the command once with
`powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 install-dev`, or
follow your organization's execution-policy guidance.

On systems without Make or PowerShell, run the equivalent commands manually:

```bash
python -m pip install -r requirements-dev.txt
cd frontend
npm install
```

### Formatting and linting commands

```bash
make format
```

Windows PowerShell: `./scripts/dev.ps1 format`

Formats Python with Ruff/Black and frontend files with Prettier.

```bash
make format-check
```

Windows PowerShell: `./scripts/dev.ps1 format-check`

Checks formatting without modifying files.

```bash
make lint
```

Windows PowerShell: `./scripts/dev.ps1 lint`

Runs Ruff for the Flask code and ESLint for the React code.

```bash
make verify
```

Windows PowerShell equivalent:

```powershell
.\scripts\dev.ps1 verify
```

Runs formatting checks, linting, backend tests, and the frontend production build. Use this before opening a pull request.

The formatting rules live in `pyproject.toml`, `frontend/.prettierrc.json`, and `.editorconfig`; frontend TypeScript settings live in `frontend/tsconfig.json`, and linting rules live in `frontend/eslint.config.js`.

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
make verify

# Or run the core checks directly:
python -m unittest discover -s tests
python -m compileall app main.py config.py tests
cd frontend && npm run build
```

In Windows PowerShell, use `./scripts/dev.ps1 verify`, or run the core checks
individually with `python -m unittest discover -s tests`,
`python -m compileall app main.py config.py tests`, and
`Set-Location frontend; npm run build`.

## Production readiness

- Set `FLASK_ENV=production`, `SECRET_KEY`, `DATABASE_URL`, and explicit `CORS_ORIGINS` values before deployment.
- Production config rejects missing `SECRET_KEY` and wildcard CORS origins.
- Common security headers are applied to API responses, and HTTPS deployments emit HSTS.
- Cross-origin access is centralized in `app/security/cors.py`; business logic lives in `app/services/` so Flask routes stay thin and reusable.
