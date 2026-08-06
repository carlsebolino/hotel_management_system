import React, { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row, Stack } from '../components/layouts';

type Breakpoint = {
  name: string;
  short: 'SM' | 'MD' | 'LG' | 'XL';
  range: string;
  device: string;
  columns: 4 | 8 | 12;
  margin: string;
  colorClass: string;
};

const breakpoints: [Breakpoint, Breakpoint, Breakpoint, Breakpoint] = [
  {
    name: 'Small',
    short: 'SM',
    range: '320px–767px',
    device: 'Smartphone + desktop',
    columns: 4,
    margin: '16px',
    colorClass: 'is-small',
  },
  {
    name: 'Medium',
    short: 'MD',
    range: '768px–1023px',
    device: 'Tablet + desktop',
    columns: 8,
    margin: '24px',
    colorClass: 'is-md',
  },
  {
    name: 'Large',
    short: 'LG',
    range: '1024px–1439px',
    device: 'Desktop',
    columns: 12,
    margin: '32px',
    colorClass: 'is-large',
  },
  {
    name: 'Extra large',
    short: 'XL',
    range: '1440px and up',
    device: 'Desktop',
    columns: 12,
    margin: 'Flexible',
    colorClass: 'is-extra-large',
  },
];

function getBreakpoint(width: number): Breakpoint {
  if (width >= 1440) return breakpoints[3];
  if (width >= 1024) return breakpoints[2];
  if (width >= 768) return breakpoints[1];
  return breakpoints[0];
}

export function HomePage() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeBreakpoint = useMemo(() => getBreakpoint(width), [width]);
  const columns = Array.from({ length: activeBreakpoint.columns }, (_, index) => index + 1);

  return (
    <div className={`grid-page ${activeBreakpoint.colorClass}`}>
      <Container className="page-frame">
        <Stack className="hero" marginBlock="32px">
          <p className="eyebrow">Bootstrap-like layout system demo</p>
          <h1>Responsive columns you can see change.</h1>
          <p className="intro">
            This page uses Bootstrap-style Container, Row, and Col helpers: 4 columns on small
            screens, 8 on medium screens, and 12 on large screens.
          </p>
        </Stack>
        <Stack className="status-panel" position="sticky" top="16px" marginBottom="24px">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <strong>{activeBreakpoint.name}</strong>
          </div>
          <span>{width}px viewport</span>
          <span>{activeBreakpoint.columns} active columns</span>
        </Stack>
        <Row
          className="grid-demo"
          aria-label={`${activeBreakpoint.columns} column responsive grid`}
        >
          {columns.map((column) => (
            <Col key={column} span={1}>
              <Stack className="demo-column">
                <span>Column</span>
                <strong>{column}</strong>
                <small>
                  {activeBreakpoint.short} / {activeBreakpoint.columns}
                </small>
              </Stack>
            </Col>
          ))}
        </Row>
        <Stack className="details-card" marginBlock="32px">
          <h2>Attached grid details</h2>
          <div
            className="details-grid"
            role="table"
            aria-label="Responsive grid breakpoint details"
          >
            <strong>Size</strong>
            <strong>Device</strong>
            <strong>Breakpoints</strong>
            <strong>Gutter</strong>
            <strong>Margins</strong>
            <strong>Columns</strong>
            {breakpoints.map((breakpoint) => (
              <React.Fragment key={breakpoint.short}>
                <span className={breakpoint.short === activeBreakpoint.short ? 'active-cell' : ''}>
                  {breakpoint.name}
                </span>
                <span>{breakpoint.device}</span>
                <span>{breakpoint.range}</span>
                <span>16px</span>
                <span>{breakpoint.margin}</span>
                <span>{breakpoint.columns}</span>
              </React.Fragment>
            ))}
          </div>
        </Stack>
      </Container>
    </div>
  );
}
