import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';

// Services
import testService from '../../../services/testService';

const { width } = Dimensions.get('window');

const TestsScreen = () => {
  const navigation = useNavigation();
  
  // Core state
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // User data
  const [userProgress, setUserProgress] = useState({});
  const [favoriteTests, setFavoriteTests] = useState(new Set());
  const [testScores, setTestScores] = useState({});
  
  // Search functionality
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Memoized data
  const categories = useMemo(() => {
    try {
      return testService.getTestCategories() || {};
    } catch (error) {
      console.error('Error getting categories:', error);
      return {};
    }
  }, []);

  const categoryOptions = useMemo(() => ['All', ...Object.keys(categories)], [categories]);
  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const typeOptions = ['All', 'MCQ', 'Coding', 'Project', 'Secured Only'];

  // Load tests
  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      const availableTests = testService.getAvailableTests();
      setTests(availableTests);
      console.log(`Loaded ${availableTests.length} tests successfully`);
    } catch (error) {
      console.error('Error loading tests:', error);
      Alert.alert('Error', 'Failed to load tests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUserData = useCallback(() => {
    try {
      // Simulate user data loading
      setUserProgress({
        'CSE': ['cse_003', 'cse_005'],
        'BBA': ['bba_002'],
        'EEE': ['eee_001']
      });
      setFavoriteTests(new Set(['cse_003', 'bba_002', 'eee_001']));
      setTestScores({
        'cse_003': 95,
        'cse_005': 87,
        'bba_002': 88,
        'eee_001': 78
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Filter and sort tests
  const filterAndSortTests = useCallback(() => {
    try {
      let filtered = [...tests];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(test =>
          test.title.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.skills.some(skill => skill.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(test => test.category === selectedCategory);
      }

      // Apply difficulty filter
      if (selectedDifficulty !== 'All') {
        filtered = filtered.filter(test => test.difficulty === selectedDifficulty);
      }

      // Apply type filter
      if (selectedType !== 'All') {
        if (selectedType === 'Secured Only') {
          // Filter for MCQ tests with security features
          filtered = filtered.filter(test => 
            test.type === 'MCQ' || (test.questions && test.questions[0]?.options)
          );
        } else {
          filtered = filtered.filter(test => test.type === selectedType);
        }
      }

      // Sort tests
      switch (sortBy) {
        case 'popularity':
          filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'alphabetical':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          // Keep default order for 'recommended'
          break;
      }

      setFilteredTests(filtered);
    } catch (error) {
      console.error('Error filtering tests:', error);
      setFilteredTests([]);
    }
  }, [tests, searchQuery, selectedCategory, selectedDifficulty, selectedType, sortBy]);

  // Handle test start with enhanced security warnings for MCQ
  const startTest = useCallback((test) => {
    const isCompleted = userProgress[test.category]?.includes(test.id);
    const previousScore = testScores[test.id];
    const isMCQ = test.type === 'MCQ' || (test.questions && test.questions[0]?.options);
    
    // Enhanced security warning for MCQ tests
    const securityMessage = isMCQ ? 
      '\n\n🔒 SECURITY NOTICE:\n• Fullscreen mode required\n• Tab switching will restart test\n• Copy/paste disabled\n• Webcam monitoring active\n• Maximum 1 restart allowed' : '';
    
    Alert.alert(
      isCompleted ? 'Retake Test' : 'Start Test',
      `${isCompleted ? 'Retake' : 'Start'} ${test.title}?\n\nDuration: ${test.duration} minutes\nQuestions: ${test.totalQuestions}${previousScore ? `\nPrevious Score: ${previousScore}%` : ''}${securityMessage}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isCompleted ? 'Retake' : 'Start',
          onPress: () => {
            // Navigate to appropriate test screen based on test type
            if (test.type === 'MCQ' || isMCQ) {
              navigation.navigate('MCQTest', { test });
            } else if (test.type === 'Coding') {
              navigation.navigate('CodingTest', { test });
            } else if (test.type === 'Project') {
              navigation.navigate('ProjectUpload', { test });
            } else {
              // Default to MCQ for unknown types
              navigation.navigate('MCQTest', { test });
            }
          }
        }
      ]
    );
  }, [userProgress, testScores, navigation]);

  // Toggle favorite
  const toggleFavorite = useCallback((testId) => {
    setFavoriteTests(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(testId)) {
        newFavorites.delete(testId);
      } else {
        newFavorites.add(testId);
      }
      return newFavorites;
    });
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTests();
      loadUserData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadTests, loadUserData]);

  // Search suggestions
  const generateSearchSuggestions = useCallback((query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Add matching test titles
    tests.forEach(test => {
      if (test.title.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'test',
          text: test.title,
          icon: 'document-text'
        });
      }
    });

    // Add matching skills
    const allSkills = [...new Set(tests.flatMap(test => test.skills || []))];
    allSkills.forEach(skill => {
      if (skill.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'skill',
          text: skill,
          icon: 'code-slash'
        });
      }
    });

    setSearchSuggestions(suggestions.slice(0, 5));
  }, [tests]);

  // Effects
  useEffect(() => {
    loadTests();
    loadUserData();
    
    // Listen for navigation focus to refresh data when returning from tests
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh user data when screen comes into focus
      loadUserData();
    });

    return unsubscribe;
  }, [loadTests, loadUserData, navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterAndSortTests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterAndSortTests]);

  useEffect(() => {
    generateSearchSuggestions(searchQuery);
    setShowSuggestions(searchQuery.length >= 2);
  }, [searchQuery, generateSearchSuggestions]);

  // Get test status
  const getTestStatus = useCallback((test) => {
    const isCompleted = userProgress[test.category]?.includes(test.id);
    const score = testScores[test.id];
    const isFavorite = favoriteTests.has(test.id);
    
    return {
      isCompleted,
      score,
      isFavorite,
      isPassed: score >= test.passingScore
    };
  }, [userProgress, testScores, favoriteTests]);

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
    
    return (
      <Card style={[
        styles.testCard,
        status.isCompleted && styles.completedTestCard
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
                {/* Security Badge for MCQ Tests */}
                {(test.type === 'MCQ' || (test.questions && test.questions[0]?.options)) && (
                  <View style={styles.securityBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#007AFF" />
                    <Text style={styles.securityBadgeText}>SECURE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.testCategory}>{category?.name || test.category}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => toggleFavorite(test.id)}
            style={styles.favoriteButton}
          >
            <Ionicons 
              name={status.isFavorite ? 'heart' : 'heart-outline'} 
              size={20} 
              color={status.isFavorite ? '#FF3B30' : '#8E8E93'} 
            />
          </TouchableOpacity>
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
          {/* MCQ Security Indicator */}
          {(test.type === 'MCQ' || (test.questions && test.questions[0]?.options)) && (
            <View style={styles.testDetailItem}>
              <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
              <Text style={[styles.testDetailText, { color: '#007AFF', fontWeight: '600' }]}>
                Secured
              </Text>
            </View>
          )}
        </View>

        {/* MCQ Security Notice */}
        {(test.type === 'MCQ' || (test.questions && test.questions[0]?.options)) && (
          <View style={styles.securityNotice}>
            <View style={styles.securityNoticeHeader}>
              <Ionicons name="lock-closed" size={14} color="#007AFF" />
              <Text style={styles.securityNoticeTitle}>Proctored Assessment</Text>
            </View>
            <Text style={styles.securityNoticeText}>
              Anti-cheat monitoring • Fullscreen required • Identity verification
            </Text>
          </View>
        )}

        {status.isCompleted && status.score && (
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.scoreText,
              { color: status.isPassed ? '#34C759' : '#FF3B30' }
            ]}>
              Score: {status.score}% {status.isPassed ? '✅' : '❌'}
            </Text>
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
          title={status.isCompleted ? "Retake Test" : "Start Test"}
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
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>SkillNet Tests</Text>
            <Text style={styles.headerSubtitle}>Discover • Learn • Excel</Text>
          </View>
          <View style={styles.headerActions}>
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
      </View>

      {/* Quick Access Section */}
      <View style={styles.quickAccessContainer}>
        <Text style={styles.quickAccessTitle}>Quick Access</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickAccessScroll}
          contentContainerStyle={styles.quickAccessContent}
        >
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setSelectedType('Secured Only')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickAccessLabel}>Secured Tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setSelectedCategory('PSYCHOMETRIC')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#6C5CE7' }]}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickAccessLabel}>Personality</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setSelectedCategory('FRONTEND')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="code-slash" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickAccessLabel}>Frontend</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setSelectedCategory('BUSINESS')}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="briefcase" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickAccessLabel}>Business</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => {
              // Show recently taken tests
              const recentTests = tests.filter(test => 
                Object.keys(userProgress).some(category => 
                  userProgress[category]?.includes(test.id)
                )
              ).slice(0, 5);
              Alert.alert('Recent Tests', `You've completed ${recentTests.length} tests recently`);
            }}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#FF3B30' }]}>
              <Ionicons name="time" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.quickAccessLabel}>Recent</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Security Stats Summary */}
      <View style={styles.securityStats}>
        <View style={styles.securityStatItem}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.securityStatText}>
            {tests.filter(test => test.type === 'MCQ' || (test.questions && test.questions[0]?.options)).length} Secured Tests
          </Text>
        </View>
        <View style={styles.securityStatItem}>
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.securityStatText}>Anti-Cheat Active</Text>
        </View>
        <View style={styles.securityStatItem}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.securityStatText}>Identity Verified</Text>
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
          {showSuggestions && searchSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(suggestion.text);
                    setShowSuggestions(false);
                  }}
                >
                  <Ionicons name={suggestion.icon} size={16} color="#8E8E93" />
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </TouchableOpacity>
              ))}
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
        <FlatList
          data={categoryOptions}
          renderItem={renderCategoryCard}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoriesContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    alignItems: 'flex-start',
    paddingTop: 16,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  securityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  securityStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityStatText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    letterSpacing: 0.1,
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
  suggestionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 2,
  },
  securityBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  testCategory: {
    fontSize: 14,
    color: '#8E8E93',
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
  securityNotice: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  securityNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  securityNoticeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
  securityNoticeText: {
    fontSize: 11,
    color: '#007AFF',
    lineHeight: 14,
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
  // Quick Access Styles
  quickAccessContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  quickAccessScroll: {
    marginHorizontal: -4,
  },
  quickAccessContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  quickAccessCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAccessLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default TestsScreen;
