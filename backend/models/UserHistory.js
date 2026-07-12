const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  fileName: { type: String, default: 'Manual Entry' },
  resumeScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  skills: [String],
  projects: [{
    title: String,
    description: String
  }],
  improvementSuggestions: [String],
  missingSkills: [String],
  recommendedCertifications: [String],
  recommendedTechnologies: [String]
});

const RoleAnalysisSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  jobRole: { type: String, required: true },
  eligibilityScore: { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  recommendedSkills: [String],
  readinessStatus: { type: String, default: 'Not Ready' },
  roadmap: [{
    week: String,
    topic: String,
    subtopics: [String],
    tutorials: [{
      title: String,
      url: String,
      type: { type: String, enum: ['youtube', 'documentation', 'article'], default: 'documentation' }
    }]
  }]
});

const InterviewHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  jobRole: { type: String, required: true },
  introGrade: {
    score: { type: Number, default: 0 },
    confidence: { type: String, default: 'Needs Improvement' },
    communication: { type: String, default: 'Needs Improvement' },
    structure: { type: String, default: 'Needs Improvement' },
    professionalism: { type: String, default: 'Needs Improvement' },
    feedback: { type: String, default: '' },
    idealFormat: { type: String, default: '' }
  },
  mcqScore: { type: Number, default: 0 },
  mcqDetails: {
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    readiness: { type: String, default: 'Need More Practice' }
  },
  totalScore: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  readinessStatus: { type: String, default: 'Need More Practice' }
});

const UserHistorySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  password: { type: String, required: false }, // Optional schema-wise to preserve existing DB rows, validated in endpoints
  loginStatus: { type: Boolean, default: true },
  theme: { type: String, default: 'dark' },
  skills: [String],
  projects: [{
    title: String,
    description: String
  }],
  experience: { type: String, default: '' },
  education: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  dashboardSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  resumeAnalysisHistory: [ResumeAnalysisSchema],
  roleAnalysisHistory: [RoleAnalysisSchema],
  interviewHistory: [InterviewHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('UserHistory', UserHistorySchema);
