import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import BottomSheet from '../components/BottomSheet';
import HapticButton from '../components/HapticButton';
import SkeletonCard, { SkeletonStat } from '../components/SkeletonCard';

const dummyPosts = [
  {
    id: 1,
    product: 'Garri (1kg)',
    price: 800,
    location: 'Mile 12 Market',
    state: 'Lagos',
    category: 'Food & Groceries',
    image: 'https://images.unsplash.com/photo-1621956838481-5b13ab190fc1?w=600&q=80',
    date: 'March 8, 2026',
    user: 'Chidi O.',
    likes: 24,
    comments: ['Great find!', 'Cheaper than my area'],
  },
  {
    id: 2,
    product: 'Tomatoes (basket)',
    price: 3500,
    location: 'Bodija Market',
    state: 'Oyo',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
    date: 'March 7, 2026',
    user: 'Chidi O.',
    likes: 18,
    comments: ['Wow so expensive!'],
  },
  {
    id: 3,
    product: 'Chicken (1kg)',
    price: 2800,
    location: 'Wuse Market',
    state: 'Abuja',
    category: 'Meat & Poultry',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80',
    date: 'March 6, 2026',
    user: 'Chidi O.',
    likes: 31,
    comments: [],
  },
];

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
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [liked, setLiked] = useState({});
  const [posts, setPosts] = useState(dummyPosts);
  const [bottomSheetPost, setBottomSheetPost] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleLike = (id) => {
    const isLiked = liked[id];
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast(isLiked ? 'Like removed' : 'Post liked! ❤️', isLiked ? 'info' : 'success');
  };

  const handleBottomSheetComment = (id, text) => {
    setPosts((prev) => prev.map((post) => post.id === id ? { ...post, comments: [...post.comments, text] } : post));
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
                Welcome back, <span style={{ color: theme.accent }}>Chidi</span> 👋
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                You've submitted <span style={{ color: theme.accent, fontWeight: 600 }}>3 price reports</span>
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

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {loading ? (
            <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
          ) : (
            <>
              <StatCard icon="📸" target={3}  label="Posts Submitted" color={theme.accent} />
              <StatCard icon="❤️" target={73} label="Total Likes"     color="#ff4d6d" />
              <StatCard icon="💬" target={16} label="Comments"        color="#00b0ff" />
              <StatCard icon="📍" target={3}  label="Locations"       color="#ffd600" />
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
                  <img src={post.image} alt={post.product} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                    ₦{post.price.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: '0 0 6px' }}>{post.product}</h3>
                  <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '3px' }}>📍 {post.location}, {post.state}</p>
                  <p style={{ fontSize: '11px', color: theme.textDim, marginBottom: '12px' }}>🗓️ {post.date}</p>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <HapticButton
                      onClick={() => handleLike(post.id)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                        border: `1px solid ${liked[post.id] ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`,
                        background: liked[post.id] ? 'rgba(255,77,109,0.1)' : 'transparent',
                        color: liked[post.id] ? '#ff4d6d' : theme.textMuted,
                      }}
                    >
                      {liked[post.id] ? '❤️' : '🤍'} {liked[post.id] ? post.likes + 1 : post.likes}
                    </HapticButton>
                    <HapticButton
                      onClick={() => setBottomSheetPost(post)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                        border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted,
                      }}
                    >
                      💬 {post.comments.length}
                    </HapticButton>
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
          onAddComment={handleBottomSheetComment}
        />

      </main>
    </div>
  );
}

export default Dashboard;