import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../../context/CommunityContext';
import { useProfile } from '../../../context/ProfileContext';

const { width } = Dimensions.get('window');

export default function MentorMarketplaceScreen({ navigation }) {
  const {
    mentors,
    requestMentorship,
    mentorshipRequests,
    activeMentorships,
  } = useCommunity();
  
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [sessionType, setSessionType] = useState('consultation');
  const [sessionMessage, setSessionMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const skills = ['all', 'React Native', 'JavaScript', 'Node.js', 'UI/UX', 'System Design', 'Full Stack'];
  const priceRanges = ['all', '0-50', '51-100', '101-150', '150+'];
  const sessionTypes = [
    { id: 'consultation', name: 'Code Review & Consultation', duration: '30 min' },
    { id: 'debugging', name: 'Debugging Session', duration: '45 min' },
    { id: 'architecture', name: 'Architecture Review', duration: '60 min' },
    { id: 'career', name: 'Career Guidance', duration: '30 min' },
    { id: 'project', name: 'Project Planning', duration: '90 min' },
  ];

  useEffect(() => {
    filterMentors();
  }, [mentors, searchQuery, selectedSkill, priceRange, availabilityFilter]);

  const filterMentors = () => {
    let filtered = [...mentors];

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Skill filter
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.skills.includes(selectedSkill)
      );
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => 
        p === '150+' ? [150, Infinity] : 
        p ? parseInt(p) : 0
      );
      
      if (priceRange === '150+') {
        filtered = filtered.filter(mentor => mentor.hourlyRate >= 150);
      } else {
        filtered = filtered.filter(mentor => 
          mentor.hourlyRate >= min && mentor.hourlyRate <= max
        );
      }
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(mentor => mentor.isAvailable);
    } else if (availabilityFilter === 'busy') {
      filtered = filtered.filter(mentor => !mentor.isAvailable);
    }

    // Sort by rating and availability
    filtered.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return b.rating - a.rating;
    });

    setFilteredMentors(filtered);
  };

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  const submitMentorshipRequest = async () => {
    if (!sessionMessage.trim() || !preferredDate || !preferredTime) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const requestData = {
        mentorId: selectedMentor.id,
        sessionType,
        message: sessionMessage,
        preferredDate,
        preferredTime,
        duration: sessionTypes.find(t => t.id === sessionType)?.duration,
      };

      await requestMentorship(selectedMentor.id, sessionMessage, sessionType);
      
      setShowBookingModal(false);
      setSessionMessage('');
      setPreferredDate('');
      setPreferredTime('');
      setSelectedMentor(null);

      Alert.alert(
        'Request Sent!',
        `Your mentorship request has been sent to ${selectedMentor.name}. They will respond within ${selectedMentor.responseTime}.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send mentorship request. Please try again.');
    }
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search mentors, skills, companies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <FontAwesome5 name="filter" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Skill</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {skills.map(skill => (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      styles.filterChip,
                      selectedSkill === skill && styles.activeFilterChip
                    ]}
                    onPress={() => setSelectedSkill(skill)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedSkill === skill && styles.activeFilterChipText
                    ]}>
                      {skill === 'all' ? 'All Skills' : skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {priceRanges.map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterChip,
                      priceRange === range && styles.activeFilterChip
                    ]}
                    onPress={() => setPriceRange(range)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      priceRange === range && styles.activeFilterChipText
                    ]}>
                      {range === 'all' ? 'All Prices' : 
                       range === '150+' ? '$150+' : `$${range}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Availability</Text>
            <View style={styles.filterChips}>
              {['all', 'available', 'busy'].map(availability => (
                <TouchableOpacity
                  key={availability}
                  style={[
                    styles.filterChip,
                    availabilityFilter === availability && styles.activeFilterChip
                  ]}
                  onPress={() => setAvailabilityFilter(availability)}
                >
                  <Text style={[
                    styles.filterChipText,
                    availabilityFilter === availability && styles.activeFilterChipText
                  ]}>
                    {availability === 'all' ? 'All' :
                     availability === 'available' ? 'Available Now' : 'Busy'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderMentorCard = (mentor) => (
    <View key={mentor.id} style={styles.mentorCard}>
      <View style={styles.mentorHeader}>
        <View style={styles.mentorAvatar}>
          <FontAwesome5 name="user-graduate" size={24} color="#007AFF" />
        </View>
        
        <View style={styles.mentorInfo}>
          <View style={styles.mentorNameRow}>
            <Text style={styles.mentorName}>{mentor.name}</Text>
            <View style={[
              styles.availabilityDot,
              mentor.isAvailable ? styles.available : styles.busy
            ]} />
          </View>
          
          <Text style={styles.mentorTitle}>{mentor.title}</Text>
          <Text style={styles.mentorCompany}>{mentor.company}</Text>
          
          <View style={styles.mentorRating}>
            <FontAwesome5 name="star" size={12} color="#FFD700" solid />
            <Text style={styles.ratingText}>{mentor.rating}</Text>
            <Text style={styles.reviewText}>({mentor.reviewCount} reviews)</Text>
            <Text style={styles.experienceText}>• {mentor.experience}</Text>
          </View>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.priceText}>${mentor.hourlyRate}/hr</Text>
          <Text style={styles.responseTime}>{mentor.responseTime}</Text>
        </View>
      </View>
      
      <View style={styles.mentorSkills}>
        {mentor.skills.slice(0, 4).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {mentor.skills.length > 4 && (
          <Text style={styles.moreSkills}>+{mentor.skills.length - 4} more</Text>
        )}
      </View>
      
      <View style={styles.mentorSpecialties}>
        <Text style={styles.specialtiesLabel}>Specializes in:</Text>
        <Text style={styles.specialtiesText}>
          {mentor.specialties.join(' • ')}
        </Text>
      </View>
      
      <View style={styles.mentorMeta}>
        <View style={styles.metaItem}>
          <FontAwesome5 name="globe" size={12} color="#666" />
          <Text style={styles.metaText}>{mentor.languages.join(', ')}</Text>
        </View>
        <View style={styles.metaItem}>
          <FontAwesome5 name="clock" size={12} color="#666" />
          <Text style={styles.metaText}>{mentor.timezone}</Text>
        </View>
        <View style={styles.metaItem}>
          <FontAwesome5 name="calendar" size={12} color="#666" />
          <Text style={styles.metaText}>{mentor.availability}</Text>
        </View>
      </View>
      
      <View style={styles.nextAvailable}>
        <FontAwesome5 name="calendar-alt" size={12} color="#007AFF" />
        <Text style={styles.nextAvailableText}>
          Next available: {mentor.isAvailable ? 'Now' : 
            new Date(mentor.nextAvailableSlot).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.mentorActions}>
        <TouchableOpacity 
          style={styles.viewProfileButton}
          onPress={() => navigation.navigate('MentorProfile', { mentor })}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.bookButton,
            !mentor.isAvailable && styles.bookButtonDisabled
          ]}
          onPress={() => handleBookSession(mentor)}
          disabled={!mentor.isAvailable}
        >
          <FontAwesome5 name="calendar-plus" size={14} color="#FFF" />
          <Text style={styles.bookButtonText}>
            {mentor.isAvailable ? 'Book Session' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowBookingModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Book Session</Text>
          <TouchableOpacity onPress={submitMentorshipRequest}>
            <Text style={styles.submitText}>Send Request</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mentorSummary}>
            <View style={styles.summaryAvatar}>
              <FontAwesome5 name="user-graduate" size={20} color="#007AFF" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryName}>{selectedMentor?.name}</Text>
              <Text style={styles.summaryTitle}>{selectedMentor?.title}</Text>
              <Text style={styles.summaryPrice}>${selectedMentor?.hourlyRate}/hr</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Session Type *</Text>
            <View style={styles.sessionTypes}>
              {sessionTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.sessionTypeCard,
                    sessionType === type.id && styles.selectedSessionType
                  ]}
                  onPress={() => setSessionType(type.id)}
                >
                  <Text style={[
                    styles.sessionTypeName,
                    sessionType === type.id && styles.selectedSessionTypeName
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={[
                    styles.sessionTypeDuration,
                    sessionType === type.id && styles.selectedSessionTypeDuration
                  ]}>
                    {type.duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Date *</Text>
            <TextInput
              style={styles.textInput}
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Time *</Text>
            <TextInput
              style={styles.textInput}
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message to Mentor *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={sessionMessage}
              onChangeText={setSessionMessage}
              placeholder="Briefly describe what you'd like help with, your current challenge, and what you hope to achieve from this session."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.bookingNote}>
            <FontAwesome5 name="info-circle" size={14} color="#007AFF" />
            <Text style={styles.noteText}>
              This mentor responds within {selectedMentor?.responseTime}. 
              Your session request will be reviewed and you'll receive a confirmation.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor Marketplace</Text>
        <TouchableOpacity style={styles.mySessionsButton}>
          <FontAwesome5 name="calendar-alt" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {renderSearchAndFilters()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredMentors.length} mentors found
          </Text>
          <Text style={styles.availableText}>
            {filteredMentors.filter(m => m.isAvailable).length} available now
          </Text>
        </View>
        
        <View style={styles.mentorsList}>
          {filteredMentors.map(renderMentorCard)}
        </View>
      </ScrollView>
      
      {renderBookingModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mySessionsButton: {
    padding: 5,
  },
  
  // Search and Filters
  searchSection: {
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  filterButton: {
    padding: 5,
  },
  filtersContainer: {
    marginTop: 15,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterChipText: {
    color: '#FFF',
  },
  
  // Results
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  availableText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  
  // Mentor Cards
  mentorsList: {
    paddingHorizontal: 15,
  },
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
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
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
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  responseTime: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
  },
  mentorSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  mentorSpecialties: {
    marginBottom: 12,
  },
  specialtiesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  specialtiesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  mentorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  nextAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  nextAvailableText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 5,
  },
  mentorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  viewProfileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  bookButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 5,
  },
  
  // Booking Modal
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
  mentorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  summaryPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
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
  sessionTypes: {
    flexDirection: 'column',
  },
  sessionTypeCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedSessionType: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  sessionTypeName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedSessionTypeName: {
    color: '#007AFF',
  },
  sessionTypeDuration: {
    fontSize: 12,
    color: '#666',
  },
  selectedSessionTypeDuration: {
    color: '#007AFF',
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
    height: 100,
  },
  bookingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});
