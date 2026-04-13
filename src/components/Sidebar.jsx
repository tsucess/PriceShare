import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Rss,
  PlusSquare,
  BarChart2,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Rss, label: "Feed", path: "/feed" },
  { icon: PlusSquare, label: "Post", path: "/post" },
  { icon: BarChart2, label: "Compare", path: "/compare" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const GRADIENT_AVATARS = [
  "linear-gradient(135deg, #00e676, #00b0ff)",
  "linear-gradient(135deg, #ff4d6d, #ff9a3c)",
  "linear-gradient(135deg, #a855f7, #ec4899)",
  "linear-gradient(135deg, #ffd600, #ff6e40)",
  "linear-gradient(135deg, #00b0ff, #0040ff)",
  "linear-gradient(135deg, #00e676, #ffd600)",
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bouncing, setBouncing] = useState(null);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarGradient = GRADIENT_AVATARS[0];

  const AvatarCircle = ({ size = 36, fontSize = 11 }) =>
    user?.avatar_url ? (
      <img
        src={user.avatar_url}
        alt="avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
        }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: avatarGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 800,
          color: "#0a0a0f",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );

  const handleNavClick = (path) => {
    setBouncing(path);
    setTimeout(() => setBouncing(null), 400);
    navigate(path);
  };

  return (
    <>
      {/* ================================ */}
      {/* DESKTOP SIDEBAR                  */}
      {/* ================================ */}
      <aside
        className="desktop-sidebar"
        style={{
          width: "220px",
          background: theme.sidebar,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: "32px 16px",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
          transition: "all 0.3s",
          flexShrink: 0,
          overflowY: "auto",
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          style={{
            marginBottom: "48px",
            paddingLeft: "12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "4px",
              color: theme.accent,
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            PriceShare
          </div>
          <div
            style={{
              fontSize: "10px",
              color: theme.textMuted,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Nigeria
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            const isBouncing = bouncing === item.path;
            return (
              <div
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 400,
                  background: active ? theme.navActive : "transparent",
                  color: active ? theme.navActiveText : theme.navText,
                  borderLeft: `2px solid ${active ? theme.navActiveBorder : "transparent"}`,
                  transition: "all 0.15s",
                  transform: isBouncing ? "scale(0.95)" : "scale(1)",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {t(item.label)}
              </div>
            );
          })}
        </nav>

        {/* PROFILE */}
        <div
          onClick={() => navigate("/profile")}
          style={{
            padding: "14px",
            background: theme.profileBg,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <AvatarCircle size={36} fontSize={11} />
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: theme.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Your Name"}
            </div>
            <div style={{ fontSize: "11px", color: theme.textMuted }}>
              {user?.state ? `${user.state}, NG` : "Nigeria"}
            </div>
          </div>
        </div>
      </aside>

      {/* ================================ */}
      {/* MOBILE TOP BAR                   */}
      {/* ================================ */}
      <div
        className="mobile-topbar"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: theme.sidebar,
          borderBottom: `1px solid ${theme.sidebarBorder}`,
          padding: "14px 20px",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s",
        }}
      >
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              color: theme.accent,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            PriceShare
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
        <div onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <AvatarCircle size={36} fontSize={11} />
        </div>
      </div>

      {/* ================================ */}
      {/* MOBILE BOTTOM NAV                */}
      {/* ================================ */}
      <div
        className="mobile-bottomnav"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: theme.sidebar,
          borderTop: `1px solid ${theme.sidebarBorder}`,
          paddingTop: "8px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
          }}
        >
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isPost = item.path === "/post";
            const isBouncing = bouncing === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  cursor: "pointer",
                  padding: "4px 12px",
                  minWidth: "56px",
                }}
              >
                <div
                  style={{
                    width: isPost ? "50px" : "38px",
                    height: isPost ? "50px" : "38px",
                    borderRadius: isPost ? "16px" : "11px",
                    background: isPost
                      ? `linear-gradient(135deg, ${theme.accent}, #00c853)`
                      : active
                        ? theme.navActive
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isPost
                      ? "#0a0a0f"
                      : active
                        ? theme.navActiveText
                        : theme.navText,
                    marginTop: isPost ? "-18px" : "0",
                    boxShadow: isPost ? `0 6px 20px ${theme.accent}60` : "none",
                    border:
                      active && !isPost
                        ? `1px solid ${theme.navActiveBorder}30`
                        : "none",
                    // Bounce animation
                    transform: isBouncing
                      ? "scale(0.82) translateY(3px)"
                      : active && !isPost
                        ? "translateY(-2px)"
                        : "scale(1) translateY(0)",
                    transition: isBouncing
                      ? "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, color 0.2s",
                  }}
                >
                  <Icon
                    size={isPost ? 22 : 19}
                    strokeWidth={active || isPost ? 2.5 : 1.8}
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: active ? 700 : 400,
                    color: isPost
                      ? theme.accent
                      : active
                        ? theme.navActiveText
                        : theme.navText,
                    marginTop: "1px",
                    transition: "color 0.2s",
                  }}
                >
                  {t(item.label)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: flex !important; }
          .mobile-bottomnav { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar    { display: none !important; }
          .mobile-bottomnav { display: none !important; }
          .desktop-sidebar  { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
