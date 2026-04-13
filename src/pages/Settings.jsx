import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { deleteMe, authChangePassword, updateSettings, getUserPosts } from '../services/api';
import Sidebar from '../components/Sidebar';
import HapticButton from '../components/HapticButton';
import { SkeletonRow, SkeletonBlock } from '../components/SkeletonCard';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function Settings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [notifications, setNotifications] = useState({
    priceAlerts: true, newComments: true, weeklyReport: false, govUpdates: true,
  });
  const [privacy, setPrivacy] = useState({
    showLocation: true, showProfile: true, allowDM: false,
  });
  const [twoFA, setTwoFA] = useState(false);
  const [language, setLanguage] = useState('English');
  const [region, setRegion] = useState(user?.state || 'Lagos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Load real post count for the profile stats card
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getUserPosts(user.id)
      .then((r) => {
        const data = r.data?.data ?? r.data ?? [];
        setPostsCount(Array.isArray(data) ? data.length : (data.total ?? 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // Persist notification / privacy setting changes to the backend
  const persistSettings = (updatedNotif, updatedPrivacy) => {
    updateSettings({
      notification_settings: updatedNotif,
      privacy_settings: updatedPrivacy,
    }).catch(() => {}); // silent — toggles already updated optimistically
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout(); // invalidates token on server, clears localStorage
    showToast('Signed out successfully 👋', 'info');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeletingAccount(true);
    try {
      await deleteMe();
      await logout();
      showToast('Account deleted 👋', 'error');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not delete account. Try again.';
      showToast(msg, 'error');
      setDeletingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current_password || !pwForm.password || !pwForm.password_confirmation) {
      showToast('Please fill all password fields.', 'error'); return;
    }
    if (pwForm.password !== pwForm.password_confirmation) {
      showToast('New passwords do not match.', 'error'); return;
    }
    setChangingPassword(true);
    try {
      await authChangePassword(pwForm);
      showToast('Password changed! Please sign in again.', 'success');
      setShowPasswordModal(false);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      await logout();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not change password.';
      showToast(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
        background: value ? theme.accent : theme.cardBorder,
        position: 'relative', transition: 'all 0.25s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px', left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: value ? '#0a0a0f' : theme.textMuted, transition: 'all 0.25s',
      }} />
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{
      background: theme.card, border: `1px solid ${theme.cardBorder}`,
      borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
      transition: 'all 0.3s',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${theme.cardBorder}`,
        fontSize: '11px', fontWeight: 700, color: theme.textMuted,
        letterSpacing: '1.5px', textTransform: 'uppercase',
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({ icon, label, desc, right }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: `1px solid ${theme.cardBorder}`,
      gap: '12px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '20px', width: '28px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{label}</div>
          {desc && <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', lineHeight: 1.4 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );

  const selectStyle = {
    padding: '6px 10px', borderRadius: '8px', fontSize: '13px',
    border: `1px solid ${theme.cardBorder}`, background: theme.pill,
    color: theme.text, outline: 'none', cursor: 'pointer',
  };

  const ghostBtn = {
    padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
    border: `1px solid ${theme.cardBorder}`, background: 'transparent',
    color: theme.textMuted, cursor: 'pointer',
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: theme.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: 'all 0.3s', overflowX: 'hidden',
    }}>
      <Sidebar />

      <main style={{ flex: 1, overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Account</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: theme.text, margin: 0 }}>
            Your <span style={{ color: theme.accent }}>Settings</span>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <SkeletonBlock width="60px" height="60px" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                  <SkeletonBlock width="40%" height="16px" style={{ marginBottom: '8px' }} />
                  <SkeletonBlock width="60%" height="12px" delay="0.1s" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                <SkeletonBlock height="52px" borderRadius="10px" />
                <SkeletonBlock height="52px" borderRadius="10px" delay="0.1s" />
                <SkeletonBlock height="52px" borderRadius="10px" delay="0.2s" />
              </div>
            </div>
            {[1,2,3].map((s) => (
              <div key={s} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
                <SkeletonBlock height="44px" borderRadius="0" />
                <SkeletonRow /><SkeletonRow /><SkeletonRow />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* PROFILE — real user data from AuthContext */}
            <Section title="Profile">
              <div style={{
                padding: '18px', display: 'flex', alignItems: 'center',
                gap: '16px', borderBottom: `1px solid ${theme.cardBorder}`,
                flexWrap: 'wrap',
              }}>
                {/* Avatar: image URL or initials */}
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="avatar"
                    style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: `2px solid ${theme.accent}` }}
                  />
                ) : (
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #00e676, #00b0ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, color: '#0a0a0f',
                  }}>
                    {(user?.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>{user?.name || 'Your Name'}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{user?.email || user?.phone || ''}</div>
                  {user?.state && <div style={{ fontSize: '12px', color: theme.textMuted }}>📍 {user.state}, Nigeria</div>}
                </div>
                <HapticButton
                  onClick={() => navigate('/profile')}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent }}
                >Edit</HapticButton>
              </div>
              <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Posts', value: postsCount },
                  { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '—' },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', background: theme.pill, borderRadius: '10px', padding: '12px 8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: theme.accent }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2-COLUMN GRID on desktop, 1-column on mobile */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '0 24px',
              alignItems: 'start',
            }}>

              {/* LEFT COLUMN */}
              <div>
                {/* APPEARANCE */}
                <Section title="Appearance">
                  <Row
                    icon={theme.dark ? '🌙' : '☀️'}
                    label="Dark Mode"
                    desc={theme.dark ? 'Currently using dark theme' : 'Currently using light theme'}
                    right={
                      <Toggle value={theme.dark} onChange={() => {
                        theme.toggleTheme();
                        showToast(theme.dark ? 'Light mode on ☀️' : 'Dark mode on 🌙', 'info');
                      }} />
                    }
                  />
                </Section>

                {/* NOTIFICATIONS */}
                <Section title="Notifications">
                  <Row icon="🔔" label="Price Alerts" desc="Get notified when prices spike in your area"
                    right={<Toggle value={notifications.priceAlerts} onChange={(v) => { const n = { ...notifications, priceAlerts: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Price alerts enabled 🔔' : 'Price alerts disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="💬" label="New Comments" desc="When someone comments on your post"
                    right={<Toggle value={notifications.newComments} onChange={(v) => { const n = { ...notifications, newComments: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Comment notifications on 💬' : 'Comment notifications off', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="📊" label="Weekly Report" desc="Summary of price trends in your state"
                    right={<Toggle value={notifications.weeklyReport} onChange={(v) => { const n = { ...notifications, weeklyReport: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Weekly report enabled 📊' : 'Weekly report disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="🏛️" label="Government Updates" desc="Updates on reported price gouging cases"
                    right={<Toggle value={notifications.govUpdates} onChange={(v) => { const n = { ...notifications, govUpdates: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Government updates on 🏛️' : 'Government updates off', v ? 'success' : 'info'); }} />}
                  />
                </Section>

                {/* LANGUAGE & REGION */}
                <Section title="Language & Region">
                  <Row icon="🌍" label="Language" desc="App display language"
                    right={
                      <select value={language} onChange={(e) => { setLanguage(e.target.value); showToast(`Language set to ${e.target.value} 🌍`, 'success'); }} style={selectStyle}>
                        {['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin'].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    }
                  />
                  <Row icon="📍" label="Home State" desc="Used for local price comparisons"
                    right={
                      <select value={region} onChange={(e) => { setRegion(e.target.value); showToast(`Home state set to ${e.target.value} 📍`, 'success'); }} style={selectStyle}>
                        {['Lagos','Oyo','FCT - Abuja','Kano','Rivers','Kaduna','Anambra','Delta','Ogun','Enugu'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    }
                  />
                </Section>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                {/* PRIVACY */}
                <Section title="Privacy & Security">
                  <Row icon="📍" label="Show My Location" desc="Others can see which city your reports are from"
                    right={<Toggle value={privacy.showLocation} onChange={(v) => { const p = { ...privacy, showLocation: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Location visible 📍' : 'Location hidden', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="👤" label="Public Profile" desc="Anyone can view your submitted posts"
                    right={<Toggle value={privacy.showProfile} onChange={(v) => { const p = { ...privacy, showProfile: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Profile is now public 👤' : 'Profile is now private', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="✉️" label="Allow Direct Messages" desc="Let other users message you"
                    right={<Toggle value={privacy.allowDM} onChange={(v) => { const p = { ...privacy, allowDM: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Direct messages enabled ✉️' : 'Direct messages disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row icon="🔒" label="Change Password" desc="Update your account password"
                    right={<HapticButton onClick={() => setShowPasswordModal(true)} style={ghostBtn}>Update</HapticButton>}
                  />
                </Section>

                {/* 2FA */}
                <Section title="Two-Factor Authentication">
                  <Row
                    icon="🛡️"
                    label="Enable 2FA"
                    desc={twoFA ? 'Your account has an extra layer of protection' : 'Add an extra layer of security'}
                    right={<Toggle value={twoFA} onChange={(v) => { setTwoFA(v); showToast(v ? '2FA enabled! 🛡️' : '2FA disabled', v ? 'success' : 'warning'); }} />}
                  />
                  {twoFA && (
                    <div style={{ padding: '16px 18px', background: `${theme.accent}08`, borderBottom: `1px solid ${theme.cardBorder}` }}>
                      <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>
                        You'll be asked for a one-time code sent to your phone each time you log in.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <HapticButton onClick={() => showToast('SMS setup coming soon! 🚧', 'info')} style={{ padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none' }}>📱 Set Up via SMS</HapticButton>
                        <HapticButton onClick={() => showToast('Auth app setup coming soon! 🚧', 'info')} style={{ padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}>Use Auth App</HapticButton>
                      </div>
                    </div>
                  )}
                </Section>

                {/* ABOUT */}
                <Section title="About">
                  <Row icon="📱" label="App Version" desc="PriceWatch Nigeria" right={<span style={{ fontSize: '12px', color: theme.textMuted, background: theme.pill, padding: '4px 10px', borderRadius: '6px' }}>v1.0.0</span>} />
                  <Row icon="📄" label="Privacy Policy" desc="Read our data & privacy terms" right={<span style={{ fontSize: '18px', color: theme.textMuted }}>›</span>} />
                  <Row icon="📋" label="Terms of Service" desc="How PriceWatch works legally" right={<span style={{ fontSize: '18px', color: theme.textMuted }}>›</span>} />
                  <Row icon="💬" label="Send Feedback" desc="Help us improve the app"
                    right={<HapticButton onClick={() => showToast('Feedback form coming soon 💬', 'info')} style={ghostBtn}>Send</HapticButton>}
                  />
                </Section>
              </div>
            </div>

            {/* SIGN OUT + DELETE — always full width at bottom */}
            <HapticButton
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, border: '1px solid rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.08)', color: '#ff4d6d', marginBottom: '12px' }}
            >{signingOut ? '⏳ Signing out...' : '🚪 Sign Out'}</HapticButton>

            {!showDeleteConfirm ? (
              <HapticButton
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted, marginBottom: '40px' }}
              >🗑️ Delete Account</HapticButton>
            ) : (
              <div style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '40px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#ff4d6d', marginBottom: '8px' }}>⚠️ Delete your account?</p>
                <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '16px', lineHeight: 1.6 }}>
                  This will permanently delete your account, all your posts, likes, and comments. This action <strong style={{ color: '#ff4d6d' }}>cannot be undone</strong>.
                </p>
                <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '8px' }}>
                  Type <strong style={{ color: theme.text }}>DELETE</strong> to confirm:
                </p>
                <input
                  type="text" placeholder="Type DELETE here" value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px', background: theme.input, border: '1px solid rgba(255,77,109,0.4)', color: theme.text, outline: 'none', marginBottom: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <HapticButton onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}>Cancel</HapticButton>
                  <HapticButton
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE' || deletingAccount}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, border: 'none', background: deleteInput === 'DELETE' ? '#ff4d6d' : 'rgba(255,77,109,0.2)', color: deleteInput === 'DELETE' ? '#fff' : 'rgba(255,77,109,0.4)' }}
                  >{deletingAccount ? '⏳ Deleting...' : 'Delete Forever'}</HapticButton>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Change Password Modal ─────────────────────────────────────── */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: theme.text }}>🔒 Change Password</h3>
            {[
              { key: 'current_password', label: 'Current Password' },
              { key: 'password', label: 'New Password' },
              { key: 'password_confirmation', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 600 }}>{label}</label>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                  style={{ padding: '11px 14px', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, background: theme.pill, color: theme.text, fontSize: '14px', outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px' }}>
              <HapticButton onClick={() => { setShowPasswordModal(false); setPwForm({ current_password: '', password: '', password_confirmation: '' }); }}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}>Cancel</HapticButton>
              <HapticButton onClick={handleChangePassword} disabled={changingPassword}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, border: 'none', background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f' }}>
                {changingPassword ? '⏳ Saving...' : 'Save'}
              </HapticButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;