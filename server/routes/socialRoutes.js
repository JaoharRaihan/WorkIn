const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock social feed data
const socialPosts = [
  {
    id: 1,
    type: 'milestone',
    userId: 'user1',
    userName: 'Alex Chen',
    userAvatar: 'https://via.placeholder.com/40',
    timestamp: '2h ago',
    title: 'Just earned React Native Expert Badge! 🚀',
    description: 'Completed 5 advanced projects and passed all assessments. The journey was challenging but totally worth it!',
    badge: { text: 'React Native Expert', variant: 'verified', color: '#007AFF' },
    stats: { claps: 24, endorsements: 8, saves: 12 },
    skills: ['React Native', 'JavaScript', 'Mobile Development'],
    xpGained: 200,
    createdAt: new Date(),
  },
  // Add more mock posts...
];

const stories = [
  {
    id: '1',
    type: 'streak',
    userName: 'Alex Chen',
    userAvatar: 'https://via.placeholder.com/60',
    hasStory: true,
    isViewed: false,
    streakDays: 15,
    skill: 'React Native',
    gradient: ['#4ECDC4', '#44A08D'],
  },
  // Add more mock stories...
];

// Get social feed
router.get('/feed', (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    
    // Filter and paginate posts
    let posts = [...socialPosts];
    
    if (cursor) {
      const cursorIndex = posts.findIndex(post => post.id === parseInt(cursor));
      if (cursorIndex !== -1) {
        posts = posts.slice(cursorIndex + 1);
      }
    }
    
    posts = posts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        posts,
        hasMore: posts.length === parseInt(limit),
        nextCursor: posts.length > 0 ? posts[posts.length - 1].id : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed'
    });
  }
});

// Get stories
router.get('/stories', (req, res) => {
  try {
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stories'
    });
  }
});

// Get stories
router.get('/stories', auth, (req, res) => {
  try {
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stories'
    });
  }
});

// React to post
router.post('/react', (req, res) => {
  try {
    const { postId, reactionType, skillName } = req.body;
    
    // Find the post and update reaction
    const postIndex = socialPosts.findIndex(post => post.id === parseInt(postId));
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    const post = socialPosts[postIndex];
    
    // Update stats based on reaction type
    switch (reactionType) {
      case 'clap':
        post.stats.claps = (post.stats.claps || 0) + 1;
        break;
      case 'endorse':
        post.stats.endorsements = (post.stats.endorsements || 0) + 1;
        break;
      case 'save':
        post.stats.saves = (post.stats.saves || 0) + 1;
        break;
    }
    
    res.json({
      success: true,
      data: {
        postId,
        reactionType,
        skillName,
        newStats: post.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to react to post'
    });
  }
});

// Save post
router.post('/save', (req, res) => {
  const { postId, action } = req.body;
  const userId = req.user.userId;
  
  try {
    // In real implementation, save to user's saved posts collection
    res.json({
      success: true,
      message: `Post ${action}d successfully`,
      data: {
        postId,
        action,
        saved: action === 'save'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to ${action} post`
    });
  }
});

// Create new post
router.post('/posts', (req, res) => {
  const userId = req.user.userId;
  const postData = req.body;
  
  try {
    const newPost = {
      id: socialPosts.length + 1,
      userId,
      ...postData,
      stats: { claps: 0, endorsements: 0, saves: 0 },
      comments: [],
      createdAt: new Date(),
    };
    
    socialPosts.unshift(newPost);
    
    res.json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// Mock comments data
const comments = [
  {
    id: 1,
    postId: 1,
    userId: 'user2',
    userName: 'Sarah Wilson',
    userAvatar: '👩‍💻',
    content: 'Congratulations! This is such an inspiration 🎉 Your progress is amazing!',
    timestamp: '1h ago',
    likes: 12,
    replies: [],
    createdAt: new Date(),
  },
  {
    id: 2,
    postId: 1,
    userId: 'user3',
    userName: 'Mike Chen',
    userAvatar: '🧑‍🔬',
    content: 'Great work! How long did it take you to master React Native? Any tips for beginners?',
    timestamp: '45m ago',
    likes: 8,
    replies: [
      {
        id: 3,
        parentId: 2,
        userId: 'user1',
        userName: 'Alex Chen',
        userAvatar: '👑',
        content: 'Thanks! It took about 3 months of consistent practice. Start with the basics and build lots of small projects!',
        timestamp: '30m ago',
        likes: 5,
      }
    ],
    createdAt: new Date(),
  }
];

// Get comments for a post
router.get('/comments', (req, res) => {
  try {
    const { postId, cursor, limit = 10 } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'postId is required'
      });
    }
    
    let postComments = comments.filter(comment => comment.postId === parseInt(postId));
    
    // Sort by newest first
    postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (cursor) {
      const cursorIndex = postComments.findIndex(comment => comment.id === parseInt(cursor));
      if (cursorIndex !== -1) {
        postComments = postComments.slice(cursorIndex + 1);
      }
    }
    
    postComments = postComments.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        comments: postComments,
        hasMore: postComments.length === parseInt(limit),
        nextCursor: postComments.length > 0 ? postComments[postComments.length - 1].id : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
});

// Add a comment to a post
router.post('/comments', (req, res) => {
  const userId = req.user?.userId || 'current_user';
  const { postId, content, parentCommentId } = req.body;
  
  try {
    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        error: 'postId and content are required'
      });
    }
    
    const newComment = {
      id: comments.length + 1,
      postId: parseInt(postId),
      parentId: parentCommentId ? parseInt(parentCommentId) : null,
      userId,
      userName: 'Current User',
      userAvatar: '👤',
      content: content.trim(),
      timestamp: 'now',
      likes: 0,
      replies: [],
      createdAt: new Date(),
    };
    
    if (parentCommentId) {
      // Add as reply to existing comment
      const parentComment = comments.find(c => c.id === parseInt(parentCommentId));
      if (parentComment) {
        parentComment.replies.push(newComment);
      }
    } else {
      // Add as top-level comment
      comments.unshift(newComment);
    }
    
    // Update post comment count
    const postIndex = socialPosts.findIndex(post => post.id === parseInt(postId));
    if (postIndex !== -1) {
      socialPosts[postIndex].comments = (socialPosts[postIndex].comments || 0) + 1;
    }
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
});

// Like/unlike a comment
router.post('/comments/:commentId/like', (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?.userId || 'current_user';
  
  try {
    const comment = comments.find(c => c.id === parseInt(commentId));
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Toggle like (simplified - in real app, track user likes)
    comment.likes = (comment.likes || 0) + 1;
    
    res.json({
      success: true,
      message: 'Comment liked successfully',
      data: {
        commentId: comment.id,
        likes: comment.likes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to like comment'
    });
  }
});

module.exports = router;
