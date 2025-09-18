import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const QuickActionBar = ({
  visible = true,
  onCreatePost,
  onTakeChallenge,
  onOpenFriends,
  onOpenMessages,
}) => {
  const opacity = new Animated.Value(visible ? 1 : 0);

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const quickActions = [
    {
      id: 'post',
      icon: 'add',
      label: 'Post',
      color: '#007AFF',
      backgroundColor: '#e3f2fd',
      onPress: onCreatePost,
    },
    {
      id: 'challenge',
      icon: 'trophy',
      label: 'Challenge',
      color: '#FF5722',
      backgroundColor: '#fff3f0',
      onPress: onTakeChallenge,
    },
    {
      id: 'friends',
      icon: 'people',
      label: 'Friends',
      color: '#4CAF50',
      backgroundColor: '#f0f9ff',
      onPress: onOpenFriends,
    },
    {
      id: 'messages',
      icon: 'chatbubble',
      label: 'Messages',
      color: '#9C27B0',
      backgroundColor: '#faf5ff',
      onPress: onOpenMessages,
    },
  ];

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.gradient}
      >
        <View style={styles.actionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionButton,
                { backgroundColor: action.backgroundColor }
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={20} color="#fff" />
              </View>
              <Text style={[styles.actionLabel, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 70,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuickActionBar;
