class ProgressTrackingService {
  constructor() {
    this.milestoneThresholds = this.initializeMilestoneThresholds();
    this.activityTypes = this.initializeActivityTypes();
  }

  initializeMilestoneThresholds() {
    return {
      // XP-based milestones
      xpMilestones: [
        { threshold: 100, title: "First Steps", emoji: "🚀", description: "Earned your first 100 XP!" },
        { threshold: 500, title: "Getting Started", emoji: "⭐", description: "Reached 500 XP milestone!" },
        { threshold: 1000, title: "Knowledge Seeker", emoji: "🎯", description: "Hit the 1K XP mark!" },
        { threshold: 2500, title: "Learning Enthusiast", emoji: "🔥", description: "Blazed past 2.5K XP!" },
        { threshold: 5000, title: "Skill Builder", emoji: "💪", description: "Powered through 5K XP!" },
        { threshold: 10000, title: "Learning Master", emoji: "👑", description: "Achieved 10K XP mastery!" }
      ],

      // Streak-based milestones
      streakMilestones: [
        { threshold: 3, title: "Getting Consistent", emoji: "📈", description: "3-day learning streak!" },
        { threshold: 7, title: "Week Warrior", emoji: "🗓️", description: "7-day learning streak!" },
        { threshold: 14, title: "Two Week Champion", emoji: "🏆", description: "14-day learning streak!" },
        { threshold: 30, title: "Monthly Master", emoji: "🌟", description: "30-day learning streak!" },
        { threshold: 60, title: "Consistency King", emoji: "👑", description: "60-day learning streak!" },
        { threshold: 100, title: "Legendary Learner", emoji: "🎖️", description: "100-day learning streak!" }
      ],

      // Badge-based milestones
      badgeMilestones: [
        { threshold: 1, title: "First Badge", emoji: "🎖️", description: "Earned your first skill badge!" },
        { threshold: 5, title: "Badge Collector", emoji: "🏅", description: "Collected 5 skill badges!" },
        { threshold: 10, title: "Skill Specialist", emoji: "⚡", description: "Earned 10 skill badges!" },
        { threshold: 20, title: "Multi-Skilled", emoji: "🌈", description: "Mastered 20 different skills!" },
        { threshold: 50, title: "Badge Master", emoji: "👑", description: "Incredible! 50 skill badges!" }
      ],

      // Roadmap completion milestones
      roadmapMilestones: [
        { threshold: 1, title: "First Journey Complete", emoji: "🎯", description: "Completed your first roadmap!" },
        { threshold: 3, title: "Path Explorer", emoji: "🗺️", description: "Completed 3 learning paths!" },
        { threshold: 5, title: "Journey Master", emoji: "🧭", description: "Completed 5 roadmaps!" },
        { threshold: 10, title: "Learning Nomad", emoji: "🎒", description: "Completed 10 roadmaps!" }
      ],

      // Test performance milestones
      testMilestones: [
        { threshold: 90, title: "Perfectionist", emoji: "💯", description: "Scored 90%+ on a test!" },
        { threshold: 95, title: "Excellence Achieved", emoji: "⭐", description: "Scored 95%+ on a test!" },
        { threshold: 100, title: "Perfect Score", emoji: "🎯", description: "Achieved a perfect score!" }
      ]
    };
  }

  initializeActivityTypes() {
    return {
      LESSON_COMPLETED: { points: 1, label: "Lesson Completed" },
      TEST_PASSED: { points: 2, label: "Test Passed" },
      PROJECT_SUBMITTED: { points: 3, label: "Project Submitted" },
      STREAK_MAINTAINED: { points: 1, label: "Daily Streak" },
      BADGE_EARNED: { points: 2, label: "Badge Earned" },
      ROADMAP_COMPLETED: { points: 4, label: "Roadmap Completed" },
      PERFECT_SCORE: { points: 3, label: "Perfect Test Score" },
      HELP_GIVEN: { points: 1, label: "Helped Community" }
    };
  }

  // Update user progress with comprehensive tracking
  updateProgress(userId, activityData) {
    const {
      type, // activity type
      stepId,
      roadmapId,
      xpEarned,
      testScore,
      badgeEarned,
      timeSpent,
      metadata = {}
    } = activityData;

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate activity points for heatmap
    const activityType = this.activityTypes[type] || this.activityTypes.LESSON_COMPLETED;
    const activityPoints = activityType.points;

    return {
      date: today,
      activityType: type,
      stepId,
      roadmapId,
      xpEarned,
      activityPoints,
      testScore,
      badgeEarned,
      timeSpent,
      metadata,
      heatmapIntensity: this.calculateHeatmapIntensity(activityPoints),
      tooltip: this.generateTooltip(type, xpEarned, testScore, metadata)
    };
  }

  // Calculate heatmap intensity based on activity
  calculateHeatmapIntensity(activityPoints) {
    if (activityPoints >= 4) return 4; // Maximum intensity
    if (activityPoints >= 3) return 3; // High intensity
    if (activityPoints >= 2) return 2; // Medium intensity
    return 1; // Low intensity
  }

  // Generate tooltip for heatmap
  generateTooltip(type, xpEarned, testScore, metadata) {
    const activityType = this.activityTypes[type];
    let tooltip = activityType ? activityType.label : 'Learning Activity';

    if (xpEarned) {
      tooltip += ` (+${xpEarned} XP)`;
    }

    if (testScore !== undefined) {
      tooltip += ` (${Math.round(testScore)}% score)`;
    }

    if (metadata.timeSpent) {
      tooltip += ` (${metadata.timeSpent} mins)`;
    }

    return tooltip;
  }

  // Detect milestones based on current progress
  detectMilestones(currentProgress, newActivity) {
    const milestones = [];
    const {
      totalXP,
      currentStreak,
      totalBadges,
      completedRoadmaps,
      testScores = []
    } = currentProgress;

    // Check XP milestones
    const xpBefore = totalXP - (newActivity.xpEarned || 0);
    for (const milestone of this.milestoneThresholds.xpMilestones) {
      if (xpBefore < milestone.threshold && totalXP >= milestone.threshold) {
        milestones.push({
          type: 'xp',
          ...milestone,
          value: totalXP,
          isNew: true
        });
      }
    }

    // Check streak milestones
    for (const milestone of this.milestoneThresholds.streakMilestones) {
      if (currentStreak === milestone.threshold) {
        milestones.push({
          type: 'streak',
          ...milestone,
          value: currentStreak,
          isNew: true
        });
      }
    }

    // Check badge milestones
    if (newActivity.badgeEarned) {
      for (const milestone of this.milestoneThresholds.badgeMilestones) {
        if (totalBadges === milestone.threshold) {
          milestones.push({
            type: 'badge',
            ...milestone,
            value: totalBadges,
            isNew: true
          });
        }
      }
    }

    // Check roadmap completion milestones
    if (newActivity.type === 'ROADMAP_COMPLETED') {
      for (const milestone of this.milestoneThresholds.roadmapMilestones) {
        if (completedRoadmaps === milestone.threshold) {
          milestones.push({
            type: 'roadmap',
            ...milestone,
            value: completedRoadmaps,
            isNew: true
          });
        }
      }
    }

    // Check test performance milestones
    if (newActivity.testScore) {
      for (const milestone of this.milestoneThresholds.testMilestones) {
        if (newActivity.testScore >= milestone.threshold) {
          milestones.push({
            type: 'test',
            ...milestone,
            value: newActivity.testScore,
            isNew: true,
            isPerformanceBased: true
          });
        }
      }
    }

    return milestones;
  }

  // Calculate current learning streak
  calculateStreak(heatmapData) {
    if (!heatmapData || heatmapData.length === 0) return 0;

    const sortedData = heatmapData
      .filter(item => item.activity > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedData.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    // Check if user was active today
    const today = currentDate.toISOString().split('T')[0];
    if (sortedData[0].date !== today) {
      // If not active today, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterday = currentDate.toISOString().split('T')[0];
      if (sortedData[0].date !== yesterday) {
        return 0; // Streak broken
      }
    }

    // Count consecutive days
    for (let i = 0; i < sortedData.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (sortedData[i] && sortedData[i].date === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Update heatmap data with new activity
  updateHeatmapData(existingData, newActivity) {
    const updatedData = [...existingData];
    const today = newActivity.date;
    
    // Find existing entry for today
    const todayIndex = updatedData.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      // Update existing entry
      const existing = updatedData[todayIndex];
      updatedData[todayIndex] = {
        ...existing,
        activity: Math.min(4, existing.activity + newActivity.activityPoints),
        tooltip: this.combineTooltips(existing.tooltip, newActivity.tooltip)
      };
    } else {
      // Add new entry
      updatedData.push({
        date: today,
        activity: newActivity.heatmapIntensity,
        tooltip: newActivity.tooltip
      });
    }

    // Sort by date and keep only last 90 days
    return updatedData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 90);
  }

  // Combine tooltips for multiple activities on same day
  combineTooltips(existing, newTooltip) {
    if (!existing) return newTooltip;
    return `${existing}\n${newTooltip}`;
  }

  // Generate progress insights
  generateProgressInsights(progressData) {
    const {
      totalXP,
      currentStreak,
      heatmapData,
      completedSteps,
      totalBadges,
      testScores = []
    } = progressData;

    const insights = [];

    // Streak insights
    if (currentStreak >= 7) {
      insights.push({
        type: 'streak',
        icon: '🔥',
        title: 'Streak Power!',
        message: `You're on a ${currentStreak}-day learning streak!`,
        color: '#FF6B35'
      });
    } else if (currentStreak === 0) {
      insights.push({
        type: 'motivation',
        icon: '💪',
        title: 'Start Your Streak',
        message: 'Complete a lesson today to start your learning streak!',
        color: '#007AFF'
      });
    }

    // Activity insights
    const recentActivity = this.calculateRecentActivity(heatmapData);
    if (recentActivity.weeklyAverage >= 5) {
      insights.push({
        type: 'activity',
        icon: '⚡',
        title: 'High Performer',
        message: 'You\'re averaging 5+ activities per week!',
        color: '#34C759'
      });
    }

    // Test performance insights
    if (testScores.length >= 3) {
      const averageScore = testScores.reduce((a, b) => a + b, 0) / testScores.length;
      if (averageScore >= 85) {
        insights.push({
          type: 'performance',
          icon: '🎯',
          title: 'Test Master',
          message: `Excellent ${Math.round(averageScore)}% average test score!`,
          color: '#FF9500'
        });
      }
    }

    // Growth insights
    const growthRate = this.calculateGrowthRate(heatmapData);
    if (growthRate > 0.2) {
      insights.push({
        type: 'growth',
        icon: '📈',
        title: 'Rising Star',
        message: 'Your learning activity is trending upward!',
        color: '#AF52DE'
      });
    }

    return insights;
  }

  // Calculate recent activity metrics
  calculateRecentActivity(heatmapData) {
    const last7Days = heatmapData
      .filter(item => {
        const itemDate = new Date(item.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      });

    const last30Days = heatmapData
      .filter(item => {
        const itemDate = new Date(item.date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return itemDate >= monthAgo;
      });

    return {
      weeklyTotal: last7Days.reduce((sum, item) => sum + item.activity, 0),
      weeklyAverage: last7Days.length > 0 ? last7Days.reduce((sum, item) => sum + item.activity, 0) / 7 : 0,
      monthlyTotal: last30Days.reduce((sum, item) => sum + item.activity, 0),
      activeDays: last7Days.filter(item => item.activity > 0).length
    };
  }

  // Calculate learning growth rate
  calculateGrowthRate(heatmapData) {
    if (heatmapData.length < 14) return 0;

    const sorted = heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const midPoint = Math.floor(sorted.length / 2);
    
    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);

    const firstAverage = firstHalf.reduce((sum, item) => sum + item.activity, 0) / firstHalf.length;
    const secondAverage = secondHalf.reduce((sum, item) => sum + item.activity, 0) / secondHalf.length;

    return firstAverage > 0 ? (secondAverage - firstAverage) / firstAverage : 0;
  }

  // Get next milestone progress
  getNextMilestoneProgress(currentProgress) {
    const { totalXP, currentStreak, totalBadges, completedRoadmaps } = currentProgress;

    const nextMilestones = [];

    // Next XP milestone
    const nextXP = this.milestoneThresholds.xpMilestones.find(m => m.threshold > totalXP);
    if (nextXP) {
      nextMilestones.push({
        type: 'xp',
        ...nextXP,
        current: totalXP,
        progress: totalXP / nextXP.threshold,
        remaining: nextXP.threshold - totalXP
      });
    }

    // Next streak milestone
    const nextStreak = this.milestoneThresholds.streakMilestones.find(m => m.threshold > currentStreak);
    if (nextStreak) {
      nextMilestones.push({
        type: 'streak',
        ...nextStreak,
        current: currentStreak,
        progress: currentStreak / nextStreak.threshold,
        remaining: nextStreak.threshold - currentStreak
      });
    }

    // Next badge milestone
    const nextBadge = this.milestoneThresholds.badgeMilestones.find(m => m.threshold > totalBadges);
    if (nextBadge) {
      nextMilestones.push({
        type: 'badge',
        ...nextBadge,
        current: totalBadges,
        progress: totalBadges / nextBadge.threshold,
        remaining: nextBadge.threshold - totalBadges
      });
    }

    return nextMilestones.sort((a, b) => b.progress - a.progress);
  }

  // Format milestone for social sharing
  formatMilestoneForSharing(milestone, userProgress) {
    const { type, title, emoji, description, value } = milestone;
    
    return {
      postType: 'milestone',
      title: `${emoji} ${title}`,
      description,
      metadata: {
        milestoneType: type,
        value,
        totalXP: userProgress.totalXP,
        currentStreak: userProgress.currentStreak,
        totalBadges: userProgress.totalBadges
      },
      shareText: `Just achieved ${title}! ${description} 🎉 #SkillNet #Learning`,
      visibility: 'public',
      tags: ['milestone', type, 'achievement']
    };
  }
}

export default ProgressTrackingService;
