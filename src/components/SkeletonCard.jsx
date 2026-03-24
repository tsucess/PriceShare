import React from "react";
import { useTheme } from "../context/ThemeContext";

// Reusable shimmer block
export function SkeletonBlock({
  width = "100%",
  height = "16px",
  borderRadius = "8px",
  delay = "0s",
  style = {},
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: theme.dark
          ? "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)"
          : "linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)",
        backgroundSize: "200% 100%",
        animation: `shimmer 1.5s infinite ${delay}`,
        flexShrink: 0,
        ...style,
      }}
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

// Feed / Dashboard post card skeleton
function SkeletonCard() {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <SkeletonBlock height="180px" borderRadius="0" />
      <div style={{ padding: "14px" }}>
        <SkeletonBlock
          width="60%"
          height="16px"
          delay="0s"
          style={{ marginBottom: "10px" }}
        />
        <SkeletonBlock
          width="45%"
          height="12px"
          delay="0.1s"
          style={{ marginBottom: "8px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <SkeletonBlock width="30%" height="11px" delay="0.2s" />
          <SkeletonBlock width="25%" height="11px" delay="0.2s" />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <SkeletonBlock height="40px" borderRadius="10px" delay="0.3s" />
          <SkeletonBlock height="40px" borderRadius="10px" delay="0.3s" />
        </div>
      </div>
    </div>
  );
}

// Stat card skeleton (for Dashboard top row)
export function SkeletonStat() {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <SkeletonBlock
        width="32px"
        height="32px"
        borderRadius="8px"
        style={{ marginBottom: "10px" }}
      />
      <SkeletonBlock
        width="50%"
        height="24px"
        delay="0.1s"
        style={{ marginBottom: "6px" }}
      />
      <SkeletonBlock width="70%" height="11px" delay="0.2s" />
    </div>
  );
}

// Product card skeleton (for ComparePrices)
export function SkeletonProduct() {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "16px",
        padding: "18px",
        borderLeft: `3px solid ${theme.cardBorder}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div>
          <SkeletonBlock
            width="140px"
            height="16px"
            style={{ marginBottom: "6px" }}
          />
          <SkeletonBlock width="90px" height="11px" delay="0.1s" />
        </div>
        <SkeletonBlock
          width="70px"
          height="26px"
          borderRadius="6px"
          delay="0.1s"
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <SkeletonBlock height="52px" borderRadius="10px" delay="0.1s" />
        <SkeletonBlock height="52px" borderRadius="10px" delay="0.2s" />
        <SkeletonBlock height="52px" borderRadius="10px" delay="0.3s" />
      </div>
      <SkeletonBlock height="36px" borderRadius="8px" delay="0.3s" />
    </div>
  );
}

// Settings row skeleton
export function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        gap: "12px",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}
      >
        <SkeletonBlock width="28px" height="28px" borderRadius="8px" />
        <div style={{ flex: 1 }}>
          <SkeletonBlock
            width="55%"
            height="14px"
            style={{ marginBottom: "6px" }}
          />
          <SkeletonBlock width="80%" height="11px" delay="0.1s" />
        </div>
      </div>
      <SkeletonBlock
        width="44px"
        height="24px"
        borderRadius="12px"
        delay="0.2s"
      />
    </div>
  );
}

export default SkeletonCard;
