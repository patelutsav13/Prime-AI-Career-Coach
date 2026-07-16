require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const UserHistory = require('./models/UserHistory');
const { analyzeResumeAI, matchCareerRoleAI, gradeSelfIntroductionAI, ROLE_MCQ_BANK } = require('./utils/aiEngine');
const Conversation = require('./models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage() });

const hashPassword = (password) => {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
};

const extractTextFromPDFBuffer = (buffer) => {
  let text = '';
  try {
    let pos = 0;
    while (pos < buffer.length) {
      const streamIdx = buffer.indexOf('stream', pos);
      if (streamIdx === -1) break;

      const endStreamIdx = buffer.indexOf('endstream', streamIdx);
      if (endStreamIdx === -1) break;

      let streamStart = streamIdx + 6;
      while (streamStart < endStreamIdx && (buffer[streamStart] === 10 || buffer[streamStart] === 13 || buffer[streamStart] === 32)) {
        streamStart++;
      }

      const streamEnd = endStreamIdx;
      if (streamEnd > streamStart) {
        const compressedData = buffer.slice(streamStart, streamEnd);
        try {
          const decompressed = require('zlib').inflateSync(compressedData);
          text += decompressed.toString('utf-8') + '\n';
        } catch (e) {
          text += compressedData.toString('utf-8') + '\n';
        }
      }
      pos = endStreamIdx + 9;
    }
  } catch (err) {
    console.error('Error in custom PDF parser:', err);
  }
  return text;
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primeai_career_coach';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB successfully connected.'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Ensure MongoDB service is running on your system.');
  });

// API Routes

// 1. Initialize user profile (Legacy Upsert)
app.post('/api/user/init', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    let user = await UserHistory.findOne({ email });
    if (!user) {
      user = new UserHistory({
        email,
        name,
        theme: 'dark',
        dashboardSettings: {}
      });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user/init:', error);
    res.status(500).json({ error: 'Server error initializing user.' });
  }
});

// 1.1 Sign Up Route
app.post('/api/user/signup', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Name, Email and Password are required.' });
    }

    let user = await UserHistory.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email already registered. Please sign in instead.' });
    }

    user = new UserHistory({
      email,
      name,
      password: hashPassword(password),
      theme: 'dark',
      dashboardSettings: {}
    });
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user/signup:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 1.2 Login Route
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not registered. Please sign up first.' });
    }

    if (user.password && user.password !== hashPassword(password)) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /api/user/login:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 1.3 Resume Upload & Extraction Route
app.post('/api/user/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Ensure it is a PDF
    const isPDF = req.file.buffer.toString('utf-8', 0, 5).startsWith('%PDF-');
    if (!isPDF) {
      return res.status(400).json({ error: 'Please upload a proper resume file (PDF format).' });
    }

    // Extract text from PDF
    let text = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text || '';
    } catch (parseErr) {
      console.warn('pdf-parse failed, trying fallback:', parseErr);
    }
    if (!text || text.trim().length === 0) {
      text = extractTextFromPDFBuffer(req.file.buffer);
    }
    if (!text || text.trim().length === 0) {
      text = req.file.buffer.toString('utf-8');
    }

    // ============================================================
    // SECTION-BASED PARSER
    // ============================================================
    const rawLines = text.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0);

    // Section header patterns
    const SECTION_PATTERNS = {
      skills:       /^(technical\s+)?skills[:\s]*$/i,
      projects:     /^(technical\s+)?projects?[:\s]*$|^portfolio[:\s]*$|^applications?[:\s]*$/i,
      experience:   /^(work\s+)?experience[:\s]*$|^employment[:\s]*$/i,
      education:    /^education[:\s]*$|^academic[:\s]*$/i,
      certificates: /^certifications?[:\s]*$|^certificates?[:\s]*$|^achievements?[:\s]*$/i,
    };

    const isSectionHeader = (line) => Object.values(SECTION_PATTERNS).some(p => p.test(line));

    const extractSection = (pattern) => {
      let capturing = false;
      const content = [];
      for (const line of rawLines) {
        if (pattern.test(line)) { capturing = true; continue; }
        if (capturing) {
          if (isSectionHeader(line)) break;
          content.push(line);
        }
      }
      return content;
    };

    // ---- SKILL CATALOG ----
    const skillCatalog = [
      'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'JavaScript', 'TypeScript',
      'React', 'Redux', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
      'Node.js', 'Express.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL',
      'REST API', 'GraphQL', 'Git', 'GitHub', 'GitLab',
      'Python', 'Django', 'Flask', 'FastAPI',
      'Java', 'Spring Boot', 'C++', 'C#', 'Kotlin', 'Swift',
      'SQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Firebase',
      'JWT', 'OAuth', 'Linux', 'NPM', 'Postman', 'VS Code', 'Figma',
      'Sass', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch',
      'Power BI', 'Excel', 'Redis', 'CI/CD', 'Nginx', 'WebSockets', 'Tailwind'
    ];

    // ---- EXTRACT SKILLS ----
    const skillSectionLines = extractSection(SECTION_PATTERNS.skills);
    const skillScanText = skillSectionLines.length > 2 ? skillSectionLines.join(' ') : text;
    const matchedSkills = [];
    skillCatalog.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(skillScanText) && !matchedSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        matchedSkills.push(skill);
      }
    });

    // ---- EXTRACT PROJECTS ----
    const projectLines = extractSection(SECTION_PATTERNS.projects);
    const matchedProjects = [];
    for (let i = 0; i < projectLines.length && matchedProjects.length < 5; i++) {
      const line = projectLines[i];
      if (line.length < 4) continue;
      const isTechLine = /^[\w\s.+#,\/\-]+$/.test(line) && line.split(',').length >= 2 && line.length < 80;
      const looksLikeTitle = line.length >= 5 && line.length <= 100 && !isTechLine && !/^[-•*→▶\d]/.test(line);
      if (looksLikeTitle) {
        const descParts = [];
        for (let j = i + 1; j < Math.min(i + 5, projectLines.length); j++) {
          const next = projectLines[j];
          if (next.length > 25 && !/^[\w\s.+#,\/\-]+$/.test(next)) {
            descParts.push(next);
          } else break;
        }
        matchedProjects.push({
          title: line.replace(/[()[\]]/g, '').substring(0, 60),
          description: descParts.join(' ').substring(0, 200) || ''
        });
      }
    }
    // Fallback for projects
    if (matchedProjects.length === 0) {
      rawLines.filter(l => l.length > 8 && l.length < 70 && /project|app|system|platform|tool|website|portal|dashboard/i.test(l))
        .slice(0, 3).forEach(title => matchedProjects.push({ title: title.substring(0, 60), description: '' }));
    }

    // ---- EXTRACT EXPERIENCE ----
    const expSectionLines = extractSection(SECTION_PATTERNS.experience);
    const experienceText = expSectionLines.length > 0
      ? expSectionLines.slice(0, 4).join(' | ').trim().substring(0, 300)
      : rawLines.filter(l => /intern|developer|engineer|analyst|manager/i.test(l) && !/skills|projects|education/i.test(l))
               .slice(0, 1).join('').substring(0, 200);

    // ---- EXTRACT EDUCATION ----
    const eduSectionLines = extractSection(SECTION_PATTERNS.education);
    const educationText = eduSectionLines.length > 0
      ? eduSectionLines.slice(0, 3).join(' | ').trim().substring(0, 250)
      : rawLines.filter(l => /bachelor|master|b\.tech|b\.e|bca|mca|degree|university|college|institute/i.test(l))
               .slice(0, 1).join('').substring(0, 200);

    // ---- EXTRACT CERTIFICATES ----
    const certSectionLines = extractSection(SECTION_PATTERNS.certificates);
    const certificates = certSectionLines.filter(l => l.length > 3).slice(0, 5).join(', ').substring(0, 400);

    // ---- EXTRACT LINKS ----
    const githubMatch = text.match(/github\.com\/[A-Za-z0-9_\-\/\.]+/i);
    const githubUrl = githubMatch ? 'https://' + githubMatch[0].replace(/[()]/g, '').replace(/\/$/, '') : '';

    const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_\-\/\.]+/i);
    const linkedinUrl = linkedinMatch ? 'https://' + linkedinMatch[0].replace(/[()]/g, '').replace(/\/$/, '') : '';

    const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-]*)*)/gi) || [];
    let portfolioUrl = '';
    for (const url of urlMatches) {
      if (!/github|linkedin|google|facebook|twitter|instagram|youtube|localhost|microsoft|w3schools/i.test(url)) {
        portfolioUrl = url.startsWith('http') ? url : 'https://' + url;
        break;
      }
    }

    // Validation: Must have at least skills OR projects
    if (matchedSkills.length === 0 && matchedProjects.length === 0) {
      return res.status(400).json({ error: 'Could not extract Skills or Projects from your resume. Please check that your PDF has clearly labeled sections.' });
    }

    res.json({
      skills: matchedSkills.join(', '),
      projects: matchedProjects,
      education: educationText,
      experience: experienceText,
      certificates: certificates,
      github: githubUrl,
      linkedin: linkedinUrl,
      portfolio: portfolioUrl
    });

  } catch (error) {
    console.error('Error parsing resume PDF:', error);
    res.status(500).json({ error: 'Failed to parse resume file on the server.' });
  }
});

// 2. Perform Resume AI Analysis
app.post('/api/user/resume-analyze', async (req, res) => {
  try {
    const { email, fileName, skills, projects, experience, education } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'User email is required.' });
    }

    // Call rule-based analyzer
    const analysis = analyzeResumeAI(skills || [], projects || [], experience || '', education || '');
    analysis.fileName = fileName || 'Manual Entry';

    analysis.skills = skills || [];
    analysis.projects = projects || [];

    const user = await UserHistory.findOneAndUpdate(
      { email },
      { 
        $push: { resumeAnalysisHistory: analysis },
        $set: {
          skills: skills || [],
          projects: projects || [],
          experience: experience || '',
          education: education || ''
        }
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Resume analyzed successfully', analysis, user });
  } catch (error) {
    console.error('Error in /api/user/resume-analyze:', error);
    res.status(500).json({ error: 'Server error analyzing resume.' });
  }
});

// 3. Match Job Role & Create Roadmap
app.post('/api/user/career-match', async (req, res) => {
  try {
    const { email, jobRole, skills } = req.body;
    if (!email || !jobRole) {
      return res.status(400).json({ error: 'Email and job role are required.' });
    }

    // Calculate match & generate learning roadmap
    const matchResults = matchCareerRoleAI(skills || [], jobRole);
    matchResults.jobRole = jobRole;

    const user = await UserHistory.findOneAndUpdate(
      { email },
      { $push: { roleAnalysisHistory: matchResults } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Career matching complete', data: matchResults, user });
  } catch (error) {
    console.error('Error in /api/user/career-match:', error);
    res.status(500).json({ error: 'Server error matching career role.' });
  }
});

// 4. Save and grade mock interview
app.post('/api/user/interview-submit', async (req, res) => {
  try {
    const { email, jobRole, introAnswer, mcqCorrectCount, mcqTotalCount } = req.body;
    if (!email || !jobRole) {
      return res.status(400).json({ error: 'Email and job role are required.' });
    }

    // Grade self-introduction
    const introGrade = gradeSelfIntroductionAI(introAnswer || '');

    // Grade MCQs
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

    // Calculate aggregate score
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

    const user = await UserHistory.findOneAndUpdate(
      { email },
      { $push: { interviewHistory: sessionData } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Interview graded successfully', data: sessionData, user });
  } catch (error) {
    console.error('Error in /api/user/interview-submit:', error);
    res.status(500).json({ error: 'Server error submitting interview.' });
  }
});

// 5. Delete specific role analysis card
app.delete('/api/user/role/:email/:roleId', async (req, res) => {
  try {
    const { email, roleId } = req.params;
    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Filter out the specific role card
    user.roleAnalysisHistory = user.roleAnalysisHistory.filter(role => role._id.toString() !== roleId);
    await user.save();

    res.json({ message: 'Role card deleted successfully', user });
  } catch (error) {
    console.error('Error deleting role analysis:', error);
    res.status(500).json({ error: 'Server error deleting role card.' });
  }
});

// 5.5 Delete specific interview session card
app.delete('/api/user/interview/:email/:interviewId', async (req, res) => {
  try {
    const { email, interviewId } = req.params;
    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Filter out the specific interview card
    user.interviewHistory = user.interviewHistory.filter(int => int._id.toString() !== interviewId);
    await user.save();

    res.json({ message: 'Interview card deleted successfully', user });
  } catch (error) {
    console.error('Error deleting interview session:', error);
    res.status(500).json({ error: 'Server error deleting interview card.' });
  }
});

// 6. Delete all user profile data
app.delete('/api/user/data/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Clear histories
    user.resumeAnalysisHistory = [];
    user.roleAnalysisHistory = [];
    user.interviewHistory = [];
    await user.save();

    res.json({ message: 'User history cleared successfully', user });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Server error resetting account data.' });
  }
});

// 7. Get user stats & dashboard insights
app.get('/api/user/dashboard/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Calculate aggregate scores for key metrics
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

    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error fetching statistics.' });
  }
});

// 7.5 Fetch full user data profile
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserHistory.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

// 8. Fetch MCQs list by career role track
app.get('/api/mcqs/:role', (req, res) => {
  const roleName = req.params.role.toLowerCase();
  
  // Maps standard query params to question bank keys
  let targetKey = 'frontend';
  if (roleName.includes('backend') || roleName.includes('node')) {
    targetKey = 'backend';
  } else if (roleName.includes('full stack')) {
    targetKey = 'full stack';
  } else if (roleName.includes('python')) {
    targetKey = 'python';
  } else if (roleName.includes('data analyst') || roleName.includes('analyst')) {
    targetKey = 'data analyst';
  } else if (roleName.includes('machine learning') || roleName.includes('ml')) {
    targetKey = 'machine learning';
  } else if (roleName.includes('ai engineer') || roleName.includes('artificial')) {
    targetKey = 'ai engineer';
  } else if (roleName.includes('cloud') || roleName.includes('devops')) {
    targetKey = 'cloud engineer';
  }
  
  const questions = ROLE_MCQ_BANK[targetKey];
  if (!questions) {
    return res.status(404).json({ error: `No MCQ bank found for role: ${roleName}` });
  }
  
  res.json(questions);
});

// =============================================
// PRIMEAI COACH - AI CHAT ASSISTANT ROUTES
// =============================================

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const COACH_SYSTEM_PROMPT = `You are PrimeAI Coach, an expert AI career mentor built into the PrimeAI Career Coach platform. You specialize in:
- Resume Analysis & ATS Optimization
- Career Guidance & Learning Roadmaps
- Interview Preparation & Mock Coaching
- Frontend Development (React, HTML, CSS, JavaScript, TypeScript)
- Backend Development (Node.js, Express.js, MongoDB, REST APIs)
- Python, Machine Learning, Artificial Intelligence
- Data Structures, Algorithms, SQL
- Git, Cloud Computing, DevOps
- Software Engineering Best Practices

Rules:
1. Always be helpful, encouraging, and professional.
2. Provide specific, actionable advice with code examples when relevant.
3. Use markdown formatting: **bold**, *italic*, code blocks with language tags, bullet points.
4. If the user shares resume data, analyze it thoroughly and give personalized feedback.
5. Remember the entire conversation context and refer back to previous messages naturally.
6. When suggesting learning paths, break them into weekly plans.
7. For interview prep, provide realistic questions with model answers.
8. Keep responses concise but comprehensive. Use structured formatting.
9. If you don't know something, say so honestly rather than making things up.`;

const generateFallbackResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! I'm PrimeAI Coach. I noticed we're currently experiencing high API traffic (Quota Exceeded). However, I'm still here to help you locally! What career or technical questions do you have today?";
  }
  if (lowerMsg.includes('resume')) {
    return "Based on your resume, I'd suggest focusing on highlighting quantifiable achievements (e.g., 'Increased performance by X%'). Make sure to tailor your skills section to the specific job descriptions you're targeting. (Note: This is a local fallback response due to API quota limits).";
  }
  if (lowerMsg.includes('interview')) {
    return "For interview preparation, the STAR method (Situation, Task, Action, Result) is highly effective. Let's practice! Tell me about a time you overcame a difficult challenge at work. (Note: Local fallback response).";
  }
  if (lowerMsg.includes('react') || lowerMsg.includes('frontend')) {
    return "For frontend development, especially with React, focus on understanding component lifecycle, state management (hooks like useState, useEffect), and performance optimization. Building projects is the best way to learn! (Note: Local fallback response).";
  }
  
  return "I understand you're asking about '" + message.substring(0, 30) + "...'. Currently, my primary AI brain is hitting a Google API rate limit (Quota 0). Until the limit resets, I can provide basic guidance on resumes, interviews, or frontend development if you ask about those topics!";
};

const generateCoachTitle = async (userMessage) => {
  if (!genAI) return userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(`Generate a very short title (max 6 words, no quotes, no punctuation at end) for a conversation that starts with this message: "${userMessage.substring(0, 200)}"`);
    const title = result.response.text().trim().replace(/["']/g, '');
    return title.substring(0, 60) || 'New Conversation';
  } catch (err) {
    console.warn("Title generation failed, using fallback.");
    return 'Chat: ' + userMessage.substring(0, 20) + '...';
  }
};

// 1. Send message to PrimeAI Coach
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { email, conversationId, message, resumeContext } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to backend/.env file.' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }
    } else {
      conversation = new Conversation({ email, title: 'New Conversation', messages: [] });
    }

    // Add user message
    conversation.messages.push({ role: 'user', text: message, timestamp: new Date() });

    // Build conversation history for Gemini
    let systemPrompt = COACH_SYSTEM_PROMPT;
    if (resumeContext) {
      systemPrompt += `\n\nThe user has the following resume data on file:\n${JSON.stringify(resumeContext, null, 2)}\nUse this context when they ask about their resume, skills, career fit, or job readiness.`;
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
      systemInstruction: systemPrompt
    });

    // Build history array for multi-turn
    const chatHistory = conversation.messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    let aiText = '';
    try {
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      aiText = result.response.text();
    } catch (apiError) {
      console.warn("Gemini API Error, using fallback response.", apiError.message);
      aiText = generateFallbackResponse(message);
    }

    // Add AI response
    conversation.messages.push({ role: 'model', text: aiText, timestamp: new Date() });

    // Auto-generate title from first message
    if (conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = await generateCoachTitle(message);
    }

    await conversation.save();
    res.json({ conversation, aiResponse: aiText });
  } catch (error) {
    console.error('Error in /api/coach/chat:', error);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

// 2. Get all conversations for a user
app.get('/api/coach/conversations/:email', async (req, res) => {
  try {
    const conversations = await Conversation.find(
      { email: req.params.email },
      { title: 1, createdAt: 1, updatedAt: 1, 'messages': { $slice: -1 } }
    ).sort({ updatedAt: -1 });

    const summaries = conversations.map(c => ({
      _id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messages?.length || 0,
      lastMessage: c.messages?.[0]?.text?.substring(0, 80) || ''
    }));
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Server error fetching conversations.' });
  }
});

// 3. Get full conversation by ID
app.get('/api/coach/conversation/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Server error fetching conversation.' });
  }
});

// 4. Create new conversation
app.post('/api/coach/conversation', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const conversation = new Conversation({ email, title: 'New Conversation', messages: [] });
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Server error creating conversation.' });
  }
});

// 5. Rename conversation
app.put('/api/coach/conversation/:id/rename', async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { title: title || 'Untitled' },
      { new: true }
    );
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    res.json(conversation);
  } catch (error) {
    console.error('Error renaming conversation:', error);
    res.status(500).json({ error: 'Server error renaming conversation.' });
  }
});

// 6. Delete conversation
app.delete('/api/coach/conversation/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Server error deleting conversation.' });
  }
});

// 7. Clear all conversations for a user
app.delete('/api/coach/conversations/:email', async (req, res) => {
  try {
    await Conversation.deleteMany({ email: req.params.email });
    res.json({ message: 'All conversations cleared.' });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({ error: 'Server error clearing conversations.' });
  }
});

// 8. Regenerate last AI response
app.post('/api/coach/regenerate', async (req, res) => {
  try {
    const { conversationId, email, resumeContext } = req.body;
    if (!conversationId || !email) {
      return res.status(400).json({ error: 'Conversation ID and email are required.' });
    }
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API key not configured.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    // Remove last model message
    if (conversation.messages.length > 0 && conversation.messages[conversation.messages.length - 1].role === 'model') {
      conversation.messages.pop();
    }

    // Find last user message to regenerate from
    const lastUserMsg = [...conversation.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return res.status(400).json({ error: 'No user message to regenerate from.' });

    let systemPrompt = COACH_SYSTEM_PROMPT;
    if (resumeContext) {
      systemPrompt += `\n\nThe user has the following resume data on file:\n${JSON.stringify(resumeContext, null, 2)}`;
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
      systemInstruction: systemPrompt
    });

    const chatHistory = conversation.messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    let aiText = '';
    try {
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(lastUserMsg.text);
      aiText = result.response.text();
    } catch (apiError) {
      console.warn("Gemini API Error in regenerate, using fallback response.", apiError.message);
      aiText = generateFallbackResponse(lastUserMsg.text);
    }

    conversation.messages.push({ role: 'model', text: aiText, timestamp: new Date() });
    await conversation.save();

    res.json({ conversation, aiResponse: aiText });
  } catch (error) {
    console.error('Error regenerating response:', error);
    res.status(500).json({ error: 'Failed to regenerate AI response.' });
  }
});

// 9. Like/Dislike a message
app.put('/api/coach/message/:conversationId/:messageIndex/react', async (req, res) => {
  try {
    const { conversationId, messageIndex } = req.params;
    const { reaction } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    const idx = parseInt(messageIndex);
    if (idx < 0 || idx >= conversation.messages.length) {
      return res.status(400).json({ error: 'Invalid message index.' });
    }

    conversation.messages[idx].liked = reaction;
    await conversation.save();

    res.json({ message: 'Reaction saved.', conversation });
  } catch (error) {
    console.error('Error reacting to message:', error);
    res.status(500).json({ error: 'Server error saving reaction.' });
  }
});

// Listen on Port
app.listen(PORT, () => {
  console.log(`PrimeAI backend server running on port ${PORT}`);
});
