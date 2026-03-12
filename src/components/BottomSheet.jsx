import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

function BottomSheet({ isOpen, onClose, post, onAddComment }) {
  const theme = useTheme();
  const { showToast } = useToast();
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [visible, setVisible] = useState(false);
  const justOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Mark as just opened — ignore any touch/click events for 400ms
      justOpenedRef.current = true;
      setTimeout(() => {
        justOpenedRef.current = false;
      }, 400);
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (post) setComments(post.comments || []);
  }, [post]);

  const handleAdd = () => {
    if (!post || !commentInput.trim()) return;
    const newComments = [...comments, commentInput];
    setComments(newComments);
    onAddComment?.(post.id, commentInput);
    setCommentInput("");
    showToast("Comment added! 💬", "success");
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
          {comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
              <p
                style={{
                  fontWeight: 600,
                  color: theme.textMuted,
                  marginBottom: "6px",
                }}
              >
                No comments yet
              </p>
              <p style={{ fontSize: "13px", color: theme.textDim }}>
                Be the first to say something!
              </p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #00e676, #00b0ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0a0a0f",
                  }}
                >
                  {typeof c === "string" ? c.charAt(0).toUpperCase() : "U"}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: theme.pill,
                    borderRadius: "0 14px 14px 14px",
                    padding: "10px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: theme.accent,
                      margin: "0 0 4px",
                    }}
                  >
                    Community Member
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme.text,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {typeof c === "string" ? c : c.text}
                  </p>
                </div>
              </div>
            ))
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
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, #00e676, #00b0ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 800,
              color: "#0a0a0f",
            }}
          >
            CO
          </div>
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
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              flexShrink: 0,
              background: commentInput.trim()
                ? "linear-gradient(135deg, #00e676, #00c853)"
                : theme.pill,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.2s",
              color: commentInput.trim() ? "#0a0a0f" : theme.textMuted,
            }}
          >
            →
          </button>
        </div>
      </div>
    </>
  );
}

export default BottomSheet;
