require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const UserHistory = require('./models/UserHistory');
const { analyzeResumeAI, matchCareerRoleAI, gradeSelfIntroductionAI, ROLE_MCQ_BANK } = require('./utils/aiEngine');
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

    let text = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text || '';
    } catch (parseErr) {
      console.warn('pdf-parse failed, trying custom stream decompressor:', parseErr);
    }

    if (!text || text.trim().length === 0) {
      text = extractTextFromPDFBuffer(req.file.buffer);
    }

    if (!text || text.trim().length === 0) {
      text = req.file.buffer.toString('utf-8');
    }

    const skillCatalog = [
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'JavaScript', 'TypeScript',
      'React', 'Redux', 'Next.js', 'Node.js', 'Express', 'MongoDB',
      'MySQL', 'PostgreSQL', 'REST API', 'Git', 'GitHub', 'Python', 'Django',
      'Flask', 'Java', 'Spring', 'C++', 'C#', 'SQL', 'Docker', 'AWS'
    ];

    // Check if it has standard resume markings
    const hasSectionHeaders = /skills|technologies|expertise|proficiencies|languages|development|projects|portfolio|applications|work|experience|employment|education/i.test(text);
    
    let matchedSkillsCount = 0;
    skillCatalog.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        matchedSkillsCount++;
      }
    });

    // Accept it if it starts with %PDF- signature and has basic indicators (headers or technical keywords)
    const isPDF = req.file.buffer.toString('utf-8', 0, 5).startsWith('%PDF-');
    
    if (!isPDF) {
      return res.status(400).json({ error: 'Please upload a proper resume file (PDF format).' });
    }

    // Relaxed check: if it is a PDF, and has either section headers or a few matching skill keywords, accept it.
    if (!hasSectionHeaders && matchedSkillsCount < 2) {
      return res.status(400).json({ error: 'Please upload a proper resume file containing Skills or Projects sections.' });
    }

    // Extract skills
    const matchedSkills = [];
    skillCatalog.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        matchedSkills.push(skill);
      }
    });

    // Extract projects
    const matchedProjects = [];
    const lines = text.split(/[\r\n]+/);
    let foundProjSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 4) continue;

      if (/projects|portfolio|applications/i.test(line)) {
        foundProjSection = true;
        continue;
      }

      if (foundProjSection) {
        if (/experience|education|skills|summary|hobbies|languages/i.test(line)) {
          break;
        }

        const parts = line.split(/[:\-–]/);
        if (parts.length >= 2) {
          matchedProjects.push({
            title: parts[0].trim().replace(/[()]/g, '').substring(0, 40),
            description: parts.slice(1).join('-').trim().replace(/[()]/g, '').substring(0, 150)
          });
        } else {
          matchedProjects.push({
            title: 'Project ' + (matchedProjects.length + 1),
            description: line.replace(/[()]/g, '').substring(0, 150)
          });
        }

        if (matchedProjects.length >= 3) break;
      }
    }

    // Strict Validation: Ensure actual skills or projects were found
    if (matchedSkills.length === 0 && matchedProjects.length === 0) {
      return res.status(400).json({ error: 'Please upload a proper resume file containing Skills or Projects sections.' });
    }

    // Extract links
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

    // Extract Education and Experience lines
    const eduLines = lines.filter(l => /bachelor|master|degree|university|college|institute|b\.tech|b\.e|b\.s|b\.c\.a|mca/i.test(l));
    const educationText = eduLines.length > 0 ? eduLines[0].replace(/[()]/g, '').trim().substring(0, 100) : 'Bachelor of Computer Science, State University';

    const expLines = lines.filter(l => /(?:intern|developer|engineer|analyst|manager|months|years|experience)\b/i.test(l) && !/skills|projects|github|linkedin|education|college/i.test(l));
    const experienceText = expLines.length > 0 ? expLines[0].replace(/[()]/g, '').trim().substring(0, 100) : 'Software Development Intern (6 months)';

    res.json({
      skills: matchedSkills.join(', '),
      projects: matchedProjects,
      education: educationText,
      experience: experienceText,
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

// Listen on Port
app.listen(PORT, () => {
  console.log(`PrimeAI backend server running on port ${PORT}`);
});
