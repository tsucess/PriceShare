import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListTags, adminCreateTag, adminUpdateTag, adminDeleteTag,
} from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import HapticButton from '../../components/HapticButton';
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react';

const EMPTY_CAT = { name:'', emoji:'', color:'#00e676', description:'', is_active:true, sort_order:0 };
const EMPTY_TAG = { name:'', color:'#00b0ff', is_active:true };

function ColorDot({ color, size = 14 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:color, flexShrink:0, border:'1px solid rgba(255,255,255,0.2)' }} />;
}

function AdminCategories() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [tab, setTab]               = useState('categories'); // 'categories' | 'tags'
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // { type:'cat'|'tag', item?:object }
  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(false);
  const [actionId, setActionId]     = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([adminListCategories(), adminListTags()])
      .then(([cr, tr]) => { setCategories(cr.data ?? []); setTags(tr.data ?? []); })
      .catch(() => showToast('Could not load data.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = (type, item = null) => {
    setModal({ type, item });
    setForm(item ? { ...item } : type === 'cat' ? { ...EMPTY_CAT } : { ...EMPTY_TAG });
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { showToast('Name is required.', 'warning'); return; }
    setSaving(true);
    try {
      if (modal.type === 'cat') {
        if (modal.item) await adminUpdateCategory(modal.item.id, form);
        else             await adminCreateCategory(form);
      } else {
        if (modal.item) await adminUpdateTag(modal.item.id, form);
        else             await adminCreateTag(form);
      }
      showToast(modal.item ? 'Updated!' : 'Created!', 'success');
      setModal(null);
      fetchAll();
    } catch (e) { showToast(e.response?.data?.message || 'Could not save.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActionId(`${type}-${id}`);
    try {
      if (type === 'cat') await adminDeleteCategory(id);
      else                 await adminDeleteTag(id);
      showToast('Deleted.', 'success');
      fetchAll();
    } catch (e) { showToast(e.response?.data?.message || 'Could not delete.', 'error'); }
    finally { setActionId(null); }
  };

  const iStyle = { padding:'10px 14px', borderRadius:'10px', fontSize:'13px', border:`1px solid ${theme.cardBorder}`, background:theme.bg, color:theme.text, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" };
  const lStyle = { fontSize:'11px', fontWeight:700, color:theme.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px' };

  const isCat = tab === 'categories';
  const items = isCat ? categories : tags;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:theme.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex:1, overflowX:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
          <div>
            <div style={{ fontSize:'10px', color:theme.textMuted, letterSpacing:'3px', textTransform:'uppercase', marginBottom:4 }}>Admin Panel</div>
            <h1 style={{ fontSize:'24px', fontWeight:900, color:theme.text, margin:0 }}>Categories & Tags</h1>
            <p style={{ fontSize:'13px', color:theme.textMuted, marginTop:4 }}>Manage product taxonomy for the platform</p>
          </div>
          <HapticButton onClick={() => openModal(isCat ? 'cat' : 'tag')} style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:10, background:`linear-gradient(135deg,${theme.accent},#00c853)`, color:'#0a0a0f', border:'none', fontWeight:800, fontSize:13 }}>
            <Plus size={16} /> New {isCat ? 'Category' : 'Tag'}
          </HapticButton>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {['categories','tags'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'9px 22px', borderRadius:10, fontSize:13, fontWeight:700, border:`1px solid ${tab===t ? theme.accent : theme.cardBorder}`, background: tab===t ? `${theme.accent}15` : 'transparent', color: tab===t ? theme.accent : theme.textMuted, cursor:'pointer', textTransform:'capitalize' }}>
              {t === 'tags' && <Tag size={12} style={{ marginRight:6, verticalAlign:'middle' }} />}{t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ color:theme.textMuted, fontSize:14 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px', color:theme.textMuted }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{isCat ? '🏷️' : '🔖'}</div>
            <p style={{ fontWeight:700, color:theme.text }}>No {tab} yet.</p>
            <p style={{ fontSize:13 }}>Create the first one using the button above.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
            {items.map(item => (
              <div key={item.id} style={{ background:theme.card, border:`1px solid ${item.is_active ? item.color + '50' : theme.cardBorder}`, borderLeft:`4px solid ${item.color}`, borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:8, opacity:item.is_active?1:0.6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <ColorDot color={item.color} size={12} />
                    <span style={{ fontSize:15, fontWeight:800, color:theme.text }}>
                      {isCat && item.emoji && <span style={{ marginRight:6 }}>{item.emoji}</span>}
                      {item.name}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => openModal(isCat?'cat':'tag', item)} style={{ width:28, height:28, borderRadius:7, border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Pencil size={12}/></button>
                    <button onClick={() => handleDelete(isCat?'cat':'tag', item.id, item.name)} disabled={actionId===`${isCat?'cat':'tag'}-${item.id}`} style={{ width:28, height:28, borderRadius:7, border:'1px solid rgba(255,77,109,0.3)', background:'transparent', color:'#ff4d6d', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Trash2 size={12}/></button>
                  </div>
                </div>
                {isCat && item.description && <p style={{ fontSize:12, color:theme.textMuted, margin:0, lineHeight:1.5 }}>{item.description}</p>}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:5, background:item.is_active?'rgba(0,230,118,0.12)':'rgba(255,77,109,0.1)', color:item.is_active?'#00e676':'#ff4d6d' }}>
                    {item.is_active ? '● Active' : '○ Inactive'}
                  </span>
                  {isCat && <span style={{ fontSize:10, color:theme.textMuted, padding:'2px 8px', borderRadius:5, background:theme.cardBorder }}>Order: {item.sort_order}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div onClick={() => setModal(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', overflowY:'auto', padding:'24px 16px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:20, padding:28, width:'100%', maxWidth:460, margin:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ fontSize:16, fontWeight:800, color:theme.text, margin:0 }}>
                  {modal.item ? '✏️ Edit' : '➕ New'} {modal.type === 'cat' ? 'Category' : 'Tag'}
                </h3>
                <button onClick={() => setModal(null)} style={{ background:'transparent', border:'none', color:theme.textMuted, cursor:'pointer' }}><X size={20}/></button>
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={lStyle}>Name *</label>
                <input value={form.name||''} onChange={e => setForm({...form, name:e.target.value})} placeholder={modal.type==='cat' ? 'e.g. Food & Groceries' : 'e.g. Price Drop'} style={iStyle} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                {modal.type === 'cat' && (
                  <div>
                    <label style={lStyle}>Emoji</label>
                    <input value={form.emoji||''} onChange={e => setForm({...form, emoji:e.target.value})} placeholder="🛒" style={iStyle} />
                  </div>
                )}
                <div>
                  <label style={lStyle}>Colour</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input type="color" value={form.color||'#00e676'} onChange={e => setForm({...form, color:e.target.value})} style={{ width:44, height:44, padding:2, borderRadius:8, border:`1px solid ${theme.cardBorder}`, background:'transparent', cursor:'pointer' }} />
                    <input value={form.color||''} onChange={e => setForm({...form, color:e.target.value})} placeholder="#00e676" style={{ ...iStyle, flex:1 }} />
                  </div>
                </div>
                {modal.type === 'cat' && (
                  <div>
                    <label style={lStyle}>Sort Order</label>
                    <input type="number" min="0" value={form.sort_order??0} onChange={e => setForm({...form, sort_order:parseInt(e.target.value)||0})} style={iStyle} />
                  </div>
                )}
              </div>

              {modal.type === 'cat' && (
                <div style={{ marginBottom:12 }}>
                  <label style={lStyle}>Description</label>
                  <textarea value={form.description||''} onChange={e => setForm({...form, description:e.target.value})} rows={2} placeholder="Short description of this category…" style={{ ...iStyle, resize:'none', lineHeight:1.6 }} />
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <label style={lStyle}>Status</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setForm({...form, is_active:v})} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, border:`1px solid ${form.is_active===v ? theme.accent : theme.cardBorder}`, background:form.is_active===v ? `${theme.accent}15` : 'transparent', color:form.is_active===v ? theme.accent : theme.textMuted, cursor:'pointer' }}>
                      {v ? '● Active' : '○ Inactive'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <HapticButton onClick={() => setModal(null)} style={{ flex:1, padding:12, borderRadius:10, border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, fontWeight:700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleSave} disabled={saving} style={{ flex:2, padding:12, borderRadius:10, background:saving ? theme.cardBorder : `linear-gradient(135deg,${theme.accent},#00c853)`, color:saving?theme.textMuted:'#0a0a0f', border:'none', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <Check size={14}/> {saving ? 'Saving…' : modal.item ? 'Save Changes' : `Create ${modal.type==='cat'?'Category':'Tag'}`}
                </HapticButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminCategories;
