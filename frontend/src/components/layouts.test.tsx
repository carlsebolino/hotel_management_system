import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Col, Container, Row } from './layouts';

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
