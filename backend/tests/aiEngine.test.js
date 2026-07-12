const assert = require('assert');
const { analyzeResumeAI, matchCareerRoleAI, gradeSelfIntroductionAI } = require('../utils/aiEngine');

console.log('Starting AI Rules Engine Tests...\n');

// 1. Test Resume AI Scoring Rules
try {
  const resultEmpty = analyzeResumeAI([], [], '', '');
  assert.ok(resultEmpty.resumeScore <= 50, 'Empty resume should have a low base score');
  assert.ok(resultEmpty.weaknesses.includes('No core technical skills were identified.'), 'Should flag missing skills');
  
  const resultFull = analyzeResumeAI(
    ['React', 'Node.js', 'Git', 'HTML', 'CSS', 'MongoDB'],
    [{ title: 'Portfolio Site', description: 'Full stack React application utilizing REST API integrations.' }],
    'Worked as a software intern at Vercel for 6 months.',
    'B.Tech in Computer Science, 2025'
  );
  
  assert.ok(resultFull.resumeScore > 75, 'Populated resume should score high');
  assert.ok(resultFull.strengths.length > 0, 'Should return positive strengths');
  assert.ok(resultFull.recommendedCertifications.length > 0, 'Should output certifications suggestions');
  
  console.log('✓ Resume AI Analysis tests passed.');
} catch (error) {
  console.error('✗ Resume AI Analysis tests failed:', error.message);
  process.exit(1);
}

// 2. Test Career Match Rules
try {
  const matchHigh = matchCareerRoleAI(
    ['html', 'css', 'tailwind css', 'javascript', 'typescript', 'react', 'redux', 'next.js', 'git', 'github', 'rest api'],
    'Frontend Developer'
  );
  assert.strictEqual(matchHigh.eligibilityScore, 100, 'All matching skills should equal 100%');
  assert.strictEqual(matchHigh.readinessStatus, 'Interview Ready', '100% eligibility should mark Interview Ready');
  
  const matchPartial = matchCareerRoleAI(
    ['react', 'javascript', 'html', 'css'],
    'Frontend Developer'
  );
  assert.ok(matchPartial.eligibilityScore >= 30 && matchPartial.eligibilityScore < 85, 'Partial skills should equal middle percentage');
  assert.ok(matchPartial.roadmap.length > 0, 'Should generate custom weekly roadmaps for missing categories');
  
  console.log('✓ Career Matcher tests passed.');
} catch (error) {
  console.error('✗ Career Matcher tests failed:', error.message);
  process.exit(1);
}

// 3. Test Self-Intro Grading Rules
try {
  const introPoor = gradeSelfIntroductionAI('Hello, my name is Alex.');
  assert.ok(introPoor.score < 60, 'Incomplete intro should score low');
  assert.strictEqual(introPoor.confidence, 'Needs Improvement');

  const introGood = gradeSelfIntroductionAI(
    'My name is Alex. I studied computer engineering at State University. I am skilled in React, JavaScript, and Node.js. I built a mock commerce project using MongoDB. My career goal is to join a development team. Thank you.'
  );
  assert.ok(introGood.score >= 90, 'Comprehensive structural intro should score high');
  assert.strictEqual(introGood.confidence, 'Excellent');

  console.log('✓ Self-Introduction grading tests passed.');
} catch (error) {
  console.error('✗ Self-Introduction grading tests failed:', error.message);
  process.exit(1);
}

console.log('\nAll AI Engine tests completed successfully!');
