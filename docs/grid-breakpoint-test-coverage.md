# Grid and breakpoint test coverage

The responsive grid contract is covered at two complementary levels. This
separation is intentional: component tests verify the React-to-CSS-variable
API, while stylesheet tests verify what those variables do in the cascade.

## Run the tests

The grid tests are frontend unit tests. They do not require the Flask API, a
database, the Vite development server, or a browser. Run every command in this
section from the `frontend/` directory:

```bash
cd frontend
```

### One-time setup

Use Node.js 20.19 or newer, then install the frontend dependencies:

```bash
node --version
npm install
```

### Run both grid suites

This is the primary command to use before submitting a grid or breakpoint
change:

```bash
npm test -- src/components/layouts.test.tsx src/styles.test.ts
```

Vitest runs once and exits. A successful run reports both test files as passed.
The files cover different halves of the contract, so run both even when a
change appears limited to React or CSS.

### Run one layer only

Run the React-to-CSS-variable component contract while editing
`components/layouts.tsx`:

```bash
npm test -- src/components/layouts.test.tsx
```

Run breakpoint boundaries, grid formulas, and cascade rules while editing
`styles.css`:

```bash
npm test -- src/styles.test.ts
```

To keep either suite running during development, invoke Vitest without the
package script's `run` mode:

```bash
npx vitest src/components/layouts.test.tsx src/styles.test.ts
```

Press `q` to leave watch mode.

### Run a focused test by name

Vitest's `-t` option is useful when diagnosing one contract. For example:

```bash
npm test -- src/styles.test.ts -t "responsive grid CSS contract"
npm test -- src/components/layouts.test.tsx -t "responsive row gap"
```

The name is a regular-expression match, so it can be shortened to any unique
part of the relevant `describe` or `it` title.

### Run the supporting checks

After the targeted suites pass, validate the complete frontend:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

The first command catches interactions with the rest of the application. The
remaining commands catch invalid responsive prop types, test/code lint issues,
and formatting drift.

### Understand failures

- A failure in `components/layouts.test.tsx` usually means a public responsive
  prop was mapped to the wrong custom property, a scalar stopped targeting the
  small breakpoint, or consumer attributes/styles were lost.
- A failure in `styles.test.ts` usually means a token, breakpoint threshold,
  fallback chain, span formula, or winning cascade declaration changed.
- The stylesheet tests intentionally check immediately below and exactly at
  `768px`, `1024px`, and `1440px`. A boundary failure should be fixed in the
  production rule rather than by weakening or shifting the assertion.
- If Vitest cannot resolve a package, verify the Node version, remove
  `frontend/node_modules`, and run `npm install` again before rerunning the
  targeted command.

## Coverage matrix

| Contract                   | Component test                                        | Stylesheet test                                                 |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Fixed and fluid containers | Class composition and HTML attributes                 | Width, centering, maximum width, padding, and fluid override    |
| Row gutters                | Scalar and all responsive prop mappings               | Base gutter plus `sm` → `md` → `lg` → `xl` fallback chain       |
| Column spans               | Scalar and sparse responsive prop mappings            | Span formula, activation boundary, and pre-boundary inactivity  |
| Column ordering            | Scalar and sparse responsive prop mappings            | Effective fallback chain on both sides of every breakpoint      |
| Breakpoint thresholds      | Variable suffix mapping                               | `767/768`, `1023/1024`, and `1439/1440` boundary pairs          |
| Supported media queries    | Not applicable                                        | Rejects grid rules outside `768px`, `1024px`, and `1440px`      |
| Consumer integration       | Classes, inline-style merging, attributes, and events | Low-specificity selectors and cascade/layer regression fixtures |

The stylesheet suite parses the production CSS with PostCSS instead of merely
searching source text. Its cascade inspector accounts for media-query
eligibility, selector specificity, source order, `!important`, and cascade
layers. This makes boundary assertions sensitive to the declaration that would
actually win, and dedicated regression fixtures protect the inspector itself
from becoming a source of false confidence.

The component suite checks all four public breakpoint names (`small`,
`medium`, `large`, and `extraLarge`) and their `sm`, `md`, `lg`, and `xl` CSS
variable suffixes. Sparse objects are covered explicitly because the CSS
fallback chain, rather than React, must carry a value into later breakpoints.

## Deliberate limits

These tests are contract tests, not visual-browser tests. JSDOM does not perform
layout, and the PostCSS suite validates formulas rather than measuring rendered
column geometry. A browser-level test would still be appropriate if the grid
gains rules that depend on intrinsic sizing, writing modes, zoom, sub-pixel
rounding, or browser-specific flex behavior. For the current token-and-formula
implementation, the deterministic suites cover the change-prone boundaries
without duplicating browser engine behavior.

When adding a breakpoint, update the public responsive keys and suffixes, the
CSS media queries and fallback chains, the boundary table in the stylesheet
suite, and this coverage matrix together.
