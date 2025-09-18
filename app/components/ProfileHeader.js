import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

// Context and Hooks
import { useProfile } from '../context/ProfileContext';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ProfileHeader = ({ onEditPress, showModeToggle = true }) => {
  const {
    profileData,
    scores,
    stats,
    profileCompleteness,
    updateProfile,
    loading,
  } = useProfile();
  
  const { mode, switchMode } = useApp();
  
  // Local state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreDetailsAnim = useRef(new Animated.Value(0)).current;

  // Handle avatar upload
  const handleAvatarPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        
        // Simulate upload delay
        setTimeout(() => {
          updateProfile({ avatar: result.assets[0].uri });
          setUploadingAvatar(false);
          
          // Trigger success animation
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }, 1500);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      setUploadingAvatar(false);
    }
  };

  // Handle mode toggle
  const handleModeToggle = () => {
    const newMode = mode === 'CANDIDATE' ? 'HR' : 'CANDIDATE';
    switchMode(newMode);
    
    // Show feedback
    Alert.alert(
      'Mode Switched',
      `You're now in ${newMode} mode!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  // Toggle score details
  const toggleScoreDetails = () => {
    const toValue = showScoreDetails ? 0 : 1;
    setShowScoreDetails(!showScoreDetails);
    
    Animated.spring(scoreDetailsAnim, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Get trust score color
  const getTrustScoreColor = (score) => {
    if (score >= 80) return '#34C759'; // Green
    if (score >= 60) return '#FF9500'; // Orange
    if (score >= 40) return '#FF6B35'; // Red-Orange
    return '#FF3B30'; // Red
  };

  // Get hirability score color
  const getHirabilityScoreColor = (score) => {
    if (score >= 85) return '#007AFF'; // Blue
    if (score >= 70) return '#34C759'; // Green
    if (score >= 50) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  // Get level badge color based on current level
  const getLevelBadgeColor = (level) => {
    if (level >= 8) return ['#FFD700', '#FFA500']; // Gold
    if (level >= 6) return ['#C0C0C0', '#A9A9A9']; // Silver
    if (level >= 4) return ['#CD7F32', '#8B4513']; // Bronze
    return ['#4ECDC4', '#44A08D']; // Teal
  };

  // Calculate XP progress percentage
  const xpProgress = ((stats.totalXP % 1000) / 1000) * 100;

  return (
    <View style={styles.container}>
      {/* Cover/Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.coverGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          {showModeToggle && (
            <TouchableOpacity
              style={styles.modeToggleButton}
              onPress={handleModeToggle}
              activeOpacity={0.8}
            >
              <Text style={styles.modeToggleText}>
                {mode === 'CANDIDATE' ? '👔' : '👨‍💻'}
              </Text>
              <Text style={styles.modeToggleLabel}>
                {mode === 'CANDIDATE' ? 'HR' : 'Candidate'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditPress}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity onPress={handleAvatarPress} disabled={uploadingAvatar}>
              <View style={styles.avatarFrame}>
                {profileData.avatar ? (
                  <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
                
                {/* Upload overlay */}
                {uploadingAvatar && (
                  <View style={styles.uploadOverlay}>
                    <Ionicons name="cloud-upload" size={24} color="#fff" />
                  </View>
                )}
                
                {/* Edit icon */}
                <View style={styles.avatarEditIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Level Badge */}
          <LinearGradient
            colors={getLevelBadgeColor(stats.currentLevel)}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>LV {stats.currentLevel}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        {/* Name and Title */}
        <View style={styles.nameSection}>
          <Text style={styles.name} numberOfLines={1}>
            {profileData.name || 'Your Name'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {profileData.title || 'Add your title'}
          </Text>
          {profileData.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#8E8E93" />
              <Text style={styles.location} numberOfLines={1}>
                {profileData.location}
              </Text>
            </View>
          )}
        </View>

        {/* Trust & Hirability Scores */}
        <TouchableOpacity 
          style={styles.scoresContainer}
          onPress={toggleScoreDetails}
          activeOpacity={0.8}
        >
          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { borderColor: getTrustScoreColor(scores.trustScore) }]}>
              <Text style={[styles.scoreValue, { color: getTrustScoreColor(scores.trustScore) }]}>
                {scores.trustScore}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Trust</Text>
          </View>

          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { borderColor: getHirabilityScoreColor(scores.hirabilityScore) }]}>
              <Text style={[styles.scoreValue, { color: getHirabilityScoreColor(scores.hirabilityScore) }]}>
                {scores.hirabilityScore}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Hirability</Text>
          </View>

          <View style={styles.scoreItem}>
            <View style={[styles.scoreCircle, { borderColor: '#007AFF' }]}>
              <Text style={[styles.scoreValue, { color: '#007AFF' }]}>
                {profileCompleteness}%
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Complete</Text>
          </View>

          <Ionicons 
            name={showScoreDetails ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#8E8E93" 
          />
        </TouchableOpacity>

        {/* Score Details (Expandable) */}
        <Animated.View 
          style={[
            styles.scoreDetails,
            {
              height: scoreDetailsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 80],
              }),
              opacity: scoreDetailsAnim,
            }
          ]}
        >
          <View style={styles.scoreExplanation}>
            <Text style={styles.scoreExplanationText}>
              <Text style={[styles.scoreExplanationLabel, { color: getTrustScoreColor(scores.trustScore) }]}>
                Trust Score
              </Text>
              {' '}based on verified skills, completed tests, and peer endorsements.
            </Text>
            <Text style={styles.scoreExplanationText}>
              <Text style={[styles.scoreExplanationLabel, { color: getHirabilityScoreColor(scores.hirabilityScore) }]}>
                Hirability Score
              </Text>
              {' '}reflects project quality, skill diversity, and learning consistency.
            </Text>
          </View>
        </Animated.View>

        {/* XP Progress Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>
              {stats.totalXP.toLocaleString()} XP
            </Text>
            <Text style={styles.xpNext}>
              {stats.xpToNextLevel} to Level {stats.currentLevel + 1}
            </Text>
          </View>
          
          <View style={styles.xpProgressBar}>
            <View style={[styles.xpProgress, { width: `${xpProgress}%` }]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.testsCompleted}</Text>
            <Text style={styles.statLabel}>Tests</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.projectsCompleted}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.streakContainer}>
              <Text style={styles.statValue}>{stats.learningStreak}</Text>
              {stats.learningStreak > 0 && (
                <Text style={styles.streakEmoji}>🔥</Text>
              )}
            </View>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Bio */}
        {profileData.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bio} numberOfLines={3}>
              {profileData.bio}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  coverGradient: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modeToggleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeToggleText: {
    fontSize: 16,
  },
  modeToggleLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8E8E93',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  nameSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  scoreDetails: {
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  scoreExplanation: {
    padding: 16,
  },
  scoreExplanationText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  scoreExplanationLabel: {
    fontWeight: '600',
  },
  xpContainer: {
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  xpNext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: '#E1E8ED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E1E8ED',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakEmoji: {
    fontSize: 16,
  },
  bioContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default ProfileHeader;
