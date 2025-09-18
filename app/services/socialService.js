import { apiService } from './apiService';

class SocialService {
  // Feed endpoints
  async getFeed(cursor = null, limit = 20) {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', limit.toString());
      
      const response = await apiService.get(`/social/feed?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  }

  async reactToPost(postId, reactionType, skill = null) {
    try {
      const response = await apiService.post('/social/react', {
        postId,
        type: reactionType,
        skill
      });
      return response.data;
    } catch (error) {
      console.error('Error reacting to post:', error);
      throw error;
    }
  }

  async savePost(postId, action) {
    try {
      const response = await apiService.post('/social/save', {
        postId,
        action
      });
      return response.data;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  async sharePost(postId, platform = null) {
    try {
      const response = await apiService.post('/social/share', {
        postId,
        platform
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  // Stories endpoints
  async getStories() {
    try {
      const response = await apiService.get('/social/stories');
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  async viewStory(storyId) {
    try {
      const response = await apiService.post('/social/stories/view', {
        storyId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking story as viewed:', error);
      throw error;
    }
  }

  async createStory(storyData) {
    try {
      const response = await apiService.post('/social/stories', storyData);
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  // Post creation endpoints
  async createPost(postData) {
    try {
      const response = await apiService.post('/social/posts', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async uploadMedia(mediaFile) {
    try {
      const formData = new FormData();
      formData.append('media', {
        uri: mediaFile.uri,
        type: mediaFile.type,
        name: mediaFile.name || 'media'
      });

      const response = await apiService.post('/social/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  // Comments endpoints
  async getComments(postId, cursor = null) {
    try {
      const params = new URLSearchParams();
      params.append('postId', postId);
      if (cursor) params.append('cursor', cursor);
      
      const response = await apiService.get(`/social/comments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async addComment(postId, content, parentCommentId = null) {
    try {
      const response = await apiService.post('/social/comments', {
        postId,
        content,
        parentCommentId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Search and discovery
  async searchPosts(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await apiService.get(`/social/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  async getTrending(category = 'all', timeframe = '24h') {
    try {
      const response = await apiService.get(`/social/trending?category=${category}&timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw error;
    }
  }

  // Real-time features
  async subscribeToUpdates(callback) {
    try {
      // WebSocket connection for real-time updates
      const ws = new WebSocket(`${process.env.WS_URL}/social/updates`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Error subscribing to updates:', error);
      throw error;
    }
  }

  // Analytics and engagement
  async trackEngagement(eventType, data) {
    try {
      const response = await apiService.post('/social/analytics', {
        event: eventType,
        data,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking engagement:', error);
      // Don't throw - analytics should fail silently
    }
  }

  // Mock data for development (remove in production)
  getMockFeedData() {
    return [
      {
        id: '1',
        type: 'milestone',
        user: {
          id: 'user1',
          name: 'Sarah Johnson',
          avatar: '👩‍💻',
          title: 'Frontend Developer',
          verified: true,
          followers: 1234,
          following: 456
        },
        content: {
          milestone: 'React Mastery',
          progress: 95,
          badge: '🏆',
          streak: 14,
          skillsEarned: ['React Hooks', 'Component Architecture', 'State Management'],
          nextGoal: 'Advanced Patterns',
          xpGained: 250
        },
        timestamp: '2h ago',
        reactions: { claps: 47, endorsements: 18, loves: 12, bookmarks: 8 },
        skills: ['React', 'JavaScript', 'TypeScript'],
        comments: 23,
        shares: 6,
        trending: true
      },
      {
        id: '2',
        type: 'project',
        user: {
          id: 'user2',
          name: 'Alex Chen',
          avatar: '👨‍💼',
          title: 'Full Stack Developer',
          verified: false,
          followers: 892,
          following: 234
        },
        content: {
          title: 'AI-Powered Task Manager',
          description: 'Built with React Native and Node.js. Features include smart prioritization, voice commands, ML-based time estimation, and real-time collaboration.',
          repo: 'github.com/alexchen/ai-task-manager',
          media: {
            type: 'video',
            thumbnail: '📱',
            duration: '2:34',
            url: 'demo_video.mp4'
          },
          techs: ['React Native', 'Node.js', 'AI/ML', 'PostgreSQL', 'WebSocket'],
          liveDemo: 'https://ai-taskmanager.demo.com',
          metrics: {
            downloads: '1.2K',
            stars: 234,
            forks: 45
          }
        },
        timestamp: '4h ago',
        reactions: { claps: 89, endorsements: 34, loves: 23, bookmarks: 56 },
        comments: 41,
        shares: 12,
        featured: true
      },
      {
        id: '3',
        type: 'challenge',
        user: {
          id: 'skillnet_official',
          name: 'SkillNet Official',
          avatar: '🏢',
          title: 'Learning Platform',
          verified: true
        },
        content: {
          title: 'JavaScript Array Methods Mastery',
          description: 'Master map, filter, reduce, and advanced array manipulation. Test your functional programming skills!',
          difficulty: 'Intermediate',
          timeLimit: 120,
          xpReward: 100,
          participantCount: 2847,
          completionRate: 73,
          tags: ['JavaScript', 'Functional Programming', 'Arrays'],
          prize: '🎁 Premium Course Access',
          deadline: '2 days left'
        },
        timestamp: 'Challenge of the day',
        reactions: { claps: 156, bookmarks: 287, attempts: 2847 }
      },
      {
        id: '4',
        type: 'mentor_tip',
        user: {
          id: 'mentor1',
          name: 'Dr. Maria Garcia',
          avatar: '👩‍🏫',
          title: 'Senior Tech Lead @ Google',
          verified: true,
          mentorBadge: '⭐',
          experience: '15+ years',
          specialties: ['System Design', 'React', 'Leadership']
        },
        content: {
          tip: 'Always write tests before implementing features. Start with edge cases first! This approach not only catches bugs early but also helps you think through the problem more thoroughly.',
          category: 'Best Practices',
          duration: '3 min read',
          difficulty: 'Beginner',
          relatedResources: [
            { title: 'TDD Complete Guide', url: '#', type: 'article' },
            { title: 'Jest Testing Tutorial', url: '#', type: 'video' },
            { title: 'Testing Best Practices', url: '#', type: 'course' }
          ],
          keyTakeaways: [
            'Write tests first',
            'Think about edge cases',
            'Improve code quality'
          ]
        },
        timestamp: '6h ago',
        reactions: { claps: 234, saves: 156, loves: 89, shares: 45 },
        comments: 67,
        shares: 23
      },
      {
        id: '5',
        type: 'ai_insight',
        user: {
          id: 'ai_mentor',
          name: 'SkillNet AI',
          avatar: '🤖',
          title: 'AI Learning Assistant',
          verified: true
        },
        content: {
          title: 'Personalized Learning Path Recommendation',
          suggestion: 'Based on your React mastery and interest in full-stack development, Next.js would be your perfect next step',
          action: 'Start Learning Path',
          confidence: 94,
          reasoning: 'You\'ve completed React fundamentals with 95% accuracy and show strong interest in SSR/SSG concepts based on your recent searches',
          estimatedTime: '4-6 weeks',
          skillsToGain: ['Next.js', 'SSR', 'API Routes', 'Deployment', 'Performance Optimization'],
          careerImpact: 'High',
          salaryBoost: '+$15K average',
          jobMatches: 127
        },
        timestamp: 'AI Suggestion',
        reactions: { claps: 67, bookmarks: 123, started: 45 }
      },
      {
        id: '6',
        type: 'milestone',
        user: {
          id: 'user3',
          name: 'Emma Rodriguez',
          avatar: '👩‍🎨',
          title: 'UI/UX Designer',
          verified: false,
          followers: 567,
          following: 189
        },
        content: {
          milestone: 'Figma to Code Challenge',
          progress: 100,
          badge: '🎨',
          achievement: 'Pixel Perfect Implementation',
          beforeAfter: {
            design: '🎨 Figma Design',
            code: '💻 React Component'
          },
          metrics: {
            accuracy: '99.2%',
            timeTaken: '45 minutes',
            rank: '#12 globally'
          }
        },
        timestamp: '8h ago',
        reactions: { claps: 123, endorsements: 45, loves: 34, bookmarks: 23 },
        skills: ['Figma', 'CSS', 'React', 'Design Systems'],
        comments: 28,
        shares: 9
      },
      {
        id: '7',
        type: 'project',
        user: {
          id: 'user4',
          name: 'David Kim',
          avatar: '👨‍💻',
          title: 'Backend Engineer',
          verified: true,
          followers: 2341,
          following: 567
        },
        content: {
          title: 'Real-time Chat Application',
          description: 'Scalable chat app with WebSocket, Redis pub/sub, and microservices architecture. Handles 10K+ concurrent users.',
          repo: 'github.com/davidkim/realtime-chat',
          media: {
            type: 'image',
            thumbnail: '💬',
            screenshots: ['chat1.png', 'chat2.png', 'chat3.png']
          },
          techs: ['Node.js', 'Socket.io', 'Redis', 'Docker', 'Kubernetes'],
          liveDemo: 'https://chat-demo.davidkim.dev',
          metrics: {
            users: '10K+',
            uptime: '99.9%',
            latency: '<50ms'
          }
        },
        timestamp: '12h ago',
        reactions: { claps: 156, endorsements: 67, bookmarks: 89 },
        comments: 34,
        shares: 18
      }
    ];
  }

  getMockStoriesData() {
    return [
      { 
        id: '1', 
        user: {
          id: 'current_user',
          name: 'You',
          avatar: '🎯'
        },
        type: 'streak', 
        content: {
          text: 'My 21-day learning streak! Just mastered React Advanced Patterns 🔥',
          streak: 21,
          milestone: 'React Mastery',
          progress: 95,
          xpGained: 500,
          nextGoal: 'Next.js Framework',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          achievements: [
            '🔥 21-day streak',
            '⚡ Advanced Patterns',
            '🏆 React Expert Badge',
            '📈 Top 5% globally'
          ]
        },
        active: true,
        hasNew: false,
        timestamp: 'now',
        viewCount: 0,
        reactions: 0
      },
      { 
        id: '2', 
        user: {
          id: 'user1',
          name: 'Sarah',
          avatar: '👩‍💻'
        },
        type: 'milestone', 
        content: {
          text: 'Just earned my React Mastery badge! 95% roadmap complete 🏆',
          milestone: 'React Mastery',
          badge: '🏆',
          progress: 95,
          skills: ['React Hooks', 'Context API', 'Performance'],
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          celebration: 'Unlocked Senior Developer Path!'
        },
        active: false,
        hasNew: true,
        timestamp: '2h ago',
        viewCount: 247,
        reactions: 156
      },
      { 
        id: '3', 
        user: {
          id: 'user2',
          name: 'Alex',
          avatar: '👨‍💼'
        },
        type: 'project', 
        content: {
          text: 'Deployed my AI Task Manager to production! 10K+ users already 🚀',
          project: 'AI Task Manager Pro',
          metrics: {
            users: '10K+',
            rating: '4.9/5',
            downloads: '2.3M'
          },
          tech: ['React Native', 'AI/ML', 'Node.js', 'PostgreSQL'],
          achievement: 'Featured on App Store',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          demo: 'Live Demo Available'
        },
        active: false,
        hasNew: true,
        timestamp: '4h ago',
        viewCount: 1567,
        reactions: 432
      },
      { 
        id: '4', 
        user: {
          id: 'mentor1',
          name: 'Dr. Garcia',
          avatar: '👩‍🏫'
        },
        type: 'tip', 
        content: {
          text: '💡 Pro tip: Profile before optimizing!\n\nDon\'t guess where performance bottlenecks are - measure them! 📊',
          category: 'Performance',
          tools: ['React DevTools', 'Lighthouse', 'Chrome DevTools'],
          code: 'React.memo(), useMemo(), useCallback()',
          keyTakeaway: 'Premature optimization is the root of all evil',
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          experience: '15+ years at Google'
        },
        active: false,
        hasNew: false,
        timestamp: '6h ago',
        viewCount: 892,
        reactions: 234
      },
      { 
        id: '5', 
        user: {
          id: 'ai_mentor',
          name: 'SkillNet AI',
          avatar: '🤖'
        },
        type: 'insight', 
        content: {
          text: '🎯 Your learning velocity is 3x faster than average!\n\nReady for Next.js based on your React mastery',
          confidence: 96,
          recommendation: 'Next.js Full-Stack Path',
          impact: 'High career growth potential',
          timeEstimate: '4-6 weeks',
          salaryBoost: '+$15K average',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          nextSkills: ['SSR/SSG', 'API Routes', 'Performance']
        },
        active: false,
        hasNew: true,
        timestamp: '1d ago',
        viewCount: 678,
        reactions: 189
      },
      { 
        id: '6', 
        user: {
          id: 'user3',
          name: 'Emma',
          avatar: '👩‍🎨'
        },
        type: 'challenge_win', 
        content: {
          text: 'Won the Design System Challenge! 🏆\n\nRank #1 out of 2,847 participants',
          challenge: 'Component Library Creation',
          rank: '#1 globally',
          participants: '2,847',
          prize: 'Premium Course + Mentorship',
          accuracy: '99.8%',
          timeToComplete: '2h 34m',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          skills: ['Design Systems', 'Figma', 'React', 'Accessibility']
        },
        active: false,
        hasNew: false,
        timestamp: '2d ago',
        viewCount: 2341,
        reactions: 567
      },
      {
        id: '7',
        user: {
          id: 'user4',
          name: 'David',
          avatar: '👨‍💻'
        },
        type: 'breakthrough',
        content: {
          text: 'Finally mastered system design! 🧠💡\n\nThe moment when scalability patterns clicked',
          concept: 'Microservices Architecture',
          breakthrough: 'Understanding when to split vs monolith',
          realWorldApp: 'Built chat app handling 10K+ users',
          keyLearning: 'Conway\'s Law in action',
          background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
          nextLevel: 'Ready for Staff Engineer role'
        },
        active: false,
        hasNew: true,
        timestamp: '3d ago',
        viewCount: 1234,
        reactions: 345
      }
    ];
  }
}

export const socialService = new SocialService();
