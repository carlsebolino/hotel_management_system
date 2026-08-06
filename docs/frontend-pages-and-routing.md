# Frontend pages and routing

The frontend uses React Router so each primary screen has a stable, bookmarkable URL. This keeps page-level behavior separate while preserving one shared application shell.

## Page directory and shared layout

Route-level components live in `frontend/src/pages/`. A page owns the content and state unique to its URL. `App.tsx` owns the persistent shell: the header, accessible primary navigation, page-content landmark, and route table. `main.tsx` only installs global CSS and mounts that application inside `BrowserRouter` and `React.StrictMode`.

Reusable UI belongs in `frontend/src/components/`; pages should compose those components rather than duplicate them. The existing `Container`, `Row`, `Col`, and `Stack` layout primitives remain available to every page.

## Routes, navigation, and URL design

The route table currently registers:

| URL      | Page           | Purpose                                   |
| -------- | -------------- | ----------------------------------------- |
| `/`      | `HomePage`     | Responsive grid demonstration             |
| `/users` | `UsersPage`    | Flask-backed users table                  |
| `/about` | `AboutPage`    | Project overview                          |
| `*`      | `NotFoundPage` | Friendly response for unknown client URLs |

Use short, lowercase, noun-based URLs. Add primary destinations to the navigation array in `App.tsx`; its `NavLink` elements provide normal link semantics and an active class for visual orientation. Use `Link` or `NavLink`, rather than an ordinary `<a>`, for internal navigation so the browser does not reload the application.

The wildcard route must remain last conceptually (React Router ranks routes) so an unknown URL renders a useful not-found page. It is a client route, not the server's API 404 response.

## Data fetching

Keep request lifecycle state in the page that needs it. For example, `UsersPage` owns its loading, success, and error states, starts `fetchUsers` when mounted, and aborts the request when unmounted. Shared request configuration and response types remain in `src/api/client.ts`. This prevents unrelated pages and the shared shell from rerendering around users-specific state.

## Add and register a page

1. Create `frontend/src/pages/ReportsPage.tsx` and export a `ReportsPage` component.
2. Import `ReportsPage` in `frontend/src/App.tsx`.
3. Add `<Route path="/reports" element={<ReportsPage />} />` to `Routes`.
4. If it is a primary destination, add `{ to: '/reports', label: 'Reports', end: false }` to the navigation array.
5. Add a routing check that renders `/reports` and asserts its unique heading; also verify the active navigation link if one was added.
6. Run `npm test`, `npm run lint`, and `npm run build` from `frontend/`.

## Production SPA fallback

Client-side routing still begins with an HTTP request. A production host must return the built `index.html` for unknown **non-API** paths, allowing React Router to render `/users`, `/about`, or the not-found page after a refresh. It must continue routing `/api/*` to Flask and must not replace API 404 responses with HTML.

This repository's Flask deployment host already implements that split in `register_frontend_routes`: real Vite assets are served from `frontend/dist`, unknown non-API paths fall back to `index.html`, and `/api/*` paths retain Flask's JSON behavior. Configure equivalent rewrite rules if the Vite build is deployed to a different static host or reverse proxy.
