import AsyncStorage from '@react-native-async-storage/async-storage';

class TestHistoryService {
  constructor() {
    this.storageKey = 'test_history';
    this.resultsKey = 'test_results';
    this.progressKey = 'test_progress';
  }

  // Get user's test history
  async getTestHistory() {
    try {
      const history = await AsyncStorage.getItem(this.storageKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting test history:', error);
      return [];
    }
  }

  // Add test completion to history
  async addTestCompletion(testId, result) {
    try {
      const history = await this.getTestHistory();
      const completion = {
        testId,
        completedAt: new Date().toISOString(),
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: result.timeSpent,
        difficulty: result.difficulty,
        badge: result.badge,
        pointsEarned: result.pointsEarned,
      };

      // Add to beginning of array (most recent first)
      history.unshift(completion);
      
      // Keep only last 50 completions
      const trimmedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
      return completion;
    } catch (error) {
      console.error('Error adding test completion:', error);
      throw error;
    }
  }

  // Get detailed test results
  async getTestResults(testId) {
    try {
      const results = await AsyncStorage.getItem(`${this.resultsKey}_${testId}`);
      return results ? JSON.parse(results) : null;
    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  }

  // Save detailed test results
  async saveTestResults(testId, results) {
    try {
      await AsyncStorage.setItem(`${this.resultsKey}_${testId}`, JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
      throw error;
    }
  }

  // Get test progress (for tests in progress)
  async getTestProgress(testId) {
    try {
      const progress = await AsyncStorage.getItem(`${this.progressKey}_${testId}`);
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting test progress:', error);
      return null;
    }
  }

  // Save test progress
  async saveTestProgress(testId, progress) {
    try {
      await AsyncStorage.setItem(`${this.progressKey}_${testId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving test progress:', error);
      throw error;
    }
  }

  // Clear test progress (after completion)
  async clearTestProgress(testId) {
    try {
      await AsyncStorage.removeItem(`${this.progressKey}_${testId}`);
    } catch (error) {
      console.error('Error clearing test progress:', error);
    }
  }

  // Get test statistics
  async getTestStats() {
    try {
      const history = await this.getTestHistory();
      
      const stats = {
        totalTests: history.length,
        averageScore: 0,
        totalTimeSpent: 0,
        totalPointsEarned: 0,
        testsPassedCount: 0,
        recentActivity: [],
        categoryBreakdown: {},
        difficultyBreakdown: {
          Beginner: 0,
          Intermediate: 0,
          Advanced: 0,
        },
        monthlyProgress: {},
      };

      if (history.length === 0) return stats;

      // Calculate basic stats
      let totalScore = 0;
      let totalTime = 0;
      let totalPoints = 0;
      let passedTests = 0;

      history.forEach(test => {
        totalScore += test.score;
        totalTime += test.timeSpent || 0;
        totalPoints += test.pointsEarned || 0;
        
        if (test.score >= 70) passedTests++; // 70% pass rate
        
        // Difficulty breakdown
        if (stats.difficultyBreakdown[test.difficulty] !== undefined) {
          stats.difficultyBreakdown[test.difficulty]++;
        }
        
        // Monthly progress
        const month = new Date(test.completedAt).toISOString().slice(0, 7); // YYYY-MM
        if (!stats.monthlyProgress[month]) {
          stats.monthlyProgress[month] = { tests: 0, points: 0 };
        }
        stats.monthlyProgress[month].tests++;
        stats.monthlyProgress[month].points += test.pointsEarned || 0;
      });

      stats.averageScore = Math.round(totalScore / history.length);
      stats.totalTimeSpent = totalTime;
      stats.totalPointsEarned = totalPoints;
      stats.testsPassedCount = passedTests;
      stats.recentActivity = history.slice(0, 5); // Last 5 tests

      return stats;
    } catch (error) {
      console.error('Error getting test stats:', error);
      return {
        totalTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalPointsEarned: 0,
        testsPassedCount: 0,
        recentActivity: [],
        categoryBreakdown: {},
        difficultyBreakdown: { Beginner: 0, Intermediate: 0, Advanced: 0 },
        monthlyProgress: {},
      };
    }
  }

  // Get user's badges earned from tests
  async getBadgesEarned() {
    try {
      const history = await this.getTestHistory();
      const badges = history
        .filter(test => test.badge && test.score >= 70) // Only passed tests
        .map(test => ({
          badge: test.badge,
          earnedAt: test.completedAt,
          testId: test.testId,
          score: test.score,
        }));
      
      // Remove duplicates (keep the highest score for each badge)
      const uniqueBadges = {};
      badges.forEach(badge => {
        const key = badge.badge;
        if (!uniqueBadges[key] || uniqueBadges[key].score < badge.score) {
          uniqueBadges[key] = badge;
        }
      });
      
      return Object.values(uniqueBadges);
    } catch (error) {
      console.error('Error getting badges earned:', error);
      return [];
    }
  }

  // Get leaderboard position (mock implementation)
  async getLeaderboardPosition() {
    try {
      const stats = await this.getTestStats();
      // Mock leaderboard calculation based on total points
      const position = Math.max(1, Math.floor(Math.random() * 1000) + 1);
      return {
        position,
        totalPoints: stats.totalPointsEarned,
        percentile: Math.max(5, Math.min(95, 100 - (position / 10))),
      };
    } catch (error) {
      console.error('Error getting leaderboard position:', error);
      return { position: null, totalPoints: 0, percentile: 0 };
    }
  }

  // Clear all test data (for testing/development)
  async clearAllTestData() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.resultsKey);
      await AsyncStorage.removeItem(this.progressKey);
      console.log('All test data cleared');
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  }
}

export default new TestHistoryService();
