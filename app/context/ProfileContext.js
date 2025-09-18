import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';

// Profile Action Types
const ProfileActionTypes = {
  SET_PROFILE_DATA: 'SET_PROFILE_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_STATS: 'UPDATE_STATS',
  UPDATE_SKILLS: 'UPDATE_SKILLS',
  UPDATE_PROJECTS: 'UPDATE_PROJECTS',
  UPDATE_ACHIEVEMENTS: 'UPDATE_ACHIEVEMENTS',
  UPDATE_SCORES: 'UPDATE_SCORES',
  ADD_SKILL: 'ADD_SKILL',
  UPDATE_SKILL: 'UPDATE_SKILL',
  DELETE_SKILL: 'DELETE_SKILL',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  EARN_BADGE: 'EARN_BADGE',
  UPDATE_XP: 'UPDATE_XP',
  INCREMENT_STREAK: 'INCREMENT_STREAK',
  RESET_STREAK: 'RESET_STREAK',
  CLEAR_PROFILE: 'CLEAR_PROFILE'
};

// Initial Profile State
const initialProfileState = {
  // Basic Profile Info
  profileData: {
    id: null,
    name: '',
    email: '',
    title: '',
    bio: '',
    location: '',
    avatar: null,
    coverImage: null,
    joinedDate: null,
    lastActive: null,
  },
  
  // Trust & Hirability Scores
  scores: {
    trustScore: 0,
    hirabilityScore: 0,
    profileCompleteness: 0,
  },
  
  // Gamification Stats
  stats: {
    currentLevel: 1,
    totalXP: 0,
    xpToNextLevel: 1000,
    learningStreak: 0,
    longestStreak: 0,
    totalBadges: 0,
    testsCompleted: 0,
    projectsCompleted: 0,
    skillsVerified: 0,
    mentorEndorsements: 0,
    totalTimeSpent: 0, // in minutes
  },
  
  // Skills Management
  skills: [],
  
  // Projects Portfolio
  projects: [],
  
  // Achievements & Badges
  achievements: [],
  badges: [],
  
  // Learning Progress
  roadmapsProgress: [],
  recentActivity: [],
  
  // Social Stats
  socialStats: {
    followers: 0,
    following: 0,
    posts: 0,
    likes: 0,
    shares: 0,
  },
  
  // UI State
  loading: false,
  error: null,
  refreshing: false,
  uploadingAvatar: false,
};

// Profile Reducer
function profileReducer(state, action) {
  switch (action.type) {
    case ProfileActionTypes.SET_PROFILE_DATA:
      return {
        ...state,
        profileData: { ...state.profileData, ...action.payload },
        loading: false,
        error: null,
      };
      
    case ProfileActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case ProfileActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case ProfileActionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };
      
    case ProfileActionTypes.UPDATE_SKILLS:
      return {
        ...state,
        skills: action.payload,
      };
      
    case ProfileActionTypes.ADD_SKILL:
      return {
        ...state,
        skills: [...state.skills, action.payload],
        stats: {
          ...state.stats,
          skillsVerified: state.stats.skillsVerified + (action.payload.verified ? 1 : 0),
        },
      };
      
    case ProfileActionTypes.UPDATE_SKILL:
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill.id === action.payload.id ? { ...skill, ...action.payload } : skill
        ),
      };
      
    case ProfileActionTypes.DELETE_SKILL:
      return {
        ...state,
        skills: state.skills.filter(skill => skill.id !== action.payload),
      };
      
    case ProfileActionTypes.UPDATE_PROJECTS:
      return {
        ...state,
        projects: action.payload,
      };
      
    case ProfileActionTypes.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
        stats: {
          ...state.stats,
          projectsCompleted: state.stats.projectsCompleted + 1,
        },
      };
      
    case ProfileActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload } : project
        ),
      };
      
    case ProfileActionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        stats: {
          ...state.stats,
          projectsCompleted: Math.max(0, state.stats.projectsCompleted - 1),
        },
      };
      
    case ProfileActionTypes.UPDATE_ACHIEVEMENTS:
      return {
        ...state,
        achievements: action.payload,
      };
      
    case ProfileActionTypes.UPDATE_SCORES:
      return {
        ...state,
        scores: { ...state.scores, ...action.payload },
      };
      
    case ProfileActionTypes.EARN_BADGE:
      const newBadge = action.payload;
      return {
        ...state,
        badges: [...state.badges, newBadge],
        stats: {
          ...state.stats,
          totalBadges: state.stats.totalBadges + 1,
        },
        recentActivity: [
          {
            id: Date.now(),
            type: 'badge_earned',
            title: `Earned ${newBadge.name} badge!`,
            timestamp: new Date().toISOString(),
            metadata: { badge: newBadge }
          },
          ...state.recentActivity.slice(0, 9) // Keep last 10 activities
        ]
      };
      
    case ProfileActionTypes.UPDATE_XP:
      const xpGained = action.payload;
      const newTotalXP = state.stats.totalXP + xpGained;
      const currentLevel = Math.floor(newTotalXP / 1000) + 1;
      const xpInCurrentLevel = newTotalXP % 1000;
      const xpToNextLevel = 1000 - xpInCurrentLevel;
      
      return {
        ...state,
        stats: {
          ...state.stats,
          totalXP: newTotalXP,
          currentLevel,
          xpToNextLevel,
        },
        recentActivity: [
          {
            id: Date.now(),
            type: 'xp_gained',
            title: `Gained ${xpGained} XP!`,
            timestamp: new Date().toISOString(),
            metadata: { xp: xpGained }
          },
          ...state.recentActivity.slice(0, 9)
        ]
      };
      
    case ProfileActionTypes.INCREMENT_STREAK:
      const newStreak = state.stats.learningStreak + 1;
      return {
        ...state,
        stats: {
          ...state.stats,
          learningStreak: newStreak,
          longestStreak: Math.max(state.stats.longestStreak, newStreak),
        },
      };
      
    case ProfileActionTypes.RESET_STREAK:
      return {
        ...state,
        stats: {
          ...state.stats,
          learningStreak: 0,
        },
      };
      
    case ProfileActionTypes.CLEAR_PROFILE:
      return initialProfileState;
      
    default:
      return state;
  }
}

// Create Profile Context
const ProfileContext = createContext();

// Profile Provider Component
export function ProfileProvider({ children }) {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);
  const { user, isAuthenticated } = useApp();

  // Load profile data from storage on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileFromStorage();
    }
  }, [isAuthenticated, user]);

  // Save profile data to storage whenever it changes
  useEffect(() => {
    if (state.profileData.id) {
      saveProfileToStorage();
    }
  }, [state.profileData, state.stats, state.skills, state.projects]);

  // Load profile from AsyncStorage
  const loadProfileFromStorage = async () => {
    try {
      dispatch({ type: ProfileActionTypes.SET_LOADING, payload: true });
      
      const profileKey = `profile_${user.id}`;
      const savedProfile = await AsyncStorage.getItem(profileKey);
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        dispatch({ type: ProfileActionTypes.SET_PROFILE_DATA, payload: parsedProfile });
      } else {
        // Initialize with user data from AppContext and some mock data
        const mockProfileData = {
          id: user.id,
          name: user.name || 'Alex Chen',
          email: user.email || 'alex@skillnet.com',
          title: 'Full Stack Developer',
          bio: 'Passionate about creating beautiful, functional apps. Love learning new technologies and solving complex problems.',
          location: 'San Francisco, CA',
          joinedDate: new Date().toISOString(),
        };
        
        const mockStats = {
          currentLevel: 3,
          totalXP: 2450,
          xpToNextLevel: 550,
          learningStreak: 7,
          longestStreak: 15,
          totalBadges: 8,
          testsCompleted: 12,
          projectsCompleted: 5,
          skillsVerified: 6,
          mentorEndorsements: 3,
          totalTimeSpent: 180,
        };

        const mockScores = {
          trustScore: 78,
          hirabilityScore: 85,
          profileCompleteness: 75,
        };

        const mockSkills = [
          { id: 1, name: 'React Native', proficiencyLevel: 4, verified: true, endorsements: 5 },
          { id: 2, name: 'JavaScript', proficiencyLevel: 5, verified: true, endorsements: 8 },
          { id: 3, name: 'Node.js', proficiencyLevel: 3, verified: true, endorsements: 3 },
          { id: 4, name: 'UI/UX Design', proficiencyLevel: 3, verified: false, endorsements: 2 },
        ];

        const mockBadges = [
          { id: 1, name: 'React Native Expert', type: 'skill', earnedDate: new Date().toISOString() },
          { id: 2, name: 'First Project', type: 'milestone', earnedDate: new Date().toISOString() },
          { id: 3, name: 'Week Warrior', type: 'streak', earnedDate: new Date().toISOString() },
        ];

        const mockProjects = [
          {
            id: 1,
            title: 'Weather App',
            description: 'React Native app with real-time weather data and beautiful UI',
            technologies: ['React Native', 'API Integration', 'AsyncStorage'],
            githubUrl: 'https://github.com/alexchen/weather-app',
            demoUrl: 'https://weather-demo.com',
            status: 'completed',
            createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            title: 'Task Manager',
            description: 'Full-stack todo application with user authentication',
            technologies: ['React', 'Node.js', 'MongoDB', 'JWT'],
            githubUrl: 'https://github.com/alexchen/task-manager',
            status: 'completed',
            createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            title: 'E-commerce Mobile App',
            description: 'Complete shopping app with payment integration',
            technologies: ['React Native', 'Redux', 'Stripe', 'Firebase'],
            githubUrl: 'https://github.com/alexchen/ecommerce-app',
            status: 'completed',
            createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        const mockActivity = [
          {
            id: 1,
            type: 'test_completed',
            title: 'Completed JavaScript Advanced Test',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            type: 'project_completed',
            title: 'Finished Weather App project',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            type: 'badge_earned',
            title: 'Earned React Native Expert badge',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        dispatch({ type: ProfileActionTypes.SET_PROFILE_DATA, payload: mockProfileData });
        dispatch({ type: ProfileActionTypes.UPDATE_STATS, payload: mockStats });
        dispatch({ type: ProfileActionTypes.UPDATE_SKILLS, payload: mockSkills });
        dispatch({ type: ProfileActionTypes.UPDATE_PROJECTS, payload: mockProjects });
        dispatch({ type: ProfileActionTypes.UPDATE_ACHIEVEMENTS, payload: mockBadges });
        dispatch({ type: ProfileActionTypes.UPDATE_SCORES, payload: mockScores });
        
        // Update scores and activity separately
        const updatedState = {
          ...initialProfileState,
          profileData: mockProfileData,
          stats: mockStats,
          skills: mockSkills,
          projects: mockProjects,
          badges: mockBadges,
          scores: mockScores,
          recentActivity: mockActivity,
        };
        
        // Save the mock data
        const profileKey = `profile_${user.id}`;
        await AsyncStorage.setItem(profileKey, JSON.stringify(updatedState));
      }
    } catch (error) {
      console.error('Error loading profile from storage:', error);
      dispatch({ type: ProfileActionTypes.SET_ERROR, payload: 'Failed to load profile' });
    }
  };

  // Save profile to AsyncStorage
  const saveProfileToStorage = async () => {
    try {
      const profileKey = `profile_${state.profileData.id}`;
      const profileData = {
        ...state.profileData,
        stats: state.stats,
        skills: state.skills,
        projects: state.projects,
        achievements: state.achievements,
        badges: state.badges,
      };
      
      await AsyncStorage.setItem(profileKey, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile to storage:', error);
    }
  };

  // Profile Actions
  const updateProfile = useCallback((profileData) => {
    dispatch({ type: ProfileActionTypes.SET_PROFILE_DATA, payload: profileData });
  }, []);

  const updateStats = useCallback((stats) => {
    dispatch({ type: ProfileActionTypes.UPDATE_STATS, payload: stats });
  }, []);

  const addSkill = useCallback((skill) => {
    const newSkill = {
      id: Date.now(),
      name: skill.name,
      proficiencyLevel: skill.proficiencyLevel || 1,
      verified: skill.verified || false,
      endorsements: 0,
      addedDate: new Date().toISOString(),
      ...skill
    };
    dispatch({ type: ProfileActionTypes.ADD_SKILL, payload: newSkill });
  }, []);

  const updateSkill = useCallback((skillId, updates) => {
    dispatch({ type: ProfileActionTypes.UPDATE_SKILL, payload: { id: skillId, ...updates } });
  }, []);

  const deleteSkill = useCallback((skillId) => {
    dispatch({ type: ProfileActionTypes.DELETE_SKILL, payload: skillId });
  }, []);

  const addProject = useCallback((project) => {
    const newProject = {
      id: Date.now(),
      title: project.title,
      description: project.description || '',
      technologies: project.technologies || [],
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      images: project.images || [],
      status: 'completed',
      createdDate: new Date().toISOString(),
      ...project
    };
    dispatch({ type: ProfileActionTypes.ADD_PROJECT, payload: newProject });
  }, []);

  const updateProject = useCallback((projectId, updates) => {
    dispatch({ type: ProfileActionTypes.UPDATE_PROJECT, payload: { id: projectId, ...updates } });
  }, []);

  const deleteProject = useCallback((projectId) => {
    dispatch({ type: ProfileActionTypes.DELETE_PROJECT, payload: projectId });
  }, []);

  const earnBadge = useCallback((badge) => {
    const newBadge = {
      id: Date.now(),
      name: badge.name,
      type: badge.type,
      description: badge.description || '',
      earnedDate: new Date().toISOString(),
      ...badge
    };
    dispatch({ type: ProfileActionTypes.EARN_BADGE, payload: newBadge });
  }, []);

  const gainXP = useCallback((amount) => {
    dispatch({ type: ProfileActionTypes.UPDATE_XP, payload: amount });
  }, []);

  const incrementStreak = useCallback(() => {
    dispatch({ type: ProfileActionTypes.INCREMENT_STREAK });
  }, []);

  const resetStreak = useCallback(() => {
    dispatch({ type: ProfileActionTypes.RESET_STREAK });
  }, []);

  const clearProfile = useCallback(() => {
    dispatch({ type: ProfileActionTypes.CLEAR_PROFILE });
  }, []);

  // Calculate profile completeness
  const calculateProfileCompleteness = useCallback(() => {
    const profile = state.profileData;
    let completeness = 0;
    const totalFields = 10;

    if (profile.name) completeness += 10;
    if (profile.title) completeness += 10;
    if (profile.bio) completeness += 10;
    if (profile.location) completeness += 10;
    if (profile.avatar) completeness += 10;
    if (state.skills.length > 0) completeness += 10;
    if (state.projects.length > 0) completeness += 10;
    if (state.badges.length > 0) completeness += 10;
    if (state.stats.testsCompleted > 0) completeness += 10;
    if (state.socialStats.followers > 0) completeness += 10;

    return completeness;
  }, [state]);

  // Context value
  const value = {
    // State
    ...state,
    profileCompleteness: calculateProfileCompleteness(),
    
    // Actions
    updateProfile,
    updateStats,
    addSkill,
    updateSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    earnBadge,
    gainXP,
    incrementStreak,
    resetStreak,
    clearProfile,
    
    // Utilities
    saveProfileToStorage,
    loadProfileFromStorage,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom Hook
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// Export action types for external use
export { ProfileActionTypes };
