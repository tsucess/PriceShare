import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { adminListComments, adminDeleteComment } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import HapticButton from '../../components/HapticButton';
import { Search, Trash2 } from 'lucide-react';

function AdminComments() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [postId, setPostId]     = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchComments = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search  = search;
    if (postId) params.post_id = postId;
    adminListComments(params)
      .then(r => setComments(r.data?.data ?? r.data ?? []))
      .catch(() => showToast('Could not load comments.', 'error'))
      .finally(() => setLoading(false));
  }, [search, postId, showToast]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    setActionId(id);
    try {
      await adminDeleteComment(id);
      showToast('Comment deleted.', 'success');
      fetchComments();
    } catch {
      showToast('Could not delete comment.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const inputStyle = { padding: '10px 14px', borderRadius: '10px', fontSize: '13px', border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, outline: 'none' };
  const thStyle = { fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${theme.cardBorder}`, whiteSpace: 'nowrap' };
  const tdStyle = { fontSize: '13px', color: theme.text, padding: '12px 14px', borderBottom: `1px solid ${theme.cardBorder}`, verticalAlign: 'middle' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex: 1, overflowX: 'hidden' }}>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Panel</div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: theme.text, margin: 0 }}>Comment Moderation</h1>
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>
            {loading ? 'Loading…' : `${Array.isArray(comments) ? comments.length : 0} comments`}
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comment text…" style={{ ...inputStyle, paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <input
            value={postId}
            onChange={e => setPostId(e.target.value)}
            placeholder="Filter by Post ID…"
            type="number"
            min="1"
            style={{ ...inputStyle, width: '160px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Table */}
        <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Comment</th>
                <th style={thStyle}>By</th>
                <th style={thStyle}>On Post</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: theme.textMuted }}>Loading comments…</td></tr>
              ) : (Array.isArray(comments) ? comments : []).length === 0 ? (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: theme.textMuted }}>No comments found.</td></tr>
              ) : (
                (Array.isArray(comments) ? comments : []).map(c => (
                  <tr key={c.id}>
                    <td style={{ ...tdStyle, maxWidth: '300px' }}>
                      <div style={{ lineHeight: 1.6, wordBreak: 'break-word' }}>{c.body}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700 }}>{c.user?.name || '—'}</div>
                      {c.user?.email && <div style={{ fontSize: '11px', color: theme.textMuted }}>{c.user.email}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: theme.accent }}>
                        {c.post?.product || `Post #${c.post_id}`}
                      </div>
                      {c.post?.state && <div style={{ fontSize: '11px', color: theme.textMuted }}>{c.post.state}</div>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={tdStyle}>
                      <HapticButton onClick={() => handleDelete(c.id)} disabled={actionId === c.id} style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.08)', color: '#ff4d6d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={12} /> {actionId === c.id ? '⏳' : 'Delete'}
                      </HapticButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminComments;
