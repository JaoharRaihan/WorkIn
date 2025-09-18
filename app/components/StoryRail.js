import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const StoryRail = ({ stories = [], onStoryPress, onAddStory }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyModalVisible, setStoryModalVisible] = useState(false);

  const handleStoryPress = (story) => {
    setSelectedStory(story);
    setStoryModalVisible(true);
    if (onStoryPress) {
      onStoryPress(story);
    }
  };

  const handleAddStory = () => {
    if (onAddStory) {
      onAddStory();
    }
  };

  const renderStoryItem = (story) => {
    const getStoryColor = (type) => {
      switch (type) {
        case 'streak': return '#FF6B35';
        case 'milestone': return '#FFD700';
        case 'project': return '#007AFF';
        case 'tip': return '#34C759';
        case 'insight': return '#AF52DE';
        default: return '#e1e8ed';
      }
    };

    const getStoryIcon = (type) => {
      switch (type) {
        case 'streak': return '🔥';
        case 'milestone': return '🏆';
        case 'project': return '🚀';
        case 'tip': return '💡';
        case 'insight': return '🤖';
        default: return '📝';
      }
    };

    return (
      <TouchableOpacity
        key={story.id}
        style={styles.storyItem}
        onPress={() => handleStoryPress(story)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.storyCircle,
          { borderColor: getStoryColor(story.type) },
          story.active && styles.activeStory,
          story.id === '1' && styles.myStory // User's own story
        ]}>
          {story.id === '1' ? (
            <View style={styles.addStoryButton}>
              <Ionicons name="add" size={20} color="#007AFF" />
            </View>
          ) : (
            <Text style={styles.storyIcon}>{getStoryIcon(story.type)}</Text>
          )}
          
          {story.hasNew && (
            <View style={styles.newIndicator}>
              <View style={styles.newDot} />
            </View>
          )}
        </View>
        
        <Text style={styles.storyUser} numberOfLines={1}>
          {typeof story.user === 'string' ? story.user : story.user?.name || 'User'}
        </Text>
        
        {story.type && (
          <Text style={styles.storyType}>{story.type}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          decelerationRate="fast"
          snapToInterval={80}
          snapToAlignment="start"
        >
          {stories.map(renderStoryItem)}
        </ScrollView>
      </View>

      {/* Story Viewer Modal */}
      <Modal
        visible={storyModalVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setStoryModalVisible(false)}
      >
        <StoryViewer
          story={selectedStory}
          onClose={() => setStoryModalVisible(false)}
        />
      </Modal>
    </>
  );
};

// Story Viewer Component
const StoryViewer = ({ story, visible, onClose }) => {
  const [progress] = useState(new Animated.Value(0));
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      // Auto-advance story progress
      const timer = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            onClose();
            return 0;
          }
          return prev + 2; // 2% every 100ms = 5 seconds total
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [visible, onClose]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: storyProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [storyProgress]);

  const renderStoryContent = () => {
    const { content, type, user } = story;
    
    // Create background style based on content
    const backgroundStyle = content?.background ? {
      background: content.background
    } : {
      backgroundColor: getTypeColor(type)
    };

    switch (type) {
      case 'milestone':
        return (
          <LinearGradient
            colors={getGradientColors(content?.background)}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.storyTimestamp}>{story.timestamp}</Text>
            </View>
            
            <View style={styles.milestoneContent}>
              <Text style={styles.storyBadge}>{content.badge || '🏆'}</Text>
              <Text style={styles.milestoneTitle}>{content.text}</Text>
              
              {content.achievements && (
                <View style={styles.achievementsList}>
                  {content.achievements.map((achievement, index) => (
                    <Text key={index} style={styles.achievementItem}>
                      {achievement}
                    </Text>
                  ))}
                </View>
              )}
              
              {content.streak && (
                <View style={styles.streakInfo}>
                  <Text style={styles.streakText}>🔥 {content.streak} day streak</Text>
                  <Text style={styles.xpText}>+{content.xpGained} XP</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        );

      case 'tip':
        return (
          <LinearGradient
            colors={getGradientColors(content?.background)}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.mentorBadge}>💡 Mentor Tip</Text>
            </View>
            
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>{content.text}</Text>
              
              {content.code && (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{content.code}</Text>
                </View>
              )}
              
              {content.keyPoint && (
                <View style={styles.keyPointBox}>
                  <Text style={styles.keyPointText}>{content.keyPoint}</Text>
                </View>
              )}
              
              {content.tools && (
                <View style={styles.toolsList}>
                  <Text style={styles.toolsTitle}>Recommended Tools:</Text>
                  {content.tools.map((tool, index) => (
                    <Text key={index} style={styles.toolItem}>• {tool}</Text>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        );

      case 'project_showcase':
        return (
          <LinearGradient
            colors={getGradientColors(content?.background)}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.projectBadge}>🚀 Project</Text>
            </View>
            
            <View style={styles.projectContent}>
              <Text style={styles.projectTitle}>{content.text}</Text>
              
              {content.features && (
                <View style={styles.featuresList}>
                  {content.features.map((feature, index) => (
                    <Text key={index} style={styles.featureItem}>{feature}</Text>
                  ))}
                </View>
              )}
              
              {content.tech && (
                <View style={styles.techStack}>
                  {content.tech.map((tech, index) => (
                    <View key={index} style={styles.techTag}>
                      <Text style={styles.techText}>{tech}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {content.metrics && (
                <View style={styles.metricsGrid}>
                  {Object.entries(content.metrics).map(([key, value]) => (
                    <View key={key} style={styles.metricItem}>
                      <Text style={styles.metricValue}>{value}</Text>
                      <Text style={styles.metricLabel}>{key}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        );

      case 'insight':
        return (
          <LinearGradient
            colors={getGradientColors(content?.background)}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.aiBadge}>🤖 AI Insight</Text>
            </View>
            
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{content.text}</Text>
              
              <View style={styles.confidenceBar}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${content.confidence}%` }]} />
                </View>
                <Text style={styles.confidenceValue}>{content.confidence}%</Text>
              </View>
              
              {content.nextSkills && (
                <View style={styles.skillsList}>
                  <Text style={styles.skillsTitle}>Skills to gain:</Text>
                  {content.nextSkills.map((skill, index) => (
                    <Text key={index} style={styles.skillItem}>• {skill}</Text>
                  ))}
                </View>
              )}
              
              {content.stats && (
                <View style={styles.statsGrid}>
                  {Object.entries(content.stats).map(([key, value]) => (
                    <View key={key} style={styles.statItem}>
                      <Text style={styles.statValue}>{value}</Text>
                      <Text style={styles.statLabel}>{key}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        );

      case 'challenge_win':
        return (
          <LinearGradient
            colors={getGradientColors(content?.background)}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.challengeBadge}>🏆 Challenge Won</Text>
            </View>
            
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>{content.text}</Text>
              
              <View style={styles.winDetails}>
                <Text style={styles.rankText}>Rank: {content.rank}</Text>
                <Text style={styles.participantsText}>out of {content.participants} participants</Text>
                <Text style={styles.accuracyText}>Accuracy: {content.accuracy}</Text>
                <Text style={styles.timeText}>Time: {content.timeToComplete}</Text>
              </View>
              
              {content.skills && (
                <View style={styles.skillsGrid}>
                  {content.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        );

      default:
        return (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.storyBackground}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyUserName}>{user.name}</Text>
              <Text style={styles.storyTimestamp}>{story.timestamp}</Text>
            </View>
            <View style={styles.defaultContent}>
              <Text style={styles.storyText}>{content.text || content}</Text>
            </View>
          </LinearGradient>
        );
    }
  };

  const getGradientColors = (background) => {
    if (background && background.includes('gradient')) {
      // Extract colors from linear-gradient string
      const colorMatches = background.match(/#[0-9a-fA-F]{6}/g);
      if (colorMatches && colorMatches.length >= 2) {
        return colorMatches.slice(0, 2);
      }
    }
    return ['#667eea', '#764ba2']; // default gradient
  };

  const getTypeColor = (type) => {
    const colors = {
      milestone: '#667eea',
      tip: '#f093fb',
      project_showcase: '#4facfe',
      insight: '#fa709a',
      challenge_win: '#a8edea',
      breakthrough: '#ffecd2',
      default: '#667eea'
    };
    return colors[type] || colors.default;
  };

  if (!visible || !story) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.storyContainer}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        {/* Story content */}
        {renderStoryContent()}

        {/* Tap areas for navigation */}
        <TouchableOpacity
          style={styles.tapAreaLeft}
          onPress={onClose}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.tapAreaRight}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
};const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e1e8ed',
    position: 'relative',
  },
  activeStory: {
    borderWidth: 3,
  },
  myStory: {
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addStoryButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 27,
  },
  storyIcon: {
    fontSize: 24,
  },
  newIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  newDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyUser: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  storyType: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'capitalize',
  },

  // Story Viewer Styles
  storyViewer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 50,
    marginHorizontal: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
  },
  storyUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  storyTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  storyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  storyContent: {
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Streak specific styles
  streakNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  },
  streakStats: {
    alignItems: 'center',
  },
  statItem: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  
  // Milestone specific styles
  milestoneTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '80%',
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
  },
  nextStep: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Project specific styles
  projectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  projectDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  techTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  
  // Tip specific styles
  tipText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  tipAuthor: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  tipCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  
  // Insight specific styles
  insightText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  confidenceBar: {
    width: '80%',
    marginBottom: 32,
  },
  confidenceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceProgress: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Default styles
  defaultText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  
  // Story actions
  storyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  storyActionButton: {
    padding: 16,
    marginHorizontal: 16,
  },
});

export default StoryRail;
