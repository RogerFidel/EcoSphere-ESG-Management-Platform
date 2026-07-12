import React, { useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore, useNotificationStore, useToast } from '../../store';
import { notificationsAPI } from '../../api/client';
import NotificationPanel from '../ui/NotificationPanel';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/leaderboard',  icon: '🏆', label: 'Leaderboard' },
  { to: '/challenges',   icon: '⚔️', label: 'Challenges' },
  { to: '/rewards',      icon: '🎁', label: 'Rewards' },
  { to: '/badges',       icon: '🎖️', label: 'Badges' },
  { to: '/achievements', icon: '⭐', label: 'Achievements' },
  { to: '/ai-insights',  icon: '🤖', label: 'AI Insights' },
];

const getLevelColor = (level) => {
  const colors = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2', Diamond: '#b9f2ff' };
  return colors[level] || '#4ade80';
};

const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export default function AppShell() {
  const { user, logout, isAdmin } = useAuthStore();
  const { notifications, unreadCount, isOpen, setNotifications, togglePanel, closePanel, addNotification } = useNotificationStore();
  const toast = useToast();
  const location = useLocation();
  const sseRef = useRef(null);

  // Load notifications
  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationsAPI.getAll({ limit: 30 });
        setNotifications(data.notifications, data.unread_count);
      } catch (e) { /* silent */ }
    };
    load();
  }, []);

  // SSE connection
  useEffect(() => {
    const token = localStorage.getItem('gq_token');
    if (!token) return;

    const es = new EventSource(`/api/v1/sse?token=${token}`);
    sseRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.payload) {
          addNotification(data.payload);
          toast.info(data.payload.title, data.payload.message);
        }
      } catch (e) { /* ignore */ }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 5s
      setTimeout(() => {
        const newEs = new EventSource(`/api/v1/sse?token=${token}`);
        sseRef.current = newEs;
      }, 5000);
    };

    return () => { es.close(); };
  }, []);

  // Close notif panel on route change
  useEffect(() => { closePanel(); }, [location.pathname]);

  const pageTitles = {
    '/dashboard': 'Dashboard', '/leaderboard': 'Leaderboard', '/challenges': 'Challenges',
    '/rewards': 'Rewards', '/badges': 'Badges', '/achievements': 'Achievements',
    '/profile': 'Profile', '/ai-insights': 'AI Insights', '/admin': 'Admin Panel',
  };
  const pageTitle = pageTitles[location.pathname] || 'GreenQuest';
  const levelColor = getLevelColor(user?.level?.name || user?.level_name);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ fontSize: '1.75rem' }}>🌿</div>
          <span className="sidebar-logo-text">GreenQuest</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="nav-section-label" style={{ marginTop: '16px' }}>Admin</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-item-icon">⚙️</span>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* User Card */}
        <div className="sidebar-user">
          <NavLink to="/profile" className="avatar" title="View Profile">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.name} />
              : getInitials(user?.name)
            }
          </NavLink>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, truncate: true }} className="truncate">{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: levelColor, fontWeight: 600 }}>
              {user?.level?.icon || user?.level_name === 'Diamond' ? '💠' : ''} {user?.level?.name || user?.level_name}
            </div>
          </div>
          <button onClick={logout} className="btn btn-icon btn-secondary btn-sm" title="Logout" style={{ padding: '6px 8px', fontSize: '0.9rem' }}>
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <h1 className="topbar-title">{pageTitle}</h1>
          <div className="topbar-actions">
            {/* XP display */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>XP</span>
              <span style={{
                fontSize: '0.875rem', fontWeight: 700,
                background: 'var(--grad-brand)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {(user?.xp_total || 0).toLocaleString()}
              </span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={togglePanel}
                className="btn btn-icon btn-secondary"
                style={{ position: 'relative' }}
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: 'var(--clr-rose-500)', color: '#fff',
                    fontSize: '0.6875rem', fontWeight: 700, borderRadius: '999px',
                    padding: '1px 5px', minWidth: '16px', textAlign: 'center',
                    lineHeight: '1.4',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {isOpen && <NotificationPanel />}
            </div>

            {/* Profile link */}
            <NavLink to="/profile" className="avatar" style={{ textDecoration: 'none' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt={user.name} />
                : getInitials(user?.name)
              }
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container animate-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
