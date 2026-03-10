import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLogin = () => navigate('/dashboard');

  const inputStyle = {
    padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    background: theme.input, border: `1px solid ${theme.inputBorder}`,
    color: theme.text, outline: 'none', width: '100%',
    fontFamily: 'inherit', transition: 'border 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: 'all 0.3s', overflowX: 'hidden'
    }}>

      {/* TOP NAV */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', background: theme.sidebar,
        borderBottom: `1px solid ${theme.sidebarBorder}`, transition: 'all 0.3s'
      }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase' }}>PriceWatch</div>
          <div style={{ fontSize: '9px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>Nigeria</div>
        </div>
        <button onClick={theme.toggleTheme} style={{
          padding: '8px 12px', borderRadius: '8px',
          border: `1px solid ${theme.sidebarBorder}`,
          background: theme.toggleBg, color: theme.text,
          cursor: 'pointer', fontSize: '14px',
        }}>{theme.dark ? '☀️' : '🌙'}</button>
      </nav>

      {/* FORM CONTAINER */}
      <div style={{ padding: '40px 24px', maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>Welcome back 👋</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>Log in to continue helping Nigeria shop smarter.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: theme.accent, fontWeight: 600, cursor: 'pointer', marginTop: '-8px' }}>
            Forgot password?
          </div>

          <button onClick={handleLogin} style={{
            width: '100%', padding: '15px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
            color: '#0a0a0f', fontWeight: 800, fontSize: '15px',
            border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 20px ${theme.accent}40`, marginTop: '4px'
          }}>Log In</button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: theme.textMuted, margin: 0 }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Sign Up</span>
          </p>
        </div>

        {/* FEATURES */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '📸', text: 'Snap and report prices anywhere in Nigeria' },
            { icon: '🔍', text: 'Compare prices across markets and cities' },
            { icon: '🏛️', text: 'Help report price gouging to the government' },
            { icon: '💰', text: 'Save money by always knowing the fair price' },
          ].map((f) => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              padding: '12px 16px', borderRadius: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;