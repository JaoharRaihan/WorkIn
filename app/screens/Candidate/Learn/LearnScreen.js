import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Components
import RoadmapTypeTabs from '../../../components/RoadmapTypeTabs';
import RoadmapCard from '../../../components/RoadmapCard';
import RoadmapStepCard from '../../../components/RoadmapStepCard';
import MilestoneModal from '../../../components/MilestoneModal';
import HeatmapProgress from '../../../components/HeatmapProgress';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import TestPreviewModal from '../../../components/TestPreviewModal';
import ProgressStatsPanel from '../../../components/ProgressStatsPanel';

// Services
import PreTestService from '../../../services/preTestService';
import CheckpointTestService from '../../../services/checkpointTestService';
import ProgressTrackingService from '../../../services/progressTrackingService';

const LearnScreen = () => {
  const navigation = useNavigation();
  
  // State management
  const [selectedType, setSelectedType] = useState('free'); // 'free' or 'premium'
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPreTestTaken, setHasPreTestTaken] = useState(false); // Changed to false to show pre-test flow
  const [personalizedRoadmaps, setPersonalizedRoadmaps] = useState([]);
  const [preTestService] = useState(new PreTestService());
  const [checkpointTestService] = useState(new CheckpointTestService());
  const [progressTrackingService] = useState(new ProgressTrackingService());
  const [showTestPreview, setShowTestPreview] = useState(false);
  const [previewTestData, setPreviewTestData] = useState(null);
  const [previewStepContext, setPreviewStepContext] = useState(null);
  const [progressInsights, setProgressInsights] = useState([]);
  const [nextMilestones, setNextMilestones] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Calculate progress insights and milestones on progress change
  useEffect(() => {
    if (selectedRoadmap && userProgress[selectedRoadmap.id]) {
      const currentProgress = {
        totalXP: Object.values(userProgress).reduce((sum, p) => sum + p.totalXP, 0),
        currentStreak: Math.max(...Object.values(userProgress).map(p => p.currentStreak || 0)),
        totalBadges: Object.values(userProgress).reduce((sum, p) => sum + p.badges.length, 0),
        completedRoadmaps: Object.values(userProgress).filter(p => p.completedSteps.length >= 10).length,
        testScores: Object.values(userProgress).map(p => p.avgTestScore).filter(Boolean),
        heatmapData: userProgress[selectedRoadmap.id].heatmapData
      };

      // Generate insights
      const insights = progressTrackingService.generateProgressInsights(currentProgress);
      setProgressInsights(insights);

      // Get next milestones
      const milestones = progressTrackingService.getNextMilestoneProgress(currentProgress);
      setNextMilestones(milestones);
    }
  }, [userProgress, selectedRoadmap]);

  // Persist user progress to local storage
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem('userProgress', JSON.stringify(userProgress));
        await AsyncStorage.setItem('hasPreTestTaken', JSON.stringify(hasPreTestTaken));
        await AsyncStorage.setItem('personalizedRoadmaps', JSON.stringify(personalizedRoadmaps));
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };
    
    if (Object.keys(userProgress).length > 0) {
      saveProgress();
    }
  }, [userProgress, hasPreTestTaken, personalizedRoadmaps]);

  // Load persisted data on component mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('userProgress');
        const savedPreTestStatus = await AsyncStorage.getItem('hasPreTestTaken');
        const savedPersonalizedRoadmaps = await AsyncStorage.getItem('personalizedRoadmaps');
        
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setUserProgress(prev => ({ ...prev, ...parsedProgress }));
        }
        
        if (savedPreTestStatus) {
          setHasPreTestTaken(JSON.parse(savedPreTestStatus));
        }
        
        if (savedPersonalizedRoadmaps) {
          setPersonalizedRoadmaps(JSON.parse(savedPersonalizedRoadmaps));
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };
    
    loadPersistedData();
  }, []);

  // Handle test completion when returning to the screen
  useFocusEffect(
    React.useCallback(() => {
      // Check if returning from a test screen with results
      const checkForTestResults = () => {
        // This would normally check for stored test results or route params
        // For now, we'll handle test completion via other means
      };
      checkForTestResults();
      
      // Update last sync time when screen is focused
      setLastSyncTime(new Date().toISOString());
    }, [])
  );
  
  // Mock user progress data with enhanced tracking
  const [userProgress, setUserProgress] = useState({
    1: {
      completedSteps: [1, 2, 3],
      heatmapData: generateMockHeatmapData(),
      badges: ['React Basics', 'JavaScript Pro'],
      totalXP: 450,
      currentStreak: 7,
      weeklyActiveDays: 5,
      avgTestScore: 87,
      weeklyStudyTime: 12,
      completionRate: 85,
      weeklyActivity: [2, 3, 1, 4, 2, 0, 3] // Mon-Sun activity levels
    },
    2: {
      completedSteps: [1],
      heatmapData: generateMockHeatmapData(0.3),
      badges: ['Node.js Beginner'],
      totalXP: 150,
      currentStreak: 2,
      weeklyActiveDays: 3,
      avgTestScore: 75,
      weeklyStudyTime: 6,
      completionRate: 60,
      weeklyActivity: [1, 0, 2, 1, 0, 1, 2]
    },
    3: {
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      heatmapData: generateMockHeatmapData(0.8),
      badges: ['Design Master', 'Figma Expert', 'UX Research'],
      totalXP: 850,
      currentStreak: 14,
      weeklyActiveDays: 6,
      avgTestScore: 92,
      weeklyStudyTime: 18,
      completionRate: 95,
      weeklyActivity: [4, 3, 4, 2, 3, 4, 3]
    }
  });
  // Enhanced roadmap data with more details
  const [roadmaps, setRoadmaps] = useState({
    free: [
      // 1. Technology & Software Development
      {
        id: 1,
        title: 'Software Development Fundamentals',
        description: 'Master programming basics, algorithms, and software engineering principles',
        tags: ['Programming', 'Algorithms', 'Data Structures', 'Testing'],
        difficulty: 'Beginner',
        estimatedWeeks: 12,
        totalSteps: 15,
        isPremium: false,
        category: 'technology',
        steps: [
          { id: 1, title: 'Programming Logic & Problem Solving', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'cse_001', xpReward: 100 },
          { id: 2, title: 'Data Structures & Algorithms', status: 'available', hasCheckpointTest: true, checkpointTestId: 'cse_002', xpReward: 150 },
          { id: 3, title: 'Object-Oriented Programming', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_003', xpReward: 125 },
          { id: 4, title: 'Database Fundamentals', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_004', xpReward: 125 },
          { id: 5, title: 'Software Testing Principles', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_005', xpReward: 100 },
        ]
      },

      // 2. Finance & Banking
      {
        id: 2,
        title: 'Banking & Financial Services',
        description: 'Comprehensive preparation for banking exams and financial sector careers',
        tags: ['Banking', 'Finance', 'Economics', 'Accounting'],
        difficulty: 'Intermediate',
        estimatedWeeks: 16,
        totalSteps: 20,
        isPremium: false,
        category: 'finance',
        steps: [
          { id: 1, title: 'Banking Basics & Indian Banking System', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'bba_001', xpReward: 100 },
          { id: 2, title: 'Financial Markets & Instruments', status: 'available', hasCheckpointTest: true, checkpointTestId: 'bba_002', xpReward: 150 },
          { id: 3, title: 'Accounting Principles & Financial Statements', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'bba_003', xpReward: 125 },
          { id: 4, title: 'Economics for Banking', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'bba_004', xpReward: 150 },
          { id: 5, title: 'Risk Management & Compliance', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'bba_005', xpReward: 125 },
        ]
      },

      // 3. Healthcare & Medical
      {
        id: 3,
        title: 'Healthcare Professional Preparation',
        description: 'Essential knowledge for healthcare careers and medical entrance exams',
        tags: ['Medicine', 'Healthcare', 'Biology', 'Patient Care'],
        difficulty: 'Intermediate',
        estimatedWeeks: 20,
        totalSteps: 25,
        isPremium: false,
        category: 'healthcare',
        steps: [
          { id: 1, title: 'Human Anatomy & Physiology', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'pharm_001', xpReward: 150 },
          { id: 2, title: 'Medical Terminology & Documentation', status: 'available', hasCheckpointTest: true, checkpointTestId: 'pharm_002', xpReward: 100 },
          { id: 3, title: 'Healthcare Ethics & Patient Rights', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'pharm_003', xpReward: 125 },
          { id: 4, title: 'Infection Control & Safety', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'pharm_004', xpReward: 100 },
          { id: 5, title: 'Healthcare Management Systems', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'pharm_005', xpReward: 125 },
        ]
      },

      // 4. Government & Public Service
      {
        id: 4,
        title: 'Civil Services & Government Jobs',
        description: 'Complete preparation for UPSC, SSC, and other government examinations',
        tags: ['UPSC', 'SSC', 'Government', 'Public Administration'],
        difficulty: 'Advanced',
        estimatedWeeks: 24,
        totalSteps: 30,
        isPremium: false,
        category: 'government',
        steps: [
          { id: 1, title: 'Indian Polity & Constitution', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'civil_001', xpReward: 150 },
          { id: 2, title: 'Indian History & Culture', status: 'available', hasCheckpointTest: true, checkpointTestId: 'civil_002', xpReward: 150 },
          { id: 3, title: 'Geography & Environment', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_003', xpReward: 125 },
          { id: 4, title: 'Economics & Current Affairs', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_004', xpReward: 150 },
          { id: 5, title: 'Public Administration & Governance', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_005', xpReward: 175 },
        ]
      },

      // 5. Education & Teaching
      {
        id: 5,
        title: 'Teaching & Education Careers',
        description: 'Preparation for teaching jobs, CTET, and educational leadership roles',
        tags: ['Teaching', 'CTET', 'Education', 'Child Psychology'],
        difficulty: 'Beginner',
        estimatedWeeks: 14,
        totalSteps: 18,
        isPremium: false,
        category: 'education',
        steps: [
          { id: 1, title: 'Child Development & Psychology', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'eng_001', xpReward: 125 },
          { id: 2, title: 'Teaching Methodologies & Pedagogy', status: 'available', hasCheckpointTest: true, checkpointTestId: 'eng_002', xpReward: 150 },
          { id: 3, title: 'Curriculum Planning & Assessment', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'eng_003', xpReward: 125 },
          { id: 4, title: 'Educational Technology & Digital Learning', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'eng_004', xpReward: 100 },
          { id: 5, title: 'Inclusive Education & Special Needs', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'eng_005', xpReward: 150 },
        ]
      },

      // 6. Engineering & Technical
      {
        id: 6,
        title: 'Engineering Fundamentals',
        description: 'Core engineering concepts for GATE, PSU, and technical interviews',
        tags: ['Engineering', 'GATE', 'Technical', 'Problem Solving'],
        difficulty: 'Intermediate',
        estimatedWeeks: 18,
        totalSteps: 22,
        isPremium: false,
        category: 'engineering',
        steps: [
          { id: 1, title: 'Engineering Mathematics', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'eee_001', xpReward: 150 },
          { id: 2, title: 'Engineering Physics & Chemistry', status: 'available', hasCheckpointTest: true, checkpointTestId: 'eee_002', xpReward: 125 },
          { id: 3, title: 'Engineering Drawing & CAD', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'eee_003', xpReward: 100 },
          { id: 4, title: 'Thermodynamics & Fluid Mechanics', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'mech_001', xpReward: 150 },
          { id: 5, title: 'Materials Science & Manufacturing', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'mech_002', xpReward: 125 },
        ]
      },

      // 7. Business & Management
      {
        id: 7,
        title: 'Business Administration & Management',
        description: 'MBA preparation and business management fundamentals',
        tags: ['MBA', 'Management', 'Business Strategy', 'Leadership'],
        difficulty: 'Intermediate',
        estimatedWeeks: 16,
        totalSteps: 20,
        isPremium: false,
        category: 'business',
        steps: [
          { id: 1, title: 'Business Fundamentals & Strategy', status: 'completed', hasCheckpointTest: true, checkpointTestId: 'soft_001', xpReward: 150 },
          { id: 2, title: 'Marketing & Consumer Behavior', status: 'available', hasCheckpointTest: true, checkpointTestId: 'soft_002', xpReward: 125 },
          { id: 3, title: 'Operations Management & Supply Chain', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_003', xpReward: 150 },
          { id: 4, title: 'Human Resource Management', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_004', xpReward: 125 },
          { id: 5, title: 'Financial Management & Analysis', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_005', xpReward: 175 },
        ]
      }
    ],
    premium: [
      // 8. Data Science & Analytics
      {
        id: 8,
        title: 'Data Science & Analytics Mastery',
        description: 'Complete data science pipeline from statistics to machine learning deployment',
        tags: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
        difficulty: 'Advanced',
        estimatedWeeks: 20,
        totalSteps: 25,
        isPremium: true,
        category: 'data',
        affiliateInfo: { partner: 'Coursera', discount: '25% off' },
        steps: [
          { id: 1, title: 'Statistics & Probability for Data Science', status: 'available', hasCheckpointTest: true, checkpointTestId: 'cse_006', xpReward: 200 },
          { id: 2, title: 'Python for Data Analysis', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_007', xpReward: 175 },
          { id: 3, title: 'Machine Learning Algorithms', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_008', xpReward: 250 },
          { id: 4, title: 'Deep Learning & Neural Networks', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_009', xpReward: 300 },
          { id: 5, title: 'MLOps & Model Deployment', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_010', xpReward: 275 },
        ]
      },

      // 9. Digital Marketing & E-commerce
      {
        id: 9,
        title: 'Digital Marketing & E-commerce Expert',
        description: 'Master digital marketing, SEO, social media, and e-commerce strategies',
        tags: ['Digital Marketing', 'SEO', 'Social Media', 'E-commerce'],
        difficulty: 'Intermediate',
        estimatedWeeks: 14,
        totalSteps: 18,
        isPremium: true,
        category: 'marketing',
        affiliateInfo: { partner: 'Google Digital Garage', discount: '20% off' },
        steps: [
          { id: 1, title: 'Digital Marketing Fundamentals', status: 'available', hasCheckpointTest: true, checkpointTestId: 'msj_001', xpReward: 150 },
          { id: 2, title: 'Search Engine Optimization (SEO)', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'msj_002', xpReward: 175 },
          { id: 3, title: 'Social Media Marketing Strategy', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'msj_003', xpReward: 150 },
          { id: 4, title: 'E-commerce Platform Management', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'msj_004', xpReward: 200 },
          { id: 5, title: 'Analytics & Performance Tracking', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'msj_005', xpReward: 175 },
        ]
      },

      // 10. Cybersecurity & Information Security
      {
        id: 10,
        title: 'Cybersecurity Professional',
        description: 'Comprehensive cybersecurity training for security analyst and CISSP preparation',
        tags: ['Cybersecurity', 'Network Security', 'Ethical Hacking', 'CISSP'],
        difficulty: 'Advanced',
        estimatedWeeks: 22,
        totalSteps: 28,
        isPremium: true,
        category: 'security',
        affiliateInfo: { partner: 'ISC2', discount: '30% off' },
        steps: [
          { id: 1, title: 'Cybersecurity Fundamentals', status: 'available', hasCheckpointTest: true, checkpointTestId: 'tech_001', xpReward: 175 },
          { id: 2, title: 'Network Security & Protocols', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'tech_002', xpReward: 200 },
          { id: 3, title: 'Ethical Hacking & Penetration Testing', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'tech_003', xpReward: 250 },
          { id: 4, title: 'Incident Response & Forensics', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'tech_004', xpReward: 225 },
          { id: 5, title: 'Security Governance & Compliance', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'tech_005', xpReward: 200 },
        ]
      },

      // 11. Legal & Law
      {
        id: 11,
        title: 'Legal Studies & Law Careers',
        description: 'Preparation for law entrance exams and legal profession fundamentals',
        tags: ['Law', 'Legal Studies', 'CLAT', 'Constitutional Law'],
        difficulty: 'Advanced',
        estimatedWeeks: 18,
        totalSteps: 22,
        isPremium: true,
        category: 'legal',
        affiliateInfo: { partner: 'Law Academy', discount: '25% off' },
        steps: [
          { id: 1, title: 'Constitutional Law & Fundamental Rights', status: 'available', hasCheckpointTest: true, checkpointTestId: 'civil_006', xpReward: 200 },
          { id: 2, title: 'Criminal Law & Procedure', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_007', xpReward: 175 },
          { id: 3, title: 'Civil Law & Contract Law', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_008', xpReward: 175 },
          { id: 4, title: 'Corporate Law & Business Regulation', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_009', xpReward: 200 },
          { id: 5, title: 'Legal Research & Writing', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'civil_010', xpReward: 150 },
        ]
      },

      // 12. Sales & Customer Relations
      {
        id: 12,
        title: 'Sales Excellence & Customer Success',
        description: 'Master sales techniques, CRM, and customer relationship management',
        tags: ['Sales', 'CRM', 'Customer Success', 'Negotiation'],
        difficulty: 'Intermediate',
        estimatedWeeks: 12,
        totalSteps: 15,
        isPremium: true,
        category: 'sales',
        affiliateInfo: { partner: 'Salesforce Trailhead', discount: '20% off' },
        steps: [
          { id: 1, title: 'Sales Fundamentals & Psychology', status: 'available', hasCheckpointTest: true, checkpointTestId: 'soft_006', xpReward: 150 },
          { id: 2, title: 'Customer Relationship Management', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_007', xpReward: 175 },
          { id: 3, title: 'Negotiation & Closing Techniques', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_008', xpReward: 200 },
          { id: 4, title: 'Digital Sales & E-commerce', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_009', xpReward: 175 },
          { id: 5, title: 'Customer Success & Retention', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'soft_010', xpReward: 150 },
        ]
      },

      // 13. Creative Arts & Design
      {
        id: 13,
        title: 'Creative Arts & Digital Design',
        description: 'Master graphic design, UI/UX, and creative digital arts',
        tags: ['Graphic Design', 'UI/UX', 'Adobe Creative Suite', 'Digital Art'],
        difficulty: 'Beginner',
        estimatedWeeks: 16,
        totalSteps: 20,
        isPremium: true,
        category: 'design',
        affiliateInfo: { partner: 'Adobe', discount: '30% off Creative Cloud' },
        steps: [
          { id: 1, title: 'Design Principles & Color Theory', status: 'available', hasCheckpointTest: true, checkpointTestId: 'cse_011', xpReward: 125 },
          { id: 2, title: 'Adobe Photoshop & Illustrator', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_012', xpReward: 150 },
          { id: 3, title: 'UI/UX Design & User Research', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_013', xpReward: 200 },
          { id: 4, title: 'Web Design & Responsive Layouts', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_014', xpReward: 175 },
          { id: 5, title: 'Portfolio Development & Client Work', status: 'locked', hasCheckpointTest: true, checkpointTestId: 'cse_015', xpReward: 150 },
        ]
      }
    ]
  });

  // Helper function to generate mock heatmap data
  function generateMockHeatmapData(activityLevel = 0.6) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 84; i++) { // 12 weeks
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      if (Math.random() < activityLevel) {
        data.push({
          date: date.toISOString().split('T')[0],
          activity: Math.floor(Math.random() * 4) + 1, // 1-4 intensity
          tooltip: `Studied for ${Math.floor(Math.random() * 3) + 1} hours`
        });
      }
    }
    
    return data;
  }

  // Get current roadmaps based on selected type
  const getCurrentRoadmaps = () => {
    let baseRoadmaps = roadmaps[selectedType] || [];
    
    // If we have personalized roadmaps and user is on free tab, merge them
    if (hasPreTestTaken && selectedType === 'free' && personalizedRoadmaps.length > 0) {
      return [...personalizedRoadmaps, ...baseRoadmaps];
    }
    
    return baseRoadmaps;
  };
  
  const currentRoadmaps = getCurrentRoadmaps();
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API calls for fresh data
      await Promise.all([
        // Refresh roadmap data
        new Promise(resolve => setTimeout(resolve, 500)),
        // Refresh user progress
        new Promise(resolve => setTimeout(resolve, 300)),
        // Refresh personalized recommendations
        new Promise(resolve => setTimeout(resolve, 400))
      ]);
      
      // Update insights and milestones after refresh
      if (selectedRoadmap && userProgress[selectedRoadmap.id]) {
        const currentProgress = {
          totalXP: Object.values(userProgress).reduce((sum, p) => sum + p.totalXP, 0),
          currentStreak: Math.max(...Object.values(userProgress).map(p => p.currentStreak || 0)),
          totalBadges: Object.values(userProgress).reduce((sum, p) => sum + p.badges.length, 0),
          completedRoadmaps: Object.values(userProgress).filter(p => p.completedSteps.length >= 10).length,
          testScores: Object.values(userProgress).map(p => p.avgTestScore).filter(Boolean),
          heatmapData: userProgress[selectedRoadmap.id].heatmapData
        };
        
        const insights = progressTrackingService.generateProgressInsights(currentProgress);
        setProgressInsights(insights);
        
        const milestones = progressTrackingService.getNextMilestoneProgress(currentProgress);
        setNextMilestones(milestones);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle pre-test navigation
  const handlePreTest = () => {
    navigation.navigate('PreTest', {
      onComplete: handlePreTestComplete,
      returnTo: 'Learn',
      context: {
        availableRoadmaps: [...roadmaps.free, ...roadmaps.premium],
        currentProgress: userProgress
      }
    });
  };

  // Handle pre-test completion
  const handlePreTestComplete = (results) => {
    const { skillAnalysis, personalization } = results;
    
    // Update state with personalized roadmaps
    setPersonalizedRoadmaps(personalization.personalizedRoadmaps);
    setHasPreTestTaken(true);
    
    // Show success message
    Alert.alert(
      '🎉 Assessment Complete!',
      `We've generated ${personalization.personalizedRoadmaps.length} personalized roadmaps based on your skills!`,
      [{ text: 'View Roadmaps', onPress: () => setSelectedType('free') }]
    );
  };

  // Generate personalized roadmaps based on test results
  const generatePersonalizedRoadmaps = (testResults) => {
    // Enhanced personalization based on SkillNet vision
    const personalizedRoadmaps = preTestService.generatePersonalizedPaths(testResults);
    setPersonalizedRoadmaps(personalizedRoadmaps);
    
    // Track personalization event for analytics
    console.log('Generated personalized roadmaps:', personalizedRoadmaps.length, 'paths');
    return personalizedRoadmaps;
  };

  // Handle roadmap selection
  const handleRoadmapPress = (roadmap) => {
    // All roadmaps are accessible in our free app
    // Premium roadmaps just contain links to paid external courses
    setSelectedRoadmap(roadmap);
    setShowSteps(true);
    
    // Show info for premium roadmaps that contain external course links
    if (roadmap.isPremium && roadmap.affiliateInfo) {
      setTimeout(() => {
        Alert.alert(
          '💎 Enhanced Learning Path',
          `This roadmap includes curated links to premium courses from ${roadmap.affiliateInfo.partner}. You'll get access to high-quality external resources!`,
          [
            { text: 'Got it!', style: 'default' }
          ]
        );
      }, 500);
    }
  };

  // Handle step press
  const handleStepPress = (step) => {
    // Navigate to step learning resources and materials
    if (step.status === 'available' || step.status === 'completed') {
      navigation.navigate('StepDetail', {
        step,
        roadmap: selectedRoadmap,
        onResourceAccess: (resourceType) => {
          // Track resource engagement for better personalization
          console.log(`Accessed ${resourceType} for step: ${step.title}`);
        }
      });
    } else {
      Alert.alert(
        '🔒 Step Locked',
        `Complete the previous steps to unlock "${step.title}".`,
        [{ text: 'Got it!' }]
      );
    }
  };

  // Handle checkpoint test
  const handleCheckpointTest = (testId, step) => {
    // Show test options alert for different test types
    Alert.alert(
      'Checkpoint Test',
      `Ready to take the checkpoint test for "${step.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Test Details', 
          onPress: () => navigateToTestDetail(testId, step)
        },
        { 
          text: 'Start Test Now', 
          onPress: () => startTestDirectly(testId, step),
          style: 'default'
        },
      ]
    );
  };

  // Navigate to test detail screen
  const navigateToTestDetail = (testId, step) => {
    // Get test data for preview
    const testData = checkpointTestService.getTestById(testId);
    if (testData) {
      setPreviewTestData(testData);
      setPreviewStepContext(step);
      setShowTestPreview(true);
    } else {
      // Fallback to direct navigation if test not found
      navigation.navigate('TestDetail', {
        testId: testId,
        stepContext: step,
        isCheckpointTest: true,
        onComplete: (results) => {
          handleTestCompletion(testId, step, results);
        }
      });
    }
  };

  // Start test directly based on test type
  const startTestDirectly = (testId, step) => {
    // Determine test type from testId or step configuration
    const testType = determineTestType(testId, step);
    
    const baseParams = {
      testId: testId,
      stepContext: step,
      isCheckpointTest: true,
      // Remove function from navigation params to fix serialization warning
      // Completion will be handled via navigation listeners or route params
    };

    switch (testType) {
      case 'mcq':
        navigation.navigate('MCQTest', {
          ...baseParams,
          testTitle: `${step.title} - Checkpoint Test`,
          testDescription: `Test your knowledge of ${step.title}`,
        });
        break;
      case 'coding':
        navigation.navigate('CodingTest', {
          ...baseParams,
          testTitle: `${step.title} - Coding Challenge`,
          testDescription: `Apply your coding skills for ${step.title}`,
        });
        break;
      case 'project':
        navigation.navigate('ProjectUpload', {
          ...baseParams,
          testTitle: `${step.title} - Project Submission`,
          testDescription: `Submit your project for ${step.title}`,
        });
        break;
      default:
        // Fallback to TestDetail
        navigateToTestDetail(testId, step);
        break;
    }
  };

  // Determine test type from testId or step configuration
  const determineTestType = (testId, step) => {
    // Extract test type from testId pattern
    if (testId.includes('mcq') || testId.includes('quiz')) return 'mcq';
    if (testId.includes('coding') || testId.includes('algorithm')) return 'coding';
    if (testId.includes('project') || testId.includes('upload')) return 'project';
    
    // Check step category for hints
    if (step.category === 'programming' || step.category === 'development') return 'coding';
    if (step.category === 'design' || step.category === 'portfolio') return 'project';
    
    // Default to MCQ for theory-based steps
    return 'mcq';
  };

  // Handle test completion and check for milestones
  const handleTestCompletion = (testId, step, results) => {
    try {
      // Use CheckpointTestService to evaluate results
      const evaluation = checkpointTestService.evaluateTestResults(
        testId, 
        results.answers, 
        results.timeSpent
      );

      const { passed, percentage, feedback } = evaluation;
      
      if (passed) {
        // Update step status
        updateStepStatus(step.id, 'completed');
        
        // Update user progress
        updateUserProgress(step, evaluation);
        
        // Check for milestone completion
        const milestone = checkForMilestone(step, evaluation);
        if (milestone) {
          setMilestoneData(milestone);
          setShowMilestoneModal(true);
        } else {
          // Show success message with personalized feedback
          Alert.alert(
            '🎉 Test Completed!',
            `${feedback.overall}\n\nScore: ${Math.round(percentage)}%\nXP Earned: ${step.xpReward}`,
            [
              { text: 'View Details', onPress: () => showTestResults(testId, step, evaluation) },
              { text: 'Continue Learning', onPress: () => unlockNextStep(step) }
            ]
          );
        }
        
      } else {
        // Handle test failure with detailed feedback
        Alert.alert(
          'Keep Learning! 📚',
          `Score: ${Math.round(percentage)}%\n\n${feedback.overall}`,
          [
            { text: 'Review Materials', onPress: () => showStepResources(step) },
            { text: 'View Feedback', onPress: () => showDetailedFeedback(evaluation) },
            { text: 'Retake Test', onPress: () => handleCheckpointTest(testId, step) },
            { text: 'Continue', style: 'cancel' }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error evaluating test results:', error);
      Alert.alert(
        'Error',
        'There was an issue processing your test results. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show detailed test results
  const showTestResults = (testId, step, evaluation) => {
    navigation.navigate('TestResults', {
      testId,
      stepContext: step,
      evaluation,
      isCheckpointTest: true,
      nextSteps: checkpointTestService.getNextSteps(evaluation, step)
    });
  };

  // Show detailed feedback
  const showDetailedFeedback = (evaluation) => {
    const { feedback } = evaluation;
    const feedbackText = [
      feedback.overall,
      feedback.improvements.length > 0 ? `\nAreas to improve:\n• ${feedback.improvements.join('\n• ')}` : '',
      feedback.recommendations.length > 0 ? `\nRecommendations:\n• ${feedback.recommendations.join('\n• ')}` : ''
    ].filter(Boolean).join('\n');

    Alert.alert('Detailed Feedback', feedbackText, [{ text: 'Got it' }]);
  };

  // Handle test start from preview modal
  const handleStartTestFromPreview = () => {
    setShowTestPreview(false);
    if (previewTestData && previewStepContext) {
      startTestDirectly(previewTestData.id, previewStepContext);
    }
  };

  // Update user progress after successful test completion
  const updateUserProgress = (step, testResults) => {
    const roadmapId = selectedRoadmap?.id;
    if (!roadmapId) return;

    setUserProgress(prev => {
      const currentProgress = prev[roadmapId] || {
        completedSteps: [],
        heatmapData: generateMockHeatmapData(),
        badges: [],
        totalXP: 0,
        currentStreak: 0,
        weeklyActiveDays: 0,
        avgTestScore: 0,
        weeklyStudyTime: 0,
        completionRate: 0,
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
      };

      // Create activity data for progress tracking
      const activityData = {
        type: 'TEST_PASSED',
        stepId: step.id,
        roadmapId,
        xpEarned: step.xpReward || 0,
        testScore: testResults.percentage,
        badgeEarned: step.badgeReward,
        timeSpent: testResults.timeSpent || 0,
        metadata: {
          stepTitle: step.title,
          difficulty: step.difficulty
        }
      };

      // Update progress using tracking service
      const progressUpdate = progressTrackingService.updateProgress(roadmapId, activityData);
      
      // Add completed step if not already added
      const completedSteps = currentProgress.completedSteps.includes(step.id) 
        ? currentProgress.completedSteps 
        : [...currentProgress.completedSteps, step.id];
      
      // Add XP reward
      const totalXP = currentProgress.totalXP + (step.xpReward || 0);
      
      // Update heatmap with new activity
      const updatedHeatmapData = progressTrackingService.updateHeatmapData(
        currentProgress.heatmapData, 
        progressUpdate
      );

      // Calculate new streak
      const newStreak = progressTrackingService.calculateStreak(updatedHeatmapData);

      // Update test score average
      const currentTestScores = currentProgress.testScores || [];
      const newTestScores = [...currentTestScores, testResults.percentage];
      const avgTestScore = newTestScores.reduce((sum, score) => sum + score, 0) / newTestScores.length;

      // Check for new milestones
      const enhancedProgress = {
        ...currentProgress,
        totalXP,
        currentStreak: newStreak,
        testScores: newTestScores,
        completedSteps
      };

      const detectedMilestones = progressTrackingService.detectMilestones(
        enhancedProgress, 
        activityData
      );

      // Trigger milestone celebrations
      if (detectedMilestones.length > 0) {
        setTimeout(() => {
          detectedMilestones.forEach(milestone => {
            triggerMilestoneAnimation(milestone, enhancedProgress);
          });
        }, 1000);
      }

      return {
        ...prev,
        [roadmapId]: {
          ...currentProgress,
          completedSteps,
          totalXP,
          currentStreak: newStreak,
          heatmapData: updatedHeatmapData,
          avgTestScore: Math.round(avgTestScore),
          testScores: newTestScores,
          weeklyActiveDays: Math.min(7, currentProgress.weeklyActiveDays + 1)
        }
      };
    });
  };

  // Trigger milestone animation and sharing
  const triggerMilestoneAnimation = (milestone, userProgress) => {
    const formattedMilestone = progressTrackingService.formatMilestoneForSharing(
      milestone, 
      userProgress
    );

    // Set milestone data for modal
    setMilestoneData({
      type: milestone.type,
      title: milestone.title,
      emoji: milestone.emoji,
      description: milestone.description,
      value: milestone.value,
      xpEarned: 0, // Milestones don't give XP directly
      totalXP: userProgress.totalXP,
      newLevel: Math.floor(userProgress.totalXP / 500) + 1,
      nextLevelProgress: (userProgress.totalXP % 500) / 500 * 100,
      funMessage: getMilestoneFunMessage(milestone),
      shareData: formattedMilestone
    });

    setShowMilestoneModal(true);
  };

  // Get fun message for milestone
  const getMilestoneFunMessage = (milestone) => {
    const messages = {
      xp: [
        "You're on fire! 🔥",
        "Learning machine activated! 🤖",
        "XP collector extraordinaire! ⚡",
        "Knowledge level: BEAST MODE! 💪"
      ],
      streak: [
        "Consistency is your superpower! 🦸‍♂️",
        "Streak master in the house! 🏠",
        "You're unstoppable! 🚀",
        "Daily grind paying off! 💪"
      ],
      badge: [
        "Badge collector supreme! 🏆",
        "Skill accumulator activated! 🎯",
        "You're becoming a legend! 👑",
        "Expertise level: MAXIMUM! ⚡"
      ],
      roadmap: [
        "Journey master! 🗺️",
        "Path completed like a boss! 😎",
        "Learning adventure conquered! 🏔️",
        "Road to success = TRAVELED! 🛣️"
      ],
      test: [
        "Perfect performance! 🎯",
        "Test domination achieved! 👑",
        "Accuracy level: LEGENDARY! ⭐",
        "You aced it! 🔥"
      ]
    };

    const typeMessages = messages[milestone.type] || messages.xp;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  // Unlock next step in the roadmap
  const unlockNextStep = (currentStep) => {
    if (!selectedRoadmap) return;
    
    const currentStepIndex = selectedRoadmap.steps.findIndex(step => step.id === currentStep.id);
    const nextStep = selectedRoadmap.steps[currentStepIndex + 1];
    
    if (nextStep) {
      // Update the next step status to 'available'
      setRoadmaps(prevRoadmaps => {
        const updatedRoadmaps = { ...prevRoadmaps };
        const roadmapType = selectedRoadmap.isPremium ? 'premium' : 'free';
        const roadmapIndex = updatedRoadmaps[roadmapType].findIndex(r => r.id === selectedRoadmap.id);
        
        if (roadmapIndex !== -1) {
          const updatedSteps = [...updatedRoadmaps[roadmapType][roadmapIndex].steps];
          const nextStepIndex = updatedSteps.findIndex(step => step.id === nextStep.id);
          
          if (nextStepIndex !== -1 && updatedSteps[nextStepIndex].status === 'locked') {
            updatedSteps[nextStepIndex] = { ...updatedSteps[nextStepIndex], status: 'available' };
            
            updatedRoadmaps[roadmapType][roadmapIndex] = {
              ...updatedRoadmaps[roadmapType][roadmapIndex],
              steps: updatedSteps
            };
            
            // Update selected roadmap to reflect changes
            setSelectedRoadmap({
              ...selectedRoadmap,
              steps: updatedSteps
            });
            
            // Show success message
            Alert.alert(
              '🎉 Step Unlocked!',
              `"${nextStep.title}" is now available for you to start!`,
              [
                { text: 'Start Next Step', onPress: () => {
                  // Navigate directly to the next step for immediate engagement
                  handleStepPress(nextStep);
                }},
                { text: 'Continue Later', style: 'cancel' }
              ]
            );
          }
        }
        
        return updatedRoadmaps;
      });
    } else {
      // No more steps - roadmap completed!
      Alert.alert(
        '🏆 Roadmap Completed!',
        `Congratulations! You've completed the "${selectedRoadmap.title}" roadmap. Ready to start a new learning journey?`,
        [
          { text: 'View Certificate', onPress: () => {
            // Navigate to certificate generator/viewer
            navigation.navigate('Certificate', {
              roadmap: selectedRoadmap,
              completionDate: new Date().toISOString(),
              userStats: userProgress[selectedRoadmap.id]
            });
          }},
          { text: 'Explore More Roadmaps', onPress: () => handleBackFromSteps() },
          { text: 'Share Achievement', onPress: () => {
            // Create completion milestone
            const completionMilestone = {
              type: 'roadmap',
              title: 'Roadmap Completed!',
              emoji: '🏆',
              description: `Successfully completed "${selectedRoadmap.title}" roadmap`,
              value: selectedRoadmap.id,
              totalXP: (userProgress[selectedRoadmap.id]?.totalXP || 0) + 500, // Bonus XP
              newLevel: Math.floor(((userProgress[selectedRoadmap.id]?.totalXP || 0) + 500) / 500) + 1,
              nextLevelProgress: 100,
              badgeEarned: true,
              funMessage: "Journey master! You've conquered this learning path! 🗺️",
              shareData: {
                shareText: `Just completed the "${selectedRoadmap.title}" roadmap on SkillNet! 🏆 Ready to level up my career! #SkillNet #Learning #Achievement`,
                hashtags: "#SkillNet #Learning #Achievement #RoadmapComplete"
              }
            };
            setMilestoneData(completionMilestone);
            setShowMilestoneModal(true);
          }}
        ]
      );
    }
  };

  // Show step resources for review
  const showStepResources = (step) => {
    Alert.alert(
      '📚 Study Resources',
      'Review these resources before retaking the test:',
      [
        { text: 'View Documentation', onPress: () => {
          navigation.navigate('StepResources', {
            step,
            resourceType: 'documentation',
            roadmap: selectedRoadmap
          });
        }},
        { text: 'Watch Videos', onPress: () => {
          navigation.navigate('StepResources', {
            step,
            resourceType: 'videos',
            roadmap: selectedRoadmap
          });
        }},
        { text: 'Practice Exercises', onPress: () => {
          navigation.navigate('StepResources', {
            step,
            resourceType: 'exercises',
            roadmap: selectedRoadmap
          });
        }},
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  // Update step status
  const updateStepStatus = (stepId, status) => {
    // Update the step status in the roadmap and persist to storage
    const roadmapId = selectedRoadmap?.id;
    if (!roadmapId) return;

    setRoadmaps(prevRoadmaps => {
      const updatedRoadmaps = { ...prevRoadmaps };
      const roadmapType = selectedRoadmap.isPremium ? 'premium' : 'free';
      const roadmapIndex = updatedRoadmaps[roadmapType].findIndex(r => r.id === roadmapId);
      
      if (roadmapIndex !== -1) {
        const updatedSteps = [...updatedRoadmaps[roadmapType][roadmapIndex].steps];
        const stepIndex = updatedSteps.findIndex(step => step.id === stepId);
        
        if (stepIndex !== -1) {
          updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status };
          updatedRoadmaps[roadmapType][roadmapIndex] = {
            ...updatedRoadmaps[roadmapType][roadmapIndex],
            steps: updatedSteps
          };
          
          // Update selected roadmap if it's the current one
          if (selectedRoadmap.id === roadmapId) {
            setSelectedRoadmap({
              ...selectedRoadmap,
              steps: updatedSteps
            });
          }
        }
      }
      
      return updatedRoadmaps;
    });
    
    // Persist to local storage for offline support
    console.log(`Step ${stepId} status updated to ${status}`);
  };

  // Check for milestone completion
  const checkForMilestone = (step, results) => {
    // Mock milestone detection
    if (step.xpReward >= 150) {
      return {
        title: 'Milestone Achieved!',
        description: `You've completed ${step.title}`,
        badge: {
          name: 'Learning Champion',
          emoji: '🏆',
          description: 'Completed a challenging checkpoint'
        },
        xpEarned: step.xpReward,
        totalXP: 2450,
        newLevel: 5,
        nextLevelProgress: 75,
        funMessage: "You're absolutely crushing it! 🔥"
      };
    }
    return null;
  };

  // Handle milestone sharing to feed
  const handleShareMilestone = (milestone) => {
    if (milestone.shareData) {
      // Use the social service to post to feed
      const feedPost = {
        ...milestone.shareData,
        userId: 'current_user_id', // Would come from auth context
        timestamp: new Date().toISOString(),
        reactions: [],
        comments: [],
        type: 'milestone',
        metadata: {
          roadmapId: selectedRoadmap?.id,
          milestoneType: milestone.type,
          xpEarned: milestone.xpEarned || 0
        }
      };
      
      // Post to social feed (this would call socialService.createPost)
      console.log('Sharing milestone to feed:', milestone.shareData);
      
      // Show success feedback with enhanced engagement
      Alert.alert(
        '🎉 Achievement Shared!', 
        `Your ${milestone.title} has been shared to your feed! Other learners will be inspired by your progress. Keep up the amazing work! 🚀`,
        [
          { text: 'View Feed', onPress: () => navigation.navigate('SocialHub') },
          { text: 'Continue Learning', style: 'default' }
        ]
      );
    } else {
      // Fallback for legacy milestones
      console.log('Sharing milestone to feed:', milestone);
      Alert.alert(
        '🎉 Achievement Shared!', 
        'Your achievement has been shared to your feed and will inspire other learners! �',
        [{ text: 'Awesome!' }]
      );
    }
  };

  // Handle back navigation from steps
  const handleBackFromSteps = () => {
    setShowSteps(false);
    setSelectedRoadmap(null);
  };

  // Render roadmap list view
  const renderRoadmapList = () => (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Learning Roadmaps</Text>
            {isOffline && (
              <View style={styles.offlineIndicator}>
                <Ionicons name="cloud-offline" size={16} color="#FF9500" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          
          {lastSyncTime && (
            <Text style={styles.syncTime}>
              Last updated: {new Date(lastSyncTime).toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        <Text style={styles.subtitle}>Build verified skills step by step - 100% FREE</Text>
        <Text style={styles.premiumNote}>💎 Enhanced paths include curated links to premium external courses</Text>
        
        {/* Demo Milestone Button - Enhanced for engagement */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => {
            // Cycle through different milestone types for demonstration
            const demoMilestones = [
              {
                type: 'streak',
                title: '7-Day Learning Streak!',
                emoji: '🔥',
                description: 'You\'ve maintained a perfect learning streak for 7 consecutive days!',
                value: 7,
                totalXP: userProgress[1]?.totalXP || 450,
                newLevel: 2,
                nextLevelProgress: 75,
                badgeEarned: true,
                funMessage: "You're on fire! Consistency is your superpower! 🦸‍♂️",
                shareData: {
                  shareText: "Just achieved a 7-day learning streak! 🔥 Consistency is key! #SkillNet #Learning #Streak",
                  hashtags: "#SkillNet #Learning #Streak #Consistency"
                }
              },
              {
                type: 'xp',
                title: '1000 XP Milestone!',
                emoji: '⚡',
                description: 'You\'ve reached the 1K XP milestone! Knowledge level is rising!',
                value: 1000,
                totalXP: 1000,
                newLevel: 3,
                nextLevelProgress: 40,
                badgeEarned: false,
                funMessage: "Learning machine activated! You're unstoppable! 🤖",
                shareData: {
                  shareText: "Just hit 1000 XP on SkillNet! 🚀 Learning never stops! #SkillNet #XP #Milestone",
                  hashtags: "#SkillNet #XP #Milestone #Learning"
                }
              },
              {
                type: 'badge',
                title: '5 Skills Mastered!',
                emoji: '🏆',
                description: 'You\'ve earned 5 verified skill badges! Expertise is building!',
                value: 5,
                totalXP: userProgress[1]?.totalXP || 450,
                newLevel: 2,
                nextLevelProgress: 85,
                badgeEarned: true,
                funMessage: "Badge collector supreme! You're becoming a legend! 👑",
                shareData: {
                  shareText: "Just earned my 5th verified skill badge! 🏆 Building expertise one skill at a time! #SkillNet #Badges #Skills",
                  hashtags: "#SkillNet #Badges #Skills #Verified"
                }
              }
            ];
            
            const randomMilestone = demoMilestones[Math.floor(Math.random() * demoMilestones.length)];
            setMilestoneData(randomMilestone);
            setShowMilestoneModal(true);
          }}
        >
          <Text style={styles.demoButtonText}>🎉 Demo Milestone</Text>
        </TouchableOpacity>
        
        {/* Overall Progress Stats */}
        <View style={styles.overallProgressContainer}>
          <Text style={styles.overallProgressTitle}>Your Progress</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Object.values(userProgress).reduce((sum, p) => sum + p.totalXP, 0)}
              </Text>
              <Text style={styles.progressStatLabel}>Total XP</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Object.values(userProgress).reduce((sum, p) => sum + p.badges.length, 0)}
              </Text>
              <Text style={styles.progressStatLabel}>Badges</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Object.keys(userProgress).length}
              </Text>
              <Text style={styles.progressStatLabel}>Active Roadmaps</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pre-test check */}
      {!hasPreTestTaken && (
        <Card style={styles.preTestCard}>
          <View style={styles.preTestContent}>
            <Text style={styles.preTestTitle}>🎯 Get Personalized Roadmaps</Text>
            <Text style={styles.preTestDescription}>
              Take a quick pre-assessment to get roadmaps tailored to your current skill level.
            </Text>
            <Button
              title="Take Pre-Assessment"
              onPress={handlePreTest}
              variant="primary"
              style={styles.preTestButton}
            />
          </View>
        </Card>
      )}

      {/* Enhanced Progress Stats Panel */}
      <ProgressStatsPanel
        userProgress={{
          ...userProgress[selectedRoadmap?.id] || {},
          totalXP: Object.values(userProgress).reduce((sum, p) => sum + p.totalXP, 0),
          totalBadges: Object.values(userProgress).reduce((sum, p) => sum + p.badges.length, 0),
          currentStreak: Math.max(...Object.values(userProgress).map(p => p.currentStreak || 0))
        }}
        insights={progressInsights}
        nextMilestones={nextMilestones}
        onMilestonePress={(milestone) => {
          Alert.alert(
            `${milestone.emoji} ${milestone.title}`,
            `${milestone.description}\n\nProgress: ${milestone.current}/${milestone.threshold}`,
            [{ text: 'Keep Going!' }]
          );
        }}
      />

      {/* Roadmap Type Tabs */}
      <RoadmapTypeTabs
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        freeCount={roadmaps.free?.length || 0}
        premiumCount={roadmaps.premium?.length || 0}
      />

      {/* Roadmaps List */}
      <View style={styles.roadmapsList}>
        {currentRoadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            userProgress={userProgress[roadmap.id]}
            onPress={handleRoadmapPress}
          />
        ))}
      </View>
    </ScrollView>
  );

  // Render roadmap steps view
  const renderRoadmapSteps = () => (
    <View style={styles.container}>
      {/* Steps Header */}
      <View style={styles.stepsHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackFromSteps}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.stepsHeaderContent}>
          <Text style={styles.stepsTitle} numberOfLines={1}>
            {selectedRoadmap?.title}
          </Text>
          <View style={styles.stepsProgress}>
            <Text style={styles.stepsProgressText}>
              {userProgress[selectedRoadmap?.id]?.completedSteps?.length || 0} / {selectedRoadmap?.totalSteps} completed
            </Text>
            <Text style={styles.stepsProgressPercentage}>
              {Math.round(((userProgress[selectedRoadmap?.id]?.completedSteps?.length || 0) / selectedRoadmap?.totalSteps) * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Heatmap Progress */}
      {userProgress[selectedRoadmap?.id]?.heatmapData && (
        <HeatmapProgress
          data={userProgress[selectedRoadmap?.id].heatmapData}
          size="medium"
          style={styles.heatmapContainer}
          showLabels={true}
        />
      )}

      {/* Steps List */}
      <ScrollView style={styles.stepsContainer}>
        {selectedRoadmap?.steps?.map((step, index) => (
          <RoadmapStepCard
            key={step.id}
            step={step}
            stepIndex={index}
            totalSteps={selectedRoadmap.steps.length}
            onStepPress={handleStepPress}
            onCheckpointPress={handleCheckpointTest}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main Content */}
      {showSteps ? renderRoadmapSteps() : renderRoadmapList()}

      {/* Milestone Modal */}
      <MilestoneModal
        visible={showMilestoneModal}
        milestone={milestoneData}
        onClose={() => setShowMilestoneModal(false)}
        onShareToFeed={handleShareMilestone}
        onViewBadge={(badge) => {
          // Navigate to badge detail screen
          navigation.navigate('BadgeDetail', {
            badge,
            earnedDate: milestoneData?.earnedDate,
            roadmapContext: selectedRoadmap
          });
        }}
      />

      {/* Test Preview Modal */}
      <TestPreviewModal
        visible={showTestPreview}
        onClose={() => setShowTestPreview(false)}
        testData={previewTestData}
        stepContext={previewStepContext}
        onStartTest={handleStartTestFromPreview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1D29',
    marginRight: 12,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  syncTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  premiumNote: {
    fontSize: 13,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Overall progress styles
  overallProgressContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
  },
  overallProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D29',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // Pre-test styles
  preTestCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  preTestContent: {
    alignItems: 'center',
    padding: 8,
  },
  preTestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 8,
    textAlign: 'center',
  },
  preTestDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  preTestButton: {
    paddingHorizontal: 24,
  },
  
  // Roadmaps list styles
  roadmapsList: {
    paddingBottom: 20,
  },
  
  // Steps view styles
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  stepsHeaderContent: {
    flex: 1,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 4,
  },
  stepsProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsProgressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepsProgressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Pre-test styles
  preTestCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  preTestContent: {
    padding: 4,
    alignItems: 'center',
  },
  preTestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  preTestDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  preTestButton: {
    minWidth: 200,
  },
  
  // Demo button styles
  demoButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Heatmap styles
  heatmapContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  
  // Steps container
  stepsContainer: {
    flex: 1,
    paddingTop: 8,
  },
});

export default LearnScreen;
