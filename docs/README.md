# Developer onboarding guide

Welcome to the Hotel Management System. This guide is written for a developer
who is new to the project, Flask, React, or the split frontend/backend setup.
It explains what to install, how to run the application, and where to look when
you need to make a change.

## What you are building

The repository contains one product with two applications:

```text
Browser
  |
  |  React user interface
  v
frontend/  (Vite development server, normally http://localhost:5173)
  |
  |  JSON over HTTP
  v
app/       (Flask API, normally http://localhost:5001)
  |
  v
SQLite during local development, or another database configured by DATABASE_URL
```

The frontend renders the screen and asks for data. The backend owns API routes,
validation, business logic, security headers, and database access. Keeping those
responsibilities separate makes it possible to change either layer without
turning the other into a collection of special cases.

## Read these guides in order

1. [Local development setup](local-development.md) — install dependencies, set
   environment variables, run both servers, and verify your first checkout.
2. [Architecture and development patterns](architecture-and-patterns.md) — learn
   the directory layout, request/data flow, API conventions, database workflow,
   and the recommended way to make a change.
3. [Frontend layout primitives](layout-primitives.md) — compose responsive
   dashboard pages with `Container`, `Stack`, `Grid`, and `SidebarLayout`.
4. [React concepts used in this project](react-concepts.md) — understand the
   components, props, state, Effects, lists, conditional rendering, events, and
   accessibility patterns in the current frontend.
5. [Private npm packages and Azure App Service deployment](azure-artifacts-app-service-deployment.md)
   — configure Azure Artifacts, build the frontend, and deploy an App Service slot.

## Quick start

If you already have Python 3.11+ and Node.js 20.19+ installed, the shortest
path is:

**macOS/Linux (bash):**

```bash
# From the repository root
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt

cp .env.sample .env
cp frontend/.env.example frontend/.env
# Edit frontend/.env and set VITE_API_BASE_URL=http://localhost:5001/api/v1

cd frontend && npm install && cd ..
flask --app main db upgrade
```

**Windows (PowerShell):**

```powershell
# From the repository root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt

Copy-Item .env.sample .env
Copy-Item frontend/.env.example frontend/.env
# Edit frontend/.env and set VITE_API_BASE_URL=http://localhost:5001/api/v1

Push-Location frontend; npm install; Pop-Location
flask --app main db upgrade
```

Then use two terminals:

**macOS/Linux (bash):**

```bash
# Terminal 1: repository root, with .venv activated
flask --app main run --port 5001

# Terminal 2
cd frontend
npm run dev
```

**Windows (PowerShell):** Start `flask --app main run --port 5001` in one
PowerShell window after activating `.venv`; in a second window run
`Set-Location frontend` followed by `npm run dev`.

Open the address printed by Vite, usually `http://localhost:5173`. The users
table should display three demo users and report that it is connected to the
Flask API.

For explanations of every step, including Windows commands and troubleshooting,
continue with [Local development setup](local-development.md).
