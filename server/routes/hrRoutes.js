const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock candidates data
const candidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    skills: ['React Native', 'JavaScript', 'UI/UX'],
    location: 'San Francisco, CA',
    experience: '2-3 years',
    progress: 85,
    badges: 8,
    profileScore: 92
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    skills: ['Mobile Dev', 'React', 'Swift'],
    location: 'Seattle, WA',
    experience: '4+ years',
    progress: 95,
    badges: 15,
    profileScore: 96
  }
];

// Get all candidates (HR only)
router.get('/candidates', auth, (req, res) => {
  // In real app, check if user role is 'hr'
  res.json({
    success: true,
    data: candidates
  });
});

// Get candidate by ID (HR only)
router.get('/candidates/:id', auth, (req, res) => {
  const candidate = candidates.find(c => c.id === parseInt(req.params.id));
  
  if (!candidate) {
    return res.status(404).json({
      success: false,
      error: 'Candidate not found'
    });
  }

  res.json({
    success: true,
    data: candidate
  });
});

// Save candidate (HR only)
router.post('/saveCandidate', auth, (req, res) => {
  const { candidateId } = req.body;
  
  res.json({
    success: true,
    message: 'Candidate saved successfully',
    data: {
      hrId: req.user.userId,
      candidateId,
      savedAt: new Date()
    }
  });
});

// Get saved candidates (HR only)
router.get('/savedCandidates/:hrId', auth, (req, res) => {
  res.json({
    success: true,
    data: candidates // In real app, filter by saved candidates
  });
});

// Send interview request (HR only)
router.post('/interviewRequest', auth, (req, res) => {
  const { candidateId, message, position } = req.body;
  
  res.json({
    success: true,
    message: 'Interview request sent successfully',
    data: {
      hrId: req.user.userId,
      candidateId,
      message,
      position,
      status: 'pending',
      createdAt: new Date()
    }
  });
});

// Get interview requests (HR only)
router.get('/interviewRequests/:hrId', auth, (req, res) => {
  const mockRequests = [
    {
      id: 1,
      candidateId: 1,
      candidateName: 'Sarah Johnson',
      position: 'React Native Developer',
      status: 'pending',
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: mockRequests
  });
});

module.exports = router;
