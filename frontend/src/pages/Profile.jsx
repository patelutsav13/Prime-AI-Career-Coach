import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiTrash2, FiLogOut, FiCpu, FiAward, FiFileText, FiMessageSquare, FiLock } from 'react-icons/fi';
import { initUser, clearData, signUpUser, loginUser, fetchUser } from '../utils/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [localStats, setLocalStats] = useState(null);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'

  const navigate = useNavigate();

  const syncUserSession = async () => {
    const session = localStorage.getItem('primeai_session_user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const latestUserData = await fetchUser(parsed.email);
        setUser(latestUserData);
        
        // Calculate simple counts from session
        setLocalStats({
          resumeCount: latestUserData.resumeAnalysisHistory?.length || 0,
          roleCount: latestUserData.roleAnalysisHistory?.length || 0,
          interviewCount: latestUserData.interviewHistory?.length || 0,
          latestResumeScore: latestUserData.resumeAnalysisHistory?.[latestUserData.resumeAnalysisHistory.length - 1]?.resumeScore || 0
        });
      } catch (e) {
        console.error("Session fetch error:", e);
        setUser(null);
        setLocalStats(null);
      }
    } else {
      setUser(null);
      setLocalStats(null);
    }
  };

  useEffect(() => {
    syncUserSession();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      alert('Email and Password are required.');
      return;
    }

    try {
      let userData;
      if (authMode === 'signup') {
        if (!nameInput) {
          alert('Please enter your name to register.');
          return;
        }
        userData = await signUpUser(emailInput, nameInput, passwordInput);
        alert('Account registered successfully!');
      } else {
        userData = await loginUser(emailInput, passwordInput);
        alert('Welcome back, ' + (userData.name || 'Developer') + '!');
      }
      setUser(userData);
      syncUserSession();
      // Dispatch storage event to alert Navbar
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('primeai_session_user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleDeleteData = async () => {
    if (!user) return;
    const confirm = window.confirm('Are you absolutely sure you want to delete all resume, role, and interview analysis history? This action is permanent.');
    if (!confirm) return;

    try {
      await clearData(user.email);
      alert('Account histories wiped successfully.');
      
      // Re-fetch current user object which has empty history arrays now
      const clearedUser = {
        ...user,
        resumeAnalysisHistory: [],
        roleAnalysisHistory: [],
        interviewHistory: []
      };
      localStorage.setItem('primeai_session_user', JSON.stringify(clearedUser));
      
      // Update local storage db registry if simulator is active
      const localDb = JSON.parse(localStorage.getItem('primeai_users') || '{}');
      if (localDb[user.email]) {
        localDb[user.email] = clearedUser;
        localStorage.setItem('primeai_users', JSON.stringify(localDb));
      }

      syncUserSession();
    } catch (err) {
      console.error(err);
      alert('Error wiping account data.');
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-center">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div
              key="logged-in"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl space-y-8"
            >
              
              {/* Profile Header (Avatar and info) */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-glowPurple">
                  {((user && user.name) || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-orbitron">
                    Account Profile
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white leading-none">
                    {user.name}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-1">
                    <FiMail className="text-purple-400" />
                    <span>{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <FiFileText className="text-cyan-400 mx-auto text-xl mb-1.5" />
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">Latest Score</span>
                  <span className="text-xl font-bold font-orbitron text-white mt-1 block">
                    {localStats?.latestResumeScore || 0}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <FiCpu className="text-purple-400 mx-auto text-xl mb-1.5" />
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">Vivas Mocked</span>
                  <span className="text-xl font-bold font-orbitron text-white mt-1 block">
                    {localStats?.interviewCount || 0}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <FiAward className="text-emerald-400 mx-auto text-xl mb-1.5" />
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">Roles Matched</span>
                  <span className="text-xl font-bold font-orbitron text-white mt-1 block">
                    {localStats?.roleCount || 0}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <FiMessageSquare className="text-pink-400 mx-auto text-xl mb-1.5" />
                  <span className="text-[10px] text-gray-500 block font-bold uppercase">Resumes Checked</span>
                  <span className="text-xl font-bold font-orbitron text-white mt-1 block">
                    {localStats?.resumeCount || 0}
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDeleteData}
                  className="flex-1 py-3.5 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs font-orbitron uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5"
                >
                  <FiTrash2 />
                  <span>Delete Account Data</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs font-orbitron uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5"
                >
                  <FiLogOut />
                  <span>Logout Session</span>
                </button>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="logged-out"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-1">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
                  Welcome to PrimeAI
                </span>
                <h2 className="text-2xl font-bold font-orbitron text-white uppercase tracking-wide">
                  {authMode === 'signup' ? 'Create Profile' : 'Sign In'}
                </h2>
                <p className="text-xs text-gray-400 font-light">
                  {authMode === 'signup' 
                    ? 'Initialize your developer account to track history.' 
                    : 'Access your saved audits, viva history and roadmaps.'}
                </p>
              </div>

              {/* Mode Tabs */}
              <div className="glass-panel p-1 rounded-xl border border-white/5 flex">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${
                    authMode === 'signup' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SIGN UP
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${
                    authMode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SIGN IN
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3.5 text-gray-500 text-sm" />
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        required
                        placeholder="e.g. Alex Mercer"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-gray-500 text-sm" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      placeholder="e.g. alex@university.edu"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-gray-500 text-sm" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider"
                >
                  {authMode === 'signup' ? 'Create Profile & Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="text-xs text-cyan-400 hover:underline font-light"
                >
                  {authMode === 'signup' 
                    ? 'Already have a profile? Sign in instead.' 
                    : "New to PrimeAI? Create a profile first."}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
