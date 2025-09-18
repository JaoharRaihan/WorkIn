import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const { width } = Dimensions.get('window');

const TestAnalyticsScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = () => {
    // Mock analytics data - in real app, fetch from API
    const mockData = {
      overview: {
        testsAttempted: 12,
        testsCompleted: 8,
        averageScore: 84,
        timeSpent: 15.5, // hours
        badgesEarned: 6,
        skillsVerified: 4,
        rank: 28,
        improvementRate: 12 // percentage
      },
      performanceByCategory: [
        { category: 'Frontend', tests: 4, avgScore: 88, bestScore: 95, trend: 'up' },
        { category: 'Backend', tests: 2, avgScore: 75, bestScore: 82, trend: 'stable' },
        { category: 'Programming', tests: 3, avgScore: 91, bestScore: 98, trend: 'up' },
        { category: 'Data Science', tests: 1, avgScore: 78, bestScore: 78, trend: 'new' }
      ],
      scoreDistribution: [
        { range: '90-100%', count: 3, percentage: 37.5 },
        { range: '80-89%', count: 3, percentage: 37.5 },
        { range: '70-79%', count: 2, percentage: 25 },
        { range: '60-69%', count: 0, percentage: 0 },
        { range: '<60%', count: 0, percentage: 0 }
      ],
      weeklyProgress: [
        { week: 'Week 1', tests: 2, avgScore: 75 },
        { week: 'Week 2', tests: 3, avgScore: 82 },
        { week: 'Week 3', tests: 2, avgScore: 88 },
        { week: 'Week 4', tests: 1, avgScore: 95 }
      ],
      strengths: [
        'React Native Development',
        'JavaScript ES6+',
        'Algorithm Design',
        'Problem Solving'
      ],
      improvementAreas: [
        'Database Design',
        'System Architecture',
        'Performance Optimization'
      ],
      recommendations: [
        {
          type: 'skill',
          title: 'Focus on Backend Development',
          description: 'Your backend scores are lower than frontend. Consider taking Node.js fundamentals.',
          priority: 'high'
        },
        {
          type: 'practice',
          title: 'Algorithm Practice',
          description: 'Continue practicing algorithms to maintain your strong performance.',
          priority: 'medium'
        },
        {
          type: 'badge',
          title: 'Database Certification',
          description: 'Earn the Database Expert badge to round out your full-stack skills.',
          priority: 'low'
        }
      ]
    };
    
    setAnalyticsData(mockData);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return { name: 'trending-up', color: '#34C759' };
      case 'down': return { name: 'trending-down', color: '#FF3B30' };
      case 'stable': return { name: 'remove', color: '#FF9500' };
      case 'new': return { name: 'add-circle', color: '#007AFF' };
      default: return { name: 'remove', color: '#8E8E93' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.periodButton,
            selectedPeriod === period.id && styles.activePeriodButton
          ]}
          onPress={() => setSelectedPeriod(period.id)}
        >
          <Text style={[
            styles.periodText,
            selectedPeriod === period.id && styles.activePeriodText
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewStats = () => (
    <Card style={styles.overviewCard}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyticsData.overview.testsCompleted}</Text>
          <Text style={styles.statLabel}>Tests Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>
            {analyticsData.overview.averageScore}%
          </Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#34C759' }]}>
            {analyticsData.overview.badgesEarned}
          </Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>
            #{analyticsData.overview.rank}
          </Text>
          <Text style={styles.statLabel}>Global Rank</Text>
        </View>
      </View>
      
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Ionicons name="time" size={16} color="#8E8E93" />
          <Text style={styles.additionalStatText}>
            {analyticsData.overview.timeSpent}h total study time
          </Text>
        </View>
        <View style={styles.additionalStatItem}>
          <Ionicons name="trending-up" size={16} color="#34C759" />
          <Text style={styles.additionalStatText}>
            {analyticsData.overview.improvementRate}% improvement this period
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderCategoryPerformance = () => (
    <Card style={styles.categoryCard}>
      <Text style={styles.sectionTitle}>Performance by Category</Text>
      {analyticsData.performanceByCategory.map((category, index) => {
        const trendIcon = getTrendIcon(category.trend);
        return (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <View style={styles.categoryTrend}>
                <Ionicons 
                  name={trendIcon.name} 
                  size={16} 
                  color={trendIcon.color} 
                />
                <Text style={[styles.trendText, { color: trendIcon.color }]}>
                  {category.trend}
                </Text>
              </View>
            </View>
            
            <View style={styles.categoryStats}>
              <View style={styles.categoryStatItem}>
                <Text style={styles.categoryStatLabel}>Tests</Text>
                <Text style={styles.categoryStatValue}>{category.tests}</Text>
              </View>
              <View style={styles.categoryStatItem}>
                <Text style={styles.categoryStatLabel}>Avg Score</Text>
                <Text style={styles.categoryStatValue}>{category.avgScore}%</Text>
              </View>
              <View style={styles.categoryStatItem}>
                <Text style={styles.categoryStatLabel}>Best Score</Text>
                <Text style={styles.categoryStatValue}>{category.bestScore}%</Text>
              </View>
            </View>
            
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreBarFill, 
                  { width: `${category.avgScore}%` }
                ]} 
              />
            </View>
          </View>
        );
      })}
    </Card>
  );

  const renderScoreDistribution = () => (
    <Card style={styles.distributionCard}>
      <Text style={styles.sectionTitle}>Score Distribution</Text>
      {analyticsData.scoreDistribution.map((range, index) => (
        <View key={index} style={styles.distributionItem}>
          <Text style={styles.distributionRange}>{range.range}</Text>
          <View style={styles.distributionBarContainer}>
            <View style={styles.distributionBar}>
              <View 
                style={[
                  styles.distributionBarFill, 
                  { width: `${range.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.distributionCount}>{range.count}</Text>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderStrengthsAndWeaknesses = () => (
    <View style={styles.strengthsContainer}>
      <Card style={styles.strengthsCard}>
        <View style={styles.strengthsHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.strengthsTitle}>Strengths</Text>
        </View>
        {analyticsData.strengths.map((strength, index) => (
          <View key={index} style={styles.strengthItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.strengthText}>{strength}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.improvementCard}>
        <View style={styles.improvementHeader}>
          <Ionicons name="trending-up" size={20} color="#FF9500" />
          <Text style={styles.improvementTitle}>Areas for Improvement</Text>
        </View>
        {analyticsData.improvementAreas.map((area, index) => (
          <View key={index} style={styles.improvementItem}>
            <Ionicons name="arrow-up-circle" size={14} color="#FF9500" />
            <Text style={styles.improvementText}>{area}</Text>
          </View>
        ))}
      </Card>
    </View>
  );

  const renderRecommendations = () => (
    <Card style={styles.recommendationsCard}>
      <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
      {analyticsData.recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationTitleRow}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Badge 
                text={rec.priority} 
                variant={
                  rec.priority === 'high' ? 'danger' : 
                  rec.priority === 'medium' ? 'warning' : 'success'
                } 
                size="small" 
              />
            </View>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
          </View>
          <TouchableOpacity style={styles.recommendationAction}>
            <Text style={styles.recommendationActionText}>Take Action</Text>
            <Ionicons name="arrow-forward" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>
      ))}
    </Card>
  );

  if (!analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Test Analytics</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderOverviewStats()}
        {renderCategoryPerformance()}
        {renderScoreDistribution()}
        {renderStrengthsAndWeaknesses()}
        {renderRecommendations()}
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  activePeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  overviewCard: {
    margin: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalStatText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryStatItem: {
    alignItems: 'center',
  },
  categoryStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  categoryStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  distributionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    width: 80,
  },
  distributionBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 20,
    textAlign: 'right',
  },
  strengthsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  strengthsCard: {
    flex: 1,
  },
  strengthsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strengthsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  improvementCard: {
    flex: 1,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 8,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  recommendationsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  recommendationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationHeader: {
    marginBottom: 12,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  recommendationActionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 6,
  },
});

export default TestAnalyticsScreen;
