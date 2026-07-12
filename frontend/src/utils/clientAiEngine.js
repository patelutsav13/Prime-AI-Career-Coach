/**
 * Client-side Mirror of the AI Rules Engine for offline fallback operations.
 * Implements the exact same rules for resume, role match, and interview self-intro.
 */

const ROLE_SKILL_REQUIREMENTS = {
  "frontend developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "redux", "next.js", "git", "github", "rest api"
  ],
  "react developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "redux", "next.js", "git", "github", "rest api"
  ],
  "backend developer": [
    "javascript", "typescript", "node.js", "express.js", "mongodb",
    "mysql", "postgresql", "rest api", "git", "github", "jwt", "authentication"
  ],
  "node developer": [
    "javascript", "typescript", "node.js", "express.js", "mongodb",
    "rest api", "git", "github", "jwt", "authentication"
  ],
  "full stack developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "node.js", "express.js", "mongodb", "rest api",
    "git", "github", "jwt", "authentication", "django"
  ],
  "python developer": [
    "python", "django", "flask", "postgresql", "git", "github",
    "rest api", "numpy", "pandas", "java", "c++"
  ],
  "data analyst": [
    "python", "pandas", "numpy", "power bi", "excel", "sql",
    "postgresql", "mysql", "git"
  ],
  "machine learning engineer": [
    "python", "numpy", "pandas", "scikit learn", "tensorflow",
    "pytorch", "git", "github", "sql"
  ],
  "ai engineer": [
    "python", "numpy", "pandas", "scikit learn", "tensorflow",
    "pytorch", "git", "github", "rest api"
  ],
  "software engineer": [
    "java", "c++", "python", "javascript", "git", "github",
    "rest api", "sql", "docker"
  ],
  "cloud engineer": [
    "docker", "aws", "git", "github", "rest api", "docker", "sql"
  ],
  "devops engineer": [
    "docker", "aws", "git", "github", "rest api", "docker", "sql"
  ],
  "cyber security": [
    "python", "git", "github", "authentication", "jwt"
  ]
};

const SKILL_TUTORIALS = {
  "html": { title: "HTML Crash Course", url: "https://www.w3schools.com/html/", type: "documentation" },
  "css": { title: "CSS Layouts Guide", url: "https://css-tricks.com/", type: "article" },
  "tailwind css": { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "documentation" },
  "javascript": { title: "JavaScript Info", url: "https://javascript.info/", type: "documentation" },
  "typescript": { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "documentation" },
  "react": { title: "React Dev Documentation", url: "https://react.dev/", type: "documentation" },
  "redux": { title: "Redux Toolkit Tutorial", url: "https://redux-toolkit.js.org/", type: "documentation" },
  "next.js": { title: "Next.js Learning Course", url: "https://nextjs.org/learn", type: "documentation" },
  "node.js": { title: "Node.js Guide", url: "https://nodejs.org/en/docs", type: "documentation" },
  "express.js": { title: "Express.js Routing Guide", url: "https://expressjs.com/", type: "documentation" },
  "mongodb": { title: "MongoDB University", url: "https://learn.mongodb.com/", type: "documentation" },
  "mysql": { title: "MySQL Tutorial", url: "https://www.mysqltutorial.org/", type: "documentation" },
  "postgresql": { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "documentation" },
  "rest api": { title: "RESTful API Tutorial", url: "https://restfulapi.net/", type: "article" },
  "git": { title: "Git Flight Manual", url: "https://github.com/k88hudson/git-flight-manual", type: "article" },
  "github": { title: "GitHub Hello World", url: "https://docs.github.com/en/get-started", type: "documentation" },
  "python": { title: "Python For Beginners", url: "https://docs.python.org/3/tutorial/", type: "documentation" },
  "java": { title: "Java Programming Basics", url: "https://dev.java/learn/", type: "documentation" },
  "c++": { title: "C++ Documentation", url: "https://en.cppreference.com/", type: "documentation" },
  "pandas": { title: "Pandas Getting Started", url: "https://pandas.pydata.org/docs/", type: "documentation" },
  "numpy": { title: "NumPy Quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "documentation" },
  "scikit learn": { title: "Scikit-Learn ML Tutorial", url: "https://scikit-learn.org/stable/tutorial/", type: "documentation" },
  "tensorflow": { title: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials", type: "documentation" },
  "pytorch": { title: "PyTorch Basics", url: "https://pytorch.org/tutorials/", type: "documentation" },
  "power bi": { title: "Power BI Learning Path", url: "https://learn.microsoft.com/en-us/power-bi/", type: "documentation" },
  "excel": { title: "Excel Advanced Formulas", url: "https://exceljet.net/", type: "article" },
  "sql": { title: "SQL Zoo Interactive Exercises", url: "https://sqlzoo.net/", type: "article" },
  "docker": { title: "Docker Curriculum", url: "https://docker-curriculum.com/", type: "article" },
  "aws": { title: "AWS Getting Started", url: "https://aws.amazon.com/getting-started/", type: "documentation" },
  "firebase": { title: "Firebase Fundamentals", url: "https://firebase.google.com/docs", type: "documentation" },
  "jwt": { title: "JWT.io Introduction", url: "https://jwt.io/introduction", type: "article" },
  "authentication": { title: "Web Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/", type: "article" },
  "django": { title: "Django Web Framework Docs", url: "https://docs.djangoproject.com/en/stable/", type: "documentation" }
};

export function clientAnalyzeResumeAI(skillsInput = [], projectsInput = [], experienceInput = "", educationInput = "") {
  let score = 50;
  let ats = 45;
  let readiness = 40;

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  const skills = skillsInput.map(s => s.toLowerCase().trim());
  const projects = projectsInput || [];
  
  if (skills.length > 0) {
    score += Math.min(skills.length * 3, 24);
    ats += Math.min(skills.length * 3, 20);
    readiness += Math.min(skills.length * 3, 20);
    strengths.push(`Detected a solid set of ${skills.length} technical skills.`);
  } else {
    weaknesses.push("No core technical skills were identified.");
    suggestions.push("Add a dedicated 'Skills' section listing tools, languages, and frameworks.");
  }

  if (projects.length >= 2) {
    score += 15;
    ats += 15;
    readiness += 15;
    strengths.push(`Strong portfolio with ${projects.length} detailed projects.`);
  } else if (projects.length === 1) {
    score += 8;
    ats += 8;
    readiness += 8;
    strengths.push("Has at least one project detailed in the profile.");
    weaknesses.push("Single project profile. Employers look for multiple project demonstrations.");
    suggestions.push("Add at least one more project showing a different tech stack.");
  } else {
    weaknesses.push("No projects are listed in the resume.");
    suggestions.push("Incorporate detailed projects describing your role, tech stack, and measurable impact.");
  }

  let descriptiveProjects = 0;
  projects.forEach(p => {
    if (p.description && p.description.length > 50) {
      descriptiveProjects++;
    }
  });
  if (descriptiveProjects > 0) {
    score += 5;
    ats += 5;
  }

  if (experienceInput && experienceInput.trim().length > 10) {
    score += 10;
    ats += 15;
    readiness += 15;
    strengths.push("Professional experience or internship experience is listed.");
  } else {
    weaknesses.push("No work experience or internship history detected.");
    suggestions.push("Include any freelance work, college leadership roles, or internships to demonstrate real-world team context.");
  }

  if (educationInput && educationInput.trim().length > 5) {
    score += 6;
    ats += 5;
    strengths.push("Education credentials listed.");
  } else {
    weaknesses.push("No education history was provided.");
    suggestions.push("Specify your degree, college, major, and graduation year.");
  }

  const hasGit = skills.includes("git") || skills.includes("github");
  const hasDb = skills.includes("mongodb") || skills.includes("mysql") || skills.includes("postgresql") || skills.includes("sql");

  if (hasGit) {
    score += 5;
    ats += 5;
  } else {
    weaknesses.push("Version control (Git/GitHub) is missing.");
    suggestions.push("Learn Git command basics and highlight your GitHub repository profile link.");
  }

  if (hasDb) score += 5;

  score = Math.min(score, 100);
  ats = Math.min(ats, 100);
  readiness = Math.min(readiness, 100);

  const recommendedCertifications = [];
  const recommendedTechnologies = [];

  if (skills.includes("react") || skills.includes("javascript")) {
    recommendedCertifications.push("Meta Front-End Developer Certificate", "freeCodeCamp Responsive Web Design");
    recommendedTechnologies.push("TypeScript", "Next.js", "Redux Toolkit");
  } else if (skills.includes("python") || skills.includes("tensorflow")) {
    recommendedCertifications.push("Google Professional Machine Learning Engineer", "DeepLearning.AI TensorFlow Developer");
    recommendedTechnologies.push("Scikit-Learn", "FastAPI", "Pandas");
  } else {
    recommendedCertifications.push("CompTIA Security+", "AWS Cloud Practitioner");
    recommendedTechnologies.push("Python", "Git", "SQL");
  }

  const missingSkills = [];
  const allCoreTech = ["git", "github", "react", "node.js", "mongodb", "sql", "javascript", "tailwind css", "docker", "aws"];
  allCoreTech.forEach(tech => {
    if (!skills.includes(tech)) {
      missingSkills.push(tech.toUpperCase());
    }
  });

  return {
    resumeScore: score,
    atsScore: ats,
    readinessScore: readiness,
    strengths,
    weaknesses: weaknesses.slice(0, 4),
    improvementSuggestions: suggestions.slice(0, 4),
    missingSkills: missingSkills.slice(0, 5),
    recommendedCertifications,
    recommendedTechnologies
  };
}

export function clientMatchCareerRoleAI(userSkills = [], selectedRole = "") {
  const role = selectedRole.toLowerCase().trim();
  const requirements = ROLE_SKILL_REQUIREMENTS[role] || ["git", "python", "javascript", "sql"];
  const formattedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  
  const matchedSkills = [];
  const missingSkills = [];

  requirements.forEach(req => {
    if (formattedUserSkills.includes(req)) {
      matchedSkills.push(req.toUpperCase());
    } else {
      missingSkills.push(req.toUpperCase());
    }
  });

  const matchedCount = matchedSkills.length;
  const totalRequired = requirements.length;
  const rawPct = totalRequired > 0 ? (matchedCount / totalRequired) * 100 : 50;
  
  let eligibilityScore = Math.round(rawPct);
  let readinessStatus = "Not Ready";
  
  if (eligibilityScore >= 85) {
    readinessStatus = "Interview Ready";
  } else if (eligibilityScore >= 50) {
    readinessStatus = "Almost Ready";
  }

  const recommendedSkills = [];
  if (role.includes("frontend") || role.includes("react")) {
    recommendedSkills.push("TYPESCRIPT", "NEXT.JS", "FESTIVAL TESTING");
  } else if (role.includes("backend") || role.includes("node")) {
    recommendedSkills.push("REDIS", "DOCKER", "GRAPHQL");
  } else {
    recommendedSkills.push("DOCKER", "AWS", "LINUX");
  }

  const roadmap = [];
  let weekIndex = 1;

  missingSkills.forEach(skillName => {
    const sKey = skillName.toLowerCase();
    const tutorial = SKILL_TUTORIALS[sKey] || {
      title: `${skillName} Complete Guide`,
      url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " tutorial documentation")}`,
      type: "documentation"
    };

    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: skillName,
      subtopics: [
        `Introduction to ${skillName} syntax and core architecture.`,
        `Building standard layout projects or scripts using ${skillName}.`,
        `Understanding performance optimization and deployment with ${skillName}.`
      ],
      tutorials: [
        tutorial,
        {
          title: `YouTube Search: Learn ${skillName}`,
          url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(sKey)}+for+beginners`,
          type: "youtube"
        }
      ]
    });
    weekIndex++;
  });

  if (roadmap.length < 3) {
    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: "System Architecture & Integration",
      subtopics: ["Design patterns", "API optimization", "Caching layers"],
      tutorials: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "documentation" }]
    });
    weekIndex++;
    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: "Portfolio Building & Mock Interviews",
      subtopics: ["Deploying final portfolio", "Completing sample resumes"],
      tutorials: [{ title: "Mock Interview Practice", url: "https://react.dev/", type: "documentation" }]
    });
  }

  return {
    eligibilityScore,
    matchedSkills,
    missingSkills,
    recommendedSkills,
    readinessStatus,
    roadmap
  };
}

export function clientGradeSelfIntroductionAI(introText = "") {
  const text = introText.toLowerCase();
  let score = 40;
  
  const checks = {
    name: false,
    education: false,
    skills: false,
    projects: false,
    goals: false,
    closing: false
  };

  if (text.includes("i am") || text.includes("my name is") || text.includes("myself") || text.includes("this is")) {
    checks.name = true;
    score += 10;
  }
  if (text.includes("university") || text.includes("college") || text.includes("degree") || text.includes("graduated") || text.includes("studying") || text.includes("btech") || text.includes("engineering")) {
    checks.education = true;
    score += 10;
  }
  if (text.includes("skilled in") || text.includes("proficient") || text.includes("know") || text.includes("react") || text.includes("javascript") || text.includes("python") || text.includes("node") || text.includes("developer")) {
    checks.skills = true;
    score += 10;
  }
  if (text.includes("project") || text.includes("built") || text.includes("created") || text.includes("developed") || text.includes("worked on") || text.includes("github")) {
    checks.projects = true;
    score += 10;
  }
  if (text.includes("goal") || text.includes("career") || text.includes("aspiring") || text.includes("looking for")) {
    checks.goals = true;
    score += 10;
  }
  if (text.includes("thank you") || text.includes("that is all") || text.includes("pleasure")) {
    checks.closing = true;
    score += 10;
  }

  let rating = "Needs Improvement";
  let feedback = "";

  if (score >= 90) {
    rating = "Excellent";
    feedback = "Fantastic introduction! You addressed your background, education, technical skills, projects, and goals in a professional structure.";
  } else if (score >= 70) {
    rating = "Good";
    feedback = "Great start. Try to make your summary flow more naturally and ensure you explicitly describe the business value of your projects.";
  } else if (score >= 50) {
    rating = "Almost Ready";
    feedback = "Decent overview. You missed critical sections like your technical project details or clear career goals. Expand these parts.";
  } else {
    rating = "Needs Improvement";
    feedback = "Your introduction is too short or unstructured. A professional introduction should cover your name, education, core skills, projects, and closing statement.";
  }

  const idealFormat = `1. Name & Headline (e.g. "I am [Name], a passionate Full Stack Developer...")
2. Education & Credentials (e.g. "I recently completed my degree in Computer Science at [University]...")
3. Technical Skills (e.g. "I specialize in React, Node.js, and MongoDB...")
4. Core Projects (e.g. "One of my key achievements was building an AI tool...")
5. Career Goal (e.g. "I am seeking a junior role...")
6. Professional Closing (e.g. "Thank you for this opportunity.")`;

  return {
    score,
    confidence: score >= 80 ? "Excellent" : (score >= 60 ? "Good" : "Needs Improvement"),
    communication: score >= 85 ? "Excellent" : (score >= 65 ? "Good" : "Needs Improvement"),
    structure: score >= 90 ? "Excellent" : (score >= 70 ? "Good" : "Needs Improvement"),
    professionalism: score >= 80 ? "Excellent" : (score >= 60 ? "Good" : "Needs Improvement"),
    feedback,
    idealFormat
  };
}
