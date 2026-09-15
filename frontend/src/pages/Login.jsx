// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@sorocaba-logistics.local');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const destino = loc.state?.from || '/admin';

  async function submit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const u = await login(email, senha);
      nav(u.tipo === 'admin' ? destino : '/', { replace: true });
    } catch (e) {
      setErro(e.message || 'Falha no login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="container-x py-16">
      <div className="max-w-md mx-auto">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-rust mb-3">
          Acesso restrito
        </div>
        <h1 className="font-display text-4xl font-bold mb-8">Entrar</h1>

        <form onSubmit={submit} className="card">
          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="label">Senha</label>
            <input
              type="password"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <div className="my-3 p-3 rounded-xl bg-rust/10 text-rust text-sm">
              {erro}
            </div>
          )}

          <button type="submit" disabled={carregando} className="btn w-full mt-4 disabled:opacity-50">
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-xs text-ink/50 mt-5 text-center">
            Credenciais padrão (dev): <code className="font-mono">admin@sorocaba-logistics.local</code> / <code className="font-mono">admin123</code>
          </p>
        </form>

        <p className="text-center text-sm mt-6">
          <Link to="/" className="underline underline-offset-4">← Voltar</Link>
        </p>
      </div>
    </div>
  );
}
