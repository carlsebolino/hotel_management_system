import { describe, expect, it } from 'vitest';

import stylesheet from './styles.css?raw';

type CssBlock = { prelude: string; body: string };

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function activeCss(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function immediateBlocks(source: string): CssBlock[] {
  const css = activeCss(source);
  const blocks: CssBlock[] = [];
  let statementStart = 0;

  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === ';') {
      statementStart = index + 1;
      continue;
    }
    if (css[index] !== '{') continue;

    const openingBrace = index;
    let depth = 1;
    while (depth > 0 && ++index < css.length) {
      if (css[index] === '{') depth += 1;
      if (css[index] === '}') depth -= 1;
    }
    if (depth !== 0) throw new Error('Expected CSS block to close');

    blocks.push({
      prelude: normalize(css.slice(statementStart, openingBrace)),
      body: css.slice(openingBrace + 1, index),
    });
    statementStart = index + 1;
  }

  return blocks;
}

function blocksWithPrelude(source: string, prelude: string): string[] {
  const expected = normalize(prelude);
  const matches: string[] = [];

  for (const block of immediateBlocks(source)) {
    if (block.prelude === expected) matches.push(block.body);
    if (block.prelude.startsWith('@') && !block.prelude.startsWith('@media')) {
      matches.push(...blocksWithPrelude(block.body, expected));
    }
  }

  return matches;
}

function requiredBlocks(source: string, prelude: string) {
  const blocks = blocksWithPrelude(source, prelude);
  expect(blocks, `Expected to find active rule ${prelude}`).not.toHaveLength(0);
  return blocks;
}

function baseCss(source: string): string {
  return immediateBlocks(source)
    .flatMap((block) => {
      if (block.prelude.startsWith('@media')) return [];
      if (block.prelude.startsWith('@')) return [baseCss(block.body)];
      return [`${block.prelude} { ${block.body} }`];
    })
    .join('\n');
}

function lastDeclaration(source: string, selector: string, property: string) {
  const declarations = requiredBlocks(source, selector).flatMap((block) =>
    Array.from(block.matchAll(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'g')), (match) =>
      match[1].trim(),
    ),
  );

  expect(declarations, `Expected ${selector} to declare ${property}`).not.toHaveLength(0);
  return declarations.at(-1);
}

function expectSpanSizing(source: string, span: string) {
  const selector = `:where(.layout-col[style*='${span}'])`;
  expect(lastDeclaration(source, selector, 'flex')).toContain(`var(${span})`);
  expect(lastDeclaration(source, selector, 'max-inline-size')).toContain(`var(${span})`);
}

describe('CSS rule inspection', () => {
  it('matches complete rule preludes and ignores comments', () => {
    const css = `
      /* @media (min-width: 768px) { .example {} } */
      @media (min-width: 768px) and (orientation: landscape) { .example {} }
    `;
    expect(blocksWithPrelude(css, '@media (min-width: 768px)')).toEqual([]);
  });

  it('uses the final repeated declaration, including within one rule', () => {
    const css = '.example { color: green; } .example { color: blue; color: red; }';
    expect(lastDeclaration(css, '.example', 'color')).toBe('red');
  });

  it('includes unconditional rules that follow media queries in base CSS', () => {
    const css = '@media (min-width: 1px) { .example { color: red; } } .example { color: green; }';
    expect(lastDeclaration(baseCss(css), '.example', 'color')).toBe('green');
  });
});

describe('responsive grid contract', () => {
  it('keeps the shared gutter, column counts, margins, and container cap', () => {
    expect(lastDeclaration(stylesheet, ':root', '--layout-gutter')).toBe('16px');
    expect(lastDeclaration(stylesheet, ':root', '--layout-columns-sm')).toBe('4');
    expect(lastDeclaration(stylesheet, ':root', '--layout-columns-md')).toBe('8');
    expect(lastDeclaration(stylesheet, ':root', '--layout-columns-lg')).toBe('12');
    expect(lastDeclaration(stylesheet, ':root', '--layout-columns-xl')).toBe('12');
    expect(lastDeclaration(stylesheet, ':root', '--layout-margin-sm')).toBe('16px');
    expect(lastDeclaration(stylesheet, ':root', '--layout-margin-md')).toBe('24px');
    expect(lastDeclaration(stylesheet, ':root', '--layout-margin-lg')).toBe('32px');
    expect(lastDeclaration(stylesheet, ':root', '--layout-container-max')).toBe('1440px');
  });

  it.each([
    ['768px', 'var(--layout-columns-md)', 'var(--layout-margin-md)', '--col-span-md'],
    ['1024px', 'var(--layout-columns-lg)', 'var(--layout-margin-lg)', '--col-span-lg'],
  ])(
    'activates the expected columns and outer margin at %s',
    (breakpoint, columns, margin, span) => {
      const mediaCss = requiredBlocks(stylesheet, `@media (min-width: ${breakpoint})`).join('\n');

      expect(
        lastDeclaration(mediaCss, ':where(.layout-container, .layout-row)', '--layout-columns'),
      ).toBe(columns);
      expect(lastDeclaration(mediaCss, ':where(.layout-container)', 'padding-inline')).toBe(margin);
      expectSpanSizing(mediaCss, span);
    },
  );

  it('uses the four-column, 16px-margin grid below the medium breakpoint', () => {
    const css = baseCss(stylesheet);

    expect(lastDeclaration(css, ':where(.layout-container)', '--layout-columns')).toBe(
      'var(--layout-columns-sm)',
    );
    expect(lastDeclaration(css, ':where(.layout-container)', 'padding-inline')).toBe(
      'var(--layout-margin-sm)',
    );
    expect(lastDeclaration(css, ':where(.layout-row)', '--layout-columns')).toBe(
      'var(--layout-columns-sm)',
    );
    expect(lastDeclaration(css, ':where(.layout-row)', '--row-gap-sm')).toBe(
      'var(--layout-gutter)',
    );
  });

  it('keeps 12 columns and flexible outer margins at the 1440px container cap', () => {
    const mediaCss = requiredBlocks(stylesheet, '@media (min-width: 1440px)').join('\n');
    const capCss = `${baseCss(stylesheet)}\n${mediaCss}`;

    expect(lastDeclaration(capCss, ':where(.layout-container)', 'margin-inline')).toBe('auto');
    expect(lastDeclaration(capCss, ':where(.layout-container)', 'max-inline-size')).toBe(
      'var(--layout-container-max)',
    );
    expect(
      lastDeclaration(mediaCss, ':where(.layout-container, .layout-row)', '--layout-columns'),
    ).toBe('var(--layout-columns-xl)');
    expectSpanSizing(mediaCss, '--col-span-xl');
  });
});
