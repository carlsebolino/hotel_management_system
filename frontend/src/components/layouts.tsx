import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

type Responsive<T> = T | Partial<Record<'small' | 'medium' | 'large' | 'extraLarge', T>>;
type FlexValue = CSSProperties['flex'] | number | boolean;
type SelfAlignment = CSSProperties['alignSelf'] | CSSProperties['justifySelf'];

type StackStyle = CSSProperties & Record<`--stack-${string}`, string | number | undefined>;

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

function isResponsiveObject<T>(
  value: Responsive<T> | undefined,
): value is Partial<Record<(typeof responsiveKeys)[number], T>> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function toCssValue(value: FlexValue | CSSProperties[keyof CSSProperties] | undefined) {
  if (typeof value === 'boolean') return value ? '1 1 0%' : '0 0 auto';
  return value;
}

function applyResponsiveStyle<T extends FlexValue | CSSProperties[keyof CSSProperties]>(
  style: StackStyle,
  name: string,
  value: Responsive<T> | undefined,
) {
  if (value === undefined) return;

  if (!isResponsiveObject(value)) {
    style[`--stack-${name}-sm`] = toCssValue(value);
    return;
  }

  for (const key of responsiveKeys) {
    const responsiveValue = value[key];
    if (responsiveValue !== undefined)
      style[`--stack-${name}-${key}`] = toCssValue(responsiveValue);
  }
}

/**
 * Stack is the only exported layout primitive. It accepts standard div events plus
 * responsive style props from the referenced design-system tables.
 */
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
  const stackStyle: StackStyle = { ...style };

  applyResponsiveStyle(stackStyle, 'direction', direction);
  applyResponsiveStyle(stackStyle, 'flex', flex);
  applyResponsiveStyle(stackStyle, 'flex-wrap', flexWrap);
  applyResponsiveStyle(stackStyle, 'gap', gap);
  applyResponsiveStyle(stackStyle, 'flex-grow', flexGrow);
  applyResponsiveStyle(stackStyle, 'flex-shrink', flexShrink);
  applyResponsiveStyle(stackStyle, 'flex-basis', flexBasis);
  applyResponsiveStyle(stackStyle, 'align-self', alignSelf);
  applyResponsiveStyle(stackStyle, 'justify-self', justifySelf);
  applyResponsiveStyle(stackStyle, 'order', order);
  applyResponsiveStyle(stackStyle, 'margin', margin);
  applyResponsiveStyle(stackStyle, 'margin-block', marginBlock);
  applyResponsiveStyle(stackStyle, 'margin-inline', marginInline);
  applyResponsiveStyle(stackStyle, 'margin-top', marginTop);
  applyResponsiveStyle(stackStyle, 'margin-right', marginRight);
  applyResponsiveStyle(stackStyle, 'margin-bottom', marginBottom);
  applyResponsiveStyle(stackStyle, 'margin-left', marginLeft);
  applyResponsiveStyle(stackStyle, 'width', width);
  applyResponsiveStyle(stackStyle, 'min-width', minWidth);
  applyResponsiveStyle(stackStyle, 'position', position);
  applyResponsiveStyle(stackStyle, 'top', top);
  applyResponsiveStyle(stackStyle, 'right', right);
  applyResponsiveStyle(stackStyle, 'bottom', bottom);
  applyResponsiveStyle(stackStyle, 'left', left);

  return (
    <div className={cn('stack', className)} style={stackStyle} {...props}>
      {children}
    </div>
  );
}
