import React from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.isEnabled = __DEV__;
  }

  startTimer(name) {
    if (!this.isEnabled) return;
    
    this.metrics[name] = {
      startTime: Date.now(),
      endTime: null,
      duration: null
    };
  }

  endTimer(name) {
    if (!this.isEnabled || !this.metrics[name]) return;
    
    const endTime = Date.now();
    this.metrics[name].endTime = endTime;
    this.metrics[name].duration = endTime - this.metrics[name].startTime;
    
    console.log(`⚡ Performance: ${name} took ${this.metrics[name].duration}ms`);
    
    // Log slow operations
    if (this.metrics[name].duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${name} took ${this.metrics[name].duration}ms`);
    }
  }

  logMetric(name, value, unit = 'ms') {
    if (!this.isEnabled) return;
    
    console.log(`📊 Metric: ${name} = ${value}${unit}`);
  }

  logMemoryUsage() {
    if (!this.isEnabled) return;
    
    // Basic memory monitoring for React Native
    console.log('💾 Memory usage monitoring (check device logs for detailed info)');
  }

  trackUserAction(action, data = {}) {
    if (!this.isEnabled) return;
    
    console.log(`👆 User Action: ${action}`, data);
  }

  trackError(error, context = '') {
    console.error(`❌ Error in ${context}:`, error);
    
    // In production, this would send to analytics service
    if (!__DEV__) {
      // Example: Crashlytics.recordError(error);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = {};
  }

  // Social feed specific monitoring
  trackFeedLoad(postCount, startTime) {
    const duration = Date.now() - startTime;
    this.logMetric('feed_load_posts', postCount, ' posts');
    this.logMetric('feed_load_duration', duration);
    
    if (duration > 2000) {
      console.warn('🐌 Feed loading is slow, consider optimization');
    }
    
    return duration;
  }

  trackEngagement(post, action, responseTime = 0) {
    if (!post || !post.id) {
      console.error('Error tracking engagement: Missing post data');
      return;
    }
    
    try {
      this.logMetric(`${action}_response_time`, responseTime);
      console.log(`📊 Engagement: ${action} on post ${post.id}`);
      
      if (responseTime > 500) {
        console.warn(`🐌 Slow ${action} interaction: ${responseTime}ms`);
      }
    } catch (error) {
      console.error('Error tracking engagement:', error.message);
    }
  }

  trackScrollPerformance(scrollEvents, timeWindow = 1000) {
    const eventsPerSecond = (scrollEvents / timeWindow) * 1000;
    this.logMetric('scroll_events_per_second', Math.round(eventsPerSecond), ' events/sec');
    
    if (eventsPerSecond > 60) {
      console.warn('🎯 High scroll frequency detected, ensure smooth performance');
    }
  }

  trackStoryViewing(storyCount, totalDuration) {
    this.logMetric('stories_viewed', storyCount, ' stories');
    this.logMetric('total_story_time', totalDuration);
    
    const avgTimePerStory = totalDuration / storyCount;
    this.logMetric('avg_story_duration', Math.round(avgTimePerStory));
  }

  trackInteraction(type, postId, responseTime) {
    this.logMetric(`${type}_response_time`, responseTime);
    
    if (responseTime > 500) {
      console.warn(`🐌 Slow ${type} interaction: ${responseTime}ms`);
    }
  }

  // Media handling performance tracking
  trackMediaUpload(type, size, duration) {
    this.logMetric(`${type}_upload_size`, Math.round(size / 1024), ' KB');
    this.logMetric(`${type}_upload_duration`, duration);
    
    if (duration > 5000) {
      console.warn(`🐌 Slow ${type} upload: ${duration}ms`);
    }
    
    if (size > 10 * 1024 * 1024) { // 10MB
      console.warn(`📦 Large ${type} file: ${Math.round(size / 1024 / 1024)}MB`);
    }
  }

  trackPostCreation(postData, creationTime) {
    this.logMetric('post_creation_time', creationTime);
    this.logMetric('post_media_count', postData.media?.length || 0, ' items');
    this.logMetric('post_text_length', postData.content?.length || 0, ' chars');
    
    console.log(`📝 Post created: ${postData.type} with ${postData.media?.length || 0} media items`);
    
    if (creationTime > 3000) {
      console.warn('🐌 Slow post creation process');
    }
  }

  trackMediaViewing(mediaType, viewDuration) {
    this.logMetric(`${mediaType}_view_duration`, viewDuration);
    
    if (mediaType === 'video' && viewDuration > 30000) {
      console.log('🎬 Long video engagement detected');
    }
  }

  trackReactionInteraction(action, reactionType, responseTime) {
    this.logMetric(`reaction_${action}_time`, responseTime);
    
    if (reactionType) {
      console.log(`👍 Reaction: ${action} with ${reactionType}`);
    }
    
    if (responseTime > 300) {
      console.warn(`🐌 Slow reaction ${action}: ${responseTime}ms`);
    }
  }

  trackButtonPosition(buttonType, position, successful) {
    this.logMetric(`${buttonType}_position_interaction`, successful ? 1 : 0, ' success');
    
    if (!successful) {
      console.warn(`🎯 Button positioning issue: ${buttonType} at ${position}`);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance helpers for React components
export const withPerformanceTracking = (componentName) => {
  return (WrappedComponent) => {
    return React.forwardRef((props, ref) => {
      React.useEffect(() => {
        performanceMonitor.startTimer(`${componentName}_mount`);
        
        return () => {
          performanceMonitor.endTimer(`${componentName}_mount`);
        };
      }, []);

      return React.createElement(WrappedComponent, { ...props, ref });
    });
  };
};

export const usePerformanceTimer = (name) => {
  React.useEffect(() => {
    performanceMonitor.startTimer(name);
    
    return () => {
      performanceMonitor.endTimer(name);
    };
  }, [name]);
};

export default performanceMonitor;
