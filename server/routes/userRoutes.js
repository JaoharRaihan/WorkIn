const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile (protected)
router.get('/:id', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.userId,
      name: 'John Doe',
      email: req.user.email,
      role: req.user.role,
      bio: 'Passionate developer learning new technologies',
      location: 'San Francisco, CA',
      profilePic: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

// Toggle user mode (candidate <-> hr)
router.post('/:id/toggleMode', auth, (req, res) => {
  const { mode } = req.body;
  
  if (!['candidate', 'hr'].includes(mode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mode. Must be candidate or hr'
    });
  }

  res.json({
    success: true,
    message: 'Mode updated successfully',
    data: {
      userId: req.user.userId,
      newMode: mode,
      updatedAt: new Date()
    }
  });
});

// Get user stats (XP, streak, etc.)
router.get('/stats', auth, (req, res) => {
  const userId = req.user.userId;
  
  res.json({
    success: true,
    data: {
      xp: 1250,
      level: 5,
      streak: 7,
      badges: ['React Native', 'JavaScript', 'Problem Solver'],
      totalTests: 45,
      completedTests: 32,
      accuracy: 87,
      joinedAt: '2024-01-15'
    }
  });
});

// Update user XP
router.post('/xp', auth, (req, res) => {
  const { xpGained, source } = req.body;
  const userId = req.user.userId;
  
  try {
    // In real implementation, update database
    const currentXP = 1250; // Mock current XP
    const newXP = currentXP + xpGained;
    
    // Calculate new level (every 500 XP = 1 level)
    const currentLevel = Math.floor(currentXP / 500) + 1;
    const newLevel = Math.floor(newXP / 500) + 1;
    const leveledUp = newLevel > currentLevel;
    
    res.json({
      success: true,
      message: `+${xpGained} XP gained from ${source}`,
      data: {
        newXP,
        newLevel,
        leveledUp,
        xpGained,
        source
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update XP'
    });
  }
});

module.exports = router;
