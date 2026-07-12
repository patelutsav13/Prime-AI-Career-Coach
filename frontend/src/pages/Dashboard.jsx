import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiActivity, FiBriefcase, FiTrash2, FiFileText, FiCpu, FiAlertCircle } from 'react-icons/fi';
import { getDashboard, deleteRole, deleteInterview, initUser, signUpUser, loginUser } from '../utils/api';
import { AnalyticsDashboardCanvas } from '../components/ThreeCanvas';

// Chart.js configuration
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title
} from 'chart.js';
import { Radar, Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title
);

export default function Dashboard() {
  const [sessionUser, setSessionUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Sign In
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup'); // 'signup' or 'login'

  const fetchDashboardData = async (email) => {
    try {
      const data = await getDashboard(email);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('primeai_session_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionUser(parsed);
        fetchDashboardData(parsed.email);
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
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
      fetchDashboardData(userData.email);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };

  const handleDeleteCard = async (roleId) => {
    if (!sessionUser) return;
    try {
      const res = await deleteRole(sessionUser.email, roleId);
      // Update local state immediately
      fetchDashboardData(sessionUser.email);
      
      // Sync navbar state
      if (res.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInterviewCard = async (interviewId) => {
    if (!sessionUser) return;
    try {
      const res = await deleteInterview(sessionUser.email, interviewId);
      if (res?.user) {
        localStorage.setItem('primeai_session_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Delete interview error:', err);
    }
    // Always refresh dashboard regardless of delete response
    fetchDashboardData(sessionUser.email);
  };

  // --- CHARTS CONFIGURATIONS ---

  // 1. Radar Chart: Role Performance
  const radarData = {
    labels: ['Frontend', 'Backend', 'Full Stack', 'Python', 'ML', 'AI Engineer'],
    datasets: [
      {
        label: 'Role Match Skill %',
        data: stats?.roleHistory?.map(r => r.eligibilityScore).slice(-6) || [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(0, 210, 255, 0.2)',
        borderColor: '#00d2ff',
        borderWidth: 2,
        pointBackgroundColor: '#00d2ff',
      },
      {
        label: 'Benchmark Targets',
        data: [85, 85, 85, 85, 85, 85],
        backgroundColor: 'rgba(210, 0, 255, 0.1)',
        borderColor: 'rgba(210, 0, 255, 0.4)',
        borderWidth: 1.5,
        pointBackgroundColor: '#d200ff',
      }
    ]
  };

  // 2. Bar Chart: Career Readiness Comparison
  const barData = {
    labels: ['Resume', 'ATS', 'Readiness', 'Interviews'],
    datasets: [
      {
        label: 'Current Level',
        data: [
          stats?.metrics?.resumeScore || 0,
          stats?.metrics?.atsScore || 0,
          stats?.metrics?.careerReadiness || 0,
          stats?.metrics?.interviewScore || 0
        ],
        backgroundColor: [
          'rgba(0, 210, 255, 0.6)',
          'rgba(210, 0, 255, 0.6)',
          'rgba(0, 246, 255, 0.6)',
          'rgba(244, 63, 94, 0.6)'
        ],
        borderColor: ['#00d2ff', '#d200ff', '#00f6ff', '#f43f5e'],
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  // 3. Line Chart: Interview Progress History
  const lineData = {
    labels: stats?.interviewHistory?.map((_, idx) => `Vivas #${idx + 1}`) || ['Practice #1'],
    datasets: [
      {
        label: 'Technical Grades Trend',
        data: stats?.interviewHistory?.map(i => i.totalScore) || [0],
        fill: true,
        backgroundColor: 'rgba(210, 0, 255, 0.15)',
        borderColor: '#d200ff',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  // 4. Pie Chart: Resume Analysis Progress Distribution
  const pieData = {
    labels: ['Strengths', 'Weaknesses', 'Gap Suggestions'],
    datasets: [
      {
        data: [
          stats?.resumeHistory?.[stats?.resumeHistory?.length - 1]?.strengths?.length || 1,
          stats?.resumeHistory?.[stats?.resumeHistory?.length - 1]?.weaknesses?.length || 1,
          stats?.resumeHistory?.[stats?.resumeHistory?.length - 1]?.improvementSuggestions?.length || 1
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(245, 158, 11, 0.6)'
        ],
        borderColor: ['#10b981', '#f43f5e', '#f59e0b'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'Orbitron', size: 10 } }
      }
    },
    scales: {
      r: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: { color: '#9ca3af', font: { family: 'Orbitron', size: 9 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl text-center max-w-md w-full space-y-6">
          <FiUser className="text-5xl text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider">
            {quickAuthMode === 'signup' ? 'Create Profile' : 'Sign In'}
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            {quickAuthMode === 'signup'
              ? 'Create a profile to access the aggregate analytics dashboard and view history logs.'
              : 'Access your saved analytics dashboard metrics and logs.'}
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
    );
  }

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* 1. Header welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
            Control Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase tracking-wide mt-2">
            Welcome, {stats?.name || 'Developer'}
          </h1>
          <p className="mt-1 text-gray-400 font-light text-sm">
            Reviewing aggregates for {stats?.email}. All data resides locally fallback or MongoDB.
          </p>
        </div>
        
        {/* Profile Card Summary */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl glass-panel border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <FiUser className="text-white text-lg" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">{stats?.name}</span>
            <span className="text-[10px] text-gray-500 font-orbitron">MERN ACTIVE SESSION</span>
          </div>
        </div>
      </div>

      {/* 2. Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
          <FiFileText className="text-cyan-400 text-lg absolute top-4 right-4 opacity-40" />
          <span className="text-[10px] text-gray-500 block font-bold uppercase">Resume Score</span>
          <span className="text-3xl font-extrabold font-orbitron text-cyan-400 block mt-2">
            {stats?.metrics?.resumeScore || 0}%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
          <FiActivity className="text-purple-400 text-lg absolute top-4 right-4 opacity-40" />
          <span className="text-[10px] text-gray-500 block font-bold uppercase">ATS Score</span>
          <span className="text-3xl font-extrabold font-orbitron text-purple-400 block mt-2">
            {stats?.metrics?.atsScore || 0}%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
          <FiBriefcase className="text-emerald-400 text-lg absolute top-4 right-4 opacity-40" />
          <span className="text-[10px] text-gray-500 block font-bold uppercase">Career Readiness</span>
          <span className="text-3xl font-extrabold font-orbitron text-emerald-400 block mt-2">
            {stats?.metrics?.careerReadiness || 0}%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
          <FiCpu className="text-rose-400 text-lg absolute top-4 right-4 opacity-40" />
          <span className="text-[10px] text-gray-500 block font-bold uppercase">Avg Interview</span>
          <span className="text-3xl font-extrabold font-orbitron text-rose-400 block mt-2">
            {stats?.metrics?.interviewScore || 0}%
          </span>
        </div>

      </div>

      {/* 3. CHARTS GRID & R3F CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Charts block (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Radar chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col justify-between">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest mb-2 text-left">Role Performance</h3>
            <div className="relative flex-1 w-full">
              <Radar data={radarData} options={chartOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col justify-between">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest mb-2 text-left">Readiness Metrics</h3>
            <div className="relative flex-1 w-full">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col justify-between">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest mb-2 text-left">Interview Progress</h3>
            <div className="relative flex-1 w-full">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col justify-between">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest mb-2 text-left">Resume Audit Balance</h3>
            <div className="relative flex-1 w-full">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* 3D Dashboard Pillar (4 cols) */}
        <div className="lg:col-span-4 h-[300px] lg:h-[624px]">
          <div className="w-full h-full glass-panel rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
            <AnalyticsDashboardCanvas />
            <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500 font-orbitron uppercase tracking-widest">
              3D Analytics Module
            </div>
          </div>
        </div>

      </div>

      {/* 4. SAVED ROLE CARDS WITH DELETE ACTION */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold font-orbitron uppercase tracking-wide">
            Tracked Role Placements
          </h2>
          <p className="text-gray-400 text-xs mt-1">Review recently analyzed job category entries. Deleting will immediately update charts aggregates.</p>
        </div>

        {stats?.roleHistory?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.roleHistory.map((role) => (
              <div
                key={role._id}
                className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300"
              >
                <button
                  onClick={() => handleDeleteCard(role._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                >
                  <FiTrash2 className="text-sm" />
                </button>

                <div className="space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-orbitron block">Job Category</span>
                  <h4 className="text-lg font-bold font-orbitron text-white text-left pr-8">{role.jobRole}</h4>
                  
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-400">Eligibility</span>
                    <span className="text-cyan-400 font-bold font-orbitron">{role.eligibilityScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${role.eligibilityScore}%` }} />
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-[10px] text-gray-500 font-semibold font-orbitron uppercase tracking-wide">
                  <span>{new Date(role.date).toLocaleDateString()}</span>
                  <span className="text-purple-400">{role.readinessStatus}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center text-gray-500 text-sm">
            No active career matches found. Try running a match evaluation in the Career Role Matcher!
          </div>
        )}
      </div>

      {/* 5. SAVED INTERVIEW CARDS WITH DELETE ACTION */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold font-orbitron uppercase tracking-wide">
            Tracked Interview Progress
          </h2>
          <p className="text-gray-400 text-xs mt-1">Review recently completed mock interviews. Deleting will immediately update charts aggregates.</p>
        </div>

        {stats?.interviewHistory?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.interviewHistory.map((interview) => (
              <div
                key={interview._id}
                className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300"
              >
                <button
                  onClick={() => handleDeleteInterviewCard(interview._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                >
                  <FiTrash2 className="text-sm" />
                </button>

                <div className="space-y-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-orbitron block">Target Role</span>
                  <h4 className="text-lg font-bold font-orbitron text-white text-left pr-8">{interview.jobRole}</h4>
                  
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-400">Total Score</span>
                    <span className="text-purple-400 font-bold font-orbitron">{interview.totalScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${interview.totalScore}%` }} />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-gray-400">Technical (MCQ)</span>
                    <span className="text-cyan-400 font-bold font-orbitron">{interview.mcqScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${interview.mcqScore}%` }} />
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-[10px] text-gray-500 font-semibold font-orbitron uppercase tracking-wide">
                  <span>{new Date(interview.date).toLocaleDateString()}</span>
                  <span className="text-emerald-400">{interview.readinessStatus}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center text-gray-500 text-sm">
            No mock interviews found. Try taking an AI Interview Practice session!
          </div>
        )}
      </div>

    </div>
  );
}
