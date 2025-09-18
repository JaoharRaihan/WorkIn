import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';

// Hook for managing user statistics
export const useUserStats = () => {
  const { stats, updateStats, gainXP, incrementStreak, resetStreak } = useProfile();

  // Calculate level progress percentage
  const levelProgress = useMemo(() => {
    const xpInCurrentLevel = stats.totalXP % 1000;
    return (xpInCurrentLevel / 1000) * 100;
  }, [stats.totalXP]);

  // Get level name based on current level
  const getLevelName = useCallback((level) => {
    const levelNames = {
      1: 'Beginner',
      2: 'Novice',
      3: 'Learner',
      4: 'Practitioner',
      5: 'Skilled',
      6: 'Advanced',
      7: 'Expert',
      8: 'Master',
      9: 'Guru',
      10: 'Legend',
    };
    return levelNames[Math.min(level, 10)] || 'Legend';
  }, []);

  // Handle completing a learning activity
  const completeActivity = useCallback((activityType, xpReward = 50) => {
    gainXP(xpReward);
    
    // Update specific stats based on activity type
    const statsUpdate = {};
    switch (activityType) {
      case 'test':
        statsUpdate.testsCompleted = stats.testsCompleted + 1;
        break;
      case 'project':
        statsUpdate.projectsCompleted = stats.projectsCompleted + 1;
        break;
      case 'skill_verified':
        statsUpdate.skillsVerified = stats.skillsVerified + 1;
        break;
      default:
        break;
    }
    
    if (Object.keys(statsUpdate).length > 0) {
      updateStats(statsUpdate);
    }
  }, [stats, gainXP, updateStats]);

  return {
    stats,
    levelProgress,
    levelName: getLevelName(stats.currentLevel),
    completeActivity,
    incrementStreak,
    resetStreak,
  };
};

// Hook for managing skills
export const useSkills = () => {
  const { skills, addSkill, updateSkill, deleteSkill } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (searchQuery) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    return filtered;
  }, [skills, searchQuery, selectedCategory]);

  // Get skill categories
  const skillCategories = useMemo(() => {
    const categories = [...new Set(skills.map(skill => skill.category).filter(Boolean))];
    return ['All', ...categories];
  }, [skills]);

  // Get verified skills count
  const verifiedSkillsCount = useMemo(() => {
    return skills.filter(skill => skill.verified).length;
  }, [skills]);

  // Get skills by proficiency level
  const getSkillsByLevel = useCallback((level) => {
    return skills.filter(skill => skill.proficiencyLevel === level);
  }, [skills]);

  // Endorse a skill
  const endorseSkill = useCallback((skillId) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      updateSkill(skillId, { 
        endorsements: skill.endorsements + 1,
        lastEndorsed: new Date().toISOString()
      });
    }
  }, [skills, updateSkill]);

  return {
    skills: filteredSkills,
    allSkills: skills,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    skillCategories,
    verifiedSkillsCount,
    addSkill,
    updateSkill,
    deleteSkill,
    endorseSkill,
    getSkillsByLevel,
  };
};

// Hook for managing projects
export const useProjects = () => {
  const { projects, addProject, updateProject, deleteProject } = useProfile();
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  // Sort and filter projects
  const sortedProjects = useMemo(() => {
    let sorted = [...projects];

    // Filter
    if (filterBy !== 'all') {
      sorted = sorted.filter(project => project.status === filterBy);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
        break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [projects, sortBy, filterBy]);

  // Get featured projects (top 3 most recent)
  const featuredProjects = useMemo(() => {
    return projects
      .filter(project => project.status === 'completed')
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 3);
  }, [projects]);

  // Get technologies used across all projects
  const allTechnologies = useMemo(() => {
    const techs = projects.flatMap(project => project.technologies || []);
    return [...new Set(techs)];
  }, [projects]);

  return {
    projects: sortedProjects,
    allProjects: projects,
    featuredProjects,
    allTechnologies,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    addProject,
    updateProject,
    deleteProject,
  };
};

// Hook for managing achievements and badges
export const useAchievements = () => {
  const { achievements, badges, earnBadge } = useProfile();

  // Group badges by type
  const badgesByType = useMemo(() => {
    const grouped = badges.reduce((acc, badge) => {
      const type = badge.type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(badge);
      return acc;
    }, {});

    return grouped;
  }, [badges]);

  // Get recent badges (last 5)
  const recentBadges = useMemo(() => {
    return badges
      .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
      .slice(0, 5);
  }, [badges]);

  // Check if user qualifies for a new badge
  const checkBadgeEligibility = useCallback((stats, skills, projects) => {
    const eligibleBadges = [];

    // First Test Completed Badge
    if (stats.testsCompleted >= 1 && !badges.find(b => b.type === 'first_test')) {
      eligibleBadges.push({
        name: 'First Test',
        type: 'first_test',
        description: 'Completed your first skill test',
        icon: '🎯'
      });
    }

    // Skill Master Badge (5 verified skills)
    if (stats.skillsVerified >= 5 && !badges.find(b => b.type === 'skill_master')) {
      eligibleBadges.push({
        name: 'Skill Master',
        type: 'skill_master',
        description: 'Verified 5 different skills',
        icon: '🏆'
      });
    }

    // Project Pioneer Badge (first project)
    if (projects.length >= 1 && !badges.find(b => b.type === 'project_pioneer')) {
      eligibleBadges.push({
        name: 'Project Pioneer',
        type: 'project_pioneer',
        description: 'Completed your first project',
        icon: '🚀'
      });
    }

    // Learning Streak Badge (7 days)
    if (stats.learningStreak >= 7 && !badges.find(b => b.type === 'week_streak')) {
      eligibleBadges.push({
        name: 'Week Warrior',
        type: 'week_streak',
        description: '7-day learning streak',
        icon: '🔥'
      });
    }

    return eligibleBadges;
  }, [badges]);

  return {
    achievements,
    badges,
    badgesByType,
    recentBadges,
    earnBadge,
    checkBadgeEligibility,
  };
};

// Hook for profile analytics and insights
export const useProfileAnalytics = () => {
  const { stats, skills, projects, recentActivity } = useProfile();

  // Calculate weekly learning time trend
  const weeklyLearningTrend = useMemo(() => {
    // Mock data - in real app, this would come from API
    return [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 60 },
      { day: 'Wed', minutes: 30 },
      { day: 'Thu', minutes: 75 },
      { day: 'Fri', minutes: 50 },
      { day: 'Sat', minutes: 90 },
      { day: 'Sun', minutes: 40 },
    ];
  }, []);

  // Get skill progress insights
  const skillInsights = useMemo(() => {
    const totalSkills = skills.length;
    const verifiedSkills = skills.filter(s => s.verified).length;
    const averageProficiency = skills.reduce((acc, skill) => acc + skill.proficiencyLevel, 0) / totalSkills || 0;

    return {
      totalSkills,
      verifiedSkills,
      verificationRate: totalSkills > 0 ? (verifiedSkills / totalSkills) * 100 : 0,
      averageProficiency: Math.round(averageProficiency * 10) / 10,
    };
  }, [skills]);

  // Get learning momentum score
  const learningMomentum = useMemo(() => {
    let score = 0;
    
    // Streak contribution (max 40 points)
    score += Math.min(stats.learningStreak * 4, 40);
    
    // Recent activity contribution (max 30 points)
    const recentActivities = recentActivity.filter(
      activity => new Date(activity.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    score += Math.min(recentActivities.length * 3, 30);
    
    // XP growth contribution (max 30 points)
    score += Math.min((stats.totalXP % 1000) / 1000 * 30, 30);
    
    return Math.round(score);
  }, [stats, recentActivity]);

  return {
    weeklyLearningTrend,
    skillInsights,
    learningMomentum,
    totalActivities: recentActivity.length,
  };
};
