import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CodingTestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { testId, test } = route.params || {};
  
  const [currentProblem, setCurrentProblem] = useState(0);
  const [problems, setProblems] = useState([]);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('light');
  const codeInputRef = useRef(null);

  useEffect(() => {
    if (test) {
      generateProblems();
      setTimeRemaining(test.duration * 60);
      setTestStarted(true);
    }
  }, [test]);

  // Timer effect
  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && testStarted && !testCompleted) {
      submitTest();
    }
  }, [timeRemaining, testStarted, testCompleted]);

  const generateProblems = () => {
    const problemSets = {
      programming: [
        {
          id: 1,
          title: "Two Sum",
          difficulty: "Easy",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          examples: [
            {
              input: "nums = [2,7,11,15], target = 9",
              output: "[0,1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
          ],
          constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
          ],
          starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
            python: `def two_sum(nums, target):
    # Your code here
    pass`,
            java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
    
}`
          },
          testCases: [
            { input: "[2,7,11,15], 9", expected: "[0,1]" },
            { input: "[3,2,4], 6", expected: "[1,2]" },
            { input: "[3,3], 6", expected: "[0,1]" }
          ],
          hints: [
            "Try using a hash map to store numbers you've seen",
            "For each number, check if target - current number exists in the map",
            "Remember to return the indices, not the values"
          ]
        },
        {
          id: 2,
          title: "Reverse String",
          difficulty: "Easy",
          description: "Write a function that reverses a string. The input string is given as an array of characters s.",
          examples: [
            {
              input: 's = ["h","e","l","l","o"]',
              output: '["o","l","l","e","h"]'
            }
          ],
          constraints: [
            "1 <= s.length <= 10^5",
            "s[i] is a printable ascii character."
          ],
          starterCode: {
            javascript: `function reverseString(s) {
    // Your code here
    
}`,
            python: `def reverse_string(s):
    # Your code here
    pass`,
            java: `public void reverseString(char[] s) {
    // Your code here
    
}`
          },
          testCases: [
            { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' }
          ],
          hints: [
            "Use two pointers approach",
            "Swap characters from both ends moving towards center",
            "You can do this in-place without extra space"
          ]
        },
        {
          id: 3,
          title: "Valid Parentheses",
          difficulty: "Medium",
          description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
          examples: [
            {
              input: 's = "()"',
              output: "true"
            },
            {
              input: 's = "()[]{}"',
              output: "true"
            },
            {
              input: 's = "(]"',
              output: "false"
            }
          ],
          constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
          ],
          starterCode: {
            javascript: `function isValid(s) {
    // Your code here
    
}`,
            python: `def is_valid(s):
    # Your code here
    pass`,
            java: `public boolean isValid(String s) {
    // Your code here
    
}`
          },
          testCases: [
            { input: '"()"', expected: "true" },
            { input: '"()[]{}"', expected: "true" },
            { input: '"(]"', expected: "false" },
            { input: '"([)]"', expected: "false" },
            { input: '"{[]}"', expected: "true" }
          ],
          hints: [
            "Use a stack data structure",
            "Push opening brackets onto the stack",
            "For closing brackets, check if they match the top of the stack"
          ]
        }
      ],
      web: [
        {
          id: 1,
          title: "Create a Responsive Card Component",
          difficulty: "Medium",
          description: "Create a responsive card component with hover effects using HTML, CSS, and JavaScript.",
          examples: [
            {
              input: "HTML structure with card elements",
              output: "Styled card with hover animations"
            }
          ],
          constraints: [
            "Must be responsive (mobile-first)",
            "Include hover and focus states",
            "Use semantic HTML"
          ],
          starterCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Card</title>
    <style>
        /* Your CSS here */
        
    </style>
</head>
<body>
    <!-- Your HTML here -->
    
    <script>
        // Your JavaScript here
        
    </script>
</body>
</html>`,
            css: `.card {
    /* Your styles here */
    
}

.card:hover {
    /* Hover effects here */
    
}`,
            javascript: `// Add interactive functionality
function initializeCards() {
    // Your code here
    
}`
          },
          testCases: [
            { input: "Desktop view", expected: "Card displays properly on large screens" },
            { input: "Mobile view", expected: "Card adapts to mobile screens" },
            { input: "Hover interaction", expected: "Card shows hover effects" }
          ],
          hints: [
            "Use CSS Grid or Flexbox for layout",
            "Consider using CSS transforms for animations",
            "Test on different screen sizes"
          ]
        }
      ]
    };

    const categoryProblems = problemSets[test.category] || problemSets.programming;
    const selectedProblems = categoryProblems.slice(0, Math.min(3, categoryProblems.length));
    setProblems(selectedProblems);
    setCode(selectedProblems[0]?.starterCode[language] || '');
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const problem = problems[currentProblem];
      const results = problem.testCases.map((testCase, index) => {
        // Simulate test case execution
        const passed = Math.random() > 0.3; // 70% pass rate simulation
        return {
          testCase: index + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: passed ? testCase.expected : "Wrong output",
          passed: passed,
          executionTime: Math.floor(Math.random() * 100) + 50
        };
      });
      
      setTestResults(results);
      const allPassed = results.every(r => r.passed);
      
      if (allPassed) {
        setCompletedProblems(prev => new Set([...prev, currentProblem]));
        setOutput('✅ All test cases passed!\n\n' + 
                 results.map(r => `Test ${r.testCase}: PASSED (${r.executionTime}ms)`).join('\n'));
      } else {
        setOutput('❌ Some test cases failed:\n\n' + 
                 results.map(r => 
                   `Test ${r.testCase}: ${r.passed ? 'PASSED' : 'FAILED'}\n` +
                   `Expected: ${r.expected}\n` +
                   `Got: ${r.actual}\n`
                 ).join('\n'));
      }
    } catch (error) {
      setOutput('💥 Runtime Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = () => {
    if (!completedProblems.has(currentProblem)) {
      Alert.alert(
        'Submit Without Passing?',
        'Your solution hasn\'t passed all test cases. Submit anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => moveToNextProblem() }
        ]
      );
    } else {
      moveToNextProblem();
    }
  };

  const moveToNextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setCode(problems[currentProblem + 1]?.starterCode[language] || '');
      setOutput('');
      setTestResults([]);
    } else {
      submitTest();
    }
  };

  const submitTest = () => {
    const score = Math.round((completedProblems.size / problems.length) * 100);
    const passed = score >= (test.passingScore || 70);
    const timeTaken = Math.round(((test.duration * 60) - timeRemaining) / 60);
    
    // Calculate breakdown by problem difficulty
    const breakdown = {
      easy: 0,
      medium: 0,
      hard: 0
    };
    
    problems.forEach((problem, index) => {
      if (completedProblems.has(index)) {
        const difficulty = problem.difficulty.toLowerCase();
        if (breakdown.hasOwnProperty(difficulty)) {
          breakdown[difficulty] += (100 / problems.length);
        }
      }
    });
    
    const results = {
      score,
      correctAnswers: completedProblems.size,
      totalQuestions: problems.length,
      passed,
      timeTaken,
      breakdown,
      badgeEarned: passed,
      attemptNumber: (test.attempts || 0) + 1,
      testType: 'Coding',
      completedAt: new Date().toISOString(),
      language: language,
      problems: problems.map((problem, index) => ({
        title: problem.title,
        difficulty: problem.difficulty,
        solved: completedProblems.has(index)
      }))
    };
    
    setFinalResults(results);
    setTestCompleted(true);
    
    // Navigate to results screen after a short delay
    setTimeout(() => {
      navigation.replace('TestResults', { 
        testResults: results, 
        test: test 
      });
    }, 1000);
  };

  const exitTest = () => {
    Alert.alert(
      'Exit Test?',
      'Your progress will be lost. Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!test) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Test not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (testCompleted && finalResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.resultsTitle}>Test Completed!</Text>
            <Text style={styles.resultsScore}>{finalResults.score}%</Text>
            <Text style={styles.resultsGrade}>Grade: {finalResults.grade}</Text>
          </View>

          <View style={styles.resultsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Problems Solved</Text>
              <Text style={styles.statValue}>{finalResults.solvedProblems}/{finalResults.totalProblems}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time Spent</Text>
              <Text style={styles.statValue}>{formatTime(finalResults.timeSpent)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Language</Text>
              <Text style={styles.statValue}>{finalResults.language}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.finishButton}
            onPress={() => navigation.navigate('TestsMain')}
          >
            <Text style={styles.finishButtonText}>Back to Tests</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={exitTest} style={styles.exitButton}>
          <Ionicons name="close" size={24} color="#ef4444" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Problem {currentProblem + 1} of {problems.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentProblem + 1) / problems.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time" size={16} color="#64748b" />
          <Text style={[styles.timerText, timeRemaining < 300 && styles.timerWarning]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {problems.length > 0 && (
        <KeyboardAvoidingView 
          style={styles.content} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.problemSection}>
            <View style={styles.problemHeader}>
              <Text style={styles.problemTitle}>{problems[currentProblem].title}</Text>
              <View style={styles.problemMeta}>
                <View style={[styles.difficultyBadge, 
                  problems[currentProblem].difficulty === 'Easy' && styles.difficultyEasy,
                  problems[currentProblem].difficulty === 'Medium' && styles.difficultyMedium,
                  problems[currentProblem].difficulty === 'Hard' && styles.difficultyHard
                ]}>
                  <Text style={styles.difficultyText}>{problems[currentProblem].difficulty}</Text>
                </View>
                {completedProblems.has(currentProblem) && (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                )}
              </View>
            </View>

            <Text style={styles.problemDescription}>
              {problems[currentProblem].description}
            </Text>

            {problems[currentProblem].examples.map((example, index) => (
              <View key={index} style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Example {index + 1}:</Text>
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleInput}>Input: {example.input}</Text>
                  <Text style={styles.exampleOutput}>Output: {example.output}</Text>
                  {example.explanation && (
                    <Text style={styles.exampleExplanation}>Explanation: {example.explanation}</Text>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.constraintsContainer}>
              <Text style={styles.constraintsTitle}>Constraints:</Text>
              {problems[currentProblem].constraints.map((constraint, index) => (
                <Text key={index} style={styles.constraintItem}>• {constraint}</Text>
              ))}
            </View>
          </ScrollView>

          {/* Code Editor Section */}
          <View style={styles.editorSection}>
            <View style={styles.editorHeader}>
              <View style={styles.languageSelector}>
                <TouchableOpacity 
                  style={[styles.langButton, language === 'javascript' && styles.langButtonActive]}
                  onPress={() => {
                    setLanguage('javascript');
                    setCode(problems[currentProblem]?.starterCode['javascript'] || '');
                  }}
                >
                  <Text style={[styles.langButtonText, language === 'javascript' && styles.langButtonTextActive]}>
                    JavaScript
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.langButton, language === 'python' && styles.langButtonActive]}
                  onPress={() => {
                    setLanguage('python');
                    setCode(problems[currentProblem]?.starterCode['python'] || '');
                  }}
                >
                  <Text style={[styles.langButtonText, language === 'python' && styles.langButtonTextActive]}>
                    Python
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editorActions}>
                <TouchableOpacity onPress={() => setShowHint(true)} style={styles.hintButton}>
                  <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                  <Text style={styles.hintButtonText}>Hint</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.codeContainer}>
              <TextInput
                ref={codeInputRef}
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="Write your code here..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                fontFamily={Platform.OS === 'ios' ? 'Menlo' : 'monospace'}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.runButton, isRunning && styles.runButtonDisabled]}
                onPress={runCode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <Text style={styles.runButtonText}>Running...</Text>
                ) : (
                  <>
                    <Ionicons name="play" size={16} color="#ffffff" />
                    <Text style={styles.runButtonText}>Run Code</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={submitCode}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>

            {output && (
              <View style={styles.outputContainer}>
                <Text style={styles.outputTitle}>Output:</Text>
                <ScrollView style={styles.outputScroll}>
                  <Text style={styles.outputText}>{output}</Text>
                </ScrollView>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Hint Modal */}
      <Modal
        visible={showHint}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hints</Text>
            <TouchableOpacity onPress={() => setShowHint(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {problems[currentProblem]?.hints.map((hint, index) => (
              <View key={index} style={styles.hintItem}>
                <View style={styles.hintNumber}>
                  <Text style={styles.hintNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.hintText}>{hint}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  exitButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#ef4444',
  },
  content: {
    flex: 1,
  },
  problemSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  problemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyEasy: {
    backgroundColor: '#dcfce7',
  },
  difficultyMedium: {
    backgroundColor: '#fef3c7',
  },
  difficultyHard: {
    backgroundColor: '#fee2e2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  problemDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20,
  },
  exampleContainer: {
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  exampleContent: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  exampleInput: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1e293b',
    marginBottom: 4,
  },
  exampleOutput: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1e293b',
    marginBottom: 4,
  },
  exampleExplanation: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  constraintsContainer: {
    marginTop: 16,
  },
  constraintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  constraintItem: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  editorSection: {
    backgroundColor: '#ffffff',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  languageSelector: {
    flexDirection: 'row',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#e2e8f0',
  },
  langButtonActive: {
    backgroundColor: '#3b82f6',
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  langButtonTextActive: {
    color: '#ffffff',
  },
  editorActions: {
    flexDirection: 'row',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hintButtonText: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 4,
    fontWeight: '600',
  },
  codeContainer: {
    height: 200,
    backgroundColor: '#1e293b',
  },
  codeInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#e2e8f0',
    backgroundColor: '#1e293b',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  runButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  runButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  outputContainer: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  outputTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    padding: 12,
    paddingBottom: 8,
  },
  outputScroll: {
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  outputText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontWeight: '700',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  hintItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hintNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hintNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  resultsContainer: {
    flexGrow: 1,
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 16,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  resultsGrade: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  resultsStats: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  finishButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CodingTestScreen;
