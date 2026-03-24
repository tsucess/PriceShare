import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

function SplashScreen({ onDone }) {
  const theme = useTheme();
  const [stage, setStage] = useState("enter"); // enter → show → exit

  useEffect(() => {
    const t1 = setTimeout(() => setStage("show"), 300);
    const t2 = setTimeout(() => setStage("exit"), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: theme.dark
          ? "linear-gradient(135deg, #08080f 0%, #0c0c18 100%)"
          : "linear-gradient(135deg, #f0fff6 0%, #f4f4f8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        opacity: stage === "exit" ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    >
      {/* LOGO CIRCLE */}
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "28px",
          background: "linear-gradient(135deg, #00e676, #00c853)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 20px 60px rgba(0,230,118,0.35)",
          transform: stage === "enter" ? "scale(0.5)" : "scale(1)",
          opacity: stage === "enter" ? 0 : 1,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <span style={{ fontSize: "44px" }}>₦</span>
      </div>

      {/* TEXT */}
      <div
        style={{
          textAlign: "center",
          transform: stage === "enter" ? "translateY(20px)" : "translateY(0)",
          opacity: stage === "enter" ? 0 : 1,
          transition: "all 0.5s ease 0.2s",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            color: "#00e676",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          PriceWatch
        </div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: theme.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            textTransform: "uppercase",
          }}
        >
          Nigeria
        </div>
      </div>

      {/* TAGLINE */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          textAlign: "center",
          opacity: stage === "show" ? 1 : 0,
          transition: "opacity 0.5s ease 0.4s",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: theme.dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
            margin: 0,
          }}
        >
          Know the real price. Always. 🇳🇬
        </p>
      </div>

      {/* LOADING DOTS */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          display: "flex",
          gap: "6px",
          opacity: stage === "show" ? 1 : 0,
          transition: "opacity 0.4s ease 0.6s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00e676",
              animation: `pulse 1s ease-in-out ${i * 0.2}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          from { opacity: 0.2; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
