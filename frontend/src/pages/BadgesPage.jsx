import React, { useEffect, useState } from 'react';
import { badgesAPI } from '../api/client';

const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
const RARITY_COLORS = { common:'#9ca3af', uncommon:'#34d399', rare:'#60a5fa', epic:'#a78bfa', legendary:'#fbbf24' };
const RARITY_GLOWS = { common:'', uncommon:'0 0 12px rgba(52,211,153,0.3)', rare:'0 0 16px rgba(96,165,250,0.3)', epic:'0 0 20px rgba(167,139,250,0.35)', legendary:'0 0 28px rgba(251,191,36,0.45)' };

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    badgesAPI.getAll().then(data => {
      const all = [...data.badges].sort((a,b) => {
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
      });
      setBadges(all);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = filter === 'all' ? badges
    : filter === 'earned' ? badges.filter(b=>b.earned)
    : filter === 'locked' ? badges.filter(b=>!b.earned)
    : badges.filter(b=>b.rarity===filter);

  const earnedCount = badges.filter(b=>b.earned).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(139,92,246,0.06))',
        border: '1px solid rgba(167,139,250,0.25)', borderRadius: '16px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ marginBottom: '8px' }}>🎖️ Badge Collection</h2>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Collect badges by completing sustainability actions and challenges.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--clr-purple-400)' }}>
            {earnedCount}<span style={{ fontSize: '1.25rem', color: 'var(--txt-muted)' }}>/{badges.length}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Badges Earned</div>
        </div>
      </div>

      {/* Progress by rarity */}
      {['legendary','epic','rare','uncommon','common'].map(r => {
        const total = badges.filter(b=>b.rarity===r).length;
        const earned = badges.filter(b=>b.rarity===r&&b.earned).length;
        if (!total) return null;
        return (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '80px', fontSize: '0.75rem', fontWeight: 600, color: RARITY_COLORS[r], textTransform: 'uppercase' }}>{r}</span>
            <div style={{ flex: 1 }}>
              <div className="progress-track progress-sm">
                <div className="progress-fill" style={{ width: total > 0 ? `${(earned/total)*100}%` : '0%', '--progress-color': RARITY_COLORS[r] }} />
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', width: '40px', textAlign: 'right' }}>{earned}/{total}</span>
          </div>
        );
      })}

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all','earned','locked','legendary','epic','rare','uncommon','common'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`}
            style={['legendary','epic','rare','uncommon','common'].includes(f) ? { color: RARITY_COLORS[f] } : {}}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="loading-page" style={{ minHeight:'200px' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="badge-grid">
          {filtered.map(badge => (
            <div
              key={badge.id}
              className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
              style={{
                '--badge-color': RARITY_COLORS[badge.rarity],
                boxShadow: badge.earned ? RARITY_GLOWS[badge.rarity] : undefined,
                cursor: 'pointer',
              }}
              onClick={() => setSelected(badge)}
            >
              <div className="badge-icon" style={{ filter: badge.earned ? undefined : 'grayscale(1)' }}>
                {badge.icon}
              </div>
              <div className="badge-name">{badge.name}</div>
              <div className={`badge-rarity rarity-${badge.rarity}`}>{badge.rarity}</div>
              {badge.earned && (
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--clr-green-400)', fontWeight: 600 }}>✓ Earned</div>
              )}
              {badge.xp_reward > 0 && !badge.earned && (
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--clr-amber-400)' }}>+{badge.xp_reward} XP</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Badge Detail Modal */}
      {selected && (
        <div
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
          }}
        >
          <div className="card animate-scale" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px' }}>
            <div style={{
              fontSize: '4rem', marginBottom: '16px',
              filter: selected.earned ? undefined : 'grayscale(0.8)',
              animation: selected.earned ? 'float 3s ease-in-out infinite' : undefined,
            }}>
              {selected.icon}
            </div>
            <div style={{ color: RARITY_COLORS[selected.rarity], fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              {selected.rarity} · {selected.category}
            </div>
            <h3 style={{ marginBottom: '8px' }}>{selected.name}</h3>
            <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>{selected.description}</p>
            {selected.xp_reward > 0 && (
              <div className="xp-cost" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                ⚡ {selected.xp_reward} XP Reward
              </div>
            )}
            {selected.earned ? (
              <div style={{ color: 'var(--clr-green-400)', fontWeight: 600 }}>✅ You've earned this badge!</div>
            ) : (
              <div style={{ color: 'var(--txt-muted)', fontSize: '0.875rem' }}>🔒 Not yet earned</div>
            )}
            <button onClick={() => setSelected(null)} className="btn btn-secondary" style={{ marginTop: '20px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
