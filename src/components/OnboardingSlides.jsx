import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const slides = [
  {
    emoji: '📸',
    color: '#00e676',
    title: 'Snap & Report Prices',
    desc: 'See an unfair price at your local market? Take a photo and report it in seconds. Help your community know what things really cost.',
    bg: 'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,200,83,0.04))',
  },
  {
    emoji: '🔍',
    color: '#00b0ff',
    title: 'Compare Before You Buy',
    desc: 'Search any product and instantly see prices from markets across Nigeria. Never overpay again — always know the fair price.',
    bg: 'linear-gradient(135deg, rgba(0,176,255,0.12), rgba(0,145,234,0.04))',
  },
  {
    emoji: '🏛️',
    color: '#ffd600',
    title: 'Fight Price Gouging',
    desc: 'When sellers charge extreme prices, report them directly to the government. Together we can make Nigerian markets fairer for everyone.',
    bg: 'linear-gradient(135deg, rgba(255,214,0,0.12), rgba(255,160,0,0.04))',
  },
];

function OnboardingSlides({ onDone }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      onDone();
      navigate('/signup');
    }
  };

  const handleSkip = () => {
    onDone();
    navigate('/login');
  };

  const slide = slides[current];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: theme.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* SKIP BUTTON */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        padding: '20px 24px 0',
      }}>
        <button
          onClick={handleSkip}
          style={{
            background: 'transparent', border: 'none',
            fontSize: '13px', fontWeight: 600,
            color: theme.textMuted, cursor: 'pointer', padding: '8px 12px',
          }}
        >Skip →</button>
      </div>

      {/* SLIDE CONTENT */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(12px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}>

        {/* ICON CIRCLE */}
        <div style={{
          width: '140px', height: '140px', borderRadius: '40px',
          background: slide.bg,
          border: `2px solid ${slide.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '40px',
          boxShadow: `0 20px 60px ${slide.color}25`,
        }}>
          <span style={{ fontSize: '64px' }}>{slide.emoji}</span>
        </div>

        {/* TEXT */}
        <h2 style={{
          fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 900,
          color: theme.text, textAlign: 'center',
          marginBottom: '16px', lineHeight: 1.2,
          maxWidth: '320px',
        }}>
          {slide.title.split(' ').map((word, i) => {
            const isLast = i === slide.title.split(' ').length - 1;
            const isSecondLast = i === slide.title.split(' ').length - 2;
            return (
              <span key={i} style={{ color: (isLast || isSecondLast) ? slide.color : theme.text }}>
                {word}{' '}
              </span>
            );
          })}
        </h2>

        <p style={{
          fontSize: '15px', color: theme.textMuted, textAlign: 'center',
          lineHeight: 1.75, maxWidth: '300px', margin: 0,
        }}>
          {slide.desc}
        </p>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

        {/* DOTS */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px', borderRadius: '4px',
                background: i === current ? slide.color : theme.cardBorder,
                transition: 'all 0.3s ease', cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* NEXT BUTTON */}
        <button
          onClick={handleNext}
          style={{
            width: '100%', maxWidth: '360px', padding: '16px',
            borderRadius: '14px', fontSize: '15px', fontWeight: 800,
            border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`,
            color: '#0a0a0f',
            boxShadow: `0 6px 24px ${slide.color}40`,
            transition: 'all 0.3s ease',
          }}
        >
          {current === slides.length - 1 ? 'Get Started 🇳🇬' : 'Next →'}
        </button>

        {/* LOGIN LINK */}
        {current === slides.length - 1 && (
          <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
            Already have an account?{' '}
            <span
              onClick={handleSkip}
              style={{ color: slide.color, fontWeight: 700, cursor: 'pointer' }}
            >Log In</span>
          </p>
        )}
      </div>

      {/* NIGERIA FLAG STRIP */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #008751, #ffffff, #008751)',
      }} />

    </div>
  );
}

export default OnboardingSlides;