import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiMail, FiPhone, FiGithub, FiLinkedin, FiHelpCircle, FiChevronDown, FiCompass } from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSent, setIsSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const faqData = [
    {
      q: 'How does the AI rule engine score work?',
      a: 'The scoring uses 100+ deterministic domain rules checking skill keyword presence, project description depths using key phrases, document structural markers, and social link inclusions to compute an ATS score.'
    },
    {
      q: 'Can I integrate an LLM API later?',
      a: 'Yes. The backend endpoints in `server.js` and utility rules are completely separated from the UI controller logic. You can drop in an API call (like OpenAI or Gemini) without modifying client components.'
    },
    {
      q: 'Is my historical progress persistent?',
      a: 'Yes. All mock session grades, role placements, and resume records are stored in your MongoDB server instance. If the database runs offline, the app switches to local storage fallback automatically.'
    }
  ];

  const handleToggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Page Title */}
      <div className="text-center">
        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest font-orbitron">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase tracking-wide mt-2">
          Contact & FAQ
        </h1>
        <p className="mt-2 text-gray-400 font-light text-sm sm:text-base max-w-2xl mx-auto">
          Need support or want to learn more about the MERN rule architecture? Reach out or review the FAQs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FAQ & CONTACT INFO */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* FAQ List */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-base font-bold font-orbitron text-cyan-400 uppercase tracking-widest flex items-center space-x-2">
              <FiHelpCircle />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </h3>

            <div className="space-y-3">
              {faqData.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border-b border-white/5 pb-3">
                    <button
                      onClick={() => handleToggleFaq(idx)}
                      className="w-full flex justify-between items-center text-sm font-semibold text-gray-200 hover:text-white py-2 text-left"
                    >
                      <span className="font-orbitron tracking-wide">{faq.q}</span>
                      <FiChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : 'text-gray-500'}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-2 text-xs text-gray-400 font-light leading-relaxed pr-6"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social / Direct Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start space-x-3">
              <FiMail className="text-purple-400 text-lg mt-1" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Email Support</span>
                <a href="mailto:support@primeai.com" className="text-xs text-gray-200 hover:text-cyan-400 font-medium mt-0.5 block">support@primeai.com</a>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start space-x-3">
              <FiPhone className="text-cyan-400 text-lg mt-1" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Phone Contact</span>
                <span className="text-xs text-gray-200 font-medium mt-0.5 block">+1 (800) 555-0199</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start space-x-3">
              <FiGithub className="text-indigo-400 text-lg mt-1" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Repository Source</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-gray-200 hover:text-cyan-400 font-medium mt-0.5 block">github.com/primeai</a>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-start space-x-3">
              <FiLinkedin className="text-blue-400 text-lg mt-1" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Corporate Portal</span>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-xs text-gray-200 hover:text-cyan-400 font-medium mt-0.5 block">linkedin.com/company/primeai</a>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: CONTACT FORM & MAP */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Glass Form Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-base font-bold font-orbitron text-purple-400 uppercase tracking-widest flex items-center space-x-2 text-left">
              <FiMessageSquare />
              <span>SEND A MESSAGE</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="e.g. name@domain.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Message Description</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows="4"
                  placeholder="Write your details here..."
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider text-center"
              >
                Submit Form
              </button>
            </form>

            <AnimatePresence>
              {isSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs text-center"
                >
                  Message transmitted successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Futuristic Map Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[250px] relative overflow-hidden flex flex-col justify-between">
            {/* Grid overlay representing futuristic radar map */}
            <div className="absolute inset-0 bg-[#02000c] pointer-events-none opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
            
            {/* Map Grid lines styling */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,210,255,0.15) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Glowing Map Coordinate point */}
            <div className="absolute top-[40%] left-[55%] pointer-events-none">
              <span className="relative flex h-4 h-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 shadow-glowBlue"></span>
              </span>
              <div className="absolute left-6 top-0 bg-darkBg/90 border border-cyan-500/25 px-2 py-1 rounded text-[9px] text-cyan-300 font-bold font-orbitron tracking-wider whitespace-nowrap">
                PRIMEAI HQ: LAT 37.77, LON -122.41
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-orbitron">
                Telemetry Location
              </span>
              <FiCompass className="text-cyan-400 text-lg animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            <div className="relative z-10 text-left">
              <h4 className="text-xs font-bold text-white font-orbitron uppercase tracking-widest">San Francisco Tech Hub</h4>
              <p className="text-[10px] text-gray-400 mt-1 font-light">Suite 404, Innovation Plaza, California, USA</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
