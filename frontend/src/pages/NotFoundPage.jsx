import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--clr-bg-primary)', flexDirection: 'column', gap: '24px', padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '6rem', animation: 'float 3s ease-in-out infinite' }}>🌿</div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 900, lineHeight: 1,
          background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>404</div>
        <h2 style={{ marginBottom: '8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--txt-secondary)', maxWidth: '360px' }}>
          Looks like this sustainability trail leads nowhere. Let's get you back on track.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/dashboard" className="btn btn-primary btn-lg">🏠 Back to Dashboard</Link>
        <Link to="/challenges" className="btn btn-secondary btn-lg">⚔️ View Challenges</Link>
      </div>
    </div>
  );
}
