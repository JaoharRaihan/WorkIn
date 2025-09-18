import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';
import { useFeed } from '../../../context/FeedContext';
import { useCommunity } from '../../../context/CommunityContext';
import { useProfile } from '../../../context/ProfileContext';
import LiveActivityBar from '../../../components/LiveActivityBar';

const { width } = Dimensions.get('window');

export default function SocialHubScreen({ navigation }) {
  const {
    posts,
    likePost,
    savePost,
    refreshFeed,
    loading,
  } = useFeed();
  
  const {
    liveChallenges,
    liveActivity,
    userCommunityProfile,
    tournamentHistory,
  } = useCommunity();
  
  const { stats, badges, gainXP, earnBadge } = useProfile();
  
  const [showCommunityWidget, setShowCommunityWidget] = useState(true);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Animate live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide in community widget
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLikePost = (postId) => {
    likePost(postId);
    gainXP(5); // Reward for engagement
  };

  const handleDoubleTap = (postId, event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // Double-tap to clap with XP animation
      likePost(postId);
      gainXP(10); // Higher reward for double-tap
      
      // Show clap animation
      showClapAnimation(event.nativeEvent.x, event.nativeEvent.y);
      
      // Show XP gain animation
      showXPAnimation(10);
    }
  };

  const handleSwipeRight = (postId, event) => {
    if (event.nativeEvent.state === State.END && event.nativeEvent.translationX > 100) {
      // Swipe right to endorse skill
      endorseSkill(postId);
      gainXP(8);
    }
  };

  const handleSwipeLeft = (postId, event) => {
    if (event.nativeEvent.state === State.END && event.nativeEvent.translationX < -100) {
      // Swipe left to save/share
      savePost(postId);
      Alert.alert('Saved!', 'Post saved to your collection');
    }
  };

  const handleLongPress = (postId, event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // Long press to save to roadmap or challenge
      Alert.alert(
        'Quick Actions',
        'What would you like to do?',
        [
          { text: 'Save to Roadmap', onPress: () => saveToRoadmap(postId) },
          { text: 'Add to Challenge', onPress: () => addToChallenge(postId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const showClapAnimation = (x, y) => {
    // Implement clap animation with confetti
    const clapAnim = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(clapAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(clapAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const showXPAnimation = (xp) => {
    // Show floating XP animation
    const xpAnim = new Animated.Value(0);
    
    Animated.timing(xpAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  const endorseSkill = (postId) => {
    // Implement skill endorsement logic
    console.log('Endorsing skill for post:', postId);
  };

  const saveToRoadmap = (postId) => {
    // Implement save to roadmap logic
    console.log('Saving to roadmap:', postId);
  };

  const addToChallenge = (postId) => {
    // Implement add to challenge logic
    console.log('Adding to challenge:', postId);
  };

  const handleJoinChallenge = (challengeId) => {
    // This would integrate with CommunityContext
    navigation.navigate('LiveChallenge', { challengeId });
    gainXP(10); // Reward for joining challenge
  };

  const renderCommunityWidget = () => {
    if (!showCommunityWidget) return null;
    
    return (
      <Animated.View 
        style={[
          styles.communityWidget,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.widgetHeader}>
          <View style={styles.widgetTitle}>
            <Animated.View 
              style={[
                styles.liveIndicator,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </Animated.View>
            <Text style={styles.widgetTitleText}>Community Activity</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCommunityWidget(false)}>
            <FontAwesome5 name="times" size={14} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.widgetContent}
        >
          {/* Live Challenges */}
          {(liveChallenges || []).filter(c => c.status === 'active').slice(0, 2).map(challenge => (
            <TouchableOpacity 
              key={challenge.id}
              style={styles.challengeWidget}
              onPress={() => handleJoinChallenge(challenge.id)}
            >
              <FontAwesome5 name="fire" size={16} color="#FF6B35" />
              <Text style={styles.challengeWidgetTitle}>{challenge.title}</Text>
              <Text style={styles.challengeWidgetParticipants}>
                {challenge.participants} participants
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Recent Activity */}
          {(liveActivity || []).slice(0, 3).map(update => (
            <View key={update.id} style={styles.activityWidget}>
              <FontAwesome5 
                name={
                  update.type === 'submission' ? 'paper-plane' :
                  update.type === 'achievement' ? 'trophy' : 'flag'
                }
                size={14}
                color="#007AFF"
              />
              <Text style={styles.activityWidgetText}>
                {update.user} {update.action.split(' ').slice(-3).join(' ')}
              </Text>
              <Text style={styles.activityWidgetTime}>
                {Math.floor((Date.now() - update.timestamp) / 60000)}m ago
              </Text>
            </View>
          ))}
          
          {/* View All Button */}
          <TouchableOpacity 
            style={styles.viewAllWidget}
            onPress={() => navigation.navigate('Community')}
          >
            <FontAwesome5 name="arrow-right" size={14} color="#007AFF" />
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => navigation.navigate('Community')}
      >
        <FontAwesome5 name="fire" size={18} color="#FF6B35" />
        <Text style={styles.quickActionText}>Challenges</Text>
        {liveChallenges.filter(c => c.status === 'active').length > 0 && (
          <View style={styles.quickActionBadge}>
            <Text style={styles.quickActionBadgeText}>
              {liveChallenges.filter(c => c.status === 'active').length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => navigation.navigate('MentorMarketplace')}
      >
        <FontAwesome5 name="user-graduate" size={18} color="#4CAF50" />
        <Text style={styles.quickActionText}>Mentors</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => navigation.navigate('PostCreation')}
      >
        <FontAwesome5 name="plus-circle" size={18} color="#007AFF" />
        <Text style={styles.quickActionText}>Post</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => navigation.navigate('Community')}
      >
        <FontAwesome5 name="calendar" size={18} color="#FFD700" />
        <Text style={styles.quickActionText}>Events</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeedPost = (post) => (
    <PanGestureHandler
      onGestureEvent={post.swipeDirection === 'right' ? 
        (event) => handleSwipeRight(post.id, event) : 
        (event) => handleSwipeLeft(post.id, event)
      }
      onHandlerStateChange={post.swipeDirection === 'right' ? 
        (event) => handleSwipeRight(post.id, event) : 
        (event) => handleSwipeLeft(post.id, event)
      }
    >
      <TapGestureHandler
        numberOfTaps={2}
        onHandlerStateChange={(event) => handleDoubleTap(post.id, event)}
      >
        <TapGestureHandler
          numberOfTaps={1}
          onHandlerStateChange={(event) => handleLongPress(post.id, event)}
          minDurationMs={800}
        >
          <Animated.View style={styles.feedPost}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user" size={16} color="#007AFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.author.name}</Text>
            <Text style={styles.userTitle}>{post.author.title}</Text>
            <Text style={styles.postTime}>{post.timeAgo}</Text>
          </View>
        </View>
        
        {post.type === 'challenge' && (
          <View style={styles.postTypeBadge}>
            <FontAwesome5 name="fire" size={10} color="#FF6B35" />
            <Text style={styles.postTypeBadgeText}>Challenge</Text>
          </View>
        )}
        
        {post.type === 'achievement' && (
          <View style={[styles.postTypeBadge, styles.achievementBadge]}>
            <FontAwesome5 name="trophy" size={10} color="#FFD700" />
            <Text style={styles.postTypeBadgeText}>Achievement</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.skills && post.skills.length > 0 && (
        <View style={styles.postSkills}>
          {post.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
      
      {post.project && (
        <View style={styles.projectShowcase}>
          <FontAwesome5 name="code" size={14} color="#007AFF" />
          <Text style={styles.projectTitle}>{post.project.title}</Text>
          <Text style={styles.projectDescription}>{post.project.description}</Text>
        </View>
      )}
      
      {post.milestone && (
        <View style={styles.milestoneCard}>
          <FontAwesome5 name="flag" size={14} color="#4CAF50" />
          <Text style={styles.milestoneText}>{post.milestone}</Text>
          <View style={styles.milestoneProgress}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${post.milestoneProgress}%` }
              ]} 
            />
          </View>
        </View>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikePost(post.id)}
        >
          <FontAwesome5 
            name="heart" 
            size={14} 
            color={post.liked ? "#FF6B35" : "#666"}
            solid={post.liked}
          />
          <Text style={[
            styles.actionText,
            post.liked && styles.actionTextActive
          ]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="comment" size={14} color="#666" />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
        >
          <FontAwesome5 name="share" size={14} color="#666" />
          <Text style={styles.actionText}>{post.shares || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => savePost(post.id)}
        >
          <FontAwesome5 
            name="bookmark" 
            size={14} 
            color={post.bookmarked ? "#007AFF" : "#666"}
            solid={post.bookmarked}
          />
        </TouchableOpacity>
      </View>
      
      {/* Enhanced interaction buttons for community features */}
      {post.type === 'challenge' && !post.hasJoined && (
        <TouchableOpacity 
          style={styles.joinChallengeButton}
          onPress={() => handleJoinChallenge(post.challengeId)}
        >
          <FontAwesome5 name="plus" size={12} color="#FFF" />
          <Text style={styles.joinChallengeText}>Join Challenge</Text>
        </TouchableOpacity>
      )}
      
      {post.type === 'milestone' && (
        <TouchableOpacity 
          style={styles.encourageButton}
          onPress={() => {
            gainXP(3); // Reward for encouraging others
            Alert.alert('Encouragement sent!', 'You gained 3 XP for supporting the community!');
          }}
        >
          <FontAwesome5 name="hands-helping" size={12} color="#4CAF50" />
          <Text style={styles.encourageText}>Encourage</Text>
        </TouchableOpacity>
      )}
        </Animated.View>
        </TapGestureHandler>
      </TapGestureHandler>
    </PanGestureHandler>
  );

  const renderStoryRail = () => (
    <View style={styles.storyRail}>
      <Text style={styles.storyRailTitle}>Skill Moments</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* User's story */}
        <TouchableOpacity style={styles.storyItem}>
          <View style={[styles.storyAvatar, styles.userStoryAvatar]}>
            <FontAwesome5 name="plus" size={16} color="#007AFF" />
          </View>
          <Text style={styles.storyText}>Your Story</Text>
        </TouchableOpacity>
        
        {/* Community stories */}
        {[
          { name: 'Sarah', achievement: 'React Native Expert', color: '#FF6B35' },
          { name: 'Alex', achievement: '100 Day Streak', color: '#4CAF50' },
          { name: 'Mike', achievement: 'First Job', color: '#FFD700' },
          { name: 'Emma', achievement: 'Code Review', color: '#9C27B0' },
        ].map((story, index) => (
          <TouchableOpacity key={index} style={styles.storyItem}>
            <View style={[styles.storyAvatar, { borderColor: story.color }]}>
              <FontAwesome5 name="user" size={14} color="#007AFF" />
            </View>
            <Text style={styles.storyText}>{story.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WorkIn Feed</Text>
        <View style={styles.headerActions}>
          <Text style={styles.xpIndicator}>XP: {stats.totalXP || 0}</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('GlobalSearch')}
          >
            <FontAwesome5 name="search" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Community')}
          >
            <FontAwesome5 name="users" size={18} color="#007AFF" />
            {liveChallenges && liveChallenges.filter && liveChallenges.filter(c => c.status === 'active').length > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Live Activity Bar */}
      <LiveActivityBar navigation={navigation} />
      
      <FlashList
        data={posts || []}
        renderItem={({ item }) => renderFeedPost(item)}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={300}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshFeed} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {renderCommunityWidget()}
            {renderStoryRail()}
            {renderQuickActions()}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <FontAwesome5 name="stream" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No posts yet</Text>
            <Text style={styles.emptyStateText}>
              Start following people or join challenges to see posts here!
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Community')}
            >
              <Text style={styles.emptyStateButtonText}>Explore Community</Text>
            </TouchableOpacity>
          </View>
        )}
        onEndReached={() => {
          // Load more posts (pagination)
          if (!loading) {
            console.log('Loading more posts...');
          }
        }}
        onEndReachedThreshold={0.1}
      />
    </SafeAreaView>
  );
}

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
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 12,
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
  },
  scrollView: {
    flex: 1,
  },
  
  // Community Widget Styles
  communityWidget: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginRight: 8,
  },
  widgetTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  widgetContent: {
    maxHeight: 80,
  },
  challengeWidget: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  challengeWidgetTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
    textAlign: 'center',
  },
  challengeWidgetParticipants: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  activityWidget: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 140,
  },
  activityWidgetText: {
    fontSize: 11,
    color: '#1a1a1a',
    marginTop: 4,
  },
  activityWidgetTime: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  viewAllWidget: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Story Rail Styles
  storyRail: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  storyRailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    marginLeft: 4,
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  userStoryAvatar: {
    borderStyle: 'dashed',
  },
  storyText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 60,
  },
  
  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  quickAction: {
    alignItems: 'center',
    position: 'relative',
  },
  quickActionText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionBadgeText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
  },
  
  // Feed Content Styles
  feedContent: {
    paddingBottom: 20,
  },
  feedPost: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementBadge: {
    backgroundColor: '#FFF8E1',
  },
  postTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  postSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  projectShowcase: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  projectDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  milestoneCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  milestoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  milestoneProgress: {
    backgroundColor: '#e8f5e8',
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    backgroundColor: '#4CAF50',
    height: '100%',
    borderRadius: 2,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionTextActive: {
    color: '#FF6B35',
  },
  joinChallengeButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  joinChallengeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  encourageButton: {
    backgroundColor: '#f0fff4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  encourageText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
