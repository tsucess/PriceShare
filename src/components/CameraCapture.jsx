import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Camera, FlipHorizontal, X, Circle } from 'lucide-react';

/**
 * CameraCapture
 * Props:
 *   onCapture(dataUrl) — called with base64 image when the user snaps
 *   onClose()         — called when user cancels
 */
function CameraCapture({ onCapture, onClose }) {
  const theme = useTheme();
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = rear, 'user' = front
  const [ready, setReady]           = useState(false);
  const [error, setError]           = useState('');
  const [flash, setFlash]           = useState(false);

  const startCamera = useCallback(async (mode) => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setReady(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Could not access camera. Make sure no other app is using it.'
      );
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  const handleFlip = () => {
    setFacingMode(m => m === 'environment' ? 'user' : 'environment');
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    // Flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    // Stop camera then hand image back
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onCapture(dataUrl);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Close */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
      >
        <X size={22} />
      </button>

      {/* Camera label */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Camera size={14} color="#fff" />
        <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
          {facingMode === 'environment' ? 'REAR CAMERA' : 'FRONT CAMERA'}
        </span>
      </div>

      {/* Video preview */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '4/3', overflow: 'hidden', borderRadius: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        {/* Flash overlay */}
        {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.7 }} />}
        {/* Loading overlay */}
        {!ready && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 13, color: '#fff' }}>Starting camera…</div>
          </div>
        )}
        {/* Viewfinder corners */}
        {ready && (
          <>
            {[{ top: 16, left: 16, borderLeft: '3px solid #fff', borderTop: '3px solid #fff' },
              { top: 16, right: 16, borderRight: '3px solid #fff', borderTop: '3px solid #fff' },
              { bottom: 16, left: 16, borderLeft: '3px solid #fff', borderBottom: '3px solid #fff' },
              { bottom: 16, right: 16, borderRight: '3px solid #fff', borderBottom: '3px solid #fff' }
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
            ))}
          </>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '16px 24px', maxWidth: 400, textAlign: 'center' }}>
          <p style={{ color: '#ff4d6d', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{error}</p>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, background: theme.accent, color: '#0a0a0f', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      )}

      {/* Controls */}
      {!error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 28, paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          {/* Flip */}
          <button
            onClick={handleFlip}
            style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
          >
            <FlipHorizontal size={22} />
          </button>

          {/* Snap */}
          <button
            onClick={handleSnap}
            disabled={!ready}
            style={{ width: 72, height: 72, borderRadius: '50%', background: ready ? '#fff' : 'rgba(255,255,255,0.3)', border: '4px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ready ? 'pointer' : 'not-allowed', transition: 'all 0.15s', boxShadow: ready ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none' }}
          >
            <Circle size={28} color={ready ? '#111' : '#888'} fill={ready ? '#111' : 'transparent'} />
          </button>

          {/* Placeholder to balance layout */}
          <div style={{ width: 52 }} />
        </div>
      )}

      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default CameraCapture;
