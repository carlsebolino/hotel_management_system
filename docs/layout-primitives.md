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
