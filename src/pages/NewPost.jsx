import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';

const nigerianStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

const categories = [
  '🌾 Food & Groceries','⛽ Fuel & Energy','💊 Medications & Healthcare',
  '🧱 Building Materials','👗 Clothing & Fashion','📱 Electronics',
  '🚌 Transport','🧴 Household Items','🐔 Meat & Poultry','🥦 Vegetables & Fruits',
];

function NewPost() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [preview, setPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    product: '', price: '', category: '', market: '', state: '', description: '', location: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleDetectLocation = () => {
    setLocating(true);
    setTimeout(() => {
      setForm((prev) => ({ ...prev, location: 'Lagos, Nigeria (6.5244° N, 3.3792° E)' }));
      setLocating(false);
    }, 2000);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/feed'), 2500);
  };

  const inputStyle = {
    padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
    background: theme.input, border: `1px solid ${theme.inputBorder}`,
    color: theme.text, outline: 'none', width: '100%',
    fontFamily: 'inherit', transition: 'border 0.2s',
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
      }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.cardBorder}`,
          borderRadius: '24px', padding: '60px 50px', textAlign: 'center',
          boxShadow: `0 20px 60px rgba(0,0,0,0.3)`, maxWidth: '400px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: theme.text, marginBottom: '10px' }}>Post Submitted!</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px' }}>Thank you for helping Nigerians shop smarter.</p>
          <div style={{
            marginTop: '24px', padding: '12px', borderRadius: '10px',
            background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`
          }}>
            <p style={{ color: theme.accent, fontSize: '12px', fontWeight: 600 }}>Redirecting to the public feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>New Post</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
            Submit a <span style={{ color: theme.accent }}>Price Report</span>
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '6px' }}>
            Snap a product, enter the price and location — help others shop smarter!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* IMAGE UPLOAD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {preview ? (
              <>
                <div style={{ width: '280px', height: '280px', borderRadius: '18px', overflow: 'hidden', border: `2px solid ${theme.accent}` }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <button
                  onClick={() => setPreview(null)}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                    background: 'rgba(255,77,109,0.1)', color: '#ff4d6d',
                    border: '1px solid rgba(255,77,109,0.3)', cursor: 'pointer'
                  }}
                >Remove Photo</button>
              </>
            ) : (
              <>
                <div style={{
                  width: '280px', height: '200px', borderRadius: '18px',
                  border: `2px dashed ${theme.accent}50`, background: `${theme.accent}08`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', color: theme.accent
                }}>
                  <span style={{ fontSize: '48px' }}>📷</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.accent }}>Add a product photo</p>
                  <small style={{ fontSize: '11px', color: theme.textMuted }}>Choose an option below</small>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '280px' }}>
                  <label htmlFor="camera-capture" style={{
                    display: 'block', textAlign: 'center', padding: '12px',
                    borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                    color: '#0a0a0f', cursor: 'pointer',
                    boxShadow: `0 4px 16px ${theme.accent}30`
                  }}>📸 Take a Photo</label>
                  <input id="camera-capture" type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />

                  <label htmlFor="image-upload" style={{
                    display: 'block', textAlign: 'center', padding: '12px',
                    borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                    background: 'transparent', color: theme.accent,
                    border: `1px solid ${theme.accent}50`, cursor: 'pointer'
                  }}>🖼️ Upload from Gallery</label>
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>
              </>
            )}
          </div>

          {/* FORM */}
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Product Name *</label>
                <input type="text" name="product" placeholder="e.g. Garri, Rice" value={form.product} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Price (₦) *</label>
                <input type="number" name="price" placeholder="e.g. 1500" value={form.price} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>State *</label>
                <select name="state" value={form.state} onChange={handleChange} style={inputStyle}>
                  <option value="">Select state</option>
                  {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Market / Area Name *</label>
              <input type="text" name="market" placeholder="e.g. Mile 12 Market, Bodija Market" value={form.market} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Auto-Detect Location</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" name="location" placeholder="Your coordinates will appear here" value={form.location} readOnly style={{ ...inputStyle, flex: 1 }} />
                <button
                  onClick={handleDetectLocation}
                  disabled={locating}
                  style={{
                    padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                    background: locating ? theme.pill : `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                    color: locating ? theme.textMuted : '#0a0a0f',
                    border: 'none', cursor: locating ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s'
                  }}
                >{locating ? '📡 Detecting...' : '📍 Detect'}</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, letterSpacing: '1px', textTransform: 'uppercase' }}>Additional Description (optional)</label>
              <textarea
                name="description" rows={3}
                placeholder="e.g. Seller was asking ₦2000 but fair price is ₦1500"
                value={form.description} onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '13px 28px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                  background: theme.pill, color: theme.textMuted,
                  border: `1px solid ${theme.cardBorder}`, cursor: 'pointer'
                }}
              >Cancel</button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.accent}, #00c853)`,
                  color: '#0a0a0f', border: 'none', cursor: 'pointer',
                  boxShadow: `0 4px 20px ${theme.accent}40`, letterSpacing: '0.5px'
                }}
              >🚀 Submit Price Report</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default NewPost;