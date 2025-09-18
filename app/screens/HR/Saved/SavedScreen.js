import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';

const SavedScreen = () => {
  const [savedCandidates, setSavedCandidates] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      skills: ['React Native', 'JavaScript', 'UI/UX'],
      progress: 85,
      badges: 8,
      experience: '2-3 years',
      profileScore: 92,
      savedDate: '2024-08-25',
      avatar: 'SJ',
      status: 'Available',
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'Seattle, WA',
      skills: ['Mobile Dev', 'React', 'Swift'],
      progress: 95,
      badges: 15,
      experience: '4+ years',
      profileScore: 96,
      savedDate: '2024-08-23',
      avatar: 'MC',
      status: 'Interviewed',
    },
    {
      id: 3,
      name: 'Anonymous Candidate #247',
      location: 'New York, NY',
      skills: ['Full Stack', 'Node.js', 'Python'],
      progress: 78,
      badges: 12,
      experience: '3-5 years',
      profileScore: 88,
      savedDate: '2024-08-20',
      avatar: '#247',
      status: 'Pending Response',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Saved', count: savedCandidates.length },
    { id: 'available', label: 'Available', count: savedCandidates.filter(c => c.status === 'Available').length },
    { id: 'interviewed', label: 'Interviewed', count: savedCandidates.filter(c => c.status === 'Interviewed').length },
    { id: 'pending', label: 'Pending', count: savedCandidates.filter(c => c.status === 'Pending Response').length },
  ];

  const filteredCandidates = selectedCategory === 'all' 
    ? savedCandidates 
    : savedCandidates.filter(candidate => {
        switch (selectedCategory) {
          case 'available': return candidate.status === 'Available';
          case 'interviewed': return candidate.status === 'Interviewed';
          case 'pending': return candidate.status === 'Pending Response';
          default: return true;
        }
      });

  const handleUnsaveCandidate = (candidateId) => {
    Alert.alert(
      'Remove Candidate',
      'Are you sure you want to remove this candidate from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setSavedCandidates(prev => prev.filter(c => c.id !== candidateId));
          }
        },
      ]
    );
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Interviewed': return 'primary';
      case 'Pending Response': return 'warning';
      default: return 'default';
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
      >
        {item.label} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderCandidate = ({ item }) => (
    <Card style={styles.candidateCard}>
      <View style={styles.candidateHeader}>
        <View style={styles.candidateInfo}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateAvatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.candidateDetails}>
            <Text style={styles.candidateName}>{item.name}</Text>
            <Text style={styles.candidateLocation}>{item.location}</Text>
            <Text style={styles.candidateExperience}>{item.experience} experience</Text>
            <Text style={styles.savedDate}>Saved on {item.savedDate}</Text>
          </View>
        </View>
        <View style={styles.candidateScore}>
          <Text style={styles.scoreNumber}>{item.profileScore}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
          <Badge 
            text={item.status} 
            variant={getStatusColor(item.status)} 
            size="small" 
          />
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
          title="View Profile"
          variant="outline"
          size="small"
          onPress={() => console.log('View profile:', item.name)}
        />
        {item.status === 'Available' && (
          <Button
            title="Interview"
            variant="primary"
            size="small"
            onPress={() => handleInterviewRequest(item.id)}
          />
        )}
        <Button
          title="Remove"
          variant="danger"
          size="small"
          onPress={() => handleUnsaveCandidate(item.id)}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Candidates</Text>
        <Text style={styles.subtitle}>Manage your candidate pipeline</Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Candidates List */}
      {filteredCandidates.length > 0 ? (
        <FlatList
          data={filteredCandidates}
          renderItem={renderCandidate}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.candidatesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No candidates found</Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategory === 'all' 
              ? "You haven't saved any candidates yet" 
              : `No candidates with status "${categories.find(c => c.id === selectedCategory)?.label}"`
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesList: {
    paddingVertical: 10,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  candidatesList: {
    paddingHorizontal: 20,
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
    marginBottom: 2,
  },
  savedDate: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  candidateScore: {
    alignItems: 'center',
    gap: 4,
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
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SavedScreen;
