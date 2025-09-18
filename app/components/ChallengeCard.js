import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import challengeService from '../services/challengeService';

export const ChallengeCard = ({ 
  challenge, 
  onChallengeStart, 
  style,
  showParticipants = true,
  showTimeLimit = true 
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#2196F3';
    }
  }, []);

  const handleStartChallenge = useCallback(async () => {
    if (isStarting || hasStarted) return;

    try {
      setIsStarting(true);
      
      // Start the challenge
      const response = await challengeService.startChallenge(challenge.id);
      
      if (response.success) {
        setHasStarted(true);
        onChallengeStart?.(challenge, response.data);
      } else {
        Alert.alert('Error', 'Failed to start challenge. Please try again.');
      }
    } catch (error) {
      console.error('Error starting challenge:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsStarting(false);
    }
  }, [challenge, isStarting, hasStarted, onChallengeStart]);

  const renderChallengeHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Badge 
          text={challenge.difficulty || 'Medium'}
          color={getDifficultyColor(challenge.difficulty)}
          style={styles.difficultyBadge}
        />
      </View>
      
      {challenge.category && (
        <Text style={styles.category}>{challenge.category}</Text>
      )}
    </View>
  );

  const renderChallengeDetails = () => (
    <View style={styles.details}>
      <Text style={styles.description} numberOfLines={3}>
        {challenge.description}
      </Text>
      
      <View style={styles.metaRow}>
        {showTimeLimit && challenge.timeLimit && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaText}>{challenge.timeLimit}</Text>
          </View>
        )}
        
        {showParticipants && challenge.participants && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{challenge.participants} participants</Text>
          </View>
        )}

        {challenge.xpReward && (
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⭐</Text>
            <Text style={styles.metaText}>{challenge.xpReward} XP</Text>
          </View>
        )}
      </View>

      {challenge.skills && challenge.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {challenge.skills.slice(0, 3).map((skill, index) => (
            <Badge 
              key={index}
              text={skill}
              color="#E3F2FD"
              textColor="#1976D2"
              style={styles.skillBadge}
            />
          ))}
          {challenge.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{challenge.skills.length - 3} more</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderActionButton = () => {
    if (hasStarted) {
      return (
        <View style={[styles.actionButton, styles.startedButton]}>
          <Text style={styles.startedButtonText}>Challenge Started</Text>
        </View>
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
            <Text style={styles.startButtonText}>Start Challenge</Text>
            <Text style={styles.startButtonIcon}>🚀</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (!challenge) {
    return null;
  }

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.challengeTypeHeader}>
        <Text style={styles.challengeTypeIcon}>🎯</Text>
        <Text style={styles.challengeTypeText}>Challenge</Text>
      </View>
      
      {renderChallengeHeader()}
      {renderChallengeDetails()}
      {renderActionButton()}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  challengeTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  challengeTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  challengeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
    lineHeight: 24,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillBadge: {
    marginRight: 6,
    marginBottom: 4,
  },
  moreSkills: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 48,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  startButtonIcon: {
    fontSize: 16,
  },
  startedButton: {
    backgroundColor: '#4CAF50',
  },
  startedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChallengeCard;
