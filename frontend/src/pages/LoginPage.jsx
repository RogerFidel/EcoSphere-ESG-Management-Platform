import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@greenquest.io', password: 'password123' },
      manager: { email: 'sarah.chen@greenquest.io', password: 'password123' },
      employee: { email: 'demo@greenquest.io', password: 'password123' },
    };
    setForm(creds[role]);
    setError('');
  };

  return (
    <div className="auth-page">
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="auth-card animate-scale">
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌿</div>
          <div className="auth-logo-text">GreenQuest</div>
          <div className="auth-subtitle">Sustainability. Gamified.</div>
        </div>

        {/* Demo Buttons */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', textAlign: 'center', marginBottom: '4px' }}>🚀 Quick Demo Login</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { role: 'employee', label: 'Employee', color: 'var(--clr-green-400)' },
              { role: 'manager', label: 'Manager', color: 'var(--clr-blue-400)' },
              { role: 'admin', label: 'Admin', color: 'var(--clr-purple-400)' },
            ].map(({ role, label, color }) => (
              <button key={role} onClick={() => fillDemo(role)} style={{
                flex: 1, padding: '8px 4px', borderRadius: '8px', border: `1px solid ${color}30`,
                background: `${color}12`, color, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.target.style.background = `${color}22`}
              onMouseLeave={e => e.target.style.background = `${color}12`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '12px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.25)', color: 'var(--clr-rose-400)',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? <><div className="spinner" />&nbsp;Signing in...</> : '🌱 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--txt-secondary)' }}>
          New to GreenQuest?{' '}
          <Link to="/register" style={{ color: 'var(--clr-green-400)', fontWeight: 600 }}>
            Create account →
          </Link>
        </div>
      </div>
    </div>
  );
}
