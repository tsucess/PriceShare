import React from 'react';
import { useTheme } from '../context/ThemeContext';

function SkeletonCard() {
  const theme = useTheme();

  return (
    <div style={{
      background: theme.card, border: `1px solid ${theme.cardBorder}`,
      borderRadius: '16px', overflow: 'hidden',
    }}>
      {/* IMAGE SKELETON */}
      <div style={{
        width: '100%', height: '180px',
        background: theme.dark
          ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
          : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />

      <div style={{ padding: '14px' }}>
        {/* TITLE */}
        <div style={{
          height: '16px', borderRadius: '8px', marginBottom: '10px', width: '60%',
          background: theme.dark
            ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
            : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />

        {/* LOCATION */}
        <div style={{
          height: '12px', borderRadius: '6px', marginBottom: '8px', width: '45%',
          background: theme.dark
            ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
            : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite 0.1s',
        }} />

        {/* USER + DATE ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{
            height: '11px', borderRadius: '6px', width: '30%',
            background: theme.dark
              ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
              : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite 0.2s',
          }} />
          <div style={{
            height: '11px', borderRadius: '6px', width: '25%',
            background: theme.dark
              ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
              : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite 0.2s',
          }} />
        </div>

        {/* BUTTONS */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            flex: 1, height: '40px', borderRadius: '10px',
            background: theme.dark
              ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
              : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite 0.3s',
          }} />
          <div style={{
            flex: 1, height: '40px', borderRadius: '10px',
            background: theme.dark
              ? 'linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)'
              : 'linear-gradient(90deg, #e8e8f0 25%, #f0f0f8 50%, #e8e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite 0.3s',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default SkeletonCard;