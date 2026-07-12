import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import RoleMatcher from './pages/RoleMatcher';
import InterviewPractice from './pages/InterviewPractice';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Contact from './pages/Contact';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Indicator banner for offline simulator fallback
function SimulatorBanner() {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isSim = localStorage.getItem('primeai_simulator_alert') === 'true';
    setShow(isSim);
  }, [location]);

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-b border-indigo-500/20 text-center py-2 px-4 text-xs font-semibold text-cyan-300 font-orbitron tracking-wider animate-pulse flex items-center justify-center space-x-2">
      <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
      <span>SIMULATOR MODE: OFFLINE LOCALSTORAGE DATABASE DETECTED</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <SimulatorBanner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
            <Route path="/role-matcher" element={<RoleMatcher />} />
            <Route path="/interview" element={<InterviewPractice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
