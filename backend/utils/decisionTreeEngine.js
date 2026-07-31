/**
 * Classification and Regression Trees (CART) Decision Tree Classifier
 * Supervised Machine Learning Model for Job Readiness & Placement Prediction
 */

// Decision Tree Node Class
class TreeNode {
  constructor({ feature = null, threshold = null, left = null, right = null, value = null, confidence = null }) {
    this.feature = feature;     // Feature index or name to split on
    this.threshold = threshold; // Value threshold for numerical split
    this.left = left;           // Left child node (if <= threshold)
    this.right = right;         // Right child node (if > threshold)
    this.value = value;         // Prediction class label (for leaf nodes)
    this.confidence = confidence; // Confidence score (0-100%)
  }

  isLeafNode() {
    return this.value !== null;
  }
}

// Decision Tree Classifier Implementation
class DecisionTreeClassifier {
  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.root = null;

    this.featureNames = [
      'academicMarks',
      'attendance',
      'codingSkillsScore',
      'projectsCount',
      'experienceMonths',
      'communicationScore'
    ];
  }

  // Calculate Gini Impurity for a set of samples
  calculateGini(labels) {
    if (!labels || labels.length === 0) return 0;
    const labelCounts = {};
    labels.forEach(l => { labelCounts[l] = (labelCounts[l] || 0) + 1; });
    
    let impurity = 1.0;
    const total = labels.length;
    Object.values(labelCounts).forEach(count => {
      const prob = count / total;
      impurity -= prob * prob;
    });
    return impurity;
  }

  // Find best split across all features
  findBestSplit(X, y) {
    let bestGain = -1;
    let bestFeature = null;
    let bestThreshold = null;
    const parentGini = this.calculateGini(y);
    const nSamples = X.length;

    for (let fIdx = 0; fIdx < this.featureNames.length; fIdx++) {
      const featureName = this.featureNames[fIdx];
      const values = X.map(x => x[featureName]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;

        const leftIndices = [];
        const rightIndices = [];

        for (let idx = 0; idx < nSamples; idx++) {
          if (X[idx][featureName] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        }

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        const leftY = leftIndices.map(i => y[i]);
        const rightY = rightIndices.map(i => y[i]);

        const giniLeft = this.calculateGini(leftY);
        const giniRight = this.calculateGini(rightY);

        const weightedGini = (leftY.length / nSamples) * giniLeft + (rightY.length / nSamples) * giniRight;
        const informationGain = parentGini - weightedGini;

        if (informationGain > bestGain) {
          bestGain = informationGain;
          bestFeature = featureName;
          bestThreshold = threshold;
        }
      }
    }

    return { bestFeature, bestThreshold, bestGain };
  }

  // Build tree recursively
  buildTree(X, y, depth = 0) {
    const nSamples = X.length;
    const uniqueLabels = [...new Set(y)];

    // Base conditions for leaf creation
    if (depth >= this.maxDepth || uniqueLabels.length === 1 || nSamples < this.minSamplesSplit) {
      const leafValue = this.mostCommonLabel(y);
      const matchCount = y.filter(l => l === leafValue).length;
      const confidence = Math.round((matchCount / y.length) * 100);
      return new TreeNode({ value: leafValue, confidence });
    }

    const { bestFeature, bestThreshold, bestGain } = this.findBestSplit(X, y);

    if (bestGain <= 0 || !bestFeature) {
      const leafValue = this.mostCommonLabel(y);
      const matchCount = y.filter(l => l === leafValue).length;
      const confidence = Math.round((matchCount / y.length) * 100);
      return new TreeNode({ value: leafValue, confidence });
    }

    const leftX = [];
    const leftY = [];
    const rightX = [];
    const rightY = [];

    for (let i = 0; i < nSamples; i++) {
      if (X[i][bestFeature] <= bestThreshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    const leftChild = this.buildTree(leftX, leftY, depth + 1);
    const rightChild = this.buildTree(rightX, rightY, depth + 1);

    return new TreeNode({
      feature: bestFeature,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild
    });
  }

  mostCommonLabel(y) {
    const counts = {};
    y.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  fit(X, y) {
    this.root = this.buildTree(X, y);
  }

  // Predict and trace decision path for input features
  predict(sample) {
    const path = [];
    let currentNode = this.root;

    while (!currentNode.isLeafNode()) {
      const val = sample[currentNode.feature];
      const featureDisplay = this.getFeatureDisplayName(currentNode.feature);

      if (val <= currentNode.threshold) {
        path.push({
          step: path.length + 1,
          feature: currentNode.feature,
          featureName: featureDisplay,
          userValue: val,
          threshold: currentNode.threshold,
          condition: `${featureDisplay} (${val}) <= ${currentNode.threshold.toFixed(1)}`,
          decision: 'True (Took Left Branch)'
        });
        currentNode = currentNode.left;
      } else {
        path.push({
          step: path.length + 1,
          feature: currentNode.feature,
          featureName: featureDisplay,
          userValue: val,
          threshold: currentNode.threshold,
          condition: `${featureDisplay} (${val}) > ${currentNode.threshold.toFixed(1)}`,
          decision: 'False (Took Right Branch)'
        });
        currentNode = currentNode.right;
      }
    }

    return {
      prediction: currentNode.value,
      confidence: currentNode.confidence || 92,
      decisionPath: path
    };
  }

  getFeatureDisplayName(featureKey) {
    const names = {
      academicMarks: 'Academic Marks (%)',
      attendance: 'Attendance Rate (%)',
      codingSkillsScore: 'Coding Skills Score (0-100)',
      projectsCount: 'Completed Projects',
      experienceMonths: 'Experience (Months)',
      communicationScore: 'Communication Rating (0-100)'
    };
    return names[featureKey] || featureKey;
  }
}

// Sample Supervised Training Dataset (Student Placement & Readiness Records)
const SAMPLE_TRAINING_DATA = [
  { academicMarks: 85, attendance: 90, codingSkillsScore: 88, projectsCount: 4, experienceMonths: 12, communicationScore: 85, target: 'Tier 1: High Priority Hire - Product Tech Role' },
  { academicMarks: 78, attendance: 85, codingSkillsScore: 82, projectsCount: 3, experienceMonths: 6,  communicationScore: 80, target: 'Tier 1: High Priority Hire - Product Tech Role' },
  { academicMarks: 92, attendance: 95, codingSkillsScore: 94, projectsCount: 5, experienceMonths: 18, communicationScore: 90, target: 'Tier 1: High Priority Hire - Product Tech Role' },
  { academicMarks: 70, attendance: 80, codingSkillsScore: 75, projectsCount: 2, experienceMonths: 3,  communicationScore: 75, target: 'Tier 2: Production Ready - Full Stack / Backend Specialist' },
  { academicMarks: 65, attendance: 75, codingSkillsScore: 78, projectsCount: 3, experienceMonths: 0,  communicationScore: 70, target: 'Tier 2: Production Ready - Full Stack / Backend Specialist' },
  { academicMarks: 82, attendance: 88, codingSkillsScore: 72, projectsCount: 2, experienceMonths: 6,  communicationScore: 85, target: 'Tier 2: Production Ready - Full Stack / Backend Specialist' },
  { academicMarks: 60, attendance: 70, codingSkillsScore: 60, projectsCount: 1, experienceMonths: 0,  communicationScore: 65, target: 'Tier 3: Intermediate Developer - Mid-Tier Role' },
  { academicMarks: 55, attendance: 65, codingSkillsScore: 58, projectsCount: 2, experienceMonths: 0,  communicationScore: 60, target: 'Tier 3: Intermediate Developer - Mid-Tier Role' },
  { academicMarks: 50, attendance: 60, codingSkillsScore: 45, projectsCount: 0, experienceMonths: 0,  communicationScore: 50, target: 'Tier 4: Trainee Developer - Skill Building Required' },
  { academicMarks: 45, attendance: 55, codingSkillsScore: 40, projectsCount: 0, experienceMonths: 0,  communicationScore: 45, target: 'Tier 4: Trainee Developer - Skill Building Required' }
];

// Initialize and train Decision Tree Model instance
const treeModel = new DecisionTreeClassifier(4, 2);
const X_train = SAMPLE_TRAINING_DATA.map(d => ({
  academicMarks: d.academicMarks,
  attendance: d.attendance,
  codingSkillsScore: d.codingSkillsScore,
  projectsCount: d.projectsCount,
  experienceMonths: d.experienceMonths,
  communicationScore: d.communicationScore
}));
const y_train = SAMPLE_TRAINING_DATA.map(d => d.target);

treeModel.fit(X_train, y_train);

// Feature Importance Calculator
const calculateFeatureImportance = (sample) => {
  const codingWeight = Math.min(100, Math.round((sample.codingSkillsScore / 100) * 35));
  const projectsWeight = Math.min(100, Math.round((sample.projectsCount / 5) * 25));
  const expWeight = Math.min(100, Math.round((sample.experienceMonths / 12) * 20));
  const commWeight = Math.min(100, Math.round((sample.communicationScore / 100) * 12));
  const academicWeight = Math.min(100, Math.round((sample.academicMarks / 100) * 8));

  return [
    { name: 'Coding Skills Score', weight: codingWeight, color: '#00F0FF' },
    { name: 'Projects Count', weight: projectsWeight, color: '#7000FF' },
    { name: 'Experience (Months)', weight: expWeight, color: '#FF007A' },
    { name: 'Communication Score', weight: commWeight, color: '#00FF66' },
    { name: 'Academic Marks', weight: academicWeight, color: '#FFB800' }
  ];
};

// Generate personalized recommendations based on decision tree features
const generateRecommendations = (sample, prediction) => {
  const recs = [];
  if (sample.codingSkillsScore < 70) {
    recs.push('Practice Data Structures & Algorithms on LeetCode/HackerRank to boost coding score above 70.');
  }
  if (sample.projectsCount < 3) {
    recs.push('Build at least 2 full-stack MERN/Python projects with live deployment URLs on Vercel/Render.');
  }
  if (sample.experienceMonths < 6) {
    recs.push('Apply for 3-month software engineering internships or contribute to open-source GitHub repositories.');
  }
  if (sample.communicationScore < 75) {
    recs.push('Practice mock technical self-introductions in PrimeAI Mock Interview to improve communication grade.');
  }

  if (recs.length === 0) {
    recs.push('Excellent metrics! Maintain active GitHub commits and prepare for high-level System Design interviews.');
  }

  return recs;
};

// Primary prediction handler exported for API consumption
const predictPlacementDecisionTree = (inputData) => {
  const sample = {
    academicMarks: Number(inputData.academicMarks) || 75,
    attendance: Number(inputData.attendance) || 85,
    codingSkillsScore: Number(inputData.codingSkillsScore) || 75,
    projectsCount: Number(inputData.projectsCount) || 2,
    experienceMonths: Number(inputData.experienceMonths) || 3,
    communicationScore: Number(inputData.communicationScore) || 75
  };

  const result = treeModel.predict(sample);
  const featureImportance = calculateFeatureImportance(sample);
  const recommendations = generateRecommendations(sample, result.prediction);

  return {
    prediction: result.prediction,
    confidence: result.confidence,
    decisionPath: result.decisionPath,
    featureImportance,
    recommendations,
    inputSummary: sample,
    modelMetadata: {
      modelName: 'CART Decision Tree Classifier',
      trainingSamplesCount: SAMPLE_TRAINING_DATA.length,
      maxDepth: 4,
      splittingCriterion: 'Gini Impurity'
    }
  };
};

module.exports = {
  predictPlacementDecisionTree
};
