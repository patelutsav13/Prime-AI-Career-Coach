import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertTriangle, FiPlus, FiTrash, FiCpu, FiAward, FiSettings, FiActivity, FiUser } from 'react-icons/fi';
import { analyzeResume, signUpUser, loginUser, uploadResumePDF, fetchUser } from '../utils/api';
import { ResumeScannerCanvas } from '../components/ThreeCanvas';

export default function ResumeAnalyzer() {
  const [sessionUser, setSessionUser] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'manual'
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Quick Sign In
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup'); // 'signup' or 'login'

  // Form Fields
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [projects, setProjects] = useState([
    { title: '', description: '' }
  ]);

  // Results State
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const stored = localStorage.getItem('primeai_session_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const latestUserData = await fetchUser(parsed.email);
          setSessionUser(latestUserData);
          setName(latestUserData.name || '');
        } catch (e) {
          console.error("Session fetch error:", e);
        }
      }
    };
    fetchSession();
  }, []);

  const handleQuickSignIn = async (e) => {
    e.preventDefault();
    if (!quickEmail || !quickPassword) {
      alert('Email and Password are required.');
      return;
    }
    try {
      let userData;
      if (quickAuthMode === 'signup') {
        if (!quickName) {
          alert('Please enter your name.');
          return;
        }
        userData = await signUpUser(quickEmail, quickName, quickPassword);
      } else {
        userData = await loginUser(quickEmail, quickPassword);
      }
      setSessionUser(userData);
      setName(userData.name || '');
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setFileError('Please upload a valid Resume PDF.');
      setFile(null);
      alert('Please upload a proper resume file (PDF format).');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  // Add/remove project manual rows
  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '' }]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleProjectChange = (index, field, val) => {
    const updated = projects.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: val };
      }
      return p;
    });
    setProjects(updated);
  };

  // Trigger Scanner and API Data Parsing
  const triggerScan = () => {
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    uploadResumePDF(file)
      .then((data) => {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          setSkills(data.skills);
          setProjects(data.projects);
          setEducation(data.education);
          setExperience(data.experience);
          setGithub(data.github || 'https://github.com/developer');
          setLinkedin(data.linkedin || 'https://linkedin.com/in/developer');
          setPortfolio(data.portfolio || 'https://myportfolio.dev');
          
          // Toggle form fields visible
          setMode('manual');
        }, 500);
      })
      .catch((err) => {
        clearInterval(interval);
        setIsScanning(false);
        setFile(null);
        const msg = err.response?.data?.error || err.message || 'Failed to parse resume PDF.';
        alert(msg);
      });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sessionUser) {
      alert('Please sign in or initialize a profile in the Navbar/Profile first.');
      return;
    }

    const parsedSkillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payloadProjects = projects.filter((p) => p.title.trim().length > 0);

    try {
      const res = await analyzeResume(
        sessionUser.email,
        file ? file.name : 'Manual Entry',
        parsedSkillsArray,
        payloadProjects,
        experience,
        education
      );
      setAnalysisResult(res.analysis);
      
      // Update local storage session
      if (res.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        // Dispatch storage event for navbar
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
      alert('Error during resume analysis.');
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div className="text-center mb-12">
        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
          Resume Optimization
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase tracking-wide mt-2">
          Resume AI Analyzer
        </h1>
        <p className="mt-2 text-gray-400 font-light text-sm sm:text-base max-w-2xl mx-auto">
          Upload your resume PDF to scan for parsing checks, or input details manually to audit ATS score metrics.
        </p>
      </div>

      {/* 3D Scan Loader Popup */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030014]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 max-w-md w-full text-center space-y-6">
              <div className="w-full h-[220px]">
                <ResumeScannerCanvas />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-cyan-400 animate-pulse uppercase tracking-wider">
                Scanning Document...
              </h3>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Extracting skills structure, headers, and social indices...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!sessionUser ? (
        <div className="max-w-md mx-auto mt-6">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl text-center space-y-6">
            <FiUser className="text-5xl text-cyan-400 mx-auto animate-pulse" />
            <h2 className="text-xl font-bold font-orbitron text-white uppercase tracking-wide">
              {quickAuthMode === 'signup' ? 'Create Profile' : 'Sign In'}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              {quickAuthMode === 'signup'
                ? 'Create a profile to analyze your resume and save your ATS audit history.'
                : 'Access your saved resume score history and dashboard metrics.'}
            </p>

            {/* Tabs */}
            <div className="glass-panel p-1 rounded-xl border border-white/5 flex">
              <button
                type="button"
                onClick={() => setQuickAuthMode('signup')}
                className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${
                  quickAuthMode === 'signup' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                SIGN UP
              </button>
              <button
                type="button"
                onClick={() => setQuickAuthMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${
                  quickAuthMode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                SIGN IN
              </button>
            </div>

            <form onSubmit={handleQuickSignIn} className="space-y-4 text-left font-sans">
              {quickAuthMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    required
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  required
                  placeholder="e.g. alex@university.edu"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={quickPassword}
                  onChange={(e) => setQuickPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider"
              >
                {quickAuthMode === 'signup' ? 'Create Profile & Sign Up' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: UPLOAD / FORM INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mode Selector */}
          <div className="glass-panel p-1.5 rounded-xl border border-white/5 flex">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 text-xs font-bold font-orbitron rounded-lg transition-all ${
                mode === 'upload' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              PDF UPLOAD
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-xs font-bold font-orbitron rounded-lg transition-all ${
                mode === 'manual' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              MANUAL ENTRY
            </button>
          </div>

          {/* Form Block */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            
            {mode === 'upload' ? (
              <div className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 relative cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FiUploadCloud className="text-4xl text-cyan-400 mx-auto animate-bounce mb-4" />
                  <p className="text-sm font-semibold text-white">Drag & drop your Resume PDF</p>
                  <p className="text-xs text-gray-500 mt-2">Only PDF formats supported</p>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FiFile className="text-2xl text-purple-400 flex-shrink-0" />
                      <span className="text-xs text-gray-200 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={triggerScan}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black font-orbitron transition-all"
                    >
                      SCAN PDF
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs">
                    <FiAlertTriangle className="text-base flex-shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAnalyze} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter name"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Skills (Comma Separated)</label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    placeholder="e.g. React, Node.js, Git, HTML, CSS"
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Education Credentials</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. BS in Computer Science, State College 2025"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Professional Experience</label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. Intern Developer at SaaS Labs (6 months), freelance projects..."
                    rows="2"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Projects Array */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Technical Projects</label>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1 font-orbitron"
                    >
                      <FiPlus /> <span>ADD</span>
                    </button>
                  </div>

                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Project #{idx + 1}</span>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            <FiTrash />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                        placeholder="Project Title"
                        required
                        className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        placeholder="Description (Short technology breakdown)"
                        required
                        className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">GitHub Portfolio</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider"
                >
                  Analyze Resume
                </button>

              </form>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: AI AUDIT RESULTS */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {analysisResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                
                {/* 1. Score Summary Card */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/20">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-orbitron flex items-center space-x-1">
                    <FiCpu className="animate-pulse" />
                    <span>AI SCORING METRICS</span>
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                    
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-gray-400 block mb-1">Resume Score</span>
                      <span className="text-4xl font-extrabold font-orbitron bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                        {analysisResult.resumeScore}%
                      </span>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3 max-w-[100px] mx-auto">
                        <div className="h-full bg-cyan-400" style={{ width: `${analysisResult.resumeScore}%` }} />
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-gray-400 block mb-1">ATS Score</span>
                      <span className="text-4xl font-extrabold font-orbitron bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {analysisResult.atsScore}%
                      </span>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3 max-w-[100px] mx-auto">
                        <div className="h-full bg-purple-500" style={{ width: `${analysisResult.atsScore}%` }} />
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-gray-400 block mb-1">Career Readiness</span>
                      <span className="text-4xl font-extrabold font-orbitron bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {analysisResult.readinessScore}%
                      </span>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3 max-w-[100px] mx-auto">
                        <div className="h-full bg-emerald-400" style={{ width: `${analysisResult.readinessScore}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold font-orbitron text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <FiCheckCircle /> <span>Strengths</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-300 leading-relaxed font-light list-disc list-inside">
                      {analysisResult.strengths.map((str, idx) => (
                        <li key={idx} className="hover:text-white transition">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold font-orbitron text-pink-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <FiAlertTriangle /> <span>Weaknesses</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-300 leading-relaxed font-light list-disc list-inside">
                      {analysisResult.weaknesses.map((weak, idx) => (
                        <li key={idx} className="hover:text-white transition">{weak}</li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* 3. Suggestions & Missing Skills */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold font-orbitron text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5 mb-4">
                      <FiSettings /> <span>Improvement Suggestions</span>
                    </h3>
                    <ul className="space-y-3 text-xs text-gray-300 leading-relaxed font-light">
                      {analysisResult.improvementSuggestions.map((sug, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-purple-400">•</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.missingSkills.length > 0 && (
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Detected Missing Core Tech</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold font-orbitron"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Certifications & Supplemental Tech */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold font-orbitron text-purple-400 uppercase tracking-widest flex items-center space-x-1.5 mb-4">
                      <FiAward /> <span>Recommended Credentials</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisResult.recommendedCertifications.map((cert, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-200 hover:border-cyan-500/20 transition-all duration-300">
                          {cert}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended Technologies to Add</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.recommendedTechnologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 text-xs font-semibold font-orbitron"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] glass-panel rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center p-8">
                <FiActivity className="text-5xl text-gray-600 animate-pulse mb-4" />
                <h3 className="text-lg font-bold font-orbitron text-gray-400 uppercase tracking-wider">Awaiting Analysis</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm">
                  Fill in your details or run a PDF scan to activate the rule engine evaluation.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

    </div>
  );
}
