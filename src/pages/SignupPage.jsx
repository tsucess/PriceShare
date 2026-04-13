import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authRegister } from '../services/api';
import HapticButton from '../components/HapticButton';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const nigerianStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

// Validation helpers
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidNigerianPhone = (v) => {
  const cleaned = v.replace(/\s+/g, '').replace(/-/g, '');
  return /^(\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/.test(cleaned);
};

const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',           test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Starts with a capital letter',     test: (p) => /^[A-Z]/.test(p) },
  { id: 'lower',   label: 'Contains lowercase letters',       test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'Contains a number',                test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Contains a special character (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const getStrength = (p) => passwordRules.filter((r) => r.test(p)).length;
const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#ff4d6d', '#ff9a3c', '#ffd600', '#00b0ff', '#00e676'];

function SignupPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [form, setForm] = useState({ fullname: '', contact: '', state: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (name) => setTouched((p) => ({ ...p, [name]: true }));

  // Contact can be email or Nigerian phone
  const contactType = isValidEmail(form.contact) ? 'email' : isValidNigerianPhone(form.contact) ? 'phone' : null;
  const contactError = touched.contact && form.contact && !contactType
    ? 'Enter a valid email or Nigerian phone number (e.g. 08012345678)'
    : '';

  const strength = getStrength(form.password);
  const passErrors = passwordRules.filter((r) => !r.test(form.password));
  const confirmError = touched.confirm && form.confirm && form.confirm !== form.password
    ? 'Passwords do not match' : '';

  const isFormValid =
    form.fullname.trim().length >= 2 &&
    contactType &&
    form.state &&
    strength === 5 &&
    form.confirm === form.password &&
    agreed;

  const handleSignup = async () => {
    setSubmitted(true);
    setTouched({ fullname: true, contact: true, state: true, password: true, confirm: true });
    setApiError('');
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await authRegister({
        name: form.fullname,
        contact: form.contact,
        state: form.state,
        password: form.password,
        password_confirmation: form.confirm,
      });
      const { token, user } = res.data;
      login(token, user);
      showToast('Account created! Welcome 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errors
        ? Object.values(data.errors).flat().join(' ')
        : data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name, extra = {}) => ({
    padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    background: theme.input,
    border: `1px solid ${submitted && !form[name] ? '#ff4d6d' : touched[name] && form[name] ? theme.accent : theme.inputBorder}`,
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
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: theme.accent, fontWeight: 800, textTransform: 'uppercase' }}>PriceShare</div>
          <div style={{ fontSize: '9px', color: theme.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>Nigeria</div>
        </div>
        <HapticButton
          onClick={theme.toggleTheme}
          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.sidebarBorder}`, background: theme.toggleBg, color: theme.text, fontSize: '14px' }}
        >{theme.dark ? '☀️' : '🌙'}</HapticButton>
      </nav>

      <div style={{ padding: 'clamp(32px, 8vw, 60px) 24px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>Create your account 🇳🇬</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>Join thousands of Nigerians fighting unfair prices.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* FULL NAME */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              name="fullname" placeholder="e.g. Chidi Okeke"
              value={form.fullname} onChange={handleChange} onBlur={() => handleBlur('fullname')}
              style={inputStyle('fullname')}
            />
            {submitted && !form.fullname.trim() && <ErrorMsg msg="Full name is required" />}
            {touched.fullname && form.fullname.trim().length === 1 && <ErrorMsg msg="Name is too short" />}
          </div>

          {/* EMAIL OR PHONE */}
          <div>
            <label style={labelStyle}>Email Address or Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                name="contact" placeholder="you@email.com or 08012345678"
                value={form.contact} onChange={handleChange} onBlur={() => handleBlur('contact')}
                style={inputStyle('contact', { paddingRight: '44px' })}
              />
              {/* Shows green check when valid */}
              {contactType && (
                <CheckCircle2 size={16} color="#00e676" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>
            {/* Shows what type was detected */}
            {contactType && (
              <p style={{ fontSize: '11px', color: '#00e676', margin: '5px 0 0', fontWeight: 600 }}>
                ✓ Valid {contactType === 'email' ? 'email address' : 'Nigerian phone number'} detected
              </p>
            )}
            <ErrorMsg msg={contactError} />
          </div>

          {/* STATE */}
          <div>
            <label style={labelStyle}>Home State</label>
            <select
              name="state" value={form.state}
              onChange={handleChange} onBlur={() => handleBlur('state')}
              style={{ ...inputStyle('state'), cursor: 'pointer' }}
            >
              <option value="">Select your state</option>
              {nigerianStates.map((s) => <option key={s}>{s}</option>)}
            </select>
            {submitted && !form.state && <ErrorMsg msg="Please select your state" />}
          </div>

          {/* PASSWORD */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password" placeholder="Create a strong password"
                value={form.password} onChange={handleChange} onBlur={() => handleBlur('password')}
                style={inputStyle('password', { paddingRight: '48px' })}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* STRENGTH BAR */}
            {form.password.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? strengthColor[strength] : theme.cardBorder, transition: 'all 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: strengthColor[strength], margin: 0 }}>
                  {strengthLabel[strength]}
                </p>
              </div>
            )}

            {/* PASSWORD RULES CHECKLIST */}
            {(touched.password || submitted) && form.password.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {passwordRules.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: passed ? '#00e676' : theme.textMuted }}>
                      {passed
                        ? <CheckCircle2 size={13} color="#00e676" />
                        : <XCircle size={13} color={theme.cardBorder} />
                      }
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}
            {submitted && !form.password && <ErrorMsg msg="Password is required" />}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm" placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange} onBlur={() => handleBlur('confirm')}
                style={{
                  ...inputStyle('confirm', { paddingRight: '48px' }),
                  border: `1px solid ${confirmError ? '#ff4d6d' : form.confirm && form.confirm === form.password ? '#00e676' : touched.confirm ? theme.inputBorder : theme.inputBorder}`,
                }}
              />
              <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {form.confirm && form.confirm === form.password && (
                <CheckCircle2 size={16} color="#00e676" style={{ position: 'absolute', right: '44px', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>
            <ErrorMsg msg={confirmError} />
            {submitted && !form.confirm && <ErrorMsg msg="Please confirm your password" />}
          </div>

          {/* TERMS */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div
              onClick={() => setAgreed(!agreed)}
              style={{
                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                border: `2px solid ${agreed ? theme.accent : submitted && !agreed ? '#ff4d6d' : theme.cardBorder}`,
                background: agreed ? `${theme.accent}20` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {agreed && <CheckCircle2 size={13} color={theme.accent} />}
            </div>
            <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
              I agree to the{' '}
              <span style={{ color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </div>
          {submitted && !agreed && <ErrorMsg msg="You must agree to the terms to continue" />}

          {/* API ERROR */}
          {apiError && (
            <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.35)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ff4d6d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={14} /> {apiError}
            </div>
          )}

          {/* SUBMIT */}
          <HapticButton
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px',
              background: isFormValid && !loading
                ? `linear-gradient(135deg, ${theme.accent}, #00c853)`
                : theme.cardBorder,
              color: isFormValid && !loading ? '#0a0a0f' : theme.textMuted,
              fontWeight: 800, fontSize: '15px', border: 'none',
              boxShadow: isFormValid && !loading ? `0 4px 20px ${theme.accent}40` : 'none',
              transition: 'all 0.3s',
            }}
          >{loading ? '⏳ Creating account...' : 'Create Account'}</HapticButton>

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