import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiMessageSquare, FiTrendingUp, FiCheck, FiX, FiAward, FiArrowRight, FiRotateCcw, FiUser } from 'react-icons/fi';
import { getMCQs, submitInterview, signUpUser, loginUser } from '../utils/api';
import { RobotInterviewerCanvas } from '../components/ThreeCanvas';

export default function InterviewPractice() {
  const [sessionUser, setSessionUser] = useState(null);
  
  // Interview flow steps: 'setup' | 'intro' | 'intro-feedback' | 'mcq' | 'summary'
  const [step, setStep] = useState('setup');
  
  const [selectedRole, setSelectedRole] = useState('Frontend');
  const [introAnswer, setIntroAnswer] = useState('');
  const [introResult, setIntroResult] = useState(null);

  // MCQ variables
  const [mcqList, setMcqList] = useState([]);
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // index of selected option
  const [isOptionLocked, setIsOptionLocked] = useState(false);
  const [mcqScores, setMcqScores] = useState({ correct: 0, wrong: 0 });

  // Final summary state
  const [finalReport, setFinalReport] = useState(null);

  // Quick Sign In
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup'); // 'signup' or 'login'

  const rolesList = [
    'Frontend', 'Backend', 'Full Stack', 'Python', 'Data Analyst', 'Machine Learning', 'AI Engineer', 'Cloud Engineer'
  ];

  useEffect(() => {
    const stored = localStorage.getItem('primeai_session_user');
    if (stored) {
      try {
        setSessionUser(JSON.parse(stored));
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

  const handleStartInterview = async () => {
    if (!sessionUser) {
      alert('Please initialize a profile or log in first.');
      return;
    }
    // Fetch MCQs for the role ahead of time
    try {
      const list = await getMCQs(selectedRole);
      setMcqList(list || []);
    } catch (err) {
      console.error(err);
    }
    setStep('intro');
  };

  // Grade introductory question
  const handleSubmitIntro = async (e) => {
    e.preventDefault();
    if (introAnswer.trim().length < 15) {
      alert('Please provide a more detailed self-introduction (at least 15 characters).');
      return;
    }

    // Call local grader to present feedback immediately
    // In backend api we do this combined at the end. Here, we can evaluate intro locally first
    // We'll use the rule function imported in utils
    // Let's grade it locally first for step progression
    const { clientGradeSelfIntroductionAI } = await import('../utils/clientAiEngine');
    const result = clientGradeSelfIntroductionAI(introAnswer);
    setIntroResult(result);
    setStep('intro-feedback');
  };

  const handleStartMCQs = () => {
    setCurrentMcqIdx(0);
    setSelectedOption(null);
    setIsOptionLocked(false);
    setMcqScores({ correct: 0, wrong: 0 });
    setStep('mcq');
  };

  const handleSelectOption = (optIdx) => {
    if (isOptionLocked) return;
    setSelectedOption(optIdx);
    setIsOptionLocked(true);

    const question = mcqList[currentMcqIdx];
    if (optIdx === question.correct) {
      setMcqScores(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setMcqScores(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (currentMcqIdx < mcqList.length - 1) {
      setCurrentMcqIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsOptionLocked(false);
    } else {
      // Completed all MCQs, submit to database
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async () => {
    try {
      const res = await submitInterview(
        sessionUser.email,
        selectedRole + ' Developer',
        introAnswer,
        mcqScores.correct,
        mcqList.length
      );
      // Backend returns { data: sessionData } while fallback returns { interview }
      const report = res.interview || res.data;
      setFinalReport(report);
      
      // Update session user in local storage
      if (res.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
      }
      setStep('summary');
    } catch (err) {
      console.error(err);
      alert('Error saving interview scores.');
    }
  };

  const handleReset = () => {
    setIntroAnswer('');
    setIntroResult(null);
    setMcqList([]);
    setCurrentMcqIdx(0);
    setSelectedOption(null);
    setIsOptionLocked(false);
    setMcqScores({ correct: 0, wrong: 0 });
    setFinalReport(null);
    setStep('setup');
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
          Technical Readiness
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase tracking-wide mt-2">
          AI Interview Practice
        </h1>
        <p className="mt-2 text-gray-400 font-light text-sm sm:text-base max-w-2xl mx-auto">
          Simulate a developer technical viva interview. Answer basic introductory questions followed by 14 targeted technical MCQs.
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
                ? 'Create a profile to practice developer mock interviews and save evaluation scores.'
                : 'Access your saved mock interview results and feedback analysis.'}
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
        
        {/* LEFT COLUMN: INTERVIEW ACTIONS */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SETUP */}
            {step === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <FiCpu className="text-cyan-400 text-xl" />
                  <h3 className="text-lg font-bold font-orbitron text-white uppercase tracking-wider">
                    Configure Session
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Target Role Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {rolesList.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`p-3 rounded-lg border text-xs font-semibold font-orbitron transition-all ${
                            selectedRole === role
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed font-light space-y-2">
                    <p className="font-bold text-white font-orbitron">Session Outline:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Part 1: Self-Introduction (Grades structure, confidence, goals).</li>
                      <li>Part 2: 14 Technical MCQs specific to {selectedRole} technology stacks.</li>
                      <li>Persistence: Final score is stored in database to feed dashboard analytics.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider"
                  >
                    Start AI Mock Interview
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SELF INTRO */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-orbitron">
                    ROUND 1 OF 2
                  </span>
                  <span className="text-xs text-gray-500 font-orbitron">Self-Introduction</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-orbitron text-white leading-snug">
                    Question 1: Tell me about yourself.
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Introduce your educational credentials, developer projects, technical stacks, and career objectives clearly.
                  </p>
                  
                  <form onSubmit={handleSubmitIntro} className="space-y-4">
                    <textarea
                      value={introAnswer}
                      onChange={(e) => setIntroAnswer(e.target.value)}
                      required
                      rows="6"
                      placeholder="Write your professional self-introduction here..."
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-light"
                    />

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all font-orbitron"
                      >
                        ABANDON
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider text-center"
                      >
                        Submit Response
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 3: INTRO FEEDBACK */}
            {step === 'intro-feedback' && introResult && (
              <motion.div
                key="intro-feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold font-orbitron text-cyan-400 uppercase tracking-widest">
                    Intro Evaluation
                  </h3>
                  <span className="text-xs text-gray-500 font-orbitron">Self-Intro Grader</span>
                </div>

                <div className="space-y-6">
                  {/* Rating grids */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase">Confidence</span>
                      <span className="text-sm font-bold font-orbitron text-white">{introResult.confidence}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase">Communication</span>
                      <span className="text-sm font-bold font-orbitron text-white">{introResult.communication}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase">Structure</span>
                      <span className="text-sm font-bold font-orbitron text-white">{introResult.structure}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-500 block font-bold uppercase">Professionalism</span>
                      <span className="text-sm font-bold font-orbitron text-white">{introResult.professionalism}</span>
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="p-4 rounded-xl bg-[#030014] border border-white/5">
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      <strong>AI Reviewer:</strong> {introResult.feedback}
                    </p>
                  </div>

                  {/* Ideal format details */}
                  {introResult.score < 90 && (
                    <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/10 space-y-2">
                      <h4 className="text-xs font-bold text-purple-400 font-orbitron uppercase tracking-widest">Ideal Introduction Format</h4>
                      <pre className="text-[10px] text-gray-400 whitespace-pre-wrap leading-relaxed font-sans font-light">
                        {introResult.idealFormat}
                      </pre>
                    </div>
                  )}

                  <button
                    onClick={handleStartMCQs}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Technical Round (14 MCQs)</span>
                    <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: MCQ SYSTEM */}
            {step === 'mcq' && mcqList.length > 0 && (
              <motion.div
                key="mcq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/5 space-y-6"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="px-2.5 py-0.5 rounded bg-purple-950/30 border border-purple-500/20 text-purple-400 text-[10px] font-bold font-orbitron">
                    QUESTION {currentMcqIdx + 2} OF 15
                  </span>
                  <span className="text-xs text-gray-500 font-orbitron">Technical MCQ Round</span>
                </div>

                <div className="space-y-6">
                  {/* The Question */}
                  <h3 className="text-base sm:text-lg font-bold font-orbitron text-white leading-relaxed text-left">
                    {mcqList[currentMcqIdx].q}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {mcqList[currentMcqIdx].options.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx;
                      const isCorrect = mcqList[currentMcqIdx].correct === oIdx;
                      
                      let optStyle = 'bg-white/5 border-white/5 text-gray-300 hover:border-white/10';
                      if (isOptionLocked) {
                        if (isCorrect) {
                          optStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold';
                        } else if (isSelected) {
                          optStyle = 'bg-red-950/30 border-red-500 text-red-400 font-bold';
                        } else {
                          optStyle = 'bg-white/5 border-white/5 text-gray-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(oIdx)}
                          disabled={isOptionLocked}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optStyle}`}
                        >
                          <span>{opt}</span>
                          {isOptionLocked && (
                            <span>
                              {isCorrect && <FiCheck className="text-emerald-400 text-lg" />}
                              {!isCorrect && isSelected && <FiX className="text-red-400 text-lg" />}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* MCQ Explanation */}
                  {isOptionLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/10 text-xs text-gray-400 leading-relaxed font-light"
                    >
                      <strong className="text-indigo-400 font-orbitron block mb-1">AI Explanation:</strong>
                      {mcqList[currentMcqIdx].explanation}
                    </motion.div>
                  )}

                  {/* Next Action */}
                  {isOptionLocked && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <span>
                        {currentMcqIdx < mcqList.length - 1 ? 'Next Question' : 'Complete Interview'}
                      </span>
                      <FiArrowRight />
                    </button>
                  )}

                </div>
              </motion.div>
            )}

            {/* STEP 5: SUMMARY REPORT */}
            {step === 'summary' && finalReport && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2 border-b border-white/10 pb-6">
                  <FiAward className="text-5xl text-yellow-400 mx-auto animate-pulse" />
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest font-orbitron block">
                    SESSION RESULTS SAVED
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white uppercase">
                    Interview Complete
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Aggregate Grade</span>
                    <span className="text-4xl font-extrabold font-orbitron text-purple-400">{finalReport.grade}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Technical Score</span>
                    <span className="text-4xl font-extrabold font-orbitron text-cyan-400">{finalReport.mcqScore}%</span>
                  </div>
                </div>

                {/* Score slider metrics */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-400">Total Score</span>
                      <span className="text-white">{finalReport.totalScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${finalReport.totalScore}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-500">Readiness Status</span>
                    <span className="text-cyan-400 font-bold font-orbitron uppercase tracking-widest">{finalReport.readinessStatus}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all font-orbitron uppercase tracking-wider flex items-center justify-center space-x-1"
                  >
                    <FiRotateCcw /> <span>Retake Interview</span>
                  </button>
                  <Link
                    to="/dashboard"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider text-center block"
                  >
                    View Analytics
                  </Link>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: 3D AI ROBOT INTERVIEWER */}
        <div className="lg:col-span-5 h-[350px] lg:h-[500px]">
          <div className="w-full h-full glass-panel rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
            <RobotInterviewerCanvas />
            
            {/* Robot Speech Prompt Box */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-cyan-500/20 text-xs text-left leading-relaxed text-gray-300 font-light">
              <span className="text-[10px] font-bold text-cyan-400 font-orbitron block mb-1">
                SYSTEM INTERFACE
              </span>
              {step === 'setup' && "Awaiting configuration. Select your targeted technology stack to begin the technical evaluation."}
              {step === 'intro' && "Introduce yourself. I will analyze your grammar structure, education benchmarks, projects, and career statements."}
              {step === 'intro-feedback' && "Introduction evaluation complete. Please review the recommended format before starting the technical MCQs."}
              {step === 'mcq' && `Analyzing Question ${currentMcqIdx + 2} of 15. Pick the correct syntax option or component parameter.`}
              {step === 'summary' && "Evaluation session finished. All scores compiled and stored in MongoDB database instance."}
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
