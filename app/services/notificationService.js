import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiService from './apiService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Notification service initialization error:', error);
    }
  }

  // Register device for push notifications
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'WorkIn Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      this.expoPushToken = token;
      console.log('Expo Push Token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const { data, request } = notification;
    
    // Update app state based on notification type
    switch (data?.type) {
      case 'like':
        this.handleLikeNotification(data);
        break;
      case 'comment':
        this.handleCommentNotification(data);
        break;
      case 'follow':
        this.handleFollowNotification(data);
        break;
      case 'challenge':
        this.handleChallengeNotification(data);
        break;
      case 'interview_request':
        this.handleInterviewRequestNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  // Handle notification response (when user taps notification)
  handleNotificationResponse(response) {
    const { notification } = response;
    const { data } = notification.request.content;
    
    // Navigate to appropriate screen based on notification type
    switch (data?.type) {
      case 'like':
      case 'comment':
        // Navigate to post detail
        this.navigate('PostDetail', { postId: data.postId });
        break;
      case 'follow':
        // Navigate to user profile
        this.navigate('UserProfile', { userId: data.userId });
        break;
      case 'challenge':
        // Navigate to challenge detail
        this.navigate('ChallengeDetail', { challengeId: data.challengeId });
        break;
      case 'interview_request':
        // Navigate to interview screen
        this.navigate('InterviewScreen', { requestId: data.requestId });
        break;
    }
  }

  // Navigation helper (this would be implemented with navigation ref)
  navigate(screenName, params) {
    // This would use navigation reference to navigate
    console.log(`Navigate to ${screenName} with params:`, params);
  }

  // Send push token to backend
  async savePushToken(userId, token = null) {
    try {
      const pushToken = token || this.expoPushToken;
      if (!pushToken) return;

      await apiService.post('/notifications/token', {
        userId,
        pushToken,
        platform: Platform.OS,
      });

      console.log('Push token saved to backend');
    } catch (error) {
      console.error('Save push token error:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Send local notification error:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId) {
    try {
      const response = await apiService.get(`/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return {};
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await apiService.put(`/notifications/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      await apiService.put(`/notifications/${notificationId}/read`, { userId });
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }

  // Get user's notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(`/notifications/user/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get user notifications error:', error);
      return { notifications: [], hasMore: false };
    }
  }

  // Specific notification type handlers
  handleLikeNotification(data) {
    console.log('Like notification received:', data);
    // Update feed context or trigger UI refresh
  }

  handleCommentNotification(data) {
    console.log('Comment notification received:', data);
    // Update post comments or trigger UI refresh
  }

  handleFollowNotification(data) {
    console.log('Follow notification received:', data);
    // Update profile context or trigger UI refresh
  }

  handleChallengeNotification(data) {
    console.log('Challenge notification received:', data);
    // Update community context or trigger UI refresh
  }

  handleInterviewRequestNotification(data) {
    console.log('Interview request notification received:', data);
    // Update HR context or trigger UI refresh
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Badge management
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Set badge count error:', error);
    }
  }

  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Clear badge error:', error);
    }
  }
}

export default new NotificationService();
