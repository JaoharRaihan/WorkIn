import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useProfile } from './ProfileContext';

// Roadmap Action Types
const RoadmapActionTypes = {
  SET_ROADMAPS: 'SET_ROADMAPS',
  SET_USER_PROGRESS: 'SET_USER_PROGRESS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  START_ROADMAP: 'START_ROADMAP',
  COMPLETE_STEP: 'COMPLETE_STEP',
  UPDATE_STEP_PROGRESS: 'UPDATE_STEP_PROGRESS',
  UNLOCK_STEP: 'UNLOCK_STEP',
  EARN_ROADMAP_BADGE: 'EARN_ROADMAP_BADGE',
  UPDATE_DAILY_STREAK: 'UPDATE_DAILY_STREAK',
  SET_ACTIVE_ROADMAP: 'SET_ACTIVE_ROADMAP',
  BOOKMARK_ROADMAP: 'BOOKMARK_ROADMAP',
  UNBOOKMARK_ROADMAP: 'UNBOOKMARK_ROADMAP',
  COMPLETE_ROADMAP: 'COMPLETE_ROADMAP',
  RESET_ROADMAP_PROGRESS: 'RESET_ROADMAP_PROGRESS',
  UPDATE_LEARNING_STATS: 'UPDATE_LEARNING_STATS',
  CLEAR_ROADMAP_DATA: 'CLEAR_ROADMAP_DATA'
};

// Initial Roadmap State
const initialRoadmapState = {
  // Available Roadmaps
  allRoadmaps: [],
  featuredRoadmaps: [],
  
  // User Progress
  userProgress: {}, // roadmapId -> progress object
  activeRoadmaps: [], // roadmaps user is currently taking
  completedRoadmaps: [], // roadmaps user has finished
  bookmarkedRoadmaps: new Set(), // roadmaps user bookmarked
  
  // Current Learning Session
  activeRoadmap: null,
  currentStep: null,
  
  // Learning Statistics
  learningStats: {
    totalTimeSpent: 0, // minutes
    stepsCompleted: 0,
    roadmapsCompleted: 0,
    skillsLearned: 0,
    testsPasssed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    weeklyGoal: 30, // minutes per day
    weeklyProgress: 0,
  },
  
  // UI State
  loading: false,
  error: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'popularity', // popularity, newest, difficulty, duration
};

// Sample Roadmaps Data
const sampleRoadmaps = [
  {
    id: 1,
    title: 'React Native Development',
    description: 'Master mobile app development with React Native from basics to advanced concepts',
    category: 'Mobile Development',
    difficulty: 'Intermediate',
    estimatedTime: '8 weeks',
    skillsYouWillLearn: ['React Native', 'JavaScript', 'Mobile UI/UX', 'API Integration', 'State Management'],
    prerequisities: ['JavaScript Basics', 'React Fundamentals'],
    learners: 12543,
    rating: 4.8,
    instructor: 'Sarah Chen',
    thumbnail: 'react-native-thumb',
    isPremium: false,
    steps: [
      {
        id: 1,
        title: 'React Native Fundamentals',
        description: 'Learn the core concepts of React Native development',
        type: 'lesson',
        estimatedTime: 45,
        content: {
          video: 'react-native-intro-video',
          reading: 'react-native-intro-article',
          examples: ['hello-world', 'basic-components']
        },
        test: {
          id: 101,
          type: 'mcq',
          questions: 10,
          passingScore: 80
        },
        isLocked: false,
        prerequisiteSteps: []
      },
      {
        id: 2,
        title: 'Navigation & Routing',
        description: 'Implement navigation between screens in React Native',
        type: 'lesson',
        estimatedTime: 60,
        content: {
          video: 'navigation-tutorial',
          reading: 'navigation-guide',
          examples: ['stack-navigation', 'tab-navigation']
        },
        test: {
          id: 102,
          type: 'coding',
          description: 'Build a navigation system',
          passingScore: 75
        },
        isLocked: true,
        prerequisiteSteps: [1]
      },
      {
        id: 3,
        title: 'State Management with Redux',
        description: 'Learn how to manage app state effectively',
        type: 'lesson',
        estimatedTime: 90,
        content: {
          video: 'redux-tutorial',
          reading: 'redux-guide',
          examples: ['redux-setup', 'actions-reducers']
        },
        test: {
          id: 103,
          type: 'project',
          description: 'Build a todo app with Redux',
          passingScore: 80
        },
        isLocked: true,
        prerequisiteSteps: [1, 2]
      },
      {
        id: 4,
        title: 'API Integration',
        description: 'Connect your app to backend services',
        type: 'lesson',
        estimatedTime: 75,
        content: {
          video: 'api-integration-tutorial',
          reading: 'api-best-practices',
          examples: ['fetch-api', 'async-await']
        },
        test: {
          id: 104,
          type: 'coding',
          description: 'Integrate REST API',
          passingScore: 85
        },
        isLocked: true,
        prerequisiteSteps: [1, 2, 3]
      },
      {
        id: 5,
        title: 'Final Project',
        description: 'Build a complete mobile app',
        type: 'project',
        estimatedTime: 180,
        content: {
          instructions: 'Build a weather app with all learned concepts',
          requirements: ['Navigation', 'API calls', 'State management', 'UI/UX'],
          resources: ['weather-api-docs', 'design-templates']
        },
        test: {
          id: 105,
          type: 'project_review',
          description: 'Submit your complete weather app',
          passingScore: 90
        },
        isLocked: true,
        prerequisiteSteps: [1, 2, 3, 4]
      }
    ],
    badge: {
      id: 'react-native-expert',
      name: 'React Native Expert',
      description: 'Mastered React Native development',
      icon: 'react-native-badge'
    }
  },
  {
    id: 2,
    title: 'Full Stack JavaScript',
    description: 'Complete journey from frontend to backend development',
    category: 'Web Development',
    difficulty: 'Advanced',
    estimatedTime: '12 weeks',
    skillsYouWillLearn: ['Node.js', 'Express', 'MongoDB', 'React', 'REST APIs'],
    prerequisities: ['JavaScript ES6+', 'HTML/CSS'],
    learners: 8967,
    rating: 4.9,
    instructor: 'Alex Rodriguez',
    thumbnail: 'fullstack-js-thumb',
    isPremium: true,
    steps: [
      {
        id: 1,
        title: 'Node.js Fundamentals',
        description: 'Server-side JavaScript development',
        type: 'lesson',
        estimatedTime: 60,
        isLocked: false,
        prerequisiteSteps: []
      },
      {
        id: 2,
        title: 'Express.js Framework',
        description: 'Build web servers with Express',
        type: 'lesson',
        estimatedTime: 75,
        isLocked: true,
        prerequisiteSteps: [1]
      },
      {
        id: 3,
        title: 'Database Integration',
        description: 'Connect to MongoDB database',
        type: 'lesson',
        estimatedTime: 90,
        isLocked: true,
        prerequisiteSteps: [1, 2]
      }
    ],
    badge: {
      id: 'fullstack-developer',
      name: 'Full Stack Developer',
      description: 'Complete full stack development mastery',
      icon: 'fullstack-badge'
    }
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles and create beautiful user interfaces',
    category: 'Design',
    difficulty: 'Beginner',
    estimatedTime: '6 weeks',
    skillsYouWillLearn: ['Figma', 'Design Principles', 'User Research', 'Prototyping'],
    prerequisities: [],
    learners: 15234,
    rating: 4.7,
    instructor: 'Emma Thompson',
    thumbnail: 'uiux-design-thumb',
    isPremium: false,
    steps: [
      {
        id: 1,
        title: 'Design Principles',
        description: 'Understanding core design concepts',
        type: 'lesson',
        estimatedTime: 45,
        isLocked: false,
        prerequisiteSteps: []
      },
      {
        id: 2,
        title: 'Figma Basics',
        description: 'Learn Figma design tool',
        type: 'lesson',
        estimatedTime: 60,
        isLocked: true,
        prerequisiteSteps: [1]
      }
    ],
    badge: {
      id: 'ui-designer',
      name: 'UI Designer',
      description: 'Mastered UI design fundamentals',
      icon: 'design-badge'
    }
  },
  {
    id: 4,
    title: 'Python for Data Science',
    description: 'Analyze data and build machine learning models',
    category: 'Data Science',
    difficulty: 'Intermediate',
    estimatedTime: '10 weeks',
    skillsYouWillLearn: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
    prerequisities: ['Python Basics'],
    learners: 9876,
    rating: 4.6,
    instructor: 'Dr. Michael Chen',
    thumbnail: 'python-data-thumb',
    isPremium: true,
    steps: [
      {
        id: 1,
        title: 'Data Analysis with Pandas',
        description: 'Manipulate and analyze data',
        type: 'lesson',
        estimatedTime: 90,
        isLocked: false,
        prerequisiteSteps: []
      }
    ],
    badge: {
      id: 'data-scientist',
      name: 'Data Scientist',
      description: 'Data science and ML expertise',
      icon: 'data-badge'
    }
  }
];

// Roadmap Reducer
function roadmapReducer(state, action) {
  switch (action.type) {
    case RoadmapActionTypes.SET_ROADMAPS:
      return {
        ...state,
        allRoadmaps: action.payload,
        featuredRoadmaps: action.payload.filter(r => r.rating >= 4.7).slice(0, 3),
        loading: false,
        error: null,
      };
      
    case RoadmapActionTypes.SET_USER_PROGRESS:
      return {
        ...state,
        userProgress: action.payload,
        loading: false,
      };
      
    case RoadmapActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case RoadmapActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case RoadmapActionTypes.START_ROADMAP:
      const roadmapId = action.payload;
      const roadmap = state.allRoadmaps.find(r => r.id === roadmapId);
      
      if (!roadmap) return state;
      
      const initialProgress = {
        roadmapId,
        startedDate: new Date().toISOString(),
        currentStepIndex: 0,
        completedSteps: [],
        stepsProgress: {},
        totalTimeSpent: 0,
        isCompleted: false,
        lastAccessDate: new Date().toISOString(),
      };
      
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [roadmapId]: initialProgress,
        },
        activeRoadmaps: [...state.activeRoadmaps, roadmapId],
        activeRoadmap: roadmapId,
      };
      
    case RoadmapActionTypes.COMPLETE_STEP:
      const { roadmapId: rmId, stepId, timeSpent, testScore } = action.payload;
      const currentProgress = state.userProgress[rmId];
      
      if (!currentProgress) return state;
      
      const updatedCompletedSteps = [...currentProgress.completedSteps, stepId];
      const updatedStepsProgress = {
        ...currentProgress.stepsProgress,
        [stepId]: {
          completedDate: new Date().toISOString(),
          timeSpent,
          testScore,
          status: 'completed'
        }
      };
      
      const roadmapForStep = state.allRoadmaps.find(r => r.id === rmId);
      const currentStepIndex = roadmapForStep.steps.findIndex(s => s.id === stepId);
      const nextStepIndex = currentStepIndex + 1;
      
      // Check if roadmap is completed
      const isRoadmapCompleted = updatedCompletedSteps.length === roadmapForStep.steps.length;
      
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [rmId]: {
            ...currentProgress,
            completedSteps: updatedCompletedSteps,
            stepsProgress: updatedStepsProgress,
            currentStepIndex: isRoadmapCompleted ? currentStepIndex : nextStepIndex,
            totalTimeSpent: currentProgress.totalTimeSpent + timeSpent,
            isCompleted: isRoadmapCompleted,
            lastAccessDate: new Date().toISOString(),
          }
        },
        completedRoadmaps: isRoadmapCompleted 
          ? [...state.completedRoadmaps, rmId]
          : state.completedRoadmaps,
        activeRoadmaps: isRoadmapCompleted
          ? state.activeRoadmaps.filter(id => id !== rmId)
          : state.activeRoadmaps,
        learningStats: {
          ...state.learningStats,
          stepsCompleted: state.learningStats.stepsCompleted + 1,
          totalTimeSpent: state.learningStats.totalTimeSpent + timeSpent,
          roadmapsCompleted: isRoadmapCompleted 
            ? state.learningStats.roadmapsCompleted + 1
            : state.learningStats.roadmapsCompleted,
          lastStudyDate: new Date().toISOString(),
        }
      };
      
    case RoadmapActionTypes.UPDATE_STEP_PROGRESS:
      const { roadmapId: progressRmId, stepId: progressStepId, progress } = action.payload;
      const progressState = state.userProgress[progressRmId];
      
      if (!progressState) return state;
      
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [progressRmId]: {
            ...progressState,
            stepsProgress: {
              ...progressState.stepsProgress,
              [progressStepId]: {
                ...progressState.stepsProgress[progressStepId],
                ...progress,
              }
            },
            lastAccessDate: new Date().toISOString(),
          }
        }
      };
      
    case RoadmapActionTypes.SET_ACTIVE_ROADMAP:
      return {
        ...state,
        activeRoadmap: action.payload,
      };
      
    case RoadmapActionTypes.BOOKMARK_ROADMAP:
      const bookmarkedRoadmaps = new Set(state.bookmarkedRoadmaps);
      bookmarkedRoadmaps.add(action.payload);
      
      return {
        ...state,
        bookmarkedRoadmaps,
      };
      
    case RoadmapActionTypes.UNBOOKMARK_ROADMAP:
      const unbookmarkedRoadmaps = new Set(state.bookmarkedRoadmaps);
      unbookmarkedRoadmaps.delete(action.payload);
      
      return {
        ...state,
        bookmarkedRoadmaps: unbookmarkedRoadmaps,
      };
      
    case RoadmapActionTypes.UPDATE_DAILY_STREAK:
      const today = new Date().toDateString();
      const lastStudyDate = state.learningStats.lastStudyDate 
        ? new Date(state.learningStats.lastStudyDate).toDateString()
        : null;
      
      let newStreak = state.learningStats.currentStreak;
      
      if (lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudyDate === yesterday.toDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
      
      return {
        ...state,
        learningStats: {
          ...state.learningStats,
          currentStreak: newStreak,
          longestStreak: Math.max(state.learningStats.longestStreak, newStreak),
          lastStudyDate: new Date().toISOString(),
        }
      };
      
    case RoadmapActionTypes.CLEAR_ROADMAP_DATA:
      return initialRoadmapState;
      
    default:
      return state;
  }
}

// Create Roadmap Context
const RoadmapContext = createContext();

// Roadmap Provider Component
export function RoadmapProvider({ children }) {
  const [state, dispatch] = useReducer(roadmapReducer, initialRoadmapState);
  const { user, isAuthenticated } = useApp();
  const { gainXP, earnBadge } = useProfile();

  // Initialize roadmap data
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeRoadmapData();
    }
  }, [isAuthenticated, user]);

  // Save progress to storage
  useEffect(() => {
    if (user && Object.keys(state.userProgress).length > 0) {
      saveProgressToStorage();
    }
  }, [state.userProgress, state.learningStats]);

  // Initialize roadmap data
  const initializeRoadmapData = async () => {
    try {
      dispatch({ type: RoadmapActionTypes.SET_LOADING, payload: true });
      
      // Load roadmaps (in real app, this would be from API)
      dispatch({ type: RoadmapActionTypes.SET_ROADMAPS, payload: sampleRoadmaps });
      
      // Load user progress from storage
      await loadProgressFromStorage();
      
    } catch (error) {
      console.error('Error initializing roadmap data:', error);
      dispatch({ type: RoadmapActionTypes.SET_ERROR, payload: 'Failed to load roadmaps' });
    }
  };

  // Load progress from AsyncStorage
  const loadProgressFromStorage = async () => {
    try {
      const progressKey = `roadmap_progress_${user.id}`;
      const savedProgress = await AsyncStorage.getItem(progressKey);
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        dispatch({ type: RoadmapActionTypes.SET_USER_PROGRESS, payload: parsedProgress.userProgress || {} });
        
        if (parsedProgress.learningStats) {
          dispatch({ 
            type: RoadmapActionTypes.UPDATE_LEARNING_STATS, 
            payload: parsedProgress.learningStats 
          });
        }
      }
    } catch (error) {
      console.error('Error loading roadmap progress:', error);
    }
  };

  // Save progress to AsyncStorage
  const saveProgressToStorage = async () => {
    try {
      const progressKey = `roadmap_progress_${user.id}`;
      const progressData = {
        userProgress: state.userProgress,
        learningStats: state.learningStats,
        activeRoadmaps: state.activeRoadmaps,
        completedRoadmaps: state.completedRoadmaps,
        bookmarkedRoadmaps: Array.from(state.bookmarkedRoadmaps),
      };
      
      await AsyncStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving roadmap progress:', error);
    }
  };

  // Roadmap Actions
  const startRoadmap = useCallback((roadmapId) => {
    dispatch({ type: RoadmapActionTypes.START_ROADMAP, payload: roadmapId });
    dispatch({ type: RoadmapActionTypes.UPDATE_DAILY_STREAK });
  }, []);

  const completeStep = useCallback((roadmapId, stepId, timeSpent, testScore) => {
    dispatch({ 
      type: RoadmapActionTypes.COMPLETE_STEP, 
      payload: { roadmapId, stepId, timeSpent, testScore }
    });
    
    // Award XP for completing step
    const xpGained = Math.floor(timeSpent / 5) + (testScore >= 80 ? 50 : 25);
    gainXP(xpGained);
    
    // Check if roadmap is completed and award badge
    const roadmap = state.allRoadmaps.find(r => r.id === roadmapId);
    const progress = state.userProgress[roadmapId];
    
    if (roadmap && progress) {
      const completedSteps = [...progress.completedSteps, stepId];
      const isCompleted = completedSteps.length === roadmap.steps.length;
      
      if (isCompleted && roadmap.badge) {
        earnBadge(roadmap.badge);
      }
    }
    
    dispatch({ type: RoadmapActionTypes.UPDATE_DAILY_STREAK });
  }, [state.allRoadmaps, state.userProgress, gainXP, earnBadge]);

  const updateStepProgress = useCallback((roadmapId, stepId, progress) => {
    dispatch({ 
      type: RoadmapActionTypes.UPDATE_STEP_PROGRESS, 
      payload: { roadmapId, stepId, progress }
    });
  }, []);

  const setActiveRoadmap = useCallback((roadmapId) => {
    dispatch({ type: RoadmapActionTypes.SET_ACTIVE_ROADMAP, payload: roadmapId });
  }, []);

  const bookmarkRoadmap = useCallback((roadmapId) => {
    dispatch({ type: RoadmapActionTypes.BOOKMARK_ROADMAP, payload: roadmapId });
  }, []);

  const unbookmarkRoadmap = useCallback((roadmapId) => {
    dispatch({ type: RoadmapActionTypes.UNBOOKMARK_ROADMAP, payload: roadmapId });
  }, []);

  // Utility functions
  const getRoadmapProgress = useCallback((roadmapId) => {
    return state.userProgress[roadmapId] || null;
  }, [state.userProgress]);

  const getStepProgress = useCallback((roadmapId, stepId) => {
    const roadmapProgress = state.userProgress[roadmapId];
    return roadmapProgress?.stepsProgress[stepId] || null;
  }, [state.userProgress]);

  const isStepUnlocked = useCallback((roadmapId, stepId) => {
    const roadmap = state.allRoadmaps.find(r => r.id === roadmapId);
    const step = roadmap?.steps.find(s => s.id === stepId);
    const progress = state.userProgress[roadmapId];
    
    if (!step || !progress) return false;
    
    // Check if all prerequisite steps are completed
    return step.prerequisiteSteps.every(prereqId => 
      progress.completedSteps.includes(prereqId)
    );
  }, [state.allRoadmaps, state.userProgress]);

  const getRecommendedRoadmaps = useCallback(() => {
    // Simple recommendation based on user's completed roadmaps and skills
    return state.allRoadmaps
      .filter(roadmap => !state.completedRoadmaps.includes(roadmap.id))
      .slice(0, 5);
  }, [state.allRoadmaps, state.completedRoadmaps]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    startRoadmap,
    completeStep,
    updateStepProgress,
    setActiveRoadmap,
    bookmarkRoadmap,
    unbookmarkRoadmap,
    
    // Utilities
    getRoadmapProgress,
    getStepProgress,
    isStepUnlocked,
    getRecommendedRoadmaps,
    saveProgressToStorage,
    loadProgressFromStorage,
  };

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
}

// Custom Hook
export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
}

// Export action types
export { RoadmapActionTypes };
