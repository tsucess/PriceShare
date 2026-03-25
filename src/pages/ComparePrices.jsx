import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { getPosts } from "../services/api";
import Sidebar from "../components/Sidebar";
import HapticButton from "../components/HapticButton";
import { SkeletonProduct } from "../components/SkeletonCard";

// Transform flat posts array from API into grouped-by-product format
function groupPostsByProduct(posts) {
  const map = {};
  posts.forEach((post) => {
    const key = (post.product || "Unknown").trim();
    if (!map[key]) {
      map[key] = { name: key, category: post.category || "General", reports: [] };
    }
    map[key].reports.push({
      id: post.id,
      market: post.market || "Unknown Market",
      state: post.state || "",
      price: Number(post.price) || 0,
      user: post.user?.name || "Anonymous",
      date: post.created_at
        ? new Date(post.created_at).toLocaleDateString("en-NG", {
            day: "numeric", month: "long", year: "numeric",
          })
        : "",
    });
  });
  return Object.values(map);
}



const categoryColors = {
  "Food & Groceries": "#00e676",
  "Vegetables & Fruits": "#69f0ae",
  "Meat & Poultry": "#ff6e40",
  "Fuel & Energy": "#ffd600",
  Healthcare: "#00b0ff",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function ComparePrices() {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOrder, setSortOrder] = useState("lowest");
  const debounceRef = useRef(null);

  const fetchProducts = useCallback(async (query) => {
    setLoading(true);
    try {
      const params = { per_page: 200 };
      if (query) params.search = query;
      const res = await getPosts(params);
      const posts = res.data?.data ?? res.data ?? [];
      setProducts(groupPostsByProduct(Array.isArray(posts) ? posts : []));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchProducts(""); }, [fetchProducts]);

  // Debounced search re-fetch
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(search.trim());
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search, fetchProducts]);

  const filtered = products;
  const getMin = (r) => Math.min(...r.map((x) => x.price));
  const getMax = (r) => Math.max(...r.map((x) => x.price));
  const getAvg = (r) =>
    Math.round(r.reduce((a, b) => a + b.price, 0) / r.length);
  const getSorted = (r) =>
    [...r].sort((a, b) =>
      sortOrder === "lowest" ? a.price - b.price : b.price - a.price,
    );
  const getPriceColor = (price, min, max) =>
    price === min ? "#00e676" : price === max ? "#ff4d6d" : theme.text;

  const PriceBadge = ({ price, min, max }) => {
    if (price === min)
      return (
        <span
          style={{
            fontSize: "10px",
            background: "rgba(0,230,118,0.15)",
            color: "#00e676",
            padding: "3px 8px",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          Cheapest
        </span>
      );
    if (price === max)
      return (
        <span
          style={{
            fontSize: "10px",
            background: "rgba(255,77,109,0.15)",
            color: "#ff4d6d",
            padding: "3px 8px",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          Most Expensive
        </span>
      );
    return null;
  };

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

      <main style={{ flex: 1, overflowX: "hidden" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "10px",
              color: theme.textMuted,
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Compare Prices
          </div>
          <h1
            style={{
              fontSize: "clamp(20px, 5vw, 28px)",
              fontWeight: 800,
              color: theme.text,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Find the <span style={{ color: theme.accent }}>best price</span>{" "}
            near you
          </h1>
          <p
            style={{
              color: theme.textMuted,
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            Search any product and compare prices across Nigeria
          </p>
        </div>

        {/* SEARCH */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "12px",
            padding: "6px 6px 6px 16px",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: theme.textMuted }}>🔍</span>
          <input
            type="text"
            placeholder="Search e.g. Garri, Rice, Petrol..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedProduct(null);
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: theme.text,
              padding: "10px 0",
            }}
          />
          {search.length > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedProduct(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: theme.textMuted,
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px 8px",
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* PRODUCT LIST */}
        {!selectedProduct && (
          <>
            <p
              style={{
                fontSize: "12px",
                color: theme.textMuted,
                marginBottom: "16px",
              }}
            >
              <span style={{ color: theme.text, fontWeight: 700 }}>
                {loading ? "…" : filtered.length}
              </span>{" "}
              product{filtered.length !== 1 ? "s" : ""} — tap one to compare
            </p>

            {/* 1 col mobile, 2 col desktop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: "14px",
              }}
            >
              {loading ? (
                <>
                  <SkeletonProduct />
                  <SkeletonProduct />
                  <SkeletonProduct />
                </>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "60px 24px",
                  }}
                >
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                    🔍
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: theme.text,
                      marginBottom: "8px",
                    }}
                  >
                    No price reports found
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: theme.textMuted,
                      marginBottom: "24px",
                    }}
                  >
                    {search ? "No reports match your search. Try a different term or " : "No price reports yet. "}
                    be the first to submit one!
                  </p>
                  <HapticButton
                    onClick={() => setSearch("")}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                      color: "#0a0a0f",
                      border: "none",
                    }}
                  >
                    Clear Search
                  </HapticButton>
                </div>
              ) : (
                filtered.map((product) => {
                  const catColor =
                    categoryColors[product.category] || theme.accent;
                  return (
                    <HapticButton
                      key={product.name}
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        background: theme.card,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: "16px",
                        padding: "18px",
                        cursor: "pointer",
                        borderLeft: `3px solid ${catColor}`,
                        display: "block",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "14px",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: theme.text,
                              margin: "0 0 3px",
                            }}
                          >
                            {product.name}
                          </h3>
                          <span
                            style={{
                              fontSize: "11px",
                              color: catColor,
                              fontWeight: 600,
                            }}
                          >
                            {product.category}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            background: theme.pill,
                            color: theme.pillText,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {product.reports.length} reports
                        </span>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        {[
                          {
                            label: "Lowest",
                            value: `₦${getMin(product.reports).toLocaleString()}`,
                            color: "#00e676",
                            bg: "rgba(0,230,118,0.08)",
                          },
                          {
                            label: "Average",
                            value: `₦${getAvg(product.reports).toLocaleString()}`,
                            color: theme.text,
                            bg: theme.pill,
                          },
                          {
                            label: "Highest",
                            value: `₦${getMax(product.reports).toLocaleString()}`,
                            color: "#ff4d6d",
                            bg: "rgba(255,77,109,0.08)",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              textAlign: "center",
                              background: s.bg,
                              borderRadius: "10px",
                              padding: "10px 6px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "9px",
                                color: theme.textMuted,
                                marginBottom: "4px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {s.label}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
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
                      <div
                        style={{
                          background: `${catColor}10`,
                          border: `1px solid ${catColor}20`,
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            color: catColor,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          💡 Save up to ₦
                          {(
                            getMax(product.reports) - getMin(product.reports)
                          ).toLocaleString()}{" "}
                          by comparing!
                        </p>
                      </div>
                    </HapticButton>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* PRODUCT DETAIL */}
        {selectedProduct && (
          <div>
            {/* BACK BUTTON */}
            <HapticButton
              onClick={() => setSelectedProduct(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: theme.accent,
                fontWeight: 600,
                background: "none",
                border: "none",
                marginBottom: "20px",
                padding: 0,
              }}
            >
              ← Back to all products
            </HapticButton>

            {/* SUMMARY CARD */}
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
                borderTop: `3px solid ${categoryColors[selectedProduct.category] || theme.accent}`,
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: theme.text,
                  margin: "0 0 4px",
                }}
              >
                {selectedProduct.name}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  margin: "0 0 16px",
                }}
              >
                {selectedProduct.category} · {selectedProduct.reports.length}{" "}
                reports
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                {[
                  {
                    label: "Cheapest",
                    value: `₦${getMin(selectedProduct.reports).toLocaleString()}`,
                    color: "#00e676",
                    bg: "rgba(0,230,118,0.08)",
                  },
                  {
                    label: "Average",
                    value: `₦${getAvg(selectedProduct.reports).toLocaleString()}`,
                    color: theme.text,
                    bg: theme.pill,
                  },
                  {
                    label: "Highest",
                    value: `₦${getMax(selectedProduct.reports).toLocaleString()}`,
                    color: "#ff4d6d",
                    bg: "rgba(255,77,109,0.08)",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: s.bg,
                      borderRadius: "10px",
                      padding: "12px 8px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "9px",
                        color: theme.textMuted,
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontSize: "16px",
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
              <div
                style={{
                  background: `${theme.accent}10`,
                  border: `1px solid ${theme.accent}20`,
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: theme.accent,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  💡 Save up to ₦
                  {(
                    getMax(selectedProduct.reports) -
                    getMin(selectedProduct.reports)
                  ).toLocaleString()}{" "}
                  by buying at the cheapest location!
                </p>
              </div>
            </div>

            {/* SORT + PRICE BARS */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                flexWrap: "wrap",
                gap: "10px",
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
                Price breakdown
              </h3>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: `1px solid ${theme.cardBorder}`,
                  background: theme.card,
                  color: theme.textMuted,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="lowest">Lowest First</option>
                <option value="highest">Highest First</option>
              </select>
            </div>

            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {getSorted(selectedProduct.reports).map((report, index) => {
                  const min = getMin(selectedProduct.reports);
                  const max = getMax(selectedProduct.reports);
                  const pct = ((report.price - min) / (max - min || 1)) * 100;
                  const barColor =
                    report.price === min
                      ? "#00e676"
                      : report.price === max
                        ? "#ff4d6d"
                        : "#ffd600";
                  return (
                    <div key={index}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                          gap: "8px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginBottom: "2px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: theme.text,
                              }}
                            >
                              {report.market}
                            </span>
                            <PriceBadge
                              price={report.price}
                              min={min}
                              max={max}
                            />
                          </div>
                          <span
                            style={{ fontSize: "11px", color: theme.textMuted }}
                          >
                            📍 {report.state}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: getPriceColor(report.price, min, max),
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          ₦{report.price.toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          background: theme.pill,
                          borderRadius: "99px",
                          height: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(pct, 5)}%`,
                            height: "100%",
                            background: barColor,
                            borderRadius: "99px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: theme.textDim,
                          marginTop: "5px",
                        }}
                      >
                        Reported by {report.user} · {report.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALL REPORTS */}
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "40px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: theme.text,
                  marginBottom: "16px",
                }}
              >
                All Reports
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {getSorted(selectedProduct.reports).map((report, i) => {
                  const min = getMin(selectedProduct.reports);
                  const max = getMax(selectedProduct.reports);
                  return (
                    <div
                      key={i}
                      style={{
                        background: theme.pill,
                        borderRadius: "12px",
                        padding: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: theme.text,
                            }}
                          >
                            {report.market}
                          </span>
                          <PriceBadge
                            price={report.price}
                            min={min}
                            max={max}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: "11px",
                            color: theme.textMuted,
                            margin: "0 0 2px",
                          }}
                        >
                          📍 {report.state}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: theme.textDim,
                            margin: 0,
                          }}
                        >
                          👤 {report.user} · {report.date}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: getPriceColor(report.price, min, max),
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        ₦{report.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ComparePrices;
