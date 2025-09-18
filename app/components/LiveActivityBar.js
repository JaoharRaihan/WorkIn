import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCommunity } from '../context/CommunityContext';

const { width } = Dimensions.get('window');

export default function LiveActivityBar({ navigation }) {
  // Get community data with error handling
  let communityData;
  try {
    communityData = useCommunity();
  } catch (error) {
    console.error('Error accessing community context:', error);
    return (
      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          Community features temporarily unavailable
        </Text>
      </View>
    );
  }
  
  // Debug logging (can be removed in production)
  // console.log('Community Data:', communityData);
  // console.log('liveActivity:', communityData?.liveActivity);
  
  // Early return if no data
  if (!communityData) {
    return (
      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          Loading community data...
        </Text>
      </View>
    );
  }
  
  // Safely destructure with fallbacks
  const liveActivity = communityData.liveActivity || [];
  const liveChallenges = communityData.liveChallenges || [];
  const communityStats = communityData.communityStats || {};
  
  // Safely access data with defaults
  const liveUpdates = liveActivity;
  const activeChallenges = liveChallenges;
  const activeParticipants = communityStats.totalMembers || 0;
  
  const [showDetails, setShowDetails] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for active indicators
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    Animated.spring(slideAnim, {
      toValue: showDetails ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'challenge_completion':
        return { name: 'trophy', color: '#FFD700' };
      case 'skill_verification':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'mentor_session':
        return { name: 'user-graduate', color: '#9C27B0' };
      case 'tournament_win':
        return { name: 'crown', color: '#FF6B35' };
      case 'study_group_join':
        return { name: 'users', color: '#007AFF' };
      default:
        return { name: 'bell', color: '#666' };
    }
  };

  const renderActivityItem = (activity, index) => {
    const icon = getActivityIcon(activity.type);
    const timeAgo = Math.floor((Date.now() - activity.timestamp) / 60000);
    
    return (
      <TouchableOpacity
        key={activity.id}
        style={styles.activityItem}
        onPress={() => {
          // Navigate to relevant screen based on activity type
          if (activity.type === 'challenge_completion') {
            navigation.navigate('LiveChallenge', { challengeId: activity.challengeId });
          } else if (activity.type === 'mentor_session') {
            navigation.navigate('MentorMarketplace');
          }
        }}
      >
        <View style={[styles.activityIcon, { backgroundColor: icon.color + '20' }]}>
          <FontAwesome5 name={icon.name} size={12} color={icon.color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText} numberOfLines={1}>
            <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}
          </Text>
          <Text style={styles.activityTime}>
            {timeAgo < 1 ? 'now' : `${timeAgo}m ago`}
          </Text>
        </View>
        {activity.isLive && (
          <Animated.View 
            style={[
              styles.liveIndicator,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.liveDot} />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Activity Bar */}
      <TouchableOpacity 
        style={styles.activityBar}
        onPress={toggleDetails}
        activeOpacity={0.8}
      >
        <View style={styles.mainContent}>
          <View style={styles.leftSection}>
            <Animated.View 
              style={[
                styles.liveIndicatorMain,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.liveDotMain} />
              <Text style={styles.liveText}>LIVE</Text>
            </Animated.View>
            
            <Text style={styles.activitySummary}>
              {activeParticipants} active • {activeChallenges.filter(c => c.status === 'active').length} challenges
            </Text>
          </View>
          
          <View style={styles.rightSection}>
            <View style={styles.statsSection}>
              <FontAwesome5 name="fire" size={12} color="#FF6B35" />
              <Text style={styles.statsText}>{communityStats.totalPoints || 0}</Text>
            </View>
            
            <FontAwesome5 
              name={showDetails ? "chevron-down" : "chevron-up"} 
              size={12} 
              color="#666" 
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expandable Details */}
      <Animated.View 
        style={[
          styles.detailsContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Recent Activity</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Feed')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <FontAwesome5 name="arrow-right" size={10} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.activitiesList}
          showsVerticalScrollIndicator={false}
        >
          {liveUpdates && liveUpdates.length > 0 ? (
            liveUpdates.slice(0, 5).map(renderActivityItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </ScrollView>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LiveChallenge')}
          >
            <FontAwesome5 name="fire" size={14} color="#FF6B35" />
            <Text style={styles.quickActionText}>Join Challenge</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MentorMarketplace')}
          >
            <FontAwesome5 name="user-graduate" size={14} color="#4CAF50" />
            <Text style={styles.quickActionText}>Find Mentor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Feed')}
          >
            <FontAwesome5 name="users" size={14} color="#007AFF" />
            <Text style={styles.quickActionText}>Social Feed</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  activityBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  liveIndicatorMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  liveDotMain: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  activitySummary: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  
  // Details Section
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    maxHeight: 300,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 4,
  },
  activitiesList: {
    maxHeight: 160,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  activityUser: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  liveIndicator: {
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  
  // Empty State
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
