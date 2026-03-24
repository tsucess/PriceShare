import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import HapticButton from '../components/HapticButton';
import { addPost } from '../utils/postsStore';

const MAX_DESC = 200;

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
  '🚌 Transport','🧴 Household Items','🐔 Meat & Poultry','🥦 Vegetables & Fruits'
];

function NewPost() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showToast } = useToast();
  const [preview, setPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [stateWarning, setStateWarning] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    product: '', price: '', category: '', market: '',
    state: '', description: '', location: '', coords: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > MAX_DESC) return;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Location not supported on this device', 'warning');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode to get human-readable address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
          setForm((prev) => {
            const updated = { ...prev, location: address, coords: { lat: latitude.toFixed(6), lng: longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy) } };
            // Extract state from reverse geocode and compare with selected state
            const detectedState = data.address?.state || '';
            if (prev.state && detectedState && !detectedState.toLowerCase().includes(prev.state.toLowerCase().split(' ')[0])) {
              setStateWarning(`Your GPS shows you are in ${detectedState}, but you selected ${prev.state}. Make sure the state is correct.`);
            } else {
              setStateWarning('');
            }
            return updated;
          });
          showToast('Location detected! 📍', 'success');
        } catch {
          // Fallback to raw coordinates if reverse geocode fails
          setForm((prev) => ({ ...prev, location: `${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`, coords: { lat: latitude.toFixed(6), lng: longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy) } }));
          showToast('Location detected! 📍', 'success');
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) showToast('Location access denied. Please allow it in your browser settings.', 'warning');
        else if (err.code === 2) showToast('Could not detect location. Try again.', 'warning');
        else showToast('Location detection timed out. Try again.', 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = () => {
    const errors = {};
    if (!preview) errors.image = 'A product photo is required 📸';
    if (!form.product.trim()) errors.product = 'Product name is required';
    if (!form.price) errors.price = 'Price is required';
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) errors.price = 'Enter a valid price (numbers only)';
    if (!form.category) errors.category = 'Please select a category';
    if (!form.state) errors.state = 'Please select a state';
    if (!form.market.trim()) errors.market = 'Market or area name is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Please fix the errors below', 'error');
      return;
    }
    setFieldErrors({});
    // Save to shared store — replace with API call when backend is ready
    addPost({
      product: form.product,
      price: Number(form.price),
      location: form.market,
      exactLocation: form.location,
      coords: form.coords,
      state: form.state,
      category: form.category.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '').trim(),
      image: preview || null,
      description: form.description,
    });
    setSubmitted(true);
  };

  const inputStyle = {
    padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
    background: theme.input, border: `1px solid ${theme.inputBorder}`,
    color: theme.text, outline: 'none', width: '100%',
    fontFamily: 'inherit', transition: 'border 0.2s', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 700, color: theme.textMuted,
    letterSpacing: '1px', textTransform: 'uppercase',
  };

  const ErrorMsg = ({ field }) => fieldErrors[field] ? (
    <p style={{ fontSize: '12px', color: '#ff4d6d', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
      ⚠️ {fieldErrors[field]}
    </p>
  ) : null;

  const errBorder = (field) => fieldErrors[field] ? '#ff4d6d' : undefined;

  const descLeft = MAX_DESC - form.description.length;
  const descColor = descLeft <= 20 ? '#ff4d6d' : descLeft <= 50 ? '#ffd600' : theme.textMuted;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: '24px' }}>
        <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '24px', padding: '48px 32px', textAlign: 'center', maxWidth: '420px', width: '100%', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          {/* Success icon */}
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 12px 40px ${theme.accent}40`, fontSize: '42px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: theme.text, margin: '0 0 10px' }}>Price Reported!</h2>
          <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.7, margin: '0 0 8px' }}>
            Thank you for helping Nigerians shop smarter. Your report for
          </p>
          <p style={{ color: theme.accent, fontSize: '16px', fontWeight: 800, margin: '0 0 24px' }}>
            {form.product} — ₦{Number(form.price).toLocaleString()}
          </p>
          {/* Report details pill */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textMuted, background: theme.pill, padding: '5px 12px', borderRadius: '20px' }}>📍 {form.market}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.textMuted, background: theme.pill, padding: '5px 12px', borderRadius: '20px' }}>🗺️ {form.state}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <HapticButton
              onClick={() => navigate('/feed')}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none', boxShadow: `0 4px 20px ${theme.accent}40` }}
            >See it in the Feed 🚀</HapticButton>
            <HapticButton
              onClick={() => { setSubmitted(false); setForm({ product: '', price: '', category: '', market: '', state: '', description: '', location: '' }); setPreview(null); }}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.cardBorder}` }}
            >Submit Another Report</HapticButton>
          </div>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: 'all 0.3s', overflowX: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>New Post</div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: theme.text, lineHeight: 1.2, margin: 0 }}>
            Submit a <span style={{ color: theme.accent }}>Price Report</span>
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '6px' }}>
            Snap a product, enter the price and location — help others shop smarter!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* IMAGE UPLOAD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%', maxWidth: '280px' }}>
            {preview ? (
              <>
                <div style={{ width: '100%', height: '240px', borderRadius: '18px', overflow: 'hidden', border: `2px solid ${theme.accent}` }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <HapticButton
                  onClick={() => setPreview(null)}
                  style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'rgba(255,77,109,0.1)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.3)', width: '100%' }}
                >Remove Photo</HapticButton>
              </>
            ) : (
              <>
                <div style={{ width: '100%', height: '180px', borderRadius: '18px', border: `2px dashed ${theme.accent}50`, background: `${theme.accent}08`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '40px' }}>📷</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.accent, margin: 0 }}>Add a product photo <span style={{ color: '#ff4d6d' }}>*</span></p>
                  <small style={{ fontSize: '11px', color: theme.textMuted }}>Required — choose an option below</small>
                </div>
                <ErrorMsg field="image" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <label htmlFor="camera-capture" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', cursor: 'pointer' }}>
                    📸 Take a Photo
                  </label>
                  <input id="camera-capture" type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
                  <label htmlFor="image-upload" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: 'transparent', color: theme.accent, border: `1px solid ${theme.accent}50`, cursor: 'pointer' }}>
                    🖼️ Upload from Gallery
                  </label>
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>
              </>
            )}
          </div>

          {/* FORM */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Product + Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Product Name *</label>
                <input type="text" name="product" placeholder="e.g. Garri, Rice" value={form.product} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, product: '' })); }} style={{ ...inputStyle, borderColor: errBorder('product') }} />
                <ErrorMsg field="product" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Price (₦) *</label>
                <input type="number" name="price" placeholder="e.g. 1500" value={form.price} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, price: '' })); }} style={{ ...inputStyle, borderColor: errBorder('price') }} />
                <ErrorMsg field="price" />
              </div>
            </div>

            {/* Category + State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Category *</label>
                <select name="category" value={form.category} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, category: '' })); }} style={{ ...inputStyle, borderColor: errBorder('category') }}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ErrorMsg field="category" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>State *</label>
                <select name="state" value={form.state} onChange={(e) => {
                          handleChange(e);
                          setFieldErrors((p) => ({ ...p, state: '' }));
                          // Re-check state vs GPS if location already detected
                          if (form.coords) {
                            const detectedState = form.location || '';
                            const selected = e.target.value;
                            if (selected && detectedState && !detectedState.toLowerCase().includes(selected.toLowerCase().split(' ')[0])) {
                              setStateWarning(`Your GPS shows a different location. Make sure "${selected}" is where you bought this product.`);
                            } else {
                              setStateWarning('');
                            }
                          }
                        }} style={{ ...inputStyle, borderColor: errBorder('state') }}>
                  <option value="">Select state</option>
                  {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ErrorMsg field="state" />
              </div>
            </div>

            {/* Market */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Market / Area Name *</label>
              <input type="text" name="market" placeholder="e.g. Mile 12 Market, Bodija Market" value={form.market} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, market: '' })); }} style={{ ...inputStyle, borderColor: errBorder('market') }} />
              <ErrorMsg field="market" />
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Exact Location <span style={{ color: theme.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional but recommended)</span></label>

              {/* GPS DETECT BUTTON */}
              <HapticButton
                onClick={handleDetectLocation}
                disabled={locating}
                style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: locating ? theme.pill : `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: locating ? theme.textMuted : '#0a0a0f', border: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {locating ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>📡</span> Detecting your exact location...</> : '📍 Use My Current Location (GPS)'}
              </HapticButton>

              {/* DETECTED RESULT */}
              {form.location && (
                <div style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}30`, borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>📍</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: theme.accent, margin: '0 0 2px' }}>Location Detected</p>
                    <p style={{ fontSize: '12px', color: theme.text, margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{form.location}</p>
                    {form.coords && (
                      <p style={{ fontSize: '11px', color: theme.textMuted, margin: '3px 0 0' }}>
                        🛰️ {form.coords.lat}° N, {form.coords.lng}° E — accuracy ±{form.coords.accuracy}m
                      </p>
                    )}
                  </div>
                  <button onClick={() => setForm((p) => ({ ...p, location: '', coords: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '16px', flexShrink: 0 }}>×</button>
                </div>
              )}

              {/* MANUAL SEARCH fallback */}
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: '2px 0 0', textAlign: 'center' }}>
                — or type it manually below —
              </p>
              <input
                type="text"
                name="location"
                placeholder="e.g. Kuto Market, Abeokuta, Ogun State"
                value={form.location}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Description with character counter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Description (optional)</label>
                <span style={{ fontSize: '11px', fontWeight: 700, color: descColor, transition: 'color 0.2s' }}>
                  {descLeft} / {MAX_DESC}
                </span>
              </div>
              <textarea
                name="description"
                rows={4}
                placeholder="e.g. Seller was asking ₦2000 but fair price is ₦1500. Quality was good."
                value={form.description}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  resize: 'none',
                  border: `1px solid ${descLeft <= 20 ? '#ff4d6d' : theme.inputBorder}`,
                  transition: 'border 0.2s',
                }}
              />
              {descLeft <= 20 && (
                <p style={{ fontSize: '11px', color: '#ff4d6d', margin: 0 }}>
                  {descLeft === 0 ? 'Character limit reached!' : `Only ${descLeft} characters left`}
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <HapticButton
                onClick={() => navigate('/dashboard')}
                style={{ padding: '13px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: theme.pill, color: theme.textMuted, border: `1px solid ${theme.cardBorder}` }}
              >Cancel</HapticButton>
              <HapticButton
                onClick={handleSubmit}
                style={{ flex: 1, padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none', boxShadow: `0 4px 20px ${theme.accent}40`, letterSpacing: '0.5px' }}
              >🚀 Submit Price Report</HapticButton>
            </div>

          </div>
        </div>
      </main>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default NewPost;