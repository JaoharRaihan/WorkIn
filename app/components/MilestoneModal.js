import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Vibration,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MilestoneModal = ({ 
  visible, 
  milestone, 
  onClose, 
  onShareToFeed,
  onViewBadge 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const titleBounceAnim = useRef(new Animated.Value(0)).current;
  
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [sparklePieces, setSparklePieces] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Generate confetti pieces
  const generateConfettiPieces = () => {
    const pieces = [];
    const colors = ['#FF6B35', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FFD700'];
    
    for (let i = 0; i < 20; i++) {
      pieces.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        x: Math.random() * width,
        y: -50,
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
      });
    }
    setConfettiPieces(pieces);
  };

  // Generate sparkle effects
  const generateSparklePieces = () => {
    const pieces = [];
    for (let i = 0; i < 10; i++) {
      pieces.push({
        id: i,
        size: Math.random() * 6 + 2,
        x: Math.random() * width,
        y: Math.random() * height * 0.6 + height * 0.2,
        delay: Math.random() * 500,
      });
    }
    setSparklePieces(pieces);
  };

  useEffect(() => {
    if (visible && milestone) {
      // Generate confetti pieces
      generateConfettiPieces();
      generateSparklePieces();
      
      // Haptic feedback
      try {
        Vibration.vibrate([0, 100, 50, 100]);
      } catch (error) {
        console.log('Vibration not supported');
      }

      // Start animations when modal opens
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Confetti burst animation
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Sparkle animation
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        // Title bounce animation
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(titleBounceAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 6,
          }),
        ]),
      ]).start();

      // Continuous pulse animation for milestone icon
      const pulseAnimation = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (visible) pulseAnimation();
        });
      };
      pulseAnimation();
    } else {
      // Reset animations when closing
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnim.setValue(0);
      sparkleAnim.setValue(0);
      titleBounceAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, milestone]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setShowShareOptions(false);
    });
  };

  const handleShareToFeed = () => {
    if (milestone?.shareData) {
      onShareToFeed?.(milestone);
    } else {
      onShareToFeed?.(milestone);
    }
    handleClose();
    setShowShareOptions(false);
  };

  const handleNativeShare = async () => {
    if (!milestone) return;

    const shareContent = {
      title: `🎉 ${milestone.title}`,
      message: milestone.shareData?.shareText || 
        `Just achieved ${milestone.title}! ${milestone.description} 🎉 #SkillNet #Learning`,
      url: 'https://skillnet.app'
    };

    try {
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to share milestone');
    }
  };

  const handleViewBadge = () => {
    onViewBadge?.(milestone);
    handleClose();
  };

  const renderConfetti = () => {
    return confettiPieces.map((piece) => (
      <Animated.View
        key={piece.id}
        style={[
          styles.confettiPiece,
          {
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.shape === 'circle' ? piece.size / 2 : 0,
            left: piece.x,
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [piece.y, height + 100],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${piece.rotation * 3}deg`],
                }),
              },
            ],
            opacity: confettiAnim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
          },
        ]}
      />
    ));
  };

  const renderSparkles = () => {
    return sparklePieces.map((sparkle) => (
      <Animated.View
        key={sparkle.id}
        style={[
          styles.sparkle,
          {
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.x,
            top: sparkle.y,
            transform: [
              {
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.5, 0],
                }),
              },
            ],
            opacity: sparkleAnim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      >
        <Ionicons name="star" size={sparkle.size} color="#FFD700" />
      </Animated.View>
    ));
  };

  const getMilestoneGradient = () => {
    if (!milestone?.type) return ['#007AFF', '#0056CC'];
    
    const gradients = {
      xp: ['#007AFF', '#0056CC'],
      streak: ['#FF6B35', '#FF4500'],
      badge: ['#34C759', '#28A745'],
      roadmap: ['#AF52DE', '#8E44AD'],
      test: ['#FF9500', '#FF8C00'],
    };
    
    return gradients[milestone.type] || ['#007AFF', '#0056CC'];
  };

  if (!milestone) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        {/* Enhanced Animation Effects */}
        <View style={styles.animationContainer}>
          {renderConfetti()}
          {renderSparkles()}
        </View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>

          {/* Milestone Content */}
          <LinearGradient
            colors={getMilestoneGradient()}
            style={styles.milestoneCard}
          >
            {/* Header */}
            <Animated.View 
              style={[
                styles.milestoneHeader,
                {
                  transform: [
                    { scale: titleBounceAnim },
                    { translateY: titleBounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })}
                  ]
                }
              ]}
            >
              <Text style={styles.congratsText}>🎉 Milestone Achieved!</Text>
            </Animated.View>

            {/* Milestone Icon with Pulse */}
            <Animated.View 
              style={[
                styles.milestoneIconContainer,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
            </Animated.View>

            {/* Milestone Details */}
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              
              {milestone.value && (
                <View style={styles.milestoneValue}>
                  <Text style={styles.valueText}>{milestone.value}</Text>
                  <Text style={styles.valueLabel}>
                    {milestone.type === 'xp' ? 'Total XP' :
                     milestone.type === 'streak' ? 'Day Streak' :
                     milestone.type === 'badge' ? 'Badges Earned' :
                     milestone.type === 'roadmap' ? 'Roadmaps Completed' :
                     'Achievement Score'}
                  </Text>
                </View>
              )}
            </View>

            {/* Fun Message */}
            {milestone.funMessage && (
              <View style={styles.funMessageContainer}>
                <Text style={styles.funMessage}>{milestone.funMessage}</Text>
              </View>
            )}

            {/* Stats Row */}
            {milestone.totalXP && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flash" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statText}>{milestone.totalXP} XP</Text>
                </View>
                {milestone.newLevel && (
                  <View style={styles.statItem}>
                    <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statText}>Level {milestone.newLevel}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Progress to Next Level */}
            {milestone.nextLevelProgress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Next Level Progress</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${milestone.nextLevelProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(milestone.nextLevelProgress)}%
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Share Options Toggle */}
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => setShowShareOptions(!showShareOptions)}
            >
              <Ionicons name="share-social" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            {milestone.badgeEarned && (
              <TouchableOpacity
                style={[styles.actionButton, styles.badgeButton]}
                onPress={handleViewBadge}
              >
                <Ionicons name="ribbon" size={20} color="#34C759" />
                <Text style={styles.actionButtonText}>View Badge</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton]}
              onPress={handleClose}
            >
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>
                Continue Learning
              </Text>
            </TouchableOpacity>
          </View>

          {/* Expanded Share Options */}
          {showShareOptions && (
            <Animated.View style={styles.shareOptionsContainer}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleShareToFeed}
              >
                <Ionicons name="people" size={24} color="#007AFF" />
                <Text style={styles.shareOptionText}>Share to SkillNet Feed</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleNativeShare}
              >
                <Ionicons name="share-outline" size={24} color="#34C759" />
                <Text style={styles.shareOptionText}>Share Externally</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Animation containers
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
  },
  
  // Modal content
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Milestone card
  milestoneCard: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  milestoneHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  milestoneIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  milestoneEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  
  // Content
  milestoneContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  milestoneDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  milestoneValue: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  valueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  
  // Fun message
  funMessageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  funMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Progress bar
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  shareButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  badgeButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  continueButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Share options
  shareOptionsContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1D29',
  },
});

export default MilestoneModal;
