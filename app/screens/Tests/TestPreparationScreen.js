import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

const TestPreparationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { test } = route.params || {};
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [studyProgress, setStudyProgress] = useState({});
  const [completedMaterials, setCompletedMaterials] = useState(new Set());
  const [studyTime, setStudyTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Study timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setStudyTime(time => time + 1);
      }, 1000);
    } else if (!timerActive && studyTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, studyTime]);

  // Mark material as completed
  const markMaterialCompleted = (materialId) => {
    const newCompleted = new Set(completedMaterials);
    if (newCompleted.has(materialId)) {
      newCompleted.delete(materialId);
    } else {
      newCompleted.add(materialId);
    }
    setCompletedMaterials(newCompleted);
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const totalMaterials = studyMaterials[test?.category] || [];
    const completed = completedMaterials.size;
    return totalMaterials.length > 0 ? (completed / totalMaterials.length) * 100 : 0;
  };

  // Format study time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'information-circle' },
    { id: 'study', title: 'Study Materials', icon: 'book' },
    { id: 'practice', title: 'Practice', icon: 'fitness' },
    { id: 'tips', title: 'Tips', icon: 'bulb' }
  ];

  const studyMaterials = {
    frontend: [
      {
        id: 1,
        title: 'React Native Documentation',
        type: 'documentation',
        url: 'https://reactnative.dev/docs/getting-started',
        description: 'Official React Native documentation covering all core concepts',
        estimatedTime: '2-3 hours',
        difficulty: 'Beginner to Advanced'
      },
      {
        id: 2,
        title: 'JavaScript ES6+ Features',
        type: 'tutorial',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        description: 'Complete guide to modern JavaScript features',
        estimatedTime: '1-2 hours',
        difficulty: 'Intermediate'
      },
      {
        id: 3,
        title: 'React Hooks Deep Dive',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
        description: 'Comprehensive tutorial on React Hooks',
        estimatedTime: '45 minutes',
        difficulty: 'Intermediate'
      },
      {
        id: 4,
        title: 'Mobile App Performance',
        type: 'article',
        url: 'https://reactnative.dev/docs/performance',
        description: 'Best practices for React Native performance optimization',
        estimatedTime: '30 minutes',
        difficulty: 'Advanced'
      }
    ],
    programming: [
      {
        id: 1,
        title: 'Algorithm Visualizer',
        type: 'interactive',
        url: 'https://algorithm-visualizer.org',
        description: 'Interactive tool to visualize algorithms and data structures',
        estimatedTime: '1-2 hours',
        difficulty: 'Beginner to Advanced'
      },
      {
        id: 2,
        title: 'Big O Notation Guide',
        type: 'tutorial',
        url: 'https://www.bigocheatsheet.com',
        description: 'Complete guide to algorithm complexity analysis',
        estimatedTime: '45 minutes',
        difficulty: 'Intermediate'
      },
      {
        id: 3,
        title: 'LeetCode Practice Problems',
        type: 'practice',
        url: 'https://leetcode.com',
        description: 'Practice coding problems similar to test questions',
        estimatedTime: 'Ongoing',
        difficulty: 'All Levels'
      }
    ]
  };

  const practiceQuestions = {
    frontend: [
      {
        id: 1,
        question: 'What is the purpose of useEffect hook?',
        type: 'concept',
        difficulty: 'Medium'
      },
      {
        id: 2,
        question: 'Explain the difference between State and Props',
        type: 'concept',
        difficulty: 'Easy'
      },
      {
        id: 3,
        question: 'How do you optimize React Native performance?',
        type: 'practical',
        difficulty: 'Hard'
      }
    ],
    programming: [
      {
        id: 1,
        question: 'Implement a function to reverse a linked list',
        type: 'coding',
        difficulty: 'Medium'
      },
      {
        id: 2,
        question: 'Find the first non-repeating character in a string',
        type: 'coding',
        difficulty: 'Easy'
      },
      {
        id: 3,
        question: 'Design a cache system with LRU eviction',
        type: 'design',
        difficulty: 'Hard'
      }
    ]
  };

  const testTips = [
    {
      id: 1,
      category: 'Preparation',
      title: 'Review Prerequisites',
      description: 'Make sure you understand all the prerequisite topics before starting the test.',
      icon: 'checkmark-circle'
    },
    {
      id: 2,
      category: 'Technical',
      title: 'Check Your Setup',
      description: 'Ensure stable internet connection and test your browser/environment beforehand.',
      icon: 'wifi'
    },
    {
      id: 3,
      category: 'Strategy',
      title: 'Read Questions Carefully',
      description: 'Take time to understand what each question is asking before answering.',
      icon: 'eye'
    },
    {
      id: 4,
      category: 'Time Management',
      title: 'Allocate Time Wisely',
      description: 'Don\'t spend too much time on any single question. Mark difficult ones and return later.',
      icon: 'time'
    },
    {
      id: 5,
      category: 'Strategy',
      title: 'Use Process of Elimination',
      description: 'For multiple choice questions, eliminate obviously wrong answers first.',
      icon: 'remove-circle'
    },
    {
      id: 6,
      category: 'Technical',
      title: 'Test Code Thoroughly',
      description: 'For coding questions, test your solution with different inputs including edge cases.',
      icon: 'bug'
    }
  ];

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const markStudyMaterialComplete = (materialId) => {
    setStudyProgress(prev => ({
      ...prev,
      [materialId]: true
    }));
  };

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[
        styles.tabButton,
        selectedTab === tab.id && styles.activeTabButton
      ]}
      onPress={() => setSelectedTab(tab.id)}
    >
      <Ionicons 
        name={tab.icon} 
        size={16} 
        color={selectedTab === tab.id ? '#FFFFFF' : '#8E8E93'} 
      />
      <Text style={[
        styles.tabText,
        selectedTab === tab.id && styles.activeTabText
      ]}>
        {tab.title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Test Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Test Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{test.estimatedTime || '30-45 min'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="help-circle" size={20} color="#FF9500" />
            <Text style={styles.infoLabel}>Questions</Text>
            <Text style={styles.infoValue}>{test.totalQuestions}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trending-up" size={20} color="#34C759" />
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text style={styles.infoValue}>{test.difficulty}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.infoLabel}>Passing Score</Text>
            <Text style={styles.infoValue}>{test.passingScore}%</Text>
          </View>
        </View>
      </Card>

      {/* Skills Covered */}
      <Card style={styles.skillsCard}>
        <Text style={styles.sectionTitle}>Skills Covered</Text>
        <View style={styles.skillsContainer}>
          {test.skills?.map((skill, index) => (
            <Badge key={index} text={skill} variant="skill" size="medium" />
          ))}
        </View>
      </Card>

      {/* Topics */}
      {test.topics && (
        <Card style={styles.topicsCard}>
          <Text style={styles.sectionTitle}>Test Topics</Text>
          {test.topics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Prerequisites */}
      {test.prerequisites && (
        <Card style={styles.prerequisitesCard}>
          <Text style={styles.sectionTitle}>Prerequisites</Text>
          {test.prerequisites.map((prereq, index) => (
            <View key={index} style={styles.prereqItem}>
              <Ionicons name="school" size={16} color="#007AFF" />
              <Text style={styles.prereqText}>{prereq}</Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );

  const renderStudyMaterials = () => {
    const materials = studyMaterials[test.category] || studyMaterials.frontend;
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Recommended Study Materials</Text>
        {materials.map((material) => (
          <Card key={material.id} style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialTitle}>{material.title}</Text>
                <Badge 
                  text={material.type} 
                  variant="skill" 
                  size="small" 
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.progressButton,
                  studyProgress[material.id] && styles.completedButton
                ]}
                onPress={() => markStudyMaterialComplete(material.id)}
              >
                <Ionicons 
                  name={studyProgress[material.id] ? 'checkmark' : 'ellipse-outline'} 
                  size={16} 
                  color={studyProgress[material.id] ? '#FFFFFF' : '#8E8E93'} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.materialDescription}>{material.description}</Text>
            
            <View style={styles.materialMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{material.estimatedTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="bar-chart-outline" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{material.difficulty}</Text>
              </View>
            </View>
            
            <Button
              title="Open Resource"
              variant="outline"
              size="small"
              onPress={() => handleOpenLink(material.url)}
              style={styles.openButton}
            />
          </Card>
        ))}
      </View>
    );
  };

  const renderPractice = () => {
    const questions = practiceQuestions[test.category] || practiceQuestions.frontend;
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Practice Questions</Text>
        <Text style={styles.sectionSubtitle}>
          Test your knowledge with these practice questions similar to what you'll encounter
        </Text>
        
        {questions.map((question) => (
          <Card key={question.id} style={styles.practiceCard}>
            <View style={styles.practiceHeader}>
              <Badge 
                text={question.difficulty} 
                variant={
                  question.difficulty === 'Easy' ? 'success' : 
                  question.difficulty === 'Medium' ? 'warning' : 'danger'
                } 
                size="small" 
              />
              <Badge text={question.type} variant="skill" size="small" />
            </View>
            
            <Text style={styles.practiceQuestion}>{question.question}</Text>
            
            <TouchableOpacity style={styles.practiceButton}>
              <Text style={styles.practiceButtonText}>Try This Question</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    );
  };

  const renderTips = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Test Taking Tips</Text>
      <Text style={styles.sectionSubtitle}>
        Follow these strategies to maximize your performance
      </Text>
      
      {testTips.map((tip) => (
        <Card key={tip.id} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipIconContainer}>
              <Ionicons name={tip.icon} size={20} color="#007AFF" />
            </View>
            <View style={styles.tipContent}>
              <View style={styles.tipTitleRow}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Badge text={tip.category} variant="skill" size="small" />
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'study': return renderStudyMaterials();
      case 'practice': return renderPractice();
      case 'tips': return renderTips();
      default: return renderOverview();
    }
  };

  if (!test) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Test not found</Text>
          <Button
            title="Go Back"
            variant="primary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Test Preparation</Text>
          <Text style={styles.headerSubtitle}>{test.title}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      {/* Start Test Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={`Start ${test.title}`}
          variant="primary"
          size="large"
          onPress={() => {
            navigation.goBack();
            // Navigate to appropriate test screen
            setTimeout(() => {
              switch (test.type) {
                case 'MCQ':
                  navigation.navigate('MCQTest', { test });
                  break;
                case 'Coding':
                  navigation.navigate('CodingTest', { test });
                  break;
                case 'Project':
                  navigation.navigate('ProjectUpload', { test });
                  break;
              }
            }, 100);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  skillsCard: {
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicsCard: {
    marginBottom: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
  },
  prerequisitesCard: {
    marginBottom: 16,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prereqText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
  },
  materialCard: {
    marginBottom: 16,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
    marginRight: 12,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  materialDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 20,
  },
  materialMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  progressButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  openButton: {
    alignSelf: 'flex-start',
  },
  practiceCard: {
    marginBottom: 16,
  },
  practiceHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  practiceQuestion: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    lineHeight: 22,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  practiceButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  tipCard: {
    marginBottom: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  tipDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 20,
  },
});

export default TestPreparationScreen;
