import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { adminGetStats, adminGetAnalytics, adminListAuditLog } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Users, FileText, MessageSquare, AlertTriangle, Bell, TrendingUp, EyeOff } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

const ACTION_LABELS = {
  ban_user: '🚫 Banned',    unban_user: '✅ Unbanned',
  shadow_ban_user: '👻 Shadow Banned', unshadow_ban_user: '👁 Unsilenced',
  promote_user: '⬆️ Promoted', demote_user: '⬇️ Demoted',
  delete_user: '🗑 Deleted User',
  hide_post: '🙈 Hid Post', unhide_post: '👁 Unhid Post',
  delete_post: '🗑 Deleted Post',
  delete_comment: '🗑 Deleted Comment', flag_post: '🚩 Flagged', unflag_post: '🏳 Unflagged',
};

function AdminDashboard() {
  const theme = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [auditLog, setAuditLog]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      adminGetStats().then(r => setStats(r.data)).catch(() => {}),
      adminGetAnalytics().then(r => setAnalytics(r.data)).catch(() => {}),
      adminListAuditLog({ per_page: 15 }).then(r => setAuditLog(r.data?.data ?? [])).catch(() => {}),
    ])
      .catch(() => showToast('Could not load admin stats.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const cardStyle = { background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '14px', padding: '20px' };
  const tableHead = { fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px' };
  const tableCell = { fontSize: '13px', color: theme.text, padding: '10px 12px', borderTop: `1px solid ${theme.cardBorder}` };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex: 1, overflowX: 'hidden' }}>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
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

            {/* Analytics Charts */}
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>📈 Posts per Day (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.postsPerDay ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
                      <XAxis dataKey="date" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={d => d?.slice(5)} />
                      <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="count" stroke="#00b0ff" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>🏆 Top Products Reported</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.topProducts ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
                      <XAxis type="number" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="product" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#00e676" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>👥 New Users per Day (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.usersPerDay ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
                      <XAxis dataKey="date" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={d => d?.slice(5)} />
                      <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 16px' }}>🗺️ Posts by State (Top 10)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.postsByState ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
                      <XAxis type="number" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="state" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#ffd600" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Audit Log */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>🕵️ Recent Admin Actions</h3>
              </div>
              {auditLog.length === 0 ? (
                <p style={{ color: theme.textMuted, fontSize: '13px' }}>No admin actions recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px' }}>
                    <thead><tr>
                      <th style={tableHead}>Admin</th>
                      <th style={tableHead}>Action</th>
                      <th style={tableHead}>Target</th>
                      <th style={tableHead}>Reason</th>
                      <th style={tableHead}>Time</th>
                    </tr></thead>
                    <tbody>
                      {auditLog.map(log => (
                        <tr key={log.id}>
                          <td style={tableCell}>{log.admin_name}</td>
                          <td style={tableCell}><span style={{ fontWeight: 700, color: theme.accent }}>{ACTION_LABELS[log.action] ?? log.action}</span></td>
                          <td style={tableCell}>{log.target_label ?? `${log.target_type} #${log.target_id}`}</td>
                          <td style={{ ...tableCell, color: theme.textMuted }}>{log.reason || '—'}</td>
                          <td style={{ ...tableCell, color: theme.textMuted, whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
