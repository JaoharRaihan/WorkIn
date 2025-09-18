import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HeatmapProgress from './HeatmapProgress';

const { width } = Dimensions.get('window');

const RoadmapCard = ({ 
  roadmap, 
  onPress, 
  userProgress = null,
  style 
}) => {
  const {
    id,
    title,
    description,
    tags = [],
    isPremium = false,
    difficulty = 'Beginner',
    estimatedWeeks = 4,
    affiliateInfo = null,
    externalCourseLink = null,
    totalSteps = 10,
  } = roadmap;

  // Calculate progress percentage
  const progressPercentage = userProgress ? 
    Math.round((userProgress.completedSteps?.length || 0) / totalSteps * 100) : 0;

  const isStarted = userProgress && userProgress.completedSteps?.length > 0;
  const isCompleted = progressPercentage === 100;

  const getStatusColor = () => {
    if (isCompleted) return '#34C759';
    if (isStarted) return '#007AFF';
    return '#8E8E93';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isStarted) return 'In Progress';
    return 'Not Started';
  };

  const getDifficultyColor = () => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#34C759';
      case 'intermediate': return '#FF9500';
      case 'advanced': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(roadmap)}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        {isStarted && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: getStatusColor()
                  }
                ]} 
              />
            </View>

            {/* Heatmap for recent activity */}
            {userProgress?.heatmapData && (
              <HeatmapProgress 
                data={userProgress.heatmapData}
                size="small"
                style={styles.heatmap}
              />
            )}
          </View>
        )}

        {/* Tags and Meta Info */}
        <View style={styles.metaSection}>
          <View style={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
            )}
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.metaText}>{estimatedWeeks}w</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={14} color={getDifficultyColor()} />
              <Text style={[styles.metaText, { color: getDifficultyColor() }]}>
                {difficulty}
              </Text>
            </View>

            {isPremium && totalSteps && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{totalSteps} steps</Text>
              </View>
            )}
          </View>
        </View>

        {/* Premium Features */}
        {isPremium && (
          <View style={styles.premiumFeatures}>
            {affiliateInfo && (
              <View style={styles.affiliateInfo}>
                <Ionicons name="link-outline" size={14} color="#007AFF" />
                <Text style={styles.affiliateText}>
                  Partnership with {affiliateInfo.partner}
                </Text>
              </View>
            )}
            
            {externalCourseLink && (
              <TouchableOpacity style={styles.externalLink}>
                <Ionicons name="open-outline" size={14} color="#FF6B35" />
                <Text style={styles.externalLinkText}>External Course Available</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionSection}>
          {isCompleted ? (
            <TouchableOpacity style={[styles.actionButton, styles.completedButton]}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={[styles.actionButtonText, styles.completedButtonText]}>
                Completed
              </Text>
            </TouchableOpacity>
          ) : (
            <LinearGradient
              colors={isStarted ? ['#007AFF', '#0056CC'] : ['#8E8E93', '#6D6D70']}
              style={styles.actionButtonGradient}
            >
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons 
                  name={isStarted ? "play-circle" : "rocket"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.actionButtonText}>
                  {isStarted ? 'Continue Learning' : 'Start Roadmap'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#E1E8ED',
  },
  header: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D29',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D29',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  heatmap: {
    alignSelf: 'center',
  },
  metaSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  premiumFeatures: {
    marginBottom: 16,
    gap: 8,
  },
  affiliateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
  },
  affiliateText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  externalLinkText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  actionSection: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  actionButtonGradient: {
    borderRadius: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  completedButton: {
    backgroundColor: '#F0FDF4',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completedButtonText: {
    color: '#34C759',
  },
});

export default RoadmapCard;
