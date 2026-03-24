import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import HapticButton from '../components/HapticButton';
import { Eye, EyeOff, XCircle } from 'lucide-react';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidNigerianPhone = (v) => {
  const cleaned = v.replace(/\s+/g, '').replace(/-/g, '');
  return /^(\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/.test(cleaned);
};

function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState({ contact: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (name) => setTouched((p) => ({ ...p, [name]: true }));

  const contactValid = isValidEmail(form.contact) || isValidNigerianPhone(form.contact);
  const contactError = touched.contact && form.contact && !contactValid
    ? 'Enter a valid email or Nigerian phone number'
    : '';
  const passwordError = touched.password && form.password.length > 0 && form.password.length < 8
    ? 'Password must be at least 8 characters'
    : '';

  const isFormValid = contactValid && form.password.length >= 8;

  const handleLogin = () => {
    setSubmitted(true);
    setTouched({ contact: true, password: true });
    if (!isFormValid) return;
    navigate('/dashboard');
  };

  // Allow Enter key to submit
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  const inputStyle = (name, extra = {}) => ({
    padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    background: theme.input,
    border: `1px solid ${
      submitted && !form[name] ? '#ff4d6d'
      : touched[name] && form[name] && name === 'contact' && contactValid ? '#00e676'
      : touched[name] && form[name] && name === 'password' && form.password.length >= 8 ? '#00e676'
      : touched[name] && ((name === 'contact' && contactError) || (name === 'password' && passwordError)) ? '#ff4d6d'
      : theme.inputBorder
    }`,
    color: theme.text, outline: 'none', width: '100%',
    fontFamily: 'inherit', transition: 'border 0.2s', boxSizing: 'border-box',
    ...extra,
  });

  const labelStyle = {
    fontSize: '11px', fontWeight: 700, color: theme.textMuted,
    letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px', display: 'block',
  };

  const ErrorMsg = ({ msg }) => msg ? (
    <p style={{ fontSize: '12px', color: '#ff4d6d', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <XCircle size={12} /> {msg}
    </p>
  ) : null;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: theme.sidebar, borderBottom: `1px solid ${theme.sidebarBorder}`, transition: 'all 0.3s' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase' }}>PriceWatch</div>
          <div style={{ fontSize: '9px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>Nigeria</div>
        </div>
        <HapticButton
          onClick={theme.toggleTheme}
          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.sidebarBorder}`, background: theme.toggleBg, color: theme.text, fontSize: '14px' }}
        >{theme.dark ? '☀️' : '🌙'}</HapticButton>
      </nav>

      <div style={{ padding: 'clamp(32px, 8vw, 60px) 24px', maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>Welcome back 👋</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>Log in to continue helping Nigeria shop smarter.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* EMAIL OR PHONE */}
          <div>
            <label style={labelStyle}>Email or Phone Number</label>
            <input
              name="contact"
              placeholder="you@email.com or 08012345678"
              value={form.contact}
              onChange={handleChange}
              onBlur={() => handleBlur('contact')}
              onKeyDown={handleKeyDown}
              style={inputStyle('contact')}
              autoComplete="username"
            />
            <ErrorMsg msg={contactError} />
            {submitted && !form.contact && <ErrorMsg msg="Email or phone number is required" />}
          </div>

          {/* PASSWORD */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                onKeyDown={handleKeyDown}
                style={inputStyle('password', { paddingRight: '48px' })}
                autoComplete="current-password"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <ErrorMsg msg={passwordError} />
            {submitted && !form.password && <ErrorMsg msg="Password is required" />}
          </div>

          {/* FORGOT PASSWORD */}
          <div style={{ textAlign: 'right', marginTop: '-8px' }}>
            <span
              onClick={() => {}} style={{ fontSize: '13px', color: theme.accent, fontWeight: 600, cursor: 'pointer' }}
            >Forgot password?</span>
          </div>

          {/* LOGIN BUTTON */}
          <HapticButton
            onClick={handleLogin}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px',
              background: isFormValid
                ? `linear-gradient(135deg, ${theme.accent}, #00c853)`
                : theme.cardBorder,
              color: isFormValid ? '#0a0a0f' : theme.textMuted,
              fontWeight: 800, fontSize: '15px', border: 'none',
              boxShadow: isFormValid ? `0 4px 20px ${theme.accent}40` : 'none',
              transition: 'all 0.3s',
            }}
          >Log In</HapticButton>

          <p style={{ textAlign: 'center', fontSize: '14px', color: theme.textMuted, margin: 0 }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Sign Up</span>
          </p>

        </div>

        {/* FEATURES */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '📸', text: 'Snap and report prices anywhere in Nigeria' },
            { icon: '🔍', text: 'Compare prices across markets and cities' },
            { icon: '🏛️', text: 'Help report price gouging to the government' },
            { icon: '💰', text: 'Save money by always knowing the fair price' },
          ].map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: '12px 16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{f.icon}</span>
              <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;