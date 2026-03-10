import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import SkeletonCard from '../components/SkeletonCard';

const dummyPosts = [
  { id: 1, product: 'Garri (1kg)', price: 800, location: 'Mile 12 Market', state: 'Lagos', category: 'Food & Groceries', image: 'https://placehold.co/400x250/0f0f1f/00e676?text=Garri', date: 'March 8, 2026', user: 'Chidi O.', likes: 24, comments: ['Great find!', 'Cheaper than my area'] },
  { id: 2, product: 'Tomatoes (basket)', price: 3500, location: 'Bodija Market', state: 'Oyo', category: 'Vegetables', image: 'https://placehold.co/400x250/0f0f1f/69f0ae?text=Tomatoes', date: 'March 7, 2026', user: 'Amaka B.', likes: 18, comments: ['Wow so expensive!'] },
  { id: 3, product: 'Chicken (1kg)', price: 2800, location: 'Wuse Market', state: 'Abuja', category: 'Meat & Poultry', image: 'https://placehold.co/400x250/0f0f1f/ff6e40?text=Chicken', date: 'March 6, 2026', user: 'Emeka T.', likes: 31, comments: [] },
  { id: 4, product: 'Rice (50kg bag)', price: 85000, location: 'Kantin Kwari', state: 'Kano', category: 'Food & Groceries', image: 'https://placehold.co/400x250/0f0f1f/ff4d6d?text=Rice', date: 'March 5, 2026', user: 'Fatima M.', likes: 45, comments: ['Report this seller!'] },
  { id: 5, product: 'Petrol (litre)', price: 897, location: 'NNPC Station', state: 'Rivers', category: 'Fuel & Energy', image: 'https://placehold.co/400x250/0f0f1f/ffd600?text=Petrol', date: 'March 4, 2026', user: 'Bola A.', likes: 12, comments: [] },
  { id: 6, product: 'Paracetamol (pack)', price: 500, location: 'Idumota Market', state: 'Lagos', category: 'Healthcare', image: 'https://placehold.co/400x250/0f0f1f/00b0ff?text=Pharma', date: 'March 3, 2026', user: 'Ngozi K.', likes: 9, comments: ['Cheaper at my chemist'] },
];

const categoryColors = {
  'Food & Groceries': '#00e676',
  'Vegetables': '#69f0ae',
  'Meat & Poultry': '#ff6e40',
  'Fuel & Energy': '#ffd600',
  'Healthcare': '#00b0ff',
};

const allStates = ['All States', 'Lagos', 'Oyo', 'Abuja', 'Kano', 'Rivers'];
const allCategories = ['All Categories', 'Food & Groceries', 'Vegetables', 'Meat & Poultry', 'Fuel & Energy', 'Healthcare'];

function Feed() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [commentOpen, setCommentOpen] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [posts, setPosts] = useState(dummyPosts);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('All States');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleLike = (id) => {
    const isLiked = liked[id];
    setLiked((p) => ({ ...p, [id]: !p[id] }));
    showToast(isLiked ? 'Like removed' : 'Post liked! ❤️', isLiked ? 'info' : 'success');
  };

  const toggleComment = (id) => setCommentOpen((p) => ({ ...p, [id]: !p[id] }));

  const handleAddComment = (id) => {
    if (!commentInput[id]?.trim()) return;
    setPosts((p) => p.map((post) => post.id === id
      ? { ...post, comments: [...post.comments, commentInput[id]] }
      : post
    ));
    setCommentInput((p) => ({ ...p, [id]: '' }));
    showToast('Comment added! 💬', 'success');
  };

  const filtered = posts
    .filter((p) => {
      const matchSearch = p.product.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
      const matchState = filterState === 'All States' || p.state === filterState;
      const matchCategory = filterCategory === 'All Categories' || p.category === filterCategory;
      return matchSearch && matchState && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'lowest') return a.price - b.price;
      if (sortBy === 'highest') return b.price - a.price;
      if (sortBy === 'popular') return b.likes - a.likes;
      return 0;
    });

  const selectStyle = {
    padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    border: `1px solid ${theme.cardBorder}`, background: theme.card,
    color: theme.textMuted, cursor: 'pointer', outline: 'none',
    width: '100%', transition: 'all 0.2s'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Public Feed</div>
            <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
              What Nigeria is <span style={{ color: theme.accent }}>reporting</span>
            </h1>
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

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total Reports', value: '50,241', color: theme.accent },
            { label: 'States Active', value: '36', color: '#00b0ff' },
            { label: 'Markets Today', value: '1,204', color: '#ffd600' },
            { label: 'Price Alerts', value: '14', color: '#ff4d6d' },
          ].map((s) => (
            <div key={s.label} style={{
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              borderRadius: '12px', padding: '14px 16px', borderTop: `2px solid ${s.color}`,
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PRICE ALERT BANNER */}
        <div style={{
          background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.3)',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d6d', margin: '0 0 2px' }}>Price Spike Alert — Lagos</p>
            <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Rice (50kg) has gone up by 40% in the last 7 days</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: theme.card, border: `1px solid ${theme.cardBorder}`,
          borderRadius: '12px', padding: '6px 6px 6px 16px', marginBottom: '12px'
        }}>
          <span style={{ color: theme.textMuted }}>🔍</span>
          <input
            type="text"
            placeholder="Search products, markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: theme.text, padding: '8px 0' }}
          />
        </div>

        {/* FILTER TOGGLE */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, border: `1px solid ${theme.cardBorder}`,
            background: showFilters ? theme.navActive : theme.card,
            color: showFilters ? theme.accent : theme.textMuted,
            cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s'
          }}
        >
          {showFilters ? '▲ Hide Filters' : '▼ Show Filters & Sort'}
        </button>

        {/* FILTERS */}
        {showFilters && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={selectStyle}>
              {allStates.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
              {allCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
              <option value="newest">Newest First</option>
              <option value="lowest">Lowest Price</option>
              <option value="highest">Highest Price</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        )}

        {/* TRENDING SECTION */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: 0 }}>Trending This Week</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {[
              { name: 'Rice (50kg)', reports: 124, color: '#ff4d6d' },
              { name: 'Garri (1kg)', reports: 98, color: '#00e676' },
              { name: 'Petrol (litre)', reports: 87, color: '#ffd600' },
              { name: 'Tomatoes', reports: 76, color: '#69f0ae' },
              { name: 'Chicken (1kg)', reports: 65, color: '#ff6e40' },
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => setSearch(item.name)}
                style={{
                  background: theme.card, border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px', padding: '12px 16px', cursor: 'pointer',
                  flexShrink: 0, borderTop: `2px solid ${item.color}`,
                  transition: 'all 0.2s', minWidth: '130px'
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 4px', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: '11px', color: item.color, margin: 0, fontWeight: 600 }}>{item.reports} reports</p>
              </div>
            ))}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '16px' }}>
          Showing <span style={{ color: theme.text, fontWeight: 700 }}>{filtered.length}</span> price reports
        </p>

        {/* POSTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontWeight: 600, color: theme.textMuted }}>No results found</p>
              <p style={{ fontSize: '13px', color: theme.textDim, marginTop: '6px' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((post) => {
              const catColor = categoryColors[post.category] || theme.accent;
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                  style={{
                    background: theme.card, border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}>

                  {/* IMAGE */}
                  <div style={{ position: 'relative' }}>
                    <img src={post.image} alt={post.product} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.85) 0%, transparent 55%)' }} />
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: 'rgba(8,8,15,0.7)', backdropFilter: 'blur(8px)',
                      padding: '4px 10px', borderRadius: '6px',
                      fontSize: '10px', fontWeight: 700, color: catColor,
                      letterSpacing: '1px', textTransform: 'uppercase',
                      border: `1px solid ${catColor}40`
                    }}>{post.category}</div>
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      fontSize: '22px', fontWeight: 900, color: '#fff',
                      textShadow: `0 0 20px ${catColor}`
                    }}>₦{post.price.toLocaleString()}</div>
                  </div>

                  {/* BODY */}
                  <div style={{ padding: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: '0 0 6px' }}>{post.product}</h3>
                    <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>📍 {post.location}, {post.state}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', background: theme.pill, color: theme.pillText, padding: '3px 10px', borderRadius: '6px' }}>👤 {post.user}</span>
                      <span style={{ fontSize: '11px', color: theme.textDim }}>🗓 {post.date}</span>
                    </div>

                    {/* ACTIONS */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', gap: '8px', marginBottom: commentOpen[post.id] ? '14px' : '0' }}>
                      <button onClick={() => handleLike(post.id)} style={{
                        flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        border: `1px solid ${liked[post.id] ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`,
                        background: liked[post.id] ? 'rgba(255,77,109,0.1)' : 'transparent',
                        color: liked[post.id] ? '#ff4d6d' : theme.textMuted, cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                        {liked[post.id] ? '❤️' : '🤍'} {liked[post.id] ? post.likes + 1 : post.likes}
                      </button>
                      <button onClick={() => toggleComment(post.id)} style={{
                        flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        border: `1px solid ${commentOpen[post.id] ? 'rgba(0,176,255,0.4)' : theme.cardBorder}`,
                        background: commentOpen[post.id] ? 'rgba(0,176,255,0.08)' : 'transparent',
                        color: commentOpen[post.id] ? '#00b0ff' : theme.textMuted, cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                        💬 {post.comments.length}
                      </button>
                    </div>

                    {/* COMMENTS */}
                    {commentOpen[post.id] && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '12px' }}>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          {post.comments.length === 0 ? (
                            <p style={{ fontSize: '12px', color: theme.textDim, textAlign: 'center', padding: '8px 0' }}>No comments yet</p>
                          ) : post.comments.map((c, i) => (
                            <div key={i} style={{ background: theme.commentBg, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: theme.textMuted }}>{c}</div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInput[post.id] || ''}
                            onChange={(e) => setCommentInput((p) => ({ ...p, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '13px', background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, outline: 'none' }}
                          />
                          <button onClick={() => handleAddComment(post.id)} style={{
                            padding: '10px 16px', background: theme.accent, color: '#0a0a0f',
                            borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer'
                          }}>→</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Feed;