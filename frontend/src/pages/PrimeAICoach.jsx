import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPlus, FiTrash2, FiEdit3, FiCheck, FiX, FiCopy, FiRefreshCw, FiThumbsUp, FiThumbsDown, FiMessageSquare, FiSearch, FiMenu, FiCpu, FiUser, FiChevronLeft, FiTrash, FiZap } from 'react-icons/fi';
import { signUpUser, loginUser, API_BASE } from '../utils/api';
import axios from 'axios';

// Simple markdown renderer
function renderMarkdown(text) {
  if (!text) return '';
  
  // Code blocks with language
  let html = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    return `<div class="code-block-wrapper"><div class="code-block-header"><span>${language}</span><button onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent)" class="copy-code-btn">Copy</button></div><pre class="code-block"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre></div>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-cyan-400 mt-3 mb-1 font-orbitron">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-cyan-400 mt-4 mb-2 font-orbitron">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-lg font-bold text-cyan-400 mt-4 mb-2 font-orbitron">$1</h2>');
  
  // Bullet points
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

// Typing animation component
function TypingMessage({ text, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  
  useEffect(() => {
    if (done) return;
    const speed = text.length > 500 ? 2 : 8;
    const chunkSize = text.length > 500 ? 8 : 3;
    const timer = setInterval(() => {
      idx.current = Math.min(idx.current + chunkSize, text.length);
      setDisplayed(text.substring(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, done, onComplete]);
  
  return (
    <div 
      className="prose-chat" 
      dangerouslySetInnerHTML={{ __html: renderMarkdown(displayed) + (done ? '' : '<span class="typing-cursor">|</span>') }}
    />
  );
}

// AI Particles Background
function AIParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-500/20"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0
          }}
          animate={{ 
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{ 
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  { icon: '\ud83d\udcdd', text: 'Review my resume and suggest improvements', category: 'Resume' },
  { icon: '\ud83c\udfaf', text: 'Which job role best matches my skills?', category: 'Career' },
  { icon: '\ud83d\udca1', text: 'Create a 4-week learning roadmap for React', category: 'Learning' },
  { icon: '\ud83c\udf93', text: 'Give me 10 interview questions for a Frontend Developer role', category: 'Interview' },
  { icon: '\ud83d\ude80', text: 'How can I improve my ATS score?', category: 'Resume' },
  { icon: '\ud83d\udcbb', text: 'Explain the difference between REST API and GraphQL', category: 'Technical' },
];

export default function PrimeAICoach() {
  const [sessionUser, setSessionUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  
  // Quick Sign In
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickAuthMode, setQuickAuthMode] = useState('signup');
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // Mobile responsiveness screen check
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Load session
  useEffect(() => {
    const stored = localStorage.getItem('primeai_session_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionUser(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);
  
  // Load conversations when user is available
  useEffect(() => {
    if (sessionUser?.email) {
      loadConversations();
    }
  }, [sessionUser]);
  
  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coach/conversations/${sessionUser.email}`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };
  
  const loadConversation = async (convId) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    try {
      const res = await axios.get(`${API_BASE}/coach/conversation/${convId}`);
      setCurrentConversation(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };
  
  const handleNewChat = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    setCurrentConversation(null);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };
  
  const getResumeContext = () => {
    if (!sessionUser) return null;
    const history = sessionUser.resumeAnalysisHistory;
    if (!history || history.length === 0) return null;
    const latest = history[history.length - 1];
    return {
      skills: latest.skills || [],
      projects: latest.projects || [],
      resumeScore: latest.resumeScore,
      atsScore: latest.atsScore,
      readinessScore: latest.readinessScore,
      strengths: latest.strengths || [],
      weaknesses: latest.weaknesses || [],
      missingSkills: latest.missingSkills || [],
      improvementSuggestions: latest.improvementSuggestions || []
    };
  };
  
  const generateClientSmartResponse = (messageText) => {
    const lowerMsg = messageText.toLowerCase();

    if (/^(hi|hello|hey|greetings|good morning|good evening)/i.test(lowerMsg.trim())) {
      return `### Hello! 👋 I'm PrimeAI Coach
I am your personal AI career mentor and software engineering guide!

Here is how I can assist you today:
- 🚀 **Resume Review & ATS Optimization**
- 🎯 **Target Job Role Matching & Skill Gap Analysis**
- 💻 **Technical Concepts** (React, Express, Node.js, Python, SQL, REST APIs, System Design)
- 📝 **Mock Interview Preparation & Model Solutions**
- 🗓️ **Custom Learning Roadmaps**

What topic or question would you like to explore today?`;
    }

    if (lowerMsg.includes('express')) {
      return `### ⚡ What is Express.js?

**Express.js** is a fast, unopinionated, minimalist web framework for **Node.js**. It provides a robust set of features to build single-page, multi-page, and hybrid web applications as well as scalable RESTful APIs.

#### Key Features of Express.js:
1. **Middleware Pipeline**: Easily execute code, modify request/response objects, and end request-response cycles.
2. **Robust Routing**: Map HTTP methods (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`) to specific URL paths.
3. **Database Integration**: Connects seamlessly with MongoDB (via Mongoose), PostgreSQL, MySQL, and Redis.
4. **High Performance**: Asynchronous and non-blocking I/O powered by Node.js event loop.

#### Example Express.js Server Setup:
\`\`\`javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON payloads
app.use(express.json());

// Sample API Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Express server running smoothly!' });
});

app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});
\`\`\`

Would you like to learn how to integrate authentication (JWT) or connect MongoDB with Express?`;
    }

    if (lowerMsg.includes('react')) {
      return `### ⚛️ Understanding React.js

**React** is a declarative, component-based JavaScript library created by Meta for building modern user interfaces.

#### Core Concepts:
- **JSX (JavaScript XML)**: Syntax extension allowing HTML-like markup inside JavaScript.
- **Component Architecture**: Reusable UI blocks composed together.
- **State & Hooks**: State management via \`useState\`, side-effects via \`useEffect\`, and performance optimization via \`useMemo\` / \`useCallback\`.
- **Virtual DOM**: High-performance reconciliation engine calculating minimal DOM updates.`;
    }

    return `### 💡 Guide: ${messageText}

Thank you for your question! Here is an overview of **"${messageText}"**:

1. **Overview**: Key principles, core concepts, and essential facts.
2. **Context**: Application in real-world software engineering, scientific concepts, or career development.
3. **Key Takeaways**: Best practices, efficient execution, and practical knowledge.

Feel free to ask a follow-up or explore another topic!`;
  };

  const handleSend = async (overrideMessage) => {
    const messageText = overrideMessage || input.trim();
    if (!messageText || isLoading || !sessionUser) return;
    
    setInput('');
    setIsLoading(true);
    
    const userMsg = { role: 'user', text: messageText, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    try {
      const res = await axios.post(`${API_BASE}/coach/chat`, {
        email: sessionUser.email,
        conversationId: currentConversation?._id || null,
        message: messageText,
        resumeContext: getResumeContext()
      });
      
      const conv = res.data.conversation;
      setCurrentConversation(conv);
      setMessages(conv.messages);
      setTypingMessageId(conv.messages.length - 1);
      loadConversations();
    } catch (err) {
      console.warn('Chat API error, using smart response fallback:', err);
      const fallbackText = generateClientSmartResponse(messageText);
      const fallbackMessages = [...newMessages, { role: 'model', text: fallbackText, timestamp: new Date().toISOString() }];
      setMessages(fallbackMessages);
      setTypingMessageId(fallbackMessages.length - 1);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = async () => {
    if (isLoading || !currentConversation) return;
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE}/coach/regenerate`, {
        conversationId: currentConversation._id,
        email: sessionUser.email,
        resumeContext: getResumeContext()
      });
      
      const conv = res.data.conversation;
      setCurrentConversation(conv);
      setMessages(conv.messages);
      setTypingMessageId(conv.messages.length - 1);
    } catch (err) {
      console.error('Regenerate error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReact = async (messageIndex, reaction) => {
    if (!currentConversation) return;
    try {
      const currentReaction = messages[messageIndex]?.liked;
      const newReaction = currentReaction === reaction ? null : reaction;
      
      await axios.put(`${API_BASE}/coach/message/${currentConversation._id}/${messageIndex}/react`, {
        reaction: newReaction
      });
      
      setMessages(prev => prev.map((m, i) => i === messageIndex ? { ...m, liked: newReaction } : m));
    } catch (err) {
      console.error('React error:', err);
    }
  };
  
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };
  
  const handleDeleteConversation = async (convId, e) => {
    e?.stopPropagation();
    try {
      await axios.delete(`${API_BASE}/coach/conversation/${convId}`);
      if (currentConversation?._id === convId) {
        handleNewChat();
      }
      loadConversations();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
  
  const handleRenameConversation = async (convId) => {
    if (!editTitleValue.trim()) {
      setEditingTitle(null);
      return;
    }
    try {
      await axios.put(`${API_BASE}/coach/conversation/${convId}/rename`, { title: editTitleValue.trim() });
      loadConversations();
      if (currentConversation?._id === convId) {
        setCurrentConversation(prev => ({ ...prev, title: editTitleValue.trim() }));
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
    setEditingTitle(null);
  };
  
  const handleClearAll = async () => {
    if (!sessionUser) return;
    try {
      await axios.delete(`${API_BASE}/coach/conversations/${sessionUser.email}`);
      setConversations([]);
      handleNewChat();
    } catch (err) {
      console.error('Clear all error:', err);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
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
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed.';
      alert(msg);
    }
  };
  
  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Auth gate
  if (!sessionUser) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl text-center max-w-md w-full space-y-6">
          <FiCpu className="text-5xl text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold font-orbitron text-white uppercase tracking-wide">
            {quickAuthMode === 'signup' ? 'Create Profile' : 'Sign In'}
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            {quickAuthMode === 'signup'
              ? 'Create a profile to access PrimeAI Coach — your personal AI career mentor.'
              : 'Sign in to continue your AI coaching conversations.'}
          </p>
          <div className="glass-panel p-1 rounded-xl border border-white/5 flex">
            <button type="button" onClick={() => setQuickAuthMode('signup')} className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${quickAuthMode === 'signup' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>SIGN UP</button>
            <button type="button" onClick={() => setQuickAuthMode('login')} className={`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-lg transition-all ${quickAuthMode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>SIGN IN</button>
          </div>
          <form onSubmit={handleQuickSignIn} className="space-y-4 text-left font-sans">
            {quickAuthMode === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Your Name</label>
                <input type="text" value={quickName} onChange={(e) => setQuickName(e.target.value)} required placeholder="e.g. Alex Mercer" className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
              <input type="email" value={quickEmail} onChange={(e) => setQuickEmail(e.target.value)} required placeholder="e.g. alex@university.edu" className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password</label>
              <input type="password" value={quickPassword} onChange={(e) => setQuickPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider">
              {quickAuthMode === 'signup' ? 'Create Profile & Sign Up' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex h-[calc(100vh-80px)] overflow-hidden">
      <AIParticles />
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed md:static inset-y-0 left-0 w-[280px] sm:w-[300px] flex-shrink-0 glass-panel border-r border-white/10 flex flex-col h-full z-50 md:z-20 bg-[#030014]/95 md:bg-transparent shadow-2xl md:shadow-none"
            >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/5 space-y-3">
              <button
                onClick={handleNewChat}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-glowBlue transition-all font-orbitron uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <FiPlus />
                <span>New Chat</span>
              </button>
              
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                />
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-xs">
                  <FiMessageSquare className="text-2xl mx-auto mb-2 opacity-40" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                      currentConversation?._id === conv._id
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-white'
                        : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      {editingTitle === conv._id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameConversation(conv._id)}
                            className="flex-1 px-2 py-0.5 rounded bg-white/10 border border-cyan-500/30 text-xs text-white focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button onClick={(e) => { e.stopPropagation(); handleRenameConversation(conv._id); }} className="text-emerald-400 hover:text-emerald-300"><FiCheck /></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingTitle(null); }} className="text-red-400 hover:text-red-300"><FiX /></button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate font-medium">{conv.title}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                    
                    {editingTitle !== conv._id && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingTitle(conv._id); setEditTitleValue(conv.title); }}
                          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition"
                        ><FiEdit3 className="text-[10px]" /></button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv._id, e)}
                          className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                        ><FiTrash2 className="text-[10px]" /></button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Sidebar Footer */}
            {conversations.length > 0 && (
              <div className="p-3 border-t border-white/5">
                <button
                  onClick={handleClearAll}
                  className="w-full py-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-bold font-orbitron uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                >
                  <FiTrash className="text-xs" />
                  <span>Clear All History</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Chat Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 glass-panel z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
            >
              {sidebarOpen ? <FiChevronLeft /> : <FiMenu />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center">
                <FiZap className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-orbitron text-white tracking-wide">
                  {currentConversation?.title || 'PrimeAI Coach'}
                </h2>
                <span className="text-[9px] text-cyan-400 font-orbitron uppercase tracking-widest">AI Career Mentor</span>
              </div>
            </div>
          </div>
          
          {currentConversation && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRegenerate}
                disabled={isLoading || messages.filter(m => m.role === 'model').length === 0}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition disabled:opacity-30"
                title="Regenerate last response"
              >
                <FiRefreshCw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-purple-600/20 border border-cyan-500/20 flex items-center justify-center mb-6">
                <FiZap className="text-3xl text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold font-orbitron text-white mb-2">PrimeAI Coach</h2>
              <p className="text-xs text-gray-500 max-w-md mb-8">Your AI-powered career mentor. Ask about resumes, interviews, learning paths, or any technical topic.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    className="text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all group"
                  >
                    <span className="text-lg mb-1 block">{prompt.icon}</span>
                    <p className="text-xs text-gray-300 group-hover:text-white transition">{prompt.text}</p>
                    <span className="text-[9px] text-gray-600 font-orbitron uppercase tracking-widest mt-1 block">{prompt.category}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Messages */}
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar + Name */}
                <div className={`flex items-center space-x-2 mb-1.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center">
                      <FiZap className="text-white text-[10px]" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-gray-500 font-orbitron uppercase tracking-wider">
                    {msg.role === 'user' ? 'You' : 'PrimeAI Coach'}
                  </span>
                  {msg.role === 'user' && (
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-400 to-pink-500 flex items-center justify-center">
                      <FiUser className="text-white text-[10px]" />
                    </div>
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border border-cyan-500/20 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.role === 'model' && typingMessageId === idx ? (
                    <TypingMessage text={msg.text} onComplete={() => setTypingMessageId(null)} />
                  ) : (
                    <div className="prose-chat" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  )}
                </div>
                
                {/* Actions for AI messages */}
                {msg.role === 'model' && typingMessageId !== idx && (
                  <div className="flex items-center space-x-1 mt-1.5 ml-1">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="p-1.5 rounded-md hover:bg-white/5 text-gray-600 hover:text-white transition text-[10px]" title="Copy"
                    >
                      {copiedIdx === idx ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                    </button>
                    <button
                      onClick={() => handleReact(idx, true)}
                      className={`p-1.5 rounded-md hover:bg-white/5 transition text-[10px] ${msg.liked === true ? 'text-emerald-400' : 'text-gray-600 hover:text-white'}`}
                      title="Like"
                    ><FiThumbsUp /></button>
                    <button
                      onClick={() => handleReact(idx, false)}
                      className={`p-1.5 rounded-md hover:bg-white/5 transition text-[10px] ${msg.liked === false ? 'text-red-400' : 'text-gray-600 hover:text-white'}`}
                      title="Dislike"
                    ><FiThumbsDown /></button>
                    {idx === messages.length - 1 && (
                      <button
                        onClick={handleRegenerate}
                        disabled={isLoading}
                        className="p-1.5 rounded-md hover:bg-white/5 text-gray-600 hover:text-white transition text-[10px] disabled:opacity-30"
                        title="Regenerate"
                      ><FiRefreshCw /></button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-gray-500 font-orbitron">AI is thinking...</span>
              </div>
            </motion.div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-white/5 glass-panel">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask PrimeAI Coach anything..."
              rows="1"
              className="w-full px-5 py-3.5 pr-14 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-500/50 text-sm text-white focus:outline-none resize-none placeholder-gray-600 transition-all focus:shadow-[0_0_20px_rgba(0,210,255,0.1)]"
              style={{ minHeight: '52px', maxHeight: '150px' }}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-glowBlue"
            >
              <FiSend className="text-sm" />
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-600 mt-2 font-light">
            PrimeAI Coach uses Google Gemini AI. Responses may contain errors. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
