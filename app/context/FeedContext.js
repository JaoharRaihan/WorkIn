import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useProfile } from './ProfileContext';

// Feed Action Types
const FeedActionTypes = {
  SET_FEED_DATA: 'SET_FEED_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  ADD_POST: 'ADD_POST',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
  LIKE_POST: 'LIKE_POST',
  UNLIKE_POST: 'UNLIKE_POST',
  CLAP_POST: 'CLAP_POST',
  SAVE_POST: 'SAVE_POST',
  UNSAVE_POST: 'UNSAVE_POST',
  ENDORSE_SKILL: 'ENDORSE_SKILL',
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_FILTER: 'UPDATE_FILTER',
  MARK_POST_SEEN: 'MARK_POST_SEEN',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS',
  CLEAR_FEED: 'CLEAR_FEED'
};

// Feed Post Types
const PostTypes = {
  MILESTONE: 'milestone',
  PROJECT: 'project',
  MENTOR_TIP: 'mentor_tip',
  CHALLENGE: 'challenge',
  AI_INSIGHT: 'ai_insight',
  SKILL_VERIFICATION: 'skill_verification',
  BADGE_EARNED: 'badge_earned',
  LEARNING_STREAK: 'learning_streak',
  PROJECT_SHOWCASE: 'project_showcase',
  KNOWLEDGE_SHARE: 'knowledge_share'
};

// Initial Feed State
const initialFeedState = {
  // Feed Posts
  posts: [],
  
  // Story Rail
  stories: [],
  
  // User Interactions
  likedPosts: new Set(),
  savedPosts: new Set(),
  clapCounts: {},
  seenPosts: new Set(),
  
  // Feed Filters
  activeFilter: 'all', // all, following, trending, challenges
  feedType: 'fun-with-learning', // fun-with-learning, professional
  
  // UI State
  loading: false,
  refreshing: false,
  error: null,
  hasNextPage: true,
  currentPage: 1,
  
  // User Engagement Stats
  userStats: {
    totalClaps: 0,
    totalSaves: 0,
    streakCount: 0,
    dailyXP: 0,
    weeklyXP: 0,
    challengesCompleted: 0,
    skillsEndorsed: 0,
  },
  
  // Algorithm Preferences
  preferences: {
    showChallenges: true,
    showMentorTips: true,
    showAIInsights: true,
    showMilestones: true,
    showProjects: true,
    prioritizeFollowing: false,
    difficulty: 'intermediate', // beginner, intermediate, advanced
  }
};

// Feed Reducer
function feedReducer(state, action) {
  switch (action.type) {
    case FeedActionTypes.SET_FEED_DATA:
      return {
        ...state,
        posts: action.payload.posts || state.posts,
        stories: action.payload.stories || state.stories,
        loading: false,
        error: null,
      };
      
    case FeedActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case FeedActionTypes.SET_REFRESHING:
      return {
        ...state,
        refreshing: action.payload,
      };
      
    case FeedActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };
      
    case FeedActionTypes.ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
      
    case FeedActionTypes.UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? { ...post, ...action.payload } : post
        ),
      };
      
    case FeedActionTypes.DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
      };
      
    case FeedActionTypes.LIKE_POST:
      const likedPosts = new Set(state.likedPosts);
      likedPosts.add(action.payload.postId);
      
      return {
        ...state,
        likedPosts,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, likes: post.likes + 1, isLiked: true }
            : post
        ),
      };
      
    case FeedActionTypes.UNLIKE_POST:
      const unlikedPosts = new Set(state.likedPosts);
      unlikedPosts.delete(action.payload.postId);
      
      return {
        ...state,
        likedPosts: unlikedPosts,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, likes: Math.max(0, post.likes - 1), isLiked: false }
            : post
        ),
      };
      
    case FeedActionTypes.CLAP_POST:
      const currentClaps = state.clapCounts[action.payload.postId] || 0;
      const newClaps = Math.min(currentClaps + action.payload.count, 50); // Max 50 claps per post
      
      return {
        ...state,
        clapCounts: {
          ...state.clapCounts,
          [action.payload.postId]: newClaps,
        },
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, claps: post.claps + action.payload.count }
            : post
        ),
        userStats: {
          ...state.userStats,
          totalClaps: state.userStats.totalClaps + action.payload.count,
          dailyXP: state.userStats.dailyXP + (action.payload.count * 2), // 2 XP per clap
        },
      };
      
    case FeedActionTypes.SAVE_POST:
      const savedPosts = new Set(state.savedPosts);
      savedPosts.add(action.payload.postId);
      
      return {
        ...state,
        savedPosts,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, saves: post.saves + 1, isSaved: true }
            : post
        ),
        userStats: {
          ...state.userStats,
          totalSaves: state.userStats.totalSaves + 1,
        },
      };
      
    case FeedActionTypes.UNSAVE_POST:
      const unsavedPosts = new Set(state.savedPosts);
      unsavedPosts.delete(action.payload.postId);
      
      return {
        ...state,
        savedPosts: unsavedPosts,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, saves: Math.max(0, post.saves - 1), isSaved: false }
            : post
        ),
        userStats: {
          ...state.userStats,
          totalSaves: Math.max(0, state.userStats.totalSaves - 1),
        },
      };
      
    case FeedActionTypes.ENDORSE_SKILL:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId && post.type === PostTypes.SKILL_VERIFICATION
            ? { ...post, endorsements: post.endorsements + 1 }
            : post
        ),
        userStats: {
          ...state.userStats,
          skillsEndorsed: state.userStats.skillsEndorsed + 1,
          dailyXP: state.userStats.dailyXP + 5, // 5 XP for skill endorsement
        },
      };
      
    case FeedActionTypes.UPDATE_FILTER:
      return {
        ...state,
        activeFilter: action.payload,
      };
      
    case FeedActionTypes.MARK_POST_SEEN:
      const seenPosts = new Set(state.seenPosts);
      seenPosts.add(action.payload.postId);
      
      return {
        ...state,
        seenPosts,
      };
      
    case FeedActionTypes.UPDATE_USER_STATS:
      return {
        ...state,
        userStats: { ...state.userStats, ...action.payload },
      };
      
    case FeedActionTypes.CLEAR_FEED:
      return initialFeedState;
      
    default:
      return state;
  }
}

// Create Feed Context
const FeedContext = createContext();

// Feed Provider Component
export function FeedProvider({ children }) {
  const [state, dispatch] = useReducer(feedReducer, initialFeedState);
  const { user, isAuthenticated } = useApp();
  const { profileData, gainXP } = useProfile();

  // Load feed data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeFeedData();
    }
  }, [isAuthenticated, user]);

  // Initialize feed with mock data
  const initializeFeedData = async () => {
    try {
      dispatch({ type: FeedActionTypes.SET_LOADING, payload: true });
      
      // Generate mock feed posts
      const mockPosts = generateMockFeedPosts();
      const mockStories = generateMockStories();
      
      dispatch({
        type: FeedActionTypes.SET_FEED_DATA,
        payload: { posts: mockPosts, stories: mockStories }
      });
      
    } catch (error) {
      console.error('Error initializing feed:', error);
      dispatch({ type: FeedActionTypes.SET_ERROR, payload: 'Failed to load feed' });
    }
  };

  // Generate mock feed posts
  const generateMockFeedPosts = () => {
    const mockUsers = [
      { id: 1, name: 'Sarah Johnson', avatar: null, title: 'UI/UX Designer' },
      { id: 2, name: 'Mike Chen', avatar: null, title: 'Full Stack Developer' },
      { id: 3, name: 'Alex Rivera', avatar: null, title: 'Data Scientist' },
      { id: 4, name: 'Jessica Wu', avatar: null, title: 'Mobile Developer' },
      { id: 5, name: 'David Kumar', avatar: null, title: 'DevOps Engineer' },
    ];

    const posts = [
      // Milestone Post
      {
        id: 1,
        type: PostTypes.MILESTONE,
        author: mockUsers[0],
        title: '🎉 Just completed my 30-day React Native streak!',
        content: 'Finally hit my goal of coding every day for a month. The key was starting small - just 15 minutes a day turned into hours of deep learning!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 87,
        claps: 156,
        saves: 23,
        comments: 12,
        isLiked: false,
        isSaved: false,
        metadata: {
          milestone: 'learning_streak',
          streakCount: 30,
          skill: 'React Native',
          badge: { name: 'Streak Master', icon: '🔥' }
        },
        media: null,
        trending: true,
      },
      
      // Project Showcase
      {
        id: 2,
        type: PostTypes.PROJECT_SHOWCASE,
        author: mockUsers[1],
        title: '🚀 Built my first AI-powered task manager!',
        content: 'Used React Native + OpenAI API to create smart task prioritization. The AI learns from your habits and suggests optimal work schedules. Code is open source!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 234,
        claps: 432,
        saves: 89,
        comments: 34,
        isLiked: true,
        isSaved: true,
        metadata: {
          project: {
            name: 'AI Task Manager',
            technologies: ['React Native', 'OpenAI API', 'Firebase'],
            githubUrl: 'https://github.com/mikechen/ai-task-manager',
            demoUrl: 'https://ai-tasks-demo.com'
          }
        },
        media: {
          type: 'image',
          url: null, // placeholder
          thumbnail: null
        },
        trending: true,
      },
      
      // Mentor Tip
      {
        id: 3,
        type: PostTypes.MENTOR_TIP,
        author: { id: 999, name: 'SkillNet Mentor', avatar: null, title: 'Senior Engineer @Google', verified: true },
        title: '💡 Pro Tip: State Management in React Native',
        content: 'Stop using useState for everything! Here\'s when to use each:\n\n• useState: Simple component state\n• useReducer: Complex state logic\n• Context: Shared state (use sparingly)\n• Redux: Large apps with complex flows\n\nStart simple, scale when needed 🎯',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 445,
        claps: 823,
        saves: 156,
        comments: 67,
        isLiked: false,
        isSaved: true,
        metadata: {
          tipCategory: 'React Native',
          difficulty: 'intermediate',
          estimatedReadTime: 2
        },
        trending: true,
      },
      
      // Challenge Post
      {
        id: 4,
        type: PostTypes.CHALLENGE,
        author: { id: 1000, name: 'SkillNet Challenges', avatar: null, title: 'Daily Coding Challenge' },
        title: '🧩 Daily Challenge: Array Manipulation',
        content: 'Can you solve this in O(n) time?\n\nGiven an array of integers, find the two numbers that add up to a specific target.\n\nExample: [2, 7, 11, 15], target = 9\nOutput: [0, 1] (indices of 2 and 7)',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        likes: 89,
        claps: 134,
        saves: 67,
        comments: 23,
        isLiked: false,
        isSaved: false,
        metadata: {
          challenge: {
            difficulty: 'medium',
            category: 'algorithms',
            timeLimit: 30, // minutes
            xpReward: 50,
            participants: 234
          }
        },
        trending: false,
      },
      
      // AI Insight
      {
        id: 5,
        type: PostTypes.AI_INSIGHT,
        author: { id: 1001, name: 'SkillNet AI', avatar: null, title: 'Your Learning Assistant' },
        title: '🤖 Personalized Learning Insight',
        content: 'Based on your learning pattern, you\'re 73% more productive when learning JavaScript in the morning. Your focus peaks at 9:47 AM!\n\nSuggestion: Schedule complex JS concepts for tomorrow morning 🌅',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 34,
        claps: 67,
        saves: 45,
        comments: 8,
        isLiked: false,
        isSaved: false,
        metadata: {
          insight: {
            type: 'productivity_pattern',
            confidence: 0.87,
            skill: 'JavaScript',
            optimalTime: '09:47',
            productivityIncrease: 73
          }
        },
        trending: false,
      },

      // Skill Verification
      {
        id: 6,
        type: PostTypes.SKILL_VERIFICATION,
        author: mockUsers[2],
        title: '✅ JavaScript Expert - Verified!',
        content: 'Just aced the advanced JavaScript assessment! 98/100 score 🎯\n\nKey topics covered:\n• Closures & Scope\n• Async/Await patterns\n• Prototype inheritance\n• Memory optimization\n\nFeeling confident about my JS skills now!',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        likes: 156,
        claps: 289,
        saves: 67,
        comments: 24,
        endorsements: 8,
        isLiked: false,
        isSaved: false,
        metadata: {
          skill: 'JavaScript',
          testScore: 98,
          level: 'Expert',
          badge: { name: 'JS Expert', icon: '🏆' }
        },
      },

      // Badge Earned
      {
        id: 7,
        type: PostTypes.BADGE_EARNED,
        author: mockUsers[3],
        title: '🏅 New Badge Unlocked: Code Reviewer',
        content: 'Earned my Code Reviewer badge after helping 10+ developers with their projects! \n\nNothing beats the feeling of helping others grow 🌱\n\n#CommunityFirst #SkillNet',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likes: 78,
        claps: 145,
        saves: 23,
        comments: 15,
        isLiked: true,
        isSaved: false,
        metadata: {
          badge: {
            name: 'Code Reviewer',
            description: 'Helped 10+ developers with code reviews',
            rarity: 'uncommon',
            icon: '👨‍💻'
          }
        },
      },
    ];

    return posts;
  };

  // Generate mock stories
  const generateMockStories = () => {
    return [
      {
        id: 1,
        author: { id: 1, name: 'Sarah', avatar: null },
        type: 'milestone',
        title: '30-day streak!',
        thumbnail: null,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        seen: false,
      },
      {
        id: 2,
        author: { id: 2, name: 'Mike', avatar: null },
        type: 'project',
        title: 'AI Task Manager',
        thumbnail: null,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        seen: false,
      },
      {
        id: 3,
        author: { id: 3, name: 'Alex', avatar: null },
        type: 'skill_verification',
        title: 'JS Expert ✅',
        thumbnail: null,
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        seen: true,
      },
    ];
  };

  // Feed Actions
  const likePost = useCallback((postId) => {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      dispatch({ type: FeedActionTypes.UNLIKE_POST, payload: { postId } });
    } else {
      dispatch({ type: FeedActionTypes.LIKE_POST, payload: { postId } });
      // Award XP for engagement
      gainXP(1);
    }
  }, [state.posts, gainXP]);

  const clapPost = useCallback((postId, count = 1) => {
    dispatch({ type: FeedActionTypes.CLAP_POST, payload: { postId, count } });
    // Award XP for clapping
    gainXP(count * 2);
  }, [gainXP]);

  const savePost = useCallback((postId) => {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (post.isSaved) {
      dispatch({ type: FeedActionTypes.UNSAVE_POST, payload: { postId } });
    } else {
      dispatch({ type: FeedActionTypes.SAVE_POST, payload: { postId } });
      // Award XP for saving
      gainXP(1);
    }
  }, [state.posts, gainXP]);

  const endorseSkill = useCallback((postId, skillName) => {
    dispatch({ type: FeedActionTypes.ENDORSE_SKILL, payload: { postId, skillName } });
    // Award XP for skill endorsement
    gainXP(5);
  }, [gainXP]);

  const markPostSeen = useCallback((postId) => {
    if (!state.seenPosts.has(postId)) {
      dispatch({ type: FeedActionTypes.MARK_POST_SEEN, payload: { postId } });
    }
  }, [state.seenPosts]);

  const updateFilter = useCallback((filter) => {
    dispatch({ type: FeedActionTypes.UPDATE_FILTER, payload: filter });
  }, []);

  const refreshFeed = useCallback(async () => {
    dispatch({ type: FeedActionTypes.SET_REFRESHING, payload: true });
    
    // Simulate API call
    setTimeout(() => {
      // In real app, fetch fresh data from API
      const freshPosts = generateMockFeedPosts();
      dispatch({
        type: FeedActionTypes.SET_FEED_DATA,
        payload: { posts: freshPosts }
      });
      dispatch({ type: FeedActionTypes.SET_REFRESHING, payload: false });
    }, 1000);
  }, []);

  const addPost = useCallback((postData) => {
    const newPost = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      likes: 0,
      claps: 0,
      saves: 0,
      comments: 0,
      isLiked: false,
      isSaved: false,
      trending: false,
      ...postData,
    };
    
    dispatch({ type: FeedActionTypes.ADD_POST, payload: newPost });
  }, []);

  // Get filtered posts
  const getFilteredPosts = useCallback(() => {
    let filtered = state.posts;
    
    switch (state.activeFilter) {
      case 'trending':
        filtered = state.posts.filter(post => post.trending);
        break;
      case 'challenges':
        filtered = state.posts.filter(post => post.type === PostTypes.CHALLENGE);
        break;
      case 'following':
        // In real app, filter by followed users
        filtered = state.posts.filter(post => post.author.id <= 3);
        break;
      default:
        filtered = state.posts;
    }
    
    return filtered;
  }, [state.posts, state.activeFilter]);

  // Context value
  const value = {
    // State
    ...state,
    filteredPosts: getFilteredPosts(),
    
    // Actions
    likePost,
    clapPost,
    savePost,
    endorseSkill,
    markPostSeen,
    updateFilter,
    refreshFeed,
    addPost,
    
    // Constants
    PostTypes,
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
}

// Custom Hook
export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}

// Export action types and post types
export { FeedActionTypes, PostTypes };
