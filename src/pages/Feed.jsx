import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getPosts, likePost, votePost, getDashboard, getAlerts, getCategories } from '../services/api';
import Sidebar from '../components/Sidebar';
import SkeletonCard from '../components/SkeletonCard';
import BottomSheet from '../components/BottomSheet';
import HapticButton from '../components/HapticButton';
import { ThumbsUp, ThumbsDown } from 'lucide-react';


const categoryColors = {
  'Food & Groceries': '#00e676',
  Vegetables: '#69f0ae',
  'Meat & Poultry': '#ff6e40',
  'Fuel & Energy': '#ffd600',
  Healthcare: '#00b0ff',
};

const allStates = [
  'All States',
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];
// allCategories is now loaded dynamically from the API; this is the fallback
const STATIC_CATEGORIES = ['All Categories', 'Food & Groceries', 'Vegetables', 'Meat & Poultry', 'Fuel & Energy', 'Healthcare'];
const suggestions = ['Garri', 'Rice', 'Tomatoes', 'Petrol', 'Chicken', 'Paracetamol'];

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
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

function Feed() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState({});     // { [postId]: true/false }
  const [votes, setVotes] = useState({});     // { [postId]: 'confirm'|'deny'|null }
  const [posts, setPosts] = useState([]);
  const [dashboard, setDashboard] = useState({ total_posts: 0, total_users: 0, top_products: [] });
  const [topAlert, setTopAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterState, setFilterState] = useState('All States');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [allCategories, setAllCategories] = useState(STATIC_CATEGORIES);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [bottomSheetPost, setBottomSheetPost] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const params = {};
      if (filterState !== 'All States') params.state = filterState;
      if (filterCategory !== 'All Categories') params.category = filterCategory;
      if (search) params.search = search;
      params.sort = sortBy;
      const res = await getPosts(params);
      const data = res.data.data ?? res.data;
      setPosts(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      showToast('Could not load feed. Retrying...', 'warning');
    }
  }, [filterState, filterCategory, search, sortBy, showToast]);

  // Load dynamic categories from API once
  useEffect(() => {
    getCategories()
      .then(r => {
        const cats = r.data ?? [];
        if (cats.length > 0) {
          setAllCategories(['All Categories', ...cats.map(c => c.name)]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch dashboard stats + alerts once on mount
  useEffect(() => {
    getDashboard()
      .then((r) => setDashboard(r.data ?? {}))
      .catch(() => {});
    getAlerts({ per_page: 1 })
      .then((r) => {
        const items = r.data?.data ?? r.data ?? [];
        setTopAlert(Array.isArray(items) ? items[0] : null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPosts(),
      getDashboard().then((r) => setDashboard(r.data ?? {})).catch(() => {}),
    ]);
    showToast('Feed refreshed! 🔄', 'success');
    setRefreshing(false);
  };

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const distance = e.touches[0].clientY - touchStart;
    if (distance > 0 && window.scrollY === 0) setPullDistance(Math.min(distance, 80));
  };
  const handleTouchEnd = () => {
    if (pullDistance > 60) handleRefresh();
    setPullDistance(0);
    setTouchStart(null);
  };

  const requireAuth = (action) => {
    if (!isLoggedIn) {
      showToast('Sign up to like, comment and vote! 🚀', 'info');
      return false;
    }
    return true;
  };

  const handleLike = async (id) => {
    if (!requireAuth()) return;
    const isLiked = liked[id];
    setLiked((p) => ({ ...p, [id]: !p[id] }));
    showToast(isLiked ? 'Like removed' : 'Post liked! ❤️', isLiked ? 'info' : 'success');
    try { await likePost(id); } catch { setLiked((p) => ({ ...p, [id]: isLiked })); }
  };

  const handleVote = async (id, type) => {
    if (!requireAuth()) return;
    const current = votes[id];
    const next = current === type ? null : type;
    setVotes((p) => ({ ...p, [id]: next }));
    showToast(next === 'confirm' ? 'Price confirmed! 👍' : next === 'deny' ? 'Price flagged! 👎' : 'Vote removed', next === 'confirm' ? 'success' : next === 'deny' ? 'warning' : 'info');
    try { await votePost(id, next ?? 'remove'); } catch { setVotes((p) => ({ ...p, [id]: current })); }
  };

  const handleBottomSheetComment = (id, text) => {
    setPosts((p) => p.map((post) => post.id === id ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post));
  };

  // Posts are already filtered/sorted server-side; apply light client-side filter for instant UX
  const filtered = posts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.product || '').toLowerCase().includes(q) || (p.market || '').toLowerCase().includes(q);
  });

  const selectStyle = {
    padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    border: `1px solid ${theme.cardBorder}`, background: theme.card,
    color: theme.textMuted, cursor: 'pointer', outline: 'none', width: '100%',
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(search.toLowerCase()) && search.length > 0
  );

  return (
    <div
      style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}
      onTouchStart={(e) => { if (bottomSheetPost) return; handleTouchStart(e); }}
      onTouchMove={(e) => { if (bottomSheetPost) return; handleTouchMove(e); }}
      onTouchEnd={(e) => { if (bottomSheetPost) return; handleTouchEnd(e); }}
    >
      <Sidebar />

      <main style={{ flex: 1, overflowX: 'hidden' }}>

        {/* PULL TO REFRESH */}
        {pullDistance > 0 && (
          <div style={{ textAlign: 'center', padding: '12px', color: theme.accent, fontSize: '13px', fontWeight: 600 }}>
            {pullDistance > 60 ? '↑ Release to refresh' : '↓ Pull to refresh'}
          </div>
        )}
        {refreshing && (
          <div style={{ textAlign: 'center', padding: '10px', marginBottom: '12px', background: `${theme.accent}15`, borderRadius: '10px', color: theme.accent, fontSize: '13px', fontWeight: 600 }}>
            🔄 Refreshing feed...
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Public Feed</div>
            <h1 style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
              What Nigeria is <span style={{ color: theme.accent }}>reporting</span>
            </h1>
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

        {/* STATS ROW — real numbers from /api/dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total Reports', value: (dashboard.total_posts ?? 0).toLocaleString(), color: theme.accent },
            { label: 'States Active', value: '36', color: '#00b0ff' },
            { label: 'Users',         value: (dashboard.total_users ?? 0).toLocaleString(), color: '#ffd600' },
            { label: 'Price Alerts',  value: (dashboard.alerts?.length ?? 0).toString(), color: '#ff4d6d' },
          ].map((s) => (
            <div key={s.label} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '14px 16px', borderTop: `2px solid ${s.color}` }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PRICE ALERT BANNER — first alert from /api/alerts */}
        {topAlert && (
          <div style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d6d', margin: '0 0 2px' }}>
                Price Alert — {topAlert.state || 'Nigeria'}
              </p>
              <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>
                {topAlert.message || `${topAlert.product} price has changed significantly`}
              </p>
            </div>
          </div>
        )}

        {/* GUEST BANNER */}
        {!isLoggedIn && (
          <div style={{
            background: `linear-gradient(135deg, ${theme.accent}12, #00b0ff10)`,
            border: `1px solid ${theme.accent}25`,
            borderRadius: '14px', padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '26px', flexShrink: 0 }}>👀</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 2px' }}>You're browsing as a guest</p>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>Create a free account to like, comment and report prices.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <HapticButton
                onClick={() => navigate('/signup')}
                style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none' }}
              >Join Free</HapticButton>
              <HapticButton
                onClick={() => navigate('/login')}
                style={{ padding: '8px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}
              >Log In</HapticButton>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '6px 6px 6px 16px' }}>
            <span style={{ color: theme.textMuted }}>🔍</span>
            <input
              type="text"
              placeholder="Search products, markets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: theme.text, padding: '8px 0' }}
            />
            {search.length > 0 && (
              <button onClick={() => { setSearch(''); setShowSuggestions(false); }} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>×</button>
            )}
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', marginTop: '4px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              {filteredSuggestions.map((s) => (
                <div key={s} onClick={() => { setSearch(s); setShowSuggestions(false); }} style={{ padding: '12px 16px', fontSize: '14px', color: theme.text, cursor: 'pointer', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: theme.accent }}>🔍</span> {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FILTER TOGGLE */}
        <HapticButton
          onClick={() => setShowFilters(!showFilters)}
          style={{ width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: `1px solid ${theme.cardBorder}`, background: showFilters ? theme.navActive : theme.card, color: showFilters ? theme.accent : theme.textMuted, marginBottom: '12px' }}
        >
          {showFilters ? '▲ Hide Filters' : '▼ Show Filters & Sort'}
        </HapticButton>

        {/* FILTERS */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
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

        {/* TRENDING — top_products from /api/dashboard */}
        {(dashboard.top_products ?? []).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>🔥</span>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: 0 }}>Trending This Week</h3>
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
              {(dashboard.top_products ?? []).map((item, idx) => {
                const chipColors = ['#ff4d6d', '#00e676', '#ffd600', '#69f0ae', '#ff6e40'];
                const color = chipColors[idx % chipColors.length];
                return (
                  <div
                    key={item.product}
                    onClick={() => setSearch(item.product)}
                    style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', flexShrink: 0, borderTop: `2px solid ${color}`, minWidth: '130px' }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 4px', whiteSpace: 'nowrap' }}>{item.product}</p>
                    <p style={{ fontSize: '11px', color, margin: 0, fontWeight: 600 }}>{item.report_count} reports</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULTS COUNT */}
        <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '16px' }}>
          Showing <span style={{ color: theme.text, fontWeight: 700 }}>{filtered.length}</span> price reports
        </p>

        {/* POSTS — 1 col mobile, 2 col desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>No results found</h3>
              <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '24px', lineHeight: 1.6 }}>Try a different search or clear your filters</p>
              <HapticButton
                onClick={() => { setSearch(''); setFilterState('All States'); setFilterCategory('All Categories'); }}
                style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none' }}
              >Clear Filters</HapticButton>
            </div>
          ) : (
            filtered.map((post) => {
              const catColor = categoryColors[post.category] || theme.accent;
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                  style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={post.image_url || post.image || 'https://placehold.co/400x180?text=No+Image'} alt={post.product} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.85) 0%, transparent 55%)' }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(8,8,15,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, color: catColor, letterSpacing: '1px', textTransform: 'uppercase', border: `1px solid ${catColor}40` }}>
                      {post.category}
                    </div>
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '22px', fontWeight: 900, color: '#fff', textShadow: `0 0 20px ${catColor}` }}>
                      ₦{Number(post.price).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: theme.text, margin: '0 0 6px' }}>{post.product}</h3>
                    <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>📍 {post.market || post.location}, {post.state}</p>
                    {post.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                        {post.tags.map(tag => (
                          <span key={tag.id} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px', background: (tag.color || '#00b0ff') + '20', color: tag.color || '#00b0ff', border: `1px solid ${(tag.color || '#00b0ff')}50` }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', background: theme.pill, color: theme.pillText, padding: '3px 10px', borderRadius: '6px' }}>👤 {post.user?.name || post.user || 'Anonymous'}</span>
                      <span style={{ fontSize: '11px', color: theme.textDim }}>🕐 {getRelativeTime(post.created_at || post.date)}</span>
                    </div>
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
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: `1px solid ${liked[post.id] ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`, background: liked[post.id] ? 'rgba(255,77,109,0.1)' : 'transparent', color: liked[post.id] ? '#ff4d6d' : theme.textMuted }}
                        >
                          {liked[post.id] ? '❤️' : '🤍'} {(post.likes_count ?? post.likes ?? 0) + (liked[post.id] ? 1 : 0)}
                        </HapticButton>
                        <HapticButton
                          onClick={() => { if (!requireAuth()) return; setBottomSheetPost(post); }}
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}
                        >
                          💬 {post.comments_count ?? (Array.isArray(post.comments) ? post.comments.length : 0)}
                        </HapticButton>
                      </div>
                      {/* CONFIRM / DENY accuracy */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>Price accurate?</span>
                        <HapticButton
                          onClick={() => handleVote(post.id, 'confirm')}
                          style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: `1px solid ${votes[post.id] === 'confirm' ? 'rgba(0,230,118,0.5)' : theme.cardBorder}`, background: votes[post.id] === 'confirm' ? 'rgba(0,230,118,0.12)' : 'transparent', color: votes[post.id] === 'confirm' ? '#00e676' : theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <ThumbsUp size={14} /> {(post.confirms_count ?? post.confirms ?? 0) + (votes[post.id] === 'confirm' ? 1 : 0)}
                        </HapticButton>
                        <HapticButton
                          onClick={() => handleVote(post.id, 'deny')}
                          style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: `1px solid ${votes[post.id] === 'deny' ? 'rgba(255,77,109,0.5)' : theme.cardBorder}`, background: votes[post.id] === 'deny' ? 'rgba(255,77,109,0.12)' : 'transparent', color: votes[post.id] === 'deny' ? '#ff4d6d' : theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <ThumbsDown size={14} /> {(post.denies_count ?? post.denies ?? 0) + (votes[post.id] === 'deny' ? 1 : 0)}
                        </HapticButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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

export default Feed;