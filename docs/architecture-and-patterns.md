# Architecture and development patterns

This guide explains how the project is organized and how a request moves through
it. Read it before adding a feature so your change follows the existing shape.

## Repository map

```text
hotel_management_system/
|
|-- frontend/                 React user interface built by Vite
|   |-- src/main.jsx           Application entry point and page-level state
|   |-- src/api/client.js      Shared HTTP client for Flask API calls
|   `-- src/components/        Reusable presentational React components
|
|-- app/                      Flask application package
|   |-- api/v1/                Versioned HTTP routes and blueprint
|   |-- services/              Reusable business logic and validation
|   |-- models.py              SQLAlchemy database models
|   |-- security/              CORS and response-security header setup
|   |-- errors/                JSON error responses
|   `-- extensions.py          Shared SQLAlchemy and migration objects
|
|-- migrations/               Alembic schema history
|-- tests/                    Backend API tests
|-- config.py                 Environment-aware Flask configuration
`-- main.py                   Flask entry point and shell helpers
```

## Request and data flow

When the Users screen first appears, this is the path a request takes:

```text
1. React renders App in frontend/src/main.jsx
2. useEffect calls fetchUsers()
3. frontend/src/api/client.js sends GET /users to VITE_API_BASE_URL
4. Flask matches GET /api/v1/users in app/api/v1/routes.py
5. The route calls services.users.list_users()
6. The service returns data for the route to serialize as JSON
7. Flask adds CORS and security headers to the response
8. The API client returns payload.users
9. React stores the users in state and UsersTable renders the rows

React component -> API client -> Flask route -> service -> data source
      ^                                                       |
      |--------------------- JSON response -------------------|
```

The demo `list_users()` service currently returns an in-memory tuple, not a
database query. Models and migrations are already present for persistent data,
so a future feature can replace or extend that service with SQLAlchemy queries
without making route handlers responsible for database details.

## Backend patterns

### Application factory and configuration

`app.create_app()` constructs the Flask application. It chooses a configuration
class based on `FLASK_ENV`, initializes extensions, registers security behavior,
and registers blueprints. Tests use `create_app("testing")`, which gives them an
in-memory SQLite database and testing settings.

Keep startup work in the factory or dedicated initialization functions. Avoid
creating a second Flask application inside a route or service.

### Versioned, thin routes

New HTTP endpoints belong in `app/api/v1/routes.py`. The `api_v1` blueprint adds
the `/api/v1` prefix. The same blueprint is also registered at `/api` for legacy
local compatibility, but new frontend and external consumers should use `/api/v1`.

Routes should do HTTP-specific work only:

- read request data;
- call a service;
- return JSON and the appropriate status code.

For example, the login route parses JSON, asks a service to validate it, and
returns either a validation response or a success response. It does not contain
the validation rules itself.

### Services own business rules

Put reusable application behavior in `app/services/`. A service must not depend
on React or browser behavior. It can be called from a Flask route, a command,
or a test.

The login service illustrates a small two-step pattern:

```text
incoming JSON
    |
    v
parse_login_payload()  ->  LoginRequest (clean, typed input)
    |
    v
validate_login_request()  ->  error dictionary or {}
```

When adding a feature, prefer a similar progression: parse external input,
validate it, perform the business/database operation, then serialize a public
response. Do not return password hashes or other internal fields in API JSON.

### Database models and migrations

SQLAlchemy models live in `app/models.py`. Define a model change there first,
then generate a migration and inspect the generated file before applying it:

```bash
flask --app main db migrate -m "describe the schema change"
flask --app main db upgrade
```

Commit both the model update and the new file under `migrations/versions/`. A
migration is the shared record that lets every environment reach the same schema.
Never edit an already-shared migration to change a deployed schema; create a new
migration instead.

### Errors and security happen centrally

Unhandled exceptions and HTTP errors become JSON in `app/errors/handlers.py`.
The error handler rolls back the database session after unexpected failures, so
a failed database transaction does not remain active for the next request.

Every response receives baseline security headers. API responses also receive
CORS headers only for configured origins. Do not add ad hoc CORS headers in an
individual route. Change the centralized configuration or security modules when
the policy itself must change.

## Frontend patterns

### Page state in the entry component

`frontend/src/main.jsx` owns the Users screen's loading state, data state, and
error status. It starts data loading in `useEffect` and aborts the request if the
component is removed. This prevents a stale request from updating a component
that no longer exists.

### One shared API boundary

Use `frontend/src/api/client.js` for backend requests. It adds JSON headers,
parses JSON, and converts non-success responses into JavaScript errors. Add a
small exported function such as `fetchReservations()` rather than calling
`fetch()` directly from a component. This gives the application one place to
handle API URL and error behavior consistently.

### Presentational components receive props

Components in `frontend/src/components/` should focus on displaying values they
receive. `UsersTable` accepts `users` as a prop and handles its empty state. It
does not fetch data itself. This makes components easier to read and reuse.

## Adding a small feature: practical checklist

For a new API-backed screen, work from the inside out:

1. Decide the request and response contract. Write down the URL, method, JSON
   fields, success code, and validation failures.
2. Add or update a service in `app/services/`. Add database model work and a
   migration only if persistent storage is needed.
3. Add a thin versioned route in `app/api/v1/routes.py` that calls the service.
4. Add backend tests in `tests/` for success, invalid input, and relevant errors.
5. Add an API-client function in `frontend/src/api/client.js`.
6. Add page state in `main.jsx` or a new component, then pass data to a
   presentational component.
7. Run `make format` and `make verify`.

## API conventions currently in use

| Concern | Convention |
| --- | --- |
| New API prefix | `/api/v1` |
| Health check | `GET /api/v1/health` |
| Successful collection response | An object containing a named array, such as `{ "users": [...] }` |
| Invalid login | `400` with `message` and field-level `errors` |
| HTTP error | JSON with `error`, `message`, and `status` |
| Browser API URL | `VITE_API_BASE_URL`, defaulting to `/api/v1` when not set |

## Quality rules

- Python is formatted by Ruff and Black with an 88-character line length.
- JavaScript and JSX are formatted by Prettier; ESLint checks frontend code.
- Backend tests use the standard-library `unittest` runner.
- Do not commit `.env`, `frontend/.env`, `.venv`, `frontend/node_modules`,
  frontend build output, or the local `app.db` database.
- Run `make verify` before opening a pull request.
