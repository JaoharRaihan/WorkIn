import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Components
import StoryRail from '../../../components/StoryRail';
import FeedPost from '../../../components/FeedPost';
import QuickActionBar from '../../../components/QuickActionBar';

// Context
import { useApp } from '../../../context/AppContext';
import { useFeed } from '../../../context/FeedContext';
import { useProfile } from '../../../context/ProfileContext';

const FunWithLearningFeed = ({ navigation }) => {
  const { user } = useApp();
  const { 
    filteredPosts, 
    stories, 
    loading, 
    refreshing,
    activeFilter,
    userStats,
    likePost,
    clapPost,
    savePost,
    endorseSkill,
    markPostSeen,
    updateFilter,
    refreshFeed 
  } = useFeed();
  
  const { gainXP } = useProfile();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'For You', icon: 'sparkles' },
    { key: 'trending', label: 'Trending', icon: 'trending-up' },
    { key: 'following', label: 'Following', icon: 'people' },
    { key: 'challenges', label: 'Challenges', icon: 'trophy' },
  ];

  // Handle post interactions
  const handleLike = useCallback((postId) => {
    likePost(postId);
  }, [likePost]);

  const handleClap = useCallback((postId, count = 1) => {
    clapPost(postId, count);
    // Show XP animation
    Alert.alert('🎉', `+${count * 2} XP earned!`, [{ text: 'Nice!', style: 'default' }]);
  }, [clapPost]);

  const handleSave = useCallback((postId) => {
    savePost(postId);
  }, [savePost]);

  const handleSkillEndorse = useCallback((postId, skillName) => {
    endorseSkill(postId, skillName);
    Alert.alert('✅', `Endorsed ${skillName} skill! +5 XP`, [{ text: 'Great!', style: 'default' }]);
  }, [endorseSkill]);

  const handleShare = useCallback((postId) => {
    Alert.alert('Share Post', 'Sharing functionality coming soon!');
  }, []);

  const handleComment = useCallback((postId) => {
    Alert.alert('Add Comment', 'Comments feature coming soon!');
  }, []);

  const handleOpenProject = useCallback((projectUrl) => {
    Alert.alert(
      'Open Project',
      'Open project in external browser?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', style: 'default', onPress: () => {
          // Linking.openURL(projectUrl);
          Alert.alert('Demo Mode', 'External links disabled in demo');
        }}
      ]
    );
  }, []);

  const handleTakeChallenge = useCallback((challengeData) => {
    Alert.alert(
      'Take Challenge',
      `Ready to tackle this ${challengeData.difficulty} challenge?\n\nXP Reward: ${challengeData.xpReward}`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Let\'s Go!', style: 'default', onPress: () => {
          // navigation.navigate('Challenge', { challengeData });
          Alert.alert('🚀', 'Challenge screen coming soon!');
        }}
      ]
    );
  }, []);

  // Handle scroll to show/hide quick actions
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const isScrollingDown = currentScrollY > lastScrollY.current;
        
        if (isScrollingDown && currentScrollY > 100) {
          setShowQuickActions(false);
        } else if (!isScrollingDown || currentScrollY < 50) {
          setShowQuickActions(true);
        }
        
        lastScrollY.current = currentScrollY;
      },
    }
  );

  // Handle post view
  const handlePostView = useCallback((postId) => {
    markPostSeen(postId);
  }, [markPostSeen]);

  // Render filter tabs
  const FilterTabs = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === item.key && styles.activeFilterTab
            ]}
            onPress={() => updateFilter(item.key)}
          >
            <Ionicons 
              name={item.icon} 
              size={16} 
              color={activeFilter === item.key ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterText,
              activeFilter === item.key && styles.activeFilterText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterTabs}
      />
    </View>
  );

  // Render feed header
  const FeedHeader = () => (
    <View style={styles.feedHeader}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SkillNet</Text>
          <Text style={styles.headerSubtitle}>Fun with Learning 🎓</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Search', 'Search feature coming soon!')}
          >
            <Ionicons name="search" size={22} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Notifications', 'Notifications coming soon!')}
          >
            <Ionicons name="notifications-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Story Rail */}
      <StoryRail 
        stories={stories}
        onStoryPress={(story) => {
          Alert.alert('Story', `View ${story.author.name}'s story - Coming soon!`);
        }}
      />

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Stats Banner */}
      {userStats.dailyXP > 0 && (
        <View style={styles.statsBanner}>
          <Text style={styles.statsText}>
            🔥 {userStats.dailyXP} XP today • {userStats.streakCount} day streak
          </Text>
        </View>
      )}
    </View>
  );

  // Render post item
  const renderPost = useCallback(({ item, index }) => (
    <FeedPost
      post={item}
      onLike={() => handleLike(item.id)}
      onClap={(count) => handleClap(item.id, count)}
      onSave={() => handleSave(item.id)}
      onShare={() => handleShare(item.id)}
      onComment={() => handleComment(item.id)}
      onSkillEndorse={(skillName) => handleSkillEndorse(item.id, skillName)}
      onOpenProject={handleOpenProject}
      onTakeChallenge={handleTakeChallenge}
      onView={() => handlePostView(item.id)}
      navigation={navigation}
    />
  ), [
    handleLike, 
    handleClap, 
    handleSave, 
    handleShare, 
    handleComment, 
    handleSkillEndorse,
    handleOpenProject,
    handleTakeChallenge,
    handlePostView,
    navigation
  ]);

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bulb-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Welcome to SkillNet!</Text>
      <Text style={styles.emptySubtitle}>
        Your personalized learning feed will appear here.{'\n'}
        Start by following some skills or taking a challenge!
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => updateFilter('challenges')}
      >
        <Text style={styles.emptyButtonText}>Browse Challenges</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={FeedHeader}
        ListEmptyComponent={EmptyState}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
            tintColor="#007AFF"
            title="Pull to refresh"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={10}
        removeClippedSubviews={true}
      />

      {/* Quick Action Bar */}
      <QuickActionBar
        visible={showQuickActions}
        onCreatePost={() => navigation.navigate('PostCreation')}
        onTakeChallenge={() => updateFilter('challenges')}
        onOpenFriends={() => Alert.alert('Friends', 'Friends feature coming soon!')}
        onOpenMessages={() => Alert.alert('Messages', 'Messages feature coming soon!')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedContent: {
    paddingBottom: 100, // Space for quick action bar
  },
  feedHeader: {
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterTabs: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#fff',
  },
  statsBanner: {
    backgroundColor: '#fff9e6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  postSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FunWithLearningFeed;
