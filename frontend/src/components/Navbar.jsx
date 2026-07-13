import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiCpu, FiSun, FiMoon } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('primeai_theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('light', storedTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('primeai_theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  };

  // Poll LocalStorage for session status
  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('primeai_session_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Navbar session parse error:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('primeai_session_user');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resume AI Analyzer', path: '/resume' },
    { name: 'Career Role Matcher', path: '/role-matcher' },
    { name: 'AI Interview Practice', path: '/interview' },
    { name: 'PrimeAI Coach', path: '/coach' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-glowBlue transition-transform duration-300 group-hover:scale-110">
              <FiCpu className="text-white text-xl animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider font-orbitron bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                PRIME AI
              </span>
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold leading-none">
                Career Coach
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-white transition-all mr-1"
              title={theme === 'dark' ? "Activate Light Mode" : "Activate Dark Mode"}
            >
              {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-indigo-400" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-sm font-medium text-gray-200 transition-all"
                >
                  <FiUser className="text-cyan-400" />
                  <span>{(user.name || '').split(' ')[0] || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white text-sm font-medium text-red-400 transition-all duration-300"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/profile"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass-nav absolute left-0 right-0 py-4 px-6 border-b border-white/10 shadow-2xl"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium py-1.5 block ${
                    isActive ? 'text-cyan-400 font-semibold' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-white/10 pt-3 flex flex-col space-y-3">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 text-sm text-gray-300 py-1.5 focus:outline-none"
              >
                {theme === 'dark' ? (
                  <>
                    <FiSun className="text-yellow-400 text-lg" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FiMoon className="text-indigo-400 text-lg" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {user ? (
                <div className="flex items-center justify-between w-full pt-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-gray-300"
                  >
                    <FiUser className="text-cyan-400" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-red-400 text-sm flex items-center space-x-1"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-sm font-bold text-white block pt-1"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
