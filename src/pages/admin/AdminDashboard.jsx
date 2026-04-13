import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { adminGetStats } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Users, FileText, MessageSquare, AlertTriangle, Bell, TrendingUp, EyeOff } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, onClick }) {
  const theme = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.card, border: `1px solid ${theme.cardBorder}`,
        borderTop: `3px solid ${color}`, borderRadius: '14px', padding: '20px',
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 900, color }}>{value?.toLocaleString() ?? '—'}</div>
    </div>
  );
}

function AdminDashboard() {
  const theme = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(r => setStats(r.data))
      .catch(() => showToast('Could not load admin stats.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const cardStyle = { background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '14px', padding: '20px' };
  const tableHead = { fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px' };
  const tableCell = { fontSize: '13px', color: theme.text, padding: '10px 12px', borderTop: `1px solid ${theme.cardBorder}` };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 24px', overflowX: 'hidden' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Panel</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: theme.text, margin: 0 }}>Overview</h1>
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>Platform-wide statistics and recent activity</p>
        </div>

        {loading ? (
          <div style={{ color: theme.textMuted, fontSize: '14px' }}>Loading stats…</div>
        ) : (
          <>
            {/* Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <StatCard icon={Users}         label="Total Users"      value={stats?.total_users}         color="#00e676" onClick={() => navigate('/admin/users')} />
              <StatCard icon={FileText}      label="Total Posts"      value={stats?.total_posts}         color="#00b0ff" onClick={() => navigate('/admin/posts')} />
              <StatCard icon={MessageSquare} label="Comments"         value={stats?.total_comments}      color="#a855f7" onClick={() => navigate('/admin/comments')} />
              <StatCard icon={AlertTriangle} label="Flagged Posts"    value={stats?.flagged_posts}       color="#ff4d6d" onClick={() => navigate('/admin/posts')} />
              <StatCard icon={EyeOff}        label="Hidden Posts"     value={stats?.hidden_posts}        color="#ff6e40" onClick={() => navigate('/admin/posts')} />
              <StatCard icon={Users}         label="Banned Users"     value={stats?.banned_users}        color="#ffd600" onClick={() => navigate('/admin/users')} />
              <StatCard icon={EyeOff}        label="Shadow Banned"    value={stats?.shadow_banned_users} color="#ffd600" onClick={() => navigate('/admin/users')} />
              <StatCard icon={Bell}          label="Active Alerts"    value={stats?.active_alerts}       color="#ff6e40" onClick={() => navigate('/admin/alerts')} />
              <StatCard icon={TrendingUp}    label="New Users Today"  value={stats?.new_users_today}     color="#69f0ae" />
              <StatCard icon={FileText}      label="New Posts Today"  value={stats?.new_posts_today}     color="#00b0ff" />
            </div>

            {/* Recent Users + Recent Posts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Recent Users */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>🆕 Recent Users</h3>
                  <button onClick={() => navigate('/admin/users')} style={{ fontSize: '12px', color: theme.accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>View All →</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={tableHead}>Name</th>
                    <th style={tableHead}>State</th>
                    <th style={tableHead}>Role</th>
                  </tr></thead>
                  <tbody>
                    {(stats?.recent_users ?? []).map(u => (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/users`)}>
                        <td style={tableCell}>{u.name}</td>
                        <td style={tableCell}>{u.state || '—'}</td>
                        <td style={tableCell}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: u.role === 'admin' ? `${theme.accent}20` : `${theme.cardBorder}`, color: u.role === 'admin' ? theme.accent : theme.textMuted }}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Posts */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>📦 Recent Posts</h3>
                  <button onClick={() => navigate('/admin/posts')} style={{ fontSize: '12px', color: theme.accent, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>View All →</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <th style={tableHead}>Product</th>
                    <th style={tableHead}>State</th>
                    <th style={tableHead}>Flagged</th>
                  </tr></thead>
                  <tbody>
                    {(stats?.recent_posts ?? []).map(p => (
                      <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/posts')}>
                        <td style={tableCell}>{p.product}</td>
                        <td style={tableCell}>{p.state}</td>
                        <td style={tableCell}>
                          {p.is_flagged
                            ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff4d6d' }}>🚩 Flagged</span>
                            : <span style={{ fontSize: '11px', color: theme.textMuted }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top States + Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>📍 Top States by Posts</h3>
                {(stats?.top_states ?? []).map((s, i) => (
                  <div key={s.state} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                    <span style={{ fontSize: '13px', color: theme.text }}>{i + 1}. {s.state}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: theme.accent }}>{s.count}</span>
                  </div>
                ))}
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>🏷️ Top Categories</h3>
                {(stats?.top_categories ?? []).map((c, i) => (
                  <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                    <span style={{ fontSize: '13px', color: theme.text }}>{i + 1}. {c.category}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#00b0ff' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
