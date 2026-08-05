# React and TypeScript concepts used in this project

All frontend application code uses strict TypeScript. Define interfaces for component props and API payloads, use `import type` for type-only imports, and use `.tsx` only for files that render JSX. Run `npm run typecheck` after changing frontend types.

This guide explains the React concepts currently used by the frontend and
shows small examples based on the reference dashboard. It is a companion to the
[frontend layout primitives](layout-primitives.md) guide: read that guide when
you need to use `Container`, `Row`, `Col`, and `Stack` for responsive layouts.

The examples use TSX, the TypeScript syntax used by the files in `frontend/src/`. TSX lets
components describe the UI they render. TypeScript expressions appear inside
curly braces, and component names start with a capital letter.

## Application entry point and strict mode

`frontend/src/main.tsx` mounts the application with `createRoot`. The element
with the `root` ID is supplied by `frontend/index.html`.

```tsx
import React from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element was not found.");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`React.StrictMode` enables extra development-time checks. In development it may
run an Effect's setup, cleanup, and setup sequence again. Write Effects with a
cleanup function so this is safe; do not rely on an Effect running only once in
development.

## Function components and TSX

A function component is a typed function that returns TSX. Keep a
component focused on one UI responsibility and export it when another module
needs it. The dashboard's `App` component composes the page, while
`UsersTable` owns table rendering.

```tsx
export function WelcomePanel() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Welcome to the reference workspace
      </h2>
      <p className="mt-1 text-slate-500">
        Review upcoming work and open requests.
      </p>
    </section>
  );
}
```

Use `className`, rather than HTML's `class`, for CSS classes in TSX. TSX also
uses camel-cased DOM properties where applicable, such as `tabIndex`. Standard
ARIA attributes retain their hyphenated names, such as `aria-label` and
`aria-busy`.

## Props, `children`, and defaults

Props pass data from a parent to a component. Treat them as read-only. The
layout primitives accept `children`, which is the TSX nested between a
component's opening and closing tags, plus configuration props with defaults.

```tsx
import type { ReactNode } from "react";

const sectionTones = {
  slate: "bg-slate-50",
  sky: "bg-sky-50",
} as const;

interface SectionProps {
  children: ReactNode;
  title: string;
  tone?: keyof typeof sectionTones;
}

export function Section({ children, title, tone = "slate" }: SectionProps) {
  return (
    <section className={`rounded-2xl p-6 ${sectionTones[tone]}`}>
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Dashboard() {
  return (
    <Section title="Tasks" tone="sky">
      <p>24 items are scheduled today.</p>
    </Section>
  );
}
```

For Tailwind classes, prefer complete class names that Tailwind can detect.
When a class varies, choose from complete strings (as the dashboard does with
its `tone` values) instead of constructing utility names dynamically. For
example:

```tsx
const tones = {
  sky: "bg-sky-50 text-sky-700",
  rose: "bg-rose-50 text-rose-700",
};

function ConnectionStatus() {
  return <span className={tones.sky}>Connected</span>;
}
```

## Local state with `useState`

`useState` stores data that can change during a component's lifetime. It
returns the current value and a setter. Calling the setter asks React to render
again with the new value. The dashboard keeps its users, request status,
loading state, and API-error state independently.

```tsx
import { useState } from "react";

function RequestCount() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((current) => current + 1)}>
      Open requests: {count}
    </button>
  );
}
```

Use the functional setter form, `setCount((current) => current + 1)`, when the
next value depends on the previous value. Do not mutate arrays or objects held
in state; create a replacement instead.

```tsx
setUsers((currentUsers) => [...currentUsers, newUser]);
```

## Effects, API requests, and cleanup with `useEffect`

`useEffect` synchronizes a component with something outside React, such as the
Flask API. The dashboard has an Effect with an empty dependency array, so it
loads users when `App` mounts. It also creates an `AbortController` and aborts
the request during cleanup. This prevents an obsolete request from updating UI
after the component has unmounted.

```tsx
import { useEffect, useState } from "react";
import { fetchUsers } from "./api/client";
import type { User } from "./api/client";

function TeamDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers({ signal: controller.signal })
      .then(setUsers)
      .catch((requestError) => {
        if (
          requestError instanceof Error &&
          requestError.name !== "AbortError"
        ) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p role="alert">Could not load users.</p>;
  return <UsersTable users={users} />;
}
```

Include every reactive value referenced by an Effect in its dependency array,
unless it is stable by definition (for example, a module-level import). If an
Effect depends on a prop, list that prop so React reruns the Effect when it
changes.

The API module accepts the `signal` and forwards it to `fetch`, while keeping
HTTP and JSON error handling outside the UI components. Add future endpoint
functions there rather than scattering `fetch` calls through screens.

## Conditional rendering

React uses TypeScript expressions to decide what TSX to render. The dashboard
shows loading text until data is ready, then shows `UsersTable`; it also picks
a success or error status style based on `hasApiError`.

```tsx
<div aria-busy={isLoading}>
  {isLoading ? <p>Loading users...</p> : <UsersTable users={users} />}
</div>
```

For a simple optional element, use `&&`:

```tsx
function ApiNotice({ hasApiError }: { hasApiError: boolean }) {
  return <>{hasApiError && <p role="alert">The API is unavailable.</p>}</>;
}
```

Use a ternary when both outcomes should render. Make sure a value such as `0`
is not accidentally rendered by the left side of `&&`; compare it explicitly
when necessary (`count > 0 && ...`).

## Rendering lists and keys

Use `Array.prototype.map` to render repeated UI. Each sibling in the resulting
list needs a stable, unique `key` so React can correctly preserve or replace
the corresponding DOM element when the list changes. The user table uses the
unique email address, and the dashboard summary cards use their labels.

```tsx
interface Project {
  id: string;
  ownerName: string;
  itemId: string;
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>
          {project.ownerName} — item {project.itemId}
        </li>
      ))}
    </ul>
  );
}
```

Prefer a database ID or another persistent identifier. Avoid array indexes as
keys when items can be inserted, removed, reordered, or hold their own state.

## Events and accessible status

Pass a function to a React event prop such as `onClick`; do not call the
function while rendering. Use semantic HTML first, then add ARIA only when it
communicates information that HTML alone does not. The dashboard uses
`role="status"` for connection feedback and `aria-busy` while the table loads.

```tsx
interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
}

function RefreshButton({ onRefresh, isLoading }: RefreshButtonProps) {
  return (
    <button type="button" disabled={isLoading} onClick={onRefresh}>
      {isLoading ? "Refreshing…" : "Refresh users"}
    </button>
  );
}
```

`type="button"` prevents a button inside a future form from accidentally
submitting that form. Keep link destinations in `href`, use `<button>` for
actions, and give navigation an accessible label when its purpose is not
already clear.

## Where these concepts live

| Concept                                                               | Current project reference                |
| --------------------------------------------------------------------- | ---------------------------------------- |
| Root render, strict mode, state, Effect, conditional UI, mapped cards | `frontend/src/main.tsx`                  |
| Props, empty-state conditional UI, mapped table rows and keys         | `frontend/src/components/UsersTable.tsx` |
| Reusable components, `children`, defaults, `className` props          | `frontend/src/components/layouts.tsx`    |
| API wrapper and abort-signal forwarding                               | `frontend/src/api/client.ts`             |
| Conditional Tailwind class helper                                     | `frontend/src/lib/cn.ts`                 |

When adding a screen, begin with a function component, keep server I/O in the
API client, model the UI state explicitly, and compose the existing layout
primitives. Run the frontend checks before committing:

```bash
cd frontend
npm run format:check
npm run typecheck
npm run lint
npm run build
```
