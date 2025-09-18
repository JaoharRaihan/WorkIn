import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { useProfile } from './ProfileContext';

// Community Action Types
const CommunityActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  
  // Live Challenges
  SET_LIVE_CHALLENGES: 'SET_LIVE_CHALLENGES',
  JOIN_CHALLENGE: 'JOIN_CHALLENGE',
  LEAVE_CHALLENGE: 'LEAVE_CHALLENGE',
  SUBMIT_CHALLENGE_ENTRY: 'SUBMIT_CHALLENGE_ENTRY',
  UPDATE_CHALLENGE_LEADERBOARD: 'UPDATE_CHALLENGE_LEADERBOARD',
  
  // Tournaments
  SET_TOURNAMENTS: 'SET_TOURNAMENTS',
  JOIN_TOURNAMENT: 'JOIN_TOURNAMENT',
  ADVANCE_TOURNAMENT_ROUND: 'ADVANCE_TOURNAMENT_ROUND',
  COMPLETE_TOURNAMENT: 'COMPLETE_TOURNAMENT',
  
  // Mentor Marketplace
  SET_MENTORS: 'SET_MENTORS',
  REQUEST_MENTORSHIP: 'REQUEST_MENTORSHIP',
  ACCEPT_MENTORSHIP: 'ACCEPT_MENTORSHIP',
  COMPLETE_MENTORSHIP_SESSION: 'COMPLETE_MENTORSHIP_SESSION',
  RATE_MENTOR: 'RATE_MENTOR',
  
  // Study Groups
  SET_STUDY_GROUPS: 'SET_STUDY_GROUPS',
  CREATE_STUDY_GROUP: 'CREATE_STUDY_GROUP',
  JOIN_STUDY_GROUP: 'JOIN_STUDY_GROUP',
  LEAVE_STUDY_GROUP: 'LEAVE_STUDY_GROUP',
  ADD_GROUP_MESSAGE: 'ADD_GROUP_MESSAGE',
  
  // Community Events
  SET_EVENTS: 'SET_EVENTS',
  CREATE_EVENT: 'CREATE_EVENT',
  JOIN_EVENT: 'JOIN_EVENT',
  CHECK_IN_EVENT: 'CHECK_IN_EVENT',
  
  // Social Features
  FOLLOW_USER: 'FOLLOW_USER',
  UNFOLLOW_USER: 'UNFOLLOW_USER',
  SET_FOLLOWING: 'SET_FOLLOWING',
  SET_FOLLOWERS: 'SET_FOLLOWERS',
  UPDATE_SOCIAL_STATS: 'UPDATE_SOCIAL_STATS',
  
  // Achievements & Recognition
  NOMINATE_FOR_AWARD: 'NOMINATE_FOR_AWARD',
  VOTE_FOR_AWARD: 'VOTE_FOR_AWARD',
  WIN_COMMUNITY_AWARD: 'WIN_COMMUNITY_AWARD',
  
  // Live Activity
  SET_LIVE_ACTIVITY: 'SET_LIVE_ACTIVITY',
};

// Initial Community State
const initialCommunityState = {
  // Live Challenges
  liveChallenges: [],
  userChallenges: [], // Challenges user has joined
  challengeEntries: [], // User's challenge submissions
  
  // Skill Tournaments
  tournaments: [],
  userTournaments: [], // Tournaments user has joined
  tournamentHistory: [],
  
  // Mentor Marketplace
  mentors: [],
  mentorshipRequests: [],
  activeMentorships: [],
  mentorshipHistory: [],
  userMentorProfile: null, // If user is a mentor
  
  // Study Groups
  studyGroups: [],
  userStudyGroups: [], // Groups user has joined
  groupMessages: {},
  
  // Community Events
  events: [],
  userEvents: [], // Events user has joined
  eventHistory: [],
  
  // Social Network
  following: [],
  followers: [],
  socialConnections: [],
  recommendedUsers: [],
  
  // Community Stats
  communityStats: {
    totalMembers: 0,
    activeChallenges: 0,
    runningTournaments: 0,
    availableMentors: 0,
    activeStudyGroups: 0,
    upcomingEvents: 0,
  },
  
  // User Community Profile
  userCommunityProfile: {
    reputation: 0,
    contributionScore: 0,
    helpfulnessRating: 0,
    communityLevel: 1,
    communityBadges: [],
    weeklyRank: null,
    monthlyRank: null,
  },
  
  // Awards & Recognition
  communityAwards: [],
  userNominations: [],
  votingPolls: [],
  
  // Real-time Features
  liveActivity: [],
  notifications: [],
  
  // UI State
  loading: false,
  error: null,
  refreshing: false,
};

// Community Reducer
function communityReducer(state, action) {
  switch (action.type) {
    case CommunityActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case CommunityActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    // Live Challenges
    case CommunityActionTypes.SET_LIVE_CHALLENGES:
      return { ...state, liveChallenges: action.payload };
      
    case CommunityActionTypes.JOIN_CHALLENGE:
      const challenge = action.payload;
      return {
        ...state,
        userChallenges: [...state.userChallenges, challenge],
        liveChallenges: state.liveChallenges.map(c =>
          c.id === challenge.id 
            ? { ...c, participants: c.participants + 1, hasJoined: true }
            : c
        ),
      };
      
    case CommunityActionTypes.SUBMIT_CHALLENGE_ENTRY:
      const entry = action.payload;
      return {
        ...state,
        challengeEntries: [...state.challengeEntries, entry],
        liveChallenges: state.liveChallenges.map(c =>
          c.id === entry.challengeId
            ? { ...c, submissions: c.submissions + 1, hasSubmitted: true }
            : c
        ),
      };
      
    // Tournaments
    case CommunityActionTypes.SET_TOURNAMENTS:
      return { ...state, tournaments: action.payload };
      
    case CommunityActionTypes.JOIN_TOURNAMENT:
      const tournament = action.payload;
      return {
        ...state,
        userTournaments: [...state.userTournaments, tournament],
        tournaments: state.tournaments.map(t =>
          t.id === tournament.id
            ? { ...t, participants: t.participants + 1, hasJoined: true }
            : t
        ),
      };
      
    // Mentors
    case CommunityActionTypes.SET_MENTORS:
      return { ...state, mentors: action.payload };
      
    case CommunityActionTypes.REQUEST_MENTORSHIP:
      const mentorshipRequest = action.payload;
      return {
        ...state,
        mentorshipRequests: [...state.mentorshipRequests, mentorshipRequest],
      };
      
    case CommunityActionTypes.ACCEPT_MENTORSHIP:
      const mentorship = action.payload;
      return {
        ...state,
        activeMentorships: [...state.activeMentorships, mentorship],
        mentorshipRequests: state.mentorshipRequests.filter(
          r => r.id !== mentorship.requestId
        ),
      };
      
    // Study Groups
    case CommunityActionTypes.SET_STUDY_GROUPS:
      return { ...state, studyGroups: action.payload };
      
    case CommunityActionTypes.CREATE_STUDY_GROUP:
      const newGroup = action.payload;
      return {
        ...state,
        studyGroups: [...state.studyGroups, newGroup],
        userStudyGroups: [...state.userStudyGroups, newGroup],
      };
      
    case CommunityActionTypes.JOIN_STUDY_GROUP:
      const group = action.payload;
      return {
        ...state,
        userStudyGroups: [...state.userStudyGroups, group],
        studyGroups: state.studyGroups.map(g =>
          g.id === group.id
            ? { ...g, members: g.members + 1, hasJoined: true }
            : g
        ),
      };
      
    case CommunityActionTypes.ADD_GROUP_MESSAGE:
      const { groupId, message } = action.payload;
      return {
        ...state,
        groupMessages: {
          ...state.groupMessages,
          [groupId]: [...(state.groupMessages[groupId] || []), message],
        },
      };
      
    // Events
    case CommunityActionTypes.SET_EVENTS:
      return { ...state, events: action.payload };
      
    case CommunityActionTypes.JOIN_EVENT:
      const event = action.payload;
      return {
        ...state,
        userEvents: [...state.userEvents, event],
        events: state.events.map(e =>
          e.id === event.id
            ? { ...e, attendees: e.attendees + 1, hasJoined: true }
            : e
        ),
      };
      
    // Social Features
    case CommunityActionTypes.FOLLOW_USER:
      const followedUser = action.payload;
      return {
        ...state,
        following: [...state.following, followedUser],
      };
      
    case CommunityActionTypes.UNFOLLOW_USER:
      const unfollowedUserId = action.payload;
      return {
        ...state,
        following: state.following.filter(u => u.id !== unfollowedUserId),
      };
      
    case CommunityActionTypes.SET_FOLLOWING:
      return { ...state, following: action.payload };
      
    case CommunityActionTypes.SET_FOLLOWERS:
      return { ...state, followers: action.payload };
      
    case CommunityActionTypes.UPDATE_SOCIAL_STATS:
      return {
        ...state,
        communityStats: { ...state.communityStats, ...action.payload },
      };
      
    // Awards & Recognition
    case CommunityActionTypes.WIN_COMMUNITY_AWARD:
      const award = action.payload;
      return {
        ...state,
        userCommunityProfile: {
          ...state.userCommunityProfile,
          communityBadges: [...state.userCommunityProfile.communityBadges, award],
        },
      };
      
    // Live Activity
    case CommunityActionTypes.SET_LIVE_ACTIVITY:
      return { ...state, liveActivity: action.payload };
      
    default:
      return state;
  }
}

// Create Community Context
const CommunityContext = createContext();

// Community Provider Component
export function CommunityProvider({ children }) {
  const [state, dispatch] = useReducer(communityReducer, initialCommunityState);
  const { user, isAuthenticated } = useApp();
  
  // Safely get profile functions
  let gainXP, earnBadge;
  try {
    const profileContext = useProfile();
    gainXP = profileContext?.gainXP || (() => {});
    earnBadge = profileContext?.earnBadge || (() => {});
  } catch (error) {
    console.log('Profile context not available yet');
    gainXP = () => {};
    earnBadge = () => {};
  }

  // Load community data on mount
  useEffect(() => {
    // Load community data even if user is not fully authenticated for demo purposes
    loadCommunityData();
  }, []);

  // Load community data with mock data
  const loadCommunityData = async () => {
    try {
      dispatch({ type: CommunityActionTypes.SET_LOADING, payload: true });
      
      // Mock Live Challenges
      const mockChallenges = [
        {
          id: 1,
          title: "30-Day React Native Challenge",
          description: "Build 30 React Native components in 30 days",
          type: "coding",
          difficulty: "intermediate",
          skill: "React Native",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 156,
          submissions: 89,
          prize: "500 XP + React Native Master Badge",
          hasJoined: false,
          hasSubmitted: false,
          status: "active",
        },
        {
          id: 2,
          title: "JavaScript Algorithms Sprint",
          description: "Solve 20 algorithm challenges this week",
          type: "problem-solving",
          difficulty: "advanced",
          skill: "JavaScript",
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 203,
          submissions: 167,
          prize: "1000 XP + Algorithm Ninja Badge",
          hasJoined: true,
          hasSubmitted: false,
          status: "active",
        },
        {
          id: 3,
          title: "UI/UX Design Showdown",
          description: "Create stunning mobile app designs",
          type: "design",
          difficulty: "beginner",
          skill: "UI/UX",
          startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 78,
          submissions: 0,
          prize: "300 XP + Designer Badge",
          hasJoined: false,
          hasSubmitted: false,
          status: "upcoming",
        },
      ];
      
      // Mock Tournaments
      const mockTournaments = [
        {
          id: 1,
          title: "JavaScript Championship 2025",
          description: "Ultimate JavaScript skills tournament",
          type: "elimination",
          skill: "JavaScript",
          format: "1v1",
          rounds: 4,
          currentRound: 2,
          participants: 64,
          remainingParticipants: 16,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextRoundDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          prize: "5000 XP + Champion Badge + $500",
          hasJoined: true,
          status: "active",
          userStatus: "qualified", // qualified, eliminated, pending
        },
        {
          id: 2,
          title: "React Native Battle Royale",
          description: "Last developer standing wins",
          type: "battle-royale",
          skill: "React Native",
          format: "multi-elimination",
          rounds: 5,
          currentRound: 1,
          participants: 128,
          remainingParticipants: 128,
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          prize: "10000 XP + Legendary Badge + $1000",
          hasJoined: false,
          status: "registration",
        },
      ];
      
      // Mock Mentors
      const mockMentors = [
        {
          id: 1,
          name: "Sarah Johnson",
          title: "Senior React Native Developer",
          company: "Meta",
          avatar: null,
          rating: 4.9,
          reviewCount: 127,
          hourlyRate: 75,
          skills: ["React Native", "JavaScript", "Mobile Architecture"],
          experience: "8 years",
          responseTime: "< 2 hours",
          languages: ["English", "Spanish"],
          timezone: "PST",
          availability: "weekdays",
          specialties: ["Mobile Performance", "App Store Optimization", "Team Leadership"],
          isAvailable: true,
          nextAvailableSlot: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: "David Chen",
          title: "Full Stack Architect",
          company: "Google",
          avatar: null,
          rating: 4.8,
          reviewCount: 89,
          hourlyRate: 95,
          skills: ["JavaScript", "Node.js", "System Design", "Microservices"],
          experience: "12 years",
          responseTime: "< 4 hours",
          languages: ["English", "Mandarin"],
          timezone: "EST",
          availability: "flexible",
          specialties: ["System Architecture", "Scalability", "Code Review"],
          isAvailable: true,
          nextAvailableSlot: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          title: "UI/UX Design Lead",
          company: "Airbnb",
          avatar: null,
          rating: 4.95,
          reviewCount: 156,
          hourlyRate: 85,
          skills: ["UI/UX Design", "Figma", "Design Systems", "User Research"],
          experience: "6 years",
          responseTime: "< 1 hour",
          languages: ["English"],
          timezone: "PST",
          availability: "evenings",
          specialties: ["Mobile Design", "Design Systems", "User Testing"],
          isAvailable: false,
          nextAvailableSlot: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      // Mock Study Groups
      const mockStudyGroups = [
        {
          id: 1,
          name: "React Native Beginners",
          description: "Learning React Native from scratch together",
          skill: "React Native",
          level: "beginner",
          members: 24,
          maxMembers: 30,
          isPrivate: false,
          language: "English",
          schedule: "Tuesdays & Thursdays 7PM PST",
          topics: ["Components", "Navigation", "State Management", "API Integration"],
          createdBy: "Alex Chen",
          createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          hasJoined: true,
          status: "active",
        },
        {
          id: 2,
          name: "JavaScript Algorithms Club",
          description: "Daily algorithm practice and discussion",
          skill: "JavaScript",
          level: "intermediate",
          members: 47,
          maxMembers: 50,
          isPrivate: false,
          language: "English",
          schedule: "Daily challenges + Weekly discussion",
          topics: ["Data Structures", "Algorithms", "Problem Solving", "Interview Prep"],
          createdBy: "Maria Santos",
          createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          hasJoined: false,
          status: "active",
        },
        {
          id: 3,
          name: "Full Stack Masters",
          description: "Advanced full-stack development discussions",
          skill: "Full Stack",
          level: "advanced",
          members: 31,
          maxMembers: 35,
          isPrivate: true,
          language: "English",
          schedule: "Sundays 5PM EST",
          topics: ["Architecture", "Scalability", "DevOps", "Best Practices"],
          createdBy: "John Doe",
          createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          hasJoined: false,
          status: "active",
        },
      ];
      
      // Mock Events
      const mockEvents = [
        {
          id: 1,
          title: "React Native Conference 2025",
          description: "Annual React Native community conference with industry leaders",
          type: "conference",
          format: "virtual",
          skill: "React Native",
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "3 days",
          attendees: 1247,
          maxAttendees: 2000,
          price: "Free",
          speakers: ["Dan Abramov", "Sophie Alpert", "Parashuram N"],
          topics: ["Performance", "New Features", "Best Practices", "Future of RN"],
          hasJoined: true,
          status: "upcoming",
        },
        {
          id: 2,
          title: "JavaScript Workshop: Advanced Patterns",
          description: "Deep dive into advanced JavaScript patterns and techniques",
          type: "workshop",
          format: "hybrid",
          skill: "JavaScript",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          duration: "4 hours",
          attendees: 89,
          maxAttendees: 100,
          price: "$49",
          speakers: ["Kyle Simpson", "Douglas Crockford"],
          topics: ["Closures", "Prototypes", "Async Patterns", "Performance"],
          hasJoined: false,
          status: "registration",
        },
        {
          id: 3,
          title: "UI/UX Design Thinking Session",
          description: "Collaborative design thinking workshop for mobile apps",
          type: "workshop",
          format: "in-person",
          skill: "UI/UX",
          location: "San Francisco, CA",
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
          duration: "6 hours",
          attendees: 23,
          maxAttendees: 30,
          price: "Free",
          speakers: ["Julie Zhuo", "John Maeda"],
          topics: ["User Research", "Prototyping", "Design Systems", "Accessibility"],
          hasJoined: false,
          status: "upcoming",
        },
      ];
      
      // Mock Community Stats
      const mockStats = {
        totalMembers: 12847,
        activeChallenges: 15,
        runningTournaments: 8,
        availableMentors: 234,
        activeStudyGroups: 89,
        upcomingEvents: 23,
      };
      
      // Mock User Community Profile
      const mockUserProfile = {
        reputation: 1247,
        contributionScore: 892,
        helpfulnessRating: 4.6,
        communityLevel: 5,
        communityBadges: [
          { id: 1, name: "Helpful Helper", type: "community", earnedDate: new Date().toISOString() },
          { id: 2, name: "Challenge Winner", type: "achievement", earnedDate: new Date().toISOString() },
        ],
        weeklyRank: 23,
        monthlyRank: 12,
      };
      
      // Mock Live Activity Data
      const mockLiveActivity = [
        {
          id: 1,
          type: 'challenge_completion',
          user: 'Alex Chen',
          action: 'completed React Native Challenge',
          timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
          challengeId: 1,
          isLive: true,
        },
        {
          id: 2,
          type: 'skill_verification',
          user: 'Sarah Kim',
          action: 'earned JavaScript Expert badge',
          timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
          challengeId: null,
          isLive: true,
        },
        {
          id: 3,
          type: 'mentor_session',
          user: 'John Doe',
          action: 'started mentoring session',
          timestamp: Date.now() - 8 * 60 * 1000, // 8 minutes ago
          challengeId: null,
          isLive: false,
        },
        {
          id: 4,
          type: 'tournament_win',
          user: 'Maria Santos',
          action: 'won Algorithm Tournament',
          timestamp: Date.now() - 15 * 60 * 1000, // 15 minutes ago
          challengeId: null,
          isLive: false,
        },
        {
          id: 5,
          type: 'study_group_join',
          user: 'David Park',
          action: 'joined React Native Beginners group',
          timestamp: Date.now() - 22 * 60 * 1000, // 22 minutes ago
          challengeId: null,
          isLive: false,
        },
        {
          id: 6,
          type: 'challenge_completion',
          user: 'Emily Wilson',
          action: 'solved 5 algorithms today',
          timestamp: Date.now() - 35 * 60 * 1000, // 35 minutes ago
          challengeId: 2,
          isLive: false,
        },
      ];
      
      // Dispatch all mock data
      dispatch({ type: CommunityActionTypes.SET_LIVE_CHALLENGES, payload: mockChallenges });
      dispatch({ type: CommunityActionTypes.SET_TOURNAMENTS, payload: mockTournaments });
      dispatch({ type: CommunityActionTypes.SET_MENTORS, payload: mockMentors });
      dispatch({ type: CommunityActionTypes.SET_STUDY_GROUPS, payload: mockStudyGroups });
      dispatch({ type: CommunityActionTypes.SET_EVENTS, payload: mockEvents });
      dispatch({ type: CommunityActionTypes.UPDATE_SOCIAL_STATS, payload: mockStats });
      dispatch({ type: CommunityActionTypes.SET_LIVE_ACTIVITY, payload: mockLiveActivity });
      
      // Save to storage
      const communityKey = `community_${user?.id || 'demo'}`;
      await AsyncStorage.setItem(communityKey, JSON.stringify({
        ...state,
        liveChallenges: mockChallenges,
        tournaments: mockTournaments,
        mentors: mockMentors,
        studyGroups: mockStudyGroups,
        events: mockEvents,
        communityStats: mockStats,
        userCommunityProfile: mockUserProfile,
        liveActivity: mockLiveActivity,
      }));
      
      dispatch({ type: CommunityActionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error('Error loading community data:', error);
      dispatch({ type: CommunityActionTypes.SET_ERROR, payload: 'Failed to load community data' });
    }
  };

  // Challenge Actions
  const joinChallenge = useCallback(async (challengeId) => {
    try {
      const challenge = state.liveChallenges.find(c => c.id === challengeId);
      if (challenge) {
        dispatch({ type: CommunityActionTypes.JOIN_CHALLENGE, payload: challenge });
        gainXP(50); // Reward for joining challenge
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  }, [state.liveChallenges, gainXP]);

  const submitChallengeEntry = useCallback(async (challengeId, submission) => {
    try {
      const entry = {
        id: Date.now(),
        challengeId,
        userId: user?.id || 'demo',
        submission,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        score: null,
      };
      
      dispatch({ type: CommunityActionTypes.SUBMIT_CHALLENGE_ENTRY, payload: entry });
      gainXP(100); // Reward for submitting entry
    } catch (error) {
      console.error('Error submitting challenge entry:', error);
    }
  }, [user, gainXP]);

  // Tournament Actions
  const joinTournament = useCallback(async (tournamentId) => {
    try {
      const tournament = state.tournaments.find(t => t.id === tournamentId);
      if (tournament) {
        dispatch({ type: CommunityActionTypes.JOIN_TOURNAMENT, payload: tournament });
        gainXP(75); // Reward for joining tournament
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  }, [state.tournaments, gainXP]);

  // Mentorship Actions
  const requestMentorship = useCallback(async (mentorId, message, sessionType) => {
    try {
      const mentor = state.mentors.find(m => m.id === mentorId);
      if (mentor) {
        const request = {
          id: Date.now(),
          mentorId,
          menteeId: user?.id || 'demo',
          message,
          sessionType,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          mentor,
        };
        
        dispatch({ type: CommunityActionTypes.REQUEST_MENTORSHIP, payload: request });
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  }, [state.mentors, user]);

  // Study Group Actions
  const joinStudyGroup = useCallback(async (groupId) => {
    try {
      const group = state.studyGroups.find(g => g.id === groupId);
      if (group) {
        dispatch({ type: CommunityActionTypes.JOIN_STUDY_GROUP, payload: group });
        gainXP(25); // Reward for joining study group
      }
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  }, [state.studyGroups, gainXP]);

  const createStudyGroup = useCallback(async (groupData) => {
    try {
      const newGroup = {
        id: Date.now(),
        ...groupData,
        members: 1,
        createdBy: user?.name || 'Demo User',
        createdDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        hasJoined: true,
        status: 'active',
      };
      
      dispatch({ type: CommunityActionTypes.CREATE_STUDY_GROUP, payload: newGroup });
      gainXP(100); // Reward for creating study group
      earnBadge({
        name: 'Community Builder',
        type: 'community',
        description: 'Created a study group',
      });
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  }, [user, gainXP, earnBadge]);

  // Event Actions
  const joinEvent = useCallback(async (eventId) => {
    try {
      const event = state.events.find(e => e.id === eventId);
      if (event) {
        dispatch({ type: CommunityActionTypes.JOIN_EVENT, payload: event });
        gainXP(30); // Reward for joining event
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  }, [state.events, gainXP]);

  // Social Actions
  const followUser = useCallback(async (userId, userData) => {
    try {
      dispatch({ type: CommunityActionTypes.FOLLOW_USER, payload: userData });
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    try {
      dispatch({ type: CommunityActionTypes.UNFOLLOW_USER, payload: userId });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Challenge Actions
    joinChallenge,
    submitChallengeEntry,
    
    // Tournament Actions
    joinTournament,
    
    // Mentorship Actions
    requestMentorship,
    
    // Study Group Actions
    joinStudyGroup,
    createStudyGroup,
    
    // Event Actions
    joinEvent,
    
    // Social Actions
    followUser,
    unfollowUser,
    
    // Utilities
    loadCommunityData,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

// Custom Hook
export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}

// Export action types for external use
export { CommunityActionTypes };
