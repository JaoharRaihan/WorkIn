import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const TestsScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock test data
  const mockTests = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your basic JavaScript knowledge',
      category: 'programming',
      difficulty: 'Beginner',
      duration: '30 min',
      questions: 25,
      badge: 'JavaScript Basic',
      color: '#F7DF1E',
      icon: 'code',
    },
    {
      id: 2,
      title: 'React Development',
      description: 'Advanced React concepts and patterns',
      category: 'programming',
      difficulty: 'Advanced',
      duration: '45 min',
      questions: 30,
      badge: 'React Expert',
      color: '#61DAFB',
      icon: 'layers',
    },
    {
      id: 3,
      title: 'UI/UX Design Principles',
      description: 'Design thinking and user experience',
      category: 'design',
      difficulty: 'Intermediate',
      duration: '40 min',
      questions: 20,
      badge: 'Design Thinker',
      color: '#FF6B6B',
      icon: 'brush',
    },
    {
      id: 4,
      title: 'Data Analysis with Python',
      description: 'Python for data science and analytics',
      category: 'data',
      difficulty: 'Intermediate',
      duration: '60 min',
      questions: 35,
      badge: 'Data Analyst',
      color: '#4ECDC4',
      icon: 'analytics',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tests', icon: 'apps' },
    { id: 'programming', name: 'Programming', icon: 'code' },
    { id: 'design', name: 'Design', icon: 'brush' },
    { id: 'data', name: 'Data Science', icon: 'analytics' },
  ];

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchQuery, selectedCategory]);

  const loadTests = async () => {
    // Simulate API call
    setTests(mockTests);
  };

  const filterTests = () => {
    let filtered = tests;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTests(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#757575';
    }
  };

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedCategory === item.id ? '#007AFF' : '#666'} 
      />
      <Text style={[
        styles.categoryTabText,
        selectedCategory === item.id && styles.categoryTabTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTestCard = ({ item }) => (
    <Card style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={[styles.testIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.testInfo}>
          <Text style={styles.testTitle}>{item.title}</Text>
          <Text style={styles.testDescription}>{item.description}</Text>
        </View>
        <Badge 
          text={item.difficulty}
          color={getDifficultyColor(item.difficulty)}
          size="small"
        />
      </View>
      
      <View style={styles.testStats}>
        <View style={styles.testStat}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.duration}</Text>
        </View>
        <View style={styles.testStat}>
          <Ionicons name="help-circle-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.questions} questions</Text>
        </View>
        <View style={styles.testStat}>
          <Ionicons name="medal-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.badge}</Text>
        </View>
      </View>
      
      <View style={styles.testActions}>
        <Button
          title="Start Test"
          onPress={() => navigation.navigate('PreTest', { testId: item.id })}
          style={styles.startButton}
        />
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => navigation.navigate('TestDetail', { testId: item.id })}
        >
          <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tests</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TestHistory')}
          style={styles.historyButton}
        >
          <Ionicons name="time-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />

      <FlatList
        data={filteredTests}
        renderItem={renderTestCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.testsContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#007AFF',
  },
  testsContainer: {
    padding: 20,
  },
  testCard: {
    marginBottom: 15,
    padding: 20,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  testStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  testActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    marginRight: 10,
  },
  infoButton: {
    padding: 10,
  },
});

export default TestsScreen;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI state
  const [showCategories, setShowCategories] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  // Enhanced user data with persistence
  const [userProgress, setUserProgress] = useState({});
  const [favoriteTests, setFavoriteTests] = useState(new Set());
  const [testScores, setTestScores] = useState({});

  // Search functionality
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Advanced features
  const [bookmarkedTests, setBookmarkedTests] = useState(new Set());
  const [testHistory, setTestHistory] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [completedToday, setCompletedToday] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [nextLevelProgress, setNextLevelProgress] = useState(0);

  // SkillNet specific features
  const [verifiedBadges, setVerifiedBadges] = useState([]);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [corporateEndorsements, setCorporateEndorsements] = useState([]);
  const [skillShowcase, setSkillShowcase] = useState([]);
  const [trustScore, setTrustScore] = useState(85);
  const [hirabilityScore, setHirabilityScore] = useState(78);
  const [mentorReviews, setMentorReviews] = useState([]);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);

  // Enhanced UI state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [animatedValues] = useState({
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(-50),
    scaleAnim: new Animated.Value(0.95)
  });

  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    userInteractions: 0
  });

  // Offline support
  const [isOffline, setIsOffline] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Advanced UI enhancements
  const [showPullToRefreshTip, setShowPullToRefreshTip] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [voiceSearchEnabled, setVoiceSearchEnabled] = useState(false);
  
  // Social and sharing features
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedTestToShare, setSelectedTestToShare] = useState(null);
  const [socialConnections, setSocialConnections] = useState([]);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  
  // Advanced analytics and gamification
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [userEngagementScore, setUserEngagementScore] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [skillProgressTrends, setSkillProgressTrends] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  // Enhanced data persistence
  const saveUserData = useCallback(async (key, data) => {
    try {
      await AsyncStorage.setItem(`skillnet_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save user data:', error);
    }
  }, []);

  const loadUserData = useCallback(async (key, defaultValue = null) => {
    try {
      const data = await AsyncStorage.getItem(`skillnet_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.warn('Failed to load user data:', error);
      return defaultValue;
    }
  }, []);

  // Enhanced haptic feedback system
  const triggerHaptic = useCallback(async (type = 'light') => {
    if (!enableHaptics) return;
    
    try {
      // Fallback to Vibration API if Haptics is not available
      if (Platform.OS === 'ios') {
        Vibration.vibrate(type === 'heavy' ? [0, 100] : type === 'medium' ? [0, 50] : [0, 25]);
      } else {
        Vibration.vibrate(type === 'heavy' ? 100 : type === 'medium' ? 50 : 25);
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }, [enableHaptics]);

  // Enhanced analytics tracking
  const trackAdvancedEvent = useCallback(async (eventName, parameters = {}) => {
    try {
      // Local analytics tracking - can be expanded to use Firebase later
      const analyticsData = {
        ...parameters,
        session_id: sessionStartTime,
        user_level: currentLevel,
        trust_score: trustScore,
        engagement_score: userEngagementScore,
        timestamp: Date.now()
      };

      // Update local metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        userInteractions: prev.userInteractions + 1
      }));

      console.log(`📊 Analytics: ${eventName}`, analyticsData);
      
      // Save analytics to local storage for future sync
      const existingAnalytics = await loadUserData('analytics_events', []);
      const newAnalytics = [...existingAnalytics, { event: eventName, data: analyticsData }].slice(-100); // Keep last 100 events
      await saveUserData('analytics_events', newAnalytics);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, [sessionStartTime, currentLevel, trustScore, userEngagementScore, loadUserData, saveUserData]);

  // XP and leveling system
  const addXP = useCallback(async (amount, reason = 'general') => {
    const newXP = currentXP + amount;
    const oldLevel = Math.floor(currentXP / 1000);
    const newLevel = Math.floor(newXP / 1000);
    
    setCurrentXP(newXP);
    
    // Level up animation and notification
    if (newLevel > oldLevel) {
      setLevelUpAnimation(true);
      await triggerHaptic('success');
      
      Alert.alert(
        '🎉 Level Up!',
        `Congratulations! You've reached Level ${newLevel}!\n\n+${amount} XP for ${reason}`,
        [{ text: 'Awesome!' }]
      );
      
      await trackAdvancedEvent('user_level_up', {
        new_level: newLevel,
        old_level: oldLevel,
        xp_earned: amount,
        reason
      });
      
      setTimeout(() => setLevelUpAnimation(false), 3000);
    }
    
    await saveUserData('current_xp', newXP);
    await trackAdvancedEvent('xp_earned', { amount, reason, total_xp: newXP });
  }, [currentXP, triggerHaptic, trackAdvancedEvent, saveUserData]);

  // Share functionality
  const shareTest = useCallback(async (test) => {
    try {
      const message = `🚀 Check out this skill verification test: ${test.title}\n\nTest your ${test.skills?.join(', ')} skills and earn verified badges!\n\nJoin me on SkillNet - the verified hiring platform where skills matter! 💼✨`;
      
      await Share.share({
        message,
        title: `SkillNet Test: ${test.title}`,
        url: `https://skillnet.app/test/${test.id}` // Deep link
      });
      
      await trackAdvancedEvent('test_shared', {
        test_id: test.id,
        test_title: test.title,
        test_category: test.category
      });
      
      await triggerHaptic('light');
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [trackAdvancedEvent, triggerHaptic]);

  // Network connectivity check
  const checkConnectivity = useCallback(async () => {
    try {
      // Simple network check - in production, use @react-native-netinfo/netinfo
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setIsOffline(false);
      return true;
    } catch (error) {
      setIsOffline(true);
      return false;
    }
  }, []);

  // Enhanced performance monitoring
  const trackPerformance = useCallback((metric, value) => {
    setPerformanceMetrics(prev => ({
      ...prev,
      [metric]: value,
      userInteractions: prev.userInteractions + 1
    }));
  }, []);

  // Initialize app with better error handling and performance tracking
  const initializeApp = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      
      // Check connectivity
      await checkConnectivity();
      
      // Load cached data first for immediate UI response
      const cachedTests = await loadUserData('cached_tests', []);
      const cachedProgress = await loadUserData('user_progress', {});
      
      if (cachedTests.length > 0) {
        setTests(cachedTests);
        setCachedData(cachedTests);
      }
      
      if (Object.keys(cachedProgress).length > 0) {
        setUserProgress(cachedProgress);
      }

      // Load fresh data
      await Promise.all([
        loadTests(true), // force refresh
        loadUserDataFromStorage(),
        loadRecentSearches()
      ]);

      // Track load time
      const loadTime = Date.now() - startTime;
      trackPerformance('loadTime', loadTime);
      
      // Animate UI entrance
      Animated.parallel([
        Animated.timing(animatedValues.fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(animatedValues.slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(animatedValues.scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();

    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Initialization Error', 'Failed to load app data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [checkConnectivity, loadUserData, trackPerformance, animatedValues]);

  // Enhanced categories with comprehensive test service integration
  const categories = useMemo(() => {
    try {
      const categoriesData = testService.getTestCategories();
      if (!categoriesData || typeof categoriesData !== 'object') {
        console.warn('Invalid categories data from testService');
        // Comprehensive fallback matching our enterprise test service
        return {
          'HEALTHCARE': { 
            name: 'Healthcare & Medical', 
            icon: 'medical', 
            color: '#FF6B6B',
            subCategories: ['Medical Terminology', 'Nursing', 'Patient Care', 'Emergency Response', 'Healthcare Ethics'],
            totalTests: 15,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'FINANCE': { 
            name: 'Finance & Banking', 
            icon: 'card', 
            color: '#4ECDC4',
            subCategories: ['Investment Banking', 'Risk Management', 'Financial Analysis', 'Compliance', 'Corporate Finance'],
            totalTests: 18,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'LEGAL': { 
            name: 'Legal & Compliance', 
            icon: 'library', 
            color: '#45B7D1',
            subCategories: ['Corporate Law', 'Contract Law', 'Securities Law', 'Intellectual Property', 'Regulatory Compliance'],
            totalTests: 10,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'MANUFACTURING': {
            name: 'Manufacturing & Operations',
            icon: 'construct',
            color: '#96CEB4',
            subCategories: ['Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Supply Chain', 'Process Optimization'],
            totalTests: 14,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'EDUCATION': {
            name: 'Education & Training',
            icon: 'school',
            color: '#FFEAA7',
            subCategories: ['Pedagogy', 'Curriculum Design', 'Assessment', 'Educational Technology', 'Student Psychology'],
            totalTests: 12,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'RETAIL': {
            name: 'Retail & Customer Service',
            icon: 'storefront',
            color: '#DDA0DD',
            subCategories: ['Customer Relations', 'Sales Techniques', 'Inventory Management', 'Retail Operations', 'E-commerce'],
            totalTests: 8,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'HOSPITALITY': {
            name: 'Hospitality & Tourism',
            icon: 'airplane',
            color: '#74B9FF',
            subCategories: ['Hotel Management', 'Guest Services', 'Event Planning', 'Food Service', 'Tourism Management'],
            totalTests: 6,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'LOGISTICS': {
            name: 'Logistics & Supply Chain',
            icon: 'car',
            color: '#A29BFE',
            subCategories: ['Inventory Management', 'Vendor Relations', 'Transportation', 'Warehouse Operations', 'Distribution'],
            totalTests: 8,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'MEDIA': {
            name: 'Media & Communications',
            icon: 'camera',
            color: '#FD79A8',
            subCategories: ['Digital Marketing', 'Content Strategy', 'Social Media', 'Journalism', 'Public Relations'],
            totalTests: 7,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'REAL_ESTATE': {
            name: 'Real Estate & Property',
            icon: 'home',
            color: '#FDCB6E',
            subCategories: ['Property Law', 'Market Analysis', 'Valuation', 'Property Management', 'Real Estate Finance'],
            totalTests: 5,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'GOVERNMENT': {
            name: 'Government & Public Sector',
            icon: 'library-outline',
            color: '#6C5CE7',
            subCategories: ['Public Administration', 'Policy Analysis', 'Public Finance', 'Governance', 'Public Service'],
            totalTests: 6,
            completedTests: 0,
            trending: false,
            enterprise: true
          },
          'TECHNOLOGY': {
            name: 'Technology & Programming',
            icon: 'code-slash',
            color: '#00D2D3',
            subCategories: ['JavaScript', 'React.js', 'Node.js', 'Python', 'Database Management', 'DevOps', 'Cybersecurity', 'AI/ML'],
            totalTests: 15,
            completedTests: 0,
            trending: true,
            enterprise: true
          },
          'PSYCHOMETRIC': {
            name: 'Psychometric Assessment',
            icon: 'analytics',
            color: '#FF7675',
            subCategories: ['Personality', 'Cognitive', 'Leadership Potential', 'Behavioral Analysis', 'Emotional Intelligence'],
            totalTests: 8,
            completedTests: 0,
            trending: true,
            enterprise: true
          }
        };
      }
      return categoriesData;
    } catch (error) {
      console.error('Error getting categories:', error);
      return {};
    }
  }, []);

  const categoryOptions = useMemo(() => ['All', ...Object.keys(categories)], [categories]);
  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const typeOptions = ['All', 'MCQ', 'Coding', 'Project'];

  // Enhanced tests loading with caching and error recovery
  const loadTests = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Use cached data if available and not forcing refresh
      if (!forceRefresh && cachedData && cachedData.length > 0) {
        setTests(cachedData);
        console.log(`Loaded ${cachedData.length} tests from cache`);
        return;
      }

      // Check if offline and has cached data
      if (isOffline && cachedData) {
        setTests(cachedData);
        Alert.alert(
          'Offline Mode', 
          'You are currently offline. Showing cached data.',
          [{ text: 'OK' }]
        );
        return;
      }

      const availableTests = testService.getAvailableTests();
      
      if (!Array.isArray(availableTests)) {
        console.warn('Invalid tests data from testService');
        
        // Enhanced fallback with comprehensive enterprise test data matching our service
        const enhancedFallbackTests = [
          // Healthcare Tests
          {
            id: 'healthcare_001',
            title: 'Medical Terminology Fundamentals',
            description: 'Master essential medical terminology, anatomy, and healthcare communication standards.',
            category: 'HEALTHCARE',
            difficulty: 'Beginner',
            type: 'MCQ',
            duration: 45,
            totalQuestions: 25,
            passingScore: 75,
            skills: ['Medical Terminology', 'Anatomy', 'Healthcare Communication'],
            verificationLevel: 'enterprise',
            popularity: 2150,
            createdAt: new Date().toISOString(),
            jobRoles: ['Medical Assistant', 'Healthcare Administrator', 'Nurse'],
            companies: ['Mayo Clinic', 'Johns Hopkins', 'Kaiser Permanente'],
            badge: 'Healthcare Professional',
            prerequisites: [],
            estimatedStudyTime: '3-4 hours',
            difficultyRating: 3.2,
            successRate: 82,
            trending: true,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          },
          // Finance Tests
          {
            id: 'finance_001',
            title: 'Investment Banking Fundamentals',
            description: 'Comprehensive assessment of investment banking principles, financial modeling, and market analysis.',
            category: 'FINANCE',
            difficulty: 'Advanced',
            type: 'MCQ',
            duration: 60,
            totalQuestions: 20,
            passingScore: 80,
            skills: ['Financial Modeling', 'Market Analysis', 'Risk Assessment', 'Valuation'],
            verificationLevel: 'enterprise',
            popularity: 3200,
            createdAt: new Date().toISOString(),
            jobRoles: ['Investment Banker', 'Financial Analyst', 'Portfolio Manager'],
            companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley'],
            badge: 'Investment Banking Expert',
            prerequisites: ['Finance degree or equivalent experience'],
            estimatedStudyTime: '4-5 hours',
            difficultyRating: 4.5,
            successRate: 68,
            trending: true,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          },
          // Technology Tests
          {
            id: 'tech_001',
            title: 'JavaScript Expert Certification',
            description: 'Advanced JavaScript assessment covering ES6+, async programming, and modern development practices.',
            category: 'TECHNOLOGY',
            difficulty: 'Advanced',
            type: 'Coding',
            duration: 90,
            totalQuestions: 30,
            passingScore: 75,
            skills: ['JavaScript', 'ES6+', 'Async Programming', 'DOM Manipulation', 'Testing'],
            verificationLevel: 'enterprise',
            popularity: 4500,
            createdAt: new Date().toISOString(),
            jobRoles: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer'],
            companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
            badge: 'JavaScript Expert',
            prerequisites: ['2+ years JavaScript experience'],
            estimatedStudyTime: '5-6 hours',
            difficultyRating: 4.2,
            successRate: 72,
            trending: true,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          },
          // Legal Tests
          {
            id: 'legal_001',
            title: 'Corporate Law Fundamentals',
            description: 'Essential corporate law principles, contract analysis, and regulatory compliance.',
            category: 'LEGAL',
            difficulty: 'Intermediate',
            type: 'MCQ',
            duration: 75,
            totalQuestions: 35,
            passingScore: 78,
            skills: ['Corporate Law', 'Contract Analysis', 'Regulatory Compliance', 'Legal Research'],
            verificationLevel: 'enterprise',
            popularity: 1800,
            createdAt: new Date().toISOString(),
            jobRoles: ['Corporate Lawyer', 'Legal Counsel', 'Compliance Officer'],
            companies: ['Baker McKenzie', 'Clifford Chance', 'Allen & Overy'],
            badge: 'Corporate Law Expert',
            prerequisites: ['Law degree or legal experience'],
            estimatedStudyTime: '4-5 hours',
            difficultyRating: 4.1,
            successRate: 71,
            trending: false,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          },
          // Manufacturing Tests
          {
            id: 'manufacturing_001',
            title: 'Lean Manufacturing Six Sigma',
            description: 'Comprehensive assessment of lean principles, Six Sigma methodology, and process optimization.',
            category: 'MANUFACTURING',
            difficulty: 'Advanced',
            type: 'MCQ',
            duration: 80,
            totalQuestions: 40,
            passingScore: 80,
            skills: ['Lean Manufacturing', 'Six Sigma', 'Process Optimization', 'Quality Control'],
            verificationLevel: 'enterprise',
            popularity: 2200,
            createdAt: new Date().toISOString(),
            jobRoles: ['Process Engineer', 'Quality Manager', 'Operations Manager'],
            companies: ['Toyota', 'GE', 'Boeing', 'Caterpillar'],
            badge: 'Lean Six Sigma Expert',
            prerequisites: ['Manufacturing experience'],
            estimatedStudyTime: '6-8 hours',
            difficultyRating: 4.3,
            successRate: 65,
            trending: true,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          },
          // Psychometric Tests
          {
            id: 'psych_001',
            title: 'Executive Leadership Assessment',
            description: 'Comprehensive personality and leadership assessment for executive-level positions.',
            category: 'PSYCHOMETRIC',
            difficulty: 'Advanced',
            type: 'Psychometric',
            duration: 120,
            totalQuestions: 200,
            passingScore: 70,
            skills: ['Leadership Traits', 'Personality Analysis', 'Behavioral Patterns', 'Emotional Intelligence'],
            verificationLevel: 'enterprise',
            popularity: 3500,
            createdAt: new Date().toISOString(),
            jobRoles: ['Senior Executive', 'Team Leader', 'Department Head', 'C-Suite'],
            companies: ['Hogan Assessments', 'SHL', 'Korn Ferry', 'IBM Watson'],
            badge: 'Executive Leader',
            prerequisites: ['Leadership experience'],
            estimatedStudyTime: '2 hours assessment',
            difficultyRating: 4.0,
            successRate: 58,
            trending: true,
            aiProctored: true,
            antiCheatEnabled: true,
            blockchainVerified: true
          }
        ];
        
        setTests(enhancedFallbackTests);
        
        // Cache the fallback data
        await saveUserData('cached_tests', enhancedFallbackTests);
        setCachedData(enhancedFallbackTests);
        
        console.log(`Loaded ${enhancedFallbackTests.length} enhanced fallback tests`);
      } else {
        // Enhance tests with additional metadata
        const enhancedTests = availableTests.map(test => ({
          ...test,
          trending: test.popularity > 1000,
          badge: test.badge || `${test.category} Expert`,
          prerequisites: test.prerequisites || [],
          estimatedStudyTime: test.estimatedStudyTime || `${Math.round(test.duration / 20)}-${Math.round(test.duration / 15)} hours`,
          difficultyRating: test.difficultyRating || (test.difficulty === 'Beginner' ? 3.0 : test.difficulty === 'Intermediate' ? 4.0 : 4.5),
          successRate: test.successRate || Math.floor(Math.random() * 30) + 60
        }));
        
        setTests(enhancedTests);
        
        // Cache the enhanced data
        await saveUserData('cached_tests', enhancedTests);
        setCachedData(enhancedTests);
        setLastSyncTime(new Date().toISOString());
        
        console.log(`Loaded ${enhancedTests.length} enhanced tests successfully`);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      
      // Try to load from cache as fallback
      const cachedTests = await loadUserData('cached_tests', []);
      if (cachedTests.length > 0) {
        setTests(cachedTests);
        setCachedData(cachedTests);
        Alert.alert(
          'Connection Error', 
          'Unable to fetch latest tests. Showing cached data.',
          [{ text: 'Retry', onPress: () => loadTests(true) }, { text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to load tests. Please check your connection and try again.');
        setTests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline, cachedData, saveUserData, loadUserData]);

  // Enhanced user data loading with persistence and analytics
  const loadUserDataFromStorage = useCallback(async () => {
    try {
      console.log('Loading comprehensive user data...');
      
      // Load all user data in parallel for better performance
      const [
        savedProgress,
        savedFavorites,
        savedBookmarks,
        savedScores,
        savedHistory,
        savedAchievements,
        savedBadges,
        savedRoadmaps,
        savedEndorsements,
        savedShowcase,
        savedMentorReviews,
        savedSettings
      ] = await Promise.all([
        loadUserData('user_progress', {}),
        loadUserData('favorite_tests', []),
        loadUserData('bookmarked_tests', []),
        loadUserData('test_scores', {}),
        loadUserData('test_history', []),
        loadUserData('achievements', []),
        loadUserData('verified_badges', []),
        loadUserData('roadmap_progress', {}),
        loadUserData('corporate_endorsements', []),
        loadUserData('skill_showcase', []),
        loadUserData('mentor_reviews', []),
        loadUserData('user_settings', {})
      ]);

      // Enhanced user progress with analytics
      const enhancedUserProgress = {
        'CSE': ['cse_001', 'cse_003', 'cse_005'],
        'BBA': ['bba_002', 'bba_001'],
        'EEE': ['eee_001'],
        'PSYCHOMETRIC': ['psych_001'],
        'SOFT_SKILLS': ['soft_001'],
        'EMERGING_TECH': [],
        ...savedProgress
      };
      setUserProgress(enhancedUserProgress);
      
      // Enhanced favorites with metadata
      const enhancedFavorites = new Set([
        'cse_001', 'psych_001', 'corp_001', 'tech_001', 'soft_001',
        ...savedFavorites
      ]);
      setFavoriteTests(enhancedFavorites);
      
      // Enhanced bookmarks
      const enhancedBookmarks = new Set([
        'corp_001', 'tech_001', 'psych_001',
        ...savedBookmarks
      ]);
      setBookmarkedTests(enhancedBookmarks);
      
      // Enhanced test scores with performance analytics
      const enhancedTestScores = {
        'cse_001': 92,
        'cse_003': 95,
        'cse_005': 87,
        'bba_002': 88,
        'bba_001': 85,
        'eee_001': 78,
        'psych_001': 89,
        'soft_001': 91,
        ...savedScores
      };
      setTestScores(enhancedTestScores);
      
      // Enhanced test history with detailed analytics
      const enhancedTestHistory = [
        { 
          testId: 'cse_001', 
          date: new Date().toISOString(), 
          score: 92, 
          duration: 28, 
          category: 'CSE',
          timeSpent: 25,
          attempts: 1,
          rank: 'Top 10%',
          badge: 'JavaScript Expert'
        },
        { 
          testId: 'psych_001', 
          date: new Date(Date.now() - 86400000).toISOString(), 
          score: 89, 
          duration: 58, 
          category: 'PSYCHOMETRIC',
          timeSpent: 55,
          attempts: 1,
          rank: 'Top 15%',
          badge: 'Executive Leader'
        },
        { 
          testId: 'soft_001', 
          date: new Date(Date.now() - 172800000).toISOString(), 
          score: 91, 
          duration: 42, 
          category: 'SOFT_SKILLS',
          timeSpent: 40,
          attempts: 1,
          rank: 'Top 12%',
          badge: 'Team Leader'
        },
        ...savedHistory
      ];
      setTestHistory(enhancedTestHistory);
      
      // Enhanced gamification data
      setStudyStreak(15);
      setCompletedToday(2);
      
      // Enhanced achievements with metadata
      const enhancedAchievements = [
        { 
          id: 'first_test', 
          name: 'First Test Complete', 
          description: 'Complete your first test', 
          unlocked: true, 
          unlockedAt: '2024-12-01',
          icon: '🎯',
          points: 10,
          rarity: 'common'
        },
        { 
          id: 'streak_10', 
          name: '10 Day Streak', 
          description: 'Complete tests for 10 consecutive days', 
          unlocked: true, 
          unlockedAt: '2024-12-05',
          icon: '🔥',
          points: 50,
          rarity: 'uncommon'
        },
        { 
          id: 'high_scorer', 
          name: 'High Scorer', 
          description: 'Score 90% or higher on 3 tests', 
          unlocked: true, 
          unlockedAt: '2024-12-07',
          icon: '⭐',
          points: 30,
          rarity: 'rare'
        },
        { 
          id: 'multi_category', 
          name: 'Well Rounded', 
          description: 'Complete tests in 5 different categories', 
          unlocked: true, 
          unlockedAt: '2024-12-08',
          icon: '🌟',
          points: 75,
          rarity: 'epic'
        },
        { 
          id: 'executive_ready', 
          name: 'Executive Ready', 
          description: 'Pass advanced leadership assessments', 
          unlocked: false,
          icon: '👑',
          points: 200,
          rarity: 'legendary'
        },
        ...savedAchievements
      ];
      setAchievements(enhancedAchievements);
      
      setLeaderboardPosition(23);
      setWeeklyProgress(85);
      setTotalPoints(3250);
      setCurrentLevel(6);
      setNextLevelProgress(78);

      // Enhanced SkillNet specific data
      const enhancedVerifiedBadges = [
        { 
          id: 'js_expert', 
          name: 'JavaScript Expert', 
          verified: true, 
          issuer: 'SkillNet Corporate', 
          earnedAt: '2024-12-01', 
          skill: 'JavaScript',
          credentialId: 'SN-JS-2024-001',
          validUntil: '2026-12-01',
          verificationScore: 92
        },
        { 
          id: 'executive_leader', 
          name: 'Executive Leadership', 
          verified: true, 
          issuer: 'SkillNet Executive Council', 
          earnedAt: '2024-12-05', 
          skill: 'Leadership',
          credentialId: 'SN-EL-2024-002',
          validUntil: '2026-12-05',
          verificationScore: 89
        },
        { 
          id: 'team_leader', 
          name: 'Team Management', 
          verified: true, 
          issuer: 'SkillNet Corporate', 
          earnedAt: '2024-12-07', 
          skill: 'Team Leadership',
          credentialId: 'SN-TL-2024-003',
          validUntil: '2026-12-07',
          verificationScore: 91
        },
        { 
          id: 'ai_professional', 
          name: 'AI Professional', 
          verified: false, 
          issuer: 'SkillNet Technology', 
          skill: 'Artificial Intelligence',
          progress: 65
        },
        ...savedBadges
      ];
      setVerifiedBadges(enhancedVerifiedBadges);
      
      // Enhanced roadmap progress with detailed analytics
      const enhancedRoadmapProgress = {
        'frontend_developer': { 
          progress: 85, 
          badges: 4, 
          estimatedCompletion: '2024-12-15',
          completedTests: ['cse_001', 'cse_003', 'cse_005'],
          nextTest: 'cse_007',
          timeInvested: '24 hours',
          skillsGained: ['JavaScript', 'React', 'Node.js'],
          level: 'Advanced',
          marketValue: '+$15,000 salary potential'
        },
        'executive_leader': { 
          progress: 75, 
          badges: 3, 
          estimatedCompletion: '2024-12-20',
          completedTests: ['soft_001', 'psych_001'],
          nextTest: 'corp_001',
          timeInvested: '18 hours',
          skillsGained: ['Leadership', 'Strategic Thinking'],
          level: 'Senior',
          marketValue: '+$25,000 salary potential'
        },
        'ai_specialist': { 
          progress: 45, 
          badges: 1, 
          estimatedCompletion: '2025-01-15',
          completedTests: [],
          nextTest: 'tech_001',
          timeInvested: '8 hours',
          skillsGained: ['Machine Learning Basics'],
          level: 'Intermediate',
          marketValue: '+$30,000 salary potential'
        },
        ...savedRoadmaps
      };
      setRoadmapProgress(enhancedRoadmapProgress);
      
      // Enhanced corporate endorsements
      const enhancedCorporateEndorsements = [
        { 
          company: 'TechCorp Inc.', 
          endorser: 'Sarah Johnson - CTO', 
          skill: 'JavaScript Development', 
          date: '2024-12-01',
          endorsementType: 'skill_verification',
          weight: 0.95,
          publicEndorsement: true,
          linkedInUrl: 'https://linkedin.com/in/sarah-johnson',
          companyLogo: 'https://techcorp.com/logo.png'
        },
        { 
          company: 'Leadership Institute', 
          endorser: 'Dr. Michael Chen - Director', 
          skill: 'Executive Leadership', 
          date: '2024-12-05',
          endorsementType: 'assessment_verification',
          weight: 0.92,
          publicEndorsement: true,
          certificateUrl: 'https://leadership-institute.com/cert/12345'
        },
        ...savedEndorsements
      ];
      setCorporateEndorsements(enhancedCorporateEndorsements);
      
      // Enhanced skill showcase
      const enhancedSkillShowcase = [
        { 
          id: 'executive_portfolio', 
          title: 'Executive Leadership Portfolio', 
          description: 'Comprehensive leadership assessment and development plan',
          type: 'assessment',
          featured: true,
          verified: true,
          completionDate: '2024-12-05',
          score: 89,
          rank: 'Top 15%',
          skills: ['Strategic Thinking', 'Team Leadership', 'Decision Making']
        },
        { 
          id: 'js_mastery', 
          title: 'JavaScript Mastery Project', 
          description: 'Advanced JavaScript application with modern frameworks',
          type: 'project',
          featured: true,
          verified: true,
          completionDate: '2024-12-01',
          score: 92,
          rank: 'Top 10%',
          skills: ['JavaScript', 'React', 'Node.js'],
          demoUrl: 'https://demo.example.com'
        },
        ...savedShowcase
      ];
      setSkillShowcase(enhancedSkillShowcase);
      
      // Enhanced mentor reviews
      const enhancedMentorReviews = [
        { 
          mentor: 'Dr. Sarah Kim - Tech Leadership Expert', 
          rating: 4.9, 
          comment: 'Exceptional leadership potential with strong technical foundation. Demonstrates excellent decision-making under pressure.', 
          date: '2024-12-05',
          expertise: 'Executive Leadership',
          verified: true,
          linkedInProfile: 'https://linkedin.com/in/dr-sarah-kim'
        },
        { 
          mentor: 'Prof. Alex Rodriguez - JavaScript Specialist', 
          rating: 4.8, 
          comment: 'Outstanding JavaScript skills with deep understanding of modern development practices.', 
          date: '2024-12-01',
          expertise: 'JavaScript Development',
          verified: true,
          linkedInProfile: 'https://linkedin.com/in/alex-rodriguez'
        },
        ...savedMentorReviews
      ];
      setMentorReviews(enhancedMentorReviews);
      
      // Update trust and hirability scores based on achievements
      const calculatedTrustScore = Math.min(95, 70 + (enhancedVerifiedBadges.filter(b => b.verified).length * 5));
      const calculatedHirabilityScore = Math.min(90, 60 + (enhancedTestHistory.length * 3) + (enhancedCorporateEndorsements.length * 8));
      
      setTrustScore(calculatedTrustScore);
      setHirabilityScore(calculatedHirabilityScore);
      
      console.log('Enhanced user data loaded successfully');
      console.log('Progress:', Object.keys(enhancedUserProgress).length, 'categories');
      console.log('Verified badges:', enhancedVerifiedBadges.filter(b => b.verified).length);
      console.log('Roadmaps:', Object.keys(enhancedRoadmapProgress).length);
      console.log('Trust Score:', calculatedTrustScore);
      console.log('Hirability Score:', calculatedHirabilityScore);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set basic fallback data
      setUserProgress({ 'CSE': [], 'BBA': [], 'EEE': [], 'PSYCHOMETRIC': [], 'SOFT_SKILLS': [], 'EMERGING_TECH': [] });
      setVerifiedBadges([]);
      setRoadmapProgress({});
      setCorporateEndorsements([]);
      setTrustScore(50);
      setHirabilityScore(50);
    }
  }, [loadUserData]);

  // Filter and sort tests
  const filterAndSortTests = useCallback(() => {
    try {
      if (!Array.isArray(tests) || tests.length === 0) {
        console.log('No tests available for filtering');
        setFilteredTests([]);
        return;
      }

      let filtered = [...tests];
      console.log(`Starting with ${filtered.length} tests for filtering`);

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(test => {
          if (!test) return false;
          
          const titleMatch = test.title?.toLowerCase().includes(query) || false;
          const descriptionMatch = test.description?.toLowerCase().includes(query) || false;
          const skillsMatch = Array.isArray(test.skills) && 
            test.skills.some(skill => skill?.toLowerCase().includes(query)) || false;
          
          return titleMatch || descriptionMatch || skillsMatch;
        });
        console.log(`After search filter: ${filtered.length} tests`);
      }

      // Apply category filter
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(test => test && test.category === selectedCategory);
        console.log(`After category filter (${selectedCategory}): ${filtered.length} tests`);
      }

      // Apply difficulty filter
      if (selectedDifficulty !== 'All') {
        filtered = filtered.filter(test => test && test.difficulty === selectedDifficulty);
        console.log(`After difficulty filter (${selectedDifficulty}): ${filtered.length} tests`);
      }

      // Apply type filter
      if (selectedType !== 'All') {
        filtered = filtered.filter(test => test && test.type === selectedType);
        console.log(`After type filter (${selectedType}): ${filtered.length} tests`);
      }

      // Sort tests
      switch (sortBy) {
        case 'popularity':
          filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          break;
        case 'alphabetical':
          filtered.sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB);
          });
          break;
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          filtered.sort((a, b) => {
            const diffA = difficultyOrder[a.difficulty] || 0;
            const diffB = difficultyOrder[b.difficulty] || 0;
            return diffA - diffB;
          });
          break;
        default:
          // Keep default order for 'recommended'
          console.log('Using recommended sort order');
          break;
      }

      console.log(`Final filtered tests: ${filtered.length}`);
      setFilteredTests(filtered);
    } catch (error) {
      console.error('Error filtering tests:', error);
      setFilteredTests([]);
    }
  }, [tests, searchQuery, selectedCategory, selectedDifficulty, selectedType, sortBy]);

  // Enhanced test start with enterprise features
  const startTest = useCallback(async (test) => {
    try {
      if (!test || !test.id) {
        console.error('Invalid test object:', test);
        Alert.alert('Error', 'Invalid test data. Please try again.');
        return;
      }

      const isCompleted = userProgress[test.category]?.includes(test.id) || false;
      const previousScore = testScores[test.id];
      
      // Check for enterprise features and requirements
      const enterpriseFeatures = [];
      if (test.aiProctored) enterpriseFeatures.push('🤖 AI Proctoring');
      if (test.antiCheatEnabled) enterpriseFeatures.push('🛡️ Anti-Cheat Protection');
      if (test.blockchainVerified) enterpriseFeatures.push('🔗 Blockchain Certificate');
      if (test.verificationLevel === 'enterprise') enterpriseFeatures.push('🏢 Enterprise Grade');
      
      const featuresText = enterpriseFeatures.length > 0 
        ? `\n\nEnterprise Features:\n${enterpriseFeatures.join('\n')}` 
        : '';
      
      const alertTitle = isCompleted ? 'Retake Test' : 'Start Enterprise Test';
      const alertMessage = `${isCompleted ? 'Retake' : 'Start'} ${test.title}?\n\nDuration: ${test.duration || 'N/A'} minutes\nQuestions: ${test.totalQuestions || 'N/A'}${previousScore ? `\nPrevious Score: ${previousScore}%` : ''}${featuresText}`;
      
      Alert.alert(
        alertTitle,
        alertMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isCompleted ? 'Retake' : 'Start',
            onPress: async () => {
              try {
                console.log(`Starting enterprise test: ${test.id} (${test.type})`);
                
                // Initialize test session with enterprise features
                if (test.aiProctored || test.antiCheatEnabled) {
                  const sessionData = await testService.initializeTestSession({
                    testId: test.id,
                    userId: 'current_user', // Replace with actual user ID
                    features: {
                      aiProctoring: test.aiProctored,
                      antiCheat: test.antiCheatEnabled,
                      blockchainVerification: test.blockchainVerified
                    }
                  });
                  
                  if (sessionData && sessionData.sessionId) {
                    console.log('Enterprise test session initialized:', sessionData.sessionId);
                  }
                }
                
                // Navigate to appropriate test screen based on test type
                switch (test.type) {
                  case 'MCQ':
                    if (navigation.navigate) {
                      navigation.navigate('MCQTest', { 
                        test,
                        enterpriseFeatures: {
                          aiProctored: test.aiProctored,
                          antiCheat: test.antiCheatEnabled,
                          blockchain: test.blockchainVerified
                        }
                      });
                    } else {
                      console.warn('Navigation not available, simulating test start');
                      Alert.alert('Enterprise Test Started', `${test.title} test with enterprise features would start now.`);
                    }
                    break;
                  case 'Coding':
                    if (navigation.navigate) {
                      navigation.navigate('CodingTest', { 
                        test,
                        enterpriseFeatures: {
                          aiProctored: test.aiProctored,
                          antiCheat: test.antiCheatEnabled,
                          blockchain: test.blockchainVerified
                        }
                      });
                    } else {
                      console.warn('Navigation not available, simulating coding test start');
                      Alert.alert('Enterprise Coding Test Started', `${test.title} coding test with AI proctoring would start now.`);
                    }
                    break;
                  case 'Project':
                    if (navigation.navigate) {
                      navigation.navigate('ProjectUpload', { 
                        test,
                        enterpriseFeatures: {
                          aiProctored: test.aiProctored,
                          antiCheat: test.antiCheatEnabled,
                          blockchain: test.blockchainVerified
                        }
                      });
                    } else {
                      console.warn('Navigation not available, simulating project upload');
                      Alert.alert('Enterprise Project Upload', `${test.title} project upload with blockchain verification would start now.`);
                    }
                    break;
                  case 'Psychometric':
                    if (navigation.navigate) {
                      navigation.navigate('PsychometricTest', { 
                        test,
                        enterpriseFeatures: {
                          aiProctored: test.aiProctored,
                          antiCheat: test.antiCheatEnabled,
                          blockchain: test.blockchainVerified
                        }
                      });
                    } else {
                      console.warn('Navigation not available, simulating psychometric test');
                      Alert.alert('Enterprise Psychometric Test', `${test.title} psychometric assessment with AI analysis would start now.`);
                    }
                    break;
                  default:
                    console.log('Unknown test type, defaulting to MCQ');
                    if (navigation.navigate) {
                      navigation.navigate('MCQTest', { 
                        test,
                        enterpriseFeatures: {
                          aiProctored: test.aiProctored,
                          antiCheat: test.antiCheatEnabled,
                          blockchain: test.blockchainVerified
                        }
                      });
                    } else {
                      Alert.alert('Enterprise Test Started', `${test.title} test with enterprise features would start now.`);
                    }
                    break;
                }
              } catch (navError) {
                console.error('Navigation error:', navError);
                Alert.alert('Navigation Error', 'Unable to start enterprise test. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('Error', 'Unable to start enterprise test. Please try again.');
    }
  }, [userProgress, testScores, navigation]);

  // Enhanced toggle favorite with persistence and analytics
  const toggleFavorite = useCallback(async (testId) => {
    try {
      setFavoriteTests(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(testId)) {
          newFavorites.delete(testId);
          trackPerformance('unfavorite', 1);
        } else {
          newFavorites.add(testId);
          trackPerformance('favorite', 1);
        }
        
        // Persist to storage
        saveUserData('favorite_tests', Array.from(newFavorites));
        
        return newFavorites;
      });

      // Show feedback
      const test = tests.find(t => t.id === testId);
      const isFavorite = favoriteTests.has(testId);
      
      // Haptic feedback could be added here for better UX
      console.log(`Test "${test?.title}" ${isFavorite ? 'removed from' : 'added to'} favorites`);
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [favoriteTests, tests, saveUserData, trackPerformance]);

  // Enhanced toggle bookmark with persistence and analytics
  const toggleBookmark = useCallback(async (testId) => {
    try {
      setBookmarkedTests(prev => {
        const newBookmarks = new Set(prev);
        if (newBookmarks.has(testId)) {
          newBookmarks.delete(testId);
          trackPerformance('unbookmark', 1);
        } else {
          newBookmarks.add(testId);
          trackPerformance('bookmark', 1);
        }
        
        // Persist to storage
        saveUserData('bookmarked_tests', Array.from(newBookmarks));
        
        return newBookmarks;
      });

      // Show feedback
      const test = tests.find(t => t.id === testId);
      const isBookmarked = bookmarkedTests.has(testId);
      
      console.log(`Test "${test?.title}" ${isBookmarked ? 'removed from' : 'added to'} bookmarks`);
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }, [bookmarkedTests, tests, saveUserData, trackPerformance]);

  // Enhanced search handling with smart suggestions and persistence
  const handleSearchSubmit = useCallback(async (searchTerm) => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;
    
    try {
      // Save to recent searches
      await saveRecentSearch(trimmedTerm);
      
      // Hide suggestions
      setShowSuggestions(false);
      
      // Track search analytics
      trackPerformance('searchSubmit', trimmedTerm.length);
      
      // Apply search
      setSearchQuery(trimmedTerm);
      
      console.log(`Search submitted: "${trimmedTerm}"`);
    } catch (error) {
      console.error('Error handling search submit:', error);
    }
  }, [saveRecentSearch, trackPerformance]);

  const handleSuggestionSelect = useCallback(async (suggestion) => {
    try {
      // Apply the suggestion
      setSearchQuery(suggestion.text);
      setShowSuggestions(false);
      
      // Save to recent searches
      await saveRecentSearch(suggestion.text);
      
      // Track suggestion usage
      trackPerformance('suggestionSelect', suggestion.type);
      
      console.log(`Suggestion selected: "${suggestion.text}" (${suggestion.type})`);
    } catch (error) {
      console.error('Error handling suggestion select:', error);
    }
  }, [saveRecentSearch, trackPerformance]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSuggestions(false);
    trackPerformance('searchClear', 1);
  }, [trackPerformance]);

  const removeRecentSearch = useCallback(async (searchTerm) => {
    try {
      setRecentSearches(prev => {
        const newSearches = prev.filter(s => s !== searchTerm);
        saveUserData('recent_searches', newSearches);
        return newSearches;
      });
      
      trackPerformance('removeRecentSearch', 1);
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  }, [saveUserData, trackPerformance]);

  // Enhanced UI Components with comprehensive features
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests, skills, or companies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearchSubmit(searchQuery)}
          onFocus={() => setShowSuggestions(true)}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {searchSuggestions.slice(0, 5).map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(suggestion)}
            >
              <Ionicons 
                name={suggestion.type === 'test' ? 'assignment' : 
                      suggestion.type === 'skill' ? 'code' : 
                      suggestion.type === 'company' ? 'business' : 'work'} 
                size={16} 
                color="#007AFF" 
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              <Text style={styles.suggestionType}>{suggestion.type}</Text>
            </TouchableOpacity>
          ))}
          
          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesSection}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              {recentSearches.slice(0, 3).map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <Ionicons name="history" size={14} color="#8E8E93" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                    <Ionicons name="close" size={14} color="#8E8E93" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderRecommendations = () => {
    if (recommendedTests.length === 0) return null;

    return (
      <View style={styles.recommendationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Recommended for You</Text>
          <Text style={styles.sectionSubtitle}>
            Based on your skills and progress
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recommendationsScroll}
        >
          {recommendedTests.slice(0, 5).map((test) => (
            <View key={test.id} style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>{test.title}</Text>
              <Text style={styles.recommendationCompany}>{test.company}</Text>
              <Text style={styles.recommendationReason}>{test.reason}</Text>
              <View style={styles.recommendationScore}>
                <Text style={styles.scoreLabel}>Match:</Text>
                <Text style={styles.scoreValue}>
                  {Math.round(test.score * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPerformanceStats = () => {
    if (!showPerformanceStats) return null;

    return (
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>📊 Performance Analytics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{performanceData.loadTime}ms</Text>
            <Text style={styles.statLabel}>Load Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{performanceData.interactions}</Text>
            <Text style={styles.statLabel}>Interactions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{performanceData.searches}</Text>
            <Text style={styles.statLabel}>Searches</Text>
          </View>
        </View>
      </View>
    );
  };

  // Helper functions for UI
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#34C759';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'in_progress': return '#FF9500';
      case 'available': return '#007AFF';
      case 'locked': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  // Enhanced search functionality with persistence
  const loadRecentSearches = useCallback(async () => {
    try {
      const searches = await loadUserData('recent_searches', []);
      setRecentSearches(searches);
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, [loadUserData]);

  const saveRecentSearch = useCallback(async (searchTerm) => {
    try {
      const trimmedTerm = searchTerm.trim();
      if (!trimmedTerm) return;

      setRecentSearches(prev => {
        const newSearches = [trimmedTerm, ...prev.filter(s => s !== trimmedTerm)].slice(0, 10);
        saveUserData('recent_searches', newSearches);
        return newSearches;
      });
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  }, [saveUserData]);

  // Enhanced search suggestions with intelligent matching
  const generateSearchSuggestions = useCallback((query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Add matching test titles with relevance scoring
    tests.forEach(test => {
      if (test.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'test',
          text: test.title,
          icon: 'document-text',
          category: test.category,
          difficulty: test.difficulty,
          score: test.title.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0.8
        });
      }
    });

    // Add matching skills with popularity weighting
    const allSkills = [...new Set(tests.flatMap(test => test.skills || []))];
    allSkills.forEach(skill => {
      if (skill.toLowerCase().includes(lowerQuery)) {
        const relatedTests = tests.filter(test => 
          test.skills && test.skills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        suggestions.push({
          type: 'skill',
          text: skill,
          icon: 'code-slash',
          relatedCount: relatedTests.length,
          score: skill.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0.7
        });
      }
    });

    // Add matching companies
    const allCompanies = [...new Set(tests.flatMap(test => test.companies || []))];
    allCompanies.forEach(company => {
      if (company.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'company',
          text: company,
          icon: 'business',
          score: company.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0.6
        });
      }
    });

    // Add matching job roles
    const allJobRoles = [...new Set(tests.flatMap(test => test.jobRoles || []))];
    allJobRoles.forEach(role => {
      if (role.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'jobRole',
          text: role,
          icon: 'briefcase',
          score: role.toLowerCase().indexOf(lowerQuery) === 0 ? 1 : 0.5
        });
      }
    });

    // Sort by relevance score and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setSearchSuggestions(sortedSuggestions);
  }, [tests]);

  // Smart test recommendation with user context
  const getSmartRecommendations = useCallback(() => {
    try {
      if (!Array.isArray(tests) || tests.length === 0) {
        console.log('No tests available for smart recommendations');
        return [];
      }

      const userCategories = Object.keys(userProgress || {});
      const userSkills = tests
        .filter(test => {
          if (!test || !test.category) return false;
          return userProgress[test.category]?.includes(test.id) || false;
        })
        .flatMap(test => test.skills || [])
        .filter(skill => skill && typeof skill === 'string');
      
      const userLevel = calculateUserLevel();
      const userInterests = getFavoriteCategories();
      
      console.log('Smart recommendation context:', {
        userCategories: userCategories.length,
        userSkills: userSkills.length,
        userLevel,
        userInterests
      });
      
      const recommendations = tests
        .filter(test => {
          if (!test || !test.category || !test.id) return false;
          return !userProgress[test.category]?.includes(test.id);
        })
        .map(test => {
          let score = 0;
          let reasoning = [];
          
          try {
            // Category relevance (25%)
            if (userCategories.includes(test.category)) {
              score += 0.25;
              reasoning.push('Matches your active categories');
            }
            
            // Interest alignment (20%)
            if (userInterests.includes(test.category)) {
              score += 0.20;
              reasoning.push('Aligns with your interests');
            }
            
            // Skill relevance (20%)
            if (Array.isArray(test.skills)) {
              const matchingSkills = test.skills.filter(skill => {
                if (!skill || typeof skill !== 'string') return false;
                return userSkills.some(userSkill => 
                  userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(userSkill.toLowerCase())
                );
              });
              const skillScore = (matchingSkills.length / test.skills.length) * 0.20;
              score += skillScore;
              
              if (matchingSkills.length > 0) {
                reasoning.push(`Builds on ${matchingSkills.length} existing skills`);
              }
            }
            
            // Difficulty progression (15%)
            const difficultyScore = getDifficultyRecommendationScore(test.difficulty, userLevel);
            score += difficultyScore * 0.15;
            
            if (difficultyScore > 0.7) {
              reasoning.push('Perfect difficulty level for you');
            }
            
            // Trending factor (10%)
            if (test.trending || test.popularity > 1000) {
              score += 0.10;
              reasoning.push('Currently trending');
            }
            
            // Verification level bonus (5%)
            if (test.verificationLevel === 'corporate') {
              score += 0.05;
              reasoning.push('Corporate verified');
            }
            
            // Recent activity bonus (5%)
            const daysSinceCreation = (new Date() - new Date(test.createdAt || new Date())) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation < 30) {
              score += 0.05;
              reasoning.push('Recently added');
            }
            
          } catch (scoringError) {
            console.warn('Error calculating score for test:', test.id, scoringError);
            score = 0.1; // Minimal fallback score
          }
          
          return { 
            ...test, 
            recommendationScore: score,
            reasoning: reasoning.join(' • '),
            contextualFit: score > 0.6 ? 'high' : score > 0.3 ? 'medium' : 'low'
          };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 12);
      
      console.log(`Generated ${recommendations.length} smart recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      return tests.slice(0, 5); // Fallback to first 5 tests
    }
  }, [tests, userProgress, testScores, favoriteTests]);

  // Calculate user level based on performance
  const calculateUserLevel = useCallback(() => {
    const completedTests = Object.values(userProgress).flat();
    const scores = completedTests.map(testId => testScores[testId]).filter(Boolean);
    
    if (scores.length === 0) return 'Beginner';
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const testCount = completedTests.length;
    
    if (testCount >= 15 && avgScore >= 85) return 'Expert';
    if (testCount >= 10 && avgScore >= 75) return 'Advanced';
    if (testCount >= 5 && avgScore >= 65) return 'Intermediate';
    return 'Beginner';
  }, [userProgress, testScores]);

  // Get user's favorite categories based on activity
  const getFavoriteCategories = useCallback(() => {
    const categoryActivity = {};
    
    // Count completed tests per category
    Object.entries(userProgress).forEach(([category, testIds]) => {
      categoryActivity[category] = (categoryActivity[category] || 0) + testIds.length;
    });
    
    // Count favorite tests per category
    Array.from(favoriteTests).forEach(testId => {
      const test = tests.find(t => t.id === testId);
      if (test) {
        categoryActivity[test.category] = (categoryActivity[test.category] || 0) + 0.5;
      }
    });
    
    // Return top 3 categories
    return Object.entries(categoryActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }, [userProgress, favoriteTests, tests]);

  // Enhanced difficulty recommendation scoring
  const getDifficultyRecommendationScore = useCallback((testDifficulty, userLevel) => {
    const difficultyMap = {
      'Beginner': { 'Beginner': 1.0, 'Intermediate': 0.7, 'Advanced': 0.2, 'Expert': 0.1 },
      'Intermediate': { 'Beginner': 0.3, 'Intermediate': 1.0, 'Advanced': 0.8, 'Expert': 0.4 },
      'Advanced': { 'Beginner': 0.1, 'Intermediate': 0.4, 'Advanced': 1.0, 'Expert': 0.8 },
      'Expert': { 'Beginner': 0.1, 'Intermediate': 0.2, 'Advanced': 0.6, 'Expert': 1.0 }
    };
    
    return difficultyMap[userLevel]?.[testDifficulty] || 0.5;
  }, []);

  // Memoize the smart recommendations
  const recommendedTests = useMemo(() => getSmartRecommendations(), [getSmartRecommendations]);

  // Performance analytics
  const getPerformanceInsights = useCallback(() => {
    const completedTests = Object.values(userProgress).flat();
    const scores = completedTests.map(testId => testScores[testId]).filter(Boolean);
    
    if (scores.length === 0) return null;
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const strongestCategory = Object.entries(userProgress)
      .map(([category, tests]) => ({
        category,
        avgScore: tests.reduce((sum, testId) => sum + (testScores[testId] || 0), 0) / tests.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];
    
    const improvement = scores.length > 1 ? 
      scores[scores.length - 1] - scores[0] : 0;
    
    return {
      averageScore: Math.round(avgScore),
      totalCompleted: completedTests.length,
      strongestCategory: strongestCategory?.category,
      improvement: Math.round(improvement),
      streak: studyStreak,
      level: currentLevel,
      points: totalPoints
    };
  }, [userProgress, testScores, studyStreak, currentLevel, totalPoints]);

  // Enhanced refresh handler with comprehensive data sync
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const startTime = Date.now();
      
      // Check connectivity
      const isConnected = await checkConnectivity();
      
      if (isConnected) {
        // Parallel refresh for better performance
        await Promise.all([
          loadTests(true), // Force fresh data
          loadUserDataFromStorage(),
          loadRecentSearches()
        ]);
        
        // Update sync time
        setLastSyncTime(new Date().toISOString());
        await saveUserData('last_sync_time', new Date().toISOString());
        
        // Track refresh performance
        const refreshTime = Date.now() - startTime;
        trackPerformance('refreshTime', refreshTime);
        
        console.log(`Data refreshed successfully in ${refreshTime}ms`);
      } else {
        Alert.alert(
          'No Internet Connection',
          'Unable to refresh data. Please check your connection.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh data. Please try again.',
        [{ text: 'Retry', onPress: onRefresh }, { text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    checkConnectivity, 
    loadTests, 
    loadUserDataFromStorage, 
    loadRecentSearches, 
    saveUserData, 
    trackPerformance
  ]);

  // Enhanced Effects with better lifecycle management
  useEffect(() => {
    initializeApp();
    
    // Listen for navigation focus to refresh data when returning from tests
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh user data when screen comes into focus
      loadUserDataFromStorage();
      trackPerformance('screenFocus', Date.now());
    });

    return unsubscribe;
  }, [initializeApp, navigation, loadUserDataFromStorage, trackPerformance]);

  // Enhanced focus effect for better performance
  useFocusEffect(
    useCallback(() => {
      // Track screen view
      trackPerformance('screenView', Date.now());
      
      // Check for data updates
      InteractionManager.runAfterInteractions(() => {
        if (lastSyncTime) {
          const timeSinceSync = Date.now() - new Date(lastSyncTime).getTime();
          if (timeSinceSync > 300000) { // 5 minutes
            loadTests(true); // Force refresh if data is old
          }
        }
      });
    }, [trackPerformance, lastSyncTime, loadTests])
  );

  // Enhanced search and filter effects with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterAndSortTests();
      trackPerformance('filterUpdate', Date.now());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterAndSortTests, trackPerformance]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSearchSuggestions(searchQuery);
      setShowSuggestions(searchQuery.length >= 2);
      
      if (searchQuery.trim() && searchQuery.length >= 2) {
        trackPerformance('searchQuery', searchQuery.length);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, generateSearchSuggestions, trackPerformance]);

  // Enhanced test status with comprehensive analytics
  const getTestStatus = useCallback((test) => {
    const isCompleted = userProgress[test.category]?.includes(test.id);
    const score = testScores[test.id];
    const isFavorite = favoriteTests.has(test.id);
    const isBookmarked = bookmarkedTests.has(test.id);
    const isRecommended = recommendedTests.some(t => t.id === test.id);
    const recommendedTest = recommendedTests.find(t => t.id === test.id);
    
    // Enhanced status information
    const testHistoryItem = testHistory.find(h => h.testId === test.id);
    const isPassed = score >= test.passingScore;
    const attempts = testHistoryItem?.attempts || (isCompleted ? 1 : 0);
    const lastAttemptDate = testHistoryItem?.date;
    const timeSpent = testHistoryItem?.timeSpent;
    const rank = testHistoryItem?.rank;
    const badge = testHistoryItem?.badge || test.badge;
    
    // Calculate difficulty match for user
    const userLevel = calculateUserLevel();
    const difficultyMatch = getDifficultyRecommendationScore(test.difficulty, userLevel);
    
    // Get contextual information
    const reasoning = recommendedTest?.reasoning;
    const contextualFit = recommendedTest?.contextualFit || 'medium';
    
    // Calculate estimated completion time based on user performance
    const userAvgScore = Object.values(testScores).reduce((sum, s) => sum + s, 0) / Object.values(testScores).length || 75;
    const difficultyMultiplier = {
      'Beginner': 0.8,
      'Intermediate': 1.0,
      'Advanced': 1.3,
      'Expert': 1.5
    }[test.difficulty] || 1.0;
    
    const estimatedTime = Math.round(test.duration * difficultyMultiplier * (userAvgScore < 70 ? 1.2 : userAvgScore > 85 ? 0.9 : 1.0));
    
    return {
      // Basic status
      isCompleted,
      score,
      isFavorite,
      isBookmarked,
      isRecommended,
      isPassed,
      
      // Enhanced information
      attempts,
      lastAttemptDate,
      timeSpent,
      rank,
      badge,
      difficultyMatch,
      reasoning,
      contextualFit,
      estimatedTime,
      
      // User fit analysis
      skillMatch: test.skills ? test.skills.filter(skill => 
        Array.from(favoriteTests).some(fId => {
          const fTest = tests.find(t => t.id === fId);
          return fTest?.skills?.includes(skill);
        })
      ).length / test.skills.length : 0,
      
      // Prerequisites check
      hasPrerequisites: test.prerequisites && test.prerequisites.length > 0,
      prerequisitesMet: test.prerequisites ? test.prerequisites.every(prereq => {
        // Check if user has completed prerequisite skills/tests
        return Object.values(userProgress).flat().some(testId => {
          const completedTest = tests.find(t => t.id === testId);
          return completedTest?.skills?.some(skill => 
            skill.toLowerCase().includes(prereq.toLowerCase())
          );
        });
      }) : true,
      
      // Trending and popularity info
      trending: test.trending || test.popularity > 1000,
      popularityRank: test.popularity > 2000 ? 'high' : test.popularity > 1000 ? 'medium' : 'low',
      
      // Certification info
      earnsBadge: !!test.badge,
      verificationLevel: test.verificationLevel,
      
      // Performance prediction
      predictedScore: score || estimatedTime, // Placeholder for ML prediction
      confidenceLevel: isCompleted ? 'high' : difficultyMatch > 0.7 ? 'medium' : 'low'
    };
  }, [
    userProgress, 
    testScores, 
    favoriteTests, 
    bookmarkedTests, 
    recommendedTests, 
    testHistory, 
    tests,
    calculateUserLevel,
    getDifficultyRecommendationScore
  ]);

  // Render stats dashboard
  const renderStatsCard = () => {
    const insights = getPerformanceInsights();
    if (!insights) return null;

    return (
      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View style={styles.statsHeaderLeft}>
            <Text style={styles.statsTitle}>SkillNet Progress</Text>
            <Badge text="Verified Profile" variant="primary" size="small" />
          </View>
          <TouchableOpacity onPress={() => setShowStats(!showStats)}>
            <Ionicons 
              name={showStats ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Trust & Hirability Scores */}
        <View style={styles.trustScores}>
          <View style={styles.scoreItem}>
            <View style={styles.scoreHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.scoreLabel}>Trust Score</Text>
            </View>
            <Text style={[styles.scoreValue, { color: '#34C759' }]}>{trustScore}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <View style={styles.scoreHeader}>
              <Ionicons name="briefcase" size={16} color="#007AFF" />
              <Text style={styles.scoreLabel}>Hirability</Text>
            </View>
            <Text style={[styles.scoreValue, { color: '#007AFF' }]}>{hirabilityScore}%</Text>
          </View>
        </View>

        <View style={styles.statsQuickView}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Lv.{insights.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{verifiedBadges.length}</Text>
            <Text style={styles.statLabel}>Verified Badges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{insights.streak}🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(roadmapProgress).length}</Text>
            <Text style={styles.statLabel}>Roadmaps</Text>
          </View>
        </View>

        {showStats && (
          <View style={styles.statsDetails}>
            {/* Verified Badges Section */}
            <View style={styles.badgesSection}>
              <Text style={styles.sectionLabel}>Latest Verified Badges</Text>
              <View style={styles.badgesList}>
                {verifiedBadges.slice(0, 3).map((badge, index) => (
                  <View key={badge.id} style={styles.verifiedBadge}>
                    <Ionicons name="medal" size={16} color="#FFD700" />
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                  </View>
                ))}
              </View>
            </View>

            {/* Roadmap Progress */}
            <View style={styles.roadmapSection}>
              <Text style={styles.sectionLabel}>Roadmap Progress</Text>
              {Object.entries(roadmapProgress).slice(0, 2).map(([roadmap, data]) => (
                <View key={roadmap} style={styles.roadmapItem}>
                  <View style={styles.roadmapHeader}>
                    <Text style={styles.roadmapName}>{roadmap.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.roadmapPercent}>{data.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${data.progress}%` }]} 
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Corporate Endorsements */}
            {corporateEndorsements.length > 0 && (
              <View style={styles.endorsementSection}>
                <Text style={styles.sectionLabel}>Corporate Endorsements</Text>
                <View style={styles.endorsementItem}>
                  <Ionicons name="business" size={16} color="#007AFF" />
                  <View style={styles.endorsementContent}>
                    <Text style={styles.endorsementCompany}>{corporateEndorsements[0].company}</Text>
                    <Text style={styles.endorsementSkill}>{corporateEndorsements[0].skill}</Text>
                  </View>
                  <Ionicons name="star" size={14} color="#FFD700" />
                </View>
              </View>
            )}

            {/* Performance Analytics */}
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Next Level Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${nextLevelProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{nextLevelProgress}%</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statsGridItem}>
                <Text style={styles.statsValue}>{insights.averageScore}%</Text>
                <Text style={styles.statsLabel}>Avg Score</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Text style={styles.statsValue}>{insights.totalCompleted}</Text>
                <Text style={styles.statsLabel}>Completed</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Text style={styles.statsValue}>#{leaderboardPosition}</Text>
                <Text style={styles.statsLabel}>Rank</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Text style={styles.statsValue}>{corporateEndorsements.length}</Text>
                <Text style={styles.statsLabel}>Endorsements</Text>
              </View>
            </View>

            {insights.improvement !== 0 && (
              <View style={styles.improvementBadge}>
                <Ionicons 
                  name={insights.improvement > 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={insights.improvement > 0 ? '#34C759' : '#FF3B30'} 
                />
                <Text style={[
                  styles.improvementText,
                  { color: insights.improvement > 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  {insights.improvement > 0 ? '+' : ''}{insights.improvement}% improvement trend
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    );
  };

  // Render category card
  const renderCategoryCard = ({ item: categoryKey }) => {
    if (categoryKey === 'All') return null;
    
    const category = categories[categoryKey];
    if (!category) return null;
    
    const categoryTests = tests.filter(test => test.category === categoryKey);
    const completedTests = userProgress[categoryKey] || [];
    const completionRate = categoryTests.length > 0 ? 
      Math.round((completedTests.length / categoryTests.length) * 100) : 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          { borderLeftColor: category.color || '#007AFF' },
          selectedCategory === categoryKey && styles.selectedCategoryCard
        ]}
        onPress={() => {
          setSelectedCategory(categoryKey);
          setShowCategories(false);
        }}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color || '#007AFF' }]}>
          <Ionicons name={category.icon || 'folder'} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryCount}>
            {categoryTests.length} tests • {completionRate}% completed
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
    );
  };

  // Render test card
  const renderTestCard = ({ item: test }) => {
    const status = getTestStatus(test);
    const category = categories[test.category];
    const relatedRoadmap = Object.keys(roadmapProgress).find(roadmap => 
      roadmap.toLowerCase().includes(test.category.toLowerCase()) ||
      test.skills?.some(skill => roadmap.toLowerCase().includes(skill.toLowerCase()))
    );
    const canEarnBadge = test.passingScore && !status.isCompleted;
    const earnedBadge = status.isCompleted && status.isPassed;
    
    return (
      <Card style={[
        styles.testCard,
        status.isCompleted && styles.completedTestCard,
        earnedBadge && styles.verifiedTestCard
      ]}>
        <View style={styles.testHeader}>
          <View style={styles.testHeaderLeft}>
            <View style={[
              styles.testTypeIcon, 
              { backgroundColor: category?.color || '#007AFF' }
            ]}>
              <Ionicons 
                name={status.isCompleted ? 'checkmark' : 'document-text'} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.testHeaderInfo}>
              <View style={styles.testTitleRow}>
                <Text style={styles.testTitle} numberOfLines={1}>
                  {status.isCompleted && '✅ '}{test.title}
                </Text>
                <View style={styles.testBadges}>
                  {status.isRecommended && (
                    <Badge text="Recommended" variant="primary" size="small" />
                  )}
                  {earnedBadge && (
                    <Badge text="Verified" variant="success" size="small" />
                  )}
                  {canEarnBadge && (
                    <Badge text="Badge Available" variant="outline" size="small" />
                  )}
                </View>
              </View>
              <View style={styles.testMetaRow}>
                <Text style={styles.testCategory}>{category?.name || test.category}</Text>
                {relatedRoadmap && (
                  <View style={styles.roadmapConnection}>
                    <Ionicons name="map" size={12} color="#007AFF" />
                    <Text style={styles.roadmapText}>
                      {relatedRoadmap.replace('_', ' ')} roadmap
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.testActions}>
            <TouchableOpacity 
              onPress={() => toggleBookmark(test.id)}
              style={styles.actionButton}
            >
              <Ionicons 
                name={status.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                size={20} 
                color={status.isBookmarked ? '#FF9500' : '#8E8E93'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => toggleFavorite(test.id)}
              style={styles.actionButton}
            >
              <Ionicons 
                name={status.isFavorite ? 'heart' : 'heart-outline'} 
                size={20} 
                color={status.isFavorite ? '#FF3B30' : '#8E8E93'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.testDescription} numberOfLines={2}>
          {test.description}
        </Text>

        <View style={styles.testDetails}>
          <View style={styles.testDetailItem}>
            <Ionicons name="time" size={16} color="#8E8E93" />
            <Text style={styles.testDetailText}>{test.duration} min</Text>
          </View>
          <View style={styles.testDetailItem}>
            <Ionicons name="help-circle" size={16} color="#8E8E93" />
            <Text style={styles.testDetailText}>{test.totalQuestions} questions</Text>
          </View>
          <View style={styles.testDetailItem}>
            <Badge 
              text={test.difficulty} 
              variant="outline" 
              size="small"
            />
          </View>
          {test.verificationLevel && (
            <View style={styles.testDetailItem}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.verificationText}>
                {test.verificationLevel === 'enterprise' ? 'Enterprise Verified' : 'Corporate Verified'}
              </Text>
            </View>
          )}
        </View>

        {/* Enterprise Features Indicators */}
        <View style={styles.enterpriseFeatures}>
          {test.aiProctored && (
            <View style={styles.featureItem}>
              <Ionicons name="eye" size={14} color="#FF6B6B" />
              <Text style={styles.featureText}>AI Proctored</Text>
            </View>
          )}
          {test.antiCheatEnabled && (
            <View style={styles.featureItem}>
              <Ionicons name="shield" size={14} color="#4ECDC4" />
              <Text style={styles.featureText}>Anti-Cheat</Text>
            </View>
          )}
          {test.blockchainVerified && (
            <View style={styles.featureItem}>
              <Ionicons name="link" size={14} color="#FFD93D" />
              <Text style={styles.featureText}>Blockchain Verified</Text>
            </View>
          )}
          {test.verificationLevel === 'enterprise' && (
            <View style={styles.featureItem}>
              <Ionicons name="business" size={14} color="#6C5CE7" />
              <Text style={styles.featureText}>Enterprise Grade</Text>
            </View>
          )}
        </View>

        {status.isCompleted && status.score && (
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.scoreText,
              { color: status.isPassed ? '#34C759' : '#FF3B30' }
            ]}>
              Score: {status.score}% {status.isPassed ? '✅' : '❌'}
            </Text>
            {earnedBadge && (
              <View style={styles.badgeEarned}>
                <Ionicons name="medal" size={16} color="#FFD700" />
                <Text style={styles.badgeEarnedText}>Verified Badge Earned!</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.testSkills}>
          {(test.skills || []).slice(0, 3).map((skill, index) => (
            <Badge key={index} text={skill} variant="secondary" size="small" />
          ))}
          {test.skills && test.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{test.skills.length - 3} more</Text>
          )}
        </View>

        <Button
          title={status.isCompleted ? "Retake Test" : "Start Verification Test"}
          variant={status.isCompleted ? "outline" : "primary"}
          onPress={() => startTest(test)}
          style={styles.startButton}
        />
      </Card>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading tests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Skill Verification Tests</Text>
            <View style={styles.headerSubtitle}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.subtitleText}>Corporate-Verified Skills</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.trustScoreButton}
              onPress={() => {
                Alert.alert(
                  'Trust Score: ' + trustScore + '%',
                  'Your trust score is based on verified test results, corporate endorsements, and peer reviews.\n\n• Verified Tests: 85%\n• Corporate Endorsements: 90%\n• Peer Reviews: 80%',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color="#34C759" />
              <Text style={styles.trustScoreText}>{trustScore}%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.viewModeButton}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              <Ionicons 
                name={viewMode === 'list' ? 'grid' : 'list'} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tests, skills, or topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                <>
                  <Text style={styles.suggestionHeader}>Suggestions</Text>
                  {searchSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setSearchQuery(suggestion.text);
                        setShowSuggestions(false);
                        // Add to recent searches
                        setRecentSearches(prev => {
                          const newRecent = [suggestion.text, ...prev.filter(s => s !== suggestion.text)].slice(0, 5);
                          return newRecent;
                        });
                      }}
                    >
                      <Ionicons name={suggestion.icon} size={16} color="#8E8E93" />
                      <Text style={styles.suggestionText}>{suggestion.text}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              
              {searchQuery.length < 2 && recentSearches.length > 0 && (
                <>
                  <Text style={styles.suggestionHeader}>Recent Searches</Text>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setSearchQuery(search);
                        setShowSuggestions(false);
                      }}
                    >
                      <Ionicons name="time" size={16} color="#8E8E93" />
                      <Text style={styles.suggestionText}>{search}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setRecentSearches(prev => prev.filter(s => s !== search));
                        }}
                        style={styles.removeRecentButton}
                      >
                        <Ionicons name="close" size={14} color="#8E8E93" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Category:</Text>
                <TouchableOpacity 
                  style={[
                    styles.filterChip, 
                    selectedCategory === 'All' && styles.activeFilterChip
                  ]}
                  onPress={() => setSelectedCategory('All')}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === 'All' && styles.activeFilterChipText
                  ]}>All</Text>
                </TouchableOpacity>
                {Object.keys(categories).map(categoryKey => (
                  <TouchableOpacity 
                    key={categoryKey}
                    style={[
                      styles.filterChip, 
                      selectedCategory === categoryKey && styles.activeFilterChip
                    ]}
                    onPress={() => setSelectedCategory(categoryKey)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategory === categoryKey && styles.activeFilterChipText
                    ]}>{categories[categoryKey]?.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Content */}
      {showCategories ? (
        <ScrollView
          contentContainerStyle={styles.categoriesContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderStatsCard()}
          
          {/* Quick Access Section */}
          <Card style={styles.quickAccessCard}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickAccessButtons}>
              <TouchableOpacity 
                style={styles.quickAccessButton}
                onPress={() => {
                  if (recommendedTests.length > 0) {
                    setFilteredTests(recommendedTests);
                    setShowCategories(false);
                  }
                }}
              >
                <Ionicons name="star" size={24} color="#FF9500" />
                <Text style={styles.quickAccessText}>Recommended</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessButton}
                onPress={() => {
                  const bookmarked = tests.filter(test => bookmarkedTests.has(test.id));
                  setFilteredTests(bookmarked);
                  setShowCategories(false);
                }}
              >
                <Ionicons name="bookmark" size={24} color="#007AFF" />
                <Text style={styles.quickAccessText}>Bookmarked</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessButton}
                onPress={() => {
                  const favorites = tests.filter(test => favoriteTests.has(test.id));
                  setFilteredTests(favorites);
                  setShowCategories(false);
                }}
              >
                <Ionicons name="heart" size={24} color="#FF3B30" />
                <Text style={styles.quickAccessText}>Favorites</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessButton}
                onPress={() => {
                  const completed = tests.filter(test => 
                    userProgress[test.category]?.includes(test.id)
                  );
                  setFilteredTests(completed);
                  setShowCategories(false);
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.quickAccessText}>Completed</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <FlatList
            data={categoryOptions}
            renderItem={renderCategoryCard}
            keyExtractor={item => item}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredTests}
          renderItem={renderTestCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.testsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No tests found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          }
        />
      )}

      {/* Back to Categories Button */}
      {!showCategories && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowCategories(true)}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Categories</Text>
        </TouchableOpacity>
      )}

      {/* Floating Quick Actions */}
      <View style={styles.floatingActions}>
        {/* Daily Goal Progress */}
        <TouchableOpacity 
          style={[styles.floatingActionButton, { backgroundColor: '#FF9500' }]}
          onPress={async () => {
            const todayTests = Object.values(userProgress).flat().length;
            const progress = Math.min((todayTests / dailyGoal) * 100, 100);
            
            await triggerHaptic('light');
            Alert.alert(
              '🎯 Daily Goal Progress',
              `Today: ${todayTests}/${dailyGoal} tests completed\nProgress: ${Math.round(progress)}%\n\n${progress >= 100 ? '🎉 Goal achieved!' : `${dailyGoal - todayTests} tests to go!`}`,
              [
                { text: 'Adjust Goal', onPress: () => {
                  Alert.prompt(
                    'Set Daily Goal',
                    'How many tests would you like to complete daily?',
                    (text) => {
                      const newGoal = parseInt(text);
                      if (newGoal && newGoal > 0) {
                        setDailyGoal(newGoal);
                        saveUserData('daily_goal', newGoal);
                      }
                    },
                    'numeric',
                    dailyGoal.toString()
                  );
                }},
                { text: 'OK' }
              ]
            );
          }}
        >
          <Ionicons name="golf" size={24} color="#FFFFFF" />
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {Object.values(userProgress).flat().length}/{dailyGoal}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Share */}
        <TouchableOpacity 
          style={[styles.floatingActionButton, { backgroundColor: '#34C759' }]}
          onPress={async () => {
            await triggerHaptic('medium');
            const achievements = unlockedAchievements.length;
            const completedTests = Object.values(userProgress).flat().length;
            const trustLevel = trustScore >= 90 ? 'Expert' : trustScore >= 75 ? 'Advanced' : trustScore >= 60 ? 'Intermediate' : 'Beginner';
            
            const shareMessage = `🚀 Just crushed another skill test on SkillNet!\n\n📊 My Stats:\n✅ ${completedTests} tests completed\n� ${achievements} achievements unlocked\n🛡️ ${trustScore}% trust score (${trustLevel})\n💎 Level ${currentLevel}\n\nJoin me on SkillNet - where your skills get verified! 💼\n\n#SkillNet #VerifiedSkills #CareerGrowth`;
            
            try {
              await Share.share({
                message: shareMessage,
                title: 'My SkillNet Progress!'
              });
              
              await addXP(50, 'sharing_progress');
              await trackAdvancedEvent('progress_shared', {
                completed_tests: completedTests,
                achievements,
                trust_score: trustScore,
                user_level: currentLevel
              });
            } catch (error) {
              console.error('Share error:', error);
            }
          }}
        >
          <Ionicons name="share-social" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Voice Search */}
        {voiceSearchEnabled && (
          <TouchableOpacity 
            style={[styles.floatingActionButton, { backgroundColor: '#FF3B30' }]}
            onPress={async () => {
              await triggerHaptic('heavy');
              Alert.alert(
                '🎤 Voice Search',
                'Voice search feature coming soon!\n\nSay things like:\n• "Find JavaScript tests"\n• "Show me beginner level"\n• "React developer tests"',
                [{ text: 'Got it!' }]
              );
            }}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Leaderboard */}
        <TouchableOpacity 
          style={styles.floatingActionButton}
          onPress={async () => {
            await triggerHaptic('light');
            setLeaderboardVisible(true);
            await trackAdvancedEvent('leaderboard_viewed');
          }}
        >
          <Ionicons name="trophy" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Random Test Challenge */}
        <TouchableOpacity 
          style={[styles.floatingActionButton, { backgroundColor: '#007AFF' }]}
          onPress={async () => {
            await triggerHaptic('medium');
            Alert.alert(
              '🎲 Random Challenge',
              'Take a surprise test to earn bonus XP and test your versatility!',
              [
                { text: 'Maybe Later', style: 'cancel' },
                { 
                  text: 'I\'m Ready!', 
                  onPress: async () => {
                    const uncompletedTests = tests.filter(test => 
                      !userProgress[test.category]?.includes(test.id)
                    );
                    const randomTest = uncompletedTests[Math.floor(Math.random() * uncompletedTests.length)];
                    
                    if (randomTest) {
                      await addXP(25, 'accepting_random_challenge');
                      await trackAdvancedEvent('random_challenge_accepted', {
                        test_id: randomTest.id,
                        test_category: randomTest.category
                      });
                      startTest(randomTest);
                    } else {
                      Alert.alert('🎉 Amazing!', 'You\'ve completed all available tests! More coming soon.');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="shuffle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Leaderboard Modal */}
      <Modal
        visible={leaderboardVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏆 Leaderboard</Text>
            <TouchableOpacity 
              onPress={() => setLeaderboardVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>🥇 #1</Text>
              <Text style={styles.leaderboardName}>Alex Chen</Text>
              <Text style={styles.leaderboardScore}>2,847 XP</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>🥈 #2</Text>
              <Text style={styles.leaderboardName}>Sarah Johnson</Text>
              <Text style={styles.leaderboardScore}>2,651 XP</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>🥉 #3</Text>
              <Text style={styles.leaderboardName}>Mike Rodriguez</Text>
              <Text style={styles.leaderboardScore}>2,423 XP</Text>
            </View>
            <View style={[styles.leaderboardItem, styles.currentUserItem]}>
              <Text style={styles.leaderboardRank}>#{leaderboardPosition}</Text>
              <Text style={styles.leaderboardName}>You</Text>
              <Text style={styles.leaderboardScore}>{currentXP} XP</Text>
            </View>
            
            <Text style={styles.leaderboardNote}>
              🔥 Rankings update daily based on XP earned from verified test completions and achievements!
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  // Enhanced search styles
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  suggestionType: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  recentSearchesSection: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
  },
  // Enhanced recommendations styles
  recommendationsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recommendationsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  recommendationCompany: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 12,
    lineHeight: 16,
  },
  recommendationScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Performance stats styles
  performanceSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitleText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  trustScoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  trustScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34C759',
  },
  viewModeButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  removeRecentButton: {
    padding: 4,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#000000',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  statsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  badgesList: {
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  badgeName: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  roadmapSection: {
    marginBottom: 16,
  },
  roadmapItem: {
    marginBottom: 8,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roadmapName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  roadmapPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  endorsementSection: {
    marginBottom: 16,
  },
  endorsementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  endorsementContent: {
    flex: 1,
  },
  endorsementCompany: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  endorsementSkill: {
    fontSize: 10,
    color: '#666666',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statsQuickView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickAccessCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    minWidth: 70,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  testsContainer: {
    padding: 16,
  },
  testCard: {
    marginBottom: 16,
  },
  completedTestCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#34C759',
    borderWidth: 1,
  },
  verifiedTestCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testHeaderInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  testBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  testMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roadmapConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roadmapText: {
    fontSize: 10,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  testCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  testActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  testDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testDetailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  verificationText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  enterpriseFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  badgeEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  badgeEarnedText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  moreSkills: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'center',
  },
  startButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    gap: 12,
  },
  floatingActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  progressIndicator: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  // Leaderboard styles
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    width: 60,
  },
  leaderboardName: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    marginLeft: 12,
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  leaderboardNote: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  // Enhanced search styles
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  suggestionType: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  recentSearchesSection: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
  },
});

export default TestsScreen;
