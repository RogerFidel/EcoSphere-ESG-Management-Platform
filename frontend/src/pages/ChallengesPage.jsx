import React, { useEffect, useState } from 'react';
import { challengesAPI } from '../api/client';
import { useAuthStore } from '../store';
import { useToast } from '../store';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

const CAT_COLORS = { sustainability:'#4ade80', energy:'#fbbf24', waste:'#34d399', transport:'#60a5fa', water:'#22d3ee', csr:'#a78bfa', other:'#94a3b8' };
const CAT_ICONS  = { sustainability:'♻️', energy:'⚡', waste:'🗑️', transport:'🚲', water:'💧', csr:'🤝', other:'🌱' };

export default function ChallengesPage() {
  const { user, isManager } = useAuthStore();
  const toast = useToast();
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', type:'individual', category:'sustainability', xp_reward:100, starts_at:'', ends_at:'', target_value:'', target_unit:'' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await challengesAPI.getAll({ status: filter !== 'all' ? filter : undefined, limit: 30 });
      setChallenges(data.challenges || []);
    } catch (e) { toast.error('Error', e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleJoin = async (id) => {
    try {
      await challengesAPI.join(id);
      toast.success('🎉 Joined!', 'You\'ve joined the challenge. Good luck!');
      load();
    } catch (e) { toast.error('Error', e.message); }
  };

  const handleLeave = async (id) => {
    try {
      await challengesAPI.leave(id);
      toast.info('Left challenge', 'You\'ve left the challenge.');
      load();
    } catch (e) { toast.error('Error', e.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await challengesAPI.create(form);
      toast.success('✅ Challenge Created!', 'Your challenge is now live.');
      setShowCreate(false);
      load();
    } catch (e) { toast.error('Error', e.message); }
    setCreating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>⚔️ Challenges</h2>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Join challenges, earn XP, and make an impact.</p>
        </div>
        {isManager() && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            + Create Challenge
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card animate-in">
          <h3 style={{ marginBottom: '20px' }}>Create New Challenge</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Challenge Title</label>
              <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="E.g. Zero Waste Week" required />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the challenge..." required style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                {['individual','team','department','company'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {Object.keys(CAT_ICONS).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">XP Reward</label>
              <input className="form-input" type="number" min={1} value={form.xp_reward} onChange={e=>setForm({...form,xp_reward:parseInt(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Target Value (optional)</label>
              <input className="form-input" type="number" min={0} value={form.target_value} onChange={e=>setForm({...form,target_value:e.target.value})} placeholder="E.g. 100" />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="datetime-local" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})} required />
            </div>
            <div style={{ gridColumn:'1/-1', display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <button type="button" onClick={()=>setShowCreate(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <><div className="spinner" /> Creating...</> : '🚀 Launch Challenge'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['active','completed','all'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner spinner-lg" /></div>
      ) : challenges.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">⚔️</div><div className="empty-state-title">No challenges found</div><p>Check back soon or create one!</p></div>
      ) : (
        <div className="grid-3">
          {challenges.map(ch => {
            const myPart = ch.challengeParticipants?.[0];
            const isJoined = !!myPart;
            const daysLeft = differenceInDays(new Date(ch.ends_at), new Date());
            const catColor = CAT_COLORS[ch.category] || '#4ade80';
            return (
              <div key={ch.id} className="challenge-card" style={{ '--challenge-color': `linear-gradient(90deg, ${catColor}, ${catColor}88)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.75rem' }}>{CAT_ICONS[ch.category] || '🌱'}</span>
                  <span className={`challenge-status ${ch.status === 'active' ? 'status-active' : ch.status === 'completed' ? 'status-completed' : 'status-draft'}`}>
                    {ch.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: 700 }}>{ch.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--txt-secondary)', marginBottom: '14px', lineHeight: 1.5 }} className="truncate" title={ch.description}>{ch.description}</p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span className="tag" style={{ background: `${catColor}1a`, color: catColor, fontSize: '0.7rem' }}>{ch.type}</span>
                  <span className="tag tag-amber" style={{ fontSize: '0.7rem' }}>+{ch.xp_reward} XP</span>
                  {ch.department?.name && <span className="tag" style={{ fontSize: '0.7rem' }}>🏢 {ch.department.name}</span>}
                </div>

                {isJoined && myPart.progress > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                      <span>Your progress</span><span>{myPart.progress?.toFixed(0)}%</span>
                    </div>
                    <div className="progress-track progress-sm">
                      <div className="progress-fill" style={{ width: `${myPart.progress}%`, '--progress-color': `linear-gradient(90deg, ${catColor}, ${catColor}99)` }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                    {ch.status === 'active' ? (
                      daysLeft > 0 ? `⏳ ${daysLeft}d left` : '⏰ Ending soon'
                    ) : `✅ ${ch.participants_count} participated`}
                  </div>
                  {ch.status === 'active' && (
                    isJoined ? (
                      <button onClick={() => handleLeave(ch.id)} className="btn btn-sm btn-danger">Leave</button>
                    ) : (
                      <button onClick={() => handleJoin(ch.id)} className="btn btn-sm btn-primary">Join →</button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
