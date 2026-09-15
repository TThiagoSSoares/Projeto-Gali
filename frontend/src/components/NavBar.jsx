// src/components/NavBar.jsx
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/',              label: 'Início' },
  { to: '/mapa',          label: 'Mapa' },
  { to: '/doar',          label: 'Doar' },
  { to: '/preciso-ajuda', label: 'Preciso de ajuda' },
];

export default function NavBar() {
  const { usuario, logout, isAdmin } = useAuth();

  return (
    <header className="border-b-2 border-ink/90 bg-paper">
      <div className="container-x flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo />
          <div className="leading-none">
            <div className="font-display font-bold text-xl">Sorocaba</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Logística Humanitária
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full font-semibold text-sm transition-colors
                 ${isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/10'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full font-semibold text-sm
                 ${isActive ? 'bg-rust text-paper' : 'text-rust hover:bg-rust/10'}`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <span className="hidden sm:inline text-sm font-medium">
                Olá, <strong>{usuario.nome.split(' ')[0]}</strong>
              </span>
              <button onClick={logout} className="btn-ghost text-xs">
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-ghost text-xs">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
      <rect x="1.5" y="1.5" width="39" height="39" rx="10" fill="#0b1020" />
      <path d="M11 28 L21 12 L31 28 Z" fill="#fbf8f2" />
      <circle cx="21" cy="24" r="3" fill="#c4513a" />
      <rect x="1.5" y="1.5" width="39" height="39" rx="10" stroke="#0b1020" strokeWidth="2"/>
    </svg>
  );
}
