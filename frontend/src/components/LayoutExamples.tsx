import { Stack } from './layouts';

const examples = [
  { name: 'Stack', description: 'The only layout primitive kept for the design-system demo.' },
  {
    name: 'Responsive props',
    description: 'Accepts events plus responsive layout, spacing, sizing, and positioning props.',
  },
  {
    name: 'Grid CSS',
    description: 'Page-level CSS follows 4, 8, 12, and 12 columns by breakpoint.',
  },
  {
    name: 'Visible columns',
    description: 'Columns are labeled and change color as the viewport changes.',
  },
];

/** Shows the Stack primitive without reintroducing removed layout components. */
export function LayoutExamples() {
  return (
    <section className="border-y border-sky-200 bg-sky-50 py-8" aria-labelledby="layouts-title">
      <Stack className="mx-auto max-w-7xl gap-5 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
              Stack-only example
            </p>
            <h2 id="layouts-title" className="mt-1 text-2xl font-bold text-slate-900">
              Layouts follow the referenced Stack props
            </h2>
          </div>
          <code className="w-fit rounded-lg bg-sky-100 px-3 py-1.5 text-sm text-sky-900">
            {'<Stack marginInline={{ small: 16, medium: 24 }}>'}
          </code>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {examples.map((example, index) => (
            <article
              key={example.name}
              className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-bold text-sky-600">0{index + 1}</span>
              <h3 className="mt-2 font-bold text-slate-900">{example.name}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{example.description}</p>
            </article>
          ))}
        </div>
      </Stack>
    </section>
  );
}
