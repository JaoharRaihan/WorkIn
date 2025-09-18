import apiService from './apiService';

class SearchService {
  // Global search across posts, users, roadmaps, challenges
  async globalSearch(query, filters = {}) {
    try {
      const response = await apiService.get('/search/global', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Global search error:', error);
      throw error;
    }
  }

  // Search posts in feed
  async searchPosts(query, filters = {}) {
    try {
      const response = await apiService.get('/search/posts', {
        params: {
          q: query,
          type: filters.type, // milestone, project, challenge, etc.
          skills: filters.skills,
          dateRange: filters.dateRange
        }
      });
      return response.data;
    } catch (error) {
      console.error('Post search error:', error);
      throw error;
    }
  }

  // Search users/candidates
  async searchUsers(query, filters = {}) {
    try {
      const response = await apiService.get('/search/users', {
        params: {
          q: query,
          role: filters.role, // candidate, hr, mentor
          skills: filters.skills,
          location: filters.location,
          experience: filters.experience
        }
      });
      return response.data;
    } catch (error) {
      console.error('User search error:', error);
      throw error;
    }
  }

  // Search roadmaps
  async searchRoadmaps(query, filters = {}) {
    try {
      const response = await apiService.get('/search/roadmaps', {
        params: {
          q: query,
          category: filters.category,
          difficulty: filters.difficulty,
          duration: filters.duration
        }
      });
      return response.data;
    } catch (error) {
      console.error('Roadmap search error:', error);
      throw error;
    }
  }

  // Search challenges
  async searchChallenges(query, filters = {}) {
    try {
      const response = await apiService.get('/search/challenges', {
        params: {
          q: query,
          status: filters.status, // active, upcoming, completed
          difficulty: filters.difficulty,
          type: filters.type
        }
      });
      return response.data;
    } catch (error) {
      console.error('Challenge search error:', error);
      throw error;
    }
  }

  // Get trending/popular searches
  async getTrendingSearches() {
    try {
      const response = await apiService.get('/search/trending');
      return response.data;
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query) {
    try {
      const response = await apiService.get('/search/suggestions', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  // Save search history
  async saveSearchHistory(query, type, userId) {
    try {
      await apiService.post('/search/history', {
        query,
        type,
        userId
      });
    } catch (error) {
      console.error('Save search history error:', error);
    }
  }

  // Get user search history
  async getSearchHistory(userId) {
    try {
      const response = await apiService.get(`/search/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  }
}

export default new SearchService();
