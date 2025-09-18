class CheckpointTestService {
  constructor() {
    this.testTemplates = this.initializeTestTemplates();
    this.passingScore = 70; // Minimum score to pass checkpoint tests
  }

  initializeTestTemplates() {
    return {
      // Programming & Development Tests
      'react-basics-mcq': {
        id: 'react-basics-mcq',
        type: 'mcq',
        title: 'React Basics Knowledge Check',
        description: 'Test your understanding of React fundamentals',
        timeLimit: 15,
        questions: [
          {
            id: 1,
            question: "What is the primary purpose of React's virtual DOM?",
            options: [
              "To replace the real DOM entirely",
              "To improve performance by minimizing DOM manipulations",
              "To store component state",
              "To handle routing in React applications"
            ],
            correctAnswer: 1,
            explanation: "The virtual DOM improves performance by calculating the minimum changes needed and applying them to the real DOM efficiently."
          },
          {
            id: 2,
            question: "Which hook is used to manage state in functional components?",
            options: ["useEffect", "useState", "useContext", "useCallback"],
            correctAnswer: 1,
            explanation: "useState is the React hook specifically designed for managing local state in functional components."
          },
          {
            id: 3,
            question: "What does JSX stand for?",
            options: [
              "JavaScript XML",
              "JavaScript Extension",
              "Java Syntax Extension",
              "JavaScript Execute"
            ],
            correctAnswer: 0,
            explanation: "JSX stands for JavaScript XML, allowing you to write HTML-like syntax in JavaScript."
          },
          {
            id: 4,
            question: "When should you use useEffect with an empty dependency array?",
            options: [
              "To run the effect on every render",
              "To run the effect only once after initial render",
              "To prevent the effect from running",
              "To run the effect when props change"
            ],
            correctAnswer: 1,
            explanation: "An empty dependency array makes useEffect run only once after the initial render, similar to componentDidMount."
          },
          {
            id: 5,
            question: "What is prop drilling?",
            options: [
              "A method to optimize React performance",
              "Passing props through multiple nested components",
              "A debugging technique in React",
              "A way to create dynamic components"
            ],
            correctAnswer: 1,
            explanation: "Prop drilling refers to passing data through multiple component layers, which can be solved using Context or state management libraries."
          }
        ]
      },

      'javascript-algorithms-coding': {
        id: 'javascript-algorithms-coding',
        type: 'coding',
        title: 'JavaScript Algorithm Challenge',
        description: 'Solve coding problems to demonstrate your JavaScript skills',
        timeLimit: 30,
        problems: [
          {
            id: 1,
            title: "Array Sum",
            description: "Write a function that calculates the sum of all numbers in an array.",
            difficulty: "Easy",
            testCases: [
              { input: "[1, 2, 3, 4, 5]", expected: "15" },
              { input: "[-1, 0, 1]", expected: "0" },
              { input: "[]", expected: "0" }
            ],
            template: `function arraySum(numbers) {
  // Your code here
  
}`,
            solution: `function arraySum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}`
          },
          {
            id: 2,
            title: "Palindrome Check",
            description: "Write a function that checks if a string is a palindrome (reads the same forwards and backwards).",
            difficulty: "Medium",
            testCases: [
              { input: '"racecar"', expected: "true" },
              { input: '"hello"', expected: "false" },
              { input: '"A man a plan a canal Panama"', expected: "true" }
            ],
            template: `function isPalindrome(str) {
  // Your code here
  
}`,
            solution: `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`
          }
        ]
      },

      'ui-design-project': {
        id: 'ui-design-project',
        type: 'project',
        title: 'UI Design Portfolio Project',
        description: 'Create and submit a UI design project demonstrating your design skills',
        timeLimit: 60,
        requirements: [
          "Design a mobile app interface for a food delivery service",
          "Include at least 3 key screens (Home, Menu, Checkout)",
          "Use consistent color scheme and typography",
          "Ensure accessibility considerations are met",
          "Provide a brief design rationale (200-300 words)"
        ],
        deliverables: [
          "High-fidelity mockups (PNG/JPG)",
          "Design file (Figma/Sketch/Adobe XD)",
          "Design rationale document (PDF/TXT)"
        ],
        evaluationCriteria: [
          "Visual hierarchy and composition",
          "User experience and usability",
          "Consistency and attention to detail",
          "Creativity and problem-solving",
          "Design rationale quality"
        ]
      },

      'css-layout-mcq': {
        id: 'css-layout-mcq',
        type: 'mcq',
        title: 'CSS Layout Mastery',
        description: 'Test your knowledge of CSS layout techniques',
        timeLimit: 20,
        questions: [
          {
            id: 1,
            question: "Which CSS property is used to create a flexible layout?",
            options: ["display: block", "display: flex", "display: inline", "display: table"],
            correctAnswer: 1,
            explanation: "display: flex creates a flexible container that can arrange items in rows or columns with flexible sizing."
          },
          {
            id: 2,
            question: "What does 'justify-content: space-between' do in flexbox?",
            options: [
              "Centers all items",
              "Puts equal space around each item",
              "Distributes items with space between them",
              "Aligns items to the start"
            ],
            correctAnswer: 2,
            explanation: "space-between distributes items evenly with the first item at the start and last item at the end."
          },
          {
            id: 3,
            question: "Which CSS Grid property defines the size of grid columns?",
            options: [
              "grid-template-rows",
              "grid-template-columns", 
              "grid-column-gap",
              "grid-auto-columns"
            ],
            correctAnswer: 1,
            explanation: "grid-template-columns defines the size and number of columns in a CSS Grid container."
          }
        ]
      },

      'node-api-coding': {
        id: 'node-api-coding',
        type: 'coding',
        title: 'Node.js API Development',
        description: 'Build REST API endpoints using Node.js and Express',
        timeLimit: 45,
        problems: [
          {
            id: 1,
            title: "User Registration Endpoint",
            description: "Create a POST endpoint for user registration with validation",
            difficulty: "Medium",
            requirements: [
              "Accept email and password in request body",
              "Validate email format",
              "Check password strength (min 8 chars, 1 uppercase, 1 number)",
              "Return appropriate success/error responses"
            ],
            template: `const express = require('express');
const app = express();

app.use(express.json());

// Your endpoint here
app.post('/api/register', (req, res) => {
  // Your code here
  
});

module.exports = app;`,
            testCases: [
              {
                input: `{email: "test@example.com", password: "SecurePass123"}`,
                expected: "201 status with success message"
              },
              {
                input: `{email: "invalid-email", password: "weak"}`,
                expected: "400 status with validation errors"
              }
            ]
          }
        ]
      },

      'business-strategy-mcq': {
        id: 'business-strategy-mcq',
        type: 'mcq',
        title: 'Business Strategy Fundamentals',
        description: 'Test your understanding of key business strategy concepts',
        timeLimit: 25,
        questions: [
          {
            id: 1,
            question: "What is the primary goal of a SWOT analysis?",
            options: [
              "To calculate financial returns",
              "To identify strengths, weaknesses, opportunities, and threats",
              "To measure customer satisfaction",
              "To plan marketing campaigns"
            ],
            correctAnswer: 1,
            explanation: "SWOT analysis helps organizations understand their internal capabilities and external environment for strategic planning."
          },
          {
            id: 2,
            question: "What does ROI stand for in business?",
            options: [
              "Return on Investment",
              "Rate of Interest", 
              "Revenue on Income",
              "Risk of Investment"
            ],
            correctAnswer: 0,
            explanation: "ROI (Return on Investment) measures the efficiency of an investment by comparing the return to the cost."
          },
          {
            id: 3,
            question: "Which metric is most important for SaaS businesses?",
            options: [
              "Monthly Revenue",
              "Customer Acquisition Cost (CAC)",
              "Monthly Recurring Revenue (MRR)",
              "Employee Count"
            ],
            correctAnswer: 2,
            explanation: "MRR is crucial for SaaS businesses as it provides predictable, recurring revenue that indicates business health and growth."
          }
        ]
      }
    };
  }

  // Get test configuration by ID
  getTestById(testId) {
    return this.testTemplates[testId] || null;
  }

  // Get tests by type
  getTestsByType(type) {
    return Object.values(this.testTemplates).filter(test => test.type === type);
  }

  // Generate test for a specific step
  generateTestForStep(step) {
    const { category, skill, difficulty } = step;
    
    // Map step categories to test IDs
    const categoryTestMap = {
      'react': 'react-basics-mcq',
      'javascript': 'javascript-algorithms-coding',
      'css': 'css-layout-mcq',
      'nodejs': 'node-api-coding',
      'ui-design': 'ui-design-project',
      'business': 'business-strategy-mcq'
    };

    const testId = categoryTestMap[skill] || categoryTestMap[category] || 'react-basics-mcq';
    return this.getTestById(testId);
  }

  // Evaluate test results
  evaluateTestResults(testId, answers, timeSpent) {
    const test = this.getTestById(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    let score = 0;
    let totalQuestions = 0;
    const detailed = [];

    switch (test.type) {
      case 'mcq':
        totalQuestions = test.questions.length;
        test.questions.forEach((question, index) => {
          const userAnswer = answers[question.id] || answers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          if (isCorrect) score++;
          
          detailed.push({
            questionId: question.id,
            correct: isCorrect,
            userAnswer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
          });
        });
        break;

      case 'coding':
        // For coding tests, this would involve running test cases
        // For now, we'll simulate a score based on completion
        totalQuestions = test.problems.length;
        score = Math.floor(totalQuestions * 0.8); // Simulate 80% completion
        break;

      case 'project':
        // Project submissions would be manually reviewed
        // For now, we'll return a placeholder
        totalQuestions = 1;
        score = 1; // Assume submitted successfully
        break;
    }

    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= this.passingScore;

    return {
      testId,
      score,
      totalQuestions,
      percentage,
      passed,
      timeSpent,
      detailed,
      feedback: this.generateFeedback(test, percentage, passed)
    };
  }

  // Generate personalized feedback
  generateFeedback(test, percentage, passed) {
    const feedback = {
      overall: '',
      strengths: [],
      improvements: [],
      recommendations: []
    };

    if (passed) {
      if (percentage >= 90) {
        feedback.overall = "Excellent work! You have a strong understanding of the concepts.";
        feedback.strengths.push("Comprehensive knowledge of the subject");
        feedback.recommendations.push("Consider taking on advanced challenges");
      } else if (percentage >= 80) {
        feedback.overall = "Good job! You understand most of the key concepts.";
        feedback.strengths.push("Solid foundation in the fundamentals");
        feedback.recommendations.push("Practice the areas where you lost points");
      } else {
        feedback.overall = "You passed! Focus on strengthening your understanding.";
        feedback.improvements.push("Review the concepts you missed");
        feedback.recommendations.push("Take additional practice exercises");
      }
    } else {
      feedback.overall = "Don't worry! This is a learning opportunity.";
      feedback.improvements.push("Review the study materials carefully");
      feedback.improvements.push("Practice more examples");
      feedback.recommendations.push("Take your time to understand each concept");
      feedback.recommendations.push("Consider seeking help from mentors or community");
    }

    return feedback;
  }

  // Get test statistics
  getTestStatistics(testId) {
    // This would normally come from a database
    return {
      totalAttempts: Math.floor(Math.random() * 1000) + 100,
      averageScore: Math.floor(Math.random() * 30) + 65,
      passRate: Math.floor(Math.random() * 40) + 60,
      averageTime: Math.floor(Math.random() * 10) + 15
    };
  }

  // Get recommended next steps
  getNextSteps(testResults, step) {
    const { passed, percentage } = testResults;
    const nextSteps = [];

    if (passed) {
      nextSteps.push({
        type: 'continue',
        title: 'Continue Learning Path',
        description: `Proceed to the next step in your ${step.category} journey`
      });

      if (percentage >= 90) {
        nextSteps.push({
          type: 'challenge',
          title: 'Take Advanced Challenge',
          description: 'Ready for more complex problems? Try an advanced challenge!'
        });
      }

      nextSteps.push({
        type: 'share',
        title: 'Share Your Achievement',
        description: 'Share your success with the SkillNet community'
      });
    } else {
      nextSteps.push({
        type: 'review',
        title: 'Review Materials',
        description: 'Go back and review the learning materials'
      });

      nextSteps.push({
        type: 'practice',
        title: 'Get More Practice',
        description: 'Practice with additional exercises and examples'
      });

      nextSteps.push({
        type: 'retake',
        title: 'Retake Test',
        description: 'Try the test again when you feel ready'
      });
    }

    return nextSteps;
  }
}

export default CheckpointTestService;
