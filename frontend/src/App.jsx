// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import NavBar from './components/NavBar';
import AlertBanner from './components/AlertBanner';
import Home from './pages/Home';
import Pontos from './pages/Pontos';
import Doar from './pages/Doar';
import Ajuda from './pages/Ajuda';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';

function PrivateAdmin({ children }) {
  const { isAdmin } = useAuth();
  const loc = useLocation();
  if (!isAdmin) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <AlertBanner />
      <NavBar />
      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/pontos"  element={<Pontos />} />
          <Route path="/doar"    element={<Doar />} />
          <Route path="/ajuda"   element={<Ajuda />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/admin"   element={<PrivateAdmin><Admin /></PrivateAdmin>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
