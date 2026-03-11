import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import Feed from './pages/Feed';
import ComparePrices from './pages/ComparePrices';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import SplashScreen from './components/SplashScreen';
import OnboardingSlides from './components/OnboardingSlides';
// import GovReport from './pages/GovReport';

// Scrolls window to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppContent({ showOnboarding, setShowOnboarding }) {
  return (
    <>
      <ScrollToTop />
      {showOnboarding && (
        <OnboardingSlides onDone={() => {
          localStorage.setItem('pw-onboarded', 'true');
          setShowOnboarding(false);
        }} />
      )}
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/signup"    element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post"      element={<NewPost />} />
        <Route path="/feed"      element={<Feed />} />
        <Route path="/compare"   element={<ComparePrices />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/post/:id"  element={<PostDetail />} />
        {/* <Route path="/report" element={<GovReport />} /> */}
      </Routes>
    </>
  );
}

function App() {
  const hasSeenOnboarding = localStorage.getItem('pw-onboarded') === 'true';

  const [showSplash, setShowSplash]         = useState(!hasSeenOnboarding);
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  return (
    <>
      {showSplash && (
        <SplashScreen onDone={() => setShowSplash(false)} />
      )}
      {!showSplash && (
        <Router>
          <AppContent
            showOnboarding={showOnboarding}
            setShowOnboarding={setShowOnboarding}
          />
        </Router>
      )}
    </>
  );
}

export default App;