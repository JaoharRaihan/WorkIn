// PreTestService.js - Handles pre-test logic and personalized roadmap generation

class PreTestService {
  constructor() {
    this.skillAssessments = this.initializeSkillAssessments();
    this.roadmapTemplates = this.initializeRoadmapTemplates();
    this.personalizationEngine = new PersonalizationEngine();
  }

  // Initialize comprehensive skill assessments
  initializeSkillAssessments() {
    return {
      // Programming Fundamentals Assessment
      programming: {
        id: 'pre_test_programming',
        title: 'Programming Fundamentals Assessment',
        description: 'Evaluate your programming knowledge across multiple languages and concepts',
        timeLimit: 20, // minutes
        questions: [
          {
            id: 'prog_1',
            question: 'Which of these is NOT a programming paradigm?',
            options: [
              'Object-Oriented Programming',
              'Functional Programming',
              'Database Programming',
              'Procedural Programming'
            ],
            correctAnswer: 2,
            skill: 'programming_concepts',
            difficulty: 'beginner'
          },
          {
            id: 'prog_2',
            question: 'What does API stand for?',
            options: [
              'Application Programming Interface',
              'Advanced Programming Implementation',
              'Automated Program Integration',
              'Application Process Integration'
            ],
            correctAnswer: 0,
            skill: 'web_development',
            difficulty: 'beginner'
          },
          {
            id: 'prog_3',
            question: 'In JavaScript, what is the difference between "==" and "==="?',
            options: [
              'No difference',
              '== checks type, === checks value',
              '=== checks both type and value, == only checks value',
              '== is deprecated'
            ],
            correctAnswer: 2,
            skill: 'javascript',
            difficulty: 'intermediate'
          },
          {
            id: 'prog_4',
            question: 'What is the time complexity of binary search?',
            options: [
              'O(n)',
              'O(log n)',
              'O(n²)',
              'O(1)'
            ],
            correctAnswer: 1,
            skill: 'algorithms',
            difficulty: 'intermediate'
          },
          {
            id: 'prog_5',
            question: 'Which design pattern ensures a class has only one instance?',
            options: [
              'Factory Pattern',
              'Observer Pattern',
              'Singleton Pattern',
              'Strategy Pattern'
            ],
            correctAnswer: 2,
            skill: 'design_patterns',
            difficulty: 'advanced'
          }
        ]
      },

      // Design & UX Assessment
      design: {
        id: 'pre_test_design',
        title: 'Design & UX Assessment',
        description: 'Assess your design thinking and user experience knowledge',
        timeLimit: 15,
        questions: [
          {
            id: 'design_1',
            question: 'What does UX stand for?',
            options: [
              'User Experience',
              'User Extension',
              'Universal Experience',
              'User Explanation'
            ],
            correctAnswer: 0,
            skill: 'ux_basics',
            difficulty: 'beginner'
          },
          {
            id: 'design_2',
            question: 'Which color scheme uses colors opposite on the color wheel?',
            options: [
              'Monochromatic',
              'Analogous',
              'Complementary',
              'Triadic'
            ],
            correctAnswer: 2,
            skill: 'color_theory',
            difficulty: 'beginner'
          },
          {
            id: 'design_3',
            question: 'What is the primary goal of user research?',
            options: [
              'To validate design decisions',
              'To understand user needs and behaviors',
              'To test visual designs',
              'To reduce development costs'
            ],
            correctAnswer: 1,
            skill: 'user_research',
            difficulty: 'intermediate'
          },
          {
            id: 'design_4',
            question: 'Which principle emphasizes the most important element in a design?',
            options: [
              'Balance',
              'Contrast',
              'Hierarchy',
              'Proximity'
            ],
            correctAnswer: 2,
            skill: 'design_principles',
            difficulty: 'intermediate'
          }
        ]
      },

      // Business & Marketing Assessment
      business: {
        id: 'pre_test_business',
        title: 'Business & Marketing Assessment',
        description: 'Evaluate your business acumen and marketing knowledge',
        timeLimit: 15,
        questions: [
          {
            id: 'biz_1',
            question: 'What does ROI stand for?',
            options: [
              'Return on Investment',
              'Rate of Interest',
              'Revenue over Income',
              'Risk of Investment'
            ],
            correctAnswer: 0,
            skill: 'business_basics',
            difficulty: 'beginner'
          },
          {
            id: 'biz_2',
            question: 'Which marketing funnel stage focuses on awareness?',
            options: [
              'Bottom of funnel',
              'Middle of funnel',
              'Top of funnel',
              'End of funnel'
            ],
            correctAnswer: 2,
            skill: 'marketing_funnel',
            difficulty: 'beginner'
          },
          {
            id: 'biz_3',
            question: 'What is A/B testing primarily used for?',
            options: [
              'Testing server performance',
              'Comparing two versions to see which performs better',
              'Testing API endpoints',
              'Database optimization'
            ],
            correctAnswer: 1,
            skill: 'marketing_analytics',
            difficulty: 'intermediate'
          }
        ]
      }
    };
  }

  // Initialize roadmap templates for personalization
  initializeRoadmapTemplates() {
    return {
      // Beginner-friendly roadmaps
      beginner: {
        web_development: {
          title: 'Web Development for Beginners',
          description: 'Start your web development journey with HTML, CSS, and JavaScript',
          estimatedWeeks: 12,
          difficulty: 'Beginner',
          steps: [
            {
              title: 'HTML Fundamentals',
              summary: 'Learn the structure of web pages',
              skills: ['html', 'semantic_markup'],
              hasCheckpointTest: true,
              xpReward: 100
            },
            {
              title: 'CSS Styling',
              summary: 'Make your websites beautiful with CSS',
              skills: ['css', 'responsive_design'],
              hasCheckpointTest: true,
              xpReward: 125
            },
            {
              title: 'JavaScript Basics',
              summary: 'Add interactivity to your websites',
              skills: ['javascript', 'dom_manipulation'],
              hasCheckpointTest: true,
              xpReward: 150
            }
          ]
        },
        
        mobile_development: {
          title: 'Mobile App Development Basics',
          description: 'Learn to build mobile apps with React Native',
          estimatedWeeks: 10,
          difficulty: 'Beginner',
          steps: [
            {
              title: 'Mobile Development Concepts',
              summary: 'Understand mobile app architecture',
              skills: ['mobile_concepts', 'app_lifecycle'],
              hasCheckpointTest: true,
              xpReward: 100
            },
            {
              title: 'React Native Setup',
              summary: 'Set up your development environment',
              skills: ['react_native', 'expo'],
              hasCheckpointTest: false,
              xpReward: 75
            }
          ]
        }
      },

      // Intermediate roadmaps
      intermediate: {
        full_stack: {
          title: 'Full Stack Development',
          description: 'Build complete web applications from frontend to backend',
          estimatedWeeks: 16,
          difficulty: 'Intermediate',
          steps: [
            {
              title: 'Advanced React',
              summary: 'Master React hooks, context, and state management',
              skills: ['react', 'state_management', 'hooks'],
              hasCheckpointTest: true,
              xpReward: 200
            },
            {
              title: 'Node.js Backend',
              summary: 'Build robust server-side applications',
              skills: ['nodejs', 'express', 'apis'],
              hasCheckpointTest: true,
              xpReward: 250
            }
          ]
        }
      },

      // Advanced roadmaps
      advanced: {
        system_design: {
          title: 'System Design & Architecture',
          description: 'Learn to design scalable, distributed systems',
          estimatedWeeks: 20,
          difficulty: 'Advanced',
          steps: [
            {
              title: 'Scalability Patterns',
              summary: 'Design patterns for large-scale systems',
              skills: ['system_design', 'scalability', 'architecture'],
              hasCheckpointTest: true,
              xpReward: 300
            }
          ]
        }
      }
    };
  }

  // Analyze pre-test results and generate skill profile
  analyzePreTestResults(answers, testType) {
    const assessment = this.skillAssessments[testType];
    if (!assessment) return null;

    const skillScores = {};
    let totalScore = 0;
    let maxScore = 0;

    // Calculate scores for each skill area
    assessment.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const skill = question.skill;
      
      if (!skillScores[skill]) {
        skillScores[skill] = { correct: 0, total: 0, difficulty: [] };
      }
      
      skillScores[skill].total++;
      skillScores[skill].difficulty.push(question.difficulty);
      
      if (isCorrect) {
        skillScores[skill].correct++;
        totalScore++;
      }
      
      maxScore++;
    });

    // Calculate skill levels and recommendations
    const skillProfile = {};
    Object.entries(skillScores).forEach(([skill, data]) => {
      const accuracy = data.correct / data.total;
      const avgDifficulty = this.calculateAverageDifficulty(data.difficulty);
      
      skillProfile[skill] = {
        accuracy,
        level: this.determineSkillLevel(accuracy, avgDifficulty),
        needsImprovement: accuracy < 0.6,
        strength: accuracy >= 0.8
      };
    });

    return {
      testType,
      totalScore,
      maxScore,
      percentage: (totalScore / maxScore) * 100,
      skillProfile,
      overallLevel: this.determineOverallLevel(totalScore / maxScore),
      recommendedPath: this.getRecommendedPath(skillProfile, testType),
      completedAt: new Date().toISOString()
    };
  }

  // Generate personalized roadmaps based on skill profile
  generatePersonalizedRoadmaps(skillAnalysis) {
    const { skillProfile, overallLevel, testType, recommendedPath } = skillAnalysis;
    
    const personalizedRoadmaps = [];
    
    // Get base templates based on skill level
    const templates = this.roadmapTemplates[overallLevel] || this.roadmapTemplates.beginner;
    
    // Customize roadmaps based on skill strengths and weaknesses
    Object.entries(templates).forEach(([pathKey, template]) => {
      if (this.isRelevantPath(pathKey, skillProfile, testType)) {
        const customizedRoadmap = this.customizeRoadmapForUser(template, skillProfile, skillAnalysis);
        personalizedRoadmaps.push(customizedRoadmap);
      }
    });

    // Add skill-specific focus areas
    const focusRoadmaps = this.generateFocusRoadmaps(skillProfile, testType);
    personalizedRoadmaps.push(...focusRoadmaps);

    return {
      personalizedRoadmaps,
      recommendations: this.generateRecommendations(skillAnalysis),
      nextSteps: this.generateNextSteps(skillProfile),
      estimatedTimeToGoal: this.calculateEstimatedTime(personalizedRoadmaps)
    };
  }

  // Helper methods
  calculateAverageDifficulty(difficulties) {
    const difficultyMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const sum = difficulties.reduce((acc, diff) => acc + difficultyMap[diff], 0);
    return sum / difficulties.length;
  }

  determineSkillLevel(accuracy, avgDifficulty) {
    if (accuracy >= 0.8 && avgDifficulty >= 2.5) return 'advanced';
    if (accuracy >= 0.6 && avgDifficulty >= 2) return 'intermediate';
    return 'beginner';
  }

  determineOverallLevel(percentage) {
    if (percentage >= 0.8) return 'advanced';
    if (percentage >= 0.6) return 'intermediate';
    return 'beginner';
  }

  getRecommendedPath(skillProfile, testType) {
    const strongSkills = Object.entries(skillProfile)
      .filter(([_, data]) => data.strength)
      .map(([skill]) => skill);
    
    // Logic to determine recommended learning path
    if (testType === 'programming') {
      if (strongSkills.includes('javascript')) return 'web_development';
      if (strongSkills.includes('algorithms')) return 'computer_science';
    }
    
    return 'general';
  }

  isRelevantPath(pathKey, skillProfile, testType) {
    // Logic to determine if a roadmap path is relevant for the user
    if (testType === 'programming' && pathKey.includes('development')) return true;
    if (testType === 'design' && pathKey.includes('design')) return true;
    if (testType === 'business' && pathKey.includes('marketing')) return true;
    return false;
  }

  customizeRoadmapForUser(template, skillProfile, skillAnalysis) {
    // Deep clone template and customize based on user's skills
    const customizedRoadmap = JSON.parse(JSON.stringify(template));
    
    // Adjust difficulty based on user's skill level
    customizedRoadmap.steps = customizedRoadmap.steps.map(step => {
      const stepSkills = step.skills || [];
      const userHasSkills = stepSkills.some(skill => 
        skillProfile[skill] && skillProfile[skill].level !== 'beginner'
      );
      
      if (userHasSkills) {
        step.status = 'available'; // User can skip basics
        step.estimatedTime = Math.max(1, (step.estimatedTime || 2) - 1) + ' hours';
      }
      
      return step;
    });

    // Add user-specific metadata
    customizedRoadmap.personalizedFor = skillAnalysis.testType;
    customizedRoadmap.generatedAt = new Date().toISOString();
    customizedRoadmap.userLevel = skillAnalysis.overallLevel;
    
    return customizedRoadmap;
  }

  generateFocusRoadmaps(skillProfile, testType) {
    const weakSkills = Object.entries(skillProfile)
      .filter(([_, data]) => data.needsImprovement)
      .map(([skill]) => skill);
    
    const focusRoadmaps = [];
    
    // Generate focus roadmaps for weak areas
    weakSkills.forEach(skill => {
      const focusRoadmap = {
        title: `${skill.replace('_', ' ')} Fundamentals`,
        description: `Strengthen your ${skill.replace('_', ' ')} skills`,
        tags: [skill, 'fundamentals', 'improvement'],
        difficulty: 'Beginner',
        estimatedWeeks: 4,
        totalSteps: 5,
        isPremium: false,
        isFocusArea: true,
        focusSkill: skill,
        steps: this.generateFocusSteps(skill)
      };
      
      focusRoadmaps.push(focusRoadmap);
    });
    
    return focusRoadmaps;
  }

  generateFocusSteps(skill) {
    // Generate steps specific to the skill that needs improvement
    const skillSteps = {
      javascript: [
        {
          title: 'JavaScript Syntax Review',
          summary: 'Review basic JavaScript syntax and concepts',
          hasCheckpointTest: true,
          xpReward: 75
        },
        {
          title: 'Functions and Scope',
          summary: 'Master JavaScript functions and variable scope',
          hasCheckpointTest: true,
          xpReward: 100
        }
      ],
      // Add more skill-specific steps as needed
    };
    
    return skillSteps[skill] || [
      {
        title: `${skill} Basics`,
        summary: `Learn the fundamentals of ${skill}`,
        hasCheckpointTest: true,
        xpReward: 100
      }
    ];
  }

  generateRecommendations(skillAnalysis) {
    const recommendations = [];
    
    // Based on test performance
    if (skillAnalysis.percentage >= 80) {
      recommendations.push({
        type: 'advancement',
        title: 'Consider Advanced Topics',
        description: 'You show strong fundamentals. Consider exploring advanced concepts.',
        priority: 'high'
      });
    } else if (skillAnalysis.percentage < 60) {
      recommendations.push({
        type: 'foundation',
        title: 'Strengthen Fundamentals',
        description: 'Focus on building stronger foundations before advancing.',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  generateNextSteps(skillProfile) {
    const nextSteps = [];
    
    Object.entries(skillProfile).forEach(([skill, data]) => {
      if (data.needsImprovement) {
        nextSteps.push({
          action: 'improve',
          skill,
          priority: 'high',
          estimatedTime: '2-3 weeks'
        });
      } else if (data.strength) {
        nextSteps.push({
          action: 'advance',
          skill,
          priority: 'medium',
          estimatedTime: '1-2 weeks'
        });
      }
    });
    
    return nextSteps.sort((a, b) => a.priority === 'high' ? -1 : 1);
  }

  calculateEstimatedTime(roadmaps) {
    const totalWeeks = roadmaps.reduce((sum, roadmap) => sum + (roadmap.estimatedWeeks || 0), 0);
    return {
      weeks: totalWeeks,
      description: `Approximately ${totalWeeks} weeks to complete all recommended roadmaps`
    };
  }
}

// Personalization Engine for advanced customization
class PersonalizationEngine {
  constructor() {
    this.userProfiles = new Map();
    this.learningPatterns = new Map();
  }

  // Analyze user learning patterns
  analyzeLearningPattern(userId, completedTests, studyHours, preferredTime) {
    const pattern = {
      pace: this.calculateLearningPace(completedTests, studyHours),
      preferredDifficulty: this.getPreferredDifficulty(completedTests),
      studySchedule: preferredTime,
      strongAreas: this.identifyStrongAreas(completedTests),
      learningStyle: this.determineLearningStyle(completedTests)
    };
    
    this.learningPatterns.set(userId, pattern);
    return pattern;
  }

  // Adjust roadmap based on learning pattern
  adaptRoadmapToPace(roadmap, learningPattern) {
    const adaptedRoadmap = { ...roadmap };
    
    if (learningPattern.pace === 'fast') {
      adaptedRoadmap.estimatedWeeks = Math.ceil(roadmap.estimatedWeeks * 0.8);
    } else if (learningPattern.pace === 'slow') {
      adaptedRoadmap.estimatedWeeks = Math.ceil(roadmap.estimatedWeeks * 1.3);
    }
    
    return adaptedRoadmap;
  }

  calculateLearningPace(completedTests, studyHours) {
    // Logic to determine if user learns fast, normal, or slow
    const avgHoursPerTest = studyHours / completedTests.length;
    if (avgHoursPerTest < 2) return 'fast';
    if (avgHoursPerTest > 4) return 'slow';
    return 'normal';
  }

  getPreferredDifficulty(completedTests) {
    // Analyze which difficulty levels user prefers/performs best at
    return 'intermediate'; // Placeholder
  }

  identifyStrongAreas(completedTests) {
    // Identify areas where user consistently performs well
    return []; // Placeholder
  }

  determineLearningStyle(completedTests) {
    // Determine if user prefers visual, practical, theoretical learning
    return 'practical'; // Placeholder
  }
}

export default PreTestService;
