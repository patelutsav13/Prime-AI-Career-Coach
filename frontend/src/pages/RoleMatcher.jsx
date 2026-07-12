import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiCheck, FiInfo, FiChevronRight, FiYoutube, FiFileText, FiAward, FiCompass, FiUser } from 'react-icons/fi';
import { matchCareerRole, signUpUser, loginUser } from '../utils/api';
import { SkillNetworkCanvas } from '../components/ThreeCanvas';

export default function RoleMatcher() {
  const [sessionUser, setSessionUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  
  // Grid Skill Options
  const skillOptions = [
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'JavaScript', 'TypeScript',
    'React', 'Redux', 'Next.js', 'Node.js', 'Express.js', 'MongoDB',
    'MySQL', 'PostgreSQL', 'REST API', 'Git', 'GitHub', 'Python', 'Java',
    'C++', 'Pandas', 'NumPy', 'Scikit Learn', 'TensorFlow', 'PyTorch',
    'Power BI', 'Excel', 'SQL', 'Docker', 'AWS', 'Firebase', 'JWT', 'Authentication', 'Django'
  ];

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Quick Sign In
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup'); // 'signup' or 'login'

  // Sync session & auto-prefill skills if user analyzed resume previously
  useEffect(() => {
    const stored = localStorage.getItem('primeai_session_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionUser(parsed);
        
        // Auto prefill skills from latest resume analysis if available
        if (parsed.resumeAnalysisHistory && parsed.resumeAnalysisHistory.length > 0) {
          const latest = parsed.resumeAnalysisHistory[parsed.resumeAnalysisHistory.length - 1];
          const prefill = [];
          if (latest.skills) {
            latest.skills.forEach(skill => {
              const match = skillOptions.find(o => o.toLowerCase() === skill.toLowerCase());
              if (match && !prefill.includes(match)) {
                prefill.push(match);
              }
            });
          }
          setSelectedSkills(prefill);
        }
      } catch (e) {
        console.error(e);
      }
    }
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
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSelectAll = () => {
    setSelectedSkills([...skillOptions]);
  };

  const handleClearAll = () => {
    setSelectedSkills([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionUser) {
      alert('Please initialize a profile or log in first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await matchCareerRole(sessionUser.email, selectedRole, selectedSkills);
      // Backend returns { data: matchResults } while fallback returns { matchResults }
      const result = res.matchResults || res.data;
      setMatchResult(result);
      
      // Update session user to contain the new role mapping
      if (res.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
      alert('Error analyzing career eligibility.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rolesList = [
    'Frontend Developer', 'Backend Developer', 'React Developer', 'Node Developer',
    'Full Stack Developer', 'Python Developer', 'Data Analyst', 'Machine Learning Engineer',
    'AI Engineer', 'Software Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Cyber Security'
  ];

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Heading */}
      <div className="text-center mb-12">
        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-orbitron">
          Career Placement
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase tracking-wide mt-2">
          Career Role Matcher
        </h1>
        <p className="mt-2 text-gray-400 font-light text-sm sm:text-base max-w-2xl mx-auto">
          Match your qualifications against target employment roles. Identify skill gaps and generate automated learning roadmaps.
        </p>
      </div>

      {!sessionUser ? (
        <div className="max-w-md mx-auto mt-6">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl text-center space-y-6">
            <FiUser className="text-5xl text-cyan-400 mx-auto animate-pulse" />
            <h2 className="text-xl font-bold font-orbitron text-white uppercase tracking-wide">
              {quickAuthMode === 'signup' ? 'Create Profile' : 'Sign In'}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              {quickAuthMode === 'signup'
                ? 'Create a profile to match your skills and generate your custom week-by-week learning roadmap.'
                : 'Access your saved career eligibility mappings and dashboard.'}
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
        
        {/* LEFT COLUMN: DROPDOWNS & CHECKBOXES */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Job Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 font-orbitron">
                  Select Target Job Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-base font-bold font-orbitron tracking-wide text-cyan-400 hover:border-cyan-500/30 focus:outline-none focus:border-cyan-500 focus:shadow-glowBlue transition-all"
                >
                  {rolesList.map((r, idx) => (
                    <option key={idx} value={r} className="bg-darkBg text-white">{r}</option>
                  ))}
                </select>
              </div>

              {/* Skills Checkboxes Header */}
              <div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-purple-400 font-orbitron">
                    Toggle Your Skills
                  </label>
                  <div className="flex space-x-2 text-[10px] font-bold tracking-wider font-orbitron">
                    <button type="button" onClick={handleSelectAll} className="text-cyan-400 hover:text-cyan-300">ALL</button>
                    <span className="text-gray-600">|</span>
                    <button type="button" onClick={handleClearAll} className="text-red-400 hover:text-red-300">RESET</button>
                  </div>
                </div>

                {/* Skill Options Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {skillOptions.map((skill, idx) => {
                    const checked = selectedSkills.includes(skill);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`flex items-center space-x-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                          checked
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-semibold'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/15'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          checked ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-gray-600'
                        }`}>
                          {checked && <FiCheck />}
                        </div>
                        <span className="truncate">{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'Comparing Skills...' : 'Analyze Eligibility'}
              </button>

            </form>

          </div>
        </div>

        {/* RIGHT COLUMN: AI REPORT & ROADMAP */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {matchResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                
                {/* Score Summary & Status */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-tr from-purple-950/20 via-transparent to-cyan-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-orbitron block">
                        Match Eligibility
                      </span>
                      <h3 className="text-4xl font-extrabold font-orbitron mt-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {matchResult.eligibilityScore}% Match
                      </h3>
                      <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden mt-3 min-w-[200px]">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${matchResult.eligibilityScore}%` }} />
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-orbitron block">
                        Readiness Assessment
                      </span>
                      <span className={`inline-block px-4 py-2 mt-2 rounded-xl text-xs font-black uppercase tracking-wider font-orbitron ${
                        matchResult.readinessStatus === 'Interview Ready'
                          ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 shadow-glowBlue'
                          : matchResult.readinessStatus === 'Almost Ready'
                          ? 'bg-yellow-950/30 border border-yellow-500/30 text-yellow-400'
                          : 'bg-red-950/30 border border-red-500/30 text-red-400'
                      }`}>
                        {matchResult.readinessStatus}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Summary (Rule 81-85) */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 flex items-start space-x-2 text-xs text-gray-300 leading-relaxed font-light">
                    <FiInfo className="text-cyan-400 text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      {matchResult.readinessStatus === 'Interview Ready' ? (
                        <span><strong>Congratulations!</strong> You possess the core technical requirements for this role. Start practicing mock interviews in our dedicated mock simulator to prepare for the viva.</span>
                      ) : matchResult.readinessStatus === 'Almost Ready' ? (
                        <span><strong>Almost Ready!</strong> You have a working foundation but need to cover critical skill gap categories like {matchResult.missingSkills.join(', ')} to qualify for hiring targets.</span>
                      ) : (
                        <span><strong>Not Ready yet.</strong> You have significant missing technologies required for this domain. We recommend following our week-by-week learning roadmap below to acquire fundamental knowledge.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-orbitron">Matched Skills</h4>
                    {matchResult.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matchedSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-orbitron">{sk}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500">No matched technologies.</p>
                    )}
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest font-orbitron">Missing Skills</h4>
                    {matchResult.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missingSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded bg-red-950/30 border border-red-500/20 text-red-400 text-[10px] font-bold font-orbitron">{sk}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500">No missing technologies.</p>
                    )}
                  </div>

                </div>

                {/* Career Roadmap */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
                    <FiCompass className="text-purple-400 text-xl" />
                    <h3 className="text-sm font-bold font-orbitron text-purple-400 uppercase tracking-widest">
                      Customized Learning Roadmap
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {matchResult.roadmap.map((week, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-orbitron">
                            {week.week}
                          </span>
                          <h4 className="text-white font-bold text-sm tracking-wide font-orbitron flex-1 ml-3 text-left">
                            {week.topic}
                          </h4>
                        </div>
                        <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 font-light leading-relaxed pl-1">
                          {week.subtopics.map((sub, sIdx) => (
                            <li key={sIdx}>{sub}</li>
                          ))}
                        </ul>

                        {/* Search Tutorial Links */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                          {week.tutorials && week.tutorials.map((tut, tIdx) => (
                            <a
                              key={tIdx}
                              href={tut.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-white/5 border border-white/10 hover:border-cyan-500/30 text-[10px] font-medium text-gray-300 hover:text-white transition-all"
                            >
                              {tut.type === 'youtube' ? (
                                <FiYoutube className="text-red-500 text-xs" />
                              ) : (
                                <FiFileText className="text-cyan-400 text-xs" />
                              )}
                              <span>{tut.title}</span>
                            </a>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] glass-panel rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <SkillNetworkCanvas />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <FiAward className="text-5xl text-gray-600 animate-pulse mb-4" />
                  <h3 className="text-lg font-bold font-orbitron text-gray-400 uppercase tracking-wider">Awaiting Simulation</h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-sm">
                    Select your targeted developer category and trigger the evaluation calculations.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

    </div>
  );
}
