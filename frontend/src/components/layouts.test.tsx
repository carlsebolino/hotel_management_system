import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Col, Container, Row, Stack } from './layouts';

describe('grid layout primitives', () => {
  it('renders fixed and fluid containers without losing consumer attributes', () => {
    const { rerender } = render(
      <Container aria-label="content" className="page-shell" data-layout="fixed">
        Content
      </Container>,
    );

    const container = screen.getByLabelText('content');
    expect(container).toHaveClass('layout-container', 'page-shell');
    expect(container).not.toHaveClass('layout-container-fluid');
    expect(container).toHaveAttribute('data-layout', 'fixed');

    rerender(
      <Container aria-label="content" className="page-shell" fluid>
        Content
      </Container>,
    );
    expect(container).toHaveClass('layout-container', 'layout-container-fluid', 'page-shell');
  });

  it('maps scalar row gaps to the small breakpoint and preserves inline styles', () => {
    render(
      <Row aria-label="row" gap={20} style={{ color: 'red' }}>
        Content
      </Row>,
    );

    const row = screen.getByLabelText('row');
    expect(row).toHaveClass('layout-row');
    expect(row.style.color).toBe('red');
    expect(row.style.getPropertyValue('--row-gap-sm')).toBe('20px');
    expect(row.style.getPropertyValue('--row-gap-md')).toBe('');
  });

  it('maps every responsive row gap to the CSS breakpoint contract', () => {
    render(
      <Row
        aria-label="row"
        gap={{ small: 0, medium: 24, large: '2rem', extraLarge: 'clamp(1rem, 2vw, 3rem)' }}
      >
        Content
      </Row>,
    );

    const style = screen.getByLabelText('row').style;
    expect(style.getPropertyValue('--row-gap-sm')).toBe('0');
    expect(style.getPropertyValue('--row-gap-md')).toBe('24px');
    expect(style.getPropertyValue('--row-gap-lg')).toBe('2rem');
    expect(style.getPropertyValue('--row-gap-xl')).toBe('clamp(1rem, 2vw, 3rem)');
  });

  it('maps scalar column values to the small breakpoint', () => {
    render(
      <Col aria-label="column" order={-1} span={4} style={{ backgroundColor: 'blue' }}>
        Content
      </Col>,
    );

    const column = screen.getByLabelText('column');
    expect(column).toHaveClass('layout-col');
    expect(column.style.backgroundColor).toBe('blue');
    expect(column.style.getPropertyValue('--col-span-sm')).toBe('4');
    expect(column.style.getPropertyValue('--col-order-sm')).toBe('-1');
    expect(column.style.getPropertyValue('--col-span-md')).toBe('');
    expect(column.style.getPropertyValue('--col-order-md')).toBe('');
  });

  it('maps sparse responsive spans and orders without inventing fallback values', () => {
    render(
      <Col aria-label="column" order={{ medium: 3, extraLarge: 1 }} span={{ small: 4, large: 8 }}>
        Content
      </Col>,
    );

    const style = screen.getByLabelText('column').style;
    expect(style.getPropertyValue('--col-span-sm')).toBe('4');
    expect(style.getPropertyValue('--col-span-md')).toBe('');
    expect(style.getPropertyValue('--col-span-lg')).toBe('8');
    expect(style.getPropertyValue('--col-span-xl')).toBe('');
    expect(style.getPropertyValue('--col-order-sm')).toBe('');
    expect(style.getPropertyValue('--col-order-md')).toBe('3');
    expect(style.getPropertyValue('--col-order-lg')).toBe('');
    expect(style.getPropertyValue('--col-order-xl')).toBe('1');
  });

  it('maps every responsive column span and order to the matching suffix', () => {
    render(
      <Col
        aria-label="column"
        order={{ small: 4, medium: 3, large: 2, extraLarge: 1 }}
        span={{ small: 4, medium: 6, large: 8, extraLarge: 12 }}
      >
        Content
      </Col>,
    );

    const style = screen.getByLabelText('column').style;
    expect(style.getPropertyValue('--col-span-sm')).toBe('4');
    expect(style.getPropertyValue('--col-span-md')).toBe('6');
    expect(style.getPropertyValue('--col-span-lg')).toBe('8');
    expect(style.getPropertyValue('--col-span-xl')).toBe('12');
    expect(style.getPropertyValue('--col-order-sm')).toBe('4');
    expect(style.getPropertyValue('--col-order-md')).toBe('3');
    expect(style.getPropertyValue('--col-order-lg')).toBe('2');
    expect(style.getPropertyValue('--col-order-xl')).toBe('1');
  });

  it('forwards grid event handlers', () => {
    const onClick = vi.fn();
    render(
      <Row aria-label="row" onClick={onClick}>
        Content
      </Row>,
    );

    screen.getByLabelText('row').click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Stack layout primitive', () => {
  it('renders its base class, children, consumer class, and HTML attributes', () => {
    render(
      <Stack aria-label="stack" className="toolbar" data-layout="actions">
        <button type="button">Save</button>
      </Stack>,
    );

    const stack = screen.getByLabelText('stack');
    expect(stack).toHaveClass('stack', 'toolbar');
    expect(stack).toHaveAttribute('data-layout', 'actions');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('maps scalar values to small variables and converts only numeric lengths to pixels', () => {
    render(
      <Stack
        aria-label="stack"
        direction="row"
        flexGrow={2}
        gap={12}
        marginTop={0}
        order={3}
        style={{ color: 'green' }}
      >
        Content
      </Stack>,
    );

    const stack = screen.getByLabelText('stack');
    expect(stack.style.color).toBe('green');
    expect(stack.style.getPropertyValue('--stack-direction-sm')).toBe('row');
    expect(stack.style.getPropertyValue('--stack-flex-grow-sm')).toBe('2');
    expect(stack.style.getPropertyValue('--stack-gap-sm')).toBe('12px');
    expect(stack.style.getPropertyValue('--stack-margin-top-sm')).toBe('0');
    expect(stack.style.getPropertyValue('--stack-order-sm')).toBe('3');
    expect(stack.style.getPropertyValue('--stack-gap-md')).toBe('');
  });

  it('maps all public breakpoint names for representative flex and length props', () => {
    render(
      <Stack
        aria-label="stack"
        direction={{
          small: 'column',
          medium: 'row',
          large: 'row-reverse',
          extraLarge: 'column-reverse',
        }}
        gap={{ small: 8, medium: '1rem', large: 24, extraLarge: 'clamp(1rem, 2vw, 2rem)' }}
      >
        Content
      </Stack>,
    );

    const style = screen.getByLabelText('stack').style;
    expect(style.getPropertyValue('--stack-direction-sm')).toBe('column');
    expect(style.getPropertyValue('--stack-direction-md')).toBe('row');
    expect(style.getPropertyValue('--stack-direction-lg')).toBe('row-reverse');
    expect(style.getPropertyValue('--stack-direction-xl')).toBe('column-reverse');
    expect(style.getPropertyValue('--stack-gap-sm')).toBe('8px');
    expect(style.getPropertyValue('--stack-gap-md')).toBe('1rem');
    expect(style.getPropertyValue('--stack-gap-lg')).toBe('24px');
    expect(style.getPropertyValue('--stack-gap-xl')).toBe('clamp(1rem, 2vw, 2rem)');
  });

  it('serializes boolean flex shorthand values at their requested breakpoints', () => {
    render(
      <Stack aria-label="stack" flex={{ small: true, medium: false, extraLarge: 2 }}>
        Content
      </Stack>,
    );

    const style = screen.getByLabelText('stack').style;
    expect(style.getPropertyValue('--stack-flex-sm')).toBe('1 1 0%');
    expect(style.getPropertyValue('--stack-flex-md')).toBe('0 0 auto');
    expect(style.getPropertyValue('--stack-flex-lg')).toBe('');
    expect(style.getPropertyValue('--stack-flex-xl')).toBe('2');
  });

  it('maps positioning, sizing, spacing, alignment, and wrapping props', () => {
    render(
      <Stack
        alignSelf="center"
        aria-label="stack"
        bottom={4}
        flexBasis={100}
        flexShrink={0}
        flexWrap="wrap"
        justifySelf="end"
        left="auto"
        margin="1rem"
        marginBlock={8}
        marginBottom={12}
        marginInline={16}
        marginLeft={20}
        marginRight={24}
        minWidth={0}
        position="absolute"
        right={28}
        top={32}
        width="50%"
      >
        Content
      </Stack>,
    );

    const style = screen.getByLabelText('stack').style;
    const expected = {
      '--stack-align-self-sm': 'center',
      '--stack-bottom-sm': '4px',
      '--stack-flex-basis-sm': '100px',
      '--stack-flex-shrink-sm': '0',
      '--stack-flex-wrap-sm': 'wrap',
      '--stack-justify-self-sm': 'end',
      '--stack-left-sm': 'auto',
      '--stack-margin-sm': '1rem',
      '--stack-margin-block-sm': '8px',
      '--stack-margin-bottom-sm': '12px',
      '--stack-margin-inline-sm': '16px',
      '--stack-margin-left-sm': '20px',
      '--stack-margin-right-sm': '24px',
      '--stack-min-width-sm': '0',
      '--stack-position-sm': 'absolute',
      '--stack-right-sm': '28px',
      '--stack-top-sm': '32px',
      '--stack-width-sm': '50%',
    };

    for (const [property, value] of Object.entries(expected)) {
      expect(style.getPropertyValue(property), property).toBe(value);
    }
  });
});
