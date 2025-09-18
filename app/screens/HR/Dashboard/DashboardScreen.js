import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHR } from '../../../context/HRContext';
import { useApp } from '../../../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const {
    filteredCandidates,
    searchQuery,
    filters,
    sortBy,
    loading,
    savedCandidates,
    shortlistedCandidates,
    hrStats,
    searchCandidates,
    updateFilters,
    setSortBy,
    saveCandidate,
    unsaveCandidate,
    addToShortlist,
    sendInterviewRequest,
    markCandidateContacted,
  } = useHR();

  const { toggleMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    experience: '',
    location: '',
    progress: 0,
  });

  // Mock data for candidates
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      skills: ['React Native', 'JavaScript', 'UI/UX'],
      progress: 85,
      badges: 8,
      experience: '2-3 years',
      profileScore: 92,
      lastActive: '2 days ago',
      isAnonymous: false,
      roadmaps: ['React Native Development', 'UI/UX Fundamentals'],
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Anonymous Candidate #247',
      location: 'New York, NY',
      skills: ['Full Stack', 'Node.js', 'Python'],
      progress: 78,
      badges: 12,
      experience: '3-5 years',
      profileScore: 88,
      lastActive: '1 day ago',
      isAnonymous: true,
      roadmaps: ['Full Stack JavaScript', 'Data Science Basics'],
      avatar: '#247',
    },
    {
      id: 3,
      name: 'Michael Chen',
      location: 'Seattle, WA',
      skills: ['Mobile Dev', 'React', 'Swift'],
      progress: 95,
      badges: 15,
      experience: '4+ years',
      profileScore: 96,
      lastActive: '4 hours ago',
      isAnonymous: false,
      roadmaps: ['React Native Development', 'iOS Development'],
      avatar: 'MC',
    },
  ]);

  // Quick stats for dashboard
  const dashboardStats = {
    totalCandidates: 1247,
    savedCandidates: 23,
    interviewRequests: 8,
    activeSearches: 5,
  };

  const handleCandidatePress = (candidate) => {
    console.log('Viewing candidate:', candidate.name);
    // Navigate to candidate profile
  };

  const handleSaveCandidate = (candidateId) => {
    Alert.alert('Success', 'Candidate saved to your list!');
  };

  const handleInterviewRequest = (candidateId) => {
    Alert.alert(
      'Interview Request',
      'Send an interview request to this candidate?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: () => console.log('Interview request sent') },
      ]
    );
  };

  const handleModeSwitch = () => {
    switchMode(APP_MODES.CANDIDATE);
  };

  const renderCandidate = ({ item }) => (
    <Card style={styles.candidateCard} onPress={() => handleCandidatePress(item)}>
      <View style={styles.candidateHeader}>
        <View style={styles.candidateInfo}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateAvatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.candidateDetails}>
            <Text style={styles.candidateName}>{item.name}</Text>
            <Text style={styles.candidateLocation}>{item.location}</Text>
            <Text style={styles.candidateExperience}>{item.experience} experience</Text>
          </View>
        </View>
        <View style={styles.candidateScore}>
          <Text style={styles.scoreNumber}>{item.profileScore}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>

      {/* Progress and Badges */}
      <View style={styles.candidateProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Learning Progress: {item.progress}%</Text>
          <Text style={styles.badgesText}>{item.badges} badges earned</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>

      {/* Skills */}
      <View style={styles.skillsContainer}>
        {item.skills.map((skill, index) => (
          <Badge key={index} text={skill} variant="skill" size="small" />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.candidateActions}>
        <Button
          title="Save"
          variant="outline"
          size="small"
          onPress={() => handleSaveCandidate(item.id)}
        />
        <Button
          title="Interview"
          variant="primary"
          size="small"
          onPress={() => handleInterviewRequest(item.id)}
        />
        <Button
          title="View Profile"
          variant="secondary"
          size="small"
          onPress={() => handleCandidatePress(item)}
        />
      </View>

      <Text style={styles.lastActive}>Last active: {item.lastActive}</Text>
    </Card>
  );

  const renderStatCard = (title, value, color = '#007AFF') => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>HR Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.name || 'Recruiter'}!</Text>
        </View>
        <Button
          title="Switch to Candidate"
          variant="outline"
          size="small"
          onPress={handleModeSwitch}
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {renderStatCard('Total\nCandidates', dashboardStats.totalCandidates)}
        {renderStatCard('Saved\nCandidates', dashboardStats.savedCandidates, '#34C759')}
        {renderStatCard('Interview\nRequests', dashboardStats.interviewRequests, '#FF9500')}
        {renderStatCard('Active\nSearches', dashboardStats.activeSearches, '#5856D6')}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search candidates by skills, location, experience..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Candidates List */}
      <View style={styles.candidatesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verified Candidates</Text>
          <Text style={styles.candidateCount}>{candidates.length} results</Text>
        </View>
        
        <FlatList
          data={candidates}
          renderItem={renderCandidate}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.candidatesList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  candidatesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  candidateCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  candidatesList: {
    paddingBottom: 20,
  },
  candidateCard: {
    marginVertical: 8,
    marginHorizontal: 0,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candidateInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  candidateAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  candidateAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  candidateLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  candidateExperience: {
    fontSize: 13,
    color: '#8E8E93',
  },
  candidateScore: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  candidateProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#000000',
  },
  badgesText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  candidateActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  lastActive: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
