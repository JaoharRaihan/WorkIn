import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import searchService from '../../services/searchService';
import { useApp } from '../../context/AppContext';
import { useProfile } from '../../context/ProfileContext';

export default function GlobalSearchScreen({ navigation, route }) {
  const { user } = useApp();
  const { saveSearchHistory } = useProfile();
  
  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [activeTab, setActiveTab] = useState('all');
  const [searchResults, setSearchResults] = useState({
    all: [],
    posts: [],
    users: [],
    roadmaps: [],
    challenges: []
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 'all', name: 'All', icon: 'search-outline' },
    { id: 'posts', name: 'Posts', icon: 'document-text-outline' },
    { id: 'users', name: 'People', icon: 'people-outline' },
    { id: 'roadmaps', name: 'Roadmaps', icon: 'map-outline' },
    { id: 'challenges', name: 'Challenges', icon: 'trophy-outline' },
  ];

  useEffect(() => {
    loadInitialData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayedSearch = setTimeout(() => {
        handleSearch();
        getSuggestions();
      }, 300);
      
      return () => clearTimeout(delayedSearch);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      const [history, trending] = await Promise.all([
        searchService.getSearchHistory(user.id),
        searchService.getTrendingSearches()
      ]);
      
      setSearchHistory(history);
      setTrendingSearches(trending);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      let results;
      
      if (activeTab === 'all') {
        results = await searchService.globalSearch(searchQuery);
        setSearchResults({
          all: results.all || [],
          posts: results.posts || [],
          users: results.users || [],
          roadmaps: results.roadmaps || [],
          challenges: results.challenges || []
        });
      } else {
        switch (activeTab) {
          case 'posts':
            results = await searchService.searchPosts(searchQuery);
            setSearchResults(prev => ({ ...prev, posts: results }));
            break;
          case 'users':
            results = await searchService.searchUsers(searchQuery);
            setSearchResults(prev => ({ ...prev, users: results }));
            break;
          case 'roadmaps':
            results = await searchService.searchRoadmaps(searchQuery);
            setSearchResults(prev => ({ ...prev, roadmaps: results }));
            break;
          case 'challenges':
            results = await searchService.searchChallenges(searchQuery);
            setSearchResults(prev => ({ ...prev, challenges: results }));
            break;
        }
      }
      
      // Save to search history
      await searchService.saveSearchHistory(searchQuery, activeTab, user.id);
      
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const suggestions = await searchService.getSearchSuggestions(searchQuery);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    handleSearch();
  };

  const handleHistoryItemPress = (historyItem) => {
    setSearchQuery(historyItem.query);
    setActiveTab(historyItem.type);
    handleSearch();
  };

  const renderSearchResults = () => {
    const results = searchResults[activeTab] || [];
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingSpinner, { opacity: fadeAnim }]}>
            <FontAwesome5 name="spinner" size={24} color="#007AFF" />
          </Animated.View>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (results.length === 0 && searchQuery) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="search" size={48} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search terms or check different categories
          </Text>
        </View>
      );
    }

    return (
      <FlashList
        data={results}
        renderItem={({ item }) => renderResultItem(item)}
        keyExtractor={(item, index) => `${activeTab}-${item.id || index}`}
        estimatedItemSize={80}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderResultItem = (item) => {
    switch (activeTab) {
      case 'posts':
        return renderPostResult(item);
      case 'users':
        return renderUserResult(item);
      case 'roadmaps':
        return renderRoadmapResult(item);
      case 'challenges':
        return renderChallengeResult(item);
      default:
        return renderMixedResult(item);
    }
  };

  const renderPostResult = (post) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
    >
      <View style={styles.resultIcon}>
        <FontAwesome5 name="document-text" size={16} color="#007AFF" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>{post.content}</Text>
        <Text style={styles.resultSubtitle}>
          by {post.author} • {post.timeAgo}
        </Text>
        {post.skills && (
          <View style={styles.skillTags}>
            {post.skills.slice(0, 3).map((skill, index) => (
              <Text key={index} style={styles.skillTag}>{skill}</Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUserResult = (user) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
    >
      <View style={styles.resultIcon}>
        <FontAwesome5 name="user" size={16} color="#4CAF50" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{user.name}</Text>
        <Text style={styles.resultSubtitle}>{user.title}</Text>
        <Text style={styles.resultDescription}>{user.bio}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRoadmapResult = (roadmap) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('RoadmapDetail', { roadmapId: roadmap.id })}
    >
      <View style={styles.resultIcon}>
        <FontAwesome5 name="map" size={16} color="#FF6B35" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{roadmap.title}</Text>
        <Text style={styles.resultSubtitle}>
          {roadmap.category} • {roadmap.difficulty}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {roadmap.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeResult = (challenge) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
    >
      <View style={styles.resultIcon}>
        <FontAwesome5 name="trophy" size={16} color="#FFD700" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{challenge.title}</Text>
        <Text style={styles.resultSubtitle}>
          {challenge.participants} participants • {challenge.status}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {challenge.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMixedResult = (item) => {
    // For 'all' tab, determine item type and render accordingly
    switch (item.type) {
      case 'post':
        return renderPostResult(item);
      case 'user':
        return renderUserResult(item);
      case 'roadmap':
        return renderRoadmapResult(item);
      case 'challenge':
        return renderChallengeResult(item);
      default:
        return renderPostResult(item);
    }
  };

  const renderWelcomeState = () => (
    <ScrollView style={styles.welcomeContainer} showsVerticalScrollIndicator={false}>
      {/* Search History */}
      {searchHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {searchHistory.slice(0, 5).map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <FontAwesome5 name="history" size={14} color="#666" />
              <Text style={styles.historyText}>{item.query}</Text>
              <Text style={styles.historyType}>{item.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <View style={styles.trendingContainer}>
            {trendingSearches.map((trend, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.trendingTag}
                onPress={() => handleSuggestionPress(trend.query)}
              >
                <FontAwesome5 name="fire" size={12} color="#FF6B35" />
                <Text style={styles.trendingText}>{trend.query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Search</Text>
        <View style={styles.quickCategoriesGrid}>
          {[
            { name: 'React Native', icon: 'mobile-alt', color: '#007AFF' },
            { name: 'Python', icon: 'code', color: '#4CAF50' },
            { name: 'UI/UX Design', icon: 'paint-brush', color: '#FF6B35' },
            { name: 'Data Science', icon: 'chart-bar', color: '#9C27B0' },
            { name: 'Machine Learning', icon: 'robot', color: '#FFD700' },
            { name: 'Web Development', icon: 'globe', color: '#FF5722' },
          ].map((category, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.quickCategory, { borderColor: category.color }]}
              onPress={() => handleSuggestionPress(category.name)}
            >
              <FontAwesome5 name={category.icon} size={16} color={category.color} />
              <Text style={[styles.quickCategoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search posts, people, roadmaps..."
            placeholderTextColor="#999"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <FontAwesome5 name="search" size={12} color="#666" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tabs */}
      {searchQuery && (
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity 
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={16} 
                  color={activeTab === tab.id ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {searchQuery ? renderSearchResults() : renderWelcomeState()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#000',
  },
  clearButton: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 12,
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  skillTags: {
    flexDirection: 'row',
    marginTop: 6,
  },
  skillTag: {
    fontSize: 10,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  welcomeContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  historyType: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  trendingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#333',
  },
  quickCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCategory: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  quickCategoryText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});
