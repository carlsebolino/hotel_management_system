import { Col, Container, Row, Stack } from './layouts';

const examples = [
  {
    name: 'Container',
    description: 'Centers content and applies responsive margins like Bootstrap.',
  },
  {
    name: 'Rows and columns',
    description: 'Rows wrap columns across 4, 8, and 12 column breakpoints.',
  },
  {
    name: 'Stack',
    description: 'Stacks keep one-dimensional spacing and alignment simple.',
  },
  {
    name: 'Responsive props',
    description: 'All helpers accept div attributes and responsive values.',
  },
];

/** Shows the Bootstrap-like layout helpers with the Stack primitive. */
export function LayoutExamples() {
  return (
    <section className="border-y border-sky-200 bg-sky-50 py-8" aria-labelledby="layouts-title">
      <Container>
        <Stack className="gap-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                Bootstrap-like example
              </p>
              <h2 id="layouts-title" className="mt-1 text-2xl font-bold text-slate-900">
                Layouts follow container, row, column, and Stack props
              </h2>
            </div>
            <code className="w-fit rounded-lg bg-sky-100 px-3 py-1.5 text-sm text-sky-900">
              {'<Container><Row><Col span={{ large: 6 }} /></Row></Container>'}
            </code>
          </div>

          <Row>
            {examples.map((example, index) => (
              <Col key={example.name} span={{ small: 4, medium: 4, large: 3 }}>
                <article className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
                  <span className="text-xs font-bold text-sky-600">0{index + 1}</span>
                  <h3 className="mt-2 font-bold text-slate-900">{example.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{example.description}</p>
                </article>
              </Col>
            ))}
          </Row>
        </Stack>
      </Container>
    </section>
  );
}
