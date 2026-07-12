import React, { useEffect, useState } from 'react';
import { achievementsAPI } from '../api/client';
import { formatDistanceToNow } from 'date-fns';

const TYPE_STYLES = {
  badge: { color:'#a78bfa', bg:'rgba(167,139,250,0.12)', icon:'🏆' },
  level_up: { color:'#fbbf24', bg:'rgba(251,191,36,0.12)', icon:'🚀' },
  challenge_completed: { color:'#60a5fa', bg:'rgba(96,165,250,0.12)', icon:'⚔️' },
  milestone: { color:'#4ade80', bg:'rgba(74,222,128,0.12)', icon:'🎯' },
  streak: { color:'#ff6b35', bg:'rgba(255,107,53,0.12)', icon:'🔥' },
  reward_redeemed: { color:'#34d399', bg:'rgba(52,211,153,0.12)', icon:'🎁' },
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const load = async (p = 1, t = filter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (t !== 'all') params.type = t;
      const data = await achievementsAPI.getMine(params);
      setAchievements(p === 1 ? data.achievements : (prev) => [...prev, ...data.achievements]);
      setTotal(data.total);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { setPage(1); load(1, filter); }, [filter]);

  const totalXP = achievements.reduce((s, a) => s + (a.xp_value || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(96,165,250,0.06))',
        border: '1px solid rgba(74,222,128,0.2)', borderRadius: '16px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ marginBottom: '8px' }}>⭐ Achievement History</h2>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Every action, badge, and milestone you've accomplished.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Total Achievements', value: total },
            { label: 'XP Earned', value: `+${totalXP.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all','badge','level_up','challenge_completed','milestone','streak'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`}>
            {TYPE_STYLES[f]?.icon || '🌟'} {f.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading && achievements.length === 0 ? (
        <div className="loading-page" style={{ minHeight:'200px' }}><div className="spinner spinner-lg" /></div>
      ) : achievements.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">⭐</div><div className="empty-state-title">No achievements yet</div><p>Start logging ESG actions to earn your first achievement!</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {achievements.map((a, i) => {
            const style = TYPE_STYLES[a.type] || TYPE_STYLES.badge;
            return (
              <div key={a.id} className="card card-sm animate-in" style={{
                display: 'flex', gap: '16px', alignItems: 'flex-start',
                animationDelay: `${i * 0.03}s`, padding: '16px 20px',
              }}>
                {/* Timeline dot */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', border: `1px solid ${style.color}30`,
                }}>
                  {a.icon || style.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{a.title}</div>
                    {a.xp_value > 0 && (
                      <span className="xp-cost" style={{ flexShrink: 0, fontSize: '0.75rem' }}>+{a.xp_value} XP</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--txt-secondary)', margin: '4px 0' }}>{a.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                    {formatDistanceToNow(new Date(a.achieved_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
          {achievements.length < total && (
            <button onClick={() => { const p = page + 1; setPage(p); load(p); }} className="btn btn-secondary w-full" style={{ marginTop: '8px' }}>
              {loading ? <div className="spinner" /> : 'Load More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
