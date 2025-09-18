import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../../context/CommunityContext';
import { useProfile } from '../../../context/ProfileContext';

const { width } = Dimensions.get('window');

export default function LiveChallengeScreen({ route, navigation }) {
  const { challengeId } = route.params;
  const {
    liveChallenges,
    submitChallengeEntry,
    joinChallenge,
  } = useCommunity();
  
  const { gainXP, earnBadge } = useProfile();
  
  const [challenge, setChallenge] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState('');
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionTimer, setSubmissionTimer] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Animated values for live effects
  const pulseAnim = new Animated.Value(1);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    // Find challenge by ID
    const foundChallenge = liveChallenges.find(c => c.id === challengeId);
    if (foundChallenge) {
      setChallenge(foundChallenge);
      loadChallengeData(foundChallenge);
    }
    
    // Start pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [challengeId, liveChallenges]);

  const loadChallengeData = (challengeData) => {
    // Mock real-time data
    const mockParticipants = [
      {
        id: 1,
        name: 'Sarah Chen',
        avatar: null,
        level: 5,
        score: 95,
        status: 'active',
        lastSeen: 'now',
        submissions: 3,
      },
      {
        id: 2,
        name: 'Alex Rodriguez',
        avatar: null,
        level: 4,
        score: 87,
        status: 'active',
        lastSeen: '2m ago',
        submissions: 2,
      },
      {
        id: 3,
        name: 'David Kim',
        avatar: null,
        level: 6,
        score: 92,
        status: 'idle',
        lastSeen: '15m ago',
        submissions: 4,
      },
      {
        id: 4,
        name: 'Emma Johnson',
        avatar: null,
        level: 3,
        score: 78,
        status: 'active',
        lastSeen: 'now',
        submissions: 1,
      },
    ];

    const mockLeaderboard = [
      {
        rank: 1,
        id: 1,
        name: 'Sarah Chen',
        score: 95,
        submissions: 3,
        timeSpent: '2h 15m',
        badge: 'speed-demon',
      },
      {
        rank: 2,
        id: 3,
        name: 'David Kim',
        score: 92,
        submissions: 4,
        timeSpent: '3h 45m',
        badge: 'thorough',
      },
      {
        rank: 3,
        id: 2,
        name: 'Alex Rodriguez',
        score: 87,
        submissions: 2,
        timeSpent: '1h 30m',
        badge: 'efficient',
      },
      {
        rank: 4,
        id: 4,
        name: 'Emma Johnson',
        score: 78,
        submissions: 1,
        timeSpent: '45m',
        badge: 'rising-star',
      },
    ];

    const mockLiveUpdates = [
      {
        id: 1,
        type: 'submission',
        user: 'Sarah Chen',
        action: 'submitted a new solution',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        score: 95,
      },
      {
        id: 2,
        type: 'join',
        user: 'Mike Wilson',
        action: 'joined the challenge',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 3,
        type: 'milestone',
        user: 'David Kim',
        action: 'reached 4 submissions',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
      },
      {
        id: 4,
        type: 'achievement',
        user: 'Alex Rodriguez',
        action: 'earned Speed Demon badge',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        badge: 'speed-demon',
      },
    ];

    setParticipants(mockParticipants);
    setLeaderboard(mockLeaderboard);
    setLiveUpdates(mockLiveUpdates);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: challengeData.submissions / challengeData.participants,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const handleJoinChallenge = async () => {
    try {
      await joinChallenge(challengeId);
      setChallenge(prev => ({ ...prev, hasJoined: true }));
      Alert.alert('Success!', 'You have joined the challenge. Good luck!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleSubmitEntry = async () => {
    if (!submissionTitle.trim() || !currentSubmission.trim()) {
      Alert.alert('Error', 'Please provide a title and submission content.');
      return;
    }

    try {
      const submission = {
        title: submissionTitle,
        description: submissionDescription,
        content: currentSubmission,
        githubUrl,
        demoUrl,
        submittedAt: new Date().toISOString(),
      };

      await submitChallengeEntry(challengeId, submission);
      setShowSubmissionModal(false);
      setCurrentSubmission('');
      setSubmissionTitle('');
      setSubmissionDescription('');
      setGithubUrl('');
      setDemoUrl('');
      
      setChallenge(prev => ({ 
        ...prev, 
        hasSubmitted: true, 
        submissions: prev.submissions + 1 
      }));

      Alert.alert('Success!', 'Your submission has been recorded. Keep up the great work!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit entry. Please try again.');
    }
  };

  const renderChallengeHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.liveIndicator}>
          <Animated.View
            style={[
              styles.liveDot,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <Text style={styles.challengeTitle}>{challenge?.title}</Text>
      <Text style={styles.challengeDescription}>{challenge?.description}</Text>
      
      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <FontAwesome5 name="users" size={16} color="#007AFF" />
          <Text style={styles.statNumber}>{challenge?.participants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="paper-plane" size={16} color="#4CAF50" />
          <Text style={styles.statNumber}>{challenge?.submissions}</Text>
          <Text style={styles.statLabel}>Submissions</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="clock" size={16} color="#FF6B35" />
          <Text style={styles.statNumber}>5d</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="gift" size={16} color="#FFD700" />
          <Text style={styles.statNumber}>500</Text>
          <Text style={styles.statLabel}>XP Prize</Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Challenge Progress</Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {challenge?.submissions}/{challenge?.participants} completed
        </Text>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
        onPress={() => setActiveTab('participants')}
      >
        <Text style={[styles.tabText, activeTab === 'participants' && styles.activeTabText]}>
          Live ({participants.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
        onPress={() => setActiveTab('leaderboard')}
      >
        <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
          Leaderboard
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
        onPress={() => setActiveTab('updates')}
      >
        <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>
          Live Feed
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.overview}>
      <View style={styles.challengeDetails}>
        <Text style={styles.sectionTitle}>Challenge Details</Text>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="code" size={14} color="#007AFF" />
          <Text style={styles.detailLabel}>Skill:</Text>
          <Text style={styles.detailValue}>{challenge?.skill}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="signal" size={14} color="#007AFF" />
          <Text style={styles.detailLabel}>Difficulty:</Text>
          <Text style={styles.detailValue}>{challenge?.difficulty}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="calendar" size={14} color="#007AFF" />
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>30 days</Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="trophy" size={14} color="#FFD700" />
          <Text style={styles.detailLabel}>Prize:</Text>
          <Text style={styles.detailValue}>{challenge?.prize}</Text>
        </View>
      </View>
      
      <View style={styles.challengeRules}>
        <Text style={styles.sectionTitle}>Rules & Guidelines</Text>
        <Text style={styles.ruleText}>• Build 30 React Native components in 30 days</Text>
        <Text style={styles.ruleText}>• Each component must be unique and functional</Text>
        <Text style={styles.ruleText}>• Include proper documentation and examples</Text>
        <Text style={styles.ruleText}>• Submit GitHub repository links</Text>
        <Text style={styles.ruleText}>• Code quality and creativity will be evaluated</Text>
      </View>
      
      <View style={styles.submissionGuidelines}>
        <Text style={styles.sectionTitle}>Submission Format</Text>
        <Text style={styles.guidelineText}>
          Submit your component as a GitHub repository with:
        </Text>
        <Text style={styles.ruleText}>• Clean, well-documented code</Text>
        <Text style={styles.ruleText}>• README with usage examples</Text>
        <Text style={styles.ruleText}>• Screenshots or demo videos</Text>
        <Text style={styles.ruleText}>• Component props documentation</Text>
      </View>
    </View>
  );

  const renderParticipants = () => (
    <View style={styles.participants}>
      <Text style={styles.sectionTitle}>Live Participants</Text>
      {participants.map(participant => (
        <View key={participant.id} style={styles.participantCard}>
          <View style={styles.participantInfo}>
            <View style={styles.participantAvatar}>
              <FontAwesome5 name="user" size={20} color="#007AFF" />
            </View>
            
            <View style={styles.participantDetails}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <View style={styles.participantMeta}>
                <Text style={styles.participantLevel}>Level {participant.level}</Text>
                <Text style={styles.participantScore}>Score: {participant.score}</Text>
                <Text style={styles.participantSubmissions}>
                  {participant.submissions} submissions
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.participantStatus}>
            <View style={[
              styles.statusDot,
              participant.status === 'active' ? styles.activeDot : styles.idleDot
            ]} />
            <Text style={styles.lastSeen}>{participant.lastSeen}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboard}>
      <Text style={styles.sectionTitle}>Live Leaderboard</Text>
      {leaderboard.map(entry => (
        <View key={entry.id} style={[
          styles.leaderboardCard,
          entry.rank <= 3 && styles.topRankCard
        ]}>
          <View style={styles.rankSection}>
            <View style={[
              styles.rankBadge,
              entry.rank === 1 ? styles.goldRank :
              entry.rank === 2 ? styles.silverRank :
              entry.rank === 3 ? styles.bronzeRank : styles.defaultRank
            ]}>
              <Text style={styles.rankNumber}>#{entry.rank}</Text>
            </View>
          </View>
          
          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardName}>{entry.name}</Text>
            <View style={styles.leaderboardMeta}>
              <Text style={styles.leaderboardScore}>Score: {entry.score}</Text>
              <Text style={styles.leaderboardSubmissions}>
                {entry.submissions} submissions
              </Text>
              <Text style={styles.leaderboardTime}>Time: {entry.timeSpent}</Text>
            </View>
          </View>
          
          <View style={styles.leaderboardBadge}>
            <FontAwesome5
              name={
                entry.badge === 'speed-demon' ? 'bolt' :
                entry.badge === 'thorough' ? 'search' :
                entry.badge === 'efficient' ? 'target' : 'star'
              }
              size={14}
              color="#FFD700"
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderLiveUpdates = () => (
    <View style={styles.liveUpdates}>
      <Text style={styles.sectionTitle}>Live Activity Feed</Text>
      {liveUpdates.map(update => (
        <View key={update.id} style={styles.updateCard}>
          <View style={styles.updateIcon}>
            <FontAwesome5
              name={
                update.type === 'submission' ? 'paper-plane' :
                update.type === 'join' ? 'user-plus' :
                update.type === 'milestone' ? 'flag' : 'award'
              }
              size={14}
              color={
                update.type === 'submission' ? '#4CAF50' :
                update.type === 'join' ? '#007AFF' :
                update.type === 'milestone' ? '#FF6B35' : '#FFD700'
              }
            />
          </View>
          
          <View style={styles.updateContent}>
            <Text style={styles.updateText}>
              <Text style={styles.updateUser}>{update.user}</Text> {update.action}
              {update.score && (
                <Text style={styles.updateScore}> (Score: {update.score})</Text>
              )}
            </Text>
            <Text style={styles.updateTime}>
              {Math.floor((Date.now() - update.timestamp) / 60000)}m ago
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {!challenge?.hasJoined ? (
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinChallenge}>
          <FontAwesome5 name="plus" size={16} color="#FFF" />
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      ) : challenge?.hasSubmitted ? (
        <TouchableOpacity style={styles.submittedButton} disabled>
          <FontAwesome5 name="check" size={16} color="#4CAF50" />
          <Text style={styles.submittedButtonText}>Submitted Today</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={() => setShowSubmissionModal(true)}
        >
          <FontAwesome5 name="paper-plane" size={16} color="#FFF" />
          <Text style={styles.submitButtonText}>Submit Entry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSubmissionModal = () => (
    <Modal
      visible={showSubmissionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSubmissionModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Submit Entry</Text>
          <TouchableOpacity onPress={handleSubmitEntry}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={submissionTitle}
              onChangeText={setSubmissionTitle}
              placeholder="Enter component title"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={submissionDescription}
              onChangeText={setSubmissionDescription}
              placeholder="Describe your component"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GitHub Repository *</Text>
            <TextInput
              style={styles.textInput}
              value={githubUrl}
              onChangeText={setGithubUrl}
              placeholder="https://github.com/username/repo"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Demo URL (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={demoUrl}
              onChangeText={setDemoUrl}
              placeholder="https://demo-url.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Implementation Notes *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { height: 120 }]}
              value={currentSubmission}
              onChangeText={setCurrentSubmission}
              placeholder="Explain your implementation, challenges faced, and key features"
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'participants':
        return renderParticipants();
      case 'leaderboard':
        return renderLeaderboard();
      case 'updates':
        return renderLiveUpdates();
      default:
        return renderOverview();
    }
  };

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading challenge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderChallengeHeader()}
        {renderTabBar()}
        {renderContent()}
      </ScrollView>
      
      {renderActionButtons()}
      {renderSubmissionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
    marginRight: 5,
  },
  liveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Content Sections
  overview: {
    padding: 15,
  },
  participants: {
    padding: 15,
  },
  leaderboard: {
    padding: 15,
  },
  liveUpdates: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  
  // Challenge Details
  challengeDetails: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginRight: 10,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  // Rules and Guidelines
  challengeRules: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  submissionGuidelines: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  ruleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  
  // Participants
  participantCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  participantMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantLevel: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 10,
  },
  participantScore: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 10,
  },
  participantSubmissions: {
    fontSize: 12,
    color: '#666',
  },
  participantStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  idleDot: {
    backgroundColor: '#FFA726',
  },
  lastSeen: {
    fontSize: 11,
    color: '#666',
  },
  
  // Leaderboard
  leaderboardCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRankCard: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rankSection: {
    marginRight: 15,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldRank: {
    backgroundColor: '#FFD700',
  },
  silverRank: {
    backgroundColor: '#C0C0C0',
  },
  bronzeRank: {
    backgroundColor: '#CD7F32',
  },
  defaultRank: {
    backgroundColor: '#E5E5E5',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  leaderboardScore: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 10,
  },
  leaderboardSubmissions: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 10,
  },
  leaderboardTime: {
    fontSize: 12,
    color: '#666',
  },
  leaderboardBadge: {
    marginLeft: 10,
  },
  
  // Live Updates
  updateCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  updateIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  updateUser: {
    fontWeight: '500',
    color: '#007AFF',
  },
  updateScore: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 12,
    color: '#666',
  },
  
  // Action Buttons
  actionButtons: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  submittedButton: {
    backgroundColor: '#F0F8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  submittedButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Submission Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  submitText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 80,
  },
});
