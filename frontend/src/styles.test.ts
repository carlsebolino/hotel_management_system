import postcss, { type AtRule, type Declaration, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

import stylesheet from './styles.css?raw';

const css = postcss.parse(stylesheet);
const breakpoints = [768, 1024, 1440] as const;

function compact(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function mediaAncestors(rule: Rule) {
  const media: AtRule[] = [];
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'media') media.push(parent);
  }
  return media;
}

function minimumWidth(media: AtRule) {
  const match = media.params.match(/^\(min-width:\s*(\d+)px\)$/);
  return match ? Number(match[1]) : undefined;
}

function appliesAt(rule: Rule, viewport: number) {
  return mediaAncestors(rule).every((media) => {
    const width = minimumWidth(media);
    return width !== undefined && viewport >= width;
  });
}

function selectorSpecificity(selector: string) {
  const withoutWhere = selector.replace(/:where\([^)]*\)/g, '');
  const ids = withoutWhere.match(/#[\w-]+/g)?.length ?? 0;
  const classes = withoutWhere.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g)?.length ?? 0;
  const elements = withoutWhere.match(/(^|[\s>+~,(])(?:[a-z][\w-]*|::[\w-]+)/gi)?.length ?? 0;
  return ids * 100 + classes * 10 + elements;
}

function selectorMatchesContract(ruleSelector: string, selector: string) {
  const combinedGridSelector = ':where(.layout-container, .layout-row)';
  const target = compact(selector);
  const plainTarget = target.match(/^:where\((.+)\)$/)?.[1];

  return (
    ruleSelector === target ||
    ruleSelector === plainTarget ||
    (ruleSelector === combinedGridSelector &&
      [':where(.layout-container)', ':where(.layout-row)'].includes(target))
  );
}

function declarations(selector: string, property: string, viewport = 0, stylesheetRoot = css) {
  const matches: Array<{ declaration: Declaration; specificity: number; order: number }> = [];
  let order = 0;

  stylesheetRoot.walkRules((rule) => {
    const ruleSelector = compact(rule.selector);
    if (!selectorMatchesContract(ruleSelector, selector) || !appliesAt(rule, viewport)) return;
    rule.each((node) => {
      if (node.type === 'decl' && node.prop === property) {
        matches.push({
          declaration: node,
          specificity: selectorSpecificity(ruleSelector),
          order: order++,
        });
      }
    });
  });

  return matches;
}

function finalDeclaration(selector: string, property: string, viewport = 0) {
  const values = declarations(selector, property, viewport);
  expect(values, `Expected ${selector} to declare ${property} at ${viewport}px`).not.toHaveLength(
    0,
  );
  const winner = values
    .sort(
      (left, right) =>
        Number(left.declaration.important) - Number(right.declaration.important) ||
        left.specificity - right.specificity ||
        left.order - right.order,
    )
    .at(-1);
  return compact(winner!.declaration.value);
}

function spanFormula(span: string) {
  return compact(`calc(
    (100% - ((var(--layout-columns) - 1) * var(--row-gap))) * var(${span}) /
      var(--layout-columns) + (var(${span}) - 1) * var(--row-gap)
  )`);
}

function expectSpanSizing(span: string, viewport: number) {
  const selector = `:where(.layout-col[style*='${span}'])`;
  const formula = spanFormula(span);
  expect(finalDeclaration(selector, 'flex', viewport)).toBe(`0 0 ${formula}`);
  expect(finalDeclaration(selector, 'max-inline-size', viewport)).toBe(formula);
}

function expectSpanInactive(span: string, viewport: number, stylesheetRoot = css) {
  const selector = `:where(.layout-col[style*='${span}'])`;
  for (const property of ['flex', 'max-inline-size']) {
    expect(
      declarations(selector, property, viewport - 1, stylesheetRoot),
      `${span} must not declare ${property} below ${viewport}px`,
    ).toHaveLength(0);
  }
}

describe('responsive grid CSS contract', () => {
  it('defines every shared grid token', () => {
    const tokens = {
      '--layout-gutter': '16px',
      '--layout-columns-sm': '4',
      '--layout-columns-md': '8',
      '--layout-columns-lg': '12',
      '--layout-columns-xl': '12',
      '--layout-margin-sm': '16px',
      '--layout-margin-md': '24px',
      '--layout-margin-lg': '32px',
      '--layout-container-max': '1440px',
    };

    for (const [property, value] of Object.entries(tokens)) {
      expect(finalDeclaration(':root', property)).toBe(value);
    }
  });

  it('keeps the base container, row, and column mechanics intact', () => {
    expect(finalDeclaration(':where(.layout-container)', 'inline-size')).toBe('100%');
    expect(finalDeclaration(':where(.layout-container)', 'margin-inline')).toBe('auto');
    expect(finalDeclaration(':where(.layout-container)', 'max-inline-size')).toBe(
      'var(--layout-container-max)',
    );
    expect(finalDeclaration(':where(.layout-container-fluid)', 'max-inline-size')).toBe('none');
    expect(finalDeclaration(':where(.layout-row)', 'display')).toBe('flex');
    expect(finalDeclaration(':where(.layout-row)', 'flex-wrap')).toBe('wrap');
    expect(finalDeclaration(':where(.layout-row)', 'gap')).toBe('var(--row-gap)');
    expect(finalDeclaration(':where(.layout-col)', 'min-inline-size')).toBe('0');
    expect(finalDeclaration(':where(.layout-col)', 'flex')).toBe('1 0 0%');
    expect(finalDeclaration(':where(.layout-col)', '--col-span-sm')).toBe('auto');
    expectSpanSizing('--col-span-sm', 0);
  });

  it.each([
    [
      767,
      'var(--layout-columns-sm)',
      'var(--layout-margin-sm)',
      'var(--row-gap-sm)',
      'var(--col-order-sm, 0)',
    ],
    [
      768,
      'var(--layout-columns-md)',
      'var(--layout-margin-md)',
      'var(--row-gap-md, var(--row-gap-sm))',
      'var(--col-order-md, var(--col-order-sm, 0))',
    ],
    [
      1023,
      'var(--layout-columns-md)',
      'var(--layout-margin-md)',
      'var(--row-gap-md, var(--row-gap-sm))',
      'var(--col-order-md, var(--col-order-sm, 0))',
    ],
    [
      1024,
      'var(--layout-columns-lg)',
      'var(--layout-margin-lg)',
      'var(--row-gap-lg, var(--row-gap-md, var(--row-gap-sm)))',
      'var(--col-order-lg, var(--col-order-md, var(--col-order-sm, 0)))',
    ],
    [
      1439,
      'var(--layout-columns-lg)',
      'var(--layout-margin-lg)',
      'var(--row-gap-lg, var(--row-gap-md, var(--row-gap-sm)))',
      'var(--col-order-lg, var(--col-order-md, var(--col-order-sm, 0)))',
    ],
    [
      1440,
      'var(--layout-columns-xl)',
      'var(--layout-margin-lg)',
      'var(--row-gap-xl, var(--row-gap-lg, var(--row-gap-md, var(--row-gap-sm))))',
      'var(--col-order-xl, var(--col-order-lg, var(--col-order-md, var(--col-order-sm, 0))))',
    ],
  ])('applies the complete grid cascade at %ipx', (viewport, columns, margin, rowGap, order) => {
    expect(finalDeclaration(':where(.layout-container)', '--layout-columns', viewport)).toBe(
      columns,
    );
    expect(finalDeclaration(':where(.layout-row)', '--layout-columns', viewport)).toBe(columns);
    expect(finalDeclaration(':where(.layout-container)', 'padding-inline', viewport)).toBe(margin);
    expect(finalDeclaration(':where(.layout-row)', '--row-gap', viewport)).toBe(rowGap);
    expect(finalDeclaration(':where(.layout-col)', 'order', viewport)).toBe(order);
  });

  it.each([
    [768, '--col-span-md'],
    [1024, '--col-span-lg'],
    [1440, '--col-span-xl'],
  ])('activates %s column sizing at its breakpoint', (viewport, span) => {
    expectSpanInactive(span, viewport);
    expectSpanSizing(span, viewport);
  });

  it.each([
    ['flex', '0 0 50%'],
    ['max-inline-size', '50%'],
  ])('rejects a premature responsive span declaration for %s', (property, value) => {
    const fixture = postcss.parse(`
      :where(.layout-col[style*='--col-span-md']) {
        ${property}: ${value};
      }
    `);

    expect(() => expectSpanInactive('--col-span-md', 768, fixture)).toThrowError(
      `--col-span-md must not declare ${property} below 768px`,
    );
  });

  it('uses only the exact supported conditions for grid breakpoint declarations', () => {
    const supported = new Set(breakpoints);

    css.walkRules((rule) => {
      if (!rule.selector.includes('.layout-')) return;
      for (const media of mediaAncestors(rule)) {
        const width = minimumWidth(media);
        expect(width, `Unexpected grid media query: ${media.params}`).toBeDefined();
        expect(supported.has(width as 768), `Unsupported grid breakpoint: ${media.params}`).toBe(
          true,
        );
      }
    });
  });

  it('preserves the capped, centered container through the XL breakpoint', () => {
    expect(finalDeclaration(':where(.layout-container)', 'margin-inline', 1440)).toBe('auto');
    expect(finalDeclaration(':where(.layout-container)', 'max-inline-size', 1440)).toBe(
      'var(--layout-container-max)',
    );
  });
});
