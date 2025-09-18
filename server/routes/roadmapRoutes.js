const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock roadmaps data
const roadmaps = [
  {
    id: 1,
    title: 'React Native Development',
    description: 'Master mobile app development with React Native',
    jsonData: {
      steps: [
        { id: 1, title: 'JavaScript Fundamentals', completed: true },
        { id: 2, title: 'React Basics', completed: true },
        { id: 3, title: 'React Native Setup', completed: false }
      ]
    },
    isPremium: false,
    createdAt: new Date()
  },
  {
    id: 2,
    title: 'Full Stack JavaScript',
    description: 'Complete web development with MERN stack',
    jsonData: {
      steps: [
        { id: 1, title: 'HTML/CSS/JS', completed: false },
        { id: 2, title: 'React Frontend', completed: false },
        { id: 3, title: 'Node.js Backend', completed: false }
      ]
    },
    isPremium: true,
    createdAt: new Date()
  }
];

// Get all roadmaps
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: roadmaps
  });
});

// Get roadmap by ID
router.get('/:id', (req, res) => {
  const roadmap = roadmaps.find(r => r.id === parseInt(req.params.id));
  
  if (!roadmap) {
    return res.status(404).json({
      success: false,
      error: 'Roadmap not found'
    });
  }

  res.json({
    success: true,
    data: roadmap
  });
});

// Update roadmap progress (protected route)
router.post('/:id/progress', auth, (req, res) => {
  const { progress, completedSteps } = req.body;
  
  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: {
      roadmapId: parseInt(req.params.id),
      userId: req.user.userId,
      progress,
      completedSteps,
      updatedAt: new Date()
    }
  });
});

module.exports = router;
