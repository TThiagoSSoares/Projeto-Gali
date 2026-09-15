// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('soro_token'));
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('soro_user') || 'null'); }
    catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem('soro_token', token);
    else localStorage.removeItem('soro_token');
  }, [token]);

  useEffect(() => {
    if (usuario) localStorage.setItem('soro_user', JSON.stringify(usuario));
    else localStorage.removeItem('soro_user');
  }, [usuario]);

  async function login(email, senha) {
    const { token: t, usuario: u } = await authApi.login(email, senha);
    setToken(t);
    setUsuario(u);
    return u;
  }
  function logout() {
    setToken(null);
    setUsuario(null);
  }

  const value = useMemo(() => ({
    token, usuario, login, logout,
    isAdmin: usuario?.tipo === 'admin',
  }), [token, usuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
