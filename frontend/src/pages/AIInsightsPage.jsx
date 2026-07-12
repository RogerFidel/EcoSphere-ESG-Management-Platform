import React, { useEffect, useState } from 'react';
import { aiAPI } from '../api/client';
import { useToast } from '../store';

const TYPE_META = {
  carbon_reduction: { icon:'🌍', color:'#4ade80', label:'Carbon Reduction' },
  esg_insight: { icon:'📊', color:'#60a5fa', label:'ESG Insight' },
  performance_prediction: { icon:'📈', color:'#a78bfa', label:'Performance Prediction' },
  goal_prediction: { icon:'🎯', color:'#fbbf24', label:'Goal Prediction' },
  risk_alert: { icon:'⚠️', color:'#f87171', label:'Risk Alert' },
  personal_score: { icon:'💎', color:'#22d3ee', label:'Personal Score' },
  recommendation: { icon:'💡', color:'#34d399', label:'Recommendations' },
  department_comparison: { icon:'🏢', color:'#a78bfa', label:'Dept Comparison' },
};

const RISK_STYLES = {
  low: { color:'#4ade80', label:'Low Risk' },
  medium: { color:'#fbbf24', label:'Medium Risk' },
  high: { color:'#f87171', label:'High Risk' },
  critical: { color:'#ff1744', label:'Critical!' },
};

export default function AIInsightsPage() {
  const toast = useToast();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState('');
  const [activeInsight, setActiveInsight] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getMyInsights({ limit: 20 });
      setInsights(data.insights || []);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async (type, label) => {
    setGenerating(type);
    try {
      let result;
      if (type === 'carbon_reduction') result = await aiAPI.getCarbonReduction();
      else if (type === 'esg_insight') result = await aiAPI.getESGInsights();
      else if (type === 'personal_score') result = await aiAPI.getPersonalScore();
      else if (type === 'recommendation') result = await aiAPI.getRecommendations();
      else if (type === 'department_comparison') result = await aiAPI.getDepartmentComparison();
      toast.success(`🤖 ${label} Ready!`, 'Your AI insight has been generated.');
      load();
      if (result?.insight) setActiveInsight(result.insight);
    } catch (e) { toast.error('AI Error', e.message); }
    setGenerating('');
  };

  const sendFeedback = async (id, feedback) => {
    try {
      await aiAPI.sendFeedback(id, feedback);
      toast.success('Thanks!', 'Your feedback helps improve AI insights.');
      setInsights(prev => prev.map(i => i.id === id ? { ...i, feedback } : i));
    } catch (e) { /* silent */ }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))',
        border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '28px',
      }}>
        <div className="ai-badge" style={{ marginBottom: '12px' }}>🤖 Powered by GPT-4o</div>
        <h2 style={{ marginBottom: '8px' }}>AI Sustainability Insights</h2>
        <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
          Get personalized AI-powered ESG recommendations, carbon reduction strategies, and performance predictions tailored to your sustainability data.
        </p>
      </div>

      {/* Generate Buttons */}
      <div>
        <h3 style={{ marginBottom: '16px' }}>Generate New Insight</h3>
        <div className="grid-4">
          {[
            { type:'carbon_reduction', label:'Carbon Suggestions', icon:'🌍' },
            { type:'esg_insight', label:'ESG Analysis', icon:'📊' },
            { type:'personal_score', label:'Score Breakdown', icon:'💎' },
            { type:'recommendation', label:'Personalized Plan', icon:'💡' },
          ].map(btn => (
            <button
              key={btn.type}
              onClick={() => generate(btn.type, btn.label)}
              disabled={!!generating}
              className="btn btn-secondary"
              style={{ flexDirection: 'column', gap: '8px', padding: '20px 16px', height: 'auto', alignItems: 'center' }}
            >
              {generating === btn.type ? (
                <><div className="spinner" /><span style={{ fontSize: '0.8rem' }}>Generating...</span></>
              ) : (
                <><span style={{ fontSize: '2rem' }}>{btn.icon}</span><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{btn.label}</span></>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Insights History */}
      <div>
        <h3 style={{ marginBottom: '16px' }}>Your AI Insights ({insights.length})</h3>
        {loading ? (
          <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner spinner-lg" /></div>
        ) : insights.length === 0 ? (
          <div className="empty-state card"><div className="empty-state-icon">🤖</div><div className="empty-state-title">No insights yet</div><p>Generate your first AI insight above!</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {insights.map(insight => {
              const meta = TYPE_META[insight.type] || TYPE_META.esg_insight;
              const riskStyle = RISK_STYLES[insight.risk_level] || RISK_STYLES.low;
              return (
                <div key={insight.id} className="ai-card" onClick={() => setActiveInsight(insight)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: meta.color }}>{meta.label}</span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{insight.title}</h4>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: riskStyle.color, padding: '3px 10px', borderRadius: '999px', background: `${riskStyle.color}15`, border: `1px solid ${riskStyle.color}30` }}>
                        {riskStyle.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{Math.round(insight.confidence_score * 100)}% confidence</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                    {insight.content?.substring(0, 200)}{insight.content?.length > 200 ? '...' : ''}
                  </p>
                  {insight.recommendations?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {insight.recommendations.slice(0, 3).map((r, i) => (
                        <span key={i} className="tag" style={{ fontSize: '0.75rem' }}>
                          {r.action?.substring(0, 40)}{r.action?.length > 40 ? '...' : ''}
                        </span>
                      ))}
                      {insight.recommendations.length > 3 && (
                        <span className="tag" style={{ fontSize: '0.75rem' }}>+{insight.recommendations.length - 3} more</span>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {!insight.feedback && (
                      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Helpful?</span>
                        <button onClick={() => sendFeedback(insight.id, 'helpful')} className="btn btn-sm btn-secondary" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>👍</button>
                        <button onClick={() => sendFeedback(insight.id, 'not_helpful')} className="btn btn-sm btn-secondary" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>👎</button>
                      </div>
                    )}
                    {insight.feedback && (
                      <span style={{ fontSize: '0.75rem', color: insight.feedback === 'helpful' ? 'var(--clr-green-400)' : 'var(--txt-muted)' }}>
                        {insight.feedback === 'helpful' ? '👍 Marked helpful' : '👎 Feedback recorded'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeInsight && (
        <div onClick={e => e.target===e.currentTarget && setActiveInsight(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'24px' }}>
          <div className="card animate-scale" style={{ maxWidth:'600px', width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
              <h3>{activeInsight.title}</h3>
              <button onClick={() => setActiveInsight(null)} style={{ color:'var(--txt-muted)', fontSize:'1.5rem', lineHeight:1 }}>×</button>
            </div>
            <p style={{ color:'var(--txt-secondary)', lineHeight:1.7, marginBottom:'20px' }}>{activeInsight.content}</p>
            {activeInsight.recommendations?.length > 0 && (
              <div>
                <h4 style={{ marginBottom:'12px', color:'var(--clr-green-400)' }}>💡 Recommendations</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {activeInsight.recommendations.map((r, i) => (
                    <div key={i} style={{ padding:'12px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', border:'1px solid var(--clr-border)' }}>
                      <div style={{ fontWeight:600, marginBottom:'4px' }}>{r.action}</div>
                      {r.impact && <div style={{ fontSize:'0.8rem', color:'var(--clr-green-400)' }}>Impact: {r.impact}</div>}
                      {r.carbon_reduction_kg && <div style={{ fontSize:'0.8rem', color:'var(--clr-blue-400)' }}>Carbon: {r.carbon_reduction_kg} kg saved</div>}
                      {r.difficulty && <div style={{ fontSize:'0.8rem', color:'var(--txt-muted)' }}>Difficulty: {r.difficulty}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
