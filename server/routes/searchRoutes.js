const express = require('express');
const router = express.Router();

// Mock data - replace with database queries
const mockPosts = [
  {
    id: 1,
    type: 'post',
    content: 'Just completed my React Native certification! 🎉',
    author: 'Sarah Chen',
    timeAgo: '2h',
    skills: ['React Native', 'JavaScript', 'Mobile Development'],
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    type: 'post',
    content: 'Built a cool machine learning model for sentiment analysis',
    author: 'Alex Kumar',
    timeAgo: '4h',
    skills: ['Python', 'Machine Learning', 'NLP'],
    likes: 18,
    comments: 5
  }
];

const mockUsers = [
  {
    id: 1,
    type: 'user',
    name: 'Sarah Chen',
    title: 'React Native Developer',
    bio: 'Passionate mobile developer with 3 years of experience',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    location: 'San Francisco, CA'
  },
  {
    id: 2,
    type: 'user',
    name: 'Alex Kumar',
    title: 'ML Engineer',
    bio: 'AI/ML specialist focusing on NLP and computer vision',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
    location: 'New York, NY'
  }
];

const mockRoadmaps = [
  {
    id: 1,
    type: 'roadmap',
    title: 'Full Stack Web Development',
    description: 'Complete roadmap to become a full stack developer',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration: '6 months',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js']
  },
  {
    id: 2,
    type: 'roadmap',
    title: 'Data Science Fundamentals',
    description: 'Learn the basics of data science and analytics',
    category: 'Data Science',
    difficulty: 'Beginner',
    duration: '4 months',
    skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Statistics']
  }
];

const mockChallenges = [
  {
    id: 1,
    type: 'challenge',
    title: 'Build a Todo App Challenge',
    description: 'Create a full-featured todo application',
    status: 'active',
    participants: 45,
    difficulty: 'Beginner',
    skills: ['JavaScript', 'React']
  },
  {
    id: 2,
    type: 'challenge',
    title: 'Machine Learning Competition',
    description: 'Predict house prices using ML algorithms',
    status: 'upcoming',
    participants: 23,
    difficulty: 'Advanced',
    skills: ['Python', 'Machine Learning', 'Data Analysis']
  }
];

// Global search endpoint
router.get('/global', (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        all: [],
        posts: [],
        users: [],
        roadmaps: [],
        challenges: []
      });
    }

    const searchTerm = query.toLowerCase();

    // Search posts
    const posts = mockPosts.filter(post => 
      post.content.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm) ||
      post.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );

    // Search users
    const users = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.title.toLowerCase().includes(searchTerm) ||
      user.bio.toLowerCase().includes(searchTerm) ||
      user.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );

    // Search roadmaps
    const roadmaps = mockRoadmaps.filter(roadmap =>
      roadmap.title.toLowerCase().includes(searchTerm) ||
      roadmap.description.toLowerCase().includes(searchTerm) ||
      roadmap.category.toLowerCase().includes(searchTerm) ||
      roadmap.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );

    // Search challenges
    const challenges = mockChallenges.filter(challenge =>
      challenge.title.toLowerCase().includes(searchTerm) ||
      challenge.description.toLowerCase().includes(searchTerm) ||
      challenge.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );

    // Combine all results for 'all' tab
    const all = [...posts, ...users, ...roadmaps, ...challenges];

    res.json({
      all,
      posts,
      users,
      roadmaps,
      challenges
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search posts specifically
router.get('/posts', (req, res) => {
  try {
    const { q: query, type, skills, dateRange } = req.query;
    
    let results = mockPosts;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(post => 
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    if (type) {
      results = results.filter(post => post.type === type);
    }

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      results = results.filter(post =>
        post.skills.some(skill => 
          skillArray.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Post search error:', error);
    res.status(500).json({ error: 'Post search failed' });
  }
});

// Search users specifically
router.get('/users', (req, res) => {
  try {
    const { q: query, role, skills, location, experience } = req.query;
    
    let results = mockUsers;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.title.toLowerCase().includes(searchTerm) ||
        user.bio.toLowerCase().includes(searchTerm) ||
        user.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    if (location) {
      results = results.filter(user => 
        user.location && user.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      results = results.filter(user =>
        user.skills.some(skill => 
          skillArray.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }

    res.json(results);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'User search failed' });
  }
});

// Search roadmaps specifically
router.get('/roadmaps', (req, res) => {
  try {
    const { q: query, category, difficulty, duration } = req.query;
    
    let results = mockRoadmaps;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(roadmap =>
        roadmap.title.toLowerCase().includes(searchTerm) ||
        roadmap.description.toLowerCase().includes(searchTerm) ||
        roadmap.category.toLowerCase().includes(searchTerm) ||
        roadmap.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    if (category) {
      results = results.filter(roadmap => 
        roadmap.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (difficulty) {
      results = results.filter(roadmap => 
        roadmap.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Roadmap search error:', error);
    res.status(500).json({ error: 'Roadmap search failed' });
  }
});

// Search challenges specifically
router.get('/challenges', (req, res) => {
  try {
    const { q: query, status, difficulty, type } = req.query;
    
    let results = mockChallenges;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm) ||
        challenge.description.toLowerCase().includes(searchTerm) ||
        challenge.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    if (status) {
      results = results.filter(challenge => challenge.status === status);
    }

    if (difficulty) {
      results = results.filter(challenge => 
        challenge.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Challenge search error:', error);
    res.status(500).json({ error: 'Challenge search failed' });
  }
});

// Get trending searches
router.get('/trending', (req, res) => {
  try {
    const trendingSearches = [
      { query: 'React Native', count: 245 },
      { query: 'Python', count: 198 },
      { query: 'Machine Learning', count: 167 },
      { query: 'Web Development', count: 145 },
      { query: 'JavaScript', count: 134 },
      { query: 'Data Science', count: 123 },
      { query: 'UI/UX Design', count: 98 },
      { query: 'Node.js', count: 87 }
    ];

    res.json(trendingSearches);
  } catch (error) {
    console.error('Trending searches error:', error);
    res.status(500).json({ error: 'Failed to get trending searches' });
  }
});

// Get search suggestions
router.get('/suggestions', (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const allSuggestions = [
      'React Native Development',
      'React Hooks',
      'React Components',
      'Python Programming',
      'Python Django',
      'Python Flask',
      'Machine Learning Algorithms',
      'Machine Learning Projects',
      'JavaScript ES6',
      'JavaScript Frameworks',
      'Web Development Bootcamp',
      'Web Development Projects',
      'Data Science Fundamentals',
      'Data Science Projects',
      'UI/UX Design Principles',
      'UI/UX Design Tools',
      'Node.js Backend',
      'Node.js Express'
    ];

    const searchTerm = query.toLowerCase();
    const suggestions = allSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    ).slice(0, 8);

    res.json(suggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Save search to history
router.post('/history', (req, res) => {
  try {
    const { query, type, userId } = req.body;
    
    // In a real app, save to database
    console.log(`Saving search history: ${query} (${type}) for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

// Get user's search history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock search history
    const searchHistory = [
      { query: 'React Native', type: 'posts', timestamp: Date.now() - 3600000 },
      { query: 'Python', type: 'roadmaps', timestamp: Date.now() - 7200000 },
      { query: 'Machine Learning', type: 'challenges', timestamp: Date.now() - 10800000 },
      { query: 'Sarah Chen', type: 'users', timestamp: Date.now() - 14400000 },
      { query: 'Web Development', type: 'all', timestamp: Date.now() - 18000000 }
    ];

    res.json(searchHistory);
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

module.exports = router;
