import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const toastTypes = {
  success: { icon: '✅', color: '#00e676' },
  error: { icon: '❌', color: '#ff4d6d' },
  info: { icon: '💡', color: '#00b0ff' },
  warning: { icon: '⚠️', color: '#ffd600' },
};

function Toast({ message, type = 'success', onClose }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const { icon, color } = toastTypes[type] || toastTypes.success;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 99999,
      background: theme.card,
      border: `1px solid ${color}40`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '12px',
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: theme.dark
        ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}10`
        : `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${color}10`,
      minWidth: '200px', maxWidth: '320px',
      whiteSpace: 'nowrap',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text, flex: 1, whiteSpace: 'normal' }}>
        {message}
      </span>
      <span
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{ fontSize: '16px', color: theme.textMuted, cursor: 'pointer', marginLeft: '4px' }}
      >×</span>
    </div>
  );
}

export default Toast;