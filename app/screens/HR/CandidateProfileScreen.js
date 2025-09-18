import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHR } from '../../context/HRContext';

export default function CandidateProfileScreen({ route, navigation }) {
  const { candidate } = route.params;
  const { 
    savedCandidates, 
    saveCandidate, 
    unsaveCandidate, 
    sendInterviewRequest,
    addToShortlist 
  } = useHR();

  const isSaved = savedCandidates.has(candidate.id);

  const handleSave = () => {
    if (isSaved) {
      unsaveCandidate(candidate.id);
    } else {
      saveCandidate(candidate.id);
    }
  };

  const handleInterview = () => {
    Alert.alert(
      'Send Interview Request',
      `Send interview request to ${candidate.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            sendInterviewRequest({
              candidateId: candidate.id,
              message: 'We would like to schedule an interview with you.',
              position: 'Software Developer',
              scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
            Alert.alert('Success', 'Interview request sent!');
          }
        }
      ]
    );
  };

  const handleShortlist = () => {
    addToShortlist(candidate.id);
    Alert.alert('Success', 'Candidate added to shortlist!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Candidate Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{candidate.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{candidate.name}</Text>
            <Text style={styles.title}>{candidate.title}</Text>
            <Text style={styles.location}>{candidate.location}</Text>
            <Text style={styles.experience}>{candidate.experience} years experience</Text>
          </View>
        </View>

        {/* Scores */}
        <View style={styles.scoresContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{candidate.scores.trustScore}%</Text>
            <Text style={styles.scoreLabel}>Trust Score</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{candidate.scores.hirabilityScore}%</Text>
            <Text style={styles.scoreLabel}>Hirability</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{candidate.projects.length}</Text>
            <Text style={styles.scoreLabel}>Projects</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{candidate.bio}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {candidate.skills.map((skill) => (
              <View
                key={skill.id}
                style={[
                  styles.skillTag,
                  skill.verified && styles.verifiedSkill
                ]}
              >
                <Text style={[
                  styles.skillText,
                  skill.verified && styles.verifiedSkillText
                ]}>
                  {skill.name}
                  {skill.verified && ' ✓'}
                </Text>
                <Text style={styles.skillLevel}>Level {skill.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {candidate.projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              <View style={styles.projectTechs}>
                {project.technologies.map((tech, index) => (
                  <Text key={index} style={styles.techTag}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidate.stats.testsCompleted}</Text>
              <Text style={styles.statLabel}>Tests Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidate.stats.badgesEarned}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidate.stats.learningStreak}</Text>
              <Text style={styles.statLabel}>Learning Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{candidate.responseRate}%</Text>
              <Text style={styles.statLabel}>Response Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleShortlist}
        >
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Shortlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleInterview}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Send Interview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  experience: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  scoresContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 12,
  },
  scoreCard: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  verifiedSkill: {
    backgroundColor: '#e8f5e8',
  },
  skillText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  verifiedSkillText: {
    color: '#30d158',
  },
  skillLevel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  projectCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  projectTechs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techTag: {
    backgroundColor: '#e1e5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
    marginRight: 6,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});
