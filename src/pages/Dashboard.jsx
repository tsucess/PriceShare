import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';

const dummyPosts = [
  { id: 1, product: 'Garri (1kg)', price: '₦800', location: 'Mile 12 Market, Lagos', image: 'https://placehold.co/300x200/0f0f1f/00e676?text=Garri', date: 'March 8, 2026', likes: 24, comments: 5 },
  { id: 2, product: 'Tomatoes (basket)', price: '₦3,500', location: 'Bodija Market, Ibadan', image: 'https://placehold.co/300x200/0f0f1f/00e676?text=Tomatoes', date: 'March 7, 2026', likes: 18, comments: 3 },
  { id: 3, product: 'Chicken (1kg)', price: '₦2,800', location: 'Wuse Market, Abuja', image: 'https://placehold.co/300x200/0f0f1f/00e676?text=Chicken', date: 'March 6, 2026', likes: 31, comments: 8 },
];

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('posts');
  const [liked, setLiked] = useState({});

  const handleLike = (id) => {
    const isLiked = liked[id];
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast(isLiked ? 'Like removed' : 'Post liked! ❤️', isLiked ? 'info' : 'success');
  };

  const filteredPosts = dummyPosts.filter((post) => {
    if (activeTab === 'liked') return liked[post.id];
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Dashboard</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
                Welcome back, <span style={{ color: theme.accent }}>Chidi</span> 👋
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>
                You've submitted <span style={{ color: theme.accent, fontWeight: 600 }}>3 price reports</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/post')}
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                color: '#0a0a0f', padding: '11px 20px', borderRadius: '10px',
                fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer',
                boxShadow: `0 4px 16px ${theme.accent}40`, whiteSpace: 'nowrap'
              }}
            >+ New Post</button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '📸', value: '3', label: 'Posts Submitted', color: theme.accent },
            { icon: '❤️', value: '73', label: 'Total Likes', color: '#ff4d6d' },
            { icon: '💬', value: '16', label: 'Comments', color: '#00b0ff' },
            { icon: '📍', value: '3', label: 'Locations', color: '#ffd600' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              borderRadius: '14px', padding: '16px',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
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
              {tab === 'posts' ? 'My Posts' : 'Liked Posts'}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
              <p style={{ fontWeight: 600, color: theme.textMuted }}>No liked posts yet</p>
              <p style={{ fontSize: '13px', color: theme.textDim, marginTop: '6px' }}>Go to the feed and like some posts!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} style={{
                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s',
              }}>
                <div style={{ position: 'relative' }}>
                  <img src={post.image} alt={post.product} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.7) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>{post.price}</div>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>{post.product}</h3>
                  </div>
                  <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '3px' }}>📍 {post.location}</p>
                  <p style={{ fontSize: '11px', color: theme.textDim, marginBottom: '12px' }}>🗓️ {post.date}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleLike(post.id)} style={{
                      flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${liked[post.id] ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`,
                      background: liked[post.id] ? 'rgba(255,77,109,0.1)' : 'transparent',
                      color: liked[post.id] ? '#ff4d6d' : theme.textMuted, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      {liked[post.id] ? '❤️' : '🤍'} {liked[post.id] ? post.likes + 1 : post.likes}
                    </button>
                    <button style={{
                      flex: 1, padding: '9px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                      border: `1px solid ${theme.cardBorder}`, background: 'transparent',
                      color: theme.textMuted, cursor: 'pointer'
                    }}>💬 {post.comments}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;