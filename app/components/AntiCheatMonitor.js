import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  AppState,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVerification } from '../context/VerificationContext';

class AntiCheatSystem {
  constructor() {
    this.violations = [];
    this.currentSession = null;
    this.isMonitoring = false;
    this.sessionStartTime = null;
    this.focusLossCount = 0;
    this.rapidClickCount = 0;
    this.timePerQuestion = [];
    this.answerPatterns = [];
    this.suspiciousActivityScore = 0;
    this.restartCount = 0;
    this.maxRestartsAllowed = 1;
  }

  startMonitoring(testId, testType, maxRestarts = 1) {
    this.currentSession = {
      testId,
      testType,
      startTime: new Date().toISOString(),
      violations: [],
      activityLog: [],
    };
    
    this.maxRestartsAllowed = maxRestarts;
    this.isMonitoring = true;
    this.sessionStartTime = Date.now();
    this.focusLossCount = 0;
    this.rapidClickCount = 0;
    this.timePerQuestion = [];
    this.answerPatterns = [];
    this.suspiciousActivityScore = 0;
    
    console.log('🔒 Anti-cheat monitoring started for:', testId);
    return this.currentSession;
  }

  stopMonitoring() {
    if (!this.isMonitoring) return null;
    
    const session = {
      ...this.currentSession,
      endTime: new Date().toISOString(),
      duration: Date.now() - this.sessionStartTime,
      finalViolationCount: this.violations.length,
      suspiciousActivityScore: this.suspiciousActivityScore,
      restartCount: this.restartCount,
    };
    
    this.isMonitoring = false;
    this.currentSession = null;
    
    console.log('🔒 Anti-cheat monitoring stopped. Final score:', this.suspiciousActivityScore);
    return session;
  }

  recordViolation(type, severity, details) {
    if (!this.isMonitoring) return;

    const violation = {
      id: Date.now(),
      type,
      severity, // 'low', 'medium', 'high', 'critical'
      details,
      timestamp: new Date().toISOString(),
      sessionTime: Date.now() - this.sessionStartTime,
    };

    this.violations.push(violation);
    this.currentSession.violations.push(violation);
    
    // Update suspicious activity score
    const severityScores = { low: 5, medium: 15, high: 30, critical: 50 };
    this.suspiciousActivityScore += severityScores[severity] || 0;
    
    console.log(`🚨 Anti-cheat violation: ${type} (${severity})`, details);
    
    return violation;
  }

  recordActivity(activity, data = {}) {
    if (!this.isMonitoring) return;

    const activityLog = {
      activity,
      data,
      timestamp: new Date().toISOString(),
      sessionTime: Date.now() - this.sessionStartTime,
    };

    this.currentSession.activityLog.push(activityLog);
  }

  handleTabSwitch() {
    this.focusLossCount++;
    
    const violation = this.recordViolation(
      'tab_switch',
      this.focusLossCount === 1 ? 'high' : 'critical',
      {
        focusLossCount: this.focusLossCount,
        time: Date.now() - this.sessionStartTime,
        allowedRestartsRemaining: this.maxRestartsAllowed - this.restartCount,
      }
    );

    if (this.focusLossCount > this.maxRestartsAllowed) {
      return { action: 'terminate', violation };
    } else {
      this.restartCount++;
      return { action: 'restart', violation };
    }
  }

  handleRapidAnswering(timeSpent, minimumTime = 5000) {
    if (timeSpent < minimumTime) {
      this.rapidClickCount++;
      
      return this.recordViolation(
        'rapid_answering',
        this.rapidClickCount > 3 ? 'high' : 'medium',
        {
          timeSpent,
          minimumTime,
          rapidClickCount: this.rapidClickCount,
        }
      );
    }
    
    this.timePerQuestion.push(timeSpent);
    return null;
  }

  analyzeAnswerPattern(answers) {
    if (answers.length < 4) return null;

    const pattern = answers.slice(-4).join('');
    this.answerPatterns.push(pattern);
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      'AAAA', 'BBBB', 'CCCC', 'DDDD', // Same answer repeatedly
      'ABCD', 'DCBA', 'ABAB', 'CDCD', // Sequential or alternating patterns
    ];
    
    const patternCount = this.answerPatterns.filter(p => p === pattern).length;
    
    if (suspiciousPatterns.includes(pattern) || patternCount > 2) {
      return this.recordViolation(
        'suspicious_answer_pattern',
        patternCount > 2 ? 'high' : 'medium',
        {
          pattern,
          occurrences: patternCount,
          recentPatterns: this.answerPatterns.slice(-10),
        }
      );
    }
    
    return null;
  }

  handleCopyPasteAttempt() {
    return this.recordViolation(
      'copy_paste_attempt',
      'high',
      {
        timestamp: Date.now() - this.sessionStartTime,
      }
    );
  }

  handleRightClickAttempt() {
    return this.recordViolation(
      'right_click_attempt',
      'medium',
      {
        timestamp: Date.now() - this.sessionStartTime,
      }
    );
  }

  handleDevToolsAttempt() {
    return this.recordViolation(
      'dev_tools_attempt',
      'critical',
      {
        timestamp: Date.now() - this.sessionStartTime,
      }
    );
  }

  getIntegrityScore() {
    const maxScore = 100;
    const penaltyScore = Math.min(this.suspiciousActivityScore, maxScore);
    return Math.max(maxScore - penaltyScore, 0);
  }

  getSessionSummary() {
    return {
      violations: this.violations,
      violationCount: this.violations.length,
      suspiciousActivityScore: this.suspiciousActivityScore,
      integrityScore: this.getIntegrityScore(),
      focusLossCount: this.focusLossCount,
      rapidClickCount: this.rapidClickCount,
      averageTimePerQuestion: this.timePerQuestion.length > 0 
        ? this.timePerQuestion.reduce((a, b) => a + b, 0) / this.timePerQuestion.length 
        : 0,
      restartCount: this.restartCount,
      isSessionValid: this.getIntegrityScore() >= 70,
    };
  }
}

// Anti-Cheat Monitor Component
export default function AntiCheatMonitor({ 
  testId, 
  testType = 'MCQ', 
  maxRestarts = 1,
  onViolation,
  onSessionEnd,
  children 
}) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  
  const antiCheatSystem = useRef(new AntiCheatSystem()).current;
  const questionStartTime = useRef(Date.now());
  const { addSkillVerification } = useVerification();

  useEffect(() => {
    // Start monitoring when component mounts
    const session = antiCheatSystem.startMonitoring(testId, testType, maxRestarts);
    setIsMonitoring(true);

    // App state change monitoring (for tab switching detection)
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        const result = antiCheatSystem.handleTabSwitch();
        handleViolationResult(result);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      const sessionSummary = antiCheatSystem.stopMonitoring();
      setIsMonitoring(false);
      
      if (onSessionEnd) {
        onSessionEnd(sessionSummary);
      }
      
      if (appStateSubscription?.remove) {
        appStateSubscription.remove();
      }
    };
  }, [testId]);

  const handleViolationResult = (result) => {
    if (!result) return;

    setCurrentViolation(result.violation);
    setViolationCount(prev => prev + 1);
    setIntegrityScore(antiCheatSystem.getIntegrityScore());

    if (onViolation) {
      onViolation(result);
    }

    if (result.action === 'terminate') {
      Alert.alert(
        '⚠️ Test Terminated',
        'Multiple security violations detected. Test session has been terminated.',
        [{ text: 'OK', onPress: () => onSessionEnd?.(antiCheatSystem.getSessionSummary()) }]
      );
    } else if (result.action === 'restart') {
      Alert.alert(
        '⚠️ Security Violation',
        `Tab switching detected. Test will restart from the beginning. Remaining restarts: ${maxRestarts - antiCheatSystem.restartCount}`,
        [{ text: 'Restart Test', onPress: () => setShowViolationAlert(false) }]
      );
    }
  };

  // Expose anti-cheat functions for test screens to use
  const antiCheatActions = {
    recordQuestionStart: () => {
      questionStartTime.current = Date.now();
    },
    
    recordAnswerSubmission: (answer, allAnswers) => {
      const timeSpent = Date.now() - questionStartTime.current;
      
      // Check for rapid answering
      const rapidViolation = antiCheatSystem.handleRapidAnswering(timeSpent, 5000);
      if (rapidViolation) {
        handleViolationResult({ violation: rapidViolation });
      }
      
      // Analyze answer patterns
      const patternViolation = antiCheatSystem.analyzeAnswerPattern([...allAnswers, answer]);
      if (patternViolation) {
        handleViolationResult({ violation: patternViolation });
      }
      
      antiCheatSystem.recordActivity('answer_submitted', {
        timeSpent,
        answer,
        questionIndex: allAnswers.length,
      });
    },
    
    recordCopyPasteAttempt: () => {
      const violation = antiCheatSystem.handleCopyPasteAttempt();
      handleViolationResult({ violation });
    },
    
    recordRightClickAttempt: () => {
      const violation = antiCheatSystem.handleRightClickAttempt();
      handleViolationResult({ violation });
    },
    
    recordDevToolsAttempt: () => {
      const violation = antiCheatSystem.handleDevToolsAttempt();
      handleViolationResult({ violation: { action: 'terminate' } });
    },
    
    getIntegrityScore: () => antiCheatSystem.getIntegrityScore(),
    
    getSessionSummary: () => antiCheatSystem.getSessionSummary(),
  };

  return (
    <View style={styles.container}>
      {/* Anti-Cheat Status Bar */}
      {isMonitoring && (
        <View style={styles.statusBar}>
          <View style={styles.statusInfo}>
            <Ionicons 
              name="shield-checkmark" 
              size={16} 
              color={integrityScore >= 80 ? '#34C759' : integrityScore >= 60 ? '#FF9500' : '#FF3B30'} 
            />
            <Text style={styles.statusText}>
              Integrity: {integrityScore}%
            </Text>
          </View>
          <View style={styles.violationCount}>
            <Ionicons name="warning" size={14} color="#FF3B30" />
            <Text style={styles.violationText}>{violationCount}</Text>
          </View>
        </View>
      )}

      {/* Protected Content */}
      <View 
        style={styles.protectedContent}
        onTouchStart={() => antiCheatActions.recordQuestionStart()}
      >
        {React.cloneElement(children, { antiCheat: antiCheatActions })}
      </View>

      {/* Violation Alert Overlay */}
      {showViolationAlert && currentViolation && (
        <View style={styles.violationOverlay}>
          <View style={styles.violationAlert}>
            <Ionicons name="warning" size={32} color="#FF3B30" />
            <Text style={styles.violationTitle}>Security Violation Detected</Text>
            <Text style={styles.violationDescription}>
              {currentViolation.type.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={styles.violationDetails}>
              This activity has been logged and may affect your test results.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Higher-Order Component for easy integration
export function withAntiCheat(Component, testType = 'MCQ') {
  return function ProtectedComponent(props) {
    return (
      <AntiCheatMonitor
        testId={props.testId || props.test?.id}
        testType={testType}
        maxRestarts={1}
        onViolation={(result) => {
          console.log('Anti-cheat violation:', result);
        }}
        onSessionEnd={(summary) => {
          console.log('Anti-cheat session ended:', summary);
          if (props.onAntiCheatSessionEnd) {
            props.onAntiCheatSessionEnd(summary);
          }
        }}
      >
        <Component {...props} />
      </AntiCheatMonitor>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  violationCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  violationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 4,
  },
  protectedContent: {
    flex: 1,
  },
  violationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  violationAlert: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  violationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  violationDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  violationDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export { AntiCheatSystem };
