const API_BASE_URL = 'http://localhost:3000/api';

// Import ProfileService
import ProfileService from './profileService';

// Comprehensive test categories for different departments
const TEST_CATEGORIES = {
  CSE: {
    name: 'Computer Science & Engineering',
    icon: 'code-slash',
    color: '#007AFF',
    subCategories: ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Networking', 'AI/ML', 'Cybersecurity']
  },
  BBA: {
    name: 'Business Administration',
    icon: 'briefcase',
    color: '#34C759',
    subCategories: ['Management', 'Marketing', 'Finance', 'HR', 'Operations', 'Strategy', 'Entrepreneurship']
  },
  EEE: {
    name: 'Electrical & Electronics Engineering',
    icon: 'flash',
    color: '#FF9500',
    subCategories: ['Circuit Analysis', 'Electronics', 'Power Systems', 'Control Systems', 'Signal Processing', 'Communication']
  },
  MSJ: {
    name: 'Mass Communication & Journalism',
    icon: 'newspaper',
    color: '#FF3B30',
    subCategories: ['News Writing', 'Media Law', 'Digital Media', 'Broadcasting', 'Public Relations', 'Advertising']
  },
  CIVIL: {
    name: 'Civil Engineering',
    icon: 'construct',
    color: '#8E4EC6',
    subCategories: ['Structural Engineering', 'Geotechnical', 'Transportation', 'Environmental', 'Construction Management']
  },
  MECHANICAL: {
    name: 'Mechanical Engineering',
    icon: 'settings',
    color: '#FF6347',
    subCategories: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Automotive']
  },
  PHARMACY: {
    name: 'Pharmacy',
    icon: 'medical',
    color: '#32CD32',
    subCategories: ['Pharmacology', 'Pharmaceutical Chemistry', 'Clinical Pharmacy', 'Drug Development']
  },
  ENGLISH: {
    name: 'English Literature',
    icon: 'book',
    color: '#9932CC',
    subCategories: ['Literature Analysis', 'Creative Writing', 'Grammar', 'Communication Skills', 'Translation']
  }
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async toggleUserMode(userId, mode) {
    return this.request(`/users/${userId}/toggleMode`, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  // Roadmap endpoints
  async getRoadmaps() {
    return this.request('/roadmaps');
  }

  async getRoadmap(roadmapId) {
    return this.request(`/roadmaps/${roadmapId}`);
  }

  async updateRoadmapProgress(roadmapId, progressData) {
    return this.request(`/roadmaps/${roadmapId}/progress`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  // Test endpoints
  async getTests() {
    return this.request('/tests');
  }

  async getTest(testId) {
    return this.request(`/tests/${testId}`);
  }

  async submitTest(testId, answers) {
    return this.request(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // HR endpoints
  async getCandidates(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/hr/candidates${queryParams ? `?${queryParams}` : ''}`);
  }

  async getCandidate(candidateId) {
    return this.request(`/hr/candidates/${candidateId}`);
  }

  async saveCandidate(candidateId) {
    return this.request('/hr/saveCandidate', {
      method: 'POST',
      body: JSON.stringify({ candidateId }),
    });
  }

  async getSavedCandidates(hrId) {
    return this.request(`/hr/savedCandidates/${hrId}`);
  }

  async sendInterviewRequest(requestData) {
    return this.request('/hr/interviewRequest', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getInterviewRequests(hrId) {
    return this.request(`/hr/interviewRequests/${hrId}`);
  }
}

// Social Feed API functions
const socialFeedAPI = {
  // Get social feed posts
  getFeed: async (cursor = null, limit = 10) => {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', limit.toString());
      
      const response = await fetch(`${API_BASE_URL}/social/feed?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Feed fetch error:', error);
      throw error;
    }
  },

  // Get skill moments/stories
  getStories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/stories`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Stories fetch error:', error);
      throw error;
    }
  },

  // React to a post (clap, endorse skill)
  reactToPost: async (postId, reactionType, skillName = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/react`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postId,
          type: reactionType, // 'clap', 'endorse', 'save'
          skill: skillName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to react to post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('React error:', error);
      throw error;
    }
  },

  // Save/unsave a post
  savePost: async (postId, action = 'save') => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postId,
          action // 'save' or 'unsave'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save/unsave post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Save post error:', error);
      throw error;
    }
  },

  // Submit challenge answer
  submitChallenge: async (challengeId, answer) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          challengeId,
          answer
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit challenge');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Challenge submit error:', error);
      throw error;
    }
  },

  // Create a new post
  createPost: async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },

    // Get user's XP and streak data
  getUserStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('User stats error:', error);
      throw error;
    }
  },

  // Comment endpoints
  getComments: async (postId, cursor = null) => {
    try {
      const params = new URLSearchParams();
      params.append('postId', postId);
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`${API_BASE_URL}/social/comments?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  addComment: async (postId, content, parentCommentId = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postId,
          content,
          parentCommentId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  likeComment: async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/comments/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like comment');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Like comment error:', error);
      throw error;
    }
  },

  // Challenge endpoints
  getChallenges: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API_BASE_URL}/challenges?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get challenges error:', error);
      throw error;
    }
  },

  getChallengeDetails: async (challengeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenge details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get challenge details error:', error);
      throw error;
    }
  },

  startChallenge: async (challengeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start challenge');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Start challenge error:', error);
      throw error;
    }
  },

  submitChallenge: async (challengeId, submissionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit challenge');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Submit challenge error:', error);
      throw error;
    }
  },

  getChallengeLeaderboard: async (timeframe = 'all', limit = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('timeframe', timeframe);
      params.append('limit', limit.toString());
      
      const response = await fetch(`${API_BASE_URL}/challenges/leaderboard?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  },

  getUserChallengeProgress: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/user/progress`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user challenge progress');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get user challenge progress error:', error);
      throw error;
    }
  },

  getDailyChallenge: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/daily`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily challenge');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get daily challenge error:', error);
      throw error;
    }
  },

  // Update user XP
  updateUserXP: async (xpGained, source) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/xp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          xpGained,
          source // 'challenge', 'clap', 'endorse', etc.
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update XP');
      }
      
      return await response.json();
    } catch (error) {
      console.error('XP update error:', error);
      throw error;
    }
  },
};

// Create and export a singleton instance
const apiService = new ApiService();

// Create profile service instance
const profileService = new ProfileService(apiService);

export default apiService;

export {
  apiService,
  profileService,
  socialFeedAPI,
};
