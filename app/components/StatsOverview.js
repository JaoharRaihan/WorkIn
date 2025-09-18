import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Context and Hooks
import { useProfile } from '../context/ProfileContext';
import { useUserStats, useProfileAnalytics } from '../hooks/useProfileHooks';

const { width } = Dimensions.get('window');

const StatsOverview = ({ onStatsPress }) => {
  const { stats, skills, projects, recentActivity } = useProfile();
  const { levelProgress, levelName, completeActivity } = useUserStats();
  const { weeklyLearningTrend, skillInsights, learningMomentum } = useProfileAnalytics();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const momentumAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: levelProgress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animate momentum score
    Animated.timing(momentumAnim, {
      toValue: learningMomentum,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [levelProgress, learningMomentum]);

  // Toggle detailed stats
  const toggleDetailedStats = () => {
    const toValue = showDetailedStats ? 0 : 1;
    setShowDetailedStats(!showDetailedStats);
    
    Animated.spring(detailsAnim, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Get momentum color
  const getMomentumColor = (score) => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    if (score >= 40) return '#FF6B35';
    return '#FF3B30';
  };

  // Get activity trend
  const getActivityTrend = () => {
    const recentWeek = recentActivity.filter(
      activity => new Date(activity.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const previousWeek = recentActivity.filter(
      activity => {
        const date = new Date(activity.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        return date < weekAgo && date > twoWeeksAgo;
      }
    );

    const change = recentWeek.length - previousWeek.length;
    return {
      value: change,
      percentage: previousWeek.length > 0 ? Math.round((change / previousWeek.length) * 100) : 0,
      isPositive: change >= 0
    };
  };

  const activityTrend = getActivityTrend();

  return (
    <View style={styles.container}>
      {/* Main Stats Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learning Analytics</Text>
        <TouchableOpacity 
          style={styles.detailsToggle}
          onPress={toggleDetailedStats}
        >
          <Text style={styles.detailsToggleText}>
            {showDetailedStats ? 'Less' : 'More'}
          </Text>
          <Ionicons 
            name={showDetailedStats ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Level Progress Card */}
      <View style={styles.levelCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.levelGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelContent}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {stats.currentLevel}</Text>
              <Text style={styles.levelName}>{levelName}</Text>
              <Text style={styles.xpText}>
                {stats.totalXP.toLocaleString()} XP
              </Text>
            </View>
            
            <View style={styles.levelProgress}>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack} />
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {stats.xpToNextLevel} XP to Level {stats.currentLevel + 1}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.quickStatsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <Text style={styles.statValue}>{stats.totalBadges}</Text>
          <Text style={styles.statLabel}>Badges</Text>
          <Text style={styles.statSubtext}>+2 this month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          </View>
          <Text style={styles.statValue}>{stats.testsCompleted}</Text>
          <Text style={styles.statLabel}>Tests</Text>
          <Text style={styles.statSubtext}>87% avg score</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="rocket" size={24} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>{stats.projectsCompleted}</Text>
          <Text style={styles.statLabel}>Projects</Text>
          <Text style={styles.statSubtext}>3 featured</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={24} color="#FF6B35" />
          </View>
          <Text style={styles.statValue}>{stats.learningStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
          <Text style={styles.statSubtext}>Best: {stats.longestStreak}</Text>
        </View>
      </View>

      {/* Learning Momentum */}
      <View style={styles.momentumCard}>
        <View style={styles.momentumHeader}>
          <Text style={styles.momentumTitle}>Learning Momentum</Text>
          <View style={styles.trendIndicator}>
            <Ionicons 
              name={activityTrend.isPositive ? "trending-up" : "trending-down"} 
              size={16} 
              color={activityTrend.isPositive ? "#34C759" : "#FF3B30"} 
            />
            <Text style={[
              styles.trendText,
              { color: activityTrend.isPositive ? "#34C759" : "#FF3B30" }
            ]}>
              {activityTrend.isPositive ? '+' : ''}{activityTrend.percentage}%
            </Text>
          </View>
        </View>

        <View style={styles.momentumContent}>
          <View style={styles.momentumScore}>
            <Animated.Text style={[
              styles.momentumValue,
              { color: getMomentumColor(learningMomentum) }
            ]}>
              {Math.round(learningMomentum)}
            </Animated.Text>
            <Text style={styles.momentumMax}>/100</Text>
          </View>
          
          <View style={styles.momentumBar}>
            <View style={styles.momentumTrack} />
            <Animated.View 
              style={[
                styles.momentumFill,
                {
                  width: momentumAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: getMomentumColor(learningMomentum),
                }
              ]} 
            />
          </View>
          
          <Text style={styles.momentumDescription}>
            Based on streak, recent activity, and skill growth
          </Text>
        </View>
      </View>

      {/* Skill Insights */}
      <View style={styles.skillInsightsCard}>
        <Text style={styles.cardTitle}>Skill Portfolio</Text>
        <View style={styles.skillInsights}>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>{skillInsights.totalSkills}</Text>
            <Text style={styles.insightLabel}>Total Skills</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={[styles.insightValue, { color: '#34C759' }]}>
              {skillInsights.verifiedSkills}
            </Text>
            <Text style={styles.insightLabel}>Verified</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {skillInsights.verificationRate.toFixed(0)}%
            </Text>
            <Text style={styles.insightLabel}>Verified</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {skillInsights.averageProficiency}/5
            </Text>
            <Text style={styles.insightLabel}>Avg Level</Text>
          </View>
        </View>
      </View>

      {/* Detailed Stats (Expandable) */}
      <Animated.View 
        style={[
          styles.detailedStats,
          {
            height: detailsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            opacity: detailsAnim,
          }
        ]}
      >
        <View style={styles.detailedContent}>
          {/* Weekly Learning Trend */}
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>Weekly Learning Time</Text>
            <View style={styles.trendChart}>
              {weeklyLearningTrend.map((day, index) => (
                <View key={day.day} style={styles.chartBar}>
                  <View 
                    style={[
                      styles.bar,
                      { 
                        height: `${(day.minutes / 90) * 100}%`,
                        backgroundColor: day.minutes > 60 ? '#34C759' : '#FF9500'
                      }
                    ]}
                  />
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.trendSubtext}>
              Total: {weeklyLearningTrend.reduce((sum, day) => sum + day.minutes, 0)} minutes this week
            </Text>
          </View>

          {/* Learning Insights */}
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.insightCardValue}>{stats.totalTimeSpent}h</Text>
              <Text style={styles.insightCardLabel}>Total Time</Text>
            </View>
            
            <View style={styles.insightCard}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <Text style={styles.insightCardValue}>{stats.mentorEndorsements}</Text>
              <Text style={styles.insightCardLabel}>Endorsements</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onStatsPress}
      >
        <Text style={styles.actionButtonText}>View Full Analytics</Text>
        <Ionicons name="arrow-forward" size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsToggleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Level Progress Card
  levelCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelGradient: {
    borderRadius: 16,
    padding: 20,
  },
  levelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  levelName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  levelProgress: {
    flex: 1,
    marginLeft: 20,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },

  // Quick Stats Grid
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#C7C7CC',
  },

  // Learning Momentum
  momentumCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  momentumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  momentumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  momentumContent: {
    alignItems: 'center',
  },
  momentumScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  momentumValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  momentumMax: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 4,
  },
  momentumBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  momentumTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  momentumFill: {
    height: '100%',
    borderRadius: 3,
  },
  momentumDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Skill Insights
  skillInsightsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  skillInsights: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  insightDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 8,
  },

  // Detailed Stats
  detailedStats: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailedContent: {
    gap: 16,
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    backgroundColor: '#34C759',
    borderRadius: 2,
    marginBottom: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  trendSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  insightCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
    marginBottom: 2,
  },
  insightCardLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default StatsOverview;
