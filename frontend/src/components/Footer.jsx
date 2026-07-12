import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiMail, FiMessageCircle } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-[#030014]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Intro */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-lg font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              PRIMEAI CAREER COACH
            </span>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-sm">
              Empowering college students and developers with rule-based artificial intelligence to optimize resumes, evaluate skills, build learning roadmaps, and practice technical interviews.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FiGithub className="text-xl" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FiLinkedin className="text-xl" />
              </a>
              <a href="mailto:contact@primeai.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FiMail className="text-xl" />
              </a>
              <Link to="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <FiMessageCircle className="text-xl" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-orbitron mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/resume" className="hover:text-white transition">Resume AI Analyzer</Link></li>
              <li><Link to="/role-matcher" className="hover:text-white transition">Role Matcher</Link></li>
              <li><Link to="/interview" className="hover:text-white transition">Interview Practice</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-orbitron mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Profile Account</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Get Support</Link></li>
              <li><span className="text-gray-600 cursor-not-allowed">Terms & Privacy</span></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PrimeAI Career Coach. Built for AI Subject Project.</p>
          <p className="mt-2 sm:mt-0 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-medium">
            Analyze. Learn. Prepare. Get Hired.
          </p>
        </div>
      </div>
    </footer>
  );
}
