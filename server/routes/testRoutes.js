const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock tests data
const tests = [
  {
    id: 1,
    roadmapId: 1,
    title: 'React Native Fundamentals',
    type: 'mcq',
    questions: [
      {
        id: 1,
        question: 'What is React Native?',
        options: ['A web framework', 'A mobile framework', 'A database', 'A testing tool'],
        correctAnswer: 1
      }
    ]
  }
];

// Get all tests
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: tests
  });
});

// Get test by ID
router.get('/:id', (req, res) => {
  const test = tests.find(t => t.id === parseInt(req.params.id));
  
  if (!test) {
    return res.status(404).json({
      success: false,
      error: 'Test not found'
    });
  }

  res.json({
    success: true,
    data: test
  });
});

// Submit test (protected route)
router.post('/:id/submit', auth, (req, res) => {
  const { answers } = req.body;
  
  // Mock scoring logic
  const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  const passed = score >= 70;
  
  res.json({
    success: true,
    message: 'Test submitted successfully',
    data: {
      testId: parseInt(req.params.id),
      userId: req.user.userId,
      score,
      passed,
      submittedAt: new Date()
    }
  });
});

module.exports = router;
