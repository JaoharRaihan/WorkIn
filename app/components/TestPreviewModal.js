import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Card from './Card';
import Button from './Button';

const TestPreviewModal = ({ 
  visible, 
  onClose, 
  testData, 
  stepContext, 
  onStartTest 
}) => {
  if (!testData) return null;

  const { type, title, description, timeLimit, questions, problems, requirements } = testData;

  const getTestTypeInfo = () => {
    switch (type) {
      case 'mcq':
        return {
          icon: 'help-circle-outline',
          color: '#007AFF',
          gradient: ['#007AFF', '#0056CC'],
          typeName: 'Multiple Choice',
          details: `${questions?.length || 0} questions`
        };
      case 'coding':
        return {
          icon: 'code-slash-outline',
          color: '#34C759',
          gradient: ['#34C759', '#28A745'],
          typeName: 'Coding Challenge',
          details: `${problems?.length || 0} problems`
        };
      case 'project':
        return {
          icon: 'folder-outline',
          color: '#FF6B35',
          gradient: ['#FF6B35', '#FF4500'],
          typeName: 'Project Submission',
          details: `${requirements?.length || 0} requirements`
        };
      default:
        return {
          icon: 'document-outline',
          color: '#8E8E93',
          gradient: ['#8E8E93', '#6D6D70'],
          typeName: 'Assessment',
          details: 'Mixed format'
        };
    }
  };

  const typeInfo = getTestTypeInfo();

  const renderMCQPreview = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Question Topics</Text>
      <View style={styles.topicsList}>
        {questions?.slice(0, 3).map((question, index) => (
          <View key={index} style={styles.topicItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
            <Text style={styles.topicText} numberOfLines={1}>
              {question.question.split('?')[0]}...
            </Text>
          </View>
        ))}
        {questions?.length > 3 && (
          <Text style={styles.moreTopics}>
            +{questions.length - 3} more questions
          </Text>
        )}
      </View>
    </View>
  );

  const renderCodingPreview = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Coding Challenges</Text>
      <View style={styles.challengesList}>
        {problems?.map((problem, index) => (
          <View key={index} style={styles.challengeItem}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>{problem.title}</Text>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(problem.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>{problem.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.challengeDescription} numberOfLines={2}>
              {problem.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProjectPreview = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Project Requirements</Text>
      <View style={styles.requirementsList}>
        {requirements?.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#34C759';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Test Preview</Text>
            <Text style={styles.headerSubtitle}>
              {stepContext?.title} Checkpoint
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Test Type Card */}
          <Card style={styles.testTypeCard}>
            <LinearGradient
              colors={typeInfo.gradient}
              style={styles.testTypeGradient}
            >
              <View style={styles.testTypeContent}>
                <Ionicons name={typeInfo.icon} size={32} color="#fff" />
                <View style={styles.testTypeInfo}>
                  <Text style={styles.testTypeName}>{typeInfo.typeName}</Text>
                  <Text style={styles.testTypeDetails}>{typeInfo.details}</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>

          {/* Test Details */}
          <Card style={styles.detailsCard}>
            <Text style={styles.testTitle}>{title}</Text>
            <Text style={styles.testDescription}>{description}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.metaText}>{timeLimit} minutes</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="trophy-outline" size={20} color="#FF9500" />
                <Text style={styles.metaText}>{stepContext?.xpReward} XP</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
                <Text style={styles.metaText}>70% to pass</Text>
              </View>
            </View>
          </Card>

          {/* Content Preview */}
          {type === 'mcq' && renderMCQPreview()}
          {type === 'coding' && renderCodingPreview()}
          {type === 'project' && renderProjectPreview()}

          {/* Tips */}
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color="#FF9500" />
              <Text style={styles.tipsTitle}>Success Tips</Text>
            </View>
            
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Read questions carefully before answering</Text>
              <Text style={styles.tipItem}>• Take your time, but watch the clock</Text>
              <Text style={styles.tipItem}>• Review your answers before submitting</Text>
              {type === 'coding' && (
                <Text style={styles.tipItem}>• Test your code with the provided examples</Text>
              )}
              {type === 'project' && (
                <Text style={styles.tipItem}>• Ensure all requirements are met</Text>
              )}
            </View>
          </Card>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Start Test"
            onPress={onStartTest}
            variant="primary"
            style={styles.startButton}
            icon="play-circle"
          />
          
          <TouchableOpacity style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E8ED',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1D29',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Test Type Card
  testTypeCard: {
    marginVertical: 16,
    overflow: 'hidden',
  },
  testTypeGradient: {
    padding: 20,
  },
  testTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testTypeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  testTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  testTypeDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  
  // Details Card
  detailsCard: {
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1D29',
    marginLeft: 4,
  },
  
  // Content sections
  contentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 12,
  },
  
  // MCQ Preview
  topicsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#1A1D29',
    marginLeft: 8,
    flex: 1,
  },
  moreTopics: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Coding Preview
  challengesList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  challengeItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D29',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  challengeDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  
  // Project Preview
  requirementsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#1A1D29',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  
  // Tips Card
  tipsCard: {
    marginBottom: 100, // Space for bottom actions
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginLeft: 8,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Bottom Actions
  bottomActions: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#E1E8ED',
  },
  startButton: {
    marginBottom: 12,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default TestPreviewModal;
