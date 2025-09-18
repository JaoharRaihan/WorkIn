import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  ActivityIndicator 
} from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import challengeService from '../services/challengeService';

export const DailyChallengeCard = ({ 
  challenge, 
  onChallengeStart, 
  style,
  autoRefresh = true 
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Calculate time left until next challenge
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, []);

  // Update countdown every minute
  useEffect(() => {
    if (!autoRefresh) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [calculateTimeLeft, autoRefresh]);

  // Pulse animation for new challenge indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleStartChallenge = useCallback(async () => {
    if (isStarting || hasStarted) return;

    try {
      setIsStarting(true);
      
      const response = await challengeService.startChallenge(challenge.id);
      
      if (response.success) {
        setHasStarted(true);
        setProgress(0);
        onChallengeStart?.(challenge, response.data);
      }
    } catch (error) {
      console.error('Error starting daily challenge:', error);
    } finally {
      setIsStarting(false);
    }
  }, [challenge, isStarting, hasStarted, onChallengeStart]);

  const getDifficultyInfo = () => {
    const difficulty = challenge?.difficulty?.toLowerCase() || 'medium';
    const configs = {
      easy: { color: '#4CAF50', icon: '🟢', description: 'Perfect for beginners' },
      medium: { color: '#FF9800', icon: '🟡', description: 'Great practice challenge' },
      hard: { color: '#F44336', icon: '🔴', description: 'Expert level challenge' },
    };
    return configs[difficulty] || configs.medium;
  };

  const renderChallengeHeader = () => {
    const diffInfo = getDifficultyInfo();
    
    return (
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Animated.View style={[styles.dailyBadge, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.dailyIcon}>🌟</Text>
              <Text style={styles.dailyText}>Daily Challenge</Text>
            </Animated.View>
            <View style={styles.timeLeftContainer}>
              <Text style={styles.timeLeftIcon}>⏰</Text>
              <Text style={styles.timeLeftText}>Resets in {timeLeft}</Text>
            </View>
          </View>
          
          <Text style={styles.challengeTitle} numberOfLines={2}>
            {challenge?.title || 'Loading Challenge...'}
          </Text>
          
          <View style={styles.difficultyRow}>
            <Text style={styles.difficultyIcon}>{diffInfo.icon}</Text>
            <Text style={[styles.difficultyText, { color: diffInfo.color }]}>
              {challenge?.difficulty || 'Medium'}
            </Text>
            <Text style={styles.difficultyDescription}>• {diffInfo.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderChallengeContent = () => (
    <View style={styles.content}>
      <Text style={styles.description} numberOfLines={3}>
        {challenge?.description || 'Challenge description will appear here...'}
      </Text>
      
      <View style={styles.rewardsSection}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>⭐</Text>
          <Text style={styles.rewardText}>
            {challenge?.xpReward || 100} XP
          </Text>
        </View>
        
        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>🏆</Text>
          <Text style={styles.rewardText}>Daily Streak</Text>
        </View>
        
        {challenge?.timeLimit && (
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>⏱️</Text>
            <Text style={styles.rewardText}>{challenge.timeLimit}</Text>
          </View>
        )}
      </View>

      {challenge?.skills && challenge.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsLabel}>Skills:</Text>
          {challenge.skills.slice(0, 3).map((skill, index) => (
            <Badge 
              key={index}
              text={skill}
              color="#FFF3E0"
              textColor="#E65100"
              style={styles.skillBadge}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderProgressSection = () => {
    if (!hasStarted) return null;
    
    return (
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Challenge Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    );
  };

  const renderActionButton = () => {
    if (hasStarted) {
      return (
        <TouchableOpacity style={[styles.actionButton, styles.continueButton]}>
          <Text style={styles.continueButtonText}>Continue Challenge</Text>
          <Text style={styles.buttonIcon}>▶️</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.actionButton, styles.startButton]}
        onPress={handleStartChallenge}
        disabled={isStarting}
        activeOpacity={0.8}
      >
        {isStarting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.startButtonText}>Start Daily Challenge</Text>
            <Text style={styles.buttonIcon}>🚀</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (!challenge) {
    return (
      <Card style={[styles.container, styles.loadingContainer, style]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading daily challenge...</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.container, style]}>
      {renderChallengeHeader()}
      {renderChallengeContent()}
      {renderProgressSection()}
      {renderActionButton()}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 16,
  },
  titleSection: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dailyIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dailyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLeftIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timeLeftText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 26,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyDescription: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  content: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  rewardsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  skillsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginRight: 8,
  },
  skillBadge: {
    marginRight: 6,
    marginBottom: 4,
  },
  progressSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#C8E6C9',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 50,
  },
  startButton: {
    backgroundColor: '#FF9800',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 16,
  },
});

export default DailyChallengeCard;
