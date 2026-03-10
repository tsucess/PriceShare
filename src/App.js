import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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

function AppContent({ showOnboarding, setShowOnboarding }) {
  return (
    <>
      {showOnboarding && (
        <OnboardingSlides onDone={() => setShowOnboarding(false)} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post" element={<NewPost />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/compare" element={<ComparePrices />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/post/:id" element={<PostDetail />} />
        {/* <Route path="/report" element={<GovReport />} /> */}
      </Routes>
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

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