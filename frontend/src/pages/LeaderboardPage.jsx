import React, { useEffect, useState } from 'react';
import { leaderboardsAPI } from '../api/client';
import { useAuthStore } from '../store';

const getLevelIcon = (level) => ({ Bronze:'🥉', Silver:'🥈', Gold:'🥇', Platinum:'💎', Diamond:'💠' }[level] || '🎖️');
const getInitials = (name='') => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('global');
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rankRes] = await Promise.allSettled([leaderboardsAPI.getMyRank()]);
        if (rankRes.status === 'fulfilled') setMyRank(rankRes.value);
        await fetchTab(tab);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const fetchTab = async (t) => {
    setLoading(true);
    try {
      let result;
      if (t === 'global') result = (await leaderboardsAPI.getGlobal({ limit: 50 })).leaderboard;
      else if (t === 'monthly') result = (await leaderboardsAPI.getMonthly({ limit: 50 })).leaderboard;
      else result = (await leaderboardsAPI.getDepartment()).leaderboard;
      setData(result || []);
    } catch (e) { setData([]); }
    setLoading(false);
  };

  const switchTab = (t) => { setTab(t); fetchTab(t); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* My Rank Banner */}
      {myRank && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)',
          border: '1px solid rgba(251,191,36,0.25)', borderRadius: '16px', padding: '20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>Your Global Ranking</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--clr-amber-400)' }}>
                #{myRank.rank}
              </span>
              <span style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>of {myRank.total_users} employees</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Total XP', value: myRank.xp_total?.toLocaleString() },
              { label: 'Percentile', value: `Top ${myRank.percentile}%` },
              { label: 'Level', value: myRank.level?.name },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-amber-400)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'global', label: '🌍 Global', desc: 'All time XP' },
          { key: 'monthly', label: '📅 Monthly', desc: 'This month' },
          { key: 'department', label: '🏢 Departments', desc: 'Team ranking' },
        ].map(({ key, label, desc }) => (
          <button key={key} onClick={() => switchTab(key)} className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Top 3 Podium */}
        {!loading && data.length >= 3 && tab !== 'department' && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px', padding: '32px 24px 24px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          }}>
            {/* 2nd */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 8px', background: 'linear-gradient(135deg,#c0c0c0,#94a3b8)' }}>
                {getInitials(data[1]?.name)}
              </div>
              <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🥈</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }} className="truncate" title={data[1]?.name}>{data[1]?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{data[1]?.xp_total?.toLocaleString() || data[1]?.monthly_xp?.toLocaleString()} XP</div>
            </div>
            {/* 1st */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="avatar avatar-xl" style={{ margin: '0 auto 8px', background: 'linear-gradient(135deg,#ffd700,#f59e0b)', boxShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
                  {getInitials(data[0]?.name)}
                </div>
                <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem' }}>👑</span>
              </div>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🥇</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{data[0]?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-amber-400)', fontWeight: 600 }}>{data[0]?.xp_total?.toLocaleString() || data[0]?.monthly_xp?.toLocaleString()} XP</div>
            </div>
            {/* 3rd */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 8px', background: 'linear-gradient(135deg,#cd7f32,#b45309)' }}>
                {getInitials(data[2]?.name)}
              </div>
              <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🥉</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{data[2]?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{data[2]?.xp_total?.toLocaleString() || data[2]?.monthly_xp?.toLocaleString()} XP</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-page" style={{ minHeight: '300px' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>{tab === 'department' ? 'Department' : 'Employee'}</th>
                  {tab !== 'department' && <th>Level</th>}
                  <th>{tab === 'monthly' ? 'Monthly XP' : tab === 'department' ? 'ESG Score' : 'Total XP'}</th>
                  {tab === 'global' && <th>ESG Score</th>}
                  {tab === 'department' && <th>Members</th>}
                  {tab === 'global' && <th>Carbon Saved</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const isMe = row.user_id === user?.id || row.id === user?.id;
                  return (
                    <tr key={row.id || row.user_id} className={`leaderboard-row ${isMe ? 'is-current-user' : ''}`}>
                      <td>
                        <div className={`rank-badge rank-${row.rank <= 3 ? row.rank : 'other'}`}>
                          {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : row.rank}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {tab === 'department' ? (
                            <span style={{ fontSize: '1.25rem' }}>{row.icon}</span>
                          ) : (
                            <div className="avatar" style={{ background: isMe ? 'var(--grad-brand)' : undefined }}>
                              {getInitials(row.name)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {row.name} {isMe && <span className="tag tag-green" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>YOU</span>}
                            </div>
                            {row.department?.name && <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{row.department.name}</div>}
                          </div>
                        </div>
                      </td>
                      {tab !== 'department' && (
                        <td><span style={{ fontSize: '0.875rem' }}>{getLevelIcon(row.level_name)} {row.level_name}</span></td>
                      )}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--clr-amber-400)' }}>
                          {tab === 'monthly' ? row.monthly_xp?.toLocaleString() :
                           tab === 'department' ? `${row.esg_score?.toFixed(1)}/100` :
                           row.xp_total?.toLocaleString()}
                        </span>
                      </td>
                      {tab === 'global' && (
                        <td><span style={{ color: 'var(--clr-green-400)', fontWeight: 600 }}>{row.esg_score?.toFixed(1)}</span></td>
                      )}
                      {tab === 'department' && (
                        <td><span style={{ color: 'var(--txt-secondary)' }}>{row.member_count}</span></td>
                      )}
                      {tab === 'global' && (
                        <td><span style={{ color: 'var(--clr-blue-400)' }}>{row.carbon_saved_kg?.toFixed(1)} kg</span></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">🏆</div><div className="empty-state-title">No data yet</div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
