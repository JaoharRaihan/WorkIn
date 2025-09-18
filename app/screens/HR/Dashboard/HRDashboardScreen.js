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

  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewMessage, setInterviewMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Filter state
  const [tempFilters, setTempFilters] = useState(filters);

  const handleSearch = (text) => {
    searchCandidates(text);
  };

  const applyFilters = () => {
    updateFilters(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const resetFilters = {
      skills: [],
      experience: 'any',
      location: '',
      availability: 'any',
      salaryRange: 'any',
      verificationLevel: 'any',
      projectCount: 'any',
    };
    setTempFilters(resetFilters);
    updateFilters(resetFilters);
  };

  const handleCandidatePress = (candidate) => {
    setSelectedCandidate(candidate);
    markCandidateContacted(candidate.id);
    navigation.navigate('CandidateProfile', { candidate });
  };

  const handleSaveCandidate = (candidateId) => {
    if (savedCandidates.has(candidateId)) {
      unsaveCandidate(candidateId);
    } else {
      saveCandidate(candidateId);
    }
  };

  const handleShortlist = (candidateId) => {
    addToShortlist(candidateId);
    Alert.alert('Success', 'Candidate added to shortlist!');
  };

  const handleSendInterview = () => {
    if (!selectedCandidate || !interviewMessage.trim()) return;

    sendInterviewRequest({
      candidateId: selectedCandidate.id,
      message: interviewMessage,
      position: 'Software Developer',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    Alert.alert(
      'Interview Request Sent!',
      `Your interview request has been sent to ${selectedCandidate.name}.`
    );

    setShowInterviewModal(false);
    setInterviewMessage('');
    setSelectedCandidate(null);
  };

  const renderStatsCard = ({ title, value, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  const renderCandidateCard = ({ item: candidate }) => {
    const isSaved = savedCandidates.has(candidate.id);
    const isShortlisted = shortlistedCandidates.has(candidate.id);
    
    return (
      <TouchableOpacity
        style={styles.candidateCard}
        onPress={() => handleCandidatePress(candidate)}
      >
        <View style={styles.candidateHeader}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateInitial}>
              {candidate.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{candidate.name}</Text>
            <Text style={styles.candidateTitle}>{candidate.title}</Text>
            <Text style={styles.candidateLocation}>{candidate.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSaveCandidate(candidate.id)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? '#007AFF' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.candidateScores}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Trust</Text>
            <Text style={styles.scoreValue}>{candidate.scores.trustScore}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Hirability</Text>
            <Text style={styles.scoreValue}>{candidate.scores.hirabilityScore}%</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Projects</Text>
            <Text style={styles.scoreValue}>{candidate.projects.length}</Text>
          </View>
        </View>

        <View style={styles.candidateSkills}>
          {candidate.skills.slice(0, 3).map((skill) => (
            <View
              key={skill.id}
              style={[
                styles.skillTag,
                skill.verified && styles.verifiedSkillTag
              ]}
            >
              <Text style={[
                styles.skillText,
                skill.verified && styles.verifiedSkillText
              ]}>
                {skill.name}
                {skill.verified && ' ✓'}
              </Text>
            </View>
          ))}
          {candidate.skills.length > 3 && (
            <Text style={styles.moreSkills}>
              +{candidate.skills.length - 3} more
            </Text>
          )}
        </View>

        <View style={styles.candidateActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShortlist(candidate.id)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Shortlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => {
              setSelectedCandidate(candidate);
              setShowInterviewModal(true);
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={[styles.actionButtonText, styles.primaryActionText]}>
              Interview
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const sortOptions = [
    { key: 'relevance', label: 'Relevance', icon: 'star-outline' },
    { key: 'hirability', label: 'Hirability Score', icon: 'trending-up-outline' },
    { key: 'trust', label: 'Trust Score', icon: 'shield-checkmark-outline' },
    { key: 'recent', label: 'Recently Active', icon: 'time-outline' },
    { key: 'experience', label: 'Experience', icon: 'briefcase-outline' },
    { key: 'projects', label: 'Project Count', icon: 'folder-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>HR Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {filteredCandidates.length} verified candidates
            </Text>
          </View>
          <TouchableOpacity
            style={styles.modeToggle}
            onPress={() => toggleMode('candidate')}
          >
            <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
            <Text style={styles.modeToggleText}>Candidate Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsScrollContent}
      >
        {renderStatsCard({
          title: 'Total Searches',
          value: hrStats.totalSearches,
          icon: 'search-outline',
          color: '#007AFF'
        })}
        {renderStatsCard({
          title: 'Candidates Viewed',
          value: hrStats.candidatesViewed,
          icon: 'eye-outline',
          color: '#34C759'
        })}
        {renderStatsCard({
          title: 'Interviews Sent',
          value: hrStats.interviewsSent,
          icon: 'mail-outline',
          color: '#FF9500'
        })}
        {renderStatsCard({
          title: 'Successful Hires',
          value: hrStats.successfulHires,
          icon: 'checkmark-circle-outline',
          color: '#30D158'
        })}
      </ScrollView>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidates by name, skills, location..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="funnel-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(filters.skills.length > 0 || filters.experience !== 'any' || 
        filters.location || filters.verificationLevel !== 'any') && (
        <ScrollView
          horizontal
          style={styles.activeFilters}
          showsHorizontalScrollIndicator={false}
        >
          {filters.skills.map((skill, index) => (
            <View key={index} style={styles.filterTag}>
              <Text style={styles.filterTagText}>{skill}</Text>
            </View>
          ))}
          {filters.experience !== 'any' && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{filters.experience} level</Text>
            </View>
          )}
          {filters.verificationLevel !== 'any' && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{filters.verificationLevel}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Candidates List */}
      <FlatList
        data={filteredCandidates}
        renderItem={renderCandidateCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.candidatesList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {}}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={applyFilters}>
              <Text style={styles.modalApply}>Apply</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Verification Level Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Verification Level</Text>
              <View style={styles.filterOptions}>
                {['any', 'verified', 'expert'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterOption,
                      tempFilters.verificationLevel === level && styles.selectedFilterOption
                    ]}
                    onPress={() => setTempFilters({
                      ...tempFilters,
                      verificationLevel: level
                    })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      tempFilters.verificationLevel === level && styles.selectedFilterOptionText
                    ]}>
                      {level === 'any' ? 'Any Level' : 
                       level === 'verified' ? 'Verified Skills' : 'Expert Level'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Level Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Experience Level</Text>
              <View style={styles.filterOptions}>
                {['any', 'junior', 'mid', 'senior'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[
                      styles.filterOption,
                      tempFilters.experience === exp && styles.selectedFilterOption
                    ]}
                    onPress={() => setTempFilters({
                      ...tempFilters,
                      experience: exp
                    })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      tempFilters.experience === exp && styles.selectedFilterOptionText
                    ]}>
                      {exp === 'any' ? 'Any Level' : 
                       exp.charAt(0).toUpperCase() + exp.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reset Filters */}
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sort By</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.selectedSortOption
                ]}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortModal(false);
                }}
              >
                <Ionicons name={option.icon} size={20} color="#007AFF" />
                <Text style={styles.sortOptionText}>{option.label}</Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Interview Request Modal */}
      <Modal
        visible={showInterviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInterviewModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Interview Request</Text>
            <TouchableOpacity onPress={handleSendInterview}>
              <Text style={styles.modalApply}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedCandidate && (
              <View style={styles.candidatePreview}>
                <Text style={styles.candidatePreviewName}>
                  {selectedCandidate.name}
                </Text>
                <Text style={styles.candidatePreviewTitle}>
                  {selectedCandidate.title}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Interview Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Hi! We'd love to schedule an interview to discuss opportunities..."
              value={interviewMessage}
              onChangeText={setInterviewMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeToggleText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  sortButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  activeFilters: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  candidatesList: {
    padding: 20,
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  candidateAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  candidateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  candidateTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  candidateLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  saveButton: {
    padding: 8,
  },
  candidateScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },
  candidateSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  verifiedSkillTag: {
    backgroundColor: '#e8f5e8',
  },
  skillText: {
    fontSize: 12,
    color: '#666',
  },
  verifiedSkillText: {
    color: '#30d158',
  },
  moreSkills: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
  candidateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 4,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  primaryActionText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCancel: {
    color: '#666',
    fontSize: 16,
  },
  modalApply: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedFilterOptionText: {
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  selectedSortOption: {
    backgroundColor: '#f0f8ff',
  },
  sortOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  candidatePreview: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  candidatePreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  candidatePreviewTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
});
