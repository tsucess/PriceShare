import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import HapticButton from "../components/HapticButton";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: "all 0.3s",
        color: theme.text,
        overflowX: "hidden",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          background: theme.sidebar,
          borderBottom: `1px solid ${theme.sidebarBorder}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "all 0.3s",
          gap: "12px",
        }}
      >
        <div
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", flexShrink: 0 }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "4px",
              color: theme.accent,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            PriceWatch
          </div>
          <div
            style={{
              fontSize: "9px",
              color: theme.textMuted,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Nigeria
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HapticButton
            onClick={theme.toggleTheme}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: `1px solid ${theme.sidebarBorder}`,
              background: theme.toggleBg,
              color: theme.text,
              fontSize: "14px",
            }}
          >
            {theme.dark ? "☀️" : "🌙"}
          </HapticButton>
          {!isMobile && (
            <HapticButton
              onClick={() => navigate("/login")}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.accent}`,
                background: "transparent",
                color: theme.accent,
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              Log In
            </HapticButton>
          )}
          <HapticButton
            onClick={() => navigate("/signup")}
            style={{
              padding: "9px 16px",
              borderRadius: "8px",
              background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "12px",
              border: "none",
              boxShadow: `0 4px 16px ${theme.accent}40`,
            }}
          >
            {isMobile ? "Join Free" : "Sign Up"}
          </HapticButton>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "clamp(36px, 8vw, 72px) 24px",
          textAlign: "center",
          background: theme.dark
            ? "linear-gradient(135deg, #0c0c18 0%, #08080f 100%)"
            : "linear-gradient(135deg, #f0fff6 0%, #f4f4f8 100%)",
          transition: "all 0.3s",
        }}
      >
        <span
          style={{
            background: `${theme.accent}15`,
            color: theme.accent,
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          🇳🇬 Built for Nigeria
        </span>

        <h1
          style={{
            fontSize: "clamp(26px, 7vw, 52px)",
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "16px 0 14px",
            color: theme.text,
          }}
        >
          Know the <span style={{ color: theme.accent }}>real price</span>
          <br />
          before you buy
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: theme.textMuted,
            lineHeight: 1.8,
            maxWidth: "480px",
            margin: "0 auto 32px",
          }}
        >
          PriceWatch is a community-driven platform where Nigerians share real
          market prices so everyone can shop smarter and fight price gouging.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          <HapticButton
            onClick={() => navigate("/signup")}
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              boxShadow: `0 4px 24px ${theme.accent}40`,
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Get Started — It's Free
          </HapticButton>
          <HapticButton
            onClick={() => navigate("/feed")}
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              background: "transparent",
              color: theme.accent,
              fontWeight: 700,
              fontSize: "14px",
              border: `1px solid ${theme.accent}50`,
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Browse Prices
          </HapticButton>
        </div>

        {/* HERO CARD */}
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "20px",
            padding: "24px",
            maxWidth: "340px",
            margin: "0 auto",
            boxShadow: theme.dark
              ? "0 20px 60px rgba(0,0,0,0.4)"
              : "0 20px 60px rgba(0,0,0,0.08)",
            borderTop: `3px solid ${theme.accent}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{ fontWeight: 700, color: theme.text, fontSize: "14px" }}
            >
              🛒 Garri (1kg)
            </span>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>
              📍 Lagos
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{ fontSize: "26px", fontWeight: 900, color: "#00e676" }}
            >
              ₦800
            </span>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>
              Cheapest nearby
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <span
              style={{ fontSize: "26px", fontWeight: 900, color: "#ff4d6d" }}
            >
              ₦1,400
            </span>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>
              Most expensive
            </span>
          </div>
          <div
            style={{
              background: `${theme.accent}15`,
              border: `1px solid ${theme.accent}25`,
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: theme.accent,
                fontWeight: 700,
                margin: 0,
              }}
            >
              💡 Save up to ₦600 by comparing!
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
        }}
      >
        {[
          { value: "50,000+", label: "Price Reports" },
          { value: "36", label: "States Covered" },
          { value: "12,000+", label: "Active Users" },
          { value: "500+", label: "Markets Tracked" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              textAlign: "center",
              padding: "clamp(20px, 5vw, 32px) 16px",
              borderRight: i % 2 === 0 ? "1px solid rgba(0,0,0,0.1)" : "none",
              borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.1)" : "none",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(22px, 6vw, 32px)",
                fontWeight: 900,
                color: "#0a0a0f",
                margin: 0,
              }}
            >
              {stat.value}
            </h2>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(0,0,0,0.6)",
                marginTop: "4px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          padding: "clamp(40px, 8vw, 64px) 24px",
          background: theme.bg,
          transition: "all 0.3s",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "10px",
              color: theme.textMuted,
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            How it works
          </div>
          <h2
            style={{
              fontSize: "clamp(20px, 5vw, 36px)",
              fontWeight: 900,
              color: theme.text,
              marginBottom: "12px",
            }}
          >
            Simple. Powerful. For everyone.
          </h2>
          <p
            style={{
              color: theme.textMuted,
              fontSize: "14px",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            Anyone with a phone can contribute and benefit — no expertise
            needed.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "14px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "📸",
              title: "Snap & Submit",
              desc: "Take a photo of any product and its price wherever you are.",
            },
            {
              icon: "📍",
              title: "Location Captured",
              desc: "Your location is automatically detected for each report.",
            },
            {
              icon: "🔍",
              title: "Compare & Save",
              desc: "Browse prices and find the best deals near you.",
            },
            {
              icon: "🏛️",
              title: "Report to Govt",
              desc: "Extreme price gouging is flagged and reported to authorities.",
            },
          ].map((step) => (
            <div
              key={step.title}
              style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                padding: "20px 16px",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                {step.icon}
              </div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: theme.text,
                  marginBottom: "6px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "clamp(40px, 8vw, 64px) 24px",
          textAlign: "center",
          background: theme.dark ? "#0c0c18" : "#f0fff6",
          borderTop: `1px solid ${theme.cardBorder}`,
          transition: "all 0.3s",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 5vw, 40px)",
            fontWeight: 900,
            color: theme.text,
            marginBottom: "14px",
          }}
        >
          Ready to shop <span style={{ color: theme.accent }}>smarter?</span>
        </h2>
        <p
          style={{
            color: theme.textMuted,
            fontSize: "14px",
            marginBottom: "28px",
          }}
        >
          Join thousands of Nigerians already fighting for fair prices.
        </p>
        <HapticButton
          onClick={() => navigate("/signup")}
          style={{
            padding: "16px 40px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
            color: "#0a0a0f",
            fontWeight: 800,
            fontSize: "15px",
            border: "none",
            boxShadow: `0 6px 30px ${theme.accent}50`,
            width: "100%",
            maxWidth: "320px",
          }}
        >
          Join PriceWatch Free 🇳🇬
        </HapticButton>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          background: theme.sidebar,
          borderTop: `1px solid ${theme.sidebarBorder}`,
          fontSize: "12px",
          color: theme.textMuted,
          transition: "all 0.3s",
        }}
      >
        © 2026 PriceWatch Nigeria. Making markets fair, one post at a time. 🇳🇬
      </footer>
    </div>
  );
}

export default LandingPage;
