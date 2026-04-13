import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { getComments, addComment } from "../services/api";

function BottomSheet({ isOpen, onClose, post, onAddComment }) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const justOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      justOpenedRef.current = true;
      setTimeout(() => { justOpenedRef.current = false; }, 400);
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Load real comments from API whenever a post is opened
  useEffect(() => {
    if (!post?.id) { setComments([]); return; }
    setLoadingComments(true);
    getComments(post.id)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setComments(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [post?.id]);

  const handleAdd = async () => {
    if (!post || !commentInput.trim()) return;
    if (!user) { showToast("Sign in to comment", "warning"); return; }
    setSubmitting(true);
    try {
      await addComment(post.id, commentInput.trim());
      // Append optimistic comment with real user info
      setComments((prev) => [
        ...prev,
        { body: commentInput.trim(), user: { name: user.name, avatar_url: user.avatar_url }, created_at: new Date().toISOString() },
      ]);
      onAddComment?.(post.id, commentInput.trim());
      setCommentInput("");
      showToast("Comment added! 💬", "success");
    } catch {
      showToast("Could not post comment. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (justOpenedRef.current) return; // ignore close if just opened
    setVisible(false);
    setCommentInput("");
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen && !visible) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={handleClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* SHEET */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: theme.card,
          borderRadius: "24px 24px 0 0",
          border: `1px solid ${theme.cardBorder}`,
          borderBottom: "none",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* HANDLE */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "99px",
              background: theme.cardBorder,
            }}
          />
        </div>

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 20px 16px",
            borderBottom: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: theme.text,
                margin: "0 0 2px",
              }}
            >
              💬 Comments
            </h3>
            <p style={{ fontSize: "12px", color: theme.textMuted, margin: 0 }}>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}{" "}
              {post ? `on ${post.product}` : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: theme.pill,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: theme.textMuted,
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>

        {/* COMMENTS LIST */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {loadingComments ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: theme.textMuted, fontSize: "13px" }}>
              ⏳ Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
              <p style={{ fontWeight: 600, color: theme.textMuted, marginBottom: "6px" }}>No comments yet</p>
              <p style={{ fontSize: "13px", color: theme.textDim }}>Be the first to say something!</p>
            </div>
          ) : (
            comments.map((c, i) => {
              const name = c.user?.name || "Anonymous";
              const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const avatarUrl = c.user?.avatar_url;
              return (
                <div key={c.id ?? i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  {/* Avatar */}
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #00e676, #00b0ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#0a0a0f" }}>
                      {initials}
                    </div>
                  )}
                  <div style={{ flex: 1, background: theme.pill, borderRadius: "0 14px 14px 14px", padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: theme.accent, margin: 0 }}>{name}</p>
                      {c.created_at && (
                        <span style={{ fontSize: "10px", color: theme.textMuted }}>
                          {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: theme.text, margin: 0, lineHeight: 1.5 }}>
                      {c.body ?? c.text ?? c}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INPUT */}
        <div
          style={{
            padding: "12px 16px 24px",
            borderTop: `1px solid ${theme.cardBorder}`,
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: theme.card,
          }}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="me" style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #00e676, #00b0ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#0a0a0f" }}>
              {user ? (user.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
            </div>
          )}
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: "20px",
              fontSize: "14px",
              background: theme.input,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.text,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleAdd}
            disabled={submitting || !commentInput.trim()}
            style={{
              width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
              background: commentInput.trim() && !submitting ? "linear-gradient(135deg, #00e676, #00c853)" : theme.pill,
              border: "none", cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", transition: "all 0.2s",
              color: commentInput.trim() && !submitting ? "#0a0a0f" : theme.textMuted,
            }}
          >
            {submitting ? "⏳" : "→"}
          </button>
        </div>
      </div>
    </>
  );
}

export default BottomSheet;
