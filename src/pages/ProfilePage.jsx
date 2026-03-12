import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/Sidebar";
import HapticButton from "../components/HapticButton";
import { ArrowLeft, Camera, Lock, Globe, Check, Upload, X } from "lucide-react";

const STATES = [
  "Lagos",
  "Oyo",
  "FCT - Abuja",
  "Kano",
  "Rivers",
  "Kaduna",
  "Anambra",
  "Delta",
  "Ogun",
  "Enugu",
  "Imo",
  "Edo",
  "Benue",
  "Plateau",
  "Sokoto",
];
const OCCUPATIONS = [
  "Student",
  "Trader / Seller",
  "Housewife / Homemaker",
  "Civil Servant",
  "Farmer",
  "Healthcare Worker",
  "Teacher",
  "Driver",
  "Engineer",
  "Other",
];
const GENDERS = ["Male", "Female", "Prefer not to say"];

// Preset avatars — diverse, fun, Nigerian-flavoured
const PRESET_AVATARS = [
  { id: "a1", emoji: "👨🏿‍💼", bg: "linear-gradient(135deg, #1a1a2e, #16213e)" },
  { id: "a2", emoji: "👩🏿‍💼", bg: "linear-gradient(135deg, #2d1b69, #4a1942)" },
  { id: "a3", emoji: "👨🏾‍🌾", bg: "linear-gradient(135deg, #1b4332, #2d6a4f)" },
  { id: "a4", emoji: "👩🏾‍🍳", bg: "linear-gradient(135deg, #7f4f24, #b5632a)" },
  { id: "a5", emoji: "👨🏿‍🔬", bg: "linear-gradient(135deg, #023e8a, #0077b6)" },
  { id: "a6", emoji: "👩🏿‍🏫", bg: "linear-gradient(135deg, #6a0572, #ab2d82)" },
  { id: "a7", emoji: "🧕🏾", bg: "linear-gradient(135deg, #2b2d42, #555b6e)" },
  { id: "a8", emoji: "👨🏾‍💻", bg: "linear-gradient(135deg, #003049, #1a6b8a)" },
  { id: "a9", emoji: "👩🏾‍⚕️", bg: "linear-gradient(135deg, #004e64, #00a5cf)" },
  { id: "a10", emoji: "🧑🏿‍🎤", bg: "linear-gradient(135deg, #370617, #9d0208)" },
  { id: "a11", emoji: "👨🏿‍🍳", bg: "linear-gradient(135deg, #1b4332, #52b788)" },
  { id: "a12", emoji: "👩🏾‍💻", bg: "linear-gradient(135deg, #3a0ca3, #7209b7)" },
];

// Gradient avatar colors (initials-based)
const GRADIENT_AVATARS = [
  "linear-gradient(135deg, #00e676, #00b0ff)",
  "linear-gradient(135deg, #ff4d6d, #ff9a3c)",
  "linear-gradient(135deg, #a855f7, #ec4899)",
  "linear-gradient(135deg, #ffd600, #ff6e40)",
  "linear-gradient(135deg, #00b0ff, #0040ff)",
  "linear-gradient(135deg, #00e676, #ffd600)",
];

function ProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState("upload"); // 'upload' | 'preset' | 'gradient'

  // Avatar state — can be: { type: 'image', src: '...' } | { type: 'preset', id: 'a1' } | { type: 'gradient', index: 0 }
  const [avatar, setAvatar] = useState({ type: "gradient", index: 0 });
  const [tempAvatar, setTempAvatar] = useState(null); // holds selection before confirming

  const [profile, setProfile] = useState({
    fullName: "Chidi Okeke",
    username: "chidi_okeke",
    bio: "Price reporter from Lagos. Helping Nigerians shop smarter 🇳🇬",
    phone: "+234 801 234 5678",
    state: "Lagos",
    occupation: "Trader / Seller",
    gender: "Male",
    dob: "1995-04-12",
    visibility: "public",
  });

  const [form, setForm] = useState({ ...profile });

  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Handle file upload from device
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) =>
      setTempAvatar({ type: "image", src: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleAvatarConfirm = () => {
    if (tempAvatar) setAvatar(tempAvatar);
    setShowAvatarModal(false);
    setTempAvatar(null);
    showToast("Avatar updated! 🎉", "success");
  };

  const handleAvatarCancel = () => {
    setShowAvatarModal(false);
    setTempAvatar(null);
  };

  const renderAvatar = (av, size = 96) => {
    const fontSize = size * 0.33;
    const emojiSize = size * 0.52;
    if (av.type === "image") {
      return (
        <img
          src={av.src}
          alt="avatar"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      );
    }
    if (av.type === "preset") {
      const p = PRESET_AVATARS.find((x) => x.id === av.id);
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: p.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: emojiSize,
          }}
        >
          {p.emoji}
        </div>
      );
    }
    // gradient
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: GRADIENT_AVATARS[av.index],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 800,
          color: "#0a0a0f",
        }}
      >
        {initials}
      </div>
    );
  };

  const handleSave = () => {
    if (!form.fullName.trim()) {
      showToast("Full name is required", "warning");
      return;
    }
    if (!form.username.trim()) {
      showToast("Username is required", "warning");
      return;
    }
    setProfile({ ...form });
    setEditing(false);
    localStorage.setItem("pw-profile-complete", "true");
    showToast("Profile updated! 🎉", "success");
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setEditing(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    border: `1px solid ${editing ? theme.accent : theme.cardBorder}`,
    background: theme.input,
    color: theme.text,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border 0.2s",
  };
  const selectStyle = { ...inputStyle, cursor: "pointer" };
  const labelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    color: theme.textMuted,
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: "18px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
  const ReadRow = ({ label, value, icon }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 0",
        borderBottom: `1px solid ${theme.cardBorder}`,
      }}
    >
      <span style={{ fontSize: "13px", color: theme.textMuted }}>
        {icon} {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: theme.text,
          textAlign: "right",
          maxWidth: "55%",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );

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

      <main style={{ flex: 1, overflowX: "hidden", paddingBottom: "60px" }}>
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <HapticButton
            onClick={() => navigate("/settings")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textMuted,
              padding: "8px 14px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} /> Settings
          </HapticButton>

          {!editing ? (
            <HapticButton
              onClick={() => {
                setForm({ ...profile });
                setEditing(true);
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                color: "#0a0a0f",
                border: "none",
              }}
            >
              Edit Profile
            </HapticButton>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <HapticButton
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9px",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: `1px solid ${theme.cardBorder}`,
                  background: "transparent",
                  color: theme.textMuted,
                }}
              >
                Cancel
              </HapticButton>
              <HapticButton
                onClick={handleSave}
                style={{
                  padding: "8px 20px",
                  borderRadius: "9px",
                  fontSize: "13px",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                  color: "#0a0a0f",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Check size={14} /> Save
              </HapticButton>
            </div>
          )}
        </div>

        {/* AVATAR SECTION */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <div
              style={{
                boxShadow: `0 8px 32px ${theme.accent}30`,
                border: `3px solid ${theme.card}`,
                borderRadius: "50%",
              }}
            >
              {renderAvatar(avatar, 96)}
            </div>
            {/* Camera button — always visible so user can change photo anytime */}
            <button
              onClick={() => {
                setTempAvatar(null);
                setShowAvatarModal(true);
              }}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: theme.accent,
                border: `2px solid ${theme.bg}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#0a0a0f",
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: theme.text,
              margin: "0 0 4px",
            }}
          >
            {profile.fullName}
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: theme.accent,
              margin: "0 0 6px",
              fontWeight: 600,
            }}
          >
            @{profile.username}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: theme.pill,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            {profile.visibility === "public" ? (
              <>
                <Globe size={12} color={theme.accent} />
                <span
                  style={{
                    fontSize: "11px",
                    color: theme.accent,
                    fontWeight: 700,
                  }}
                >
                  Public Profile
                </span>
              </>
            ) : (
              <>
                <Lock size={12} color={theme.textMuted} />
                <span
                  style={{
                    fontSize: "11px",
                    color: theme.textMuted,
                    fontWeight: 700,
                  }}
                >
                  Private Profile
                </span>
              </>
            )}
          </div>
          {!editing && profile.bio && (
            <p
              style={{
                fontSize: "13px",
                color: theme.textMuted,
                textAlign: "center",
                maxWidth: "300px",
                lineHeight: 1.6,
                marginTop: "12px",
              }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          {[
            { label: "Posts", value: "3", color: theme.accent },
            { label: "Likes", value: "73", color: "#ff4d6d" },
            { label: "Comments", value: "16", color: "#00b0ff" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "12px",
                padding: "14px 8px",
              }}
            >
              <div
                style={{ fontSize: "22px", fontWeight: 800, color: s.color }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  marginTop: "3px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* EDIT FORM */}
        {editing ? (
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth > 768 ? "1fr 1fr" : "1fr",
                gap: "0 24px",
              }}
            >
              <Field label="Full Name *">
                <input
                  style={inputStyle}
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Username *">
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: theme.accent,
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    @
                  </span>
                  <input
                    style={{ ...inputStyle, paddingLeft: "28px" }}
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username: e.target.value
                          .replace(/\s/g, "")
                          .toLowerCase(),
                      })
                    }
                    placeholder="your_handle"
                  />
                </div>
              </Field>
              <Field label="Phone Number">
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  type="tel"
                />
              </Field>
              <Field label="Home State">
                <select
                  style={selectStyle}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                >
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Occupation">
                <select
                  style={selectStyle}
                  value={form.occupation}
                  onChange={(e) =>
                    setForm({ ...form, occupation: e.target.value })
                  }
                >
                  {OCCUPATIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Gender">
                <select
                  style={selectStyle}
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  {GENDERS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date of Birth">
                <input
                  style={inputStyle}
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </Field>
              <Field label="Profile Visibility">
                <div style={{ display: "flex", gap: "10px" }}>
                  {["public", "private"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm({ ...form, visibility: v })}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: `1px solid ${form.visibility === v ? theme.accent : theme.cardBorder}`,
                        background:
                          form.visibility === v
                            ? `${theme.accent}15`
                            : "transparent",
                        color:
                          form.visibility === v
                            ? theme.accent
                            : theme.textMuted,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {v === "public" ? (
                        <Globe size={14} />
                      ) : (
                        <Lock size={14} />
                      )}
                      {v === "public" ? "Public" : "Private"}
                    </button>
                  ))}
                </div>
              </Field>
              <div
                style={{
                  gridColumn: window.innerWidth > 768 ? "1 / -1" : undefined,
                }}
              >
                <Field label="Bio">
                  <textarea
                    style={{
                      ...inputStyle,
                      resize: "none",
                      minHeight: "90px",
                      lineHeight: 1.6,
                    }}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell the community about yourself..."
                    maxLength={150}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      textAlign: "right",
                      marginTop: "4px",
                    }}
                  >
                    {form.bio.length}/150
                  </div>
                </Field>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "20px",
              padding: "20px 24px",
            }}
          >
            <ReadRow label="Phone" icon="📞" value={profile.phone} />
            <ReadRow label="State" icon="📍" value={profile.state} />
            <ReadRow label="Occupation" icon="💼" value={profile.occupation} />
            <ReadRow label="Gender" icon="⚧" value={profile.gender} />
            <ReadRow
              label="Birthday"
              icon="🎂"
              value={
                profile.dob
                  ? new Date(profile.dob).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : null
              }
            />
            <ReadRow
              label="Visibility"
              icon="🔒"
              value={profile.visibility === "public" ? "Public" : "Private"}
            />
          </div>
        )}
      </main>

      {/* ================================================ */}
      {/* AVATAR PICKER MODAL                              */}
      {/* ================================================ */}
      {showAvatarModal && (
        <div
          onClick={handleAvatarCancel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.card,
              borderRadius: "24px 24px 0 0",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "85vh",
              overflowY: "auto",
              animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: theme.text,
                  margin: 0,
                }}
              >
                Choose Profile Photo
              </h3>
              <button
                onClick={handleAvatarCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: theme.textMuted,
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* PREVIEW */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ position: "relative" }}>
                {renderAvatar(tempAvatar || avatar, 80)}
                {tempAvatar && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: theme.accent,
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={12} color="#0a0a0f" />
                  </div>
                )}
              </div>
            </div>

            {/* TABS */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: theme.bg,
                padding: "4px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: `1px solid ${theme.cardBorder}`,
              }}
            >
              {[
                { key: "upload", label: "📁 Upload" },
                { key: "camera", label: "📷 Camera" },
                { key: "preset", label: "🧑🏿 Avatars" },
                { key: "gradient", label: "🎨 Initials" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setAvatarTab(t.key)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background:
                      avatarTab === t.key
                        ? theme.dark
                          ? "#1e1e2e"
                          : "#f0f0f8"
                        : "transparent",
                    color: avatarTab === t.key ? theme.accent : theme.textMuted,
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* UPLOAD TAB */}
            {avatarTab === "upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: `2px dashed ${theme.accent}50`,
                    borderRadius: "14px",
                    padding: "40px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: `${theme.accent}05`,
                    transition: "all 0.2s",
                  }}
                >
                  <Upload
                    size={32}
                    color={theme.accent}
                    style={{ marginBottom: "12px" }}
                  />
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: theme.text,
                      margin: "0 0 4px",
                    }}
                  >
                    Tap to upload a photo
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: theme.textMuted,
                      margin: 0,
                    }}
                  >
                    From your phone gallery or laptop — JPG, PNG, max 5MB
                  </p>
                </div>
              </div>
            )}

            {/* CAMERA TAB */}
            {avatarTab === "camera" && (
              <div>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => cameraInputRef.current.click()}
                  style={{
                    border: `2px dashed ${theme.accent}50`,
                    borderRadius: "14px",
                    padding: "40px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: `${theme.accent}05`,
                  }}
                >
                  <Camera
                    size={32}
                    color={theme.accent}
                    style={{ marginBottom: "12px" }}
                  />
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: theme.text,
                      margin: "0 0 4px",
                    }}
                  >
                    Take a selfie
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: theme.textMuted,
                      margin: 0,
                    }}
                  >
                    Opens your camera directly — works on mobile and laptop
                  </p>
                </div>
              </div>
            )}

            {/* PRESET AVATARS TAB */}
            {avatarTab === "preset" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                }}
              >
                {PRESET_AVATARS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setTempAvatar({ type: "preset", id: p.id })}
                    style={{
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: `3px solid ${tempAvatar?.id === p.id ? theme.accent : "transparent"}`,
                      transition: "all 0.2s",
                      transform:
                        tempAvatar?.id === p.id ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: p.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                      }}
                    >
                      {p.emoji}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GRADIENT INITIALS TAB */}
            {avatarTab === "gradient" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {GRADIENT_AVATARS.map((bg, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setTempAvatar({ type: "gradient", index: i })
                    }
                    style={{
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: `3px solid ${tempAvatar?.index === i && tempAvatar?.type === "gradient" ? theme.accent : "transparent"}`,
                      transition: "all 0.2s",
                      transform:
                        tempAvatar?.index === i &&
                        tempAvatar?.type === "gradient"
                          ? "scale(1.1)"
                          : "scale(1)",
                      width: "70px",
                      height: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: 800,
                        color: "#0a0a0f",
                      }}
                    >
                      {initials}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONFIRM BUTTON */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <HapticButton
                onClick={handleAvatarCancel}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: `1px solid ${theme.cardBorder}`,
                  background: "transparent",
                  color: theme.textMuted,
                }}
              >
                Cancel
              </HapticButton>
              <HapticButton
                onClick={handleAvatarConfirm}
                disabled={!tempAvatar}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  background: tempAvatar
                    ? `linear-gradient(135deg, ${theme.accent}, #00c853)`
                    : theme.cardBorder,
                  color: tempAvatar ? "#0a0a0f" : theme.textMuted,
                  transition: "all 0.3s",
                }}
              >
                {tempAvatar ? "Use This Photo" : "Select an option above"}
              </HapticButton>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default ProfilePage;
