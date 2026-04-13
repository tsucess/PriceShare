import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { deleteMe, authChangePassword, updateSettings, updateMe, getMe, getUserPosts } from '../services/api';
import Sidebar from '../components/Sidebar';
import HapticButton from '../components/HapticButton';
import { SkeletonRow, SkeletonBlock } from '../components/SkeletonCard';

function Toggle({ value, onChange, theme }) {
  return (
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
}

function Section({ title, children, theme }) {
  return (
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
}

function Row({ icon, label, desc, right, theme }) {
  return (
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
}

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
  const { logout, user, updateUser } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
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
  // language is managed by LanguageContext (persisted in localStorage + backend)
  const [region, setRegion] = useState(user?.state || 'Lagos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Load real post count + notification/privacy/language settings from API
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    Promise.all([getUserPosts(user.id), getMe()])
      .then(([postsRes, meRes]) => {
        // posts count
        const data = postsRes.data?.data ?? postsRes.data ?? [];
        setPostsCount(Array.isArray(data) ? data.length : (data.total ?? 0));
        // settings
        const u = meRes.data?.user ?? meRes.data;
        if (u.notification_settings) setNotifications((prev) => ({ ...prev, ...u.notification_settings }));
        if (u.privacy_settings) setPrivacy((prev) => ({ ...prev, ...u.privacy_settings }));
        if (u.language) changeLanguage(u.language);
        if (u.state) setRegion(u.state);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Persist notification / privacy / language changes to the backend
  const persistSettings = (updatedNotif, updatedPrivacy, updatedLang) => {
    updateSettings({
      language: updatedLang !== undefined ? updatedLang : language,
      notification_settings: updatedNotif,
      privacy_settings: updatedPrivacy,
    }).catch(() => {}); // silent — state already updated optimistically
  };

  const handleRegionChange = async (newState) => {
    const prev = region;
    setRegion(newState);
    try {
      await updateMe({ state: newState });
      updateUser({ state: newState });
      showToast(`Home state set to ${newState} 📍`, 'success');
    } catch {
      setRegion(prev); // revert on failure
      showToast('Could not update home state. Try again.', 'error');
    }
  };

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    persistSettings(notifications, privacy, newLang);
    showToast(`Language set to ${newLang} 🌍`, 'success');
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
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Account')}</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: theme.text, margin: 0 }}>
            {t('Your Settings').split(' ')[0]} <span style={{ color: theme.accent }}>{t('Your Settings').split(' ').slice(1).join(' ')}</span>
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
            <Section title={t('Profile')} theme={theme}>
              <div style={{
                padding: '18px', display: 'flex', alignItems: 'center',
                gap: '16px', borderBottom: `1px solid ${theme.cardBorder}`,
                flexWrap: 'wrap',
              }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar"
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
                  <div style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>{user?.name || t('Your Name')}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{user?.email || user?.phone || ''}</div>
                  {user?.state && <div style={{ fontSize: '12px', color: theme.textMuted }}>📍 {user.state}, Nigeria</div>}
                </div>
                <HapticButton onClick={() => navigate('/profile')}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: `1px solid ${theme.accent}`, background: 'transparent', color: theme.accent }}
                >{t('Edit')}</HapticButton>
              </div>
              <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { key: 'Posts', value: postsCount },
                  { key: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '—' },
                ].map((s) => (
                  <div key={s.key} style={{ textAlign: 'center', background: theme.pill, borderRadius: '10px', padding: '12px 8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: theme.accent }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px' }}>{t(s.key)}</div>
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
                <Section title={t('Appearance')} theme={theme}>
                  <Row theme={theme}
                    icon={theme.dark ? '🌙' : '☀️'}
                    label={t('Dark Mode')}
                    desc={theme.dark ? t('Currently using dark theme') : t('Currently using light theme')}
                    right={
                      <Toggle theme={theme} value={theme.dark} onChange={() => {
                        theme.toggleTheme();
                        showToast(theme.dark ? 'Light mode on ☀️' : 'Dark mode on 🌙', 'info');
                      }} />
                    }
                  />
                </Section>

                {/* NOTIFICATIONS */}
                <Section title={t('Notifications')} theme={theme}>
                  <Row theme={theme} icon="🔔" label={t('Price Alerts')} desc={t('Get notified when prices spike in your area')}
                    right={<Toggle theme={theme} value={notifications.priceAlerts} onChange={(v) => { const n = { ...notifications, priceAlerts: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Price alerts enabled 🔔' : 'Price alerts disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="💬" label={t('New Comments')} desc={t('When someone comments on your post')}
                    right={<Toggle theme={theme} value={notifications.newComments} onChange={(v) => { const n = { ...notifications, newComments: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Comment notifications on 💬' : 'Comment notifications off', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="📊" label={t('Weekly Report')} desc={t('Summary of price trends in your state')}
                    right={<Toggle theme={theme} value={notifications.weeklyReport} onChange={(v) => { const n = { ...notifications, weeklyReport: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Weekly report enabled 📊' : 'Weekly report disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="🏛️" label={t('Government Updates')} desc={t('Updates on reported price gouging cases')}
                    right={<Toggle theme={theme} value={notifications.govUpdates} onChange={(v) => { const n = { ...notifications, govUpdates: v }; setNotifications(n); persistSettings(n, privacy); showToast(v ? 'Government updates on 🏛️' : 'Government updates off', v ? 'success' : 'info'); }} />}
                  />
                </Section>

                {/* LANGUAGE & REGION */}
                <Section title={t('Language & Region')} theme={theme}>
                  <Row theme={theme} icon="🌍" label={t('Language')} desc={t('App display language')}
                    right={
                      <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} style={selectStyle}>
                        {['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin'].map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    }
                  />
                  <Row theme={theme} icon="📍" label={t('Home State')} desc={t('Used for local price comparisons')}
                    right={
                      <select value={region} onChange={(e) => handleRegionChange(e.target.value)} style={selectStyle}>
                        {['Lagos','Oyo','FCT - Abuja','Kano','Rivers','Kaduna','Anambra','Delta','Ogun','Enugu'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    }
                  />
                </Section>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                {/* PRIVACY */}
                <Section title={t('Privacy & Security')} theme={theme}>
                  <Row theme={theme} icon="📍" label={t('Show My Location')} desc={t('Others can see which city your reports are from')}
                    right={<Toggle theme={theme} value={privacy.showLocation} onChange={(v) => { const p = { ...privacy, showLocation: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Location visible 📍' : 'Location hidden', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="👤" label={t('Public Profile')} desc={t('Anyone can view your submitted posts')}
                    right={<Toggle theme={theme} value={privacy.showProfile} onChange={(v) => { const p = { ...privacy, showProfile: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Profile is now public 👤' : 'Profile is now private', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="✉️" label={t('Allow Direct Messages')} desc={t('Let other users message you')}
                    right={<Toggle theme={theme} value={privacy.allowDM} onChange={(v) => { const p = { ...privacy, allowDM: v }; setPrivacy(p); persistSettings(notifications, p); showToast(v ? 'Direct messages enabled ✉️' : 'Direct messages disabled', v ? 'success' : 'info'); }} />}
                  />
                  <Row theme={theme} icon="🔒" label={t('Change Password')} desc={t('Update your account password')}
                    right={<HapticButton onClick={() => setShowPasswordModal(true)} style={ghostBtn}>{t('Update')}</HapticButton>}
                  />
                </Section>

                {/* 2FA */}
                <Section title={t('Two-Factor Authentication')} theme={theme}>
                  <Row theme={theme}
                    icon="🛡️"
                    label={t('Enable 2FA')}
                    desc={twoFA ? t('Your account has an extra layer of protection') : t('Add an extra layer of security')}
                    right={<Toggle theme={theme} value={twoFA} onChange={(v) => { setTwoFA(v); showToast(v ? '2FA enabled! 🛡️' : '2FA disabled', v ? 'success' : 'warning'); }} />}
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
                <Section title={t('About')} theme={theme}>
                  <Row theme={theme} icon="📱" label={t('App Version')} desc="PriceShare Nigeria" right={<span style={{ fontSize: '12px', color: theme.textMuted, background: theme.pill, padding: '4px 10px', borderRadius: '6px' }}>v1.0.0</span>} />
                  <Row theme={theme} icon="📄" label={t('Privacy Policy')} desc={t('Read our data & privacy terms')} right={<span style={{ fontSize: '18px', color: theme.textMuted }}>›</span>} />
                  <Row theme={theme} icon="📋" label={t('Terms of Service')} desc={t('How PriceShare works legally')} right={<span style={{ fontSize: '18px', color: theme.textMuted }}>›</span>} />
                  <Row theme={theme} icon="💬" label={t('Send Feedback')} desc={t('Help us improve the app')}
                    right={<HapticButton onClick={() => showToast('Feedback form coming soon 💬', 'info')} style={ghostBtn}>{t('Send')}</HapticButton>}
                  />
                </Section>
              </div>
            </div>

            {/* SIGN OUT + DELETE — always full width at bottom */}
            <HapticButton
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, border: '1px solid rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.08)', color: '#ff4d6d', marginBottom: '12px' }}
            >{signingOut ? `⏳ ${t('Signing out...')}` : `🚪 ${t('Sign Out')}`}</HapticButton>

            {!showDeleteConfirm ? (
              <HapticButton
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted, marginBottom: '40px' }}
              >🗑️ {t('Delete Account')}</HapticButton>
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
                  <HapticButton onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted }}>{t('Cancel')}</HapticButton>
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