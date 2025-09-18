const express = require('express');
const router = express.Router();

// Mock challenges data
const challenges = [
  {
    id: 'js_001',
    title: 'JavaScript Array Methods Mastery',
    description: 'Master array methods like map, filter, reduce, and more!',
    difficulty: 'Intermediate',
    timeLimit: 120, // 2 minutes
    skills: ['JavaScript', 'Array Methods', 'Functional Programming'],
    xpReward: 50,
    category: 'Quick Challenge',
    type: 'mcq',
    questions: [
      {
        id: 1,
        question: 'Which method creates a new array with all elements that pass a test?',
        options: ['map()', 'filter()', 'reduce()', 'forEach()'],
        correctAnswer: 1,
        explanation: 'filter() creates a new array with elements that pass the test function.'
      }
    ],
    participants: 1247,
    completedBy: 892,
    averageScore: 78,
    createdAt: new Date(),
  },
  {
    id: 'react_001',
    title: 'React Hooks Challenge',
    description: 'Test your knowledge of React hooks and their usage patterns.',
    difficulty: 'Advanced',
    timeLimit: 180, // 3 minutes
    skills: ['React', 'Hooks', 'State Management'],
    xpReward: 75,
    category: 'Quick Challenge',
    type: 'mcq',
    questions: [
      {
        id: 1,
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect is used for side effects like API calls, subscriptions, etc.'
      }
    ],
    participants: 834,
    completedBy: 567,
    averageScore: 82,
    createdAt: new Date(),
  },
  {
    id: 'css_001',
    title: 'CSS Flexbox Mastery',
    description: 'Master CSS Flexbox properties and layout techniques.',
    difficulty: 'Beginner',
    timeLimit: 90, // 1.5 minutes
    skills: ['CSS', 'Flexbox', 'Layout'],
    xpReward: 30,
    category: 'Quick Challenge',
    type: 'mcq',
    questions: [
      {
        id: 1,
        question: 'Which property is used to align items along the main axis in flexbox?',
        options: ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'],
        correctAnswer: 1,
        explanation: 'justify-content aligns items along the main axis in a flex container.'
      }
    ],
    participants: 2156,
    completedBy: 1823,
    averageScore: 85,
    createdAt: new Date(),
  }
];

// Mock user challenge submissions
const submissions = [];
const leaderboard = [
  { userId: 'user1', userName: 'Alex Chen', avatar: '👑', totalXP: 2450, challengesCompleted: 48, rank: 1 },
  { userId: 'user2', userName: 'Sarah Wilson', avatar: '👩‍💻', totalXP: 2380, challengesCompleted: 46, rank: 2 },
  { userId: 'user3', userName: 'Mike Rodriguez', avatar: '🧑‍🔬', totalXP: 2290, challengesCompleted: 44, rank: 3 },
  { userId: 'user4', userName: 'Emma Johnson', avatar: '👩‍🎨', totalXP: 2180, challengesCompleted: 41, rank: 4 },
  { userId: 'user5', userName: 'David Kim', avatar: '👨‍💻', totalXP: 2050, challengesCompleted: 39, rank: 5 },
];

// GET /api/challenges - Get available challenges
router.get('/', (req, res) => {
  try {
    const { category, difficulty, limit = 10, offset = 0 } = req.query;
    
    let filteredChallenges = [...challenges];
    
    // Apply filters
    if (category && category !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => 
        c.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (difficulty && difficulty !== 'all') {
      filteredChallenges = filteredChallenges.filter(c => 
        c.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    // Apply pagination
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedChallenges = filteredChallenges.slice(start, end);
    
    res.json({
      success: true,
      data: {
        challenges: paginatedChallenges,
        total: filteredChallenges.length,
        hasMore: end < filteredChallenges.length
      },
      message: 'Challenges fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
});

// GET /api/challenges/:id - Get specific challenge details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    res.json({
      success: true,
      data: challenge,
      message: 'Challenge details fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenge details'
    });
  }
});

// POST /api/challenges/:id/start - Start a challenge
router.post('/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 'current_user';
    
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      data: {
        sessionId,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          timeLimit: challenge.timeLimit,
          totalQuestions: challenge.questions.length,
          xpReward: challenge.xpReward
        },
        startTime: new Date().toISOString()
      },
      message: 'Challenge started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start challenge'
    });
  }
});

// POST /api/challenges/:id/submit - Submit challenge answer/completion
router.post('/:id/submit', (req, res) => {
  try {
    const { id } = req.params;
    const { answer, sessionId, timeSpent, answers } = req.body;
    const userId = req.user?.userId || 'current_user';
    
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    // Calculate score based on answers
    let correctAnswers = 0;
    let totalQuestions = challenge.questions.length;
    
    if (challenge.type === 'mcq' && answers) {
      challenge.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
    } else if (answer !== undefined) {
      // Single answer challenge
      correctAnswers = answer === challenge.questions[0].correctAnswer ? 1 : 0;
      totalQuestions = 1;
    }
    
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercentage >= 70; // 70% passing score
    const xpEarned = passed ? challenge.xpReward : Math.floor(challenge.xpReward * 0.3);
    
    // Create submission record
    const submission = {
      id: submissions.length + 1,
      userId,
      challengeId: id,
      sessionId,
      score: scorePercentage,
      correctAnswers,
      totalQuestions,
      timeSpent: timeSpent || challenge.timeLimit,
      passed,
      xpEarned,
      answers: answers || [answer],
      submittedAt: new Date(),
    };
    
    submissions.push(submission);
    
    // Update challenge statistics
    const challengeIndex = challenges.findIndex(c => c.id === id);
    if (challengeIndex !== -1) {
      challenges[challengeIndex].completedBy++;
      const newAverage = (challenges[challengeIndex].averageScore * (challenges[challengeIndex].completedBy - 1) + scorePercentage) / challenges[challengeIndex].completedBy;
      challenges[challengeIndex].averageScore = Math.round(newAverage);
    }
    
    res.json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          score: scorePercentage,
          passed,
          xpEarned,
          correctAnswers,
          totalQuestions,
          timeSpent: submission.timeSpent
        },
        rank: passed ? Math.floor(Math.random() * 100) + 1 : null, // Mock rank
        feedback: passed ? 
          'Congratulations! 🎉 You passed the challenge!' : 
          'Keep practicing! 💪 You\'ll get it next time!'
      },
      message: 'Challenge submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit challenge'
    });
  }
});

// GET /api/challenges/leaderboard - Get challenge leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    
    // For now, return static leaderboard
    // In real implementation, calculate based on timeframe and user submissions
    const topUsers = leaderboard.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users: topUsers,
        timeframe,
        updatedAt: new Date().toISOString()
      },
      message: 'Leaderboard fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// GET /api/challenges/user/progress - Get user's challenge progress
router.get('/user/progress', (req, res) => {
  try {
    const userId = req.user?.userId || 'current_user';
    
    // Get user's submissions
    const userSubmissions = submissions.filter(s => s.userId === userId);
    const completedChallenges = userSubmissions.length;
    const totalXP = userSubmissions.reduce((sum, s) => sum + s.xpEarned, 0);
    const averageScore = userSubmissions.length > 0 ? 
      Math.round(userSubmissions.reduce((sum, s) => sum + s.score, 0) / userSubmissions.length) : 0;
    
    // Calculate streak (mock for now)
    const currentStreak = Math.floor(Math.random() * 15) + 1;
    
    res.json({
      success: true,
      data: {
        completedChallenges,
        totalXP,
        averageScore,
        currentStreak,
        rank: Math.floor(Math.random() * 500) + 1, // Mock rank
        recentSubmissions: userSubmissions.slice(-5), // Last 5 submissions
        badges: [
          { name: 'Quick Learner', emoji: '⚡', earned: completedChallenges >= 5 },
          { name: 'JavaScript Master', emoji: '🟨', earned: completedChallenges >= 10 },
          { name: 'Challenge Champion', emoji: '🏆', earned: completedChallenges >= 20 },
        ]
      },
      message: 'User progress fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user progress'
    });
  }
});

// POST /api/challenges/daily - Get daily challenge
router.get('/daily', (req, res) => {
  try {
    // Return a random challenge as daily challenge
    const dailyChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    res.json({
      success: true,
      data: {
        ...dailyChallenge,
        isDailyChallenge: true,
        bonusXP: Math.floor(dailyChallenge.xpReward * 1.5), // 50% bonus for daily
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      },
      message: 'Daily challenge fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily challenge'
    });
  }
});

module.exports = router;
