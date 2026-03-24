import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import HapticButton from "../components/HapticButton";

function NotFoundPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [count, setCount] = useState(10);

  // Auto redirect after 10 seconds
  useEffect(() => {
    if (count === 0) {
      navigate("/");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        transition: "all 0.3s",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px", width: "100%" }}>
        {/* 404 BIG NUMBER */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "clamp(100px, 25vw, 160px)",
              fontWeight: 900,
              lineHeight: 1,
              background: `linear-gradient(135deg, ${theme.accent}, #00b0ff)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              userSelect: "none",
            }}
          >
            404
          </div>
          {/* Nigeria flag stripe */}
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              height: "3px",
              width: "120px",
              background: "linear-gradient(90deg, #008751, #fff, #008751)",
              borderRadius: "2px",
            }}
          />
        </div>

        <h2
          style={{
            fontSize: "clamp(18px, 5vw, 24px)",
            fontWeight: 800,
            color: theme.text,
            margin: "0 0 12px",
          }}
        >
          This page does not exist
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: theme.textMuted,
            lineHeight: 1.7,
            margin: "0 0 32px",
            maxWidth: "320px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          The page you're looking for may have been moved, deleted, or you may
          have typed the wrong URL.
        </p>

        {/* COUNTDOWN */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "12px",
            padding: "10px 20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: `${theme.accent}20`,
              border: `2px solid ${theme.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 800,
              color: theme.accent,
            }}
          >
            {count}
          </div>
          <span style={{ fontSize: "13px", color: theme.textMuted }}>
            Redirecting to home in{" "}
            <strong style={{ color: theme.text }}>{count}s</strong>
          </span>
        </div>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <HapticButton
            onClick={() => navigate("/")}
            style={{
              padding: "13px 28px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
              color: "#0a0a0f",
              border: "none",
              boxShadow: `0 4px 20px ${theme.accent}40`,
            }}
          >
            🏠 Go Home
          </HapticButton>
          <HapticButton
            onClick={() => navigate("/feed")}
            style={{
              padding: "13px 28px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 800,
              background: "transparent",
              color: theme.textMuted,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            📰 Browse Feed
          </HapticButton>
        </div>

        {/* SMALL FOOTER NOTE */}
        <p
          style={{
            fontSize: "12px",
            color: theme.textMuted,
            marginTop: "40px",
            opacity: 0.6,
          }}
        >
          PriceWatch Nigeria 🇳🇬 — Helping Nigerians shop smarter
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
