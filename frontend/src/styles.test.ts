import { describe, expect, it } from 'vitest';

import stylesheet from './styles.css?raw';

function activeCss(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function blocksStartingWith(source: string, marker: string) {
  const blocks: string[] = [];
  const css = activeCss(source);
  let searchFrom = 0;

  while (searchFrom < css.length) {
    const markerIndex = css.indexOf(marker, searchFrom);
    if (markerIndex < 0) break;

    const openingBrace = css.indexOf('{', markerIndex + marker.length);
    if (openingBrace < 0) break;

    let depth = 0;
    for (let index = openingBrace; index < css.length; index += 1) {
      if (css[index] === '{') depth += 1;
      if (css[index] === '}') depth -= 1;
      if (depth === 0) {
        blocks.push(css.slice(openingBrace + 1, index));
        searchFrom = index + 1;
        break;
      }
    }

    if (depth !== 0) throw new Error(`Expected ${marker} to close its block`);
  }

  return blocks;
}

function blocksFor(source: string, marker: string) {
  const blocks = blocksStartingWith(source, marker);
  expect(blocks, `Expected to find active rule ${marker}`).not.toHaveLength(0);
  return blocks;
}

function lastDeclaration(source: string, selector: string, property: string) {
  return lastDeclarationInBlocks(blocksFor(source, selector), selector, property);
}

function lastDeclarationInBlocks(blocks: string[], selector: string, property: string) {
  const declarations = blocks
    .map((block) => block.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))?.[1].trim())
    .filter((value): value is string => value !== undefined);

  expect(declarations, `Expected ${selector} to declare ${property}`).not.toHaveLength(0);
  return declarations.at(-1);
}

describe('CSS rule inspection', () => {
  it('ignores commented-out rules', () => {
    expect(blocksStartingWith('/* @media (min-width: 768px) { .example {} } */', '@media')).toEqual(
      [],
    );
  });

  it('uses the final declaration from repeated rules', () => {
    const css = '.example { color: green; } .example { color: red; }';
    expect(lastDeclaration(css, '.example', 'color')).toBe('red');
  });
});

describe('responsive grid contract', () => {
  it('keeps the shared gutter, column counts, margins, and container cap', () => {
    const rootBlocks = blocksFor(stylesheet, ':root');

    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-gutter')).toBe('16px');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-columns-sm')).toBe('4');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-columns-md')).toBe('8');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-columns-lg')).toBe('12');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-columns-xl')).toBe('12');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-margin-sm')).toBe('16px');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-margin-md')).toBe('24px');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-margin-lg')).toBe('32px');
    expect(lastDeclarationInBlocks(rootBlocks, ':root', '--layout-container-max')).toBe('1440px');
  });

  it.each([
    ['768px', 'var(--layout-columns-md)', 'var(--layout-margin-md)', '--col-span-md'],
    ['1024px', 'var(--layout-columns-lg)', 'var(--layout-margin-lg)', '--col-span-lg'],
  ])('activates the expected columns and outer margin at %s', (breakpoint, columns, margin, span) => {
    const mediaCss = blocksFor(stylesheet, `@media (min-width: ${breakpoint})`).join('\n');

    expect(
      lastDeclaration(mediaCss, ':where(.layout-container, .layout-row)', '--layout-columns'),
    ).toBe(columns);
    expect(lastDeclaration(mediaCss, ':where(.layout-container)', 'padding-inline')).toBe(margin);
    expect(blocksFor(mediaCss, `:where(.layout-col[style*='${span}'])`)).not.toHaveLength(0);
  });

  it('uses the four-column, 16px-margin grid below the medium breakpoint', () => {
    const defaultCss = stylesheet.slice(0, stylesheet.indexOf('@media'));

    expect(lastDeclaration(defaultCss, ':where(.layout-container)', '--layout-columns')).toBe(
      'var(--layout-columns-sm)',
    );
    expect(lastDeclaration(defaultCss, ':where(.layout-container)', 'padding-inline')).toBe(
      'var(--layout-margin-sm)',
    );
    expect(lastDeclaration(defaultCss, ':where(.layout-row)', '--layout-columns')).toBe(
      'var(--layout-columns-sm)',
    );
    expect(lastDeclaration(defaultCss, ':where(.layout-row)', '--row-gap-sm')).toBe(
      'var(--layout-gutter)',
    );
  });

  it('keeps 12 columns and flexible outer margins at the 1440px container cap', () => {
    const mediaCss = blocksFor(stylesheet, '@media (min-width: 1440px)').join('\n');
    const defaultCss = stylesheet.slice(0, stylesheet.indexOf('@media'));

    expect(lastDeclaration(defaultCss, ':where(.layout-container)', 'margin-inline')).toBe('auto');
    expect(lastDeclaration(defaultCss, ':where(.layout-container)', 'max-inline-size')).toBe(
      'var(--layout-container-max)',
    );
    expect(
      lastDeclaration(mediaCss, ':where(.layout-container, .layout-row)', '--layout-columns'),
    ).toBe('var(--layout-columns-xl)');
    expect(blocksFor(mediaCss, ":where(.layout-col[style*='--col-span-xl'])")).not.toHaveLength(0);
    expect(blocksStartingWith(mediaCss, ':where(.layout-container)')).toEqual([]);
  });
});
