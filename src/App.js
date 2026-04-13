import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import Feed from './pages/Feed';
import ComparePrices from './pages/ComparePrices';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import SplashScreen from './components/SplashScreen';
import OnboardingSlides from './components/OnboardingSlides';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminComments from './pages/admin/AdminComments';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminCategories from './pages/admin/AdminCategories';
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
          localStorage.setItem(process.env.REACT_APP_ONBOARD_KEY || 'pw-onboarded', 'true');
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
        <Route path="/profile"    element={<ProfilePage />} />
        {/* <Route path="/report" element={<GovReport />} /> */}

        {/* ── Admin Routes ─────────────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/posts"    element={<AdminRoute><AdminPosts /></AdminRoute>} />
        <Route path="/admin/comments" element={<AdminRoute><AdminComments /></AdminRoute>} />
        <Route path="/admin/alerts"      element={<AdminRoute><AdminAlerts /></AdminRoute>} />
        <Route path="/admin/categories"  element={<AdminRoute><AdminCategories /></AdminRoute>} />

        <Route path="*"           element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  const hasSeenOnboarding = localStorage.getItem(process.env.REACT_APP_ONBOARD_KEY || 'pw-onboarded') === 'true';

  const [showSplash, setShowSplash]         = useState(!hasSeenOnboarding);
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;