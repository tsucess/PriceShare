import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";

const flaggedItems = [
  {
    id: 1,
    product: "Rice (50kg bag)",
    reportedPrice: 120000,
    avgPrice: 75000,
    market: "Idumota Market",
    state: "Lagos",
    reports: 14,
    date: "March 8, 2026",
    status: "Under Review",
  },
  {
    id: 2,
    product: "Petrol (litre)",
    reportedPrice: 1500,
    avgPrice: 897,
    market: "Independent Station",
    state: "Oyo",
    reports: 22,
    date: "March 7, 2026",
    status: "Escalated",
  },
  {
    id: 3,
    product: "Paracetamol (pack)",
    reportedPrice: 2000,
    avgPrice: 450,
    market: "Ketu Market",
    state: "Lagos",
    reports: 9,
    date: "March 6, 2026",
    status: "Under Review",
  },
  {
    id: 4,
    product: "Garri (1kg)",
    reportedPrice: 3000,
    avgPrice: 800,
    market: "Wuse Market",
    state: "FCT - Abuja",
    reports: 17,
    date: "March 5, 2026",
    status: "Resolved",
  },
  {
    id: 5,
    product: "Tomatoes (basket)",
    reportedPrice: 15000,
    avgPrice: 3500,
    market: "Bodija Market",
    state: "Oyo",
    reports: 11,
    date: "March 4, 2026",
    status: "Escalated",
  },
  {
    id: 6,
    product: "Chicken (1kg)",
    reportedPrice: 8000,
    avgPrice: 2800,
    market: "Mile 12 Market",
    state: "Lagos",
    reports: 8,
    date: "March 3, 2026",
    status: "Resolved",
  },
];

const statusConfig = {
  "Under Review": {
    color: "#ffd600",
    bg: "rgba(255,214,0,0.1)",
    border: "rgba(255,214,0,0.3)",
  },
  Escalated: {
    color: "#ff4d6d",
    bg: "rgba(255,77,109,0.1)",
    border: "rgba(255,77,109,0.3)",
  },
  Resolved: {
    color: "#00e676",
    bg: "rgba(0,230,118,0.1)",
    border: "rgba(0,230,118,0.3)",
  },
};

function GovReport() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = flaggedItems.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "review") return item.status === "Under Review";
    if (activeTab === "escalated") return item.status === "Escalated";
    if (activeTab === "resolved") return item.status === "Resolved";
    return true;
  });

  const getOvercharge = (reported, avg) =>
    Math.round(((reported - avg) / avg) * 100);

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "24px",
            padding: "60px 50px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: "420px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏛️</div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: theme.text,
              marginBottom: "10px",
            }}
          >
            Report Escalated!
          </h2>
          <p
            style={{
              color: theme.textMuted,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            This case has been sent to the Consumer Protection Council (CPC) and
            the Ministry of Trade and Investment.
          </p>
          <div
            style={{
              marginTop: "24px",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(0,230,118,0.08)",
              border: "1px solid rgba(0,230,118,0.2)",
            }}
          >
            <p
              style={{
                color: "#00e676",
                fontSize: "13px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Thank you for helping fight price gouging in Nigeria 🇳🇬
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedItem(null);
            }}
            style={{
              marginTop: "28px",
              padding: "13px 32px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 20px ${theme.accent}40`,
            }}
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: "all 0.3s",
      }}
    >
      <Sidebar />

      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        {!selectedItem ? (
          <>
            {/* HEADER */}
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: theme.textMuted,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Government Report
              </div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: theme.text,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Flagged{" "}
                <span style={{ color: "#ff4d6d" }}>Price Violations</span>
              </h1>
              <p
                style={{
                  color: theme.textMuted,
                  fontSize: "13px",
                  marginTop: "6px",
                }}
              >
                Extreme price gouging cases escalated to the appropriate
                Nigerian authorities
              </p>
            </div>

            {/* NOTICE BANNER */}
            <div
              style={{
                background: "rgba(255,214,0,0.06)",
                border: "1px solid rgba(255,214,0,0.2)",
                borderRadius: "16px",
                padding: "20px 24px",
                marginBottom: "32px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                borderLeft: "3px solid #ffd600",
              }}
            >
              <span style={{ fontSize: "24px", flexShrink: 0 }}>⚠️</span>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: "#ffd600",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  How this works
                </p>
                <p
                  style={{
                    color: theme.textMuted,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  When a product's reported price significantly exceeds the
                  national average, it gets automatically flagged. Our team
                  reviews cases and escalates extreme violations to the{" "}
                  <strong style={{ color: theme.text }}>
                    Consumer Protection Council (CPC)
                  </strong>{" "}
                  and relevant government agencies.
                </p>
              </div>
            </div>

            {/* SUMMARY STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                {
                  icon: "🚨",
                  value: "6",
                  label: "Active Flags",
                  color: "#ff4d6d",
                },
                {
                  icon: "📨",
                  value: "3",
                  label: "Escalated to Govt",
                  color: "#ffd600",
                },
                {
                  icon: "✅",
                  value: "2",
                  label: "Resolved Cases",
                  color: "#00e676",
                },
                {
                  icon: "👥",
                  value: "81",
                  label: "Total Reports",
                  color: "#00b0ff",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "16px",
                    padding: "24px 20px",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                    }}
                  />
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: stat.color,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      marginTop: "6px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* TABS */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginBottom: "24px",
                background: theme.card,
                padding: "4px",
                borderRadius: "10px",
                width: "fit-content",
                border: `1px solid ${theme.cardBorder}`,
              }}
            >
              {[
                { key: "all", label: "All Cases" },
                { key: "review", label: "🔍 Under Review" },
                { key: "escalated", label: "🚨 Escalated" },
                { key: "resolved", label: "✅ Resolved" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background:
                      activeTab === tab.key
                        ? theme.dark
                          ? "#1e1e2e"
                          : "#f0f0f8"
                        : "transparent",
                    color:
                      activeTab === tab.key ? theme.accent : theme.textMuted,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FLAGGED LIST */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {filtered.map((item) => {
                const sc = statusConfig[item.status];
                const overcharge = getOvercharge(
                  item.reportedPrice,
                  item.avgPrice,
                );
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: "16px",
                      padding: "24px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = sc.color;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.cardBorder;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: theme.text,
                            margin: 0,
                          }}
                        >
                          {item.product}
                        </h3>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: theme.textMuted,
                          margin: "0 0 4px",
                        }}
                      >
                        📍 {item.market}, {item.state} · 🗓️ {item.date}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: theme.textDim,
                          margin: 0,
                        }}
                      >
                        👥 {item.reports} citizens reported this
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "32px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: "10px",
                            color: theme.textMuted,
                            marginBottom: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Reported Price
                        </p>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#ff4d6d",
                            margin: 0,
                          }}
                        >
                          ₦{item.reportedPrice.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: "10px",
                            color: theme.textMuted,
                            marginBottom: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Fair Price
                        </p>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#00e676",
                            margin: 0,
                          }}
                        >
                          ₦{item.avgPrice.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: "10px",
                            color: theme.textMuted,
                            marginBottom: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Overcharge
                        </p>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#ff6e40",
                            margin: 0,
                          }}
                        >
                          +{overcharge}%
                        </p>
                      </div>
                      <div style={{ color: theme.textDim, fontSize: "18px" }}>
                        →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* DETAIL VIEW */
          <div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: theme.accent,
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                marginBottom: "28px",
                padding: 0,
              }}
            >
              ← Back to all reports
            </button>

            {(() => {
              const sc = statusConfig[selectedItem.status];
              const overcharge = getOvercharge(
                selectedItem.reportedPrice,
                selectedItem.avgPrice,
              );
              return (
                <div
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: "20px",
                    padding: "36px",
                    borderTop: `3px solid ${sc.color}`,
                  }}
                >
                  {/* TITLE ROW */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "32px",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          color: theme.text,
                          margin: "0 0 6px",
                        }}
                      >
                        {selectedItem.product}
                      </h2>
                      <p
                        style={{
                          fontSize: "13px",
                          color: theme.textMuted,
                          margin: 0,
                        }}
                      >
                        📍 {selectedItem.market}, {selectedItem.state} · 🗓️{" "}
                        {selectedItem.date}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        fontWeight: 700,
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {selectedItem.status}
                    </span>
                  </div>

                  {/* PRICE BREAKDOWN */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                      marginBottom: "28px",
                    }}
                  >
                    {[
                      {
                        label: "Reported Gouging Price",
                        value: `₦${selectedItem.reportedPrice.toLocaleString()}`,
                        color: "#ff4d6d",
                        bg: "rgba(255,77,109,0.08)",
                      },
                      {
                        label: "National Average Price",
                        value: `₦${selectedItem.avgPrice.toLocaleString()}`,
                        color: "#00e676",
                        bg: "rgba(0,230,118,0.08)",
                      },
                      {
                        label: "Percentage Overcharge",
                        value: `+${overcharge}%`,
                        color: "#ff6e40",
                        bg: "rgba(255,110,64,0.08)",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: s.bg,
                          borderRadius: "14px",
                          padding: "24px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: theme.textMuted,
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          {s.label}
                        </p>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: 800,
                            color: s.color,
                            margin: 0,
                          }}
                        >
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CASE DETAILS */}
                  <div
                    style={{
                      background: theme.pill,
                      borderRadius: "14px",
                      padding: "20px",
                      marginBottom: "28px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: theme.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "16px",
                      }}
                    >
                      Case Details
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                      }}
                    >
                      {[
                        { label: "Product", value: selectedItem.product },
                        { label: "Market", value: selectedItem.market },
                        { label: "State", value: selectedItem.state },
                        { label: "Date Flagged", value: selectedItem.date },
                        {
                          label: "Citizens Reported",
                          value: `${selectedItem.reports} people`,
                        },
                        { label: "Status", value: selectedItem.status },
                      ].map((d) => (
                        <div
                          key={d.label}
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: theme.textMuted,
                              minWidth: "120px",
                            }}
                          >
                            {d.label}:
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: theme.text,
                            }}
                          >
                            {d.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ESCALATE or RESOLVED */}
                  {selectedItem.status !== "Resolved" ? (
                    <div
                      style={{
                        borderTop: `1px solid ${theme.cardBorder}`,
                        paddingTop: "28px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: theme.text,
                          marginBottom: "8px",
                        }}
                      >
                        Escalate to Government
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          color: theme.textMuted,
                          marginBottom: "20px",
                          lineHeight: 1.7,
                        }}
                      >
                        This will send an official report to the{" "}
                        <strong style={{ color: theme.text }}>
                          Consumer Protection Council (CPC)
                        </strong>{" "}
                        and the Ministry of Trade and Investment for immediate
                        action.
                      </p>
                      <button
                        onClick={() => setSubmitted(true)}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                          background:
                            "linear-gradient(135deg, #ff4d6d, #c62828)",
                          color: "#fff",
                          letterSpacing: "0.5px",
                          boxShadow: "0 4px 20px rgba(255,77,109,0.35)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "translateY(-2px)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "translateY(0)")
                        }
                      >
                        🚨 Escalate This Case to Government
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        borderTop: `1px solid ${theme.cardBorder}`,
                        paddingTop: "28px",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(0,230,118,0.08)",
                          border: "1px solid rgba(0,230,118,0.2)",
                          borderRadius: "14px",
                          padding: "28px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                          ✅
                        </div>
                        <p
                          style={{
                            fontWeight: 800,
                            color: "#00e676",
                            fontSize: "16px",
                            marginBottom: "6px",
                          }}
                        >
                          This case has been resolved
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: theme.textMuted,
                            margin: 0,
                          }}
                        >
                          The seller has adjusted their prices to fair market
                          value.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}

export default GovReport;
