import { Container, Grid, Stack } from './layouts';

const examples = [
  { name: 'Container', description: 'Centered content with a responsive maximum width.' },
  { name: 'Stack', description: 'Vertical content with a consistent rhythm.' },
  { name: 'Grid', description: 'Responsive columns for related content.' },
  { name: 'SidebarLayout', description: 'Navigation beside a flexible content area.' },
];

/** Shows the layout primitives inside a Bootstrap-style full-width container. */
export function LayoutExamples() {
  return (
    <section className="border-y border-sky-200 bg-sky-50 py-8" aria-labelledby="layouts-title">
      <Container fluid>
        <Stack>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                Fluid container example
              </p>
              <h2 id="layouts-title" className="mt-1 text-2xl font-bold text-slate-900">
                Layouts that grow with the viewport
              </h2>
            </div>
            <code className="w-fit rounded-lg bg-sky-100 px-3 py-1.5 text-sm text-sky-900">
              {'<Container fluid>'}
            </code>
          </div>

          <Grid columns={4}>
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
          </Grid>
        </Stack>
      </Container>
    </section>
  );
}
