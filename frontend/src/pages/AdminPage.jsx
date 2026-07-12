import React, { useEffect, useState } from 'react';
import { adminAPI, notificationsAPI } from '../api/client';
import { useToast } from '../store';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
};

export default function AdminPage() {
  const toast = useToast();
  const [overview, setOverview] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'general', department_id: '' });
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [dashData, analyticsData] = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics({ period }),
      ]);
      if (dashData.status === 'fulfilled') {
        setOverview(dashData.value.overview);
        setTopUsers(dashData.value.top_users || []);
      }
      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }
    } catch (e) { toast.error('Error', e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return;
    setSending(true);
    try {
      await adminAPI.broadcast(broadcast);
      toast.success('📢 Broadcast Sent!', `"${broadcast.title}" delivered successfully.`);
      setBroadcast({ title: '', message: '', type: 'general', department_id: '' });
    } catch (e) { toast.error('Error', e.message); }
    setSending(false);
  };

  const dayLabels = analytics?.actionsByDay?.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })) || [];
  const actionCounts = analytics?.actionsByDay?.map(d => parseInt(d.count)) || [];
  const carbonData = analytics?.actionsByDay?.map(d => parseFloat(d.carbon_saved || 0).toFixed(2)) || [];
  const catLabels = analytics?.actionsByCategory?.map(c => c.category) || [];
  const catCounts = analytics?.actionsByCategory?.map(c => parseInt(c.count)) || [];

  const STAT_CARDS = overview ? [
    { label: 'Total Users',         value: overview.total_users,          icon: '👥', color: 'var(--clr-blue-400)' },
    { label: 'Active (7d)',          value: overview.active_users_7d,       icon: '🟢', color: 'var(--clr-green-400)' },
    { label: 'Active Challenges',    value: overview.active_challenges,     icon: '⚔️', color: 'var(--clr-amber-400)' },
    { label: 'Avg ESG Score',        value: overview.avg_esg_score?.toFixed(1), icon: '📊', color: 'var(--clr-purple-400)' },
    { label: 'Total Actions',        value: overview.total_actions?.toLocaleString(), icon: '✅', color: 'var(--clr-green-400)' },
    { label: 'Carbon Saved (kg)',    value: overview.total_carbon_saved_kg?.toFixed(1), icon: '🌍', color: 'var(--clr-cyan-400)' },
    { label: 'Active Badges',        value: overview.active_badges,         icon: '🎖️', color: 'var(--clr-purple-400)' },
    { label: 'Active Rewards',       value: overview.active_rewards,        icon: '🎁', color: 'var(--clr-rose-400)' },
  ] : [];

  if (loading && !overview) {
    return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>⚙️ Admin Panel</h2>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Monitor, manage, and broadcast across your GreenQuest platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'analytics', label: '📈 Analytics' },
            { key: 'broadcast', label: '📢 Broadcast' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          {/* Stat Grid */}
          <div className="grid-4">
            {STAT_CARDS.map(s => (
              <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top Users */}
          <div className="card">
            <div className="widget-header">
              <h3 className="widget-title">🏆 Top Performers</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>All-time XP leaders</span>
            </div>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th><th>Employee</th><th>Department</th><th>Level</th>
                  <th>Total XP</th><th>ESG Score</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={u.id} className="leaderboard-row">
                    <td>
                      <div className={`rank-badge rank-${i < 3 ? i + 1 : 'other'}`}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="avatar" style={{ fontSize: '0.75rem' }}>
                          {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem' }}>{u.department?.name || '—'}</td>
                    <td style={{ fontSize: '0.875rem' }}>{u.level_name}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--clr-amber-400)' }}>{u.xp_total?.toLocaleString()}</span>
                    </td>
                    <td><span style={{ color: 'var(--clr-green-400)' }}>{u.esg_score?.toFixed(1)}</span></td>
                    <td style={{ color: 'var(--txt-secondary)' }}>{u.actions_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && (
        <>
          {/* Period Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['7d', '30d', '90d'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}>
                {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <div className="grid-2">
            {/* Actions Over Time */}
            <div className="card">
              <h3 className="widget-title" style={{ marginBottom: '20px' }}>📈 Actions Over Time</h3>
              <div style={{ height: '220px' }}>
                <Line
                  data={{
                    labels: dayLabels,
                    datasets: [{
                      data: actionCounts,
                      borderColor: '#4ade80',
                      backgroundColor: 'rgba(74,222,128,0.08)',
                      fill: true, tension: 0.4, pointRadius: 3,
                      pointBackgroundColor: '#4ade80',
                    }],
                  }}
                  options={CHART_OPTS}
                />
              </div>
            </div>

            {/* Carbon Saved Over Time */}
            <div className="card">
              <h3 className="widget-title" style={{ marginBottom: '20px' }}>🌍 Carbon Saved (kg)</h3>
              <div style={{ height: '220px' }}>
                <Line
                  data={{
                    labels: dayLabels,
                    datasets: [{
                      data: carbonData,
                      borderColor: '#22d3ee',
                      backgroundColor: 'rgba(34,211,238,0.08)',
                      fill: true, tension: 0.4, pointRadius: 3,
                      pointBackgroundColor: '#22d3ee',
                    }],
                  }}
                  options={CHART_OPTS}
                />
              </div>
            </div>

            {/* Actions by Category */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 className="widget-title" style={{ marginBottom: '20px' }}>📊 Actions by Category</h3>
              <div style={{ height: '200px' }}>
                <Bar
                  data={{
                    labels: catLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                    datasets: [{
                      data: catCounts,
                      backgroundColor: ['#4ade80','#60a5fa','#fbbf24','#a78bfa','#22d3ee','#f87171','#34d399','#fb923c'].map(c => c + 'cc'),
                      borderRadius: 6,
                    }],
                  }}
                  options={CHART_OPTS}
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid-3">
            {[
              { label: 'Total Actions', value: actionCounts.reduce((s, v) => s + v, 0).toLocaleString(), icon: '✅' },
              { label: 'Total Carbon Saved', value: `${carbonData.reduce((s, v) => s + parseFloat(v), 0).toFixed(1)} kg`, icon: '🌍' },
              { label: 'Daily Average', value: actionCounts.length ? Math.round(actionCounts.reduce((s,v)=>s+v,0)/actionCounts.length) : 0, icon: '📆' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ '--stat-color': 'var(--grad-brand)' }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label} ({period})</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BROADCAST TAB ── */}
      {tab === 'broadcast' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>📢 Send Broadcast Notification</h3>
            <form onSubmit={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Notification Title *</label>
                <input className="form-input" value={broadcast.title}
                  onChange={e => setBroadcast({ ...broadcast, title: e.target.value })}
                  placeholder="E.g. ♻️ New Recycling Initiative!" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={4} value={broadcast.message}
                  onChange={e => setBroadcast({ ...broadcast, message: e.target.value })}
                  placeholder="Your message to all employees..." required style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={broadcast.type} onChange={e => setBroadcast({ ...broadcast, type: e.target.value })}>
                  {['general', 'policy_reminder', 'compliance_alert', 'challenge_invite', 'csr_reminder'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                {sending ? <><div className="spinner" /> Sending...</> : '📢 Broadcast Now'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>📋 Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Send Compliance Reminder', icon: '⚠️', color: 'var(--clr-amber-400)',
                  action: () => {
                    setBroadcast({ title: '⚠️ Compliance Reminder', message: 'Please ensure all sustainability logs are up to date by end of week.', type: 'compliance_alert', department_id: '' });
                    toast.info('Template loaded', 'Edit and send the compliance reminder.');
                  }
                },
                { label: 'Monthly CSR Nudge', icon: '🤝', color: 'var(--clr-green-400)',
                  action: () => {
                    setBroadcast({ title: '🤝 CSR Activity This Month', message: "Don't forget to log your CSR and volunteer activities for this month!", type: 'csr_reminder', department_id: '' });
                    toast.info('Template loaded', 'Edit and send the CSR reminder.');
                  }
                },
                { label: 'Policy Announcement', icon: '📋', color: 'var(--clr-blue-400)',
                  action: () => {
                    setBroadcast({ title: '📋 New Sustainability Policy', message: 'We have updated our sustainability policy. Please review the changes in the portal.', type: 'policy_reminder', department_id: '' });
                    toast.info('Template loaded', 'Edit and send the policy announcement.');
                  }
                },
              ].map(qa => (
                <button key={qa.label} onClick={qa.action} className="btn btn-secondary w-full"
                  style={{ justifyContent: 'flex-start', gap: '12px', padding: '14px 16px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{qa.icon}</span>
                  <span style={{ fontWeight: 600, color: qa.color }}>{qa.label}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--txt-muted)' }}>→</span>
                </button>
              ))}
            </div>

            {/* Platform Health */}
            <div className="divider" />
            <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>🏥 Platform Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'API Server', status: 'Operational', color: 'var(--clr-green-400)' },
                { label: 'Database', status: 'Operational', color: 'var(--clr-green-400)' },
                { label: 'Redis Cache', status: 'Operational', color: 'var(--clr-green-400)' },
                { label: 'AI Service', status: 'Operational', color: 'var(--clr-green-400)' },
                { label: 'Scheduler', status: 'Running', color: 'var(--clr-green-400)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)' }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.8rem', color: s.color, fontWeight: 600 }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
