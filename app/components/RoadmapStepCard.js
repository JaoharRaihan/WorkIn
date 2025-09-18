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

const { width } = Dimensions.get('window');

const RoadmapStepCard = ({ 
  step, 
  stepIndex,
  totalSteps,
  onStepPress,
  onCheckpointPress,
  style 
}) => {
  const {
    id,
    title,
    summary,
    status = 'locked', // 'locked', 'available', 'in_progress', 'completed'
    hasCheckpointTest = false,
    checkpointTestId = null,
    estimatedTime = '2 hours',
    xpReward = 50,
    prerequisites = [],
    resources = [],
  } = step;

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: '#34C759',
          bgColor: '#F0FDF4',
          icon: 'checkmark-circle',
          text: 'Completed',
          gradient: ['#34C759', '#28A745']
        };
      case 'in_progress':
        return {
          color: '#007AFF',
          bgColor: '#F0F9FF',
          icon: 'play-circle',
          text: 'In Progress',
          gradient: ['#007AFF', '#0056CC']
        };
      case 'available':
        return {
          color: '#FF9500',
          bgColor: '#FFF9E6',
          icon: 'radio-button-off',
          text: 'Available',
          gradient: ['#FF9500', '#FF7A00']
        };
      default: // locked
        return {
          color: '#8E8E93',
          bgColor: '#F8F9FA',
          icon: 'lock-closed',
          text: 'Locked',
          gradient: ['#8E8E93', '#6D6D70']
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isInteractable = status === 'available' || status === 'in_progress';
  const isCompleted = status === 'completed';

  return (
    <View style={[styles.container, style]}>
      {/* Step Number Connector */}
      <View style={styles.stepConnector}>
        <View style={styles.stepNumberContainer}>
          <View style={[styles.stepNumber, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
          </View>
        </View>
        
        {stepIndex < totalSteps - 1 && (
          <View style={[
            styles.connectorLine,
            { backgroundColor: isCompleted ? statusConfig.color : '#E5E7EB' }
          ]} />
        )}
      </View>

      {/* Step Content Card */}
      <TouchableOpacity
        style={[
          styles.stepCard,
          { 
            backgroundColor: statusConfig.bgColor,
            borderColor: statusConfig.color,
            opacity: status === 'locked' ? 0.6 : 1
          }
        ]}
        onPress={() => isInteractable && onStepPress?.(step)}
        disabled={!isInteractable}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.stepHeader}>
          <View style={styles.stepTitleSection}>
            <Text style={styles.stepTitle} numberOfLines={2}>
              {title}
            </Text>
            
            <View style={styles.statusRow}>
              <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>

          <View style={styles.rewardSection}>
            <View style={styles.xpReward}>
              <Ionicons name="flash" size={14} color="#FF9500" />
              <Text style={styles.xpText}>{xpReward} XP</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.stepSummary} numberOfLines={3}>
          {summary}
        </Text>

        {/* Meta Information */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>{estimatedTime}</Text>
          </View>

          {prerequisites.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="link-outline" size={14} color="#8E8E93" />
              <Text style={styles.metaText}>{prerequisites.length} prerequisites</Text>
            </View>
          )}

          {resources.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="library-outline" size={14} color="#8E8E93" />
              <Text style={styles.metaText}>{resources.length} resources</Text>
            </View>
          )}
        </View>

        {/* Checkpoint Test Section */}
        {hasCheckpointTest && (
          <View style={styles.checkpointSection}>
            <View style={styles.checkpointHeader}>
              <Ionicons name="clipboard-outline" size={16} color="#007AFF" />
              <Text style={styles.checkpointTitle}>Checkpoint Test</Text>
              {isCompleted && (
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              )}
            </View>

            {isInteractable && (
              <TouchableOpacity
                style={styles.checkpointButton}
                onPress={() => onCheckpointPress?.(checkpointTestId, step)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={statusConfig.gradient}
                  style={styles.checkpointButtonGradient}
                >
                  <Ionicons 
                    name={isCompleted ? "checkmark" : "play"} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.checkpointButtonText}>
                    {isCompleted ? 'Retake Test' : 'Take Test'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Progress Indicator for In Progress */}
        {status === 'in_progress' && (
          <View style={styles.progressIndicator}>
            <View style={styles.progressDots}>
              {[...Array(3)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    { 
                      backgroundColor: statusConfig.color,
                      opacity: 0.3 + (i * 0.3)
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.progressText, { color: statusConfig.color }]}>
              Keep going!
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  stepConnector: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberContainer: {
    zIndex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    minHeight: 40,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rewardSection: {
    alignItems: 'flex-end',
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  stepSummary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  checkpointSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  checkpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  checkpointTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
  },
  checkpointButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkpointButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  checkpointButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RoadmapStepCard;
