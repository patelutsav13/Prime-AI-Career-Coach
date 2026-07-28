import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiCpu, FiSun, FiMoon } from 'react-icons/fi';
import Logo3D from './Logo3D';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState('dark');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrolled, setScrolled] = useState(false);

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

  // Scroll State Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Resume Analyzer', path: '/resume' },
    { name: 'Role Matcher', path: '/role-matcher' },
    { name: 'AI Interview', path: '/interview' },
    { name: 'AI Coach', path: '/coach' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 glass-nav transition-all duration-300 ${
        scrolled 
          ? 'py-0.5 shadow-glowBlue/5 backdrop-blur-xl bg-opacity-80' 
          : 'py-2 sm:py-3 bg-opacity-70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
          }`}
        >
          
          {/* Logo Section */}
          <Link to="/">
            <Logo3D size="medium" />
          </Link>

          {/* Desktop Navigation Links */}
          <div 
            className="hidden lg:flex items-center space-x-1 xl:space-x-3"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium tracking-wide transition-colors duration-300 z-10 ${
                    isActive ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="relative z-20">{link.name}</span>
                  
                  {/* Sliding Hover Background Pill */}
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId="navHoverBg"
                      className="absolute inset-0 rounded-lg bg-white/5 border border-white/10 -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}

                  {/* Active Page Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-white transition-all mr-1 duration-300 hover:scale-105 active:scale-95 group"
              title={theme === 'dark' ? "Activate Light Mode" : "Activate Dark Mode"}
            >
              {theme === 'dark' ? (
                <FiSun className="text-yellow-400 transition-transform duration-500 group-hover:rotate-90" />
              ) : (
                <FiMoon className="text-indigo-400 transition-transform duration-500 group-hover:rotate-12" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-sm font-medium text-gray-200 transition-all duration-300 hover:scale-102 active:scale-98"
                >
                  <FiUser className="text-cyan-400" />
                  <span>{(user.name || '').split(' ')[0] || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white text-sm font-medium text-red-400 transition-all duration-300 hover:scale-102 active:scale-98"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/profile"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-cyan-500/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition duration-200"
            >
              {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden glass-nav absolute left-0 right-0 overflow-hidden border-b border-white/10 shadow-2xl"
          >
            <div className="py-4 px-6 flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium py-1.5 block transition-colors duration-200 ${
                      isActive ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-white'
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
                  className="flex items-center space-x-2 text-sm text-gray-300 py-1.5 focus:outline-none hover:text-white transition-colors duration-200"
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
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <FiUser className="text-cyan-400" />
                      <span>{user.name}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1 transition-colors"
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-sm font-bold text-white block pt-1 hover:brightness-110 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
