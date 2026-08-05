# Frontend layout primitive

The React frontend intentionally keeps one layout primitive: `Stack` in
`frontend/src/components/layouts.tsx`. It mirrors the referenced design-system
shape by accepting standard `div` events plus responsive layout, spacing,
sizing, and positioning props.

```tsx
import { Stack } from "./components/layouts";
```

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

### Events

Because `Stack` extends `HTMLAttributes<HTMLDivElement>`, it supports standard
React events such as `onClick`, `onFocus`, `onBlur`, and `onKeyDown`.

### Layout props

| Prop          | Type                                      | Description                                                        |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `direction`   | `Responsive<CSS flex-direction>`          | Sets the Stack axis while preserving the Stack styling rules.      |
| `flex`        | `Responsive<string \| number \| boolean>` | Specifies how the element grows or shrinks to fit available space. |
| `flexWrap`    | `Responsive<CSS flex-wrap>`               | Controls whether Stack children wrap onto additional lines.        |
| `gap`         | `Responsive<number \| string>`            | Sets spacing between Stack children.                               |
| `flexGrow`    | `Responsive<number>`                      | Specifies how much the item grows relative to siblings.            |
| `flexShrink`  | `Responsive<number>`                      | Specifies how much the item shrinks relative to siblings.          |
| `flexBasis`   | `Responsive<number \| string>`            | Specifies the initial length of a flexible item.                   |
| `alignSelf`   | `Responsive<CSS alignment>`               | Overrides the parent alignment for this item.                      |
| `justifySelf` | `Responsive<CSS alignment>`               | Overrides the parent justification for this item.                  |
| `order`       | `Responsive<number>`                      | Specifies the item order relative to siblings.                     |

### Spacing, sizing, and positioning props

| Group       | Props                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Spacing     | `margin`, `marginBlock`, `marginInline`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft` |
| Sizing      | `width`, `minWidth`                                                                               |
| Positioning | `position`, `top`, `right`, `bottom`, `left`                                                      |

## Demo grid system

The demo page in `frontend/src/main.tsx` follows the attached breakpoint table:

| Size        | Breakpoints     | Gutter | Margins  | Columns |
| ----------- | --------------- | ------ | -------- | ------- |
| Small       | `320px–767px`   | `16px` | `16px`   | `4`     |
| Medium      | `768px–1023px`  | `16px` | `24px`   | `8`     |
| Large       | `1024px–1439px` | `16px` | `32px`   | `12`    |
| Extra large | `1440px and up` | `16px` | Flexible | `12`    |
