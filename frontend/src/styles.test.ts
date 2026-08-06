import { describe, expect, it } from 'vitest';

import stylesheet from './styles.css?raw';

function blockStartingWith(source: string, marker: string) {
  const markerIndex = source.indexOf(marker);
  expect(markerIndex, `Expected to find ${marker}`).toBeGreaterThanOrEqual(0);

  const openingBrace = source.indexOf('{', markerIndex);
  expect(openingBrace, `Expected ${marker} to open a block`).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  throw new Error(`Expected ${marker} to close its block`);
}

function compact(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

describe('responsive grid contract', () => {
  it('keeps the shared gutter, column counts, margins, and container cap', () => {
    const root = compact(blockStartingWith(stylesheet, ':root'));

    expect(root).toContain('--layout-gutter: 16px;');
    expect(root).toContain('--layout-columns-sm: 4;');
    expect(root).toContain('--layout-columns-md: 8;');
    expect(root).toContain('--layout-columns-lg: 12;');
    expect(root).toContain('--layout-columns-xl: 12;');
    expect(root).toContain('--layout-margin-sm: 16px;');
    expect(root).toContain('--layout-margin-md: 24px;');
    expect(root).toContain('--layout-margin-lg: 32px;');
    expect(root).toContain('--layout-container-max: 1440px;');
  });

  it.each([
    {
      breakpoint: '768px',
      columns: 'var(--layout-columns-md)',
      margin: 'var(--layout-margin-md)',
      span: '--col-span-md',
    },
    {
      breakpoint: '1024px',
      columns: 'var(--layout-columns-lg)',
      margin: 'var(--layout-margin-lg)',
      span: '--col-span-lg',
    },
  ])(
    'activates the expected columns and outer margin at $breakpoint',
    ({ breakpoint, columns, margin, span }) => {
      const mediaRule = compact(blockStartingWith(stylesheet, `@media (min-width: ${breakpoint})`));

      expect(mediaRule).toContain(
        `:where(.layout-container, .layout-row) { --layout-columns: ${columns}; }`,
      );
      expect(mediaRule).toContain(
        `:where(.layout-container) { padding-inline: ${margin}; }`,
      );
      expect(mediaRule).toContain(`:where(.layout-col[style*='${span}'])`);
    },
  );

  it('uses the four-column, 16px-margin grid below the medium breakpoint', () => {
    const containerRule = compact(blockStartingWith(stylesheet, ':where(.layout-container)'));
    const rowRule = compact(blockStartingWith(stylesheet, ':where(.layout-row)'));

    expect(containerRule).toContain('--layout-columns: var(--layout-columns-sm);');
    expect(containerRule).toContain('padding-inline: var(--layout-margin-sm);');
    expect(rowRule).toContain('--layout-columns: var(--layout-columns-sm);');
    expect(rowRule).toContain('--row-gap-sm: var(--layout-gutter);');
  });

  it('keeps 12 columns and flexible outer margins at the 1440px container cap', () => {
    const containerRule = compact(blockStartingWith(stylesheet, ':where(.layout-container)'));
    const mediaRule = compact(blockStartingWith(stylesheet, '@media (min-width: 1440px)'));

    expect(containerRule).toContain('margin-inline: auto;');
    expect(containerRule).toContain('max-inline-size: var(--layout-container-max);');
    expect(mediaRule).toContain(
      ':where(.layout-container, .layout-row) { --layout-columns: var(--layout-columns-xl); }',
    );
    expect(mediaRule).toContain(":where(.layout-col[style*='--col-span-xl'])");
    expect(mediaRule).not.toContain('padding-inline:');
  });
});
