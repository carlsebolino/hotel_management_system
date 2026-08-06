import { Container, Stack } from '../components/layouts';

export function AboutPage() {
  return (
    <Container className="page-frame standard-page">
      <Stack className="details-card about-card">
        <p className="eyebrow">About the project</p>
        <h1 className="page-title">One product, two focused applications.</h1>
        <p className="intro">
          The React and Vite frontend provides the interface, while Flask owns versioned JSON APIs,
          validation, business logic, and database access.
        </p>
        <p className="intro">
          This reference application demonstrates an accessible, responsive frontend and a
          production-ready boundary between client and server.
        </p>
      </Stack>
    </Container>
  );
}
