# Frontend layout primitives

The React frontend exposes a small Bootstrap-like layout system in
`frontend/src/components/layouts.tsx`:

- `Container` centers page content and applies responsive page margins.
- `Row` creates a wrapping column group with the design-system gutter.
- `Col` spans the active column grid with responsive column counts.
- `Stack` remains the low-level one-dimensional flex primitive.

```tsx
import { Col, Container, Row, Stack } from "./components/layouts";
```

## Breakpoint and grid rules

The CSS tokens in `frontend/src/styles.css` follow the attached screen-size
rules and can be changed in one place:

| Size        | Breakpoints     | Gutter | Margins  | Columns |
| ----------- | --------------- | ------ | -------- | ------- |
| Small       | `320px–767px`   | `16px` | `16px`   | `4`     |
| Medium      | `768px–1023px`  | `16px` | `24px`   | `8`     |
| Large       | `1024px–1439px` | `16px` | `32px`   | `12`    |
| Extra large | `1440px and up` | `16px` | Flexible | `12`    |

At extra-large widths, the container retains its `1440px` maximum inline size
and remains centered. Its outer whitespace therefore grows with the viewport,
providing the specified flexible margin while the grid keeps 12 columns and a
16px gutter. The container's 32px inline padding also preserves the large-grid
minimum margin at the 1440px boundary.

## Bootstrap-style usage

```tsx
<Container>
  <Row>
    <Col span={{ small: 4, medium: 4, large: 6 }}>
      <Stack gap="16px">Primary content</Stack>
    </Col>
    <Col span={{ small: 4, medium: 4, large: 6 }}>
      <Stack gap="16px">Secondary content</Stack>
    </Col>
  </Row>
</Container>
```

A scalar `span={1}` means one active column at every breakpoint. A responsive
object can target `small`, `medium`, `large`, and `extraLarge` while the CSS
internally maps those keys to compact `sm`, `md`, `lg`, and `xl` variables.

## Fitting text inside responsive columns

The demo grid in `frontend/src/main.tsx` renders each numbered cell as a `Col`
containing a `Stack` with the `.demo-column` class. The important detail is that
text sizing is based on the column card itself, not on the viewport:

```tsx
<Row className="grid-demo">
  <Col span={1}>
    <Stack className="demo-column">
      <span>Column</span>
      <strong>1</strong>
      <small>SM / 4</small>
    </Stack>
  </Col>
</Row>
```

```css
.demo-column {
  container-type: inline-size;
  min-width: 0;
  overflow: hidden;
  padding: clamp(0.5rem, 8cqi, 1rem);
}

.demo-column span,
.demo-column small {
  font-size: clamp(0.52rem, 10cqi, 0.72rem);
  max-inline-size: 100%;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.demo-column strong {
  font-size: clamp(1.75rem, 45cqi, 5rem);
  max-inline-size: 100%;
  overflow-wrap: anywhere;
}
```

How to read that implementation:

1. `container-type: inline-size` turns each `.demo-column` into a query
   container whose inline width can drive descendants and its own styles.
2. `cqi` means "1% of the query container's inline size." For example,
   `10cqi` is 10% of the current column card width.
3. `clamp(min, preferred, max)` keeps typography within safe bounds: the text
   shrinks in narrow one-column cards, grows in wider cards, and never becomes
   unreadably tiny or excessively large.
4. `min-width: 0`, `max-inline-size: 100%`, `overflow-wrap: anywhere`, and
   `text-wrap: balance` prevent long labels from forcing the column wider than
   the grid cell.
5. The `@supports not (font-size: 1cqi)` block in `styles.css` keeps a
   viewport-based fallback for browsers without container query unit support.

Use this pattern when content needs to fit the space assigned by `Col`. Use
regular viewport units such as `vw` when the text should scale with the whole
page instead of with an individual card.

## `Stack`

`Stack` renders a `div` with a column flex direction by default. Responsive prop
values can be provided as a single value or as an object keyed by `small`,
`medium`, `large`, and `extraLarge`.

```tsx
<Stack
  direction="row"
  flexWrap="wrap"
  gap="16px"
  marginInline={{ small: 16, medium: 24, large: 32, extraLarge: "auto" }}
  position="sticky"
  top="16px"
  onClick={() => console.log("Stack clicked")}
>
  Content
</Stack>
```

Because these helpers extend `HTMLAttributes<HTMLDivElement>`, they support
standard React events such as `onClick`, `onFocus`, `onBlur`, and `onKeyDown`.
