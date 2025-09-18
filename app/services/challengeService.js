import { socialFeedAPI } from './apiService';

class ChallengeService {
  constructor() {
    this.activeChallenge = null;
    this.challengeTimer = null;
    this.startTime = null;
  }

  // Get available challenges with filters
  async getChallenges(filters = {}) {
    try {
      const response = await socialFeedAPI.getChallenges(filters);
      return response;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  // Get specific challenge details
  async getChallengeDetails(challengeId) {
    try {
      const response = await socialFeedAPI.getChallengeDetails(challengeId);
      return response;
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      throw error;
    }
  }

  // Start a challenge session
  async startChallenge(challengeId) {
    try {
      const response = await socialFeedAPI.startChallenge(challengeId);
      if (response.success) {
        this.activeChallenge = {
          ...response.data,
          answers: [],
          currentQuestion: 0,
        };
        this.startTime = Date.now();
        
        // Start timer if challenge has time limit
        if (response.data.challenge.timeLimit) {
          this.startChallengeTimer(response.data.challenge.timeLimit);
        }
      }
      return response;
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  }

  // Answer a question in the challenge
  answerQuestion(questionIndex, answer) {
    if (!this.activeChallenge) {
      throw new Error('No active challenge');
    }

    if (questionIndex >= 0 && questionIndex < this.activeChallenge.answers.length) {
      // Update existing answer
      this.activeChallenge.answers[questionIndex] = answer;
    } else {
      // Add new answer
      this.activeChallenge.answers.push(answer);
    }

    this.activeChallenge.currentQuestion = questionIndex + 1;
  }

  // Submit the complete challenge
  async submitChallenge() {
    if (!this.activeChallenge) {
      throw new Error('No active challenge to submit');
    }

    try {
      const timeSpent = Date.now() - this.startTime;
      const submissionData = {
        sessionId: this.activeChallenge.sessionId,
        answers: this.activeChallenge.answers,
        timeSpent: Math.floor(timeSpent / 1000), // Convert to seconds
      };

      const response = await socialFeedAPI.submitChallenge(
        this.activeChallenge.challenge.id,
        submissionData
      );

      // Clear active challenge
      this.clearActiveChallenge();

      return response;
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  }

  // Start challenge timer
  startChallengeTimer(timeLimit) {
    if (this.challengeTimer) {
      clearTimeout(this.challengeTimer);
    }

    this.challengeTimer = setTimeout(() => {
      // Auto-submit when time runs out
      this.submitChallenge().catch(console.error);
    }, timeLimit * 1000);
  }

  // Get remaining time for active challenge
  getRemainingTime() {
    if (!this.activeChallenge || !this.activeChallenge.challenge.timeLimit) {
      return null;
    }

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const remaining = this.activeChallenge.challenge.timeLimit - elapsed;
    return Math.max(0, remaining);
  }

  // Clear active challenge and timer
  clearActiveChallenge() {
    if (this.challengeTimer) {
      clearTimeout(this.challengeTimer);
      this.challengeTimer = null;
    }
    this.activeChallenge = null;
    this.startTime = null;
  }

  // Get active challenge info
  getActiveChallenge() {
    return this.activeChallenge;
  }

  // Get challenge leaderboard
  async getLeaderboard(timeframe = 'all', limit = 10) {
    try {
      const response = await socialFeedAPI.getChallengeLeaderboard(timeframe, limit);
      return response;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // Get user's challenge progress
  async getUserProgress() {
    try {
      const response = await socialFeedAPI.getUserChallengeProgress();
      return response;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Get daily challenge
  async getDailyChallenge() {
    try {
      const response = await socialFeedAPI.getDailyChallenge();
      return response;
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      throw error;
    }
  }

  // Quick challenge for social feed integration
  async getQuickChallenge(difficulty = 'intermediate') {
    try {
      const filters = {
        category: 'Quick Challenge',
        difficulty: difficulty,
        limit: 1
      };
      const response = await this.getChallenges(filters);
      
      if (response.success && response.data.challenges.length > 0) {
        return response.data.challenges[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching quick challenge:', error);
      return null;
    }
  }

  // Format challenge results for social sharing
  formatResultForSharing(result) {
    const { score, passed, xpEarned, timeSpent } = result;
    
    let emoji = '💪';
    let message = 'Just completed a challenge!';
    
    if (score >= 90) {
      emoji = '🔥';
      message = 'Absolutely crushed this challenge!';
    } else if (score >= 80) {
      emoji = '⚡';
      message = 'Nailed this challenge!';
    } else if (score >= 70) {
      emoji = '✨';
      message = 'Successfully completed a challenge!';
    }
    
    return {
      emoji,
      message,
      shareText: `${emoji} ${message} Score: ${score}% | +${xpEarned} XP | Time: ${this.formatTime(timeSpent)} #SkillNet #ChallengeAccepted`,
      stats: {
        score,
        xpEarned,
        timeSpent: this.formatTime(timeSpent),
        status: passed ? 'Passed' : 'Keep practicing!'
      }
    };
  }

  // Format time in a human-readable way
  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  // Get challenge difficulty color
  getDifficultyColor(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return '#4CAF50';
      case 'intermediate':
      case 'medium':
        return '#FF9800';
      case 'advanced':
      case 'hard':
        return '#F44336';
      default:
        return '#2196F3';
    }
  }

  // Get challenge category icon
  getCategoryIcon(category) {
    switch (category.toLowerCase()) {
      case 'javascript':
        return '🟨';
      case 'react':
        return '⚛️';
      case 'css':
        return '🎨';
      case 'python':
        return '🐍';
      case 'quick challenge':
        return '⚡';
      case 'algorithm':
        return '🧮';
      case 'database':
        return '🗄️';
      default:
        return '💻';
    }
  }
}

// Create and export a singleton instance
const challengeService = new ChallengeService();
export default challengeService;
