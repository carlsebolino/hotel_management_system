import { cn } from '../lib/cn';

const containerSizes = {
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

const stackGaps = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
  xl: 'gap-12',
};

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

/** Constrains page content, or spans the viewport when fluid, with responsive gutters. */
export function Container({ children, className, fluid = false, size = 'xl' }) {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8',
        fluid ? 'max-w-none' : cn('mx-auto', containerSizes[size]),
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Adds consistent vertical rhythm between child elements. */
export function Stack({ children, className, gap = 'md' }) {
  return <div className={cn('flex flex-col', stackGaps[gap], className)}>{children}</div>;
}

/** Creates a responsive card or dashboard grid from a small set of column presets. */
export function Grid({ children, className, columns = 1 }) {
  return (
    <div className={cn('grid gap-4 md:gap-6', gridColumns[columns], className)}>{children}</div>
  );
}

/** Places a contextual sidebar beside responsive page content. */
export function SidebarLayout({ children, className, sidebar }) {
  return (
    <div className={cn('grid items-start gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)]', className)}>
      <aside className="lg:sticky lg:top-6">{sidebar}</aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
