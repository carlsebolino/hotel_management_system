import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

type Responsive<T> = T | Partial<Record<'small' | 'medium' | 'large' | 'extraLarge', T>>;
type FlexValue = CSSProperties['flex'] | number | boolean;
type SelfAlignment = CSSProperties['alignSelf'] | CSSProperties['justifySelf'];

type LayoutStyle = CSSProperties & Record<`--${string}`, string | number | undefined>;
type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  fluid?: boolean;
}

interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: Responsive<CSSProperties['gap']>;
}

interface ColProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  span?: Responsive<ColumnSpan>;
  order?: Responsive<number>;
}

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: Responsive<CSSProperties['flexDirection']>;
  flex?: Responsive<FlexValue>;
  flexWrap?: Responsive<CSSProperties['flexWrap']>;
  gap?: Responsive<CSSProperties['gap']>;
  flexGrow?: Responsive<number>;
  flexShrink?: Responsive<number>;
  flexBasis?: Responsive<CSSProperties['flexBasis']>;
  alignSelf?: Responsive<SelfAlignment>;
  justifySelf?: Responsive<SelfAlignment>;
  order?: Responsive<number>;
  margin?: Responsive<CSSProperties['margin']>;
  marginBlock?: Responsive<CSSProperties['marginBlock']>;
  marginInline?: Responsive<CSSProperties['marginInline']>;
  marginTop?: Responsive<CSSProperties['marginTop']>;
  marginRight?: Responsive<CSSProperties['marginRight']>;
  marginBottom?: Responsive<CSSProperties['marginBottom']>;
  marginLeft?: Responsive<CSSProperties['marginLeft']>;
  width?: Responsive<CSSProperties['width']>;
  minWidth?: Responsive<CSSProperties['minWidth']>;
  position?: Responsive<CSSProperties['position']>;
  top?: Responsive<CSSProperties['top']>;
  right?: Responsive<CSSProperties['right']>;
  bottom?: Responsive<CSSProperties['bottom']>;
  left?: Responsive<CSSProperties['left']>;
}

const responsiveKeys = ['small', 'medium', 'large', 'extraLarge'] as const;
const responsiveSuffixes: Record<(typeof responsiveKeys)[number], 'sm' | 'md' | 'lg' | 'xl'> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  extraLarge: 'xl',
};
const lengthStyleNames = new Set([
  'gap',
  'flex-basis',
  'margin',
  'margin-block',
  'margin-inline',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'min-width',
  'top',
  'right',
  'bottom',
  'left',
]);

function isResponsiveObject<T>(
  value: Responsive<T> | undefined,
): value is Partial<Record<(typeof responsiveKeys)[number], T>> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function toCssValue(
  name: string,
  value: FlexValue | CSSProperties[keyof CSSProperties] | undefined,
) {
  if (typeof value === 'boolean') return value ? '1 1 0%' : '0 0 auto';
  if (typeof value === 'number' && value !== 0 && lengthStyleNames.has(name)) return `${value}px`;
  return value;
}

function applyResponsiveStyle<T extends FlexValue | CSSProperties[keyof CSSProperties]>(
  style: LayoutStyle,
  prefix: string,
  name: string,
  value: Responsive<T> | undefined,
) {
  if (value === undefined) return;

  if (!isResponsiveObject(value)) {
    style[`--${prefix}-${name}-sm`] = toCssValue(name, value);
    return;
  }

  for (const key of responsiveKeys) {
    const responsiveValue = value[key];
    if (responsiveValue !== undefined)
      style[`--${prefix}-${name}-${responsiveSuffixes[key]}`] = toCssValue(name, responsiveValue);
  }
}

/**
 * Layout helpers mirror Bootstrap's container/row/column ergonomics while
 * Stack covers one-dimensional flex composition and responsive style props.
 */
export function Container({ children, className, fluid = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn('layout-container', fluid && 'layout-container-fluid', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Row({ children, className, gap, style, ...props }: RowProps) {
  const rowStyle: LayoutStyle = { ...style };
  applyResponsiveStyle(rowStyle, 'row', 'gap', gap);

  return (
    <div className={cn('layout-row', className)} style={rowStyle} {...props}>
      {children}
    </div>
  );
}

export function Col({ children, className, order, span, style, ...props }: ColProps) {
  const colStyle: LayoutStyle = { ...style };
  applyResponsiveStyle(colStyle, 'col', 'span', span);
  applyResponsiveStyle(colStyle, 'col', 'order', order);

  return (
    <div className={cn('layout-col', className)} style={colStyle} {...props}>
      {children}
    </div>
  );
}

export function Stack({
  alignSelf,
  bottom,
  children,
  className,
  direction,
  flex,
  flexBasis,
  flexGrow,
  flexShrink,
  flexWrap,
  gap,
  justifySelf,
  left,
  margin,
  marginBlock,
  marginBottom,
  marginInline,
  marginLeft,
  marginRight,
  marginTop,
  minWidth,
  order,
  position,
  right,
  style,
  top,
  width,
  ...props
}: StackProps) {
  const stackStyle: LayoutStyle = { ...style };

  applyResponsiveStyle(stackStyle, 'stack', 'direction', direction);
  applyResponsiveStyle(stackStyle, 'stack', 'flex', flex);
  applyResponsiveStyle(stackStyle, 'stack', 'flex-wrap', flexWrap);
  applyResponsiveStyle(stackStyle, 'stack', 'gap', gap);
  applyResponsiveStyle(stackStyle, 'stack', 'flex-grow', flexGrow);
  applyResponsiveStyle(stackStyle, 'stack', 'flex-shrink', flexShrink);
  applyResponsiveStyle(stackStyle, 'stack', 'flex-basis', flexBasis);
  applyResponsiveStyle(stackStyle, 'stack', 'align-self', alignSelf);
  applyResponsiveStyle(stackStyle, 'stack', 'justify-self', justifySelf);
  applyResponsiveStyle(stackStyle, 'stack', 'order', order);
  applyResponsiveStyle(stackStyle, 'stack', 'margin', margin);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-block', marginBlock);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-inline', marginInline);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-top', marginTop);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-right', marginRight);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-bottom', marginBottom);
  applyResponsiveStyle(stackStyle, 'stack', 'margin-left', marginLeft);
  applyResponsiveStyle(stackStyle, 'stack', 'width', width);
  applyResponsiveStyle(stackStyle, 'stack', 'min-width', minWidth);
  applyResponsiveStyle(stackStyle, 'stack', 'position', position);
  applyResponsiveStyle(stackStyle, 'stack', 'top', top);
  applyResponsiveStyle(stackStyle, 'stack', 'right', right);
  applyResponsiveStyle(stackStyle, 'stack', 'bottom', bottom);
  applyResponsiveStyle(stackStyle, 'stack', 'left', left);

  return (
    <div className={cn('stack', className)} style={stackStyle} {...props}>
      {children}
    </div>
  );
}
