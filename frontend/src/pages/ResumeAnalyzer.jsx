import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiFile, FiCheckCircle, FiAlertTriangle, FiPlus, FiTrash,
  FiCpu, FiAward, FiSettings, FiActivity, FiUser, FiCode, FiLayers, FiTool
} from 'react-icons/fi';
import {
  FaReact, FaNodeJs, FaPython, FaGit, FaGithub, FaDocker, FaAws, FaDatabase,
  FaAngular, FaVuejs, FaBootstrap, FaSass, FaLinux, FaJava, FaFigma,
  FaHtml5, FaCss3Alt, FaJs
} from 'react-icons/fa';
import {
  SiTypescript, SiMongodb, SiPostgresql, SiMysql, SiRedux, SiTailwindcss,
  SiGraphql, SiFirebase, SiNextdotjs, SiExpress, SiFlask, SiDjango,
  SiKubernetes, SiNginx, SiRedis, SiPostman, SiVisualstudiocode,
  SiFastapi, SiNumpy, SiPandas, SiScikitlearn, SiTensorflow, SiPytorch,
  SiWebpack, SiVite, SiJunit5
} from 'react-icons/si';
import { analyzeResume, signUpUser, loginUser, uploadResumePDF, fetchUser } from '../utils/api';
import { ResumeScannerCanvas } from '../components/ThreeCanvas';

// ─────────────────────────────────────────────────────────────────────
// SKILL CONFIG: Map skill names to icons + categories
// ─────────────────────────────────────────────────────────────────────
const SKILL_CONFIG = {
  // FRONTEND (green)
  'html':         { icon: <FaHtml5 />, cat: 'frontend' },
  'css':          { icon: <FaCss3Alt />, cat: 'frontend' },
  'javascript':   { icon: <FaJs />, cat: 'frontend' },
  'typescript':   { icon: <SiTypescript />, cat: 'frontend' },
  'react':        { icon: <FaReact />, cat: 'frontend' },
  'redux':        { icon: <SiRedux />, cat: 'frontend' },
  'next.js':      { icon: <SiNextdotjs />, cat: 'frontend' },
  'vue.js':       { icon: <FaVuejs />, cat: 'frontend' },
  'angular':      { icon: <FaAngular />, cat: 'frontend' },
  'tailwind css': { icon: <SiTailwindcss />, cat: 'frontend' },
  'tailwind':     { icon: <SiTailwindcss />, cat: 'frontend' },
  'bootstrap':    { icon: <FaBootstrap />, cat: 'frontend' },
  'sass':         { icon: <FaSass />, cat: 'frontend' },
  'scss':         { icon: <FaSass />, cat: 'frontend' },
  'figma':        { icon: <FaFigma />, cat: 'frontend' },
  // BACKEND (blue)
  'node.js':      { icon: <FaNodeJs />, cat: 'backend' },
  'express.js':   { icon: <SiExpress />, cat: 'backend' },
  'express':      { icon: <SiExpress />, cat: 'backend' },
  'python':       { icon: <FaPython />, cat: 'backend' },
  'django':       { icon: <SiDjango />, cat: 'backend' },
  'flask':        { icon: <SiFlask />, cat: 'backend' },
  'fastapi':      { icon: <SiFastapi />, cat: 'backend' },
  'java':         { icon: <FaJava />, cat: 'backend' },
  'spring boot':  { icon: <FaJava />, cat: 'backend' },
  'mongodb':      { icon: <SiMongodb />, cat: 'backend' },
  'postgresql':   { icon: <SiPostgresql />, cat: 'backend' },
  'mysql':        { icon: <SiMysql />, cat: 'backend' },
  'sql':          { icon: <FaDatabase />, cat: 'backend' },
  'rest api':     { icon: <FiCode />, cat: 'backend' },
  'graphql':      { icon: <SiGraphql />, cat: 'backend' },
  'redis':        { icon: <SiRedis />, cat: 'backend' },
  'nginx':        { icon: <SiNginx />, cat: 'backend' },
  // TOOLS / OTHER (purple)
  'git':          { icon: <FaGit />, cat: 'tools' },
  'github':       { icon: <FaGithub />, cat: 'tools' },
  'docker':       { icon: <FaDocker />, cat: 'tools' },
  'kubernetes':   { icon: <SiKubernetes />, cat: 'tools' },
  'aws':          { icon: <FaAws />, cat: 'tools' },
  'firebase':     { icon: <SiFirebase />, cat: 'tools' },
  'linux':        { icon: <FaLinux />, cat: 'tools' },
  'postman':      { icon: <SiPostman />, cat: 'tools' },
  'vs code':      { icon: <SiVisualstudiocode />, cat: 'tools' },
  'vite':         { icon: <SiVite />, cat: 'tools' },
  'webpack':      { icon: <SiWebpack />, cat: 'tools' },
  'numpy':        { icon: <SiNumpy />, cat: 'tools' },
  'pandas':       { icon: <SiPandas />, cat: 'tools' },
  'scikit-learn': { icon: <SiScikitlearn />, cat: 'tools' },
  'tensorflow':   { icon: <SiTensorflow />, cat: 'tools' },
  'pytorch':      { icon: <SiPytorch />, cat: 'tools' },
  'jwt':          { icon: <FiLayers />, cat: 'tools' },
  'oauth':        { icon: <FiTool />, cat: 'tools' },
  'ci/cd':        { icon: <FiTool />, cat: 'tools' },
};

const getCatStyle = (cat) => {
  if (cat === 'frontend') return {
    wrapper: 'skill-badge-frontend',
    dot: 'bg-green-400'
  };
  if (cat === 'backend') return {
    wrapper: 'skill-badge-backend',
    dot: 'bg-blue-400'
  };
  return {
    wrapper: 'skill-badge-tools',
    dot: 'bg-purple-400'
  };
};

const SkillBadge = ({ name }) => {
  const key = name.toLowerCase().trim();
  const config = SKILL_CONFIG[key] || { icon: <FiCode />, cat: 'tools' };
  const style = getCatStyle(config.cat);
  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -2 }}
      className={`skill-badge ${style.wrapper}`}
    >
      <span className="skill-badge-icon">{config.icon}</span>
      <span className="skill-badge-name">{name}</span>
    </motion.div>
  );
};

const MissingSkillBadge = ({ name }) => {
  const key = name.toLowerCase().trim();
  const config = SKILL_CONFIG[key] || { icon: <FiAlertTriangle />, cat: 'missing' };
  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -2 }}
      className="skill-badge skill-badge-missing"
    >
      <span className="skill-badge-icon">{config.icon}</span>
      <span className="skill-badge-name">{name}</span>
    </motion.div>
  );
};

export default function ResumeAnalyzer() {
  const [sessionUser, setSessionUser] = useState(null);
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup');

  // Form Fields
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [certificates, setCertificates] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [projects, setProjects] = useState([{ title: '', description: '' }]);

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
    if (!quickEmail || !quickPassword) { alert('Email and Password are required.'); return; }
    try {
      let userData;
      if (quickAuthMode === 'signup') {
        if (!quickName) { alert('Please enter your name.'); return; }
        userData = await signUpUser(quickEmail, quickName, quickPassword);
      } else {
        userData = await loginUser(quickEmail, quickPassword);
      }
      setSessionUser(userData);
      setName(userData.name || '');
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };

  const handleFileChange = (e) => { validateAndSetFile(e.target.files[0]); };
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
  const handleDrop = (e) => { e.preventDefault(); validateAndSetFile(e.dataTransfer.files[0]); };

  const handleAddProject = () => setProjects([...projects, { title: '', description: '' }]);
  const handleRemoveProject = (index) => setProjects(projects.filter((_, idx) => idx !== index));
  const handleProjectChange = (index, field, val) => {
    setProjects(projects.map((p, idx) => idx === index ? { ...p, [field]: val } : p));
  };

  const triggerScan = () => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => prev >= 90 ? 90 : prev + 10);
    }, 150);

    uploadResumePDF(file)
      .then((data) => {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          setSkills(data.skills || '');
          setProjects(data.projects && data.projects.length > 0 ? data.projects : [{ title: '', description: '' }]);
          setEducation(data.education || '');
          setExperience(data.experience || '');
          setCertificates(data.certificates || '');
          setGithub(data.github || '');
          setLinkedin(data.linkedin || '');
          setPortfolio(data.portfolio || '');
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
    if (!sessionUser) { alert('Please sign in or initialize a profile first.'); return; }
    const parsedSkillsArray = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
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
      if (res.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
      alert('Error during resume analysis.');
    }
  };

  // Categorise skills for the legend
  const skillsArray = analysisResult?.skills || [];
  const frontendSkills = skillsArray.filter(s => (SKILL_CONFIG[s.toLowerCase().trim()]?.cat) === 'frontend');
  const backendSkills  = skillsArray.filter(s => (SKILL_CONFIG[s.toLowerCase().trim()]?.cat) === 'backend');
  const toolSkills     = skillsArray.filter(s => !['frontend','backend'].includes(SKILL_CONFIG[s.toLowerCase().trim()]?.cat));

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
          Upload your resume PDF to auto-extract your data, or fill in manually to generate an ATS score.
        </p>
      </div>

      {/* 3D Scan Loader */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030014]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 max-w-md w-full text-center space-y-6">
              <div className="w-full h-[220px]"><ResumeScannerCanvas /></div>
              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-cyan-400 animate-pulse uppercase tracking-wider">
                Scanning Document...
              </h3>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Extracting skills, projects, certifications and social links...</p>
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
            <div className="glass-panel p-1 rounded-xl border border-white/5 flex">
              <button type="button" onClick={() => setQuickAuthMode('signup')}
                className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${quickAuthMode === 'signup' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                SIGN UP
              </button>
              <button type="button" onClick={() => setQuickAuthMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${quickAuthMode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                SIGN IN
              </button>
            </div>
            <form onSubmit={handleQuickSignIn} className="space-y-4 text-left font-sans">
              {quickAuthMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Your Name</label>
                  <input type="text" value={quickName} onChange={(e) => setQuickName(e.target.value)} required placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input type="email" value={quickEmail} onChange={(e) => setQuickEmail(e.target.value)} required placeholder="e.g. alex@university.edu"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                <input type="password" value={quickPassword} onChange={(e) => setQuickPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <button type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider">
                {quickAuthMode === 'signup' ? 'Create Profile & Sign Up' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INPUT */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-1.5 rounded-xl border border-white/5 flex">
              <button onClick={() => setMode('upload')}
                className={`flex-1 py-2 text-xs font-bold font-orbitron rounded-lg transition-all ${mode === 'upload' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                PDF UPLOAD
              </button>
              <button onClick={() => setMode('manual')}
                className={`flex-1 py-2 text-xs font-bold font-orbitron rounded-lg transition-all ${mode === 'manual' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                MANUAL ENTRY
              </button>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
              {mode === 'upload' ? (
                <div className="space-y-6">
                  <div onDragOver={handleDragOver} onDrop={handleDrop}
                    className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 relative cursor-pointer">
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
                      <button onClick={triggerScan}
                        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black font-orbitron transition-all">
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
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter name"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Skills (Comma Separated)</label>
                    <textarea value={skills} onChange={(e) => setSkills(e.target.value)} required
                      placeholder="e.g. React, Node.js, Git, HTML, CSS" rows="3"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Education</label>
                    <input type="text" value={education} onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.Tech in Computer Science, ABC University 2025"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Experience</label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. Frontend Intern at TechCorp (6 months), Freelance projects..." rows="2"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Certificates / Achievements</label>
                    <textarea value={certificates} onChange={(e) => setCertificates(e.target.value)}
                      placeholder="e.g. AWS Certified Developer, Google UX Design Certificate..." rows="2"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500" />
                  </div>

                  {/* Projects */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Technical Projects</label>
                      <button type="button" onClick={handleAddProject}
                        className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1 font-orbitron">
                        <FiPlus /> <span>ADD</span>
                      </button>
                    </div>
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Project #{idx + 1}</span>
                          {projects.length > 1 && (
                            <button type="button" onClick={() => handleRemoveProject(idx)} className="text-red-400 hover:text-red-300 text-xs">
                              <FiTrash />
                            </button>
                          )}
                        </div>
                        <input type="text" value={proj.title} onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                          placeholder="Project Title" required
                          className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
                        <input type="text" value={proj.description} onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                          placeholder="Description (short tech breakdown)"
                          className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
                      </div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">GitHub</label>
                      <input type="url" value={github} onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">LinkedIn</label>
                      <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider">
                    Analyze Resume
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {analysisResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                  className="space-y-6"
                >

                  {/* AI SUMMARY HEADER */}
                  <div className="glass-panel px-5 py-3 rounded-2xl border border-white/10 flex items-center space-x-2">
                    <FiCpu className="text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-orbitron">AI Resume Summary</span>
                  </div>

                  {/* SCORE CARD */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

                  {/* SKILLS SECTION */}
                  {skillsArray.length > 0 && (
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-widest flex items-center space-x-2">
                            <FiCode className="text-cyan-400" /> <span>Skills</span>
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">Extracted from your resume</p>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span><span className="text-gray-400">Frontend</span></span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span><span className="text-gray-400">Backend</span></span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span><span className="text-gray-400">Tools / Other</span></span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {skillsArray.map((skill, idx) => <SkillBadge key={idx} name={skill} />)}
                      </div>
                    </div>
                  )}

                  {/* PROJECTS SECTION */}
                  {analysisResult.projects && analysisResult.projects.length > 0 && (
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-widest flex items-center space-x-2">
                          <FiLayers className="text-purple-400" /> <span>Projects</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Extracted from your resume</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysisResult.projects.map((proj, idx) => {
                          const colors = [
                            { bg: 'bg-green-500', border: 'border-green-500/30', glow: 'shadow-green-500/10' },
                            { bg: 'bg-blue-500', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
                            { bg: 'bg-purple-500', border: 'border-purple-500/30', glow: 'shadow-purple-500/10' },
                            { bg: 'bg-orange-500', border: 'border-orange-500/30', glow: 'shadow-orange-500/10' },
                            { bg: 'bg-pink-500', border: 'border-pink-500/30', glow: 'shadow-pink-500/10' },
                          ];
                          const c = colors[idx % colors.length];
                          const initials = proj.title.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
                          return (
                            <motion.div key={idx} whileHover={{ y: -3 }}
                              className={`p-4 rounded-2xl bg-white/5 border ${c.border} shadow-lg ${c.glow} space-y-2`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white leading-tight">{proj.title}</p>
                                  {proj.description && (
                                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{proj.description}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MISSING SKILLS */}
                  {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold font-orbitron text-red-400 uppercase tracking-widest flex items-center space-x-2">
                          <FiAlertTriangle className="animate-pulse" /> <span>Missing Skills</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Skills you could improve on</p>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {analysisResult.missingSkills.map((sk, idx) => <MissingSkillBadge key={idx} name={sk} />)}
                      </div>
                    </div>
                  )}

                  {/* STRENGTHS & WEAKNESSES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold font-orbitron text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <FiCheckCircle /> <span>Strengths</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-gray-300 leading-relaxed font-light list-disc list-inside">
                        {analysisResult.strengths.map((str, idx) => <li key={idx} className="hover:text-white transition">{str}</li>)}
                      </ul>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold font-orbitron text-pink-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <FiAlertTriangle /> <span>Weaknesses</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-gray-300 leading-relaxed font-light list-disc list-inside">
                        {analysisResult.weaknesses.map((weak, idx) => <li key={idx} className="hover:text-white transition">{weak}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* SUGGESTIONS */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                    <h3 className="text-sm font-bold font-orbitron text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5 mb-4">
                      <FiSettings /> <span>Improvement Suggestions</span>
                    </h3>
                    <ul className="space-y-3 text-xs text-gray-300 leading-relaxed font-light">
                      {analysisResult.improvementSuggestions.map((sug, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-purple-400">•</span><span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RECOMMENDED CERTIFICATIONS */}
                  {analysisResult.recommendedCertifications && analysisResult.recommendedCertifications.length > 0 && (
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
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
                      {analysisResult.recommendedTechnologies && analysisResult.recommendedTechnologies.length > 0 && (
                        <div className="border-t border-white/5 pt-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended Technologies to Add</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.recommendedTechnologies.map((tech, idx) => (
                              <span key={idx} className="px-3 py-1 rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 text-xs font-semibold font-orbitron">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] glass-panel rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center p-8">
                  <FiActivity className="text-5xl text-gray-600 animate-pulse mb-4" />
                  <h3 className="text-lg font-bold font-orbitron text-gray-400 uppercase tracking-wider">Awaiting Analysis</h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-sm">
                    Upload your PDF or fill in the form to activate the AI resume analyzer.
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
