import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      visible: true,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide after duration
    setTimeout(() => {
      hideNotification(id);
    }, notification.duration || 4000);

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, visible: false } : notif
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return showNotification({
      type: 'success',
      title: options.title || 'Success!',
      message,
      icon: 'checkmark-circle',
      color: '#34C759',
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    return showNotification({
      type: 'error',
      title: options.title || 'Error',
      message,
      icon: 'alert-circle',
      color: '#FF3B30',
      ...options,
    });
  }, [showNotification]);

  const showAchievement = useCallback((title, message, options = {}) => {
    return showNotification({
      type: 'achievement',
      title,
      message,
      icon: 'trophy',
      color: '#FF9500',
      duration: 6000,
      ...options,
    });
  }, [showNotification]);

  const showTestCompletion = useCallback((testTitle, score, passed, options = {}) => {
    const isHighScore = score >= 90;
    return showNotification({
      type: 'test-completion',
      title: passed ? (isHighScore ? '🏆 Excellent!' : '✅ Test Passed!') : '❌ Test Failed',
      message: `${testTitle}: ${score}%`,
      icon: passed ? (isHighScore ? 'trophy' : 'checkmark-circle') : 'close-circle',
      color: passed ? (isHighScore ? '#FF9500' : '#34C759') : '#FF3B30',
      duration: 5000,
      ...options,
    });
  }, [showNotification]);

  const value = {
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showAchievement,
    showTestCompletion,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onHide }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
        />
      ))}
    </View>
  );
};

const NotificationItem = ({ notification, onHide }) => {
  const [slideAnim] = useState(new Animated.Value(-width));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (notification.visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notification.visible]);

  const handlePress = () => {
    if (notification.onPress) {
      notification.onPress();
    }
    onHide(notification.id);
  };

  const handleClose = () => {
    onHide(notification.id);
  };

  return (
    <Animated.View
      style={[
        styles.notification,
        { backgroundColor: notification.color },
        {
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
      pointerEvents={notification.visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={notification.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  notification: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default NotificationProvider;
