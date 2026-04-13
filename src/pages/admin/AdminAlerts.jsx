import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { adminListAlerts, adminCreateAlert, adminUpdateAlert, adminDeleteAlert } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import HapticButton from '../../components/HapticButton';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const EMPTY_FORM = { product: '', message: '', state: '', is_active: true };

function AdminAlerts() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);   // alert object being edited
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchAlerts = useCallback(() => {
    setLoading(true);
    adminListAlerts()
      .then(r => setAlerts(r.data?.data ?? r.data ?? []))
      .catch(() => showToast('Could not load alerts.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (a)  => { setEditing(a); setForm({ product: a.product, message: a.message, state: a.state || '', is_active: a.is_active }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.product.trim() || !form.message.trim()) { showToast('Product and message are required.', 'warning'); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateAlert(editing.id, form);
        showToast('Alert updated.', 'success');
      } else {
        await adminCreateAlert(form);
        showToast('Alert created! 🚨', 'success');
      }
      setShowModal(false);
      fetchAlerts();
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not save alert.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert? This cannot be undone.')) return;
    setActionId(id);
    try {
      await adminDeleteAlert(id);
      showToast('Alert deleted.', 'success');
      fetchAlerts();
    } catch {
      showToast('Could not delete alert.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const toggleActive = async (a) => {
    setActionId(`toggle-${a.id}`);
    try {
      await adminUpdateAlert(a.id, { is_active: !a.is_active });
      showToast(a.is_active ? 'Alert deactivated.' : 'Alert activated!', 'success');
      fetchAlerts();
    } catch {
      showToast('Could not update alert.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const inputStyle = { padding: '11px 14px', borderRadius: '10px', fontSize: '14px', border: `1px solid ${theme.cardBorder}`, background: theme.input || theme.card, color: theme.text, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 24px', overflowX: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Panel</div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: theme.text, margin: 0 }}>Price Alerts</h1>
            <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>{loading ? 'Loading…' : `${Array.isArray(alerts) ? alerts.length : 0} alerts`}</p>
          </div>
          <HapticButton onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', background: `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: '#0a0a0f', border: 'none', fontWeight: 800, fontSize: '13px' }}>
            <Plus size={16} /> New Alert
          </HapticButton>
        </div>

        {/* Alert Cards */}
        {loading ? (
          <div style={{ color: theme.textMuted, fontSize: '14px' }}>Loading alerts…</div>
        ) : (Array.isArray(alerts) ? alerts : []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: theme.textMuted }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔔</div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>No price alerts yet</p>
            <p style={{ fontSize: '13px' }}>Create alerts to notify the community about major price changes.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {(Array.isArray(alerts) ? alerts : []).map(a => (
              <div key={a.id} style={{ background: theme.card, border: `1px solid ${a.is_active ? 'rgba(255,77,109,0.4)' : theme.cardBorder}`, borderRadius: '14px', padding: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
                  <HapticButton onClick={() => openEdit(a)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Pencil size={13} /></HapticButton>
                  <HapticButton onClick={() => handleDelete(a.id)} disabled={actionId === a.id} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(255,77,109,0.3)', background: 'transparent', color: '#ff4d6d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={13} /></HapticButton>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '6px', background: a.is_active ? 'rgba(255,77,109,0.12)' : `${theme.cardBorder}`, color: a.is_active ? '#ff4d6d' : theme.textMuted }}>
                    {a.is_active ? '🔴 Active' : '⚫ Inactive'}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: theme.text, margin: '8px 0 6px' }}>🚨 {a.product}</h3>
                <p style={{ fontSize: '13px', color: theme.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>{a.message}</p>
                {a.state && <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '12px' }}>📍 {a.state}</div>}
                <HapticButton onClick={() => toggleActive(a)} disabled={!!actionId} style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, border: `1px solid ${a.is_active ? theme.cardBorder : `${theme.accent}40`}`, background: a.is_active ? 'transparent' : `${theme.accent}10`, color: a.is_active ? theme.textMuted : theme.accent, cursor: 'pointer' }}>
                  {a.is_active ? 'Deactivate' : 'Activate'}
                </HapticButton>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '460px', margin: '0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.text, margin: 0 }}>{editing ? '✏️ Edit Alert' : '🚨 New Price Alert'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Product *</label>
                <input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Garri" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="e.g. Garri price has risen 40% in Lagos this week." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>State (optional)</label>
                  <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="e.g. Lagos" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Status</label>
                  <div style={{ display: 'flex', gap: '8px', height: '43px' }}>
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setForm({ ...form, is_active: v })} style={{ flex: 1, borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: `1px solid ${form.is_active === v ? theme.accent : theme.cardBorder}`, background: form.is_active === v ? `${theme.accent}15` : 'transparent', color: form.is_active === v ? theme.accent : theme.textMuted, cursor: 'pointer' }}>
                        {v ? 'Active' : 'Inactive'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <HapticButton onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMuted, fontWeight: 700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: '10px', background: saving ? theme.cardBorder : `linear-gradient(135deg, ${theme.accent}, #00c853)`, color: saving ? theme.textMuted : '#0a0a0f', border: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Check size={14} /> {saving ? 'Saving…' : editing ? 'Update Alert' : 'Create Alert'}
                </HapticButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminAlerts;
