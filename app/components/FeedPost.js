import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { PostTypes } from '../context/FeedContext';

const { width } = Dimensions.get('window');

const FeedPost = ({
  post,
  onLike,
  onClap,
  onSave,
  onShare,
  onComment,
  onSkillEndorse,
  onOpenProject,
  onTakeChallenge,
  onView,
  navigation,
}) => {
  const [clapCount, setClapCount] = useState(0);
  const [isClapping, setIsClapping] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  
  const clapAnimation = useRef(new Animated.Value(0)).current;
  const likeAnimation = useRef(new Animated.Value(1)).current;

  // Handle clap animation
  const handleClap = useCallback(() => {
    const newCount = Math.min(clapCount + 1, 50);
    setClapCount(newCount);
    setIsClapping(true);
    
    // Animate clap
    Animated.sequence([
      Animated.timing(clapAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(clapAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClapping(false);
      onClap(newCount);
    });
  }, [clapCount, onClap, clapAnimation]);

  // Handle like animation
  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onLike();
  }, [onLike, likeAnimation]);

  // Get post type styling
  const getPostTypeStyle = () => {
    switch (post.type) {
      case PostTypes.MILESTONE:
        return { borderColor: '#FFD700', backgroundColor: '#fff9e6' };
      case PostTypes.PROJECT_SHOWCASE:
        return { borderColor: '#4CAF50', backgroundColor: '#f0f9ff' };
      case PostTypes.MENTOR_TIP:
        return { borderColor: '#9C27B0', backgroundColor: '#faf5ff' };
      case PostTypes.CHALLENGE:
        return { borderColor: '#FF5722', backgroundColor: '#fff3f0' };
      case PostTypes.AI_INSIGHT:
        return { borderColor: '#00BCD4', backgroundColor: '#f0fdff' };
      case PostTypes.SKILL_VERIFICATION:
        return { borderColor: '#2196F3', backgroundColor: '#f0f8ff' };
      case PostTypes.BADGE_EARNED:
        return { borderColor: '#FF9800', backgroundColor: '#fff8f0' };
      default:
        return { borderColor: '#e9ecef', backgroundColor: '#fff' };
    }
  };

  // Get post type icon
  const getPostTypeIcon = () => {
    switch (post.type) {
      case PostTypes.MILESTONE:
        return { name: 'trophy', color: '#FFD700' };
      case PostTypes.PROJECT_SHOWCASE:
        return { name: 'code-slash', color: '#4CAF50' };
      case PostTypes.MENTOR_TIP:
        return { name: 'bulb', color: '#9C27B0' };
      case PostTypes.CHALLENGE:
        return { name: 'fitness', color: '#FF5722' };
      case PostTypes.AI_INSIGHT:
        return { name: 'analytics', color: '#00BCD4' };
      case PostTypes.SKILL_VERIFICATION:
        return { name: 'checkmark-circle', color: '#2196F3' };
      case PostTypes.BADGE_EARNED:
        return { name: 'medal', color: '#FF9800' };
      default:
        return { name: 'document-text', color: '#666' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Render author header
  const AuthorHeader = () => {
    const typeIcon = getPostTypeIcon();
    
    return (
      <View style={styles.authorHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            {post.author.avatar ? (
              <Image source={{ uri: post.author.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.authorTitle}>{post.author.title}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
          </View>
        </View>
        
        <View style={styles.postTypeIndicator}>
          <Ionicons name={typeIcon.name} size={16} color={typeIcon.color} />
        </View>
      </View>
    );
  };

  // Render content based on post type
  const PostContent = () => {
    const contentLength = post.content.length;
    const shouldTruncate = contentLength > 200 && !showFullContent;
    const displayContent = shouldTruncate 
      ? post.content.substring(0, 200) + '...' 
      : post.content;

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.postTitle}>{post.title}</Text>
        
        <Text style={styles.postContent}>
          {displayContent}
        </Text>
        
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setShowFullContent(true)}>
            <Text style={styles.readMoreText}>Read more</Text>
          </TouchableOpacity>
        )}

        {/* Post-specific content */}
        {post.type === PostTypes.PROJECT_SHOWCASE && post.metadata?.project && (
          <ProjectShowcase project={post.metadata.project} onOpen={onOpenProject} />
        )}
        
        {post.type === PostTypes.CHALLENGE && post.metadata?.challenge && (
          <ChallengeContent challenge={post.metadata.challenge} onTake={onTakeChallenge} />
        )}
        
        {post.type === PostTypes.SKILL_VERIFICATION && post.metadata?.skill && (
          <SkillVerification 
            skill={post.metadata.skill} 
            testScore={post.metadata.testScore}
            onEndorse={() => onSkillEndorse(post.metadata.skill)}
          />
        )}
        
        {post.type === PostTypes.MILESTONE && post.metadata?.milestone && (
          <MilestoneDisplay milestone={post.metadata} />
        )}

        {post.type === PostTypes.AI_INSIGHT && post.metadata?.insight && (
          <AIInsightDisplay insight={post.metadata.insight} />
        )}
      </View>
    );
  };

  // Project showcase component
  const ProjectShowcase = ({ project, onOpen }) => (
    <View style={styles.projectShowcase}>
      <View style={styles.projectHeader}>
        <Ionicons name="code-slash" size={20} color="#4CAF50" />
        <Text style={styles.projectName}>{project.name}</Text>
      </View>
      
      <View style={styles.techStack}>
        {project.technologies.map((tech, index) => (
          <View key={index} style={styles.techTag}>
            <Text style={styles.techTagText}>{tech}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.projectActions}>
        {project.githubUrl && (
          <TouchableOpacity 
            style={styles.projectButton}
            onPress={() => onOpen(project.githubUrl)}
          >
            <Ionicons name="logo-github" size={16} color="#333" />
            <Text style={styles.projectButtonText}>Code</Text>
          </TouchableOpacity>
        )}
        
        {project.demoUrl && (
          <TouchableOpacity 
            style={[styles.projectButton, styles.demoButton]}
            onPress={() => onOpen(project.demoUrl)}
          >
            <Ionicons name="globe" size={16} color="#fff" />
            <Text style={[styles.projectButtonText, { color: '#fff' }]}>Demo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Challenge content component
  const ChallengeContent = ({ challenge, onTake }) => (
    <View style={styles.challengeContent}>
      <View style={styles.challengeHeader}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
          <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
        </View>
        <Text style={styles.challengeXP}>+{challenge.xpReward} XP</Text>
      </View>
      
      <View style={styles.challengeStats}>
        <View style={styles.challengeStat}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.challengeStatText}>{challenge.timeLimit}m</Text>
        </View>
        <View style={styles.challengeStat}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.challengeStatText}>{challenge.participants}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.takeButton}
        onPress={() => onTake(challenge)}
      >
        <Text style={styles.takeButtonText}>Take Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  // Skill verification component
  const SkillVerification = ({ skill, testScore, onEndorse }) => (
    <View style={styles.skillVerification}>
      <View style={styles.skillHeader}>
        <View style={styles.skillBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
          <Text style={styles.skillName}>{skill}</Text>
        </View>
        <Text style={styles.testScore}>{testScore}/100</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.endorseButton}
        onPress={onEndorse}
      >
        <Ionicons name="thumbs-up" size={16} color="#2196F3" />
        <Text style={styles.endorseButtonText}>Endorse Skill</Text>
      </TouchableOpacity>
    </View>
  );

  // Milestone display component
  const MilestoneDisplay = ({ milestone }) => (
    <View style={styles.milestoneDisplay}>
      <LinearGradient
        colors={['#FFD700', '#FFA000']}
        style={styles.milestoneGradient}
      >
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneEmoji}>🏆</Text>
          <Text style={styles.milestoneText}>
            {milestone.streakCount} Day Learning Streak
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  // AI insight display component
  const AIInsightDisplay = ({ insight }) => (
    <View style={styles.aiInsight}>
      <View style={styles.aiHeader}>
        <Ionicons name="analytics" size={20} color="#00BCD4" />
        <Text style={styles.aiTitle}>AI Insight</Text>
        <Text style={styles.aiConfidence}>{Math.round(insight.confidence * 100)}% confident</Text>
      </View>
      
      <View style={styles.aiMetrics}>
        <View style={styles.aiMetric}>
          <Text style={styles.aiMetricValue}>+{insight.productivityIncrease}%</Text>
          <Text style={styles.aiMetricLabel}>Productivity</Text>
        </View>
        <View style={styles.aiMetric}>
          <Text style={styles.aiMetricValue}>{insight.optimalTime}</Text>
          <Text style={styles.aiMetricLabel}>Optimal Time</Text>
        </View>
      </View>
    </View>
  );

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Interaction bar
  const InteractionBar = () => (
    <View style={styles.interactionBar}>
      <View style={styles.interactions}>
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.interactionButton}
          onPress={handleLike}
        >
          <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={22} 
              color={post.isLiked ? "#FF3040" : "#666"} 
            />
          </Animated.View>
          <Text style={[styles.interactionText, post.isLiked && { color: "#FF3040" }]}>
            {post.likes + (post.isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        {/* Clap Button */}
        <TouchableOpacity 
          style={styles.interactionButton}
          onPress={handleClap}
          onLongPress={() => {
            // Multi-clap on long press
            for (let i = 0; i < 5; i++) {
              setTimeout(() => handleClap(), i * 100);
            }
          }}
        >
          <Animated.View style={{ 
            transform: [{ 
              scale: clapAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3]
              })
            }] 
          }}>
            <Ionicons 
              name="hands-clapping" 
              size={22} 
              color={clapCount > 0 ? "#FFD700" : "#666"} 
            />
          </Animated.View>
          <Text style={[styles.interactionText, clapCount > 0 && { color: "#FFD700" }]}>
            {post.claps + clapCount}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity 
          style={styles.interactionButton}
          onPress={onComment}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.interactionText}>{post.comments}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.interactionButton}
          onPress={onShare}
        >
          <Ionicons name="share-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={onSave}
      >
        <Ionicons 
          name={post.isSaved ? "bookmark" : "bookmark-outline"} 
          size={22} 
          color={post.isSaved ? "#007AFF" : "#666"} 
        />
      </TouchableOpacity>
    </View>
  );

  const postTypeStyle = getPostTypeStyle();

  return (
    <View style={[styles.container, postTypeStyle]}>
      {post.trending && (
        <View style={styles.trendingBadge}>
          <Ionicons name="trending-up" size={12} color="#FF5722" />
          <Text style={styles.trendingText}>Trending</Text>
        </View>
      )}
      
      <AuthorHeader />
      <PostContent />
      <InteractionBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  trendingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
    marginLeft: 4,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  authorTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postTypeIndicator: {
    padding: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Project showcase styles
  projectShowcase: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  techTag: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  techTagText: {
    fontSize: 12,
    color: '#666',
  },
  projectActions: {
    flexDirection: 'row',
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  demoButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  projectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  // Challenge styles
  challengeContent: {
    backgroundColor: '#fff3f0',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  challengeXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  takeButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  takeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Skill verification styles
  skillVerification: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  testScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  endorseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
  },
  endorseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  // Milestone styles
  milestoneDisplay: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  milestoneGradient: {
    padding: 16,
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // AI insight styles
  aiInsight: {
    backgroundColor: '#f0fdff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  aiConfidence: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
  },
  aiMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aiMetric: {
    alignItems: 'center',
  },
  aiMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  aiMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Interaction bar styles
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  interactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  saveButton: {
    padding: 4,
  },
});

export default FeedPost;
