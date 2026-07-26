import axios from 'axios';
import { clientAnalyzeResumeAI, clientMatchCareerRoleAI, clientGradeSelfIntroductionAI } from './clientAiEngine';

// Dynamic API URL detection (Dev: localhost, Production: Render backend)
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://prime-ai-career-coach.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE = getApiBaseUrl();

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Helper: Check if backend server is online
let isServerOnline = true;

// Check connection status asynchronously
const checkBackendOnline = async () => {
  try {
    // Ping request with 10s timeout to allow for Render cold starts
    await axios.get(`${API_BASE}/mcqs/frontend`, { timeout: 10000 });
    isServerOnline = true;
  } catch (error) {
    // If connection refused or network error, set offline simulator mode
    if (error.code === 'ERR_NETWORK') {
      isServerOnline = false;
    }
  }
};

// Periodic checks
setInterval(checkBackendOnline, 15000);
checkBackendOnline();

// --- LocalStorage Simulation Helpers ---
const getLocalUser = (email) => {
  const localDb = JSON.parse(localStorage.getItem('primeai_users') || '{}');
  return localDb[email] || null;
};

const saveLocalUser = (email, userData) => {
  const localDb = JSON.parse(localStorage.getItem('primeai_users') || '{}');
  localDb[email] = userData;
  localStorage.setItem('primeai_users', JSON.stringify(localDb));
  // Update current session user
  localStorage.setItem('primeai_session_user', JSON.stringify(userData));
};

// Initialize Mock User Data for fallback
const makeMockUser = (email, name, password) => {
  return {
    email,
    name,
    password, // Plain text saved in localStorage for simulator simplification
    theme: 'dark',
    loginStatus: true,
    dashboardSettings: {},
    resumeAnalysisHistory: [],
    roleAnalysisHistory: [],
    interviewHistory: []
  };
};

export const initUser = async (email, name) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.post('/user/init', { email, name });
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data));
      localStorage.setItem('primeai_simulator_alert', 'false');
      return res.data;
    } catch (err) {
      console.warn('Backend init user failed. Falling back to local storage simulator.', err);
    }
  }

  // Local storage fallback
  localStorage.setItem('primeai_simulator_alert', 'true');
  let localUser = getLocalUser(email);
  if (!localUser) {
    localUser = makeMockUser(email, name);
    saveLocalUser(email, localUser);
  } else {
    localUser.loginStatus = true;
    saveLocalUser(email, localUser);
  }
  return localUser;
};

export const signUpUser = async (email, name, password) => {
  await checkBackendOnline();
  if (isServerOnline) {
    const res = await api.post('/user/signup', { email, name, password });
    localStorage.setItem('primeai_session_user', JSON.stringify(res.data));
    localStorage.setItem('primeai_simulator_alert', 'false');
    return res.data;
  }

  // Local storage fallback
  localStorage.setItem('primeai_simulator_alert', 'true');
  const existing = getLocalUser(email);
  if (existing) {
    throw new Error('Email already registered in local database. Please sign in instead.');
  }
  const localUser = makeMockUser(email, name, password);
  saveLocalUser(email, localUser);
  return localUser;
};

export const loginUser = async (email, password) => {
  await checkBackendOnline();
  if (isServerOnline) {
    const res = await api.post('/user/login', { email, password });
    localStorage.setItem('primeai_session_user', JSON.stringify(res.data));
    localStorage.setItem('primeai_simulator_alert', 'false');
    return res.data;
  }

  // Local storage fallback
  localStorage.setItem('primeai_simulator_alert', 'true');
  const localUser = getLocalUser(email);
  if (!localUser) {
    throw new Error('Email not registered in local database. Please sign up first.');
  }
  if (localUser.password && localUser.password !== password) {
    throw new Error('Incorrect password.');
  }
  localUser.loginStatus = true;
  saveLocalUser(email, localUser);
  return localUser;
};

export const fetchUser = async (email) => {
  await checkBackendOnline();
  if (isServerOnline) {
    const res = await api.get(`/user/${email}`);
    // Update local session with latest data
    localStorage.setItem('primeai_session_user', JSON.stringify(res.data));
    return res.data;
  }
  return getLocalUser(email);
};

export const uploadResumePDF = async (file) => {
  await checkBackendOnline();
  if (isServerOnline) {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/user/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
  
  // Local storage / client-side fallback parsing (in case backend is offline)
  const text = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.readAsText(file);
  });

  const isPdfHeader = text.startsWith('%PDF-');
  if (!isPdfHeader) {
    throw new Error('Please upload a proper resume file (PDF format).');
  }

  const lines = text.split('\n');
  const matchedProjects = [];

  // Same extraction rules on fallback client
  const skillCatalog = [
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'JavaScript', 'TypeScript',
    'React', 'Redux', 'Next.js', 'Node.js', 'Express', 'MongoDB',
    'MySQL', 'PostgreSQL', 'REST API', 'Git', 'GitHub', 'Python', 'Django',
    'Flask', 'Java', 'Spring', 'C++', 'C#', 'SQL', 'Docker', 'AWS'
  ];
  
  const matchedSkills = [];
  skillCatalog.forEach(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      matchedSkills.push(skill);
    }
  });

  if (matchedSkills.length === 0 && matchedProjects.length === 0) {
    throw new Error('Please upload a proper resume file containing Skills or Projects sections.');
  }

  // Fallback links
  const githubMatch = text.match(/github\.com\/[A-Za-z0-9_\-\/]+/i);
  const githubUrl = githubMatch ? 'https://' + githubMatch[0].replace(/[()]/g, '') : '';

  const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_\-\/]+/i);
  const linkedinUrl = linkedinMatch ? 'https://' + linkedinMatch[0].replace(/[()]/g, '') : '';

  const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-]*)*)/gi) || [];
  let portfolioUrl = '';
  for (let url of urlMatches) {
    if (!/github|linkedin|google|facebook|twitter|instagram|youtube|localhost/i.test(url)) {
      portfolioUrl = url.startsWith('http') ? url : 'https://' + url;
      break;
    }
  }

  const eduLines = lines.filter(l => /bachelor|master|degree|university|college|institute|b\.tech|b\.e|b\.s|b\.c\.a|mca/i.test(l));
  const educationText = eduLines.length > 0 ? eduLines[0].replace(/[()]/g, '').trim().substring(0, 100) : 'Bachelor of Computer Science, State University';

  const expLines = lines.filter(l => /(?:intern|developer|engineer|analyst|manager|months|years|experience)\b/i.test(l) && !/skills|projects|github|linkedin|education|college/i.test(l));
  const experienceText = expLines.length > 0 ? expLines[0].replace(/[()]/g, '').trim().substring(0, 100) : 'Software Development Intern (6 months)';

  return {
    skills: matchedSkills.join(', '),
    projects: matchedProjects,
    education: educationText,
    experience: experienceText,
    github: githubUrl,
    linkedin: linkedinUrl,
    portfolio: portfolioUrl
  };
};

export const analyzeResume = async (email, fileName, skills, projects, experience, education) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.post('/user/resume-analyze', {
        email,
        fileName,
        skills,
        projects,
        experience,
        education
      });
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend analyze failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const analysis = clientAnalyzeResumeAI(skills, projects, experience, education);
  analysis.fileName = fileName || 'Manual Entry';
  analysis._id = 'mock_res_' + Date.now();
  analysis.date = new Date().toISOString();
  analysis.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
  analysis.projects = projects || [];

  const user = getLocalUser(email) || makeMockUser(email, 'User');
  user.resumeAnalysisHistory.push(analysis);
  saveLocalUser(email, user);

  return { analysis, user };
};

export const matchCareerRole = async (email, jobRole, skills) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.post('/user/career-match', { email, jobRole, skills });
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend match career failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const matchResults = clientMatchCareerRoleAI(skills, jobRole);
  matchResults.jobRole = jobRole;
  matchResults._id = 'mock_role_' + Date.now();
  matchResults.date = new Date().toISOString();

  const user = getLocalUser(email) || makeMockUser(email, 'User');
  user.roleAnalysisHistory.push(matchResults);
  saveLocalUser(email, user);

  return { matchResults: matchResults, user };
};

export const submitInterview = async (email, jobRole, introAnswer, mcqCorrectCount, mcqTotalCount) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.post('/user/interview-submit', {
        email,
        jobRole,
        introAnswer,
        mcqCorrectCount,
        mcqTotalCount
      });
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend interview submit failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const introGrade = clientGradeSelfIntroductionAI(introAnswer);
  const mcqPercent = mcqTotalCount > 0 ? Math.round((mcqCorrectCount / mcqTotalCount) * 100) : 0;
  let mcqGrade = 'F';
  let mcqReadiness = 'Need More Practice';

  if (mcqPercent >= 90) {
    mcqGrade = 'A';
    mcqReadiness = 'Excellent';
  } else if (mcqPercent >= 75) {
    mcqGrade = 'B';
    mcqReadiness = 'Good';
  } else if (mcqPercent >= 50) {
    mcqGrade = 'C';
    mcqReadiness = 'Almost Ready';
  }

  const totalScore = Math.round((introGrade.score + mcqPercent) / 2);
  let finalGrade = 'F';
  let readinessStatus = 'Need More Practice';

  if (totalScore >= 85) {
    finalGrade = 'A';
    readinessStatus = 'Excellent';
  } else if (totalScore >= 70) {
    finalGrade = 'B';
    readinessStatus = 'Good';
  } else if (totalScore >= 50) {
    finalGrade = 'C';
    readinessStatus = 'Almost Ready';
  }

  const sessionData = {
    _id: 'mock_int_' + Date.now(),
    date: new Date().toISOString(),
    jobRole,
    introGrade,
    mcqScore: mcqPercent,
    mcqDetails: {
      correct: mcqCorrectCount || 0,
      wrong: (mcqTotalCount - mcqCorrectCount) || 0,
      percentage: mcqPercent,
      grade: mcqGrade,
      readiness: mcqReadiness
    },
    totalScore,
    grade: finalGrade,
    readinessStatus
  };

  const user = getLocalUser(email) || makeMockUser(email, 'User');
  user.interviewHistory.push(sessionData);
  saveLocalUser(email, user);

  return { interview: sessionData, user };
};

export const deleteRole = async (email, roleId) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.delete(`/user/role/${email}/${roleId}`);
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend delete role failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const user = getLocalUser(email);
  if (user) {
    user.roleAnalysisHistory = user.roleAnalysisHistory.filter(role => role._id !== roleId);
    saveLocalUser(email, user);
  }
  return { user };
};

export const deleteInterview = async (email, interviewId) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.delete(`/user/interview/${email}/${interviewId}`);
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend delete interview failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation fallback
  const user = getLocalUser(email);
  if (user) {
    user.interviewHistory = user.interviewHistory.filter(
      int => String(int._id) !== String(interviewId)
    );
    saveLocalUser(email, user);
  }
  return { user };
};

export const clearData = async (email) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.delete(`/user/data/${email}`);
      localStorage.setItem('primeai_session_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      console.warn('Backend clear data failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const user = getLocalUser(email);
  if (user) {
    user.resumeAnalysisHistory = [];
    user.roleAnalysisHistory = [];
    user.interviewHistory = [];
    saveLocalUser(email, user);
  }
  return { user };
};

export const getDashboard = async (email) => {
  await checkBackendOnline();
  if (isServerOnline) {
    try {
      const res = await api.get(`/user/dashboard/${email}`);
      return res.data;
    } catch (err) {
      console.warn('Backend get dashboard failed, falling back to local simulation.', err);
    }
  }

  // Client Simulation
  const user = getLocalUser(email) || makeMockUser(email, 'User');

  let latestResumeScore = 0;
  let latestAtsScore = 0;
  let latestReadinessScore = 0;
  if (user.resumeAnalysisHistory.length > 0) {
    const latestResume = user.resumeAnalysisHistory[user.resumeAnalysisHistory.length - 1];
    latestResumeScore = latestResume.resumeScore;
    latestAtsScore = latestResume.atsScore;
    latestReadinessScore = latestResume.readinessScore;
  }

  let avgInterviewScore = 0;
  if (user.interviewHistory.length > 0) {
    const total = user.interviewHistory.reduce((sum, item) => sum + item.totalScore, 0);
    avgInterviewScore = Math.round(total / user.interviewHistory.length);
  }

  return {
    name: user.name,
    email: user.email,
    resumeCount: user.resumeAnalysisHistory.length,
    interviewCount: user.interviewHistory.length,
    roleAnalysisCount: user.roleAnalysisHistory.length,
    metrics: {
      resumeScore: latestResumeScore,
      atsScore: latestAtsScore,
      careerReadiness: latestReadinessScore,
      interviewScore: avgInterviewScore
    },
    resumeHistory: user.resumeAnalysisHistory,
    roleHistory: user.roleAnalysisHistory,
    interviewHistory: user.interviewHistory
  };
};

export const getMCQs = async (role) => {
  // Use client-side static fetch for seamless questions extraction
  try {
    const res = await api.get(`/mcqs/${encodeURIComponent(role)}`);
    return res.data;
  } catch (err) {
    console.warn('Backend MCQ fetch failed, serving static client list.', err);
  }

  // Client side static return
  const ROLE_MCQ_BANK = {
    "frontend": [
      {
        q: "Which hook should be used to memoize the result of an expensive calculation in React?",
        options: ["useCallback", "useMemo", "useRef", "useEffect"],
        correct: 1,
        explanation: "useMemo returns a memoized value which only recalculates when one of the dependencies has changed."
      },
      {
        q: "What is the difference between custom React hooks and normal helper functions?",
        options: ["Custom hooks can call other hooks", "Helper functions run faster", "Custom hooks must return JSX", "Helper functions cannot take parameters"],
        correct: 0,
        explanation: "A custom hook is a Javascript function whose name starts with 'use' and that may call other React hooks."
      },
      {
        q: "How does React's Virtual DOM improve browser rendering performance?",
        options: ["By directly bypassing the CSSOM tree", "By batching DOM updates and applying only the differences (diffing)", "By compiling components to assembly code", "By storing all images in local cache memory"],
        correct: 1,
        explanation: "React compares the new Virtual DOM with the previous one, computes the minimum diff, and updates only those modified elements."
      },
      {
        q: "What is the purpose of the 'useEffect' dependency array?",
        options: ["It defines which JSX tags will render", "It restricts component imports", "It controls when the hook runs based on variable changes", "It allocates RAM buffer size"],
        correct: 2,
        explanation: "The dependency array controls when the useEffect callback triggers based on parameter changes."
      },
      {
        q: "What type of scoping does 'var' use in Javascript compared to 'let' and 'const'?",
        options: ["Lexical scope", "Function scope", "Block scope", "Global scope only"],
        correct: 1,
        explanation: "Variables declared with 'var' are function-scoped, whereas 'let' and 'const' are block-scoped."
      },
      {
        q: "Which CSS layout method is best optimized for one-dimensional layouts (either a row OR a column)?",
        options: ["CSS Grid", "Absolute Positioning", "Flexbox", "Table Layout"],
        correct: 2,
        explanation: "Flexbox is designed for one-dimensional layouts (a row or a column)."
      },
      {
        q: "What is an HTML semantic element?",
        options: ["A tag that has no styles", "A tag that describes its meaning to both the browser and the developer", "A tag containing animated icons", "A Javascript utility tag"],
        correct: 1,
        explanation: "Semantic elements (like <header>, <article>, and <footer>) clearly describe their meaning to screen readers and developers."
      },
      {
        q: "In Git, what does 'git merge --no-ff' do?",
        options: ["Fast-forwards without checks", "Forces a new commit to be created even if a fast-forward is possible", "Cancels a merge dynamically", "Pushes commits directly to origin main"],
        correct: 1,
        explanation: "The --no-ff flag prevents git merge from executing a fast-forward, ensuring a merge commit is always created."
      },
      {
        q: "What is the primary benefit of Redux Toolkit over vanilla Redux?",
        options: ["It automatically links to MongoDB database", "It eliminates the need for any action creators", "It reduces boilerplate code and includes default middleware like Redux Thunk", "It allows components to bypass state completely"],
        correct: 2,
        explanation: "Redux Toolkit reduces boilerplate and includes standard pre-configurations like Thunk."
      },
      {
        q: "What does the HTTP 403 Forbidden status code mean?",
        options: ["The server has crashed", "The URL path is not found", "The client is unauthenticated", "The client is authenticated but does not have permission to access the resource"],
        correct: 3,
        explanation: "HTTP 403 Forbidden indicates that the server understands the request but refuses to authorize it."
      },
      {
        q: "What is the primary purpose of a JSX key attribute in React lists?",
        options: ["To style elements individually", "To uniquely identify list items so React knows which ones changed, were added, or removed", "To encrypt user data in local states", "To link click handlers automatically"],
        correct: 1,
        explanation: "Keys help React track list item identities so it only updates modified items."
      },
      {
        q: "How does the JS event loop handle asynchronous tasks?",
        options: ["By executing them on separate background CPU cores in parallel", "By queuing them in the Task Queue and executing them after the Call Stack is empty", "By blocking all user scroll interactions", "By using memory virtual paging"],
        correct: 1,
        explanation: "The event loop executes asynchronous callbacks by pushing them onto the stack once the main thread is idle."
      },
      {
        q: "Which CSS property is used to change the stacking order of overlapping HTML elements?",
        options: ["display", "z-index", "position-rank", "float-order"],
        correct: 1,
        explanation: "The z-index property specifies the stack order of elements that have a positioned element setting."
      },
      {
        q: "What is a Promise in JavaScript?",
        options: ["A contract that guarantees code executes synchronously", "An object representing the eventual completion or failure of an asynchronous operation", "A tool to save credentials to localStorage", "A type of recursive function loop"],
        correct: 1,
        explanation: "A Promise represents the eventual completion or failure of an asynchronous operation and its returning value."
      }
    ],
    "backend": [
      {
        q: "What is the role of middleware in an Express.js application?",
        options: ["To query MongoDB databases directly", "Functions that have access to request and response objects, capable of modifying them or ending the cycle", "To compile Javascript into binary", "To manage client-side routes"],
        correct: 1,
        explanation: "Express middleware can execute code, make changes to the request and response objects, and trigger the next step."
      },
      {
        q: "Why should you create an index in MongoDB?",
        options: ["To structure databases into tables", "To improve query execution performance and speed up lookups", "To enforce strict data validation rules", "To compress files on disk"],
        correct: 1,
        explanation: "Indexes store a small portion of the collection's data in an easy-to-traverse form to speed up search lookups."
      },
      {
        q: "In Node.js, what is the 'event loop'?",
        options: ["A multi-threaded CPU parallel loop", "A mechanism that executes non-blocking asynchronous operations by offloading tasks to the system kernel", "A database sync function", "A client-side event handler"],
        correct: 1,
        explanation: "The event loop delegates asynchronous operations to the operating system kernel and manages their call-backs."
      },
      {
        q: "Which standard encryption algorithm is recommended for hashing user passwords in a Node backend?",
        options: ["MD5", "SHA-1", "bcrypt", "Base64"],
        correct: 2,
        explanation: "bcrypt is designed with a slow salt factor to protect passwords against brute-force attacks."
      },
      {
        q: "How does JWT (JSON Web Token) authentication work between client and server?",
        options: ["The server stores the token session in memory", "The server signs a stateless token containing claims, client sends it in the Authorization header", "The server queries the DB on every single socket packet validation", "The client encrypts the database directly"],
        correct: 1,
        explanation: "JWT provides a stateless authentication signature containing payload data that the server verifies without db lookups."
      },
      {
        q: "What is the purpose of the HTTP POST verb in REST APIs?",
        options: ["To retrieve data from a database", "To create a new resource on the server", "To update an existing resource completely", "To delete a resource"],
        correct: 1,
        explanation: "In REST, POST submissions are meant to create new entities or trigger actions."
      },
      {
        q: "Which database design pattern is a key advantage of NoSQL document stores like MongoDB?",
        options: ["Rigid table normalization", "Schemaless/Flexible schema documents", "Required foreign keys constraints", "Built-in server rendering modules"],
        correct: 1,
        explanation: "NoSQL provides structural flexibility, allowing items to have nested parameters without table joins."
      },
      {
        q: "What does CORS stand for, and why is it enforced by browsers?",
        options: ["Cross-Origin Resource Sharing; to protect users by blocking cross-domain API requests unless explicitly authorized", "Central Origin Recovery System", "Client Origin Request Socket", "Cyber Offensive Response Shield"],
        correct: 0,
        explanation: "CORS is a security standard restricting web apps from calling APIs hosted on a different domain than their origin host."
      },
      {
        q: "In Node.js, what is the difference between 'process.nextTick()' and 'setImmediate()'?",
        options: ["setImmediate runs before nextTick", "process.nextTick runs callbacks at the end of the current operation phase, before the event loop continues; setImmediate runs in the next loop tick", "Both are exact aliases", "process.nextTick is client-side only"],
        correct: 1,
        explanation: "nextTick executes on the microtask queue before the event loop continues. setImmediate schedules callbacks to run on the next event loop check."
      },
      {
        q: "How do you handle unhandled exceptions in a Node.js process to prevent server crashes?",
        options: ["Use print statements only", "Listen to the 'uncaughtException' process event and perform a graceful shutdown", "By ignoring database calls", "By using browser try-catch blocks"],
        correct: 1,
        explanation: "Listening to uncaughtException process events helps clean up database connections and restart the app server safely."
      },
      {
        q: "What is a Node.js Stream?",
        options: ["An array of database values", "An abstract interface for working with streaming data chunk-by-chunk without loading all of it in memory", "A WebSocket communication line", "An external styling component"],
        correct: 1,
        explanation: "Streams process files chunk-by-chunk, protecting memory from being overloaded when opening massive files."
      },
      {
        q: "What is the purpose of database indexes?",
        options: ["To restrict data entries", "To speed up query performance by creating structured search trees instead of scanning all collections", "To format output text to uppercase", "To define table relationships"],
        correct: 1,
        explanation: "Indexes speed up data lookup queries by sorting key fields into search trees."
      },
      {
        q: "What HTTP response code should a server return when a request successfully creates a resource?",
        options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
        correct: 1,
        explanation: "HTTP 201 Created signifies that a resource was successfully made on the host server."
      },
      {
        q: "Why is 'body-parser' (or Express built-in express.json()) middleware needed?",
        options: ["To style forms", "To parse incoming request bodies in a middleware before handlers, exposing payload on req.body", "To speed up router caching", "To encrypt API payloads"],
        correct: 1,
        explanation: "express.json() parses raw JSON request payloads and binds them to req.body."
      }
    ]
  };

  const roleName = role.toLowerCase();
  let key = 'frontend';
  if (roleName.includes('backend') || roleName.includes('node')) key = 'backend';
  return ROLE_MCQ_BANK[key] || ROLE_MCQ_BANK['frontend'];
};
export default api;
