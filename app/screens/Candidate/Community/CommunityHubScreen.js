import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useCommunity } from '../../../context/CommunityContext';
import { useProfile } from '../../../context/ProfileContext';

const { width } = Dimensions.get('window');

export default function CommunityHubScreen({ navigation }) {
  const {
    liveChallenges,
    tournaments,
    mentors,
    studyGroups,
    events,
    communityStats,
    userCommunityProfile,
    loading,
    refreshing,
    joinChallenge,
    joinTournament,
    joinStudyGroup,
    joinEvent,
    loadCommunityData,
  } = useCommunity();
  
  const { stats } = useProfile();
  const [activeTab, setActiveTab] = useState('challenges');

  const onRefresh = () => {
    loadCommunityData();
  };

  const renderStatsHeader = () => (
    <View style={styles.statsHeader}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{communityStats.totalMembers?.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{communityStats.activeChallenges}</Text>
          <Text style={styles.statLabel}>Live Challenges</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{communityStats.runningTournaments}</Text>
          <Text style={styles.statLabel}>Tournaments</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{communityStats.availableMentors}</Text>
          <Text style={styles.statLabel}>Mentors</Text>
        </View>
      </View>
      
      <View style={styles.userRankSection}>
        <View style={styles.rankItem}>
          <FontAwesome5 name="trophy" size={16} color="#FFD700" />
          <Text style={styles.rankText}>Weekly Rank: #{userCommunityProfile?.weeklyRank || 'N/A'}</Text>
        </View>
        <View style={styles.rankItem}>
          <FontAwesome5 name="medal" size={16} color="#C0C0C0" />
          <Text style={styles.rankText}>Monthly Rank: #{userCommunityProfile?.monthlyRank || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
        onPress={() => setActiveTab('challenges')}
      >
        <FontAwesome5 name="fire" size={18} color={activeTab === 'challenges' ? '#007AFF' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
          Challenges
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'tournaments' && styles.activeTab]}
        onPress={() => setActiveTab('tournaments')}
      >
        <FontAwesome5 name="trophy" size={18} color={activeTab === 'tournaments' ? '#007AFF' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'tournaments' && styles.activeTabText]}>
          Tournaments
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'mentors' && styles.activeTab]}
        onPress={() => setActiveTab('mentors')}
      >
        <FontAwesome5 name="user-graduate" size={18} color={activeTab === 'mentors' ? '#007AFF' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'mentors' && styles.activeTabText]}>
          Mentors
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
        onPress={() => setActiveTab('groups')}
      >
        <FontAwesome5 name="users" size={18} color={activeTab === 'groups' ? '#007AFF' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
          Groups
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'events' && styles.activeTab]}
        onPress={() => setActiveTab('events')}
      >
        <FontAwesome5 name="calendar" size={18} color={activeTab === 'events' ? '#007AFF' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
          Events
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChallengeCard = (challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          
          <View style={styles.challengeMeta}>
            <View style={styles.challengeMetaItem}>
              <FontAwesome5 name="code" size={12} color="#666" />
              <Text style={styles.challengeMetaText}>{challenge.skill}</Text>
            </View>
            <View style={styles.challengeMetaItem}>
              <FontAwesome5 name="signal" size={12} color="#666" />
              <Text style={styles.challengeMetaText}>{challenge.difficulty}</Text>
            </View>
            <View style={styles.challengeMetaItem}>
              <FontAwesome5 name="users" size={12} color="#666" />
              <Text style={styles.challengeMetaText}>{challenge.participants}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.challengeStatus}>
          {challenge.status === 'active' && (
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={styles.statusText}>LIVE</Text>
            </View>
          )}
          {challenge.status === 'upcoming' && (
            <View style={[styles.statusBadge, styles.upcomingBadge]}>
              <Text style={styles.statusText}>SOON</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.challengeProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(challenge.submissions / challenge.participants) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.submissions}/{challenge.participants} completed
        </Text>
      </View>
      
      <View style={styles.challengeReward}>
        <FontAwesome5 name="gift" size={14} color="#FF6B35" />
        <Text style={styles.rewardText}>{challenge.prize}</Text>
      </View>
      
      <View style={styles.challengeActions}>
        <Text style={styles.timeRemaining}>
          {challenge.status === 'active' ? 'Ends in 5 days' : 'Starts tomorrow'}
        </Text>
        
        {challenge.hasJoined ? (
          challenge.hasSubmitted ? (
            <View style={styles.submittedButton}>
              <FontAwesome5 name="check" size={14} color="#4CAF50" />
              <Text style={styles.submittedText}>Submitted</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit Entry</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => joinChallenge(challenge.id)}
          >
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTournamentCard = (tournament) => (
    <View key={tournament.id} style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTitle}>{tournament.title}</Text>
          <Text style={styles.tournamentDescription}>{tournament.description}</Text>
          
          <View style={styles.tournamentMeta}>
            <View style={styles.tournamentMetaItem}>
              <FontAwesome5 name="trophy" size={12} color="#FFD700" />
              <Text style={styles.tournamentMetaText}>{tournament.type}</Text>
            </View>
            <View style={styles.tournamentMetaItem}>
              <FontAwesome5 name="users" size={12} color="#666" />
              <Text style={styles.tournamentMetaText}>
                {tournament.remainingParticipants || tournament.participants} players
              </Text>
            </View>
            <View style={styles.tournamentMetaItem}>
              <FontAwesome5 name="layer-group" size={12} color="#666" />
              <Text style={styles.tournamentMetaText}>
                Round {tournament.currentRound || 1}/{tournament.rounds}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tournamentStatus}>
          {tournament.status === 'active' && (
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={styles.statusText}>LIVE</Text>
            </View>
          )}
          {tournament.status === 'registration' && (
            <View style={[styles.statusBadge, styles.registrationBadge]}>
              <Text style={styles.statusText}>OPEN</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.tournamentProgress}>
        <Text style={styles.progressLabel}>Tournament Progress</Text>
        <View style={styles.roundIndicators}>
          {Array.from({ length: tournament.rounds }, (_, i) => (
            <View
              key={i}
              style={[
                styles.roundIndicator,
                i < (tournament.currentRound || 1) ? styles.completedRound : styles.upcomingRound
              ]}
            >
              <Text style={styles.roundText}>{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.tournamentReward}>
        <FontAwesome5 name="crown" size={14} color="#FFD700" />
        <Text style={styles.rewardText}>{tournament.prize}</Text>
      </View>
      
      <View style={styles.tournamentActions}>
        {tournament.status === 'registration' ? (
          <Text style={styles.timeRemaining}>
            Registration closes in 2 days
          </Text>
        ) : (
          <Text style={styles.timeRemaining}>
            Next round in 2 days
          </Text>
        )}
        
        {tournament.hasJoined ? (
          <View style={styles.joinedButton}>
            <FontAwesome5 name="check" size={14} color="#4CAF50" />
            <Text style={styles.joinedText}>
              {tournament.userStatus === 'qualified' ? 'Qualified' : 'Participating'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => joinTournament(tournament.id)}
          >
            <Text style={styles.joinButtonText}>
              {tournament.status === 'registration' ? 'Register' : 'Join'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMentorCard = (mentor) => (
    <View key={mentor.id} style={styles.mentorCard}>
      <View style={styles.mentorHeader}>
        <View style={styles.mentorAvatar}>
          <FontAwesome5 name="user-graduate" size={24} color="#007AFF" />
        </View>
        
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName}>{mentor.name}</Text>
          <Text style={styles.mentorTitle}>{mentor.title}</Text>
          <Text style={styles.mentorCompany}>{mentor.company}</Text>
          
          <View style={styles.mentorRating}>
            <FontAwesome5 name="star" size={12} color="#FFD700" solid />
            <Text style={styles.ratingText}>{mentor.rating}</Text>
            <Text style={styles.reviewText}>({mentor.reviewCount} reviews)</Text>
          </View>
        </View>
        
        <View style={styles.mentorPrice}>
          <Text style={styles.priceText}>${mentor.hourlyRate}/hr</Text>
          <View style={[styles.availabilityDot, mentor.isAvailable ? styles.available : styles.busy]} />
        </View>
      </View>
      
      <View style={styles.mentorSkills}>
        {mentor.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {mentor.skills.length > 3 && (
          <Text style={styles.moreSkills}>+{mentor.skills.length - 3} more</Text>
        )}
      </View>
      
      <View style={styles.mentorMeta}>
        <View style={styles.mentorMetaItem}>
          <FontAwesome5 name="clock" size={12} color="#666" />
          <Text style={styles.mentorMetaText}>{mentor.responseTime}</Text>
        </View>
        <View style={styles.mentorMetaItem}>
          <FontAwesome5 name="calendar" size={12} color="#666" />
          <Text style={styles.mentorMetaText}>{mentor.availability}</Text>
        </View>
        <View style={styles.mentorMetaItem}>
          <FontAwesome5 name="globe" size={12} color="#666" />
          <Text style={styles.mentorMetaText}>{mentor.timezone}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.mentorButton, !mentor.isAvailable && styles.mentorButtonDisabled]}
        onPress={() => navigation.navigate('MentorProfile', { mentor })}
        disabled={!mentor.isAvailable}
      >
        <Text style={[styles.mentorButtonText, !mentor.isAvailable && styles.mentorButtonTextDisabled]}>
          {mentor.isAvailable ? 'Book Session' : 'Not Available'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStudyGroupCard = (group) => (
    <View key={group.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
          
          <View style={styles.groupMeta}>
            <View style={styles.groupMetaItem}>
              <FontAwesome5 name="code" size={12} color="#666" />
              <Text style={styles.groupMetaText}>{group.skill}</Text>
            </View>
            <View style={styles.groupMetaItem}>
              <FontAwesome5 name="signal" size={12} color="#666" />
              <Text style={styles.groupMetaText}>{group.level}</Text>
            </View>
            <View style={styles.groupMetaItem}>
              <FontAwesome5 name="users" size={12} color="#666" />
              <Text style={styles.groupMetaText}>{group.members}/{group.maxMembers}</Text>
            </View>
          </View>
        </View>
        
        {group.isPrivate && (
          <FontAwesome5 name="lock" size={16} color="#666" />
        )}
      </View>
      
      <View style={styles.groupSchedule}>
        <FontAwesome5 name="calendar-alt" size={12} color="#007AFF" />
        <Text style={styles.scheduleText}>{group.schedule}</Text>
      </View>
      
      <View style={styles.groupTopics}>
        {group.topics.slice(0, 3).map((topic, index) => (
          <View key={index} style={styles.topicTag}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
        {group.topics.length > 3 && (
          <Text style={styles.moreTopics}>+{group.topics.length - 3} more</Text>
        )}
      </View>
      
      <View style={styles.groupFooter}>
        <Text style={styles.groupCreator}>Created by {group.createdBy}</Text>
        
        {group.hasJoined ? (
          <TouchableOpacity style={styles.joinedButton}>
            <FontAwesome5 name="check" size={14} color="#4CAF50" />
            <Text style={styles.joinedText}>Joined</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.joinButton, group.members >= group.maxMembers && styles.fullButton]}
            onPress={() => joinStudyGroup(group.id)}
            disabled={group.members >= group.maxMembers}
          >
            <Text style={styles.joinButtonText}>
              {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.eventMetaItem}>
              <FontAwesome5 name="calendar" size={12} color="#666" />
              <Text style={styles.eventMetaText}>
                {new Date(event.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.eventMetaItem}>
              <FontAwesome5 name="clock" size={12} color="#666" />
              <Text style={styles.eventMetaText}>{event.duration}</Text>
            </View>
            <View style={styles.eventMetaItem}>
              <FontAwesome5 name="users" size={12} color="#666" />
              <Text style={styles.eventMetaText}>
                {event.attendees}/{event.maxAttendees}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.eventPrice}>
          <Text style={styles.priceText}>{event.price}</Text>
        </View>
      </View>
      
      <View style={styles.eventSpeakers}>
        <Text style={styles.speakersLabel}>Speakers:</Text>
        <Text style={styles.speakersText}>{event.speakers.join(', ')}</Text>
      </View>
      
      <View style={styles.eventTopics}>
        {event.topics.slice(0, 4).map((topic, index) => (
          <View key={index} style={styles.eventTopicTag}>
            <Text style={styles.eventTopicText}>{topic}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.eventFooter}>
        <View style={styles.eventFormat}>
          <FontAwesome5 
            name={event.format === 'virtual' ? 'video' : event.format === 'hybrid' ? 'globe' : 'map-marker-alt'} 
            size={12} 
            color="#007AFF" 
          />
          <Text style={styles.formatText}>
            {event.format === 'in-person' ? event.location : event.format}
          </Text>
        </View>
        
        {event.hasJoined ? (
          <TouchableOpacity style={styles.joinedButton}>
            <FontAwesome5 name="check" size={14} color="#4CAF50" />
            <Text style={styles.joinedText}>Registered</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => joinEvent(event.id)}
          >
            <Text style={styles.joinButtonText}>Register</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'challenges':
        return (
          <View style={styles.content}>
            {liveChallenges.map(renderChallengeCard)}
          </View>
        );
      case 'tournaments':
        return (
          <View style={styles.content}>
            {tournaments.map(renderTournamentCard)}
          </View>
        );
      case 'mentors':
        return (
          <View style={styles.content}>
            {mentors.map(renderMentorCard)}
          </View>
        );
      case 'groups':
        return (
          <View style={styles.content}>
            {studyGroups.map(renderStudyGroupCard)}
          </View>
        );
      case 'events':
        return (
          <View style={styles.content}>
            {events.map(renderEventCard)}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsHeader()}
        {renderTabBar()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  
  // Stats Header
  statsHeader: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userRankSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
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
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Content
  content: {
    padding: 15,
  },
  
  // Challenge Cards
  challengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  challengeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  challengeMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  challengeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#FF6B35',
  },
  upcomingBadge: {
    backgroundColor: '#007AFF',
  },
  registrationBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  challengeProgress: {
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 5,
    fontWeight: '500',
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  submittedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submittedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 5,
  },
  joinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 5,
  },
  
  // Tournament Cards
  tournamentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tournamentInfo: {
    flex: 1,
    marginRight: 10,
  },
  tournamentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tournamentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  tournamentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tournamentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  tournamentMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  tournamentStatus: {
    alignItems: 'flex-end',
  },
  tournamentProgress: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  roundIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedRound: {
    backgroundColor: '#4CAF50',
  },
  upcomingRound: {
    backgroundColor: '#E5E5E5',
  },
  roundText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tournamentReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tournamentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Mentor Cards
  mentorCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mentorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  mentorCompany: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 5,
  },
  mentorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 3,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  mentorPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  busy: {
    backgroundColor: '#FF5722',
  },
  mentorSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  skillText: {
    fontSize: 11,
    color: '#007AFF',
  },
  moreSkills: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'center',
  },
  mentorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mentorMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorMetaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 5,
  },
  mentorButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mentorButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  mentorButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  mentorButtonTextDisabled: {
    color: '#999',
  },
  
  // Study Group Cards
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  groupMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  groupMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  groupSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 5,
  },
  groupTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  topicTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  topicText: {
    fontSize: 11,
    color: '#666',
  },
  moreTopics: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'center',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCreator: {
    fontSize: 12,
    color: '#666',
  },
  fullButton: {
    backgroundColor: '#E5E5E5',
  },
  
  // Event Cards
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  eventPrice: {
    alignItems: 'flex-end',
  },
  eventSpeakers: {
    marginBottom: 10,
  },
  speakersLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  speakersText: {
    fontSize: 12,
    color: '#007AFF',
  },
  eventTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  eventTopicTag: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  eventTopicText: {
    fontSize: 11,
    color: '#FF6B35',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventFormat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 5,
  },
});
