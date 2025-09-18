import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Card from './Card';
import HeatmapProgress from './HeatmapProgress';

const { width } = Dimensions.get('window');

const ProgressStatsPanel = ({ 
  userProgress, 
  insights, 
  nextMilestones, 
  onMilestonePress,
  style 
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [animatedValues] = useState({
    xp: new Animated.Value(0),
    streak: new Animated.Value(0),
    badges: new Animated.Value(0)
  });

  useEffect(() => {
    // Animate stats on mount
    Animated.parallel([
      Animated.timing(animatedValues.xp, {
        toValue: userProgress.totalXP || 0,
        duration: 1000,
        useNativeDriver: false
      }),
      Animated.timing(animatedValues.streak, {
        toValue: userProgress.currentStreak || 0,
        duration: 800,
        useNativeDriver: false
      }),
      Animated.timing(animatedValues.badges, {
        toValue: userProgress.totalBadges || 0,
        duration: 600,
        useNativeDriver: false
      })
    ]).start();
  }, [userProgress]);

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'stats-chart' },
    { id: 'milestones', title: 'Goals', icon: 'trophy' },
    { id: 'insights', title: 'Insights', icon: 'bulb' }
  ];

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            selectedTab === tab.id && styles.activeTab
          ]}
          onPress={() => setSelectedTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon} 
            size={16} 
            color={selectedTab === tab.id ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === tab.id && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Main Stats */}
      <View style={styles.statsGrid}>
        {/* XP Card */}
        <Card style={styles.statCard}>
          <LinearGradient
            colors={['#007AFF', '#0056CC']}
            style={styles.statGradient}
          >
            <View style={styles.statContent}>
              <Ionicons name="flash" size={24} color="#fff" />
              <Animated.Text style={styles.statValue}>
                {animatedValues.xp}
              </Animated.Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Streak Card */}
        <Card style={styles.statCard}>
          <LinearGradient
            colors={['#FF6B35', '#FF4500']}
            style={styles.statGradient}
          >
            <View style={styles.statContent}>
              <Ionicons name="flame" size={24} color="#fff" />
              <Animated.Text style={styles.statValue}>
                {animatedValues.streak}
              </Animated.Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Badges Card */}
        <Card style={styles.statCard}>
          <LinearGradient
            colors={['#34C759', '#28A745']}
            style={styles.statGradient}
          >
            <View style={styles.statContent}>
              <Ionicons name="ribbon" size={24} color="#fff" />
              <Animated.Text style={styles.statValue}>
                {animatedValues.badges}
              </Animated.Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </LinearGradient>
        </Card>
      </View>

      {/* Weekly Activity Summary */}
      <Card style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>This Week's Activity</Text>
          <View style={styles.activityBadge}>
            <Text style={styles.activityBadgeText}>
              {userProgress.weeklyActiveDays || 0}/7 days
            </Text>
          </View>
        </View>
        
        <View style={styles.weeklyBars}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const activity = userProgress.weeklyActivity?.[index] || 0;
            const height = Math.max(4, (activity / 4) * 40);
            
            return (
              <View key={day} style={styles.dayColumn}>
                <View 
                  style={[
                    styles.activityBar,
                    { 
                      height,
                      backgroundColor: activity > 0 ? '#007AFF' : '#E5E5EA'
                    }
                  ]} 
                />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Learning Heatmap */}
      {userProgress.heatmapData && (
        <Card style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Learning Activity</Text>
          <HeatmapProgress
            data={userProgress.heatmapData}
            size="large"
            showLabels={true}
            showStats={true}
          />
        </Card>
      )}
    </ScrollView>
  );

  const renderMilestonesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Next Goals</Text>
      
      {nextMilestones?.map((milestone, index) => (
        <TouchableOpacity
          key={`${milestone.type}-${index}`}
          style={styles.milestoneCard}
          onPress={() => onMilestonePress?.(milestone)}
        >
          <Card style={styles.milestoneCardInner}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </View>
              <View style={styles.milestoneProgress}>
                <Text style={styles.progressText}>
                  {milestone.current}/{milestone.threshold}
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={getMilestoneColors(milestone.type)}
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, milestone.progress * 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(milestone.progress * 100)}%
              </Text>
            </View>
            
            {milestone.remaining > 0 && (
              <Text style={styles.remainingText}>
                {milestone.remaining} more to go!
              </Text>
            )}
          </Card>
        </TouchableOpacity>
      ))}
      
      {(!nextMilestones || nextMilestones.length === 0) && (
        <Card style={styles.emptyState}>
          <Ionicons name="trophy" size={48} color="#E5E5EA" />
          <Text style={styles.emptyStateText}>All caught up!</Text>
          <Text style={styles.emptyStateSubtext}>
            You're making great progress. Keep learning to unlock new goals!
          </Text>
        </Card>
      )}
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Learning Insights</Text>
      
      {insights?.map((insight, index) => (
        <Card key={index} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightMessage}>{insight.message}</Text>
            </View>
          </View>
        </Card>
      ))}
      
      {(!insights || insights.length === 0) && (
        <Card style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color="#E5E5EA" />
          <Text style={styles.emptyStateText}>Building insights...</Text>
          <Text style={styles.emptyStateSubtext}>
            Keep learning to get personalized insights about your progress!
          </Text>
        </Card>
      )}

      {/* Performance Trends */}
      <Card style={styles.trendsCard}>
        <Text style={styles.trendsTitle}>Performance Trends</Text>
        <View style={styles.trendsContent}>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Avg. Test Score</Text>
            <Text style={styles.trendValue}>
              {userProgress.avgTestScore ? `${Math.round(userProgress.avgTestScore)}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Study Time</Text>
            <Text style={styles.trendValue}>
              {userProgress.weeklyStudyTime ? `${userProgress.weeklyStudyTime}h` : 'N/A'}
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Completion Rate</Text>
            <Text style={styles.trendValue}>
              {userProgress.completionRate ? `${Math.round(userProgress.completionRate)}%` : 'N/A'}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const getMilestoneColors = (type) => {
    switch (type) {
      case 'xp': return ['#007AFF', '#0056CC'];
      case 'streak': return ['#FF6B35', '#FF4500'];
      case 'badge': return ['#34C759', '#28A745'];
      case 'roadmap': return ['#AF52DE', '#8E44AD'];
      case 'test': return ['#FF9500', '#FF8C00'];
      default: return ['#8E8E93', '#6D6D70'];
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverviewTab();
      case 'milestones': return renderMilestonesTab();
      case 'insights': return renderInsightsTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderTabHeader()}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Tab Header
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Tab Content
  tabContent: {
    maxHeight: 400,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 16,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  // Activity Card
  activityCard: {
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
  },
  activityBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  activityBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Heatmap Card
  heatmapCard: {
    marginBottom: 16,
  },
  
  // Milestone Cards
  milestoneCard: {
    marginBottom: 12,
  },
  milestoneCardInner: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
  },
  milestoneDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  milestoneProgress: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    minWidth: 35,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Insight Cards
  insightCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D29',
  },
  insightMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  
  // Trends Card
  trendsCard: {
    marginTop: 8,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 12,
  },
  trendsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
    textAlign: 'center',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default ProgressStatsPanel;
