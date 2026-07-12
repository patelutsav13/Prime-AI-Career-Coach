import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCpu, FiTrendingUp, FiBriefcase, FiFileText, FiAward, FiPieChart } from 'react-icons/fi';
import { HeroWorkspace } from '../components/ThreeCanvas';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderData = [
    {
      img: '/images/software_developers.png',
      title: 'Software Developers',
      desc: 'Collaborating on high-impact scalable system architectures.'
    },
    {
      img: '/images/ai_engineers.png',
      title: 'AI Engineers',
      desc: 'Engineering neural networks and prompt interfaces.'
    },
    {
      img: '/images/tech_office.png',
      title: 'Tech Workspaces',
      desc: 'Optimized development configurations and office systems.'
    }
  ];

  // Auto transition slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: 'Resume AI Analyzer',
      desc: 'Instant ATS validation, detail auditing, and missing skill suggestions.',
      icon: <FiFileText className="text-2xl text-cyan-400" />,
      link: '/resume'
    },
    {
      title: 'Career Role Matcher',
      desc: 'Toggle target fields and identify qualifications match with visual graphs.',
      icon: <FiBriefcase className="text-2xl text-indigo-400" />,
      link: '/role-matcher'
    },
    {
      title: 'AI Interview Practice',
      desc: 'Practice technical MCQ lists and self-introductions with simulated feedback.',
      icon: <FiCpu className="text-2xl text-purple-400" />,
      link: '/interview'
    },
    {
      title: 'Analytics Dashboard',
      desc: 'Complete overview of progress with Radar and Line widgets.',
      icon: <FiPieChart className="text-2xl text-pink-400" />,
      link: '/dashboard'
    },
    {
      title: 'Career Roadmap',
      desc: 'Structured week-by-week learning paths containing tutorial links.',
      icon: <FiTrendingUp className="text-2xl text-yellow-400" />,
      link: '/role-matcher'
    },
    {
      title: 'Skill Gap Detection',
      desc: 'Highlight missing core frameworks to prioritize learning targets.',
      icon: <FiAward className="text-2xl text-emerald-400" />,
      link: '/role-matcher'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-400 tracking-wider mb-6">
                <FiCpu className="animate-spin text-sm" />
                <span>POWERED BY PRESET MERN RULE ENGINE</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron tracking-tight leading-tight"
            >
              PrimeAI <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Career Coach
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-400 font-light leading-relaxed max-w-xl"
            >
              Analyze your Resume. Find your Ideal Career. Prepare with AI. Get Hired Faster. 
              The ultimate college subject career readiness portal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/resume"
                className="glow-btn-blue flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-sm font-bold text-white shadow-glowBlue transition-all duration-300"
              >
                <span>Start Analysis</span>
                <FiArrowRight className="text-base" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 text-sm font-bold text-gray-200 transition-all duration-300"
              >
                Explore Features
              </a>
            </motion.div>
          </div>

          {/* R3F 3D Canvas Workspace */}
          <div className="lg:col-span-5 w-full h-[400px] lg:h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full h-full glass-panel rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl"
            >
              <HeroWorkspace />
              <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500 pointer-events-none font-orbitron uppercase tracking-widest">
                Interactive 3D Workspace • Drag to rotate
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. CAREER SLIDER SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-orbitron uppercase tracking-wide">
            Career Domains
          </h2>
          <p className="mt-2 text-gray-400 font-light text-sm sm:text-base">
            Visualize your career trajectory in leading tech roles.
          </p>
        </div>

        <div className="relative h-[300px] sm:h-[450px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row"
            >
              <div className="w-full md:w-2/3 h-2/3 md:h-full relative overflow-hidden">
                <img
                  src={sliderData[currentSlide].img}
                  alt={sliderData[currentSlide].title}
                  className="w-full h-full object-cover filter brightness-75 hover:scale-105 transition-transform duration-[8000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030014] via-[#030014]/20 to-transparent pointer-events-none hidden md:block"></div>
              </div>
              <div className="w-full md:w-1/3 h-1/3 md:h-full bg-black/60 md:bg-white/[0.01] p-6 sm:p-10 flex flex-col justify-center">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron mb-2">
                  IT Sector Spotlight
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white">
                  {sliderData[currentSlide].title}
                </h3>
                <p className="mt-4 text-sm text-gray-400 font-light leading-relaxed">
                  {sliderData[currentSlide].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-6 flex space-x-2 z-10">
            {sliderData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'bg-cyan-400 w-8' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-orbitron">
              About PrimeAI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-orbitron leading-tight">
              What is PrimeAI Career Coach?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light">
              PrimeAI Career Coach is a college-subject AI assignment designed to function as a professional SaaS portal. 
              Built with the MERN stack, the application integrates deterministic rules that check resume text files, cross-reference them against requirements for 10+ developer roles, and run simulation practice mocks.
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light">
              By combining web design trends with interactive 3D assets, PrimeAI creates an immersive, premium portfolio demonstration.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold font-orbitron text-cyan-400 mb-4 uppercase tracking-wider">
              Student Core Benefits
            </h3>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">1</div>
              <div>
                <h4 className="text-white font-semibold text-sm sm:text-base">Skill Gap Mapping</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Directly detects missing technologies based on real-world employment checklists.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">2</div>
              <div>
                <h4 className="text-white font-semibold text-sm sm:text-base">Customized Roadmaps</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Generates weekly learning topics with Google documentation links and YouTube queries.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">3</div>
              <div>
                <h4 className="text-white font-semibold text-sm sm:text-base">Preparation Analytics</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Graded mock tests stored in MongoDB update aggregate charts to track progress.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-orbitron mt-2">
            Integrated AI Modules
          </h2>
          <p className="mt-4 text-gray-400 font-light text-sm sm:text-base">
            Explore our state-of-the-art tools designed to transform your professional prospects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <Link
              key={idx}
              to={feat.link}
              className="group glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between border border-white/5 shadow-lg"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white group-hover:text-cyan-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
              
              <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
                <span>Launch Tool</span>
                <FiArrowRight className="ml-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
