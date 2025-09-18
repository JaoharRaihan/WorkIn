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
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import testService from '../../services/testService';
import TestHistoryService from '../../services/testHistoryService';

const { width } = Dimensions.get('window');

const MCQTestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { testId, test } = route.params || {};
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    // If we have a test object, use it directly
    if (test) {
      generateQuestions();
      setTimeRemaining(test.duration * 60); // Convert minutes to seconds
      setTestStarted(true);
    } 
    // If we only have testId, fetch the test data
    else if (testId) {
      const fetchedTest = testService.getTestById(testId);
      if (fetchedTest) {
        // Use the fetched test data
        const testData = {
          id: testId,
          title: fetchedTest.title || 'Checkpoint Test',
          duration: fetchedTest.duration || 30,
          passingScore: fetchedTest.passingScore || 70,
          difficulty: fetchedTest.difficulty || 'Medium',
          type: fetchedTest.type || 'MCQ'
        };
        
        generateQuestionsForTest(testData);
        setTimeRemaining(testData.duration * 60);
        setTestStarted(true);
      } else {
        console.error('Test not found for ID:', testId);
        Alert.alert('Error', 'Test not found. Please try again.');
        navigation.goBack();
      }
    }
  }, [test, testId]);

  // Timer effect
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && testStarted && !testCompleted) {
      handleSubmitTest();
    }
  }, [timeRemaining, testStarted, testCompleted]);

  const generateQuestions = async () => {
    try {
      // Get questions from testService
      const testQuestions = await testService.getTestQuestions(test.id);
      
      if (testQuestions && testQuestions.length > 0) {
        // Add test difficulty to each question if not already present
        const questionsWithDifficulty = testQuestions.map(question => ({
          ...question,
          difficulty: question.difficulty || test.difficulty || 'Medium'
        }));
        
        setQuestions(questionsWithDifficulty);
        console.log(`Loaded ${questionsWithDifficulty.length} questions for test: ${test.title}`);
      } else {
        // Fallback: Generate sample questions for the test
        console.log(`No questions found for test ID ${test.id}, generating sample questions`);
        const sampleQuestions = generateSampleQuestions(test);
        setQuestions(sampleQuestions);
      }
    } catch (error) {
      console.error('Error loading test questions:', error);
      // Fallback: Generate sample questions
      const sampleQuestions = generateSampleQuestions(test);
      setQuestions(sampleQuestions);
    }
  };

  const generateSampleQuestions = (testData) => {
    const sampleQuestions = [];
    const numQuestions = Math.min(testData.questions || 10, 15); // Limit to 15 questions for demo
    
    for (let i = 1; i <= numQuestions; i++) {
      sampleQuestions.push({
        id: i,
        question: `Sample ${testData.title} Question ${i}: What is the key concept in ${testData.category} that relates to ${testData.difficulty.toLowerCase()} level understanding?`,
        options: [
          `Basic ${testData.category} concept A`,
          `Advanced ${testData.category} methodology B`,
          `Industry standard ${testData.category} practice C`,
          `Expert level ${testData.category} implementation D`
        ],
        correct: Math.floor(Math.random() * 4), // Random correct answer for demo
        timeLimit: 120,
        difficulty: testData.difficulty,
        explanation: `This question tests your understanding of ${testData.category} principles at the ${testData.difficulty} level.`
      });
    }
    
    return sampleQuestions;
  };

  const generateQuestionsForTest = async (testData) => {
    try {
      // Get questions from testService using the test ID
      const testQuestions = await testService.getTestQuestions(testData.id);
      
      if (testQuestions && testQuestions.length > 0) {
        // Add test difficulty to each question if not already present
        const questionsWithDifficulty = testQuestions.map(question => ({
          ...question,
          difficulty: question.difficulty || testData.difficulty || 'Medium'
        }));
        
        setQuestions(questionsWithDifficulty);
        console.log(`Loaded ${questionsWithDifficulty.length} questions for test: ${testData.title}`);
      } else {
        // Fallback: Generate sample questions for the test
        console.log(`No questions found for test ID ${testData.id}, generating sample questions`);
        const sampleQuestions = generateSampleQuestions(testData);
        setQuestions(sampleQuestions);
      }
    } catch (error) {
      console.error('Error loading test questions:', error);
      // Fallback: Generate sample questions
      const sampleQuestions = generateSampleQuestions(testData);
      setQuestions(sampleQuestions);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    setTestCompleted(true);
    
    // Calculate results
    let correctAnswers = 0;
    const categoryBreakdown = {};
    
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
      
      // Calculate category breakdown
      const category = question.category || question.difficulty;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { correct: 0, total: 0 };
      }
      categoryBreakdown[category].total++;
      if (selectedAnswers[index] === question.correct) {
        categoryBreakdown[category].correct++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const testData = test || testService.getTestById(testId);
    const passed = score >= (testData?.passingScore || 70);
    const testDuration = testData?.duration || 30;
    const timeTaken = Math.round(((testDuration * 60) - timeRemaining) / 60);
    
    // Calculate percentage breakdown for each category
    const breakdown = {};
    Object.keys(categoryBreakdown).forEach(category => {
      breakdown[category] = Math.round(
        (categoryBreakdown[category].correct / categoryBreakdown[category].total) * 100
      );
    });
    
    const results = {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      timeTaken,
      breakdown,
      badgeEarned: passed,
      attemptNumber: (testData?.attempts || 0) + 1,
      testType: 'MCQ',
      completedAt: new Date().toISOString(),
    };
    
    setTestResults(results);
    
    // Save to test history
    try {
      const testCompletion = {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent: timeTaken,
        difficulty: testData?.difficulty || 'Intermediate',
        badge: testData?.badge || 'Test Completion',
        pointsEarned: testData?.points || (passed ? 100 : 50),
      };
      
      await TestHistoryService.addTestCompletion(testData?.id || testId, testCompletion);
      console.log('Test completion saved to history');
    } catch (error) {
      console.error('Error saving test completion:', error);
    }
    
    // Navigate to results screen after a short delay
    setTimeout(() => {
      navigation.replace('TestResults', { 
        testResults: results, 
        test: test 
      });
    }, 1000);
  };

  const calculateBreakdown = () => {
    const breakdown = {
      beginner: { correct: 0, total: 0 },
      intermediate: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 }
    };
    
    questions.forEach((question, index) => {
      const difficulty = question.difficulty;
      breakdown[difficulty].total++;
      
      if (selectedAnswers[index] === question.correct) {
        breakdown[difficulty].correct++;
      }
    });
    
    return breakdown;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const handleExitTest = () => {
    Alert.alert(
      'Exit Test',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (testCompleted && testResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <View style={[styles.scoreCircle, { borderColor: testResults.passed ? '#10b981' : '#ef4444' }]}>
              <Text style={[styles.scoreText, { color: testResults.passed ? '#10b981' : '#ef4444' }]}>
                {testResults.score}%
              </Text>
            </View>
            <Text style={styles.resultTitle}>
              {testResults.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {testResults.passed ? 'You passed the test!' : 'You can retake this test'}
            </Text>
          </View>

          <View style={styles.resultsSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Score</Text>
              <Text style={styles.summaryValue}>{testResults.score}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Correct</Text>
              <Text style={styles.summaryValue}>{testResults.correctAnswers}/{testResults.totalQuestions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{formatTime(testResults.timeSpent)}</Text>
            </View>
          </View>

          {testResults.badge && (
            <View style={styles.badgeContainer}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.badgeText}>Badge Earned: {testResults.badge}</Text>
            </View>
          )}

          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Performance Breakdown</Text>
            {Object.entries(testResults.breakdown).map(([difficulty, stats]) => (
              <View key={difficulty} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>
                  {(difficulty || 'Unknown').charAt(0).toUpperCase() + (difficulty || 'Unknown').slice(1)}
                </Text>
                <Text style={styles.breakdownValue}>
                  {stats.correct}/{stats.total} ({stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}%)
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => {/* Navigate to review */}}
            >
              <Text style={styles.reviewButtonText}>Review Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading test questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Safety check to ensure currentQuestion exists
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <Text>Error loading question. Please try again.</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleExitTest}>
            <Ionicons name="close" size={24} color="#ef4444" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.questionCounter}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <Text style={styles.timeRemaining}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.testTitle}>{test.title}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(getProgressPercentage())}%</Text>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {(currentQuestion.difficulty || test?.difficulty || 'MEDIUM').toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionCircle,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionCircle
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionLetter
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? '#9ca3af' : '#3b82f6'} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setShowExitModal(true)}
          >
            <Text style={styles.submitButtonText}>Submit Test</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.submitModal}>
            <Text style={styles.modalTitle}>Submit Test?</Text>
            <Text style={styles.modalText}>
              You have answered {Object.keys(selectedAnswers).length} out of {questions.length} questions.
              {Object.keys(selectedAnswers).length < questions.length && 
                ' Unanswered questions will be marked as incorrect.'
              }
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Continue Test</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  setShowExitModal(false);
                  handleSubmitTest();
                }}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  testTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  difficultyBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOptionCircle: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedOptionLetter: {
    color: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#1e293b',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  disabledButton: {
    borderColor: '#e2e8f0',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginHorizontal: 4,
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    flexGrow: 1,
    padding: 16,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  resultsSummary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#374151',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  resultsActions: {
    gap: 12,
  },
  reviewButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: width - 32,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
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

export default MCQTestScreen;
