import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { departmentsAPI } from '../api/client';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department_id: '' });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    departmentsAPI.getAll().then(setDepartments).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    const data = { ...form };
    if (!data.department_id) delete data.department_id;
    const result = await register(data);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', top: '15%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="auth-card animate-scale" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌿</div>
          <div className="auth-logo-text">Join GreenQuest</div>
          <div className="auth-subtitle">Make sustainability rewarding</div>
        </div>

        {/* Benefits */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {['🎮 Earn XP', '🏆 Win Badges', '⚔️ Challenges', '🤖 AI Insights'].map((b) => (
            <span key={b} className="tag tag-green" style={{ fontSize: '0.75rem' }}>{b}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '12px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.25)', color: 'var(--clr-rose-400)', fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith" required minLength={2} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Work Email</label>
            <input id="reg-email" type="email" className="form-input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@company.com" required autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-dept">Department</label>
            <select id="reg-dept" className="form-select" value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">Select department (optional)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 characters" required minLength={8} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? <><div className="spinner" />&nbsp;Creating account...</> : '🌱 Join GreenQuest — Get 50 XP Free!'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--txt-secondary)' }}>
          Already a member?{' '}
          <Link to="/login" style={{ color: 'var(--clr-green-400)', fontWeight: 600 }}>Sign in →</Link>
        </div>
      </div>
    </div>
  );
}
