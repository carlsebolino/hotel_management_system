import { Link } from 'react-router-dom';
import { Container } from '../components/layouts';

export function NotFoundPage() {
  return (
    <Container className="not-found">
      <p className="eyebrow">404 error</p>
      <h1 className="page-title">Page not found</h1>
      <p>The address may be incorrect or the page may have moved.</p>
      <Link className="button-link" to="/">
        Return to the grid demo
      </Link>
    </Container>
  );
}
