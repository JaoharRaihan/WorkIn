import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TestDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { testId, test } = route.params || {};
  
  const [testDetail, setTestDetail] = useState(null);
  const [userAttempts, setUserAttempts] = useState([]);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    if (test) {
      fetchTestDetail();
      fetchUserAttempts();
    }
  }, [test]);

  const fetchTestDetail = () => {
    // Enhanced test detail with comprehensive information
    const enhancedTestDetail = {
      ...test,
      longDescription: `This comprehensive ${test.title} assessment is designed to evaluate your practical knowledge and skills. The test covers fundamental concepts, advanced techniques, and real-world applications.`,
      learningObjectives: [
        `Master ${test.skills[0]} fundamentals and advanced concepts`,
        'Apply best practices in real-world scenarios',
        'Demonstrate problem-solving capabilities',
        'Show understanding of industry standards'
      ],
      prerequisites: [
        'Basic understanding of programming concepts',
        'Familiarity with development tools',
        '3+ months of practical experience'
      ],
      difficulty: {
        level: test.difficulty,
        description: getDifficultyDescription(test.difficulty),
        passScore: 70,
        expertScore: 90
      },
      format: {
        type: test.type,
        description: getFormatDescription(test.type),
        timePerQuestion: Math.round(test.duration / test.questions),
        retakes: 3,
        certification: test.verified
      },
      topics: [
        { name: 'Fundamentals', weight: 30, questions: Math.round(test.questions * 0.3) },
        { name: 'Practical Application', weight: 40, questions: Math.round(test.questions * 0.4) },
        { name: 'Advanced Concepts', weight: 20, questions: Math.round(test.questions * 0.2) },
        { name: 'Best Practices', weight: 10, questions: Math.round(test.questions * 0.1) }
      ],
      sampleQuestions: getSampleQuestions(test.type, test.category),
      tips: [
        'Review all prerequisites before starting',
        'Ensure stable internet connection',
        'Take your time to read questions carefully',
        'Use the full allocated time if needed'
      ],
      rewards: {
        badge: test.badge,
        verifiedSkill: test.verified,
        certificateUrl: test.verified ? 'https://skillnet.com/certificates/' : null,
        skillPoints: test.difficulty === 'beginner' ? 100 : test.difficulty === 'intermediate' ? 200 : 300
      }
    };
    
    setTestDetail(enhancedTestDetail);
  };

  const fetchUserAttempts = () => {
    // Mock user attempts data
    const mockAttempts = [];
    for (let i = 0; i < test.attempts; i++) {
      mockAttempts.push({
        id: i + 1,
        date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: test.bestScore - (i * 5),
        duration: test.duration - (i * 3),
        passed: (test.bestScore - (i * 5)) >= 70,
        breakdown: {
          fundamentals: Math.random() * 100,
          practical: Math.random() * 100,
          advanced: Math.random() * 100,
          bestPractices: Math.random() * 100
        }
      });
    }
    setUserAttempts(mockAttempts);
  };

  const getDifficultyDescription = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Perfect for those new to this technology. Covers basic concepts and fundamental skills.';
      case 'intermediate':
        return 'Requires some experience. Tests practical application and problem-solving abilities.';
      case 'advanced':
        return 'For experienced practitioners. Covers complex scenarios and expert-level concepts.';
      default:
        return 'Comprehensive assessment of your skills and knowledge.';
    }
  };

  const getFormatDescription = (type) => {
    switch (type) {
      case 'mcq':
        return 'Multiple choice questions with single correct answers. Auto-graded with instant results.';
      case 'coding':
        return 'Live coding challenges with real-time syntax checking and automated testing.';
      case 'project':
        return 'Complete project submission with manual review by industry experts.';
      default:
        return 'Comprehensive assessment format tailored to test practical skills.';
    }
  };

  const getSampleQuestions = (type, category) => {
    const samples = {
      mcq: [
        'What is the difference between let and const in JavaScript?',
        'Which method is used to add elements to the end of an array?',
        'What is the purpose of the virtual DOM in React?'
      ],
      coding: [
        'Implement a function to reverse a string without using built-in methods',
        'Create a React component that manages state using hooks',
        'Write a function to find the longest substring without repeating characters'
      ],
      project: [
        'Build a complete todo application with CRUD operations',
        'Create a responsive dashboard with data visualization',
        'Develop a REST API with authentication and database integration'
      ]
    };
    return samples[type] || samples.mcq;
  };

  const startTest = () => {
    setShowStartModal(false);
    
    if (testDetail.type === 'mcq') {
      navigation.navigate('MCQTest', { testId, test: testDetail });
    } else if (testDetail.type === 'coding') {
      navigation.navigate('CodingTest', { testId, test: testDetail });
    } else if (testDetail.type === 'project') {
      navigation.navigate('ProjectTest', { testId, test: testDetail });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return 'help-circle';
      case 'coding': return 'code-slash';
      case 'project': return 'folder-open';
      default: return 'document';
    }
  };

  if (!testDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading test details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <View style={styles.testTypeContainer}>
                <Ionicons name={getTypeIcon(testDetail.type)} size={16} color="#3b82f6" />
                <Text style={styles.testType}>{testDetail.type.toUpperCase()}</Text>
              </View>
              {testDetail.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.testTitle}>{testDetail.title}</Text>
          <Text style={styles.testDescription}>{testDetail.longDescription}</Text>
          
          <View style={styles.testMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color="#64748b" />
              <Text style={styles.metaText}>{testDetail.duration} minutes</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="help-circle" size={16} color="#64748b" />
              <Text style={styles.metaText}>{testDetail.questions} questions</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(testDetail.difficulty) }]}>
              <Text style={styles.difficultyText}>{testDetail.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testDetail.participants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testDetail.avgScore}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testDetail.difficulty.passScore}%</Text>
            <Text style={styles.statLabel}>Pass Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testDetail.format.retakes}</Text>
            <Text style={styles.statLabel}>Max Retakes</Text>
          </View>
        </View>

        {/* User Progress */}
        {userAttempts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Best Score: {test.bestScore}%</Text>
                <Text style={styles.attemptsText}>{test.attempts}/{testDetail.format.retakes} attempts</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${test.bestScore}%` }]} />
              </View>
              <Text style={styles.progressStatus}>
                {test.bestScore >= testDetail.difficulty.passScore ? '✅ Passed' : '❌ Not passed yet'}
              </Text>
            </View>

            {/* Recent Attempts */}
            <Text style={styles.subsectionTitle}>Recent Attempts</Text>
            {userAttempts.slice(0, 3).map(attempt => (
              <View key={attempt.id} style={styles.attemptCard}>
                <View style={styles.attemptHeader}>
                  <Text style={styles.attemptDate}>{attempt.date}</Text>
                  <Text style={[
                    styles.attemptScore,
                    { color: attempt.passed ? '#10b981' : '#ef4444' }
                  ]}>
                    {attempt.score}%
                  </Text>
                </View>
                <Text style={styles.attemptDuration}>
                  Completed in {attempt.duration} minutes
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Test Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Format</Text>
          <View style={styles.formatCard}>
            <Text style={styles.formatDescription}>{testDetail.format.description}</Text>
            <View style={styles.formatDetails}>
              <View style={styles.formatDetail}>
                <Text style={styles.formatDetailLabel}>Time per question</Text>
                <Text style={styles.formatDetailValue}>~{testDetail.format.timePerQuestion} min</Text>
              </View>
              <View style={styles.formatDetail}>
                <Text style={styles.formatDetailLabel}>Retakes allowed</Text>
                <Text style={styles.formatDetailValue}>{testDetail.format.retakes}</Text>
              </View>
              <View style={styles.formatDetail}>
                <Text style={styles.formatDetailLabel}>Certification</Text>
                <Text style={styles.formatDetailValue}>
                  {testDetail.format.certification ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Topics Covered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics Covered</Text>
          {testDetail.topics.map((topic, index) => (
            <View key={index} style={styles.topicCard}>
              <View style={styles.topicHeader}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicWeight}>{topic.weight}%</Text>
              </View>
              <Text style={styles.topicQuestions}>{topic.questions} questions</Text>
            </View>
          ))}
        </View>

        {/* Sample Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Questions</Text>
          {testDetail.sampleQuestions.map((question, index) => (
            <View key={index} style={styles.sampleQuestion}>
              <Text style={styles.questionNumber}>Q{index + 1}.</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          ))}
        </View>

        {/* Prerequisites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prerequisites</Text>
          {testDetail.prerequisites.map((prereq, index) => (
            <View key={index} style={styles.prerequisite}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.prerequisiteText}>{prereq}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          {testDetail.tips.map((tip, index) => (
            <View key={index} style={styles.tip}>
              <Ionicons name="bulb" size={16} color="#f59e0b" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Skills Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills You'll Demonstrate</Text>
          <View style={styles.skillsContainer}>
            {testDetail.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Test Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowStartModal(true)}
            disabled={userAttempts.length >= testDetail.format.retakes}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startButtonText}>
              {userAttempts.length > 0 ? 'Retake Test' : 'Start Test'}
            </Text>
          </TouchableOpacity>
          
          {userAttempts.length >= testDetail.format.retakes && (
            <Text style={styles.maxAttemptsText}>
              Maximum attempts reached. Contact support for more attempts.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Start Test Confirmation Modal */}
      <Modal
        visible={showStartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.startModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ready to Start?</Text>
              <TouchableOpacity onPress={() => setShowStartModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.testSummary}>
                <View style={styles.summaryItem}>
                  <Ionicons name="time" size={20} color="#3b82f6" />
                  <Text style={styles.summaryText}>{testDetail.duration} minutes</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="help-circle" size={20} color="#3b82f6" />
                  <Text style={styles.summaryText}>{testDetail.questions} questions</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="trophy" size={20} color="#3b82f6" />
                  <Text style={styles.summaryText}>{testDetail.difficulty.passScore}% to pass</Text>
                </View>
              </View>

              <View style={styles.reminderContainer}>
                <Text style={styles.reminderTitle}>Before you start:</Text>
                <Text style={styles.reminderText}>• Ensure stable internet connection</Text>
                <Text style={styles.reminderText}>• You cannot pause once started</Text>
                <Text style={styles.reminderText}>• Read all questions carefully</Text>
                <Text style={styles.reminderText}>• You have {testDetail.format.retakes - userAttempts.length} attempts remaining</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowStartModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={startTest}
                >
                  <Text style={styles.confirmButtonText}>Start Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  testType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 2,
  },
  testTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    color: '#1e293b',
  },
  attemptsText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  attemptCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  attemptDate: {
    fontSize: 12,
    color: '#64748b',
  },
  attemptScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  attemptDuration: {
    fontSize: 11,
    color: '#9ca3af',
  },
  formatCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  formatDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  formatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatDetail: {
    alignItems: 'center',
  },
  formatDetailLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  formatDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  topicCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  topicWeight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  topicQuestions: {
    fontSize: 11,
    color: '#64748b',
  },
  sampleQuestion: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 8,
    marginTop: 1,
  },
  questionText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  prerequisite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prerequisiteText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  maxAttemptsText: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width - 32,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalContent: {
    padding: 16,
  },
  testSummary: {
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  reminderContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TestDetailScreen;
