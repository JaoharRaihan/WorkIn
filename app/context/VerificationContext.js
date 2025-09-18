import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from './ProfileContext';

// Verification Action Types
const VerificationActionTypes = {
  SET_VERIFICATION_DATA: 'SET_VERIFICATION_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_SKILL_VERIFICATION: 'ADD_SKILL_VERIFICATION',
  UPDATE_SKILL_VERIFICATION: 'UPDATE_SKILL_VERIFICATION',
  ADD_PROJECT_VERIFICATION: 'ADD_PROJECT_VERIFICATION',
  UPDATE_PROJECT_VERIFICATION: 'UPDATE_PROJECT_VERIFICATION',
  ADD_IDENTITY_VERIFICATION: 'ADD_IDENTITY_VERIFICATION',
  UPDATE_TRUST_SCORE: 'UPDATE_TRUST_SCORE',
  ADD_BADGE_VERIFICATION: 'ADD_BADGE_VERIFICATION',
  ADD_PEER_ENDORSEMENT: 'ADD_PEER_ENDORSEMENT',
  ADD_MENTOR_ENDORSEMENT: 'ADD_MENTOR_ENDORSEMENT',
  VERIFY_BLOCKCHAIN_CREDENTIAL: 'VERIFY_BLOCKCHAIN_CREDENTIAL',
  GENERATE_VERIFICATION_REPORT: 'GENERATE_VERIFICATION_REPORT',
  CLEAR_VERIFICATION: 'CLEAR_VERIFICATION'
};

// Initial Verification State
const initialVerificationState = {
  // Identity Verification
  identityVerification: {
    isVerified: false,
    verifiedAt: null,
    method: null, // 'government_id', 'biometric', 'social_proof'
    documents: [],
    verificationId: null,
    trustLevel: 'unverified', // 'unverified', 'basic', 'enhanced', 'premium'
  },

  // Skill Verifications
  skillVerifications: [],

  // Project Verifications
  projectVerifications: [],

  // Badge Verifications
  badgeVerifications: [],

  // Peer & Mentor Endorsements
  endorsements: {
    peer: [],
    mentor: [],
    employer: [],
  },

  // Blockchain Credentials
  blockchainCredentials: [],

  // Trust Score Components
  trustScoreBreakdown: {
    identityVerification: 0,      // Max 25 points
    skillVerifications: 0,        // Max 30 points
    projectVerifications: 0,      // Max 20 points
    peerEndorsements: 0,         // Max 10 points
    mentorEndorsements: 0,       // Max 10 points
    blockchainCredentials: 0,    // Max 5 points
    totalScore: 0,               // Max 100 points
  },

  // Verification Reports
  verificationReports: [],

  // Anti-Cheat Records
  antiCheatRecords: [],

  // Learning Verification
  learningVerification: {
    roadmapsCompleted: [],
    testsCompleted: [],
    projectsCompleted: [],
    learningHours: 0,
    consistencyScore: 0,
  },

  // UI State
  loading: false,
  error: null,
  refreshing: false,
};

// Verification Reducer
function verificationReducer(state, action) {
  switch (action.type) {
    case VerificationActionTypes.SET_VERIFICATION_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };

    case VerificationActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case VerificationActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case VerificationActionTypes.ADD_SKILL_VERIFICATION:
      const newSkillVerification = {
        id: Date.now(),
        skillId: action.payload.skillId,
        skillName: action.payload.skillName,
        verificationMethod: action.payload.method, // 'test', 'project', 'peer_review', 'mentor_review'
        score: action.payload.score,
        maxScore: action.payload.maxScore || 100,
        testId: action.payload.testId,
        projectId: action.payload.projectId,
        verifiedAt: new Date().toISOString(),
        verifiedBy: action.payload.verifiedBy || 'skillnet_system',
        verificationLevel: action.payload.verificationLevel || 'basic', // 'basic', 'advanced', 'expert'
        evidence: action.payload.evidence || [],
        blockchainHash: action.payload.blockchainHash,
        expiresAt: action.payload.expiresAt,
        ...action.payload,
      };

      return {
        ...state,
        skillVerifications: [...state.skillVerifications, newSkillVerification],
      };

    case VerificationActionTypes.UPDATE_SKILL_VERIFICATION:
      return {
        ...state,
        skillVerifications: state.skillVerifications.map(verification =>
          verification.id === action.payload.id 
            ? { ...verification, ...action.payload }
            : verification
        ),
      };

    case VerificationActionTypes.ADD_PROJECT_VERIFICATION:
      const newProjectVerification = {
        id: Date.now(),
        projectId: action.payload.projectId,
        projectTitle: action.payload.projectTitle,
        verificationMethod: action.payload.method, // 'peer_review', 'mentor_review', 'automated_analysis'
        score: action.payload.score,
        maxScore: action.payload.maxScore || 100,
        reviewedBy: action.payload.reviewedBy,
        verifiedAt: new Date().toISOString(),
        criteria: action.payload.criteria || [],
        feedback: action.payload.feedback,
        evidence: action.payload.evidence || [],
        blockchainHash: action.payload.blockchainHash,
        ...action.payload,
      };

      return {
        ...state,
        projectVerifications: [...state.projectVerifications, newProjectVerification],
      };

    case VerificationActionTypes.UPDATE_PROJECT_VERIFICATION:
      return {
        ...state,
        projectVerifications: state.projectVerifications.map(verification =>
          verification.id === action.payload.id 
            ? { ...verification, ...action.payload }
            : verification
        ),
      };

    case VerificationActionTypes.ADD_IDENTITY_VERIFICATION:
      return {
        ...state,
        identityVerification: {
          ...state.identityVerification,
          ...action.payload,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      };

    case VerificationActionTypes.ADD_BADGE_VERIFICATION:
      const newBadgeVerification = {
        id: Date.now(),
        badgeId: action.payload.badgeId,
        badgeName: action.payload.badgeName,
        badgeType: action.payload.badgeType,
        earnedAt: action.payload.earnedAt,
        verifiedAt: new Date().toISOString(),
        issuedBy: action.payload.issuedBy || 'skillnet',
        blockchainHash: action.payload.blockchainHash,
        verificationCriteria: action.payload.criteria || [],
        ...action.payload,
      };

      return {
        ...state,
        badgeVerifications: [...state.badgeVerifications, newBadgeVerification],
      };

    case VerificationActionTypes.ADD_PEER_ENDORSEMENT:
      const newPeerEndorsement = {
        id: Date.now(),
        endorserId: action.payload.endorserId,
        endorserName: action.payload.endorserName,
        endorserProfile: action.payload.endorserProfile,
        skillId: action.payload.skillId,
        skillName: action.payload.skillName,
        relationship: action.payload.relationship, // 'colleague', 'project_partner', 'team_member'
        endorsementText: action.payload.endorsementText,
        rating: action.payload.rating, // 1-5 scale
        endorsedAt: new Date().toISOString(),
        verificationStatus: 'pending', // 'pending', 'verified', 'disputed'
        ...action.payload,
      };

      return {
        ...state,
        endorsements: {
          ...state.endorsements,
          peer: [...state.endorsements.peer, newPeerEndorsement],
        },
      };

    case VerificationActionTypes.ADD_MENTOR_ENDORSEMENT:
      const newMentorEndorsement = {
        id: Date.now(),
        mentorId: action.payload.mentorId,
        mentorName: action.payload.mentorName,
        mentorCredentials: action.payload.mentorCredentials,
        skillId: action.payload.skillId,
        skillName: action.payload.skillName,
        endorsementText: action.payload.endorsementText,
        proficiencyLevel: action.payload.proficiencyLevel, // 'beginner', 'intermediate', 'advanced', 'expert'
        rating: action.payload.rating, // 1-5 scale
        endorsedAt: new Date().toISOString(),
        mentorshipDuration: action.payload.mentorshipDuration,
        verificationStatus: 'verified', // Mentors are pre-verified
        ...action.payload,
      };

      return {
        ...state,
        endorsements: {
          ...state.endorsements,
          mentor: [...state.endorsements.mentor, newMentorEndorsement],
        },
      };

    case VerificationActionTypes.VERIFY_BLOCKCHAIN_CREDENTIAL:
      const newBlockchainCredential = {
        id: Date.now(),
        credentialId: action.payload.credentialId,
        credentialType: action.payload.credentialType, // 'skill', 'project', 'badge', 'certificate'
        issuer: action.payload.issuer,
        blockchainNetwork: action.payload.blockchainNetwork || 'ethereum',
        transactionHash: action.payload.transactionHash,
        blockNumber: action.payload.blockNumber,
        verifiedAt: new Date().toISOString(),
        metadata: action.payload.metadata || {},
        verificationStatus: 'verified',
        ...action.payload,
      };

      return {
        ...state,
        blockchainCredentials: [...state.blockchainCredentials, newBlockchainCredential],
      };

    case VerificationActionTypes.UPDATE_TRUST_SCORE:
      const calculateTrustScore = (breakdown) => {
        return Object.values(breakdown).reduce((sum, score) => sum + score, 0);
      };

      const newBreakdown = { ...state.trustScoreBreakdown, ...action.payload };
      const newTotalScore = calculateTrustScore(newBreakdown);

      return {
        ...state,
        trustScoreBreakdown: {
          ...newBreakdown,
          totalScore: Math.min(newTotalScore, 100), // Cap at 100
        },
      };

    case VerificationActionTypes.GENERATE_VERIFICATION_REPORT:
      const verificationReport = {
        id: Date.now(),
        generatedAt: new Date().toISOString(),
        reportType: action.payload.reportType || 'comprehensive',
        requestedBy: action.payload.requestedBy,
        verificationSummary: {
          identityVerified: state.identityVerification.isVerified,
          skillsVerified: state.skillVerifications.length,
          projectsVerified: state.projectVerifications.length,
          peerEndorsements: state.endorsements.peer.length,
          mentorEndorsements: state.endorsements.mentor.length,
          blockchainCredentials: state.blockchainCredentials.length,
          trustScore: state.trustScoreBreakdown.totalScore,
        },
        detailedBreakdown: action.payload.includeDetails ? {
          skillVerifications: state.skillVerifications,
          projectVerifications: state.projectVerifications,
          endorsements: state.endorsements,
          blockchainCredentials: state.blockchainCredentials,
        } : null,
        expiresAt: action.payload.expiresAt,
        verificationHash: action.payload.verificationHash,
        ...action.payload,
      };

      return {
        ...state,
        verificationReports: [...state.verificationReports, verificationReport],
      };

    case VerificationActionTypes.CLEAR_VERIFICATION:
      return initialVerificationState;

    default:
      return state;
  }
}

// Create Verification Context
const VerificationContext = createContext();

// Verification Provider Component
export function VerificationProvider({ children }) {
  const [state, dispatch] = useReducer(verificationReducer, initialVerificationState);
  const { profileData, gainXP, earnBadge } = useProfile();

  // Load verification data from storage on mount
  useEffect(() => {
    if (profileData.id) {
      loadVerificationFromStorage();
    }
  }, [profileData.id]);

  // Save verification data whenever it changes
  useEffect(() => {
    if (profileData.id && state.skillVerifications.length > 0) {
      saveVerificationToStorage();
    }
  }, [state, profileData.id]);

  // Auto-update trust score when verifications change
  useEffect(() => {
    updateTrustScoreBreakdown();
  }, [
    state.identityVerification,
    state.skillVerifications,
    state.projectVerifications,
    state.endorsements,
    state.blockchainCredentials,
  ]);

  // Load verification from AsyncStorage
  const loadVerificationFromStorage = async () => {
    try {
      dispatch({ type: VerificationActionTypes.SET_LOADING, payload: true });
      
      const verificationKey = `verification_${profileData.id}`;
      const savedVerification = await AsyncStorage.getItem(verificationKey);
      
      if (savedVerification) {
        const parsedVerification = JSON.parse(savedVerification);
        dispatch({ type: VerificationActionTypes.SET_VERIFICATION_DATA, payload: parsedVerification });
      } else {
        // Initialize with mock verification data
        initializeMockVerificationData();
      }
    } catch (error) {
      console.error('Error loading verification from storage:', error);
      dispatch({ type: VerificationActionTypes.SET_ERROR, payload: 'Failed to load verification data' });
    }
  };

  // Save verification to AsyncStorage
  const saveVerificationToStorage = async () => {
    try {
      const verificationKey = `verification_${profileData.id}`;
      await AsyncStorage.setItem(verificationKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving verification to storage:', error);
    }
  };

  // Initialize mock verification data
  const initializeMockVerificationData = () => {
    // Mock identity verification
    dispatch({ 
      type: VerificationActionTypes.ADD_IDENTITY_VERIFICATION, 
      payload: {
        method: 'government_id',
        verificationId: 'VID_' + Date.now(),
        trustLevel: 'enhanced',
        documents: ['passport', 'driver_license'],
      }
    });

    // Mock skill verifications
    const mockSkillVerifications = [
      {
        skillName: 'React Native',
        method: 'test',
        score: 89,
        testId: 'cse_007',
        verificationLevel: 'advanced',
        verifiedBy: 'skillnet_ai_proctor',
      },
      {
        skillName: 'JavaScript',
        method: 'project',
        score: 94,
        projectId: 'project_1',
        verificationLevel: 'expert',
        verifiedBy: 'senior_developer_mentor',
      },
    ];

    mockSkillVerifications.forEach(verification => {
      dispatch({ type: VerificationActionTypes.ADD_SKILL_VERIFICATION, payload: verification });
    });

    // Mock project verifications
    dispatch({
      type: VerificationActionTypes.ADD_PROJECT_VERIFICATION,
      payload: {
        projectId: 'project_1',
        projectTitle: 'Weather App',
        method: 'peer_review',
        score: 94,
        reviewedBy: 'senior_developer',
        feedback: 'Excellent code quality and user experience. Modern React Native patterns used effectively.',
        criteria: ['functionality', 'code_quality', 'ui_design', 'performance'],
      }
    });

    // Mock peer endorsements
    dispatch({
      type: VerificationActionTypes.ADD_PEER_ENDORSEMENT,
      payload: {
        endorserId: 'user_123',
        endorserName: 'Sarah Johnson',
        skillName: 'Team Leadership',
        relationship: 'project_partner',
        endorsementText: 'Alex demonstrated exceptional leadership during our mobile app project.',
        rating: 5,
      }
    });

    // Mock mentor endorsement
    dispatch({
      type: VerificationActionTypes.ADD_MENTOR_ENDORSEMENT,
      payload: {
        mentorId: 'mentor_456',
        mentorName: 'Dr. Michael Chen',
        mentorCredentials: 'Senior Engineering Manager at Google',
        skillName: 'Software Architecture',
        endorsementText: 'Shows deep understanding of scalable architecture patterns.',
        proficiencyLevel: 'advanced',
        rating: 5,
        mentorshipDuration: '6 months',
      }
    });
  };

  // Update trust score breakdown
  const updateTrustScoreBreakdown = useCallback(() => {
    const breakdown = {
      identityVerification: state.identityVerification.isVerified ? 25 : 0,
      skillVerifications: Math.min(state.skillVerifications.length * 5, 30),
      projectVerifications: Math.min(state.projectVerifications.length * 10, 20),
      peerEndorsements: Math.min(state.endorsements.peer.length * 2, 10),
      mentorEndorsements: Math.min(state.endorsements.mentor.length * 5, 10),
      blockchainCredentials: Math.min(state.blockchainCredentials.length * 1, 5),
    };

    dispatch({ type: VerificationActionTypes.UPDATE_TRUST_SCORE, payload: breakdown });
  }, [state]);

  // Verification Actions
  const addSkillVerification = useCallback((verification) => {
    dispatch({ type: VerificationActionTypes.ADD_SKILL_VERIFICATION, payload: verification });
    
    // Award XP for skill verification
    const xpReward = verification.verificationLevel === 'expert' ? 100 : 
                     verification.verificationLevel === 'advanced' ? 75 : 50;
    gainXP(xpReward);

    // Award badge for first expert-level verification
    if (verification.verificationLevel === 'expert' && 
        !state.skillVerifications.some(v => v.verificationLevel === 'expert')) {
      earnBadge({
        name: 'Expert Verified',
        type: 'verification',
        description: 'Achieved expert-level skill verification',
      });
    }
  }, [state.skillVerifications, gainXP, earnBadge]);

  const addProjectVerification = useCallback((verification) => {
    dispatch({ type: VerificationActionTypes.ADD_PROJECT_VERIFICATION, payload: verification });
    
    // Award XP for project verification
    const xpReward = Math.floor(verification.score / 10) * 10; // 10 XP per 10% score
    gainXP(xpReward);
  }, [gainXP]);

  const addPeerEndorsement = useCallback((endorsement) => {
    dispatch({ type: VerificationActionTypes.ADD_PEER_ENDORSEMENT, payload: endorsement });
    gainXP(25); // Reward for peer endorsement
  }, [gainXP]);

  const addMentorEndorsement = useCallback((endorsement) => {
    dispatch({ type: VerificationActionTypes.ADD_MENTOR_ENDORSEMENT, payload: endorsement });
    gainXP(50); // Higher reward for mentor endorsement
  }, [gainXP]);

  const verifyBlockchainCredential = useCallback((credential) => {
    dispatch({ type: VerificationActionTypes.VERIFY_BLOCKCHAIN_CREDENTIAL, payload: credential });
    gainXP(75); // Premium reward for blockchain verification
  }, [gainXP]);

  const generateVerificationReport = useCallback((reportOptions) => {
    const reportPayload = {
      ...reportOptions,
      verificationHash: 'VH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    
    dispatch({ type: VerificationActionTypes.GENERATE_VERIFICATION_REPORT, payload: reportPayload });
    return reportPayload.verificationHash;
  }, []);

  const clearVerification = useCallback(() => {
    dispatch({ type: VerificationActionTypes.CLEAR_VERIFICATION });
  }, []);

  // Helper functions
  const getVerificationLevel = useCallback((skillName) => {
    const verification = state.skillVerifications.find(v => v.skillName === skillName);
    return verification?.verificationLevel || 'unverified';
  }, [state.skillVerifications]);

  const getTrustScorePercentage = useCallback(() => {
    return state.trustScoreBreakdown.totalScore;
  }, [state.trustScoreBreakdown.totalScore]);

  const getVerificationSummary = useCallback(() => {
    return {
      identityVerified: state.identityVerification.isVerified,
      skillsVerified: state.skillVerifications.length,
      projectsVerified: state.projectVerifications.length,
      totalEndorsements: state.endorsements.peer.length + state.endorsements.mentor.length,
      trustScore: state.trustScoreBreakdown.totalScore,
      verificationLevel: state.trustScoreBreakdown.totalScore >= 80 ? 'premium' :
                        state.trustScoreBreakdown.totalScore >= 60 ? 'enhanced' :
                        state.trustScoreBreakdown.totalScore >= 40 ? 'basic' : 'unverified',
    };
  }, [state]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    addSkillVerification,
    addProjectVerification,
    addPeerEndorsement,
    addMentorEndorsement,
    verifyBlockchainCredential,
    generateVerificationReport,
    clearVerification,
    
    // Utilities
    getVerificationLevel,
    getTrustScorePercentage,
    getVerificationSummary,
    saveVerificationToStorage,
    loadVerificationFromStorage,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}

// Custom Hook
export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

// Export action types for external use
export { VerificationActionTypes };
