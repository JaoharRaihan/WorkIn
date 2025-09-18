// Profile Service - API integration for user profiles
class ProfileService {
  constructor(apiService) {
    this.api = apiService;
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/profile`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await this.api.request(`/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload profile avatar
  async uploadAvatar(userId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'avatar.jpg',
      });

      const response = await this.api.request(`/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/stats`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user skills
  async getUserSkills(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/skills`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Add user skill
  async addUserSkill(userId, skillData) {
    try {
      const response = await this.api.request(`/users/${userId}/skills`, {
        method: 'POST',
        body: JSON.stringify(skillData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update user skill
  async updateUserSkill(userId, skillId, skillData) {
    try {
      const response = await this.api.request(`/users/${userId}/skills/${skillId}`, {
        method: 'PUT',
        body: JSON.stringify(skillData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete user skill
  async deleteUserSkill(userId, skillId) {
    try {
      const response = await this.api.request(`/users/${userId}/skills/${skillId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user projects
  async getUserProjects(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/projects`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Add user project
  async addUserProject(userId, projectData) {
    try {
      const response = await this.api.request(`/users/${userId}/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update user project
  async updateUserProject(userId, projectId, projectData) {
    try {
      const response = await this.api.request(`/users/${userId}/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete user project
  async deleteUserProject(userId, projectId) {
    try {
      const response = await this.api.request(`/users/${userId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user badges and achievements
  async getUserBadges(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/badges`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Award badge to user
  async awardBadge(userId, badgeData) {
    try {
      const response = await this.api.request(`/users/${userId}/badges`, {
        method: 'POST',
        body: JSON.stringify(badgeData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user activity feed
  async getUserActivity(userId, limit = 20) {
    try {
      const response = await this.api.request(`/users/${userId}/activity?limit=${limit}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update user XP
  async updateUserXP(userId, xpData) {
    try {
      const response = await this.api.request(`/users/${userId}/xp`, {
        method: 'POST',
        body: JSON.stringify(xpData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get learning analytics
  async getLearningAnalytics(userId, timeframe = 'week') {
    try {
      const response = await this.api.request(`/users/${userId}/analytics?timeframe=${timeframe}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update learning streak
  async updateLearningStreak(userId, streakData) {
    try {
      const response = await this.api.request(`/users/${userId}/streak`, {
        method: 'PUT',
        body: JSON.stringify(streakData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get trust and hirability scores
  async getScores(userId) {
    try {
      const response = await this.api.request(`/users/${userId}/scores`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Endorse user skill
  async endorseSkill(userId, skillId, endorsementData) {
    try {
      const response = await this.api.request(`/users/${userId}/skills/${skillId}/endorse`, {
        method: 'POST',
        body: JSON.stringify(endorsementData),
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Search users (for HR functionality)
  async searchUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await this.api.request(`/users/search?${queryParams}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export as singleton with apiService dependency injection
export default ProfileService;
