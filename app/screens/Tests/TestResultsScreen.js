import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

const TestResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { testResults, test } = route.params || {};
  
  const [results, setResults] = useState(null);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  useEffect(() => {
    if (testResults) {
      setResults(testResults);
    }
  }, [testResults]);

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Expert', color: '#34C759', icon: 'star' };
    if (score >= 80) return { level: 'Advanced', color: '#007AFF', icon: 'trending-up' };
    if (score >= 70) return { level: 'Proficient', color: '#FF9500', icon: 'checkmark-circle' };
    if (score >= 60) return { level: 'Developing', color: '#FFCC00', icon: 'time' };
    return { level: 'Needs Improvement', color: '#FF3B30', icon: 'alert-circle' };
  };

  const shareResults = async () => {
    try {
      const message = `I just completed the ${test.title} test on SkillNet and scored ${results.score}%! 🎉\n\nBadge earned: ${results.badgeEarned ? test.badge : 'Not earned'}\n\n#SkillNet #${test.skills[0].replace(' ', '')}`;
      
      await Share.share({
        message,
        url: 'https://skillnet.app',
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  const retakeTest = () => {
    Alert.alert(
      'Retake Test',
      `Are you sure you want to retake the ${test.title}? Your current score will be replaced if you score higher.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retake', 
          onPress: () => {
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
          }
        },
      ]
    );
  };

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const performance = getPerformanceLevel(results.score);
  const passed = results.score >= test.passingScore;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Results</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareResults}
          >
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Main Score Card */}
        <Card style={[styles.scoreCard, { borderColor: performance.color }]}>
          <View style={styles.scoreHeader}>
            <View style={[styles.scoreIconContainer, { backgroundColor: performance.color }]}>
              <Ionicons name={performance.icon} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.testTitle}>{test.title}</Text>
              <Text style={styles.performanceLevel}>
                {performance.level} Performance
              </Text>
            </View>
          </View>
          
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreText, { color: performance.color }]}>
              {results.score}%
            </Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
          </View>
          
          <View style={styles.passFailContainer}>
            <Badge 
              text={passed ? '✓ PASSED' : '✗ FAILED'} 
              variant={passed ? 'success' : 'danger'} 
              size="large"
            />
            <Text style={styles.passingScoreText}>
              Passing Score: {test.passingScore}%
            </Text>
          </View>
        </Card>

        {/* Badge Earned */}
        {passed && results.badgeEarned && (
          <Card style={styles.badgeCard}>
            <View style={styles.badgeHeader}>
              <Ionicons name="medal" size={32} color="#FFD700" />
              <Text style={styles.badgeTitle}>Badge Earned!</Text>
            </View>
            <Badge text={test.badge} variant="verified" size="large" />
            <Text style={styles.badgeDescription}>
              You've successfully demonstrated proficiency in {test.skills.join(', ')}
            </Text>
          </Card>
        )}

        {/* Performance Breakdown */}
        <Card style={styles.breakdownCard}>
          <TouchableOpacity 
            style={styles.breakdownHeader}
            onPress={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          >
            <Text style={styles.breakdownTitle}>Performance Breakdown</Text>
            <Ionicons 
              name={showDetailedBreakdown ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
          
          {results.breakdown && Object.entries(results.breakdown).map(([category, score]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <View style={styles.scoreBarContainer}>
                <View style={styles.scoreBar}>
                  <View 
                    style={[
                      styles.scoreBarFill, 
                      { 
                        width: `${score}%`,
                        backgroundColor: score >= 70 ? '#34C759' : score >= 50 ? '#FF9500' : '#FF3B30'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryScore}>{Math.round(score)}%</Text>
              </View>
            </View>
          ))}
          
          {showDetailedBreakdown && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Time Taken:</Text>
                <Text style={styles.statValue}>{results.timeTaken} minutes</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Questions Correct:</Text>
                <Text style={styles.statValue}>
                  {results.correctAnswers}/{results.totalQuestions}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuracy:</Text>
                <Text style={styles.statValue}>
                  {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Attempt:</Text>
                <Text style={styles.statValue}>
                  {results.attemptNumber}/{test.maxAttempts}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Recommendations */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {passed ? (
            <View>
              <Text style={styles.recommendationText}>
                🎉 Congratulations! You've demonstrated strong skills in {test.skills[0]}.
              </Text>
              <Text style={styles.recommendationText}>
                💡 Consider taking advanced-level tests to further validate your expertise.
              </Text>
              <Text style={styles.recommendationText}>
                📈 Share your achievement with your network to showcase your verified skills.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.recommendationText}>
                📚 Review the learning materials for areas where you scored below 70%.
              </Text>
              <Text style={styles.recommendationText}>
                🔄 You can retake this test {test.maxAttempts - results.attemptNumber} more time(s).
              </Text>
              <Text style={styles.recommendationText}>
                💪 Focus on practicing {test.skills[0]} fundamentals before your next attempt.
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!passed && results.attemptNumber < test.maxAttempts && (
            <Button
              title="Retake Test"
              variant="primary"
              size="large"
              onPress={retakeTest}
              style={styles.actionButton}
            />
          )}
          <Button
            title="View Analytics"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('TestAnalytics')}
            style={styles.actionButton}
          />
          <Button
            title="View Learning Path"
            variant="secondary"
            size="large"
            onPress={() => navigation.navigate('Learn')}
            style={styles.actionButton}
          />
          <Button
            title="Back to Tests"
            variant="outline"
            size="large"
            onPress={() => navigation.navigate('Tests')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    padding: 8,
  },
  scoreCard: {
    margin: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  performanceLevel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  passFailContainer: {
    alignItems: 'center',
  },
  passingScoreText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  badgeCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  breakdownCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    minWidth: 40,
    textAlign: 'right',
  },
  detailedStats: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  recommendationsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default TestResultsScreen;
