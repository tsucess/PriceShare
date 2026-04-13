import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, MessageSquare, Bell, ArrowLeft, Shield, Tag } from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: 'Overview',    path: '/admin' },
  { icon: Users,           label: 'Users',        path: '/admin/users' },
  { icon: FileText,        label: 'Posts',        path: '/admin/posts' },
  { icon: MessageSquare,   label: 'Comments',     path: '/admin/comments' },
  { icon: Bell,            label: 'Alerts',       path: '/admin/alerts' },
  { icon: Tag,             label: 'Categories',   path: '/admin/categories' },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '220px', background: theme.sidebar, borderRight: `1px solid ${theme.sidebarBorder}`,
          display: 'flex', flexDirection: 'column', padding: '24px 16px',
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
          overflowY: 'auto', transition: 'all 0.3s',
        }}
      >
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ marginBottom: '24px', paddingLeft: '12px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color={theme.accent} />
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase' }}>
              Admin
            </div>
          </div>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
            PriceShare
          </div>
        </div>

        {/* Back to app */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '12px', color: theme.textMuted, border: `1px solid ${theme.cardBorder}` }}
        >
          <ArrowLeft size={13} /> Back to App
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {adminNav.map(item => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                  borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
                  fontWeight: active ? 700 : 400,
                  background: active ? theme.navActive : 'transparent',
                  color: active ? theme.navActiveText : theme.navText,
                  borderLeft: `2px solid ${active ? theme.navActiveBorder : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div style={{ padding: '12px', background: `${theme.accent}10`, borderRadius: '10px', border: `1px solid ${theme.accent}30` }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: theme.accent, marginBottom: '2px' }}>🛡️ {user?.name || 'Admin'}</div>
          <div style={{ fontSize: '10px', color: theme.textMuted }}>Admin User</div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div
        className="mobile-topbar"
        style={{
          display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: theme.sidebar, borderBottom: `1px solid ${theme.sidebarBorder}`,
          padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color={theme.accent} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: theme.accent }}>Admin Panel</span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <ArrowLeft size={13} /> App
        </button>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div
        className="mobile-bottomnav"
        style={{
          display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: theme.sidebar, borderTop: `1px solid ${theme.sidebarBorder}`,
          paddingTop: '8px', paddingBottom: 'max(12px,env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {adminNav.map(item => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <div key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: '4px 8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: active ? theme.navActive : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? theme.navActiveText : theme.navText }}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: active ? 700 : 400, color: active ? theme.navActiveText : theme.navText }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: flex !important; }
          .mobile-bottomnav { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar    { display: none !important; }
          .mobile-bottomnav { display: none !important; }
          .desktop-sidebar  { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default AdminSidebar;
