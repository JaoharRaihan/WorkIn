import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SkillNet Trust Score Calculator Service
 * 
 * Calculates comprehensive trust scores based on:
 * - Identity verification
 * - Skill verifications (tests, projects, peer review)
 * - Learning consistency
 * - Anti-cheat compliance
 * - Social proof (endorsements, mentorship)
 * - Blockchain credentials
 */

class TrustScoreCalculator {
  constructor() {
    this.weights = {
      identityVerification: 0.25,    // 25% - Identity proof
      skillVerifications: 0.30,      // 30% - Technical skill proof
      learningConsistency: 0.15,     // 15% - Learning behavior
      antiCheatCompliance: 0.15,     // 15% - Test integrity
      socialProof: 0.10,             // 10% - Endorsements
      blockchainCredentials: 0.05,   // 5% - Blockchain verification
    };

    this.maxScores = {
      identityVerification: 100,
      skillVerifications: 100,
      learningConsistency: 100,
      antiCheatCompliance: 100,
      socialProof: 100,
      blockchainCredentials: 100,
    };

    this.trustLevels = {
      unverified: { min: 0, max: 39, label: 'Unverified', color: '#FF3B30' },
      basic: { min: 40, max: 59, label: 'Basic', color: '#FF9500' },
      enhanced: { min: 60, max: 79, label: 'Enhanced', color: '#007AFF' },
      premium: { min: 80, max: 100, label: 'Premium', color: '#34C759' },
    };
  }

  /**
   * Calculate overall trust score
   */
  calculateTrustScore(verificationData, profileData, antiCheatData) {
    const scores = {
      identityVerification: this.calculateIdentityScore(verificationData.identityVerification),
      skillVerifications: this.calculateSkillScore(verificationData.skillVerifications),
      learningConsistency: this.calculateLearningScore(verificationData.learningVerification, profileData),
      antiCheatCompliance: this.calculateAntiCheatScore(antiCheatData),
      socialProof: this.calculateSocialScore(verificationData.endorsements),
      blockchainCredentials: this.calculateBlockchainScore(verificationData.blockchainCredentials),
    };

    const weightedScore = Object.entries(scores).reduce((total, [category, score]) => {
      return total + (score * this.weights[category]);
    }, 0);

    const trustLevel = this.getTrustLevel(weightedScore);

    return {
      overallScore: Math.round(weightedScore),
      breakdown: scores,
      trustLevel,
      improvements: this.suggestImprovements(scores),
      lastCalculated: new Date().toISOString(),
    };
  }

  /**
   * Calculate identity verification score
   */
  calculateIdentityScore(identityVerification) {
    if (!identityVerification.isVerified) return 0;

    let score = 60; // Base score for verification

    // Bonus for verification method
    switch (identityVerification.method) {
      case 'government_id':
        score += 25;
        break;
      case 'biometric':
        score += 30;
        break;
      case 'social_proof':
        score += 15;
        break;
      default:
        score += 10;
    }

    // Bonus for trust level
    switch (identityVerification.trustLevel) {
      case 'premium':
        score += 15;
        break;
      case 'enhanced':
        score += 10;
        break;
      case 'basic':
        score += 5;
        break;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate skill verification score
   */
  calculateSkillScore(skillVerifications) {
    if (!skillVerifications || skillVerifications.length === 0) return 0;

    let totalScore = 0;
    let weightSum = 0;

    skillVerifications.forEach(verification => {
      const methodWeight = {
        'test': 0.4,
        'project': 0.35,
        'peer_review': 0.15,
        'mentor_review': 0.10,
      };

      const levelMultiplier = {
        'expert': 1.0,
        'advanced': 0.8,
        'intermediate': 0.6,
        'basic': 0.4,
      };

      const weight = methodWeight[verification.verificationMethod] || 0.2;
      const multiplier = levelMultiplier[verification.verificationLevel] || 0.5;
      const normalizedScore = (verification.score / verification.maxScore) * 100;
      
      totalScore += normalizedScore * weight * multiplier;
      weightSum += weight * multiplier;
    });

    const baseScore = weightSum > 0 ? (totalScore / weightSum) : 0;
    
    // Bonus for multiple verifications
    const verificationBonus = Math.min(skillVerifications.length * 2, 20);
    
    return Math.min(baseScore + verificationBonus, 100);
  }

  /**
   * Calculate learning consistency score
   */
  calculateLearningScore(learningVerification, profileData) {
    if (!learningVerification) return 0;

    let score = 0;

    // Completed roadmaps
    const roadmapScore = Math.min(learningVerification.roadmapsCompleted.length * 15, 30);
    
    // Learning streak
    const streakScore = Math.min(profileData.stats.learningStreak * 2, 20);
    
    // Learning hours
    const hoursScore = Math.min(learningVerification.learningHours * 0.5, 25);
    
    // Consistency score (based on regular learning activity)
    const consistencyScore = learningVerification.consistencyScore || 0;
    
    // Test completion rate
    const testScore = Math.min(learningVerification.testsCompleted.length * 2, 15);
    
    score = roadmapScore + streakScore + hoursScore + consistencyScore + testScore;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate anti-cheat compliance score
   */
  calculateAntiCheatScore(antiCheatData) {
    if (!antiCheatData || antiCheatData.length === 0) return 85; // Default for new users

    let totalIntegrityScore = 0;
    let sessionCount = 0;

    antiCheatData.forEach(session => {
      if (session.integrityScore !== undefined) {
        totalIntegrityScore += session.integrityScore;
        sessionCount++;
      }
    });

    if (sessionCount === 0) return 85;

    const averageIntegrity = totalIntegrityScore / sessionCount;
    
    // Penalty for violations
    const totalViolations = antiCheatData.reduce((sum, session) => 
      sum + (session.violationCount || 0), 0
    );
    
    const violationPenalty = Math.min(totalViolations * 5, 30);
    
    return Math.max(averageIntegrity - violationPenalty, 0);
  }

  /**
   * Calculate social proof score
   */
  calculateSocialScore(endorsements) {
    if (!endorsements) return 0;

    let score = 0;

    // Mentor endorsements (higher weight)
    const mentorScore = Math.min(endorsements.mentor.length * 15, 60);
    
    // Peer endorsements
    const peerScore = Math.min(endorsements.peer.length * 8, 40);
    
    // Quality bonus based on ratings
    let qualityBonus = 0;
    [...endorsements.mentor, ...endorsements.peer].forEach(endorsement => {
      if (endorsement.rating >= 4) qualityBonus += 2;
      if (endorsement.rating === 5) qualityBonus += 1;
    });
    
    score = mentorScore + peerScore + Math.min(qualityBonus, 20);
    
    return Math.min(score, 100);
  }

  /**
   * Calculate blockchain credentials score
   */
  calculateBlockchainScore(blockchainCredentials) {
    if (!blockchainCredentials || blockchainCredentials.length === 0) return 0;

    const baseScore = Math.min(blockchainCredentials.length * 20, 80);
    
    // Bonus for verified credentials
    const verifiedBonus = blockchainCredentials.filter(cred => 
      cred.verificationStatus === 'verified'
    ).length * 5;
    
    return Math.min(baseScore + verifiedBonus, 100);
  }

  /**
   * Get trust level based on score
   */
  getTrustLevel(score) {
    for (const [level, config] of Object.entries(this.trustLevels)) {
      if (score >= config.min && score <= config.max) {
        return { level, ...config };
      }
    }
    return this.trustLevels.unverified;
  }

  /**
   * Suggest improvements to increase trust score
   */
  suggestImprovements(scores) {
    const improvements = [];

    if (scores.identityVerification < 80) {
      improvements.push({
        category: 'Identity Verification',
        suggestion: 'Complete identity verification with government ID',
        impact: 'High',
        potentialGain: 25,
      });
    }

    if (scores.skillVerifications < 70) {
      improvements.push({
        category: 'Skill Verification',
        suggestion: 'Complete more verified tests and projects',
        impact: 'High',
        potentialGain: 30,
      });
    }

    if (scores.learningConsistency < 60) {
      improvements.push({
        category: 'Learning Consistency',
        suggestion: 'Maintain regular learning streaks and complete roadmaps',
        impact: 'Medium',
        potentialGain: 20,
      });
    }

    if (scores.socialProof < 50) {
      improvements.push({
        category: 'Social Proof',
        suggestion: 'Get endorsements from peers and mentors',
        impact: 'Medium',
        potentialGain: 15,
      });
    }

    if (scores.antiCheatCompliance < 90) {
      improvements.push({
        category: 'Test Integrity',
        suggestion: 'Take tests in distraction-free environment',
        impact: 'Medium',
        potentialGain: 10,
      });
    }

    if (scores.blockchainCredentials < 30) {
      improvements.push({
        category: 'Blockchain Credentials',
        suggestion: 'Complete advanced verifications for blockchain credentials',
        impact: 'Low',
        potentialGain: 5,
      });
    }

    return improvements.sort((a, b) => {
      const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Calculate trust score trend over time
   */
  calculateTrend(historicalScores) {
    if (!historicalScores || historicalScores.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const recent = historicalScores.slice(-5); // Last 5 scores
    const trend = recent[recent.length - 1].overallScore - recent[0].overallScore;

    if (trend > 5) return { trend: 'increasing', change: trend };
    if (trend < -5) return { trend: 'decreasing', change: trend };
    return { trend: 'stable', change: trend };
  }

  /**
   * Generate trust score report
   */
  generateTrustReport(trustScore) {
    const reportId = 'TR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return {
      reportId,
      generatedAt: new Date().toISOString(),
      overallScore: trustScore.overallScore,
      trustLevel: trustScore.trustLevel,
      breakdown: trustScore.breakdown,
      improvements: trustScore.improvements,
      summary: this.generateScoreSummary(trustScore),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  }

  /**
   * Generate human-readable score summary
   */
  generateScoreSummary(trustScore) {
    const level = trustScore.trustLevel.level;
    const score = trustScore.overallScore;

    let summary = `Trust Score: ${score}/100 (${trustScore.trustLevel.label})\n\n`;

    if (level === 'premium') {
      summary += 'This candidate has achieved the highest level of verification and demonstrates exceptional trustworthiness for hiring.';
    } else if (level === 'enhanced') {
      summary += 'This candidate has strong verification credentials and demonstrates good trustworthiness for hiring.';
    } else if (level === 'basic') {
      summary += 'This candidate has basic verification and shows potential. Additional verification recommended.';
    } else {
      summary += 'This candidate requires additional verification before considering for hiring.';
    }

    // Add strongest verification areas
    const strongAreas = Object.entries(trustScore.breakdown)
      .filter(([_, score]) => score >= 80)
      .map(([category, _]) => category.replace(/([A-Z])/g, ' $1').toLowerCase());

    if (strongAreas.length > 0) {
      summary += `\n\nStrong verification in: ${strongAreas.join(', ')}.`;
    }

    return summary;
  }

  /**
   * Save trust score history
   */
  async saveTrustScoreHistory(userId, trustScore) {
    try {
      const historyKey = `trust_history_${userId}`;
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.push({
        ...trustScore,
        calculatedAt: new Date().toISOString(),
      });

      // Keep only last 50 entries
      const trimmedHistory = history.slice(-50);
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
      return trimmedHistory;
    } catch (error) {
      console.error('Error saving trust score history:', error);
      return [];
    }
  }

  /**
   * Load trust score history
   */
  async loadTrustScoreHistory(userId) {
    try {
      const historyKey = `trust_history_${userId}`;
      const history = await AsyncStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading trust score history:', error);
      return [];
    }
  }
}

// Singleton instance
const trustScoreCalculator = new TrustScoreCalculator();

export default trustScoreCalculator;
export { TrustScoreCalculator };
