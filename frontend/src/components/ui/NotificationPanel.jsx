import React, { useEffect, useRef } from 'react';
import { useNotificationStore } from '../../store';
import { notificationsAPI } from '../../api/client';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  badge_unlock: '🏆', reward_approved: '🎁', reward_delivered: '🎁',
  challenge_invite: '⚔️', challenge_reminder: '⏰', challenge_completed: '🎉',
  xp_milestone: '⭐', level_up: '🚀', streak_milestone: '🔥',
  compliance_alert: '⚠️', policy_reminder: '📋', csr_reminder: '🤝',
  ai_insight: '🤖', department_rank_change: '📊', general: '🔔',
};

export default function NotificationPanel() {
  const { notifications, unreadCount, markRead, markAllRead, closePanel } = useNotificationStore();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) closePanel(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    markRead(id);
    try { await notificationsAPI.markRead(id); } catch (e) { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    try { await notificationsAPI.markAllRead(); } catch (e) { /* silent */ }
  };

  return (
    <div ref={ref} className="notif-panel animate-scale" role="dialog" aria-label="Notifications">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--clr-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--clr-rose-500)', color: '#fff',
              fontSize: '0.6875rem', fontWeight: 700, borderRadius: '999px',
              padding: '1px 6px',
            }}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-title">All caught up!</div>
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              role="button"
              tabIndex={0}
            >
              <div className="notif-icon" style={{ background: `${notif.color || '#4ade80'}1a` }}>
                {notif.icon || TYPE_ICONS[notif.type] || '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '2px' }}>{notif.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', lineHeight: 1.4 }} className="truncate">
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: '4px' }}>
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </div>
              </div>
              {!notif.is_read && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: notif.color || 'var(--clr-green-400)',
                  flexShrink: 0, marginTop: '4px',
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
