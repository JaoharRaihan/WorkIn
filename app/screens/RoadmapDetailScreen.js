import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoadmap } from '../context/RoadmapContext';
import { useProfile } from '../context/ProfileContext';

export default function RoadmapDetailScreen({ route, navigation }) {
  const { roadmapId } = route.params;
  const {
    allRoadmaps,
    userProgress,
    startRoadmap,
    completeStep,
    updateStepProgress,
    isStepUnlocked,
    getRoadmapProgress,
    getStepProgress,
  } = useRoadmap();

  const { gainXP } = useProfile();

  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [currentStepTimer, setCurrentStepTimer] = useState(0);
  const [isStepInProgress, setIsStepInProgress] = useState(false);

  const roadmap = allRoadmaps.find(r => r.id === roadmapId);
  const progress = getRoadmapProgress(roadmapId);

  useEffect(() => {
    let timer;
    if (isStepInProgress) {
      timer = setInterval(() => {
        setCurrentStepTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStepInProgress]);

  if (!roadmap) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Roadmap not found</Text>
      </SafeAreaView>
    );
  }

  const handleStartRoadmap = () => {
    if (!progress) {
      startRoadmap(roadmapId);
    }
  };

  const handleStepPress = (step) => {
    const unlocked = progress ? isStepUnlocked(roadmapId, step.id) : step.id === 1;
    
    if (!unlocked) {
      Alert.alert(
        'Step Locked',
        'Complete previous steps to unlock this lesson.'
      );
      return;
    }

    setSelectedStep(step);
    setShowStepModal(true);
  };

  const handleStartStep = () => {
    setIsStepInProgress(true);
    setCurrentStepTimer(0);
    setShowStepModal(false);
    
    // Navigate to learning content based on step type
    if (selectedStep.type === 'lesson') {
      // In a real app, this would navigate to lesson content
      simulateLearning();
    } else if (selectedStep.type === 'project') {
      // Navigate to project instructions
      simulateProject();
    }
  };

  const simulateLearning = () => {
    // Simulate learning session
    setTimeout(() => {
      const timeSpent = currentStepTimer + Math.floor(Math.random() * 300) + 120; // 2-7 minutes
      const testScore = Math.floor(Math.random() * 40) + 60; // 60-100
      
      completeStep(roadmapId, selectedStep.id, timeSpent, testScore);
      setIsStepInProgress(false);
      
      Alert.alert(
        '🎉 Step Completed!',
        `Great job! You earned ${Math.floor(timeSpent / 5) + (testScore >= 80 ? 50 : 25)} XP`,
        [{ text: 'Continue', onPress: () => setSelectedStep(null) }]
      );
    }, 3000); // Simulate 3 second learning
  };

  const simulateProject = () => {
    // Simulate project completion
    setTimeout(() => {
      const timeSpent = currentStepTimer + Math.floor(Math.random() * 600) + 300; // 5-15 minutes
      const testScore = Math.floor(Math.random() * 30) + 70; // 70-100
      
      completeStep(roadmapId, selectedStep.id, timeSpent, testScore);
      setIsStepInProgress(false);
      
      Alert.alert(
        '🚀 Project Completed!',
        `Excellent work! You earned ${Math.floor(timeSpent / 5) + (testScore >= 80 ? 50 : 25)} XP`,
        [{ text: 'Continue', onPress: () => setSelectedStep(null) }]
      );
    }, 5000); // Simulate 5 second project work
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepStatus = (step) => {
    if (!progress) return 'locked';
    
    if (progress.completedSteps.includes(step.id)) {
      return 'completed';
    } else if (isStepUnlocked(roadmapId, step.id)) {
      return 'unlocked';
    } else {
      return 'locked';
    }
  };

  const renderStepCard = ({ item: step, index }) => {
    const status = getStepStatus(step);
    const stepProgress = getStepProgress(roadmapId, step.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.stepCard,
          status === 'completed' && styles.completedStepCard,
          status === 'locked' && styles.lockedStepCard,
        ]}
        onPress={() => handleStepPress(step)}
        disabled={status === 'locked'}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={[
              styles.stepNumberText,
              status === 'completed' && styles.completedStepNumberText,
              status === 'locked' && styles.lockedStepNumberText,
            ]}>
              {status === 'completed' ? '✓' : index + 1}
            </Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[
              styles.stepTitle,
              status === 'locked' && styles.lockedStepTitle,
            ]}>
              {step.title}
            </Text>
            <Text style={[
              styles.stepDescription,
              status === 'locked' && styles.lockedStepDescription,
            ]}>
              {step.description}
            </Text>
          </View>
          <View style={styles.stepMeta}>
            <View style={styles.stepTypeContainer}>
              <Ionicons
                name={step.type === 'lesson' ? 'book-outline' : 'construct-outline'}
                size={16}
                color={status === 'locked' ? '#ccc' : '#666'}
              />
              <Text style={[
                styles.stepType,
                status === 'locked' && styles.lockedStepText,
              ]}>
                {step.type}
              </Text>
            </View>
            <View style={styles.stepTimeContainer}>
              <Ionicons
                name="time-outline"
                size={16}
                color={status === 'locked' ? '#ccc' : '#666'}
              />
              <Text style={[
                styles.stepTime,
                status === 'locked' && styles.lockedStepText,
              ]}>
                {step.estimatedTime}m
              </Text>
            </View>
          </View>
        </View>
        
        {status === 'completed' && stepProgress && (
          <View style={styles.stepCompletedInfo}>
            <Text style={styles.completionDate}>
              Completed {new Date(stepProgress.completedDate).toLocaleDateString()}
            </Text>
            <Text style={styles.stepScore}>
              Score: {stepProgress.testScore}%
            </Text>
          </View>
        )}
        
        {status === 'locked' && step.prerequisiteSteps.length > 0 && (
          <View style={styles.prerequisiteInfo}>
            <Text style={styles.prerequisiteText}>
              Complete previous steps to unlock
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const overallProgress = progress 
    ? Math.round((progress.completedSteps.length / roadmap.steps.length) * 100)
    : 0;

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
        <Text style={styles.headerTitle}>Roadmap</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Roadmap Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
          <Text style={styles.roadmapDescription}>{roadmap.description}</Text>
          
          <View style={styles.roadmapMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{roadmap.estimatedTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{roadmap.difficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{roadmap.learners.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.instructorSection}>
            <Ionicons name="person-circle-outline" size={20} color="#666" />
            <Text style={styles.instructorText}>Instructor: {roadmap.instructor}</Text>
          </View>

          {/* Progress Section */}
          {progress ? (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressPercentage}>{overallProgress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
              </View>
              <Text style={styles.progressStats}>
                {progress.completedSteps.length} of {roadmap.steps.length} steps completed
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={handleStartRoadmap}>
              <Ionicons name="play-circle-outline" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Learning</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Skills You'll Learn */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills You'll Learn</Text>
          <View style={styles.skillsContainer}>
            {roadmap.skillsYouWillLearn.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Learning Path */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Learning Path</Text>
          <FlatList
            data={roadmap.steps}
            renderItem={renderStepCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Step Modal */}
      <Modal
        visible={showStepModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStepModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Start Step</Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedStep && (
            <View style={styles.modalContent}>
              <Text style={styles.modalStepTitle}>{selectedStep.title}</Text>
              <Text style={styles.modalStepDescription}>{selectedStep.description}</Text>
              
              <View style={styles.stepDetails}>
                <View style={styles.stepDetailItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.stepDetailText}>
                    Estimated time: {selectedStep.estimatedTime} minutes
                  </Text>
                </View>
                <View style={styles.stepDetailItem}>
                  <Ionicons name="trophy-outline" size={20} color="#666" />
                  <Text style={styles.stepDetailText}>
                    Earn XP by completing this step
                  </Text>
                </View>
                {selectedStep.test && (
                  <View style={styles.stepDetailItem}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
                    <Text style={styles.stepDetailText}>
                      Includes {selectedStep.test.type} test
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.startStepButton} onPress={handleStartStep}>
                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                <Text style={styles.startStepButtonText}>Start Learning</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Learning Progress Overlay */}
      {isStepInProgress && (
        <View style={styles.learningOverlay}>
          <View style={styles.learningCard}>
            <Text style={styles.learningTitle}>Learning in Progress...</Text>
            <Text style={styles.learningTimer}>{formatTime(currentStepTimer)}</Text>
            <Text style={styles.learningStep}>{selectedStep?.title}</Text>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  overviewCard: {
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
  roadmapTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roadmapDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  roadmapMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  instructorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  progressSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressStats: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skillsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  stepsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedStepCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#30D158',
  },
  lockedStepCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedStepNumberText: {
    color: '#fff',
    fontSize: 16,
  },
  lockedStepNumberText: {
    color: '#ccc',
  },
  stepInfo: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lockedStepTitle: {
    color: '#999',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lockedStepDescription: {
    color: '#999',
  },
  stepMeta: {
    alignItems: 'flex-end',
  },
  stepTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  stepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  lockedStepText: {
    color: '#ccc',
  },
  stepCompletedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#30D158',
  },
  completionDate: {
    fontSize: 12,
    color: '#30D158',
  },
  stepScore: {
    fontSize: 12,
    color: '#30D158',
    fontWeight: '600',
  },
  prerequisiteInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  prerequisiteText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCancel: {
    color: '#666',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalStepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalStepDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  stepDetails: {
    marginBottom: 32,
  },
  stepDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepDetailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  startStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startStepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  learningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  learningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    margin: 40,
  },
  learningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  learningTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  learningStep: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
