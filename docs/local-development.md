# Local development setup

This guide gets a new checkout running on a local machine. Run commands from the
repository root unless a command says otherwise.

## 1. Install prerequisites

| Tool | Required version | Why it is needed |
| --- | --- | --- |
| Python | 3.11 or newer | Runs Flask, migrations, and backend tests. |
| Node.js | 20.19 or newer | Runs Vite, React, ESLint, and the frontend build. |
| npm | Bundled with Node.js | Installs frontend packages and runs frontend scripts. |
| Git | Current supported version | Clones the repository and records changes. |
| Make | Optional on macOS/Linux | Provides shortcut commands such as `make verify`. Windows uses the included PowerShell runner instead. |

Check the tools that are already installed:

**macOS/Linux (bash):**

```bash
python --version
node --version
npm --version
git --version
```

**Windows (PowerShell):**

```powershell
python --version
node --version
npm --version
git --version
```

If `python` is not found but `python3` is, substitute `python3` in the macOS/Linux commands below. On Windows, install Python from python.org or the Microsoft Store and ensure the `python` command is available. If PowerShell reports that script execution is disabled when activating the environment, run `Set-ExecutionPolicy -Scope Process Bypass` for the current window, subject to your organization's policy.

## 2. Create the Python environment

A virtual environment keeps this project's Python packages separate from the
rest of your computer.

**macOS/Linux (bash):**

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

You should activate `.venv` in every new terminal before running Python, Flask,
Make, or PowerShell task-runner commands for this repository.

## 3. Create local configuration files

The repository provides safe templates. Copy them; do not commit the resulting
`.env` files because they are ignored and may contain secrets.

**macOS/Linux (bash):**

```bash
cp .env.sample .env
cp frontend/.env.example frontend/.env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.sample .env
Copy-Item frontend/.env.example frontend/.env
```

For the standard local setup, update `frontend/.env` to exactly this value:

```dotenv
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

Why port 5001? The checked-in Flask CLI settings and frontend environment
template use port 5001. The Vite proxy retains port 5000 for compatibility, so
explicitly setting the frontend variable to port 5001 avoids sending browser
requests to the wrong server.

Important backend values in `.env`:

| Variable | Local value | Purpose |
| --- | --- | --- |
| `FLASK_ENV` | `development` | Selects the development configuration. |
| `SECRET_KEY` | Any private local value | Signs Flask session data. Do not reuse the sample value in production. |
| `DATABASE_URL` | `sqlite:///app.db` | Uses a SQLite database file in the repository root. |
| `CORS_ORIGINS` | `http://localhost:5173` | Allows the Vite browser origin to call the API. |

`VITE_` variables are embedded in the frontend when Vite starts. Stop and start
`npm run dev` after changing `frontend/.env`.

## 4. Install frontend packages

```bash
cd frontend
npm install
cd ..
```

In Windows PowerShell, use `Set-Location frontend`, run `npm install`, then
return with `Set-Location ..`.

`npm install` creates `frontend/node_modules/`, which is local build tooling and
is intentionally not committed. This installs Tailwind and the Vite Tailwind
plugin locally; production builds compile the utility classes into the generated
CSS and do not load Tailwind from a CDN.

## 5. Prepare the database

Migrations describe the database schema as version-controlled Python files.
Apply all available migrations before working with persistent models:

```bash
flask --app main db upgrade
```

The initial migration creates `users` and `posts` tables. The current Users API
returns demo data rather than querying this database, so an empty users table is
normal on a fresh checkout.

## 6. Run the application

Use two terminals.

```text
Terminal 1                         Terminal 2
----------                         ----------
Flask API                          React + Vite
http://localhost:5001              http://localhost:5173
```

In terminal 1, activate `.venv` and start Flask:

```bash
source .venv/bin/activate
flask --app main run --port 5001
```

In Windows PowerShell, replace the activation command with
`.\.venv\Scripts\Activate.ps1`; the Flask command is unchanged.

In terminal 2, start Vite:

```bash
cd frontend
npm run dev
```

Visit the URL that Vite prints, normally `http://localhost:5173`. To verify the
API independently, open `http://localhost:5001/api/v1/health` or run:

```bash
curl http://localhost:5001/api/v1/health
```

In Windows PowerShell, use:

```powershell
Invoke-RestMethod http://localhost:5001/api/v1/health
```

Expected response:

```json
{"status":"ok","service":"hotel-management-api","apiVersion":"v1"}
```

## 7. Run checks before sharing work

The single command that matches the repository's full verification workflow is:

**macOS/Linux (bash):**

```bash
make verify
```

It checks formatting, linting, backend tests, and a production frontend build.
Run individual commands while iterating:

```bash
make format          # Update formatting in Python and frontend files.
make format-check    # Report formatting differences without modifying files.
make lint            # Run Ruff and ESLint.
make test            # Run the backend unittest suite.
make build           # Build the Vite application.
```

**Windows (PowerShell):**

```powershell
.\scripts\dev.ps1 verify
.\scripts\dev.ps1 format
.\scripts\dev.ps1 format-check
.\scripts\dev.ps1 lint
.\scripts\dev.ps1 test
.\scripts\dev.ps1 build
```

The PowerShell runner mirrors the Make targets and sets the frontend working
directory automatically. Without either tool, use the equivalent commands
described in the root README.

## Troubleshooting

### The browser says the API request failed

1. Confirm Flask is running on port 5001 by opening `/api/v1/health`.
2. Confirm `frontend/.env` contains the port-5001 API URL shown above.
3. Restart Vite after changing its environment file.
4. Confirm `.env` has `CORS_ORIGINS=http://localhost:5173` when the Vite URL is
   the default one.

### Flask cannot find the application

Use the explicit command `flask --app main run --port 5001`. Also confirm your
virtual environment is active and dependencies are installed.

### Database schema errors occur

Run `flask --app main db upgrade`. If you intentionally need to reset only your
local SQLite data, stop Flask, delete the ignored `app.db` file (`Remove-Item
app.db` in PowerShell), and run the migration command again. This deletes local data.

### A port is already in use

Choose another port, then keep all three places aligned: the Flask command,
`VITE_API_BASE_URL`, and `CORS_ORIGINS`. For example, if Flask uses `5002`, set
the frontend API URL to `http://localhost:5002/api/v1`.
