import { useState, useEffect, useRef, useCallback } from 'react';
import { socialFeedAPI } from '../services/apiService';
import challengeService from '../services/challengeService';
import { performanceMonitor } from '../utils/performanceMonitor';

export const useSocialFeedEnhanced = () => {
  // Mock data for immediate display
  const mockFeedData = [
    {
      id: '1',
      type: 'achievement',
      user: {
        name: 'Alex Chen',
        title: 'Full Stack Developer',
        avatar: '👨‍💻'
      },
      content: {
        title: 'Completed React Mastery Challenge!',
        description: 'Just finished building a complex React app with hooks, context, and performance optimization.',
        achievement: 'React Expert',
        xp: 250
      },
      timestamp: '2h ago',
      likes: 45,
      comments: 12,
      skills: ['React', 'JavaScript', 'Redux']
    },
    {
      id: '2',
      type: 'project',
      user: {
        name: 'Sarah Kim',
        title: 'UI/UX Designer',
        avatar: '👩‍🎨'
      },
      content: {
        title: 'E-commerce Mobile App Design',
        description: 'Designed a sleek mobile app for an e-commerce platform with focus on user experience.',
        techs: ['Figma', 'Sketch', 'Principle'],
        repo: 'sarah-kim/ecommerce-app'
      },
      timestamp: '4h ago',
      likes: 78,
      comments: 23,
      skills: ['UI Design', 'UX Research', 'Prototyping']
    },
    {
      id: '3',
      type: 'challenge',
      content: {
        title: 'JavaScript Algorithm Challenge',
        description: 'Solve this binary tree traversal problem in under 15 minutes!',
        difficulty: 'Medium',
        timeLimit: '15 min',
        participants: 234
      },
      likes: 56,
      comments: 18,
      skills: ['Algorithms', 'JavaScript', 'Data Structures']
    },
    {
      id: '4',
      type: 'mentor_tip',
      user: {
        name: 'David Rodriguez',
        title: 'Senior Software Engineer @ Google',
        avatar: '👨‍🏫'
      },
      content: {
        title: 'Pro Tip: Code Review Best Practices',
        description: 'Always write meaningful commit messages and test your code before requesting reviews. Small PRs are easier to review!',
        tip: 'Keep PRs under 400 lines for better review quality'
      },
      timestamp: '1d ago',
      likes: 189,
      comments: 45,
      skills: ['Code Review', 'Git', 'Team Collaboration']
    },
    {
      id: '5',
      type: 'ai_insight',
      content: {
        title: 'AI Recommendation',
        description: 'Based on your progress, you should learn TypeScript next to level up your React skills!',
        action: 'Start TypeScript Course',
        confidence: 94
      },
      likes: 23,
      comments: 8,
      skills: ['TypeScript', 'React', 'JavaScript']
    }
  ];

  const mockStories = [
    {
      id: 's1',
      user: 'Alex Chen',
      avatar: '👨‍💻',
      content: 'Daily coding streak: 15 days!',
      type: 'streak'
    },
    {
      id: 's2',
      user: 'Sarah Kim',
      avatar: '👩‍🎨',
      content: 'New design milestone achieved',
      type: 'milestone'
    },
    {
      id: 's3',
      user: 'Mike Wilson',
      avatar: '🧑‍💼',
      content: 'Quick Python tip',
      type: 'tip'
    }
  ];

  // Core feed state
  const [feedData, setFeedData] = useState(mockFeedData);
  const [stories, setStories] = useState(mockStories);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  // Comments state - track comments for each post
  const [commentStates, setCommentStates] = useState({});
  
  // Challenge state
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  
  // Real-time state
  const [pendingUpdates, setPendingUpdates] = useState(0);
  
  // Performance optimizations
  const nextCursor = useRef(null);
  const isInitialized = useRef(false);

  // Initialize feed and challenges
  const initializeFeed = useCallback(async () => {
    if (isInitialized.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      performanceMonitor.startTimer('feed_initialization');
      
      // Load feed, stories, and daily challenge in parallel
      const [feedResponse, storiesResponse] = await Promise.all([
        socialFeedAPI.getFeed(null, 10),
        socialFeedAPI.getStories(),
      ]);

      if (feedResponse && feedResponse.success) {
        setFeedData(feedResponse.data.posts || mockFeedData);
        nextCursor.current = feedResponse.data.nextCursor;
        setHasMore(feedResponse.data.hasMore || false);
      }

      if (storiesResponse && storiesResponse.success) {
        setStories(storiesResponse.data || mockStories);
      }

      // Load daily challenge
      await loadDailyChallenge();
      
      isInitialized.current = true;
      performanceMonitor.endTimer('feed_initialization');
    } catch (err) {
      console.error('Feed initialization error:', err);
      setError(err.message);
      // Fallback to mock data
      setFeedData(mockFeedData);
      setStories(mockStories);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load daily challenge
  const loadDailyChallenge = useCallback(async () => {
    try {
      setChallengeLoading(true);
      const challenge = await challengeService.getDailyChallenge();
      if (challenge && challenge.success) {
        setDailyChallenge(challenge.data);
      }
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    } finally {
      setChallengeLoading(false);
    }
  }, []);

  // Refresh feed
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      performanceMonitor.startTimer('feed_refresh');
      
      const [feedResponse, storiesResponse] = await Promise.all([
        socialFeedAPI.getFeed(null, 10),
        socialFeedAPI.getStories(),
      ]);

      if (feedResponse && feedResponse.success) {
        setFeedData(feedResponse.data.posts || mockFeedData);
        nextCursor.current = feedResponse.data.nextCursor;
        setHasMore(feedResponse.data.hasMore || false);
        setPendingUpdates(0);
      }

      if (storiesResponse && storiesResponse.success) {
        setStories(storiesResponse.data || mockStories);
      }

      await loadDailyChallenge();
      
      performanceMonitor.endTimer('feed_refresh');
    } catch (err) {
      console.error('Feed refresh error:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [loadDailyChallenge]);

  // Load more posts
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor.current) return;

    setLoadingMore(true);
    
    try {
      const response = await socialFeedAPI.getFeed(nextCursor.current, 10);
      
      if (response && response.success) {
        setFeedData(prev => [...prev, ...(response.data.posts || [])]);
        nextCursor.current = response.data.nextCursor;
        setHasMore(response.data.hasMore || false);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  // Handle post reactions
  const handlePostReaction = useCallback(async (postId, reactionType, skillName = null) => {
    const startTime = Date.now();
    
    try {
      // Optimistic update
      setFeedData(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.likes + (reactionType === 'like' ? 1 : -1),
              userReaction: reactionType
            }
          : post
      ));

      const response = await socialFeedAPI.reactToPost(postId, reactionType, skillName);
      
      if (response && response.success) {
        // Update with server response
        setFeedData(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                reactions: response.data.newStats || post.reactions,
                userReaction: reactionType
              }
            : post
        ));
      }
      
      const responseTime = Date.now() - startTime;
      performanceMonitor.trackUserAction('post_reaction', { 
        postId, 
        reactionType, 
        skillName,
        responseTime 
      });
    } catch (error) {
      console.error('Reaction error:', error);
      // Revert optimistic update
      setFeedData(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.likes - (reactionType === 'like' ? 1 : -1),
              userReaction: null
            }
          : post
      ));
    }
  }, []);

  // Handle post save/unsave
  const handlePostSave = useCallback(async (postId, action = 'save') => {
    try {
      const response = await socialFeedAPI.savePost(postId, action);
      
      if (response && response.success) {
        setFeedData(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isSaved: action === 'save' }
            : post
        ));
        
        performanceMonitor.trackUserAction('post_save', { postId, action });
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  }, []);

  // Handle story press
  const handleStoryPress = useCallback((story) => {
    try {
      if (!story || !story.id) {
        console.error('Invalid story data:', story);
        return;
      }
      
      console.log(`📖 Story viewed: ${story.user} - ${story.content}`);
      performanceMonitor.trackUserAction('story_view', { 
        storyId: story.id, 
        user: story.user 
      });
    } catch (error) {
      console.error('Error viewing story:', error.message);
    }
  }, []);

  // Add new post to feed
  const addNewPost = useCallback((newPost) => {
    try {
      if (!newPost || !newPost.id) {
        console.error('Invalid post data:', newPost);
        return;
      }

      performanceMonitor.trackUserAction('new_post_added', {
        postId: newPost.id,
        type: newPost.type,
      });

      setFeedData(prev => [newPost, ...prev]);
      setPendingUpdates(prev => prev + 1);
    } catch (error) {
      console.error('Error adding new post:', error);
    }
  }, []);

  // Apply pending updates
  const applyPendingUpdates = useCallback(() => {
    setPendingUpdates(0);
    handleRefresh();
  }, [handleRefresh]);

  // Comment management functions
  const loadComments = useCallback(async (postId) => {
    try {
      setCommentStates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], loading: true }
      }));

      const response = await socialFeedAPI.getComments(postId);
      
      if (response && response.success) {
        setCommentStates(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            comments: response.data.comments || [],
            loading: false
          }
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setCommentStates(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          loading: false,
          error: error.message
        }
      }));
    }
  }, []);

  const addComment = useCallback(async (postId, content, parentCommentId = null) => {
    try {
      const response = await socialFeedAPI.addComment(postId, content, parentCommentId);
      
      if (response && response.success) {
        // Update comments state
        setCommentStates(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            comments: [response.data, ...(prev[postId]?.comments || [])]
          }
        }));

        // Update post comment count
        setFeedData(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        ));

        performanceMonitor.trackUserAction('comment_add', { postId });
        return response.data;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, []);

  const likeComment = useCallback(async (postId, commentId) => {
    try {
      const response = await socialFeedAPI.likeComment(commentId);
      
      if (response && response.success) {
        setCommentStates(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            comments: prev[postId]?.comments?.map(comment => 
              comment.id === commentId 
                ? { ...comment, likes: response.data.likes }
                : comment
            ) || []
          }
        }));

        performanceMonitor.trackUserAction('comment_like', { commentId });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }, []);

  // Challenge management functions
  const loadChallenges = useCallback(async (filters = {}) => {
    try {
      setChallengeLoading(true);
      const response = await challengeService.getChallenges(filters);
      
      if (response && response.success) {
        setAvailableChallenges(response.data.challenges || []);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setChallengeLoading(false);
    }
  }, []);

  const startChallenge = useCallback(async (challengeId) => {
    try {
      const response = await challengeService.startChallenge(challengeId);
      performanceMonitor.trackUserAction('challenge_start', { challengeId });
      return response;
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  }, []);

  const submitChallenge = useCallback(async () => {
    try {
      const response = await challengeService.submitChallenge();
      performanceMonitor.trackUserAction('challenge_submit');
      return response;
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeFeed();
  }, [initializeFeed]);

  return {
    // Feed data
    feedData,
    stories,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    pendingUpdates,
    error,
    
    // Feed actions
    handleRefresh,
    handleLoadMore,
    handlePostReaction,
    handlePostSave,
    handleStoryPress,
    addNewPost,
    applyPendingUpdates,
    
    // Comment data and actions
    commentStates,
    loadComments,
    addComment,
    likeComment,
    
    // Challenge data and actions
    availableChallenges,
    dailyChallenge,
    challengeLoading,
    loadChallenges,
    startChallenge,
    submitChallenge,
    
    // Utils
    reload: () => initializeFeed(),
  };
};

export default useSocialFeedEnhanced;
