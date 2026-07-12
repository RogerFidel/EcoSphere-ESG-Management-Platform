import React, { useEffect, useState } from 'react';
import { rewardsAPI } from '../api/client';
import { useAuthStore } from '../store';
import { useToast } from '../store';

const CAT_ICONS = { gift_card:'🎁', extra_leave:'🏖️', merchandise:'👕', donation:'🌳', experience:'🎭', discount:'💳' };
const CAT_COLORS = { gift_card:'#4ade80', extra_leave:'#60a5fa', merchandise:'#a78bfa', donation:'#34d399', experience:'#f59e0b', discount:'#22d3ee' };

export default function RewardsPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('catalog');
  const [redeeming, setRedeeming] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [rData, myData] = await Promise.allSettled([
        rewardsAPI.getAll(),
        rewardsAPI.getMyRedemptions({ limit: 20 }),
      ]);
      if (rData.status === 'fulfilled') setRewards(rData.value.rewards || []);
      if (myData.status === 'fulfilled') setRedemptions(myData.value.redemptions || []);
    } catch (e) { toast.error('Error', e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async (reward) => {
    if (!reward.can_afford) { toast.error('Insufficient XP', `You need ${reward.xp_cost} XP but have ${user?.xp_total}.`); return; }
    if (!reward.in_stock) { toast.error('Out of Stock', 'This reward is currently unavailable.'); return; }
    if (confirm(`Redeem "${reward.name}" for ${reward.xp_cost} XP?`)) {
      setRedeeming(reward.id);
      try {
        const res = await rewardsAPI.redeem(reward.id);
        toast.success('🎁 Redeemed!', `Code: ${res.code}. Check "My Redemptions" tab.`);
        load();
      } catch (e) { toast.error('Error', e.message); }
      setRedeeming(null);
    }
  };

  const filtered = catFilter === 'all' ? rewards : rewards.filter(r => r.category === catFilter);
  const categories = ['all', ...new Set(rewards.map(r => r.category))];

  const STATUS_STYLES = {
    pending: { color: 'var(--clr-amber-400)', bg: 'rgba(251,191,36,0.12)', label: '⏳ Pending' },
    approved: { color: 'var(--clr-blue-400)', bg: 'rgba(96,165,250,0.12)', label: '✅ Approved' },
    delivered: { color: 'var(--clr-green-400)', bg: 'rgba(74,222,128,0.12)', label: '🚀 Delivered' },
    rejected: { color: 'var(--clr-rose-400)', bg: 'rgba(244,63,94,0.12)', label: '❌ Rejected' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* XP Balance Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))',
        border: '1px solid rgba(251,191,36,0.25)', borderRadius: '16px',
        padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>Your XP Balance</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--clr-amber-400)' }}>
            ⚡ {(user?.xp_total || 0).toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--txt-secondary)', fontSize: '0.875rem' }}>
          <div>Earn more by completing</div>
          <div>ESG actions and challenges</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'catalog', label: '🛍️ Reward Catalog' },
          { key: 'redemptions', label: `📦 My Redemptions (${redemptions.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'catalog' ? (
        <>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`btn btn-sm ${catFilter === c ? 'btn-primary' : 'btn-secondary'}`}>
                {c === 'all' ? '🌟 All' : `${CAT_ICONS[c] || '•'} ${c.replace('_', ' ')}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner spinner-lg" /></div>
          ) : (
            <div className="grid-4">
              {filtered.map(reward => {
                const catColor = CAT_COLORS[reward.category] || '#4ade80';
                return (
                  <div key={reward.id} className={`reward-card ${!reward.can_afford ? 'cant-afford' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="reward-icon" style={{ background: `${catColor}1a` }}>
                        {reward.icon || CAT_ICONS[reward.category] || '🎁'}
                      </div>
                      {!reward.in_stock && (
                        <span className="tag" style={{ fontSize: '0.65rem', background: 'rgba(244,63,94,0.12)', color: 'var(--clr-rose-400)' }}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '4px' }}>{reward.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', lineHeight: 1.4 }}>{reward.description}</div>
                    </div>
                    {reward.stock_remaining !== null && reward.stock_remaining <= 5 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-rose-400)' }}>⚠️ Only {reward.stock_remaining} left!</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div className="xp-cost">⚡ {reward.xp_cost.toLocaleString()} XP</div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={redeeming === reward.id || !reward.in_stock}
                        className={`btn btn-sm ${reward.can_afford && reward.in_stock ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {redeeming === reward.id ? <div className="spinner" /> : reward.can_afford ? 'Redeem' : 'Need More XP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Redemptions */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {redemptions.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No redemptions yet</div><p>Browse the catalog and redeem your first reward!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {redemptions.map(r => {
                const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                return (
                  <div key={r.id} style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{r.reward?.icon || '🎁'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{r.reward?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Code: <code style={{ color: 'var(--clr-amber-400)' }}>{r.redemption_code}</code></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '2px' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="xp-cost" style={{ marginBottom: '6px' }}>⚡ {r.xp_spent} XP</div>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
