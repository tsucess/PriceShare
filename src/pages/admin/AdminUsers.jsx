import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  adminListUsers, adminEditUser, adminBanUser, adminUnbanUser,
  adminShadowBanUser, adminUnshadowBanUser,
  adminPromoteUser, adminDemoteUser, adminDeleteUser,
} from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import HapticButton from '../../components/HapticButton';
import { Search, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX, EyeOff, Eye, Pencil, X, Check } from 'lucide-react';

const STATES_NG = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const EMPTY_EDIT = { name:'', username:'', email:'', phone:'', state:'', bio:'', occupation:'', gender:'', visibility:'public' };

function AdminUsers() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [actionId, setActionId]     = useState(null);
  const [banTarget, setBanTarget]   = useState(null);
  const [banReason, setBanReason]   = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [saving, setSaving]         = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search)              params.search    = search;
    if (roleFilter)          params.role      = roleFilter;
    if (bannedFilter !== '') params.is_banned = bannedFilter;
    adminListUsers(params)
      .then(r => setUsers(r.data?.data ?? r.data ?? []))
      .catch(() => showToast('Could not load users.', 'error'))
      .finally(() => setLoading(false));
  }, [search, roleFilter, bannedFilter, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (key, fn, msg) => {
    setActionId(key);
    try { await fn(); showToast(msg, 'success'); fetchUsers(); }
    catch (e) { showToast(e.response?.data?.message || 'Action failed.', 'error'); }
    finally { setActionId(null); }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ name:u.name||'', username:u.username||'', email:u.email||'', phone:u.phone||'', state:u.state||'', bio:u.bio||'', occupation:u.occupation||'', gender:u.gender||'', visibility:u.visibility||'public' });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await adminEditUser(editTarget.id, editForm);
      showToast('User updated successfully.', 'success');
      setEditTarget(null);
      fetchUsers();
    } catch (e) { showToast(e.response?.data?.message || 'Could not update user.', 'error'); }
    finally { setSaving(false); }
  };

  const handleBanConfirm = async () => {
    if (!banTarget) return;
    await doAction(`ban-${banTarget.id}`, () => adminBanUser(banTarget.id, banReason), `${banTarget.name} has been banned.`);
    setBanTarget(null); setBanReason('');
  };

  const inputStyle = { padding:'10px 14px', borderRadius:'10px', fontSize:'13px', border:`1px solid ${theme.cardBorder}`, background:theme.card, color:theme.text, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" };
  const labelStyle = { fontSize:'11px', fontWeight:700, color:theme.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px' };
  const thStyle = { fontSize:'11px', fontWeight:700, color:theme.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', padding:'10px 14px', textAlign:'left', borderBottom:`1px solid ${theme.cardBorder}`, whiteSpace:'nowrap' };
  const tdStyle = { fontSize:'13px', color:theme.text, padding:'10px 14px', borderBottom:`1px solid ${theme.cardBorder}`, verticalAlign:'middle' };

  const Btn = ({ color, bg, label, icon, onClick, disabled }) => (
    <HapticButton onClick={onClick} disabled={disabled} title={label} style={{ padding:'5px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, border:`1px solid ${color}40`, background:bg||'transparent', color, display:'flex', alignItems:'center', gap:'3px', whiteSpace:'nowrap', cursor:'pointer', opacity: disabled ? 0.5 : 1 }}>
      {icon}{label}
    </HapticButton>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:theme.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <AdminSidebar />
      <main className="admin-main" style={{ flex:1, overflowX:'hidden' }}>

        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'10px', color:theme.textMuted, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'4px' }}>Admin Panel</div>
          <h1 style={{ fontSize:'24px', fontWeight:900, color:theme.text, margin:0 }}>User Management</h1>
          <p style={{ fontSize:'13px', color:theme.textMuted, marginTop:'4px' }}>
            {loading ? 'Loading…' : `${Array.isArray(users) ? users.length : 0} users`}
          </p>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
          <div style={{ position:'relative', flex:'1', minWidth:'200px' }}>
            <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:theme.textMuted }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, username, phone…" style={{ ...inputStyle, paddingLeft:'36px' }} />
          </div>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
            <option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option>
          </select>
          <select value={bannedFilter} onChange={e=>setBannedFilter(e.target.value)} style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
            <option value="">All Status</option><option value="0">Active</option><option value="1">Banned</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'14px', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Email / Phone</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Posts</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...tdStyle, textAlign:'center', padding:'40px', color:theme.textMuted }}>Loading users…</td></tr>
              ) : (Array.isArray(users)?users:[]).length === 0 ? (
                <tr><td colSpan={8} style={{ ...tdStyle, textAlign:'center', padding:'40px', color:theme.textMuted }}>No users found.</td></tr>
              ) : (Array.isArray(users)?users:[]).map(u => (
                <tr key={u.id} style={{ opacity: u.is_banned ? 0.65 : 1 }}>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', border:`2px solid ${theme.cardBorder}` }} />
                        : <div style={{ width:34, height:34, borderRadius:'50%', background:`${theme.accent}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:800, color:theme.accent }}>{(u.name||'?')[0].toUpperCase()}</div>}
                      <div>
                        <div style={{ fontWeight:700 }}>{u.name}</div>
                        <div style={{ fontSize:'11px', color:theme.textMuted }}>@{u.username||'—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize:'12px' }}>{u.email||u.phone||'—'}</td>
                  <td style={tdStyle}>{u.state||'—'}</td>
                  <td style={tdStyle}><span style={{ fontWeight:700, color:theme.accent }}>{u.posts_count??0}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'6px', background:u.role==='admin'?`${theme.accent}25`:`${theme.cardBorder}`, color:u.role==='admin'?theme.accent:theme.textMuted }}>
                      {u.role==='admin'?'🛡️ Admin':'User'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                      {u.is_banned
                        ? <span style={{ fontSize:'11px', fontWeight:700, color:'#ff4d6d', background:'rgba(255,77,109,0.1)', padding:'2px 7px', borderRadius:'5px' }}>🚫 Banned</span>
                        : <span style={{ fontSize:'11px', fontWeight:700, color:'#00e676', background:'rgba(0,230,118,0.1)', padding:'2px 7px', borderRadius:'5px' }}>✓ Active</span>}
                      {u.is_shadow_banned && (
                        <span style={{ fontSize:'11px', fontWeight:700, color:'#ffd600', background:'rgba(255,214,0,0.1)', padding:'2px 7px', borderRadius:'5px' }}>👁 Shadow</span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize:'12px', color:theme.textMuted, whiteSpace:'nowrap' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                      <Btn color={theme.accent} bg={`${theme.accent}10`} label="Edit" icon={<Pencil size={11}/>} onClick={() => openEdit(u)} />
                      {u.is_banned
                        ? <Btn color="#00e676" bg="rgba(0,230,118,0.1)" label="Unban" icon={<UserCheck size={11}/>} onClick={()=>doAction(`unban-${u.id}`,()=>adminUnbanUser(u.id),`${u.name} unbanned.`)} disabled={actionId===`unban-${u.id}`} />
                        : <Btn color="#ff4d6d" bg="rgba(255,77,109,0.1)" label="Ban" icon={<UserX size={11}/>} onClick={()=>{setBanTarget(u);setBanReason('');}} />}
                      {u.is_shadow_banned
                        ? <Btn color="#ffd600" bg="rgba(255,214,0,0.08)" label="Unsilence" icon={<Eye size={11}/>} onClick={()=>doAction(`unshadow-${u.id}`,()=>adminUnshadowBanUser(u.id),`${u.name} unsilenced.`)} disabled={actionId===`unshadow-${u.id}`} />
                        : <Btn color="#ffd600" bg="rgba(255,214,0,0.08)" label="Shadow" icon={<EyeOff size={11}/>} onClick={()=>doAction(`shadow-${u.id}`,()=>adminShadowBanUser(u.id),`${u.name} shadow banned.`)} disabled={actionId===`shadow-${u.id}`} />}
                      {u.role==='admin'
                        ? <Btn color={theme.textMuted} label="Demote" icon={<ShieldOff size={11}/>} onClick={()=>doAction(`demote-${u.id}`,()=>adminDemoteUser(u.id),`${u.name} demoted.`)} disabled={actionId===`demote-${u.id}`} />
                        : <Btn color={theme.accent} bg={`${theme.accent}10`} label="Promote" icon={<ShieldCheck size={11}/>} onClick={()=>doAction(`promote-${u.id}`,()=>adminPromoteUser(u.id),`${u.name} promoted.`)} disabled={actionId===`promote-${u.id}`} />}
                      <HapticButton onClick={()=>{if(window.confirm(`Delete ${u.name}? This cannot be undone.`))doAction(`del-${u.id}`,()=>adminDeleteUser(u.id),`${u.name} deleted.`);}} style={{ padding:'5px 8px', borderRadius:'8px', border:'1px solid rgba(255,77,109,0.3)', background:'transparent', color:'#ff4d6d', display:'flex', alignItems:'center', cursor:'pointer' }}>
                        <Trash2 size={12}/>
                      </HapticButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Ban Modal ── */}
        {banTarget && (
          <div onClick={()=>setBanTarget(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'400px', margin:'0 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:800, color:'#ff4d6d', margin:0 }}>🚫 Ban {banTarget.name}?</h3>
                <button onClick={()=>setBanTarget(null)} style={{ background:'transparent', border:'none', color:theme.textMuted, cursor:'pointer' }}><X size={18}/></button>
              </div>
              <p style={{ fontSize:'13px', color:theme.textMuted, margin:'0 0 16px', lineHeight:1.6 }}>This user will be unable to log in. You can unban them later.</p>
              <label style={labelStyle}>Reason (optional)</label>
              <textarea value={banReason} onChange={e=>setBanReason(e.target.value)} placeholder="e.g. Posting false prices repeatedly…" rows={3} style={{ ...inputStyle, resize:'none', lineHeight:1.6, marginBottom:'16px' }} />
              <div style={{ display:'flex', gap:'10px' }}>
                <HapticButton onClick={()=>setBanTarget(null)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, fontWeight:700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleBanConfirm} disabled={!!actionId} style={{ flex:2, padding:'12px', borderRadius:'10px', background:'#ff4d6d', color:'#fff', border:'none', fontWeight:800 }}>Confirm Ban</HapticButton>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit User Modal ── */}
        {editTarget && (
          <div onClick={()=>setEditTarget(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', overflowY:'auto', padding:'24px 16px' }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'520px', margin:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:800, color:theme.text, margin:0 }}>✏️ Edit User — {editTarget.name}</h3>
                <button onClick={()=>setEditTarget(null)} style={{ background:'transparent', border:'none', color:theme.textMuted, cursor:'pointer' }}><X size={20}/></button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={labelStyle}>Full Name</label><input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Username</label><input value={editForm.username} onChange={e=>setEditForm({...editForm,username:e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Email</label><input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Phone</label><input value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})} style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>State</label>
                  <select value={editForm.state} onChange={e=>setEditForm({...editForm,state:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="">— None —</option>
                    {STATES_NG.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={editForm.gender} onChange={e=>setEditForm({...editForm,gender:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="">— None —</option>
                    <option value="male">Male</option><option value="female">Female</option>
                    <option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={labelStyle}>Occupation</label>
                <input value={editForm.occupation} onChange={e=>setEditForm({...editForm,occupation:e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={labelStyle}>Bio</label>
                <textarea value={editForm.bio} onChange={e=>setEditForm({...editForm,bio:e.target.value})} rows={2} style={{ ...inputStyle, resize:'none', lineHeight:1.6 }} />
              </div>
              <div style={{ marginBottom:'20px' }}>
                <label style={labelStyle}>Profile Visibility</label>
                <div style={{ display:'flex', gap:'8px' }}>
                  {['public','private'].map(v=>(
                    <button key={v} onClick={()=>setEditForm({...editForm,visibility:v})} style={{ flex:1, padding:'10px', borderRadius:'10px', fontSize:'13px', fontWeight:700, border:`1px solid ${editForm.visibility===v?theme.accent:theme.cardBorder}`, background:editForm.visibility===v?`${theme.accent}15`:'transparent', color:editForm.visibility===v?theme.accent:theme.textMuted, cursor:'pointer', textTransform:'capitalize' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:'10px' }}>
                <HapticButton onClick={()=>setEditTarget(null)} style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${theme.cardBorder}`, background:'transparent', color:theme.textMuted, fontWeight:700 }}>Cancel</HapticButton>
                <HapticButton onClick={handleSaveEdit} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'10px', background:saving?theme.cardBorder:`linear-gradient(135deg,${theme.accent},#00c853)`, color:saving?theme.textMuted:'#0a0a0f', border:'none', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <Check size={14}/> {saving ? 'Saving…' : 'Save Changes'}
                </HapticButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;
