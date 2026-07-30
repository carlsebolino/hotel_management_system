# Frontend layout primitives

The React frontend includes four small, reusable layout components in
`frontend/src/components/layouts.jsx`. They provide the responsive structure for
dashboard screens while leaving each screen in control of its content and
Tailwind styling.

Import the components you need from the module:

```jsx
import { Container, Grid, SidebarLayout, Stack } from "./components/layouts";
```

Each component accepts `children` and an optional `className`. `className` is
added to the component's outer element, so use it for additional Tailwind
utilities that are specific to a page. The primitives already provide their
base layout classes; avoid repeating those classes unless you intentionally
want to override them.

## `Container`

`Container` centers the page, limits its maximum width, and supplies responsive
horizontal padding. Use it once near the top of a screen.

| Prop        | Values                   | Default | Effect                                                                               |
| ----------- | ------------------------ | ------- | ------------------------------------------------------------------------------------ |
| `size`      | `md`, `lg`, `xl`, `full` | `xl`    | Selects a maximum width: `max-w-5xl`, `max-w-6xl`, `max-w-7xl`, or no maximum width. |
| `fluid`     | `true`, `false`          | `false` | Like Bootstrap's `.container-fluid`, spans the viewport while retaining gutters.     |
| `className` | Tailwind class string    | —       | Adds classes to the outer container.                                                 |

```jsx
<Container size="lg" className="py-8 sm:py-12">
  <h1 className="text-3xl font-bold">Projects</h1>
</Container>
```

Use `fluid` for full-width application shells, data-heavy screens, or bands that
should grow at every viewport size. The container still supplies responsive
horizontal padding, unlike an unstyled full-width element:

```jsx
<Container fluid>
  <Grid columns={4}>{/* Content can use all available width */}</Grid>
</Container>
```

## `Stack`

`Stack` arranges children vertically with a consistent gap. It is useful for a
page's main sections, a card's content, or a group of form fields.

| Prop        | Values                 | Default | Effect                                          |
| ----------- | ---------------------- | ------- | ----------------------------------------------- |
| `gap`       | `sm`, `md`, `lg`, `xl` | `md`    | Selects `gap-3`, `gap-5`, `gap-8`, or `gap-12`. |
| `className` | Tailwind class string  | —       | Adds classes to the outer flex column.          |

```jsx
<Stack gap="lg">
  <header>{/* Page title and actions */}</header>
  <section>{/* Main content */}</section>
</Stack>
```

## `Grid`

`Grid` creates a responsive grid for cards and dashboard summaries. It has a
base gap of `gap-4`, which increases to `gap-6` at the `md` breakpoint.

| Prop        | Values                | Default | Responsive columns                                                                                          |
| ----------- | --------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| `columns`   | `1`, `2`, `3`, `4`    | `1`     | `1`: one column; `2`: two columns at `md`; `3`: two at `md`, three at `xl`; `4`: two at `sm`, four at `xl`. |
| `className` | Tailwind class string | —       | Adds classes to the outer grid.                                                                             |

```jsx
<Grid columns={3}>
  <article className="rounded-2xl bg-white p-5 shadow-sm">Tasks</article>
  <article className="rounded-2xl bg-white p-5 shadow-sm">Progress</article>
  <article className="rounded-2xl bg-white p-5 shadow-sm">Requests</article>
</Grid>
```

## `SidebarLayout`

`SidebarLayout` places contextual navigation or filters beside the primary
content. On small screens it renders as one column, with the sidebar above the
main content. At the `lg` breakpoint it becomes a two-column grid with a
15.5rem sidebar. The sidebar becomes sticky at the top of the viewport on large
screens.

| Prop        | Required | Description                                                         |
| ----------- | -------- | ------------------------------------------------------------------- |
| `sidebar`   | Yes      | JSX rendered inside the layout's `<aside>` element.                 |
| `children`  | Yes      | Primary page content rendered inside the layout's `<main>` element. |
| `className` | No       | Adds classes to the outer grid.                                     |

```jsx
<SidebarLayout
  sidebar={
    <nav
      aria-label="Project filters"
      className="rounded-2xl bg-white p-4 shadow-sm"
    >
      {/* Filter controls or navigation links */}
    </nav>
  }
>
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    {/* Results */}
  </section>
</SidebarLayout>
```

## Building a dashboard page

Compose the primitives from the outside in: constrain the page with
`Container`, arrange sections with `Stack`, use `Grid` for related cards, and
use `SidebarLayout` when a screen has contextual navigation or controls.

```jsx
<Container>
  <Stack gap="lg">
    <header className="rounded-3xl bg-slate-900 p-8 text-white">
      Dashboard
    </header>

    <Grid columns={3}>
      <article className="rounded-2xl bg-white p-5 shadow-sm">Tasks</article>
      <article className="rounded-2xl bg-white p-5 shadow-sm">Progress</article>
      <article className="rounded-2xl bg-white p-5 shadow-sm">Requests</article>
    </Grid>

    <SidebarLayout sidebar={<nav aria-label="Dashboard sections">...</nav>}>
      <Stack>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          Main content
        </section>
      </Stack>
    </SidebarLayout>
  </Stack>
</Container>
```

The existing dashboard in `frontend/src/main.jsx` is a working reference that
uses all four primitives together.

## `cn` class-name helper

The primitives use `cn` from `frontend/src/lib/cn.js` to combine their base
classes with an optional `className`. It removes falsey values and joins the
remaining class strings with spaces:

```js
import { cn } from "./lib/cn";

const statusClass = cn(
  "rounded-full px-3 py-1",
  hasError && "bg-rose-50 text-rose-700",
);
```

Use `cn` when a component needs conditional Tailwind classes. Keep component
specific styling at the call site or in that component rather than expanding a
layout primitive with page-specific behavior.
