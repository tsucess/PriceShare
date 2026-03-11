import React, { useState } from 'react';

function HapticButton({ onClick, style, children, disabled }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={(e) => {
        if (disabled) return;
        if (onClick) onClick(e);
      }}
      style={{
        ...style,
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        display: style?.display || 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </div>
  );
}

export default HapticButton;