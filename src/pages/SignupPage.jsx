import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import HapticButton from '../components/HapticButton';

const nigerianStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

function SignupPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', state: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSignup = () => { if (agreed) navigate('/dashboard'); };

  const inputStyle = {
    padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    background: theme.input, border: `1px solid ${theme.inputBorder}`,
    color: theme.text, outline: 'none', width: '100%',
    fontFamily: 'inherit', transition: 'border 0.2s', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 700, color: theme.textMuted,
    letterSpacing: '1px', textTransform: 'uppercase',
  };

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

      {/* FORM */}
      <div style={{ padding: 'clamp(32px, 8vw, 60px) 24px', maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>Create your account 🚀</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>Join the movement for fair prices in Nigeria.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" name="fullname" placeholder="e.g. Chidi Okeke" value={form.fullname} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input type="tel" name="phone" placeholder="e.g. 08012345678" value={form.phone} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>State of Residence</label>
            <select name="state" value={form.state} onChange={handleChange} style={inputStyle}>
              <option value="">Select your state</option>
              {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '48px' }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: theme.textMuted }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} style={{ flex: 1, height: '3px', borderRadius: '99px', background: form.password.length >= level * 3 ? (form.password.length >= 10 ? '#00e676' : '#ffd600') : theme.cardBorder, transition: 'background 0.3s' }} />
                ))}
              </div>
            )}
          </div>

          {/* TERMS CHECKBOX */}
          <div
            onClick={() => setAgreed(!agreed)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '4px 0' }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${agreed ? theme.accent : theme.cardBorder}`, background: agreed ? `${theme.accent}20` : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', transition: 'all 0.2s' }}>
              {agreed && <span style={{ fontSize: '12px', color: theme.accent }}>✓</span>}
            </div>
            <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>
              I agree to the <span style={{ color: theme.accent, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: theme.accent, fontWeight: 600 }}>Privacy Policy</span>
            </p>
          </div>

          <HapticButton
            onClick={handleSignup}
            disabled={!agreed}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px',
              background: agreed ? `linear-gradient(135deg, ${theme.accent}, #00c853)` : theme.pill,
              color: agreed ? '#0a0a0f' : theme.textMuted,
              fontWeight: 800, fontSize: '15px', border: 'none',
              boxShadow: agreed ? `0 4px 20px ${theme.accent}40` : 'none',
              transition: 'all 0.2s',
            }}
          >Create Account</HapticButton>

          <p style={{ textAlign: 'center', fontSize: '14px', color: theme.textMuted, margin: 0 }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;