import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';

// HR Action Types
const HRActionTypes = {
  SET_CANDIDATES: 'SET_CANDIDATES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  SAVE_CANDIDATE: 'SAVE_CANDIDATE',
  UNSAVE_CANDIDATE: 'UNSAVE_CANDIDATE',
  SEND_INTERVIEW_REQUEST: 'SEND_INTERVIEW_REQUEST',
  UPDATE_SEARCH_QUERY: 'UPDATE_SEARCH_QUERY',
  SET_SORT_BY: 'SET_SORT_BY',
  ADD_TO_SHORTLIST: 'ADD_TO_SHORTLIST',
  REMOVE_FROM_SHORTLIST: 'REMOVE_FROM_SHORTLIST',
  UPDATE_CANDIDATE_NOTES: 'UPDATE_CANDIDATE_NOTES',
  MARK_CANDIDATE_CONTACTED: 'MARK_CANDIDATE_CONTACTED',
  CLEAR_HR_DATA: 'CLEAR_HR_DATA'
};

// Initial HR State
const initialHRState = {
  // Candidate Data
  allCandidates: [],
  filteredCandidates: [],
  
  // Search & Filters
  searchQuery: '',
  filters: {
    skills: [],
    experience: 'any', // any, junior, mid, senior
    location: '',
    availability: 'any', // any, immediate, 2weeks, 1month
    salaryRange: 'any', // any, 50k-80k, 80k-120k, 120k+
    verificationLevel: 'any', // any, verified, expert
    projectCount: 'any', // any, 1-3, 4-6, 7+
  },
  
  // Sorting
  sortBy: 'relevance', // relevance, hirability, trust, recent
  sortOrder: 'desc',
  
  // HR Actions
  savedCandidates: new Set(),
  shortlistedCandidates: new Set(),
  interviewRequests: [],
  candidateNotes: {},
  contactedCandidates: new Set(),
  
  // UI State
  loading: false,
  error: null,
  viewMode: 'grid', // grid, list, detailed
  
  // Analytics
  hrStats: {
    totalSearches: 0,
    candidatesViewed: 0,
    interviewsSent: 0,
    successfulHires: 0,
    avgResponseTime: 0,
  }
};

// HR Reducer
function hrReducer(state, action) {
  switch (action.type) {
    case HRActionTypes.SET_CANDIDATES:
      return {
        ...state,
        allCandidates: action.payload,
        filteredCandidates: action.payload,
        loading: false,
        error: null,
      };
      
    case HRActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case HRActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case HRActionTypes.UPDATE_SEARCH_QUERY:
      const query = action.payload.toLowerCase();
      const searchFiltered = state.allCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.title.toLowerCase().includes(query) ||
        candidate.skills.some(skill => skill.name.toLowerCase().includes(query)) ||
        candidate.location.toLowerCase().includes(query)
      );
      
      return {
        ...state,
        searchQuery: action.payload,
        filteredCandidates: searchFiltered,
        hrStats: {
          ...state.hrStats,
          totalSearches: state.hrStats.totalSearches + 1,
        },
      };
      
    case HRActionTypes.UPDATE_FILTERS:
      const newFilters = { ...state.filters, ...action.payload };
      let filtered = state.allCandidates;
      
      // Apply search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(candidate =>
          candidate.name.toLowerCase().includes(query) ||
          candidate.title.toLowerCase().includes(query) ||
          candidate.skills.some(skill => skill.name.toLowerCase().includes(query)) ||
          candidate.location.toLowerCase().includes(query)
        );
      }
      
      // Apply skill filters
      if (newFilters.skills.length > 0) {
        filtered = filtered.filter(candidate =>
          newFilters.skills.every(skill =>
            candidate.skills.some(candidateSkill => 
              candidateSkill.name.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }
      
      // Apply experience filter
      if (newFilters.experience !== 'any') {
        filtered = filtered.filter(candidate => {
          const exp = candidate.experience || 0;
          switch (newFilters.experience) {
            case 'junior': return exp <= 2;
            case 'mid': return exp >= 3 && exp <= 5;
            case 'senior': return exp >= 6;
            default: return true;
          }
        });
      }
      
      // Apply location filter
      if (newFilters.location) {
        filtered = filtered.filter(candidate =>
          candidate.location.toLowerCase().includes(newFilters.location.toLowerCase())
        );
      }
      
      // Apply verification filter
      if (newFilters.verificationLevel !== 'any') {
        filtered = filtered.filter(candidate => {
          const verifiedSkills = candidate.skills.filter(skill => skill.verified).length;
          switch (newFilters.verificationLevel) {
            case 'verified': return verifiedSkills >= 1;
            case 'expert': return verifiedSkills >= 3;
            default: return true;
          }
        });
      }
      
      // Apply project count filter
      if (newFilters.projectCount !== 'any') {
        filtered = filtered.filter(candidate => {
          const projectCount = candidate.projects.length;
          switch (newFilters.projectCount) {
            case '1-3': return projectCount >= 1 && projectCount <= 3;
            case '4-6': return projectCount >= 4 && projectCount <= 6;
            case '7+': return projectCount >= 7;
            default: return true;
          }
        });
      }
      
      return {
        ...state,
        filters: newFilters,
        filteredCandidates: filtered,
      };
      
    case HRActionTypes.SET_SORT_BY:
      const sortedCandidates = [...state.filteredCandidates].sort((a, b) => {
        let comparison = 0;
        
        switch (action.payload.sortBy) {
          case 'hirability':
            comparison = (b.scores?.hirabilityScore || 0) - (a.scores?.hirabilityScore || 0);
            break;
          case 'trust':
            comparison = (b.scores?.trustScore || 0) - (a.scores?.trustScore || 0);
            break;
          case 'recent':
            comparison = new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
            break;
          case 'experience':
            comparison = (b.experience || 0) - (a.experience || 0);
            break;
          case 'projects':
            comparison = b.projects.length - a.projects.length;
            break;
          default: // relevance
            comparison = (b.scores?.hirabilityScore || 0) - (a.scores?.hirabilityScore || 0);
        }
        
        return action.payload.sortOrder === 'asc' ? -comparison : comparison;
      });
      
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        filteredCandidates: sortedCandidates,
      };
      
    case HRActionTypes.SAVE_CANDIDATE:
      const savedCandidates = new Set(state.savedCandidates);
      savedCandidates.add(action.payload);
      
      return {
        ...state,
        savedCandidates,
      };
      
    case HRActionTypes.UNSAVE_CANDIDATE:
      const unsavedCandidates = new Set(state.savedCandidates);
      unsavedCandidates.delete(action.payload);
      
      return {
        ...state,
        savedCandidates: unsavedCandidates,
      };
      
    case HRActionTypes.SEND_INTERVIEW_REQUEST:
      const newRequest = {
        id: Date.now(),
        candidateId: action.payload.candidateId,
        message: action.payload.message,
        position: action.payload.position,
        scheduledDate: action.payload.scheduledDate,
        status: 'sent',
        sentAt: new Date().toISOString(),
      };
      
      const contactedCandidates = new Set(state.contactedCandidates);
      contactedCandidates.add(action.payload.candidateId);
      
      return {
        ...state,
        interviewRequests: [newRequest, ...state.interviewRequests],
        contactedCandidates,
        hrStats: {
          ...state.hrStats,
          interviewsSent: state.hrStats.interviewsSent + 1,
        },
      };
      
    case HRActionTypes.ADD_TO_SHORTLIST:
      const shortlistedCandidates = new Set(state.shortlistedCandidates);
      shortlistedCandidates.add(action.payload);
      
      return {
        ...state,
        shortlistedCandidates,
      };
      
    case HRActionTypes.REMOVE_FROM_SHORTLIST:
      const removedShortlist = new Set(state.shortlistedCandidates);
      removedShortlist.delete(action.payload);
      
      return {
        ...state,
        shortlistedCandidates: removedShortlist,
      };
      
    case HRActionTypes.UPDATE_CANDIDATE_NOTES:
      return {
        ...state,
        candidateNotes: {
          ...state.candidateNotes,
          [action.payload.candidateId]: action.payload.notes,
        },
      };
      
    case HRActionTypes.MARK_CANDIDATE_CONTACTED:
      const contacted = new Set(state.contactedCandidates);
      contacted.add(action.payload);
      
      return {
        ...state,
        contactedCandidates: contacted,
        hrStats: {
          ...state.hrStats,
          candidatesViewed: state.hrStats.candidatesViewed + 1,
        },
      };
      
    case HRActionTypes.CLEAR_HR_DATA:
      return initialHRState;
      
    default:
      return state;
  }
}

// Create HR Context
const HRContext = createContext();

// HR Provider Component
export function HRProvider({ children }) {
  const [state, dispatch] = useReducer(hrReducer, initialHRState);
  const { user, isAuthenticated } = useApp();

  // Initialize HR data
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeHRData();
    }
  }, [isAuthenticated, user]);

  // Generate mock candidate data
  const generateMockCandidates = () => {
    const mockSkills = [
      'React Native', 'JavaScript', 'TypeScript', 'Node.js', 'React', 'Python',
      'iOS Development', 'Android Development', 'UI/UX Design', 'GraphQL',
      'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Redux', 'Next.js',
      'Vue.js', 'Angular', 'Express.js', 'Firebase', 'Figma', 'Java', 'C++',
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO',
      'Remote', 'London, UK', 'Toronto, CA', 'Berlin, Germany'
    ];

    const titles = [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Mobile Developer', 'UI/UX Designer', 'Product Designer',
      'DevOps Engineer', 'Data Scientist', 'Software Engineer',
      'Senior Developer', 'Lead Developer', 'Principal Engineer'
    ];

    return Array.from({ length: 50 }, (_, index) => {
      const experience = Math.floor(Math.random() * 12) + 1;
      const skillCount = Math.floor(Math.random() * 8) + 3;
      const projectCount = Math.floor(Math.random() * 10) + 1;
      
      const candidateSkills = Array.from({ length: skillCount }, () => {
        const skill = mockSkills[Math.floor(Math.random() * mockSkills.length)];
        return {
          id: Math.random(),
          name: skill,
          verified: Math.random() > 0.4,
          level: Math.floor(Math.random() * 5) + 1,
          endorsements: Math.floor(Math.random() * 20),
        };
      });

      const projects = Array.from({ length: projectCount }, (_, projIndex) => ({
        id: projIndex + 1,
        title: `Project ${projIndex + 1}`,
        description: 'A comprehensive application built with modern technologies',
        technologies: candidateSkills.slice(0, 3).map(s => s.name),
        verified: Math.random() > 0.3,
      }));

      return {
        id: index + 1,
        name: `Candidate ${String.fromCharCode(65 + index % 26)}${index + 1}`,
        email: `candidate${index + 1}@email.com`,
        title: titles[Math.floor(Math.random() * titles.length)],
        experience,
        location: locations[Math.floor(Math.random() * locations.length)],
        bio: `Experienced ${titles[Math.floor(Math.random() * titles.length)].toLowerCase()} with ${experience} years of experience building scalable applications.`,
        skills: candidateSkills,
        projects,
        scores: {
          trustScore: Math.floor(Math.random() * 40) + 60,
          hirabilityScore: Math.floor(Math.random() * 40) + 60,
          profileCompleteness: Math.floor(Math.random() * 30) + 70,
        },
        stats: {
          testsCompleted: Math.floor(Math.random() * 20) + 5,
          projectsCompleted: projectCount,
          badgesEarned: Math.floor(Math.random() * 15) + 3,
          learningStreak: Math.floor(Math.random() * 30) + 1,
        },
        availability: ['immediate', '2weeks', '1month'][Math.floor(Math.random() * 3)],
        salaryExpectation: [50000, 80000, 120000, 150000][Math.floor(Math.random() * 4)],
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: Math.random() > 0.3,
        responseRate: Math.floor(Math.random() * 40) + 60,
      };
    });
  };

  // Initialize HR data
  const initializeHRData = async () => {
    try {
      dispatch({ type: HRActionTypes.SET_LOADING, payload: true });
      
      // In a real app, this would fetch from API
      const mockCandidates = generateMockCandidates();
      
      dispatch({ type: HRActionTypes.SET_CANDIDATES, payload: mockCandidates });
    } catch (error) {
      console.error('Error initializing HR data:', error);
      dispatch({ type: HRActionTypes.SET_ERROR, payload: 'Failed to load candidates' });
    }
  };

  // HR Actions
  const searchCandidates = useCallback((query) => {
    dispatch({ type: HRActionTypes.UPDATE_SEARCH_QUERY, payload: query });
  }, []);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: HRActionTypes.UPDATE_FILTERS, payload: filters });
  }, []);

  const setSortBy = useCallback((sortBy, sortOrder = 'desc') => {
    dispatch({ type: HRActionTypes.SET_SORT_BY, payload: { sortBy, sortOrder } });
  }, []);

  const saveCandidate = useCallback((candidateId) => {
    dispatch({ type: HRActionTypes.SAVE_CANDIDATE, payload: candidateId });
  }, []);

  const unsaveCandidate = useCallback((candidateId) => {
    dispatch({ type: HRActionTypes.UNSAVE_CANDIDATE, payload: candidateId });
  }, []);

  const sendInterviewRequest = useCallback((requestData) => {
    dispatch({ type: HRActionTypes.SEND_INTERVIEW_REQUEST, payload: requestData });
  }, []);

  const addToShortlist = useCallback((candidateId) => {
    dispatch({ type: HRActionTypes.ADD_TO_SHORTLIST, payload: candidateId });
  }, []);

  const removeFromShortlist = useCallback((candidateId) => {
    dispatch({ type: HRActionTypes.REMOVE_FROM_SHORTLIST, payload: candidateId });
  }, []);

  const updateCandidateNotes = useCallback((candidateId, notes) => {
    dispatch({ type: HRActionTypes.UPDATE_CANDIDATE_NOTES, payload: { candidateId, notes } });
  }, []);

  const markCandidateContacted = useCallback((candidateId) => {
    dispatch({ type: HRActionTypes.MARK_CANDIDATE_CONTACTED, payload: candidateId });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: HRActionTypes.UPDATE_FILTERS, payload: {
      skills: [],
      experience: 'any',
      location: '',
      availability: 'any',
      salaryRange: 'any',
      verificationLevel: 'any',
      projectCount: 'any',
    } });
  }, []);

  // Get filtered candidates by specific criteria
  const getSavedCandidates = useCallback(() => {
    return state.allCandidates.filter(candidate => 
      state.savedCandidates.has(candidate.id)
    );
  }, [state.allCandidates, state.savedCandidates]);

  const getShortlistedCandidates = useCallback(() => {
    return state.allCandidates.filter(candidate => 
      state.shortlistedCandidates.has(candidate.id)
    );
  }, [state.allCandidates, state.shortlistedCandidates]);

  const getTopCandidates = useCallback((limit = 10) => {
    return [...state.allCandidates]
      .sort((a, b) => (b.scores?.hirabilityScore || 0) - (a.scores?.hirabilityScore || 0))
      .slice(0, limit);
  }, [state.allCandidates]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    searchCandidates,
    updateFilters,
    setSortBy,
    saveCandidate,
    unsaveCandidate,
    sendInterviewRequest,
    addToShortlist,
    removeFromShortlist,
    updateCandidateNotes,
    markCandidateContacted,
    clearFilters,
    
    // Computed values
    getSavedCandidates,
    getShortlistedCandidates,
    getTopCandidates,
    
    // Utilities
    initializeHRData,
  };

  return (
    <HRContext.Provider value={value}>
      {children}
    </HRContext.Provider>
  );
}

// Custom Hook
export function useHR() {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}

// Export action types
export { HRActionTypes };
