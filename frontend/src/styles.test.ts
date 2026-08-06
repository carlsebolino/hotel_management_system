import postcss, { type AtRule, type Declaration, type Root, type Rule } from 'postcss';
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

type Specificity = readonly [ids: number, classes: number, types: number];

function selectorSpecificity(selector: string): Specificity {
  // :where() and its arguments deliberately contribute no specificity.
  const withoutWhere = selector.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
  return [
    withoutWhere.match(/#[\w-]+/g)?.length ?? 0,
    withoutWhere.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?/g)?.length ?? 0,
    withoutWhere.match(/(^|[\s>+~])(?:[a-z][\w-]*|::[\w-]+)/gi)?.length ?? 0,
  ];
}

function compareSpecificity(left: Specificity, right: Specificity) {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function rightmostCompound(selector: string) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selector.length; index++) {
    const character = selector[index];
    if (character === '(' || character === '[') depth++;
    if (character === ')' || character === ']') depth--;
    if (depth === 0 && character && (/[>+~]/.test(character) || /\s/.test(character))) {
      start = index + 1;
    }
  }
  return selector.slice(start);
}

function contractClass(selector: string) {
  return selector.match(/\.layout-(?:container-fluid|container|row|col)(?![\w-])/)?.[0];
}

function createCascadeInspector(root: Root) {
  const layerOrder: string[] = [];
  root.walkAtRules('layer', (atRule) => {
    for (const name of atRule.params.split(',').map((part) => compact(part))) {
      if (name && !layerOrder.includes(name)) layerOrder.push(name);
    }
  });

  function layerName(declaration: Declaration) {
    for (let parent = declaration.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && parent.name === 'layer') return compact(parent.params);
    }
    return undefined;
  }

  function declarations(selector: string, property: string, viewport = 0) {
    const targetClass = contractClass(selector);
    const matches: Array<{
      declaration: Declaration;
      specificity: Specificity;
      layer?: string;
      order: number;
    }> = [];
    let order = 0;

    root.walkRules((rule) => {
      if (!appliesAt(rule, viewport)) return;
      // PostCSS splits selector lists without splitting commas inside :where(), etc.
      for (const branch of rule.selectors) {
        const matchesSelector = targetClass
          ? new RegExp(`${targetClass.replace('.', '\\.')}(?![\\w-])`).test(
              rightmostCompound(branch),
            )
          : compact(branch) === compact(selector);
        if (!matchesSelector) continue;
        rule.each((node) => {
          if (node.type === 'decl' && node.prop === property) {
            matches.push({
              declaration: node,
              specificity: selectorSpecificity(branch),
              layer: layerName(node),
              order: order++,
            });
          }
        });
      }
    });
    return matches;
  }

  function finalDeclaration(selector: string, property: string, viewport = 0) {
    const values = declarations(selector, property, viewport);
    expect(values, `Expected ${selector} to declare ${property} at ${viewport}px`).not.toHaveLength(
      0,
    );
    const winner = values.sort((left, right) => {
      const important = Number(left.declaration.important) - Number(right.declaration.important);
      if (important) return important;
      const unlayered = layerOrder.length;
      const leftLayer = left.layer === undefined ? unlayered : layerOrder.indexOf(left.layer);
      const rightLayer = right.layer === undefined ? unlayered : layerOrder.indexOf(right.layer);
      const layer = left.declaration.important ? rightLayer - leftLayer : leftLayer - rightLayer;
      return (
        layer || compareSpecificity(left.specificity, right.specificity) || left.order - right.order
      );
    }).at(-1);
    return compact(winner!.declaration.value);
  }

  return { declarations, finalDeclaration };
}

const { declarations, finalDeclaration } = createCascadeInspector(css);

function inspectSynthetic(source: string) {
  return createCascadeInspector(postcss.parse(source));
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

describe('cascade inspector regressions', () => {
  it('matches non-contract selectors explicitly', () => {
    const inspector = inspectSynthetic(`
      :root { --shared-token: root-value; }
      .unrelated { --shared-token: unrelated-value; }
    `);

    expect(
      inspector
        .declarations(':root', '--shared-token')
        .map(({ declaration }) => declaration.value),
    ).toEqual(['root-value']);
  });

  it.each([
    ['.layout-row { display: grid; }'],
    ['.page .layout-row { display: grid; }'],
    ['.layout-row.featured { display: grid; }'],
    ['.layout-row, .other { display: grid; }'],
  ])('finds contract rules in %s', (source) => {
    expect(inspectSynthetic(source).finalDeclaration(':where(.layout-row)', 'display')).toBe('grid');
  });

  it('compares specificity components rather than encoding them as decimal digits', () => {
    const inspector = inspectSynthetic(`
      #app .layout-row { display: grid; }
      .a .b .c .d .e .f .g .h .i .j .k .layout-row { display: flex; }
    `);
    expect(inspector.finalDeclaration(':where(.layout-row)', 'display')).toBe('grid');
  });

  it('applies normal and important cascade-layer precedence', () => {
    const inspector = inspectSynthetic(`
      @layer base, overrides;
      @layer base {
        .layout-row { display: block; color: red !important; }
      }
      @layer overrides {
        .layout-row { display: grid; color: blue !important; }
      }
    `);
    expect(inspector.finalDeclaration(':where(.layout-row)', 'display')).toBe('grid');
    expect(inspector.finalDeclaration(':where(.layout-row)', 'color')).toBe('red');
  });

  it('lets a later repeated declaration in the same rule win', () => {
    const inspector = inspectSynthetic('.layout-row { display: flex; display: grid; }');
    expect(inspector.finalDeclaration(':where(.layout-row)', 'display')).toBe('grid');
  });
});
