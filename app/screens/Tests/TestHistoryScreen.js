import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import Card from '../../components/Card';
import Badge from '../../components/Badge';

// Services
import TestHistoryService from '../../services/testHistoryService';

const TestHistoryScreen = () => {
  const navigation = useNavigation();
  const [testHistory, setTestHistory] = useState([]);
  const [testStats, setTestStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      
      // Load test history and stats from service
      const [history, stats, badgeData, leaderboardData] = await Promise.all([
        TestHistoryService.getTestHistory(),
        TestHistoryService.getTestStats(),
        TestHistoryService.getBadgesEarned(),
        TestHistoryService.getLeaderboardPosition(),
      ]);

      // If no history exists, add some mock data for demonstration
      if (history.length === 0) {
        const mockCompletions = [
          {
            testId: 1,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            score: 85,
            totalQuestions: 25,
            correctAnswers: 21,
            timeSpent: 28,
            difficulty: 'Beginner',
            badge: 'JavaScript Basic',
            pointsEarned: 100,
          },
          {
            testId: 2,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            score: 92,
            totalQuestions: 30,
            correctAnswers: 28,
            timeSpent: 42,
            difficulty: 'Intermediate',
            badge: 'React Developer',
            pointsEarned: 150,
          },
          {
            testId: 7,
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            score: 78,
            totalQuestions: 38,
            correctAnswers: 30,
            timeSpent: 55,
            difficulty: 'Intermediate',
            badge: 'Data Analyst',
            pointsEarned: 200,
          },
        ];

        for (const completion of mockCompletions) {
          await TestHistoryService.addTestCompletion(completion.testId, completion);
        }

        // Reload data after adding mock completions
        const [newHistory, newStats, newBadges, newLeaderboard] = await Promise.all([
          TestHistoryService.getTestHistory(),
          TestHistoryService.getTestStats(),
          TestHistoryService.getBadgesEarned(),
          TestHistoryService.getLeaderboardPosition(),
        ]);

        setTestHistory(newHistory);
        setTestStats(newStats);
        setBadges(newBadges);
        setLeaderboard(newLeaderboard);
      } else {
        setTestHistory(history);
        setTestStats(stats);
        setBadges(badgeData);
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTestHistory();
    setRefreshing(false);
  };

  const getTestNameById = (testId) => {
    const testNames = {
      1: 'JavaScript Fundamentals', 2: 'Advanced JavaScript', 3: 'React Development', 4: 'React Advanced Patterns',
      5: 'Node.js Backend', 6: 'Python Fundamentals', 7: 'Python Data Science', 8: 'UI/UX Design Principles',
      9: 'Advanced UX Research', 10: 'Figma Mastery', 11: 'Machine Learning Basics', 12: 'SQL Database Design',
      13: 'Docker Fundamentals', 14: 'Kubernetes Deployment', 15: 'AWS Cloud Basics', 16: 'Digital Marketing Strategy',
      17: 'Analytics & Data Insights', 18: 'Product Strategy Fundamentals', 19: 'Agile & Scrum Mastery', 20: 'Financial Analysis',
      21: 'Business Strategy', 22: 'Operations Management', 23: 'Network Security Fundamentals', 24: 'Ethical Hacking',
      25: 'Cloud Security', 26: 'React Native Development', 27: 'iOS Swift Development', 28: 'Android Kotlin Development',
      29: 'Deep Learning Fundamentals', 30: 'Computer Vision', 31: 'Natural Language Processing', 32: 'Healthcare Data Analytics',
      33: 'Telemedicine Technology', 34: 'Medical Device Software', 35: 'Blockchain & Cryptocurrency', 36: 'Algorithmic Trading',
      37: 'Payment Systems', 38: 'E-commerce Platform Development', 39: 'Digital Commerce Strategy', 40: 'Supply Chain Technology',
      41: 'Game Development Unity', 42: 'Game Design Principles', 43: 'Multiplayer Game Architecture', 44: 'Learning Management Systems',
      45: 'Educational Data Analytics', 46: 'Virtual Reality Education', 47: 'IoT Device Programming', 48: 'Industrial IoT Solutions',
      49: 'Smart Home Technology', 50: 'Sales Strategy & Process', 51: 'B2B Sales Technology', 52: 'Customer Success Management',
    };
    return testNames[testId] || `Test ${testId}`;
  };

  const filteredHistory = testHistory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'passed') return item.score >= 70;
    if (filter === 'failed') return item.score < 70;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score, passed) => {
    if (score >= 90) return '#34C759';
    if (score >= 80) return '#30D158';
    if (score >= 70) return '#FF9500';
    return '#FF3B30';
  };

  const renderFilterButton = (filterValue, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterValue && styles.activeFilterButtonText
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => {
    const passed = item.score >= 70;
    const testName = getTestNameById(item.testId);
    
    return (
      <Card style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>{testName}</Text>
            <View style={styles.testMeta}>
              <Badge 
                text={item.difficulty} 
                variant={
                  item.difficulty === 'Beginner' ? 'success' : 
                  item.difficulty === 'Intermediate' ? 'warning' : 
                  item.difficulty === 'Advanced' ? 'danger' : 'dark'
                } 
                size="small" 
              />
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.scoreText, 
              { color: getScoreColor(item.score, passed) }
            ]}>
              {item.score}%
            </Text>
            <Ionicons 
              name={passed ? 'checkmark-circle' : 'close-circle'} 
              size={20} 
              color={passed ? '#34C759' : '#FF3B30'} 
            />
          </View>
        </View>
        
        <View style={styles.attemptDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.completedAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{item.timeSpent} minutes</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Questions:</Text>
            <Text style={styles.detailValue}>
              {item.correctAnswers}/{item.totalQuestions} correct
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Points:</Text>
            <Text style={styles.detailValue}>+{item.pointsEarned} pts</Text>
          </View>
        </View>
        
        {passed && item.badge && (
          <View style={styles.badgeContainer}>
            <Ionicons name="medal" size={16} color="#FFD700" />
            <Text style={styles.badgeText}>Earned: {item.badge}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('TestDetail', { testId: item.testId })}
        >
          <Text style={styles.viewDetailsText}>View Test Details</Text>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
        </TouchableOpacity>
      </Card>
    );
  };

  const getDisplayStats = () => {
    if (testStats) {
      return {
        total: testStats.totalTests,
        passed: testStats.testsPassedCount,
        failed: testStats.totalTests - testStats.testsPassedCount,
        avgScore: testStats.averageScore,
        totalPoints: testStats.totalPointsEarned,
        totalTime: Math.round(testStats.totalTimeSpent / 60), // Convert to hours
      };
    }
    
    // Fallback calculation from testHistory
    const passed = testHistory.filter(item => item.score >= 70).length;
    const failed = testHistory.filter(item => item.score < 70).length;
    const avgScore = testHistory.length > 0 
      ? Math.round(testHistory.reduce((sum, item) => sum + item.score, 0) / testHistory.length)
      : 0;
    
    return { total: testHistory.length, passed, failed, avgScore, totalPoints: 0, totalTime: 0 };
  };

  const stats = getDisplayStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Test History</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Summary Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Performance Overview</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total Tests</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#34C759' }]}>
                {stats.passed}
              </Text>
              <Text style={styles.summaryLabel}>Passed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#FF3B30' }]}>
                {stats.failed}
              </Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#007AFF' }]}>
                {stats.avgScore}%
              </Text>
              <Text style={styles.summaryLabel}>Avg Score</Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Achievements</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#FFD700' }]}>
                {stats.totalPoints}
              </Text>
              <Text style={styles.summaryLabel}>Total Points</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#FF9500' }]}>
                {badges.length}
              </Text>
              <Text style={styles.summaryLabel}>Badges</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#9C27B0' }]}>
                {stats.totalTime}h
              </Text>
              <Text style={styles.summaryLabel}>Study Time</Text>
            </View>
            {leaderboard && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#E91E63' }]}>
                  #{leaderboard.position}
                </Text>
                <Text style={styles.summaryLabel}>Rank</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', stats.total)}
        {renderFilterButton('passed', 'Passed', stats.passed)}
        {renderFilterButton('failed', 'Failed', stats.failed)}
      </View>
      
      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No test history found</Text>
            <Text style={styles.emptySubtext}>
              Complete some tests to see your history here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    marginRight: 16,
    minWidth: 280,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  testMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attemptDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TestHistoryScreen;
