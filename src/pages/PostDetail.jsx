import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import HapticButton from '../components/HapticButton';

const categoryColors = {
  'Food & Groceries': '#00e676',
  Vegetables: '#69f0ae',
  'Meat & Poultry': '#ff6e40',
  'Fuel & Energy': '#ffd600',
  Healthcare: '#00b0ff',
};

function PostDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { showToast } = useToast();

  const post = location.state?.post;
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [reported, setReported] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    showToast(liked ? 'Like removed' : 'Post liked! ❤️', liked ? 'info' : 'success');
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    setComments([...comments, { text: commentInput, user: 'You', date: 'Just now' }]);
    setCommentInput('');
    showToast('Comment added! 💬', 'success');
  };

  const handleReport = () => {
    setReported(true);
    showToast('Price reported to authorities 🏛️', 'warning');
  };

  const handleShare = () => {
    showToast('Share link copied! 🔗', 'success');
  };

  // Not found state
  if (!post) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
          <p style={{ color: theme.textMuted, fontWeight: 600, marginBottom: '20px', fontSize: '16px' }}>Post not found</p>
          <HapticButton
            onClick={() => navigate('/feed')}
            style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none', fontSize: '14px' }}
          >← Back to Feed</HapticButton>
        </main>
      </div>
    );
  }

  const catColor = categoryColors[post.category] || theme.accent;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowX: 'hidden', paddingBottom: '60px' }}>

        {/* HERO IMAGE — full width, no side padding */}
        <div style={{ position: 'relative', margin: '0 -40px 24px', marginTop: '-32px' }}>
          <img
            src={post.image}
            alt={post.product}
            style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0.3) 60%, transparent 100%)' }} />

          {/* BACK */}
          <HapticButton
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(8,8,15,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: '10px', padding: '8px 14px',
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >← Back</HapticButton>

          {/* SHARE */}
          <HapticButton
            onClick={handleShare}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(8,8,15,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', borderRadius: '10px', padding: '8px 14px',
              fontSize: '13px', fontWeight: 700,
            }}
          >🔗 Share</HapticButton>

          {/* CATEGORY BADGE */}
          <div style={{
            position: 'absolute', bottom: '70px', left: '16px',
            background: 'rgba(8,8,15,0.7)', backdropFilter: 'blur(8px)',
            padding: '4px 12px', borderRadius: '6px',
            fontSize: '10px', fontWeight: 700, color: catColor,
            letterSpacing: '1px', textTransform: 'uppercase',
            border: `1px solid ${catColor}40`,
          }}>{post.category}</div>

          {/* PRICE */}
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            fontSize: 'clamp(28px, 7vw, 40px)', fontWeight: 900, color: '#fff',
            textShadow: `0 0 30px ${catColor}`,
          }}>₦{post.price.toLocaleString()}</div>
        </div>

        {/* TITLE + USER */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 800, color: theme.text, margin: '0 0 10px' }}>
            {post.product}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${catColor}, ${catColor}80)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800, color: '#0a0a0f',
              }}>
                {post.user?.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: 0 }}>{post.user}</p>
                <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0 }}>{post.date}</p>
              </div>
            </div>
            <span style={{ fontSize: '11px', background: `${catColor}15`, color: catColor, padding: '4px 12px', borderRadius: '6px', fontWeight: 700 }}>
              ✅ Verified Report
            </span>
          </div>
        </div>

        {/* DETAILS CARD */}
        <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', padding: '16px', marginBottom: '16px', borderTop: `3px solid ${catColor}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { icon: '📍', label: 'Market', value: post.location },
              { icon: '🗺️', label: 'State', value: post.state },
              { icon: '🏷️', label: 'Category', value: post.category },
              { icon: '🗓️', label: 'Reported', value: post.date },
            ].map((detail) => (
              <div key={detail.label}>
                <p style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 3px' }}>{detail.icon} {detail.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: theme.text, margin: 0 }}>{detail.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRICE CONTEXT */}
        <div style={{ background: `${catColor}10`, border: `1px solid ${catColor}25`, borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: catColor, margin: '0 0 10px' }}>💡 Price Context</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'This Price', value: `₦${post.price.toLocaleString()}`, color: theme.text },
              { label: 'Avg in State', value: `₦${Math.round(post.price * 1.12).toLocaleString()}`, color: '#ffd600' },
              { label: 'Lowest Found', value: `₦${Math.round(post.price * 0.85).toLocaleString()}`, color: '#00e676' },
            ].map((p) => (
              <div key={p.label} style={{ textAlign: 'center', background: theme.pill, borderRadius: '10px', padding: '10px 6px' }}>
                <p style={{ fontSize: '9px', color: theme.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: p.color, margin: 0 }}>{p.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <HapticButton
            onClick={handleLike}
            style={{
              padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              border: `1px solid ${liked ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`,
              background: liked ? 'rgba(255,77,109,0.1)' : theme.card,
              color: liked ? '#ff4d6d' : theme.textMuted,
            }}
          >{liked ? '❤️' : '🤍'} {liked ? post.likes + 1 : post.likes} Likes</HapticButton>

          <HapticButton
            onClick={handleReport}
            disabled={reported}
            style={{
              padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
              border: `1px solid ${reported ? 'rgba(255,214,0,0.4)' : theme.cardBorder}`,
              background: reported ? 'rgba(255,214,0,0.1)' : theme.card,
              color: reported ? '#ffd600' : theme.textMuted,
            }}
          >{reported ? '✅ Reported' : '🏛️ Report Price'}</HapticButton>
        </div>

        {/* COMMENTS SECTION */}
        <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, margin: 0 }}>
              💬 Comments ({comments.length})
            </h3>
          </div>

          {/* COMMENT LIST */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>💬</p>
                <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map((c, i) => (
                <div key={i} style={{ background: theme.pill, borderRadius: '12px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: catColor }}>👤 {c.user || 'Anonymous'}</span>
                    <span style={{ fontSize: '11px', color: theme.textDim }}>{c.date || post.date}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: theme.text, margin: 0, lineHeight: 1.5 }}>{c.text || c}</p>
                </div>
              ))
            )}
          </div>

          {/* ADD COMMENT */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', fontSize: '13px', background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, outline: 'none', fontFamily: 'inherit' }}
            />
            <HapticButton
              onClick={handleAddComment}
              style={{ padding: '11px 18px', background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '15px' }}
            >→</HapticButton>
          </div>
        </div>

      </main>
    </div>
  );
}

export default PostDetail;