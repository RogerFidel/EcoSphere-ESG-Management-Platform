import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { esgAPI, achievementsAPI, leaderboardsAPI, challengesAPI } from '../api/client';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
};

const getLevelColor = (level) => {
  const m = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2', Diamond: '#b9f2ff' };
  return m[level] || '#4ade80';
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rank, setRank] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sumData, achData, rankData, chalData] = await Promise.allSettled([
          esgAPI.getSummary(),
          achievementsAPI.getRecent(),
          leaderboardsAPI.getMyRank(),
          challengesAPI.getAll({ status: 'active', limit: 3 }),
        ]);
        if (sumData.status === 'fulfilled') setSummary(sumData.value.summary);
        if (achData.status === 'fulfilled') setAchievements(achData.value.achievements);
        if (rankData.status === 'fulfilled') setRank(rankData.value);
        if (chalData.status === 'fulfilled') setChallenges(chalData.value.challenges);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const level = user?.level || { name: user?.level_name || 'Bronze', minXP: 0, maxXP: 499, icon: '🥉' };
  const levelColor = getLevelColor(level.name);
  const xpTotal = user?.xp_total || 0;
  const levelProgress = user?.level_progress_percent || 0;
  const xpToNext = user?.xp_to_next_level || 0;
  const esgScore = user?.esg_score || 0;
  const carbonSaved = user?.carbon_saved_kg || 0;
  const actionsCount = user?.actions_completed || 0;

  // Chart data from summary
  const catLabels = summary?.map((s) => s.category) || [];
  const catData = summary?.map((s) => parseInt(s.count)) || [];
  const catColors = ['#4ade80','#60a5fa','#f59e0b','#a78bfa','#22d3ee','#f87171','#34d399','#fb923c'];

  const esgDonutData = {
    labels: ['Environmental', 'Social', 'Governance'],
    datasets: [{
      data: [esgScore * 0.5, esgScore * 0.3, esgScore * 0.2],
      backgroundColor: ['#4ade80', '#60a5fa', '#a78bfa'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <span style={{ color: 'var(--txt-secondary)' }}>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(96,165,250,0.08) 100%)',
        border: '1px solid rgba(74,222,128,0.2)',
        borderRadius: '16px', padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', marginBottom: '4px' }}>Welcome back 👋</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', marginBottom: '12px' }}>
            {user?.name?.split(' ')[0]} — Keep pushing! 🌱
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="xp-level-badge" style={{ background: `${levelColor}22`, color: levelColor, border: `1px solid ${levelColor}44` }}>
              {level.icon} {level.name}
            </span>
            <span style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem' }}>
              {xpToNext > 0 ? `${xpToNext.toLocaleString()} XP to ${['Silver','Gold','Platinum','Diamond'].find(() => true) || 'next level'}` : '🏆 Max level reached!'}
            </span>
          </div>
          {/* XP Progress */}
          <div style={{ marginTop: '16px', maxWidth: '360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--txt-secondary)', marginBottom: '6px' }}>
              <span>{xpTotal.toLocaleString()} XP</span>
              <span>{levelProgress}% to next level</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${levelProgress}%`, '--progress-color': `linear-gradient(90deg, ${levelColor}, ${levelColor}99)` }} />
            </div>
          </div>
        </div>

        {/* ESG Ring */}
        <div style={{ textAlign: 'center' }}>
          <div className="esg-ring" style={{ width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#esgGrad)" strokeWidth="10"
                strokeDasharray={`${(esgScore / 100) * 263.9} 263.9`} strokeLinecap="round" />
              <defs>
                <linearGradient id="esgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="esg-ring-value">
              <div style={{ fontSize: '1.5rem', fontWeight: 900, background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{esgScore}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--txt-muted)' }}>ESG Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4">
        {[
          { label: 'Total XP', value: xpTotal.toLocaleString(), icon: '⚡', color: 'var(--grad-brand)', change: '+125 today' },
          { label: 'Actions Done', value: actionsCount, icon: '✅', color: 'linear-gradient(135deg,#60a5fa,#a78bfa)' },
          { label: 'Carbon Saved', value: `${carbonSaved.toFixed(1)}kg`, icon: '🌍', color: 'linear-gradient(135deg,#4ade80,#22c55e)' },
          { label: 'Global Rank', value: rank ? `#${rank.rank}` : '—', icon: '🏆', color: 'linear-gradient(135deg,#fbbf24,#f59e0b)', change: rank ? `Top ${rank.percentile}%` : '' },
        ].map((s) => (
          <div key={s.label} className="stat-card glow" style={{ '--stat-color': s.color }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-icon">{s.icon}</div>
              {s.change && <span style={{ fontSize: '0.75rem', color: 'var(--clr-green-400)', fontWeight: 600 }}>↑ {s.change}</span>}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid-2-1">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Action Category Chart */}
          {catLabels.length > 0 && (
            <div className="card">
              <div className="widget-header">
                <h3 className="widget-title">📊 Actions by Category</h3>
                <Link to="/ai-insights" className="btn btn-sm btn-secondary">AI Insights →</Link>
              </div>
              <div style={{ height: '200px' }}>
                <Bar
                  data={{
                    labels: catLabels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
                    datasets: [{
                      data: catData,
                      backgroundColor: catColors.slice(0, catLabels.length).map((c) => c + '99'),
                      borderColor: catColors.slice(0, catLabels.length),
                      borderWidth: 2,
                      borderRadius: 6,
                    }],
                  }}
                  options={{ ...CHART_DEFAULTS, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>
          )}

          {/* Active Challenges */}
          <div className="card">
            <div className="widget-header">
              <h3 className="widget-title">⚔️ Active Challenges</h3>
              <Link to="/challenges" className="btn btn-sm btn-secondary">View All →</Link>
            </div>
            {challenges.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <div className="empty-state-icon">⚔️</div>
                <div className="empty-state-title">No active challenges</div>
                <p>Join a challenge to earn bonus XP!</p>
                <Link to="/challenges" className="btn btn-outline btn-sm" style={{ marginTop: '12px', display: 'inline-flex' }}>Browse Challenges</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenges.map((ch) => {
                  const myProgress = ch.challengeParticipants?.[0]?.progress || 0;
                  return (
                    <div key={ch.id} style={{
                      padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--clr-border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</div>
                          <span className="tag tag-amber" style={{ marginTop: '4px', fontSize: '0.7rem' }}>+{ch.xp_reward} XP</span>
                        </div>
                        <span className="challenge-status status-active">Active</span>
                      </div>
                      <div className="progress-track progress-sm">
                        <div className="progress-fill" style={{ width: `${myProgress}%` }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '4px' }}>{myProgress}% complete</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ESG Breakdown */}
          <div className="card">
            <div className="widget-header">
              <h3 className="widget-title">🌍 ESG Breakdown</h3>
            </div>
            <div style={{ height: '160px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={esgDonutData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } },
                cutout: '65%',
              }} />
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card">
            <div className="widget-header">
              <h3 className="widget-title">⭐ Recent Achievements</h3>
              <Link to="/achievements" className="btn btn-sm btn-secondary">All →</Link>
            </div>
            {achievements.length === 0 ? (
              <div style={{ color: 'var(--txt-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>
                Complete actions to earn achievements!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {achievements.map((a) => (
                  <div key={a.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'rgba(74,222,128,0.12)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {a.icon || '⭐'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }} className="truncate">{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                        {a.xp_value > 0 && <span className="text-amber">+{a.xp_value} XP · </span>}
                        {new Date(a.achieved_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="widget-title" style={{ marginBottom: '16px' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Log ESG Action', icon: '✅', to: '/dashboard', color: 'var(--clr-green-400)' },
                { label: 'View AI Insights', icon: '🤖', to: '/ai-insights', color: 'var(--clr-purple-400)' },
                { label: 'Browse Rewards', icon: '🎁', to: '/rewards', color: 'var(--clr-amber-400)' },
                { label: 'Join Challenge', icon: '⚔️', to: '/challenges', color: 'var(--clr-blue-400)' },
              ].map((action) => (
                <Link key={action.label} to={action.to} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)',
                  transition: 'all 0.15s', color: 'var(--txt-primary)', textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${action.color}44`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                >
                  <span style={{ fontSize: '1rem' }}>{action.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{action.label}</span>
                  <span style={{ marginLeft: 'auto', color: action.color, fontSize: '0.75rem' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
