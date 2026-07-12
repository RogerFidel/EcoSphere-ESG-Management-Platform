import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { useToast } from '../store';
import { esgAPI, badgesAPI, usersAPI } from '../api/client';

const ACTION_TEMPLATES = [
  { category:'transport', name:'Cycled to work', carbon:2.5, xp:20, icon:'🚲' },
  { category:'transport', name:'Used public transport', carbon:1.8, xp:20, icon:'🚌' },
  { category:'energy', name:'Switched off unused equipment', carbon:0.5, xp:15, icon:'💡' },
  { category:'energy', name:'Used power-saving mode', carbon:0.3, xp:15, icon:'⚡' },
  { category:'waste', name:'Sorted recycling correctly', carbon:1.2, xp:12, icon:'♻️' },
  { category:'waste', name:'Brought reusable container', carbon:0.8, xp:12, icon:'🥡' },
  { category:'water', name:'Reported a leaky faucet', carbon:0.4, xp:10, icon:'💧' },
  { category:'food', name:'Chose plant-based meal', carbon:3.0, xp:8, icon:'🥗' },
  { category:'carbon', name:'Attended virtual meeting', carbon:45.0, xp:18, icon:'💻' },
  { category:'csr', name:'Community cleanup volunteer', carbon:5.0, xp:15, icon:'🤝' },
];

const getLevelColor = (l) => ({ Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#e5e4e2', Diamond:'#b9f2ff' }[l] || '#4ade80');
const getInitials = (name='') => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

export default function ProfilePage() {
  const { user, refreshUser, isManager } = useAuthStore();
  const toast = useToast();
  const [badges, setBadges] = useState([]);
  const [actions, setActions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, a, s] = await Promise.allSettled([badgesAPI.getAll(), esgAPI.getAll({ limit:10 }), esgAPI.getSummary()]);
        if (b.status==='fulfilled') setBadges(b.value.badges.filter(b=>b.earned).slice(0,8));
        if (a.status==='fulfilled') setActions(a.value.actions || []);
        if (s.status==='fulfilled') setSummary(s.value.summary || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const logAction = async (template) => {
    setLogging(true);
    try {
      await esgAPI.create({
        category: template.category,
        action_name: template.name,
        carbon_impact_kg: template.carbon,
        xp_earned: template.xp,
      });
      toast.success(`✅ Action Logged! +${template.xp} XP`, `${template.name} — You saved ${template.carbon}kg CO₂!`);
      await refreshUser();
      const [a, s] = await Promise.allSettled([esgAPI.getAll({ limit:10 }), esgAPI.getSummary()]);
      if (a.status==='fulfilled') setActions(a.value.actions || []);
      if (s.status==='fulfilled') setSummary(s.value.summary || []);
      setSelectedAction(null);
    } catch (e) { toast.error('Error', e.message); }
    setLogging(false);
  };

  const level = user?.level || { name: user?.level_name || 'Bronze', icon:'🥉', minXP:0, maxXP:499 };
  const levelColor = getLevelColor(level.name);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Profile Hero */}
      <div style={{
        background:'var(--grad-card)', border:'1px solid var(--clr-border)', borderRadius:'20px',
        padding:'32px', display:'flex', gap:'24px', alignItems:'flex-start', flexWrap:'wrap',
      }}>
        <div className="avatar avatar-xl" style={{ background:`${levelColor}30`, color:levelColor, border:`2px solid ${levelColor}44`, flexShrink:0 }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'8px', flexWrap:'wrap' }}>
            <h2 style={{ margin:0 }}>{user?.name}</h2>
            <span className="xp-level-badge" style={{ background:`${levelColor}22`, color:levelColor, border:`1px solid ${levelColor}44` }}>
              {level.icon} {level.name}
            </span>
            {isManager() && <span className="tag tag-blue" style={{ textTransform:'capitalize' }}>{user?.role}</span>}
          </div>
          <div style={{ color:'var(--txt-secondary)', fontSize:'0.875rem', marginBottom:'16px' }}>{user?.email}</div>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[
              { label:'Total XP', value:(user?.xp_total||0).toLocaleString(), icon:'⚡' },
              { label:'ESG Score', value:(user?.esg_score||0).toFixed(1), icon:'📊' },
              { label:'Actions', value:user?.actions_completed||0, icon:'✅' },
              { label:'Carbon Saved', value:`${(user?.carbon_saved_kg||0).toFixed(1)}kg`, icon:'🌍' },
            ].map(s=>(
              <div key={s.label}>
                <div style={{ fontSize:'0.8rem', color:'var(--txt-muted)', marginBottom:'2px' }}>{s.icon} {s.label}</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.25rem' }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* XP Bar */}
          <div style={{ marginTop:'20px', maxWidth:'400px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--txt-muted)', marginBottom:'6px' }}>
              <span>{user?.xp_total?.toLocaleString()} XP</span>
              <span>{user?.level_progress_percent || 0}% to next level</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width:`${user?.level_progress_percent||0}%`, '--progress-color': `linear-gradient(90deg, ${levelColor}, ${levelColor}99)` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Log Action */}
        <div className="card">
          <h3 style={{ marginBottom:'16px' }}>⚡ Log Sustainability Action</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {ACTION_TEMPLATES.map(t=>(
              <button key={t.name} onClick={()=>setSelectedAction(t)}
                className="btn btn-secondary w-full"
                style={{ justifyContent:'flex-start', gap:'12px', padding:'12px 16px', textAlign:'left' }}>
                <span style={{ fontSize:'1.25rem' }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{t.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--txt-muted)' }}>-{t.carbon}kg CO₂</div>
                </div>
                <span className="tag tag-amber" style={{ fontSize:'0.7rem' }}>+{t.xp} XP</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Actions + Earned Badges */}
        <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
          <div className="card">
            <h3 style={{ marginBottom:'16px' }}>📋 Recent Actions</h3>
            {actions.length === 0 ? (
              <div className="empty-state" style={{ padding:'20px' }}>
                <div className="empty-state-icon" style={{ fontSize:'1.5rem' }}>✅</div>
                <p>No actions yet. Log your first action!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {actions.slice(0,8).map(a=>(
                  <div key={a.id} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'8px', borderRadius:'8px', background:'rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize:'1rem' }}>{ACTION_TEMPLATES.find(t=>t.category===a.category)?.icon||'🌱'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:500 }} className="truncate">{a.action_name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--txt-muted)' }}>{new Date(a.performed_at).toLocaleDateString()}</div>
                    </div>
                    <span className="tag tag-amber" style={{ fontSize:'0.7rem' }}>+{a.xp_earned} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom:'16px' }}>🎖️ Earned Badges</h3>
            {badges.length === 0 ? (
              <p style={{ color:'var(--txt-muted)', fontSize:'0.875rem' }}>Complete actions to earn badges!</p>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {badges.map(b=>(
                  <div key={b.id} title={b.name} style={{
                    width:'48px', height:'48px', borderRadius:'10px', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:'1.5rem',
                    background:'rgba(255,255,255,0.05)', border:'1px solid var(--clr-border)',
                    cursor:'default',
                  }}>
                    {b.icon}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Action Modal */}
      {selectedAction && (
        <div onClick={e=>e.target===e.currentTarget&&setSelectedAction(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'24px' }}>
          <div className="card animate-scale" style={{ maxWidth:'380px', width:'100%', textAlign:'center', padding:'40px' }}>
            <div style={{ fontSize:'3.5rem', marginBottom:'16px' }}>{selectedAction.icon}</div>
            <h3 style={{ marginBottom:'8px' }}>{selectedAction.name}</h3>
            <p style={{ color:'var(--txt-secondary)', marginBottom:'20px' }}>Log this sustainability action?</p>
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', justifyContent:'center' }}>
              <div className="tag tag-green">🌍 -{selectedAction.carbon}kg CO₂</div>
              <div className="tag tag-amber">⚡ +{selectedAction.xp} XP</div>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={()=>setSelectedAction(null)} className="btn btn-secondary" style={{ flex:1 }}>Cancel</button>
              <button onClick={()=>logAction(selectedAction)} className="btn btn-primary" style={{ flex:1 }} disabled={logging}>
                {logging ? <><div className="spinner" /> Logging...</> : '✅ Log Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
