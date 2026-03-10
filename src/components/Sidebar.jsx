import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { icon: '⌂', label: 'Dashboard', path: '/dashboard' },
  { icon: '◈', label: 'Feed', path: '/feed' },
  { icon: '+', label: 'Post', path: '/post' },
  { icon: '⇌', label: 'Compare', path: '/compare' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <>
      {/* ======================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ======================== */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '220px', background: theme.sidebar,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          display: 'flex', flexDirection: 'column',
          padding: '32px 16px', position: 'sticky',
          top: 0, height: '100vh', transition: 'all 0.3s', flexShrink: 0,
        }}
      >
        {/* LOGO */}
        <div onClick={() => navigate('/')} style={{ marginBottom: '48px', paddingLeft: '12px', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>PriceWatch</div>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>Nigeria</div>
        </div>

        {/* NAV */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <div key={item.path} onClick={() => navigate(item.path)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: active ? 700 : 400,
                background: active ? theme.navActive : 'transparent',
                color: active ? theme.navActiveText : theme.navText,
                borderLeft: `2px solid ${active ? theme.navActiveBorder : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* PROFILE */}
        <div style={{ padding: '14px', background: theme.profileBg, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e676, #00b0ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#0a0a0f', flexShrink: 0,
          }}>CO</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: theme.text }}>Chidi Okeke</div>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Lagos, NG</div>
          </div>
        </div>
      </aside>

      {/* ======================== */}
      {/* MOBILE TOP BAR */}
      {/* ======================== */}
      <div
        className="mobile-topbar"
        style={{
          display: 'none',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: theme.sidebar, borderBottom: `1px solid ${theme.sidebarBorder}`,
          padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s'
        }}
      >
        {/* LOGO */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase' }}>PriceWatch</div>
          <div style={{ fontSize: '9px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>Nigeria</div>
        </div>

        {/* AVATAR — taps to Settings */}
        <div
          onClick={() => navigate('/settings')}
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e676, #00b0ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#0a0a0f', cursor: 'pointer'
          }}>CO</div>
      </div>

      {/* ======================== */}
      {/* MOBILE BOTTOM NAV */}
      {/* ======================== */}
      <div
        className="mobile-bottomnav"
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: theme.sidebar, borderTop: `1px solid ${theme.sidebarBorder}`,
          padding: '8px 0 12px', transition: 'all 0.3s'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isPost = item.path === '/post';
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px', cursor: 'pointer', padding: '4px 8px',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: isPost ? '48px' : '36px',
                  height: isPost ? '48px' : '36px',
                  borderRadius: isPost ? '14px' : '10px',
                  background: isPost
                    ? `linear-gradient(135deg, ${theme.accent}, #00c853)`
                    : active ? theme.navActive : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isPost ? '22px' : '18px',
                  color: isPost ? '#0a0a0f' : active ? theme.navActiveText : theme.navText,
                  marginTop: isPost ? '-16px' : '0',
                  boxShadow: isPost ? `0 4px 16px ${theme.accent}50` : 'none',
                  border: active && !isPost ? `1px solid ${theme.navActiveBorder}30` : 'none',
                  transition: 'all 0.15s',
                }}>
                  {item.icon}
                </div>
                {!isPost && (
                  <span style={{
                    fontSize: '10px', fontWeight: active ? 700 : 400,
                    color: active ? theme.navActiveText : theme.navText,
                  }}>{item.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottomnav { display: block !important; }
        }
      `}</style>
    </>
  );
}

export default Sidebar;