import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoadmap } from '../../../context/RoadmapContext';
import { useProfile } from '../../../context/ProfileContext';

const { width } = Dimensions.get('window');

export default function LearnScreen({ navigation }) {
  const {
    allRoadmaps,
    featuredRoadmaps,
    userProgress,
    activeRoadmaps,
    completedRoadmaps,
    bookmarkedRoadmaps,
    learningStats,
    loading,
    startRoadmap,
    bookmarkRoadmap,
    unbookmarkRoadmap,
    setActiveRoadmap,
    getRecommendedRoadmaps,
  } = useRoadmap();

  const { stats } = useProfile();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('featured'); // featured, all, progress, bookmarked

  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'Web Development', name: 'Web Dev', icon: 'code-outline' },
    { id: 'Mobile Development', name: 'Mobile', icon: 'phone-portrait-outline' },
    { id: 'Data Science', name: 'Data', icon: 'analytics-outline' },
    { id: 'Design', name: 'Design', icon: 'color-palette-outline' },
  ];

  const getFilteredRoadmaps = () => {
    let filtered = allRoadmaps;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(roadmap => roadmap.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(roadmap =>
        roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.skillsYouWillLearn.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const handleStartRoadmap = (roadmapId) => {
    Alert.alert(
      'Start Learning',
      'Ready to begin this roadmap?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            startRoadmap(roadmapId);
            navigation.navigate('RoadmapDetail', { roadmapId });
          }
        }
      ]
    );
  };

  const handleBookmark = (roadmapId) => {
    if (bookmarkedRoadmaps.has(roadmapId)) {
      unbookmarkRoadmap(roadmapId);
    } else {
      bookmarkRoadmap(roadmapId);
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Your Learning Journey</Text>
        <TouchableOpacity>
          <Ionicons name="trophy-outline" size={20} color="#FF9500" />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{learningStats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{learningStats.stepsCompleted}</Text>
          <Text style={styles.statLabel}>Steps Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{learningStats.roadmapsCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor(learningStats.totalTimeSpent / 60)}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
      </View>
    </View>
  );

  const renderRoadmapCard = ({ item: roadmap }) => {
    const progress = userProgress[roadmap.id];
    const isActive = activeRoadmaps.includes(roadmap.id);
    const isCompleted = completedRoadmaps.includes(roadmap.id);
    const isBookmarked = bookmarkedRoadmaps.has(roadmap.id);
    
    const progressPercentage = progress 
      ? Math.round((progress.completedSteps.length / roadmap.steps.length) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.roadmapCard}
        onPress={() => navigation.navigate('RoadmapDetail', { roadmapId: roadmap.id })}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardBadges}>
            <View style={[styles.difficultyBadge, getDifficultyStyle(roadmap.difficulty)]}>
              <Text style={[styles.badgeText, getDifficultyTextStyle(roadmap.difficulty)]}>
                {roadmap.difficulty}
              </Text>
            </View>
            {roadmap.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => handleBookmark(roadmap.id)}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#007AFF' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
          <Text style={styles.roadmapDescription} numberOfLines={2}>
            {roadmap.description}
          </Text>
          
          {/* Instructor & Stats */}
          <View style={styles.roadmapMeta}>
            <View style={styles.instructorInfo}>
              <Ionicons name="person-circle-outline" size={16} color="#666" />
              <Text style={styles.instructorName}>{roadmap.instructor}</Text>
            </View>
            <View style={styles.roadmapStats}>
              <View style={styles.statRow}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{roadmap.estimatedTime}</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{roadmap.learners.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Skills Preview */}
          <View style={styles.skillsPreview}>
            {roadmap.skillsYouWillLearn.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
            {roadmap.skillsYouWillLearn.length > 3 && (
              <Text style={styles.moreSkills}>
                +{roadmap.skillsYouWillLearn.length - 3} more
              </Text>
            )}
          </View>

          {/* Progress or Action */}
          {isCompleted ? (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#30D158" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : progress ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
                <Text style={styles.stepProgress}>
                  {progress.completedSteps.length}/{roadmap.steps.length} steps
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.navigate('RoadmapDetail', { roadmapId: roadmap.id })}
              >
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartRoadmap(roadmap.id)}
            >
              <Ionicons name="play-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.startButtonText}>Start Learning</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return styles.beginnerBadge;
      case 'Intermediate': return styles.intermediateBadge;
      case 'Advanced': return styles.advancedBadge;
      default: return styles.beginnerBadge;
    }
  };

  const getDifficultyTextStyle = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return styles.beginnerText;
      case 'Intermediate': return styles.intermediateText;
      case 'Advanced': return styles.advancedText;
      default: return styles.beginnerText;
    }
  };

  const renderViewModeSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.viewModeContainer}
      contentContainerStyle={styles.viewModeContent}
    >
      {[
        { key: 'featured', label: 'Featured', icon: 'star-outline' },
        { key: 'all', label: 'All Roadmaps', icon: 'grid-outline' },
        { key: 'progress', label: 'In Progress', icon: 'trending-up-outline' },
        { key: 'bookmarked', label: 'Bookmarked', icon: 'bookmark-outline' },
      ].map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.viewModeButton,
            viewMode === mode.key && styles.activeViewMode
          ]}
          onPress={() => setViewMode(mode.key)}
        >
          <Ionicons
            name={mode.icon}
            size={16}
            color={viewMode === mode.key ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.viewModeText,
            viewMode === mode.key && styles.activeViewModeText
          ]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const getRoadmapsToShow = () => {
    switch (viewMode) {
      case 'featured':
        return featuredRoadmaps;
      case 'progress':
        return allRoadmaps.filter(r => activeRoadmaps.includes(r.id));
      case 'bookmarked':
        return allRoadmaps.filter(r => bookmarkedRoadmaps.has(r.id));
      default:
        return getFilteredRoadmaps();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Learn & Grow</Text>
          <Text style={styles.headerSubtitle}>
            Master new skills with guided roadmaps
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search roadmaps, skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={selectedCategory === category.id ? '#007AFF' : '#666'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Mode Selector */}
        {renderViewModeSelector()}

        {/* Roadmaps List */}
        <View style={styles.roadmapsSection}>
          <Text style={styles.sectionTitle}>
            {viewMode === 'featured' ? 'Featured Roadmaps' :
             viewMode === 'progress' ? 'Continue Learning' :
             viewMode === 'bookmarked' ? 'Your Bookmarks' :
             'All Roadmaps'}
          </Text>
          
          <FlatList
            data={getRoadmapsToShow()}
            renderItem={renderRoadmapCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.roadmapsList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeCategoryButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#007AFF',
  },
  viewModeContainer: {
    marginBottom: 20,
  },
  viewModeContent: {
    paddingHorizontal: 20,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeViewMode: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  viewModeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeViewModeText: {
    color: '#fff',
  },
  roadmapsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  roadmapsList: {
    paddingBottom: 20,
  },
  roadmapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  beginnerBadge: {
    backgroundColor: '#e8f5e8',
  },
  intermediateBadge: {
    backgroundColor: '#fff3e0',
  },
  advancedBadge: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  beginnerText: {
    color: '#30d158',
  },
  intermediateText: {
    color: '#ff9500',
  },
  advancedText: {
    color: '#ff3b30',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f57c00',
    marginLeft: 2,
  },
  bookmarkButton: {
    padding: 4,
  },
  cardContent: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  roadmapMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  roadmapStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  skillsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  skillTagText: {
    fontSize: 12,
    color: '#666',
  },
  moreSkills: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    paddingVertical: 12,
    borderRadius: 8,
  },
  completedText: {
    color: '#30D158',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  stepProgress: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
