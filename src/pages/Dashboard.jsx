import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getUserPosts, likePost, votePost, deletePost } from '../services/api';
import Sidebar from '../components/Sidebar';
import BottomSheet from '../components/BottomSheet';
import HapticButton from '../components/HapticButton';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import SkeletonCard, { SkeletonStat } from '../components/SkeletonCard';


function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function StatCard({ icon, target, label, color }) {
  const value = useCountUp(target);
  const theme = useTheme();
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function EmptyState({ tab, onAction, theme }) {
  const isLiked = tab === 'liked';
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
    }}>
      {/* Illustration circle */}
      <div style={{
        width: '120px', height: '120px', borderRadius: '50%',
        background: isLiked ? 'rgba(255,77,109,0.08)' : `${theme.accent}10`,
        border: isLiked ? '2px dashed rgba(255,77,109,0.3)' : `2px dashed ${theme.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '52px', marginBottom: '24px',
      }}>
        {isLiked ? '🤍' : '📭'}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
        {isLiked ? 'No liked posts yet' : 'No posts yet'}
      </h3>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: 1.7, maxWidth: '260px', margin: '0 0 28px' }}>
        {isLiked
          ? 'Posts you like will appear here. Go explore the feed and tap ❤️ on prices that matter to you.'
          : "You haven't submitted any price reports yet. Help Nigerians shop smarter!"}
      </p>

      <HapticButton
        onClick={onAction}
        style={{
          padding: '13px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
          background: isLiked
            ? 'rgba(255,77,109,0.1)'
            : `linear-gradient(135deg, ${theme.accent}, #00c853)`,
          color: isLiked ? '#ff4d6d' : '#0a0a0f',
          border: isLiked ? '1px solid rgba(255,77,109,0.3)' : 'none',
          boxShadow: isLiked ? 'none' : `0 4px 16px ${theme.accent}40`,
        }}
      >
        {isLiked ? '❤️ Browse the Feed' : '📸 Submit a Price'}
      </HapticButton>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(localStorage.getItem('pw-profile-complete') === 'true');
  const [activeTab, setActiveTab] = useState('posts');
  const [liked, setLiked] = useState({});
  const [votes, setVotes] = useState({});
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total_posts: 0, total_users: 0, avg_price: 0 });
  const [bottomSheetPost, setBottomSheetPost] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [postsRes, dashRes] = await Promise.all([
        getUserPosts(user.id),
        getDashboard(),
      ]);
      const postsData = postsRes.data?.data ?? postsRes.data ?? [];
      setPosts(postsData);
      setStats(dashRes.data ?? {});
    } catch {
      showToast('Could not load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLike = async (id) => {
    const isLiked = liked[id];
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast(isLiked ? 'Like removed' : 'Post liked! ❤️', isLiked ? 'info' : 'success');
    try { await likePost(id); } catch { setLiked((prev) => ({ ...prev, [id]: isLiked })); }
  };

  const handleVote = async (id, type) => {
    const current = votes[id];
    const next = current === type ? null : type;
    setVotes((p) => ({ ...p, [id]: next }));
    showToast(next === 'confirm' ? 'Price confirmed! 👍' : next === 'deny' ? 'Price flagged! 👎' : 'Vote removed', next === 'confirm' ? 'success' : next === 'deny' ? 'warning' : 'info');
    try { await votePost(id, next ?? 'remove'); } catch { setVotes((p) => ({ ...p, [id]: current })); }
  };

  const handleBottomSheetComment = (id) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
      showToast('Post deleted 🗑️', 'info');
    } catch {
      showToast('Could not delete post.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'liked') return liked[post.id];
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Dashboard</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
                Welcome back, <span style={{ color: theme.accent }}>{user?.name?.split(' ')[0] || 'User'}</span> 👋
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                You've submitted <span style={{ color: theme.accent, fontWeight: 600 }}>{posts.length} price report{posts.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <HapticButton
              onClick={() => navigate('/post')}
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                color: '#0a0a0f', padding: '11px 20px', borderRadius: '10px',
                fontWeight: 800, fontSize: '13px', border: 'none',
                boxShadow: `0 4px 16px ${theme.accent}40`, whiteSpace: 'nowrap',
              }}
            >+ New Post</HapticButton>
          </div>
        </div>

        {/* COMPLETE PROFILE BANNER */}
        {!profileComplete && (
          <div style={{
            background: `linear-gradient(135deg, ${theme.accent}15, #00b0ff10)`,
            border: `1px solid ${theme.accent}30`,
            borderRadius: '14px', padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '28px', flexShrink: 0 }}>👤</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 2px' }}>Complete your profile</p>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Add your photo, bio and location so others can trust your reports.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <HapticButton
                onClick={() => navigate('/profile')}
                style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none' }}
              >Set Up</HapticButton>
              <HapticButton
                onClick={() => { localStorage.setItem('pw-profile-complete', 'true'); setProfileComplete(true); }}
                style={{ padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}
              >Later</HapticButton>
            </div>
          </div>
        )}

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {loading ? (
            <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
          ) : (
            <>
              <StatCard icon="📸" target={posts.length}             label="Posts Submitted" color={theme.accent} />
              <StatCard icon="👥" target={stats.total_users ?? 0}   label="Total Users"     color="#ff4d6d" />
              <StatCard icon="📊" target={stats.total_posts ?? 0}   label="Total Reports"   color="#00b0ff" />
              <StatCard icon="₦"  target={Math.round(stats.avg_price ?? 0)} label="Avg Price"  color="#ffd600" />
            </>
          )}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: theme.card, padding: '4px', borderRadius: '10px', border: `1px solid ${theme.cardBorder}` }}>
          {['posts', 'liked'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab ? (theme.dark ? '#1e1e2e' : '#f0f0f8') : 'transparent',
              color: activeTab === tab ? theme.accent : theme.textMuted,
            }}>
              {tab === 'posts' ? '📸 My Posts' : '❤️ Liked Posts'}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              tab={activeTab}
              theme={theme}
              onAction={() => activeTab === 'liked' ? navigate('/feed') : navigate('/post')}
            />
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={post.image_url || post.image || 'https://placehold.co/400x160?text=No+Image'} alt={post.product} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                    ₦{Number(post.price).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '14px' }}>
                  {/* CONFIRM DELETE PROMPT */}
                  {confirmDelete === post.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}
                    >
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d6d', margin: '0 0 4px' }}>🗑️ Delete this post?</p>
                      <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 12px', lineHeight: 1.5 }}>This cannot be undone. All likes, votes and comments will be lost.</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <HapticButton
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: '#ff4d6d', color: '#fff', border: 'none' }}
                        >{deletingId === post.id ? '⏳...' : 'Yes, Delete'}</HapticButton>
                        <HapticButton
                          onClick={() => setConfirmDelete(null)}
                          style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}
                        >Cancel</HapticButton>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>{post.product}</h3>
                        <HapticButton
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(post.id); }}
                          style={{ padding: '5px', borderRadius: '7px', border: '1px solid rgba(255,77,109,0.3)', background: 'transparent', color: '#ff4d6d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px' }}
                        ><Trash2 size={13} /></HapticButton>
                      </div>
                      <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '3px' }}>📍 {post.market || post.location}, {post.state}</p>
                      <p style={{ fontSize: '11px', color: theme.textDim, marginBottom: '12px' }}>🗓️ {post.created_at ? new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : post.date}</p>
                    </>
                  )}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    {/* LIKE + COMMENT */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <HapticButton
                        onClick={() => handleLike(post.id)}
                        style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: `1px solid ${liked[post.id] ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`, background: liked[post.id] ? 'rgba(255,77,109,0.1)' : 'transparent', color: liked[post.id] ? '#ff4d6d' : theme.textMuted }}
                      >
                        {liked[post.id] ? '❤️' : '🤍'} {(post.likes_count ?? 0) + (liked[post.id] ? 1 : 0)}
                      </HapticButton>
                      <HapticButton
                        onClick={() => setBottomSheetPost(post)}
                        style={{ flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}
                      >
                        💬 {post.comments_count ?? 0}
                      </HapticButton>
                    </div>
                    {/* CONFIRM / DENY */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>Price accurate?</span>
                      <HapticButton
                        onClick={() => handleVote(post.id, 'confirm')}
                        style={{ flex: 1, padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, border: `1px solid ${votes[post.id] === 'confirm' ? 'rgba(0,230,118,0.5)' : theme.cardBorder}`, background: votes[post.id] === 'confirm' ? 'rgba(0,230,118,0.12)' : 'transparent', color: votes[post.id] === 'confirm' ? '#00e676' : theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <ThumbsUp size={14} /> {(post.confirms_count ?? 0) + (votes[post.id] === 'confirm' ? 1 : 0)}
                      </HapticButton>
                      <HapticButton
                        onClick={() => handleVote(post.id, 'deny')}
                        style={{ flex: 1, padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, border: `1px solid ${votes[post.id] === 'deny' ? 'rgba(255,77,109,0.5)' : theme.cardBorder}`, background: votes[post.id] === 'deny' ? 'rgba(255,77,109,0.12)' : 'transparent', color: votes[post.id] === 'deny' ? '#ff4d6d' : theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <ThumbsDown size={14} /> {(post.denies_count ?? 0) + (votes[post.id] === 'deny' ? 1 : 0)}
                      </HapticButton>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <BottomSheet
          isOpen={!!bottomSheetPost}
          onClose={() => setBottomSheetPost(null)}
          post={bottomSheetPost}
          onAddComment={(id) => handleBottomSheetComment(id)}
        />

      </main>
    </div>
  );
}

export default Dashboard;