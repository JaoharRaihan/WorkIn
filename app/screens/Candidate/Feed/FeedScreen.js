import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useFeed } from '../../../context/FeedContext';
import { useProfile } from '../../../context/ProfileContext';
import { useApp, APP_MODES } from '../../../context/AppContext';
import FeedPost from '../../../components/FeedPost';
import StoryRail from '../../../components/StoryRail';

const { width } = Dimensions.get('window');

export default function FeedScreen({ navigation }) {
  const { posts, likePost, savePost, refreshFeed, loading } = useFeed();
  const { gainXP } = useProfile();
  const { switchMode, mode } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleLikePost = (postId) => {
    likePost(postId);
    gainXP(5);
  };

  const handleSavePost = (postId) => {
    savePost(postId);
    gainXP(3);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const renderFeedPost = ({ item }) => (
    <FeedPost
      post={item}
      onLike={() => handleLikePost(item.id)}
      onSave={() => handleSavePost(item.id)}
      onUserPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
      onCommentPress={() => navigation.navigate('Comments', { postId: item.id })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>WorkIn</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('GlobalSearch')}
          >
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, styles.hrToggle]}
            onPress={() => switchMode(APP_MODES.HR)}
          >
            <Text style={styles.hrToggleText}>HR</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StoryRail navigation={navigation} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderFeedPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        estimatedItemSize={400}
        contentContainerStyle={styles.feedContainer}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostCreation')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  hrToggle: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hrToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedContainer: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
