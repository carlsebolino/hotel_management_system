import { NavLink, Route, Routes } from 'react-router-dom';
import { Container } from './components/layouts';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UsersPage } from './pages/UsersPage';

const navigation = [
  { to: '/', label: 'Grid demo', end: true },
  { to: '/users', label: 'Users', end: false },
  { to: '/about', label: 'About', end: false },
];

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Container className="navigation-frame">
          <NavLink className="site-name" to="/" aria-label="Reference application home">
            Reference App
          </NavLink>
          <nav aria-label="Primary navigation">
            <ul className="primary-navigation">
              {navigation.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink className="navigation-link" end={end} to={to}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </header>
      <main className="page-content" id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
