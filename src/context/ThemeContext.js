import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Read saved preference, fallback to dark mode
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("pw-theme");
      if (saved !== null) return saved === "dark";
    } catch (e) {}
    return true; // default: dark
  });

  // Persist whenever theme changes
  useEffect(() => {
    try {
      localStorage.setItem("pw-theme", dark ? "dark" : "light");
    } catch (e) {}
    // Also update the html background instantly (avoids flash on reload)
    document.documentElement.style.background = dark ? "#08080f" : "#f4f4f8";
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);

  const theme = {
    dark,
    toggleTheme,
    bg: dark ? "#08080f" : "#f4f4f8",
    sidebar: dark ? "#0c0c18" : "#ffffff",
    sidebarBorder: dark ? "#1a1a2e" : "#e8e8f0",
    card: dark ? "#0f0f1f" : "#ffffff",
    cardBorder: dark ? "#1a1a2e" : "#e8e8f0",
    text: dark ? "#e8e8f0" : "#0f0f1a",
    textMuted: dark ? "#555" : "#999",
    textDim: dark ? "#333" : "#bbb",
    input: dark ? "#0c0c18" : "#f0f0f8",
    inputBorder: dark ? "#1a1a2e" : "#ddd",
    accent: dark ? "#00e676" : "#00a855",
    accentText: "#0a0a0f",
    pill: dark ? "#1a1a2e" : "#f0f0f8",
    pillText: dark ? "#888" : "#666",
    navActive: dark ? "rgba(0,230,118,0.08)" : "rgba(0,168,85,0.08)",
    navActiveBorder: dark ? "#00e676" : "#00a855",
    navActiveText: dark ? "#00e676" : "#00a855",
    navText: dark ? "#555" : "#aaa",
    profileBg: dark ? "#1a1a2e" : "#f0f0f8",
    commentBg: dark ? "#1a1a2e" : "#f5f5fc",
    toggleBg: dark ? "#1a1a2e" : "#e8e8f0",
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
