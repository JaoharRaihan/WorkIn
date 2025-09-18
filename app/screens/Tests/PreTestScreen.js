import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Card from '../../components/Card';
import Button from '../../components/Button';
import PreTestService from '../../services/preTestService';

const PreTestScreen = ({ route }) => {
  const navigation = useNavigation();
  const { onComplete } = route.params || {};
  
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preTestService] = useState(new PreTestService());
  
  const assessmentTypes = [
    {
      id: 'programming',
      title: 'Programming & Development',
      description: 'Assess your programming knowledge across languages and frameworks',
      icon: 'code-slash',
      color: '#007AFF',
      gradient: ['#007AFF', '#0056CC'],
      timeEstimate: '20 minutes',
      skillAreas: ['JavaScript', 'Web Development', 'Algorithms', 'Design Patterns'],
      difficulty: 'Mixed'
    },
    {
      id: 'design',
      title: 'Design & User Experience',
      description: 'Evaluate your design thinking and UX/UI knowledge',
      icon: 'color-palette',
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF4500'],
      timeEstimate: '15 minutes',
      skillAreas: ['UX Research', 'Visual Design', 'Color Theory', 'Typography'],
      difficulty: 'Mixed'
    },
    {
      id: 'business',
      title: 'Business & Marketing',
      description: 'Test your business acumen and marketing expertise',
      icon: 'briefcase',
      color: '#34C759',
      gradient: ['#34C759', '#28A745'],
      timeEstimate: '15 minutes',
      skillAreas: ['ROI Analysis', 'Marketing Funnel', 'A/B Testing', 'Strategy'],
      difficulty: 'Mixed'
    }
  ];

  const handleAssessmentSelect = (assessment) => {
    setSelectedAssessment(assessment);
  };

  const handleStartAssessment = async () => {
    if (!selectedAssessment) {
      Alert.alert('Selection Required', 'Please select an assessment to continue.');
      return;
    }

    setLoading(true);

    try {
      // Get the assessment data from the service
      const assessmentData = preTestService.skillAssessments[selectedAssessment.id];
      
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      // Navigate to the existing test screen with pre-test data
      navigation.navigate('MCQTest', {
        testId: assessmentData.id,
        testTitle: assessmentData.title,
        testDescription: assessmentData.description,
        questions: assessmentData.questions,
        timeLimit: assessmentData.timeLimit,
        isPreTest: true,
        onTestComplete: handleTestComplete
      });
      
    } catch (error) {
      console.error('Error starting assessment:', error);
      Alert.alert('Error', 'Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = async (testResults) => {
    setLoading(true);
    
    try {
      // Analyze the test results
      const skillAnalysis = preTestService.analyzePreTestResults(
        testResults.answers,
        selectedAssessment.id
      );

      // Generate personalized roadmaps
      const personalization = preTestService.generatePersonalizedRoadmaps(skillAnalysis);

      // Show results summary
      showResultsSummary(skillAnalysis, personalization);

      // Call the completion callback
      if (onComplete) {
        onComplete({
          assessment: selectedAssessment,
          skillAnalysis,
          personalization,
          testResults
        });
      }

    } catch (error) {
      console.error('Error processing test results:', error);
      Alert.alert('Error', 'Failed to process test results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showResultsSummary = (skillAnalysis, personalization) => {
    const { percentage, overallLevel, skillProfile } = skillAnalysis;
    const { personalizedRoadmaps } = personalization;

    const strongSkills = Object.entries(skillProfile)
      .filter(([_, data]) => data.strength)
      .map(([skill]) => skill.replace('_', ' '));

    const weakSkills = Object.entries(skillProfile)
      .filter(([_, data]) => data.needsImprovement)
      .map(([skill]) => skill.replace('_', ' '));

    Alert.alert(
      '🎉 Assessment Complete!',
      `Score: ${Math.round(percentage)}%\n` +
      `Level: ${overallLevel.charAt(0).toUpperCase() + overallLevel.slice(1)}\n\n` +
      `Strong Areas: ${strongSkills.join(', ') || 'None identified'}\n` +
      `Focus Areas: ${weakSkills.join(', ') || 'None identified'}\n\n` +
      `Generated ${personalizedRoadmaps.length} personalized roadmaps for you!`,
      [
        {
          text: 'View Roadmaps',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const renderAssessmentCard = (assessment) => {
    const isSelected = selectedAssessment?.id === assessment.id;
    
    return (
      <TouchableOpacity
        key={assessment.id}
        onPress={() => handleAssessmentSelect(assessment)}
        activeOpacity={0.8}
      >
        <Card 
          style={[
            styles.assessmentCard,
            isSelected && { 
              borderColor: assessment.color,
              borderWidth: 2,
              transform: [{ scale: 1.02 }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${assessment.color}15` }]}>
              <Ionicons name={assessment.icon} size={28} color={assessment.color} />
            </View>
            
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: assessment.color }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </View>

          {/* Content */}
          <Text style={styles.assessmentTitle}>{assessment.title}</Text>
          <Text style={styles.assessmentDescription}>{assessment.description}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{assessment.timeEstimate}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{assessment.difficulty}</Text>
            </View>
          </View>

          {/* Skill Areas */}
          <View style={styles.skillAreasContainer}>
            <Text style={styles.skillAreasTitle}>Skill Areas Covered:</Text>
            <View style={styles.skillTags}>
              {assessment.skillAreas.map((skill, index) => (
                <View key={index} style={[styles.skillTag, { borderColor: assessment.color }]}>
                  <Text style={[styles.skillTagText, { color: assessment.color }]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <LinearGradient
              colors={assessment.gradient}
              style={styles.selectionIndicator}
            >
              <Text style={styles.selectedText}>Selected</Text>
            </LinearGradient>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Pre-Assessment</Text>
          <Text style={styles.subtitle}>Get personalized learning recommendations</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <Card style={styles.introCard}>
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>🎯 Why Take an Assessment?</Text>
            <Text style={styles.introText}>
              We'll analyze your current skills and create personalized learning roadmaps 
              tailored to your level and goals. This helps you:
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.benefitText}>Skip content you already know</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.benefitText}>Focus on areas that need improvement</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.benefitText}>Get learning paths matched to your goals</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Assessment Selection */}
        <View style={styles.selectionContainer}>
          <Text style={styles.sectionTitle}>Choose Your Assessment</Text>
          <Text style={styles.sectionSubtitle}>
            Select the area you want to focus on. You can take multiple assessments later.
          </Text>
          
          {assessmentTypes.map(renderAssessmentCard)}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        {selectedAssessment && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoText}>
              Ready to start {selectedAssessment.title} assessment?
            </Text>
            <Text style={styles.timeInfo}>
              ⏱️ Estimated time: {selectedAssessment.timeEstimate}
            </Text>
          </View>
        )}
        
        <Button
          title={loading ? 'Starting...' : 'Start Assessment'}
          onPress={handleStartAssessment}
          disabled={!selectedAssessment || loading}
          variant="primary"
          style={styles.startButton}
          icon={loading ? undefined : 'play-circle'}
        />
        
        {loading && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1D29',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Introduction card
  introCard: {
    marginVertical: 16,
  },
  introContent: {
    padding: 4,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#1A1D29',
    flex: 1,
  },
  
  // Selection container
  selectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  
  // Assessment card styles
  assessmentCard: {
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 8,
  },
  assessmentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Meta information
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  
  // Skill areas
  skillAreasContainer: {
    marginBottom: 12,
  },
  skillAreasTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  // Selection indicator
  selectionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 2,
  },
  
  // Bottom container
  bottomContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E1E8ED',
  },
  selectedInfo: {
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1D29',
    textAlign: 'center',
  },
  timeInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  startButton: {
    marginBottom: 8,
  },
  loader: {
    marginTop: 8,
  },
});

export default PreTestScreen;
