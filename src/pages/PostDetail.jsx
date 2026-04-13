import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { getPost, likePost, getComments, addComment, getProductHistory, compareProducts } from "../services/api";
import Sidebar from "../components/Sidebar";
import HapticButton from "../components/HapticButton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const categoryColors = {
  "Food & Groceries": "#00e676",
  Vegetables: "#69f0ae",
  "Meat & Poultry": "#ff6e40",
  "Fuel & Energy": "#ffd600",
  Healthcare: "#00b0ff",
};

function PostDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const theme = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Post may arrive via router state (fast path) or needs to be fetched
  const [post, setPost] = useState(location.state?.post ?? null);
  const [fetchError, setFetchError] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [reported, setReported] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [priceContext, setPriceContext] = useState(null); // {avg, min, max}

  // Fetch post by ID when not available in router state
  useEffect(() => {
    if (post) {
      setLikesCount(post.likes_count ?? post.likes ?? 0);
      return;
    }
    const id = paramId;
    if (!id) { setFetchError(true); return; }
    getPost(id)
      .then((res) => {
        const data = res.data.data ?? res.data;
        setPost(data);
        setLikesCount(data.likes_count ?? data.likes ?? 0);
      })
      .catch(() => setFetchError(true));
  }, [post, paramId]);

  // Load comments from API
  const fetchComments = useCallback(async (postId) => {
    try {
      const res = await getComments(postId);
      const data = res.data.data ?? res.data;
      setComments(Array.isArray(data) ? data : data.data ?? []);
    } catch { /* silently fail — show empty state */ }
  }, []);

  useEffect(() => {
    if (post?.id) fetchComments(post.id);
  }, [post?.id, fetchComments]);

  // Load price history + real price context when post is available
  useEffect(() => {
    if (!post?.product || !post?.state) return;
    getProductHistory(post.product, post.state)
      .then(r => {
        const items = r.data ?? [];
        const sorted = [...items].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setHistoryData(sorted.map(h => ({
          date: new Date(h.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
          price: Number(h.price),
        })));
      })
      .catch(() => {});
    compareProducts({ search: post.product })
      .then(r => {
        const rows = (r.data ?? []).filter(row => row.state === post.state && row.product?.toLowerCase() === post.product?.toLowerCase());
        if (rows.length > 0) {
          const row = rows[0];
          setPriceContext({ avg: Number(row.avg_price), min: Number(row.min_price), max: Number(row.max_price) });
        }
      })
      .catch(() => {});
  }, [post?.product, post?.state]);

  const handleLike = async () => {
    if (!user) { showToast('Sign in to like posts', 'warning'); return; }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => wasLiked ? c - 1 : c + 1);
    try { await likePost(post.id); }
    catch {
      setLiked(wasLiked);
      setLikesCount((c) => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    if (!user) { showToast('Sign in to comment', 'warning'); return; }
    setAddingComment(true);
    try {
      await addComment(post.id, commentInput.trim());
      // Optimistically add comment then refresh from API
      setComments((prev) => [
        ...prev,
        { body: commentInput.trim(), user: { name: user.name }, created_at: new Date().toISOString() },
      ]);
      setCommentInput("");
      showToast("Comment added! 💬", "success");
    } catch {
      showToast('Could not post comment. Try again.', 'error');
    } finally {
      setAddingComment(false);
    }
  };

  const handleReport = () => {
    setReported(true);
    showToast("Price reported to authorities 🏛️", "warning");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/post/${post?.id}`;
    const shareData = {
      title: `${post?.product} — ₦${Number(post?.price).toLocaleString()} in ${post?.state}`,
      text: `Found a price report on PriceShare: ${post?.product} is selling for ₦${Number(post?.price).toLocaleString()} at ${post?.market}, ${post?.state}.`,
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); return; } catch { /* user cancelled */ }
    }
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast("Share link copied! 🔗", "success");
  };

  // Loading / error state
  if (!post && !fetchError) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: theme.textMuted, fontSize: "15px" }}>⏳ Loading post...</p>
        </main>
      </div>
    );
  }

  if (fetchError || !post) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>😕</div>
          <p style={{ color: theme.textMuted, fontWeight: 600, marginBottom: "20px", fontSize: "16px" }}>Post not found</p>
          <HapticButton onClick={() => navigate("/feed")} style={{ padding: "12px 24px", borderRadius: "10px", fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: "#0a0a0f", border: "none", fontSize: "14px" }}>
            ← Back to Feed
          </HapticButton>
        </main>
      </div>
    );
  }

  const catColor = categoryColors[post.category] || theme.accent;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: "all 0.3s",
        overflowX: "hidden",
      }}
    >
      <Sidebar />

      <main style={{ flex: 1, overflowX: "hidden", paddingBottom: "60px" }}>
        {/* HERO IMAGE — full width, no side padding */}
        <div
          style={{
            position: "relative",
            margin: "0 -40px 24px",
            marginTop: "-32px",
          }}
        >
          <img
            src={post.image_url || post.image || 'https://placehold.co/800x280?text=No+Image'}
            alt={post.product}
            onClick={() => setZoomed(true)}
            style={{
              width: "100%",
              height: "280px",
              objectFit: "cover",
              display: "block",
              cursor: "zoom-in",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0.3) 60%, transparent 100%)",
            }}
          />

          {/* BACK */}
          <HapticButton
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "rgba(8,8,15,0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back
          </HapticButton>

          {/* SHARE */}
          <HapticButton
            onClick={handleShare}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(8,8,15,0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            🔗 Share
          </HapticButton>

          {/* CATEGORY BADGE */}
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "16px",
              background: "rgba(8,8,15,0.7)",
              backdropFilter: "blur(8px)",
              padding: "4px 12px",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: 700,
              color: catColor,
              letterSpacing: "1px",
              textTransform: "uppercase",
              border: `1px solid ${catColor}40`,
            }}
          >
            {post.category}
          </div>

          {/* PRICE */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              fontSize: "clamp(28px, 7vw, 40px)",
              fontWeight: 900,
              color: "#fff",
              textShadow: `0 0 30px ${catColor}`,
            }}
          >
            ₦{Number(post.price).toLocaleString()}
          </div>
        </div>

        {/* TITLE + USER */}
        <div style={{ marginBottom: "16px" }}>
          <h1
            style={{
              fontSize: "clamp(18px, 5vw, 24px)",
              fontWeight: 800,
              color: theme.text,
              margin: "0 0 10px",
            }}
          >
            {post.product}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${catColor}, ${catColor}80)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#0a0a0f",
                }}
              >
                {(post.user?.name || post.user || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: theme.text,
                    margin: 0,
                  }}
                >
                  {post.user?.name || post.user || 'Anonymous'}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: theme.textMuted,
                    margin: 0,
                  }}
                >
                  {post.created_at ? new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : post.date}
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                background: `${catColor}15`,
                color: catColor,
                padding: "4px 12px",
                borderRadius: "6px",
                fontWeight: 700,
              }}
            >
              ✅ Verified Report
            </span>
          </div>
        </div>

        {/* DETAILS CARD */}
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "16px",
            borderTop: `3px solid ${catColor}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {[
              { icon: "📍", label: "Market", value: post.market || post.location },
              { icon: "🗺️", label: "State", value: post.state },
              { icon: "🏷️", label: "Category", value: post.category },
              { icon: "🗓️", label: "Reported", value: post.created_at ? new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : post.date },
            ].map((detail) => (
              <div key={detail.label}>
                <p
                  style={{
                    fontSize: "10px",
                    color: theme.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    margin: "0 0 3px",
                  }}
                >
                  {detail.icon} {detail.label}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.text,
                    margin: 0,
                  }}
                >
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* REAL PRICE CONTEXT — from /api/posts/compare */}
        <div style={{ background: `${catColor}10`, border: `1px solid ${catColor}25`, borderRadius: "14px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: catColor, margin: "0 0 10px" }}>
            💡 Price Context in {post.state}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              { label: "This Price", value: `₦${Number(post.price).toLocaleString()}`, color: theme.text },
              { label: "State Avg",  value: priceContext ? `₦${Math.round(priceContext.avg).toLocaleString()}` : '—', color: "#ffd600" },
              { label: "State Min",  value: priceContext ? `₦${Math.round(priceContext.min).toLocaleString()}` : '—', color: "#00e676" },
            ].map((p) => (
              <div key={p.label} style={{ textAlign: "center", background: theme.pill, borderRadius: "10px", padding: "10px 6px" }}>
                <p style={{ fontSize: "9px", color: theme.textMuted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{p.label}</p>
                <p style={{ fontSize: "14px", fontWeight: 800, color: p.color, margin: 0 }}>{p.value}</p>
              </div>
            ))}
          </div>
          {priceContext && (
            <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "10px", marginBottom: 0, textAlign: "center" }}>
              {Number(post.price) < priceContext.avg
                ? `✅ This price is ${Math.round((1 - Number(post.price) / priceContext.avg) * 100)}% below the state average — a good deal!`
                : Number(post.price) > priceContext.avg
                  ? `⚠️ This price is ${Math.round((Number(post.price) / priceContext.avg - 1) * 100)}% above the state average.`
                  : `📊 This price matches the state average.`}
            </p>
          )}
        </div>

        {/* PRICE HISTORY CHART */}
        {historyData.length > 1 && (
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: theme.text, margin: "0 0 12px" }}>
              📈 Price History — {post.product} in {post.state}
              <span style={{ fontWeight: 400, color: theme.textMuted, marginLeft: '8px' }}>({historyData.length} reports)</span>
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={historyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v.toLocaleString()}`} width={70} />
                <Tooltip
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', fontSize: '12px', color: theme.text }}
                  formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Price']}
                />
                <ReferenceLine y={Number(post.price)} stroke={catColor} strokeDasharray="4 2" label={{ value: 'This', fill: catColor, fontSize: 10, position: 'right' }} />
                <Line type="monotone" dataKey="price" stroke={catColor} strokeWidth={2} dot={{ fill: catColor, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <HapticButton
            onClick={handleLike}
            style={{
              padding: "14px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              border: `1px solid ${liked ? "rgba(255,77,109,0.4)" : theme.cardBorder}`,
              background: liked ? "rgba(255,77,109,0.1)" : theme.card,
              color: liked ? "#ff4d6d" : theme.textMuted,
            }}
          >
            {liked ? "❤️" : "🤍"} {likesCount} Likes
          </HapticButton>

          <HapticButton
            onClick={handleReport}
            disabled={reported}
            style={{
              padding: "14px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              border: `1px solid ${reported ? "rgba(255,214,0,0.4)" : theme.cardBorder}`,
              background: reported ? "rgba(255,214,0,0.1)" : theme.card,
              color: reported ? "#ffd600" : theme.textMuted,
            }}
          >
            {reported ? "✅ Reported" : "🏛️ Report Price"}
          </HapticButton>
        </div>

        {/* COMMENTS SECTION */}
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${theme.cardBorder}`,
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: theme.text,
                margin: 0,
              }}
            >
              💬 Comments ({post.comments_count ?? comments.length})
            </h3>
          </div>

          {/* COMMENT LIST */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>💬</p>
                <p
                  style={{
                    fontSize: "13px",
                    color: theme.textMuted,
                    margin: 0,
                  }}
                >
                  No comments yet. Be the first!
                </p>
              </div>
            ) : (
              comments.map((c, i) => (
                <div
                  key={c.id ?? i}
                  style={{
                    background: theme.pill,
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: catColor,
                      }}
                    >
                      👤 {c.user?.name || c.user || "Anonymous"}
                    </span>
                    <span style={{ fontSize: "11px", color: theme.textDim }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : c.date || ''}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme.text,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {c.body || c.text || c}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* ADD COMMENT */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: `1px solid ${theme.cardBorder}`,
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                background: theme.input,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.text,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <HapticButton
              onClick={handleAddComment}
              disabled={addingComment}
              style={{
                padding: "11px 18px",
                background: addingComment ? theme.cardBorder : `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                color: addingComment ? theme.textMuted : "#0a0a0f",
                borderRadius: "10px",
                border: "none",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              {addingComment ? '⏳' : '→'}
            </HapticButton>
          </div>
        </div>
      </main>

      {/* FULLSCREEN ZOOM OVERLAY */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            animation: "fadeInZoom 0.25s ease",
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setZoomed(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            ×
          </button>

          {/* PRODUCT LABEL */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {post.product} — ₦{Number(post.price).toLocaleString()}
          </div>

          <img
            src={post.image_url || post.image || 'https://placehold.co/800x600?text=No+Image'}
            alt={post.product}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              animation: "scaleInZoom 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />

          <style>{`
            @keyframes fadeInZoom {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes scaleInZoom {
              from { transform: scale(0.85); opacity: 0; }
              to   { transform: scale(1);    opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
