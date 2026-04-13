import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  adminListPosts, adminEditPost,
  adminFlagPost, adminUnflagPost, adminExportPosts,
  adminHidePost, adminUnhidePost,
  adminDeletePost,
} from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import HapticButton from '../../components/HapticButton';
import { Search, Flag, EyeOff, Eye, Pencil, Trash2, X, Check } from 'lucide-react';

const CATEGORIES = ['Food & Groceries','Vegetables','Meat & Poultry','Fuel & Energy','Healthcare','Household','Electronics','Clothing','Other'];
const STATES_NG  = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const EMPTY_EDIT = { product:'', price:'', category:'', state:'', market:'', location:'', description:'', image_url:'' };

function AdminPosts() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [flaggedFilter, setFlaggedFilter]   = useState('');
  const [hiddenFilter, setHiddenFilter]     = useState('');
  const [actionId, setActionId] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [saving, setSaving]         = useState(false);
  const [exporting, setExporting]   = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (hiddenFilter !== '') params.is_hidden = hiddenFilter;
      const res = await adminExportPosts(params);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `priceshare-posts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV exported! 📊', 'success');
    } catch { showToast('Export failed.', 'error'); }
    finally { setExporting(false); }
  };

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search)               params.search     = search;
    if (categoryFilter)       params.category   = categoryFilter;
    if (flaggedFilter !== '') params.is_flagged = flaggedFilter;
    if (hiddenFilter  !== '') params.is_hidden  = hiddenFilter;
    adminListPosts(params)
      .then(r => setPosts(r.data?.data ?? r.data ?? []))
      .catch(() => showToast('Could not load posts.', 'error'))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, flaggedFilter, hiddenFilter, showToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const doAction = async (key, fn, msg) => {
    setActionId(key);
    try { await fn(); showToast(msg, 'success'); fetchPosts(); }
    catch (e) { showToast(e.response?.data?.message || 'Action failed.', 'error'); }
    finally { setActionId(null); }
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setEditForm({ product:p.product||'', price:p.price||'', category:p.category||'', state:p.state||'', market:p.market||'', location:p.location||'', description:p.description||'', image_url:p.image_url||'' });
  };

  const handleSaveEdit = async () => {
    if (!editForm.product || !editForm.price) { showToast('Product and price are required.', 'warning'); return; }
    setSaving(true);
    try {
      await adminEditPost(editTarget.id, { ...editForm, price: parseFloat(editForm.price) });
      showToast('Post updated.', 'success');
      setEditTarget(null); fetchPosts();
    } catch (e) { showToast(e.response?.data?.message || 'Could not update post.', 'error'); }
    finally { setSaving(false); }
  };

  const handleHideConfirm = async () => {
    if (!hideTarget) return;
    await doAction(`hide-${hideTarget.id}`, () => adminHidePost(hideTarget.id, hideReason), 'Post hidden from public feed.');
    setHideTarget(null); setHideReason('');
  };

  const iStyle = { padding:'10px 14px', borderRadius:'10px', fontSize:'13px', border:`1px solid ${theme.cardBorder}`, background:theme.card, color:theme.text, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" };
  const lStyle = { fontSize:'11px', fontWeight:700, color:theme.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px' };
  const thS = { fontSize:'11px', fontWeight:700, color:theme.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', padding:'10px 14px', textAlign:'left', borderBottom:`1px solid ${theme.cardBorder}`, whiteSpace:'nowrap' };
  const tdS = { fontSize:'13px', color:theme.text, padding:'10px 14px', borderBottom:`1px solid ${theme.cardBorder}`, verticalAlign:'middle' };
  const Btn = ({ color, bg, label, icon, onClick, disabled }) => (
    <HapticButton onClick={onClick} disabled={disabled} style={{ padding:'5px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, border:`1px solid ${color}40`, background:bg||'transparent', color, display:'flex', alignItems:'center', gap:'3px', whiteSpace:'nowrap', cursor:'pointer', opacity:disabled?0.5:1 }}>
      {icon}{label}
    </HapticButton>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:theme.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex:1, overflowX:'hidden' }}>
        <div style={{ marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={{ fontSize:'10px', color:theme.textMuted, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'4px' }}>Admin Panel</div>
            <h1 style={{ fontSize:'24px', fontWeight:900, color:theme.text, margin:0 }}>Post Moderation</h1>
            <p style={{ fontSize:'13px', color:theme.textMuted, marginTop:'4px' }}>{loading?'Loading…':`${Array.isArray(posts)?posts.length:0} posts`}</p>
          </div>
          <HapticButton onClick={handleExportCSV} disabled={exporting} style={{ padding:'10px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, background:exporting?theme.card:`linear-gradient(135deg,${theme.accent},#00c853)`, color:exporting?theme.textMuted:'#0a0a0f', border:exporting?`1px solid ${theme.cardBorder}`:'none', cursor:exporting?'not-allowed':'pointer', whiteSpace:'nowrap' }}>
            {exporting ? '⏳ Exporting…' : '📥 Export CSV'}
          </HapticButton>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
          <div style={{ position:'relative', flex:'1', minWidth:'180px' }}>
            <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:theme.textMuted }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product or market…" style={{ ...iStyle, paddingLeft:'36px' }} />
          </div>
          <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{ ...iStyle, width:'auto', cursor:'pointer' }}>
            <option value="">All Categories</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={flaggedFilter} onChange={e=>setFlaggedFilter(e.target.value)} style={{ ...iStyle, width:'auto', cursor:'pointer' }}>
            <option value="">All Posts</option><option value="0">Not Flagged</option><option value="1">Flagged</option>
          </select>
          <select value={hiddenFilter} onChange={e=>setHiddenFilter(e.target.value)} style={{ ...iStyle, width:'auto', cursor:'pointer' }}>
            <option value="">All Visibility</option><option value="0">Visible Only</option><option value="1">Hidden Only</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'14px', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <th style={thS}>Product</th><th style={thS}>Price (₦)</th>
              <th style={thS}>Category</th><th style={thS}>State/Market</th>
              <th style={thS}>Posted By</th><th style={thS}>Votes</th>
              <th style={thS}>Tags</th><th style={thS}>Date</th>
              <th style={thS}>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ ...tdS, textAlign:'center', padding:'40px', color:theme.textMuted }}>Loading posts…</td></tr>
              ) : (Array.isArray(posts)?posts:[]).length===0 ? (
                <tr><td colSpan={9} style={{ ...tdS, textAlign:'center', padding:'40px', color:theme.textMuted }}>No posts found.</td></tr>
              ) : (Array.isArray(posts)?posts:[]).map(p => (
                <tr key={p.id} style={{ opacity:p.is_hidden?0.6:1 }}>
                  <td style={tdS}>
                    <div style={{ fontWeight:700 }}>{p.product}</div>
                    {p.description && <div style={{ fontSize:'11px', color:theme.textMuted, maxWidth:'160px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.description}</div>}
                  </td>
                  <td style={{ ...tdS, fontWeight:800, color:theme.accent }}>₦{Number(p.price).toLocaleString()}</td>
                  <td style={tdS}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'6px', background:theme.cardBorder, color:theme.textMuted }}>{p.category}</span></td>
                  <td style={tdS}><div>{p.state}</div><div style={{ fontSize:'11px', color:theme.textMuted }}>{p.market}</div></td>
                  <td style={tdS}><div style={{ fontSize:'12px' }}>{p.user?.name||'—'}</div></td>
                  <td style={tdS}>
                    <span style={{ fontSize:'11px', color:'#00e676', marginRight:'4px' }}>✓{p.confirms_count??0}</span>
                    <span style={{ fontSize:'11px', color:'#ff4d6d' }}>✗{p.denies_count??0}</span>
                  </td>
                  <td style={tdS}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                      {p.is_flagged && <span style={{ fontSize:'11px', fontWeight:700, color:'#ffd600', background:'rgba(255,214,0,0.1)', padding:'2px 6px', borderRadius:'5px' }}>🚩 Flagged</span>}
                      {p.is_hidden  && <span style={{ fontSize:'11px', fontWeight:700, color:'#ff4d6d', background:'rgba(255,77,109,0.1)', padding:'2px 6px', borderRadius:'5px' }}>👁 Hidden</span>}
                      {!p.is_flagged && !p.is_hidden && <span style={{ fontSize:'11px', color:theme.textMuted }}>—</span>}
                    </div>
                  </td>
                  <td style={{ ...tdS, fontSize:'12px', color:theme.textMuted, whiteSpace:'nowrap' }}>
                    {p.created_at?new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}):'—'}
                  </td>
                  <td style={tdS}>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      <Btn color={theme.accent} bg={`${theme.accent}10`} label="Edit" icon={<Pencil size={11}/>} onClick={()=>openEdit(p)} />
                      {p.is_hidden
                        ? <Btn color="#00e676" bg="rgba(0,230,118,0.1)" label="Unhide" icon={<Eye size={11}/>} onClick={()=>doAction(`unhide-${p.id}`,()=>adminUnhidePost(p.id),'Post restored to feed.')} disabled={actionId===`unhide-${p.id}`} />
                        : <Btn color="#ff4d6d" bg="rgba(255,77,109,0.1)" label="Hide" icon={<EyeOff size={11}/>} onClick={()=>{setHideTarget(p);setHideReason('');}} />}
                      {p.is_flagged
                        ? <Btn color="#ffd600" bg="rgba(255,214,0,0.08)" label="Unflag" icon={<Flag size={11}/>} onClick={()=>doAction(`unflag-${p.id}`,()=>adminUnflagPost(p.id),'Post unflagged.')} disabled={actionId===`unflag-${p.id}`} />
                        : <Btn color="#ffd600" bg="rgba(255,214,0,0.08)" label="Flag" icon={<Flag size={11}/>} onClick={()=>doAction(`flag-${p.id}`,()=>adminFlagPost(p.id),'Post flagged.')} disabled={actionId===`flag-${p.id}`} />}
                      <HapticButton onClick={()=>{if(window.confirm('Delete this post?'))doAction(`del-${p.id}`,()=>adminDeletePost(p.id),'Post deleted.');}} style={{ padding:'5px 8px', borderRadius:'8px', border:'1px solid rgba(255,77,109,0.3)', background:'transparent', color:'#ff4d6d', display:'flex', alignItems:'center', cursor:'pointer' }}>
                        <Trash2 size={12}/>
                      </HapticButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Hide Modal ── */}
        {hideTarget && (
          <div onClick={()=>setHideTarget(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'420px', margin:'0 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:800, color:'#ff4d6d', margin:0 }}>👁 Hide Post?</h3>
                <button onClick={()=>setHideTarget(null)} style={{ background:'transparent', border:'none', color:theme.textMuted, cursor:'pointer' }}><X size={18}/></button>
              </div>
              <p style={{ fontSize:'13px', color:theme.textMuted, margin:'0 0 10px', lineHeight:1.6 }}>
                <strong style={{ color:theme.text }}>{hideTarget.product}</strong> will be removed from all public feeds silently. It is not deleted.
              </p>
              <label style={lStyle}>Internal reason (optional)</label>
              <textarea value={hideReason} onChange={e=>setHideReason(e.target.value)} placeholder="e.g. Suspected fraudulent price…" rows={2} style={{ ...iStyle, resize:'none', lineHeight:1.6, marginBottom:'16px' }} />
              <div style={{ display:'flex', gap:'10px' }}>
                <HapticButton onClick={()=>setHideTarget(null)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, fontWeight:700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleHideConfirm} disabled={!!actionId} style={{ flex:2, padding:'12px', borderRadius:'10px', background:'#ff4d6d', color:'#fff', border:'none', fontWeight:800 }}>Hide Post</HapticButton>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Post Modal ── */}
        {editTarget && (
          <div onClick={()=>setEditTarget(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', overflowY:'auto', padding:'24px 16px' }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'540px', margin:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:800, color:theme.text, margin:0 }}>✏️ Edit Post</h3>
                <button onClick={()=>setEditTarget(null)} style={{ background:'transparent', border:'none', color:theme.textMuted, cursor:'pointer' }}><X size={20}/></button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={lStyle}>Product *</label><input value={editForm.product} onChange={e=>setEditForm({...editForm,product:e.target.value})} style={iStyle} /></div>
                <div><label style={lStyle}>Price (₦) *</label><input type="number" min="0" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})} style={iStyle} /></div>
                <div><label style={lStyle}>Category</label>
                  <select value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})} style={{ ...iStyle, cursor:'pointer' }}>
                    <option value="">— Select —</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={lStyle}>State</label>
                  <select value={editForm.state} onChange={e=>setEditForm({...editForm,state:e.target.value})} style={{ ...iStyle, cursor:'pointer' }}>
                    <option value="">— Select —</option>{STATES_NG.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={lStyle}>Market</label><input value={editForm.market} onChange={e=>setEditForm({...editForm,market:e.target.value})} style={iStyle} /></div>
                <div><label style={lStyle}>Location</label><input value={editForm.location} onChange={e=>setEditForm({...editForm,location:e.target.value})} style={iStyle} /></div>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={lStyle}>Description</label>
                <textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} rows={2} style={{ ...iStyle, resize:'none', lineHeight:1.6 }} />
              </div>
              <div style={{ marginBottom:'20px' }}>
                <label style={lStyle}>Image URL</label>
                <input value={editForm.image_url} onChange={e=>setEditForm({...editForm,image_url:e.target.value})} placeholder="https://…" style={iStyle} />
                {editForm.image_url && (
                  <img src={editForm.image_url} alt="preview" style={{ marginTop:'8px', width:'100%', maxHeight:'120px', objectFit:'cover', borderRadius:'10px', border:`1px solid ${theme.cardBorder}` }} onError={e=>{e.target.style.display='none';}} />
                )}
              </div>
              <div style={{ display:'flex', gap:'10px' }}>
                <HapticButton onClick={()=>setEditTarget(null)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, fontWeight:700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleSaveEdit} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', background:saving?theme.cardBorder:`linear-gradient(135deg,${theme.accent},#00c853)`, color:saving?theme.textMuted:'#0a0a0f', border:'none', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <Check size={14}/>{saving?'Saving…':'Save Changes'}
                </HapticButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPosts;

