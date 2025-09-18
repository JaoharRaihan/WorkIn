import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '../context/ProfileContext';
import { useSkills } from '../hooks/useProfileHooks';

const SkillsSection = () => {
  const { profileData } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [viewFilter, setViewFilter] = useState('all'); // all, verified, learning
  
  const {
    verifiedSkills,
    learningSkills,
    allSkills,
    getSkillLevel,
    getSkillProgress,
    canEndorseSkill
  } = useSkills();

  // Filter skills based on current view
  const getFilteredSkills = () => {
    switch (viewFilter) {
      case 'verified':
        return verifiedSkills;
      case 'learning':
        return learningSkills;
      default:
        return allSkills;
    }
  };

  // Handle skill press
  const handleSkillPress = (skill) => {
    setSelectedSkill(skill);
    setModalVisible(true);
  };

  // Handle skill endorsement
  const handleEndorseSkill = (skillId) => {
    Alert.alert(
      'Endorse Skill',
      'Skill endorsement feature will be implemented with social features!',
      [{ text: 'Got it!', style: 'default' }]
    );
    // TODO: Implement skill endorsement
  };

  // Handle verify skill
  const handleVerifySkill = (skillId) => {
    Alert.alert(
      'Verify Skill',
      'Take a verified test to prove this skill!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Test', style: 'default', onPress: () => {
          // TODO: Navigate to skill test
        }}
      ]
    );
  };

  // Skill item component
  const SkillItem = ({ skill }) => {
    const level = getSkillLevel(skill.id);
    const progress = getSkillProgress(skill.id);
    const isVerified = skill.verified;
    const endorsements = skill.endorsements || 0;

    return (
      <TouchableOpacity 
        style={[
          styles.skillItem,
          isVerified && styles.verifiedSkillItem
        ]}
        onPress={() => handleSkillPress(skill)}
      >
        <LinearGradient
          colors={isVerified ? ['#4CAF50', '#45A049'] : ['#f8f9fa', '#e9ecef']}
          style={styles.skillGradient}
        >
          <View style={styles.skillHeader}>
            <View style={styles.skillInfo}>
              <Text style={[
                styles.skillName,
                isVerified && styles.verifiedSkillName
              ]}>
                {skill.name}
              </Text>
              <View style={styles.skillMeta}>
                <Text style={[
                  styles.skillLevel,
                  isVerified && styles.verifiedSkillLevel
                ]}>
                  Level {level}
                </Text>
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
            
            {isVerified ? (
              <View style={styles.endorsementInfo}>
                <Ionicons name="thumbs-up" size={16} color="#fff" />
                <Text style={styles.endorsementCount}>{endorsements}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => handleVerifySkill(skill.id)}
              >
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${progress}%` },
                isVerified && styles.verifiedProgressFill
              ]} />
            </View>
            <Text style={[
              styles.progressText,
              isVerified && styles.verifiedProgressText
            ]}>
              {progress}%
            </Text>
          </View>

          {/* Skill tags */}
          {skill.tags && skill.tags.length > 0 && (
            <View style={styles.skillTags}>
              {skill.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[
                  styles.skillTag,
                  isVerified && styles.verifiedSkillTag
                ]}>
                  <Text style={[
                    styles.skillTagText,
                    isVerified && styles.verifiedSkillTagText
                  ]}>
                    {tag}
                  </Text>
                </View>
              ))}
              {skill.tags.length > 3 && (
                <Text style={[
                  styles.moreTagsText,
                  isVerified && styles.verifiedMoreTagsText
                ]}>
                  +{skill.tags.length - 3} more
                </Text>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Filter tabs
  const FilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'All Skills', count: allSkills.length },
        { key: 'verified', label: 'Verified', count: verifiedSkills.length },
        { key: 'learning', label: 'Learning', count: learningSkills.length }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            viewFilter === tab.key && styles.activeFilterTab
          ]}
          onPress={() => setViewFilter(tab.key)}
        >
          <Text style={[
            styles.filterTabText,
            viewFilter === tab.key && styles.activeFilterTabText
          ]}>
            {tab.label}
          </Text>
          <View style={[
            styles.filterTabBadge,
            viewFilter === tab.key && styles.activeFilterTabBadge
          ]}>
            <Text style={[
              styles.filterTabBadgeText,
              viewFilter === tab.key && styles.activeFilterTabBadgeText
            ]}>
              {tab.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Skill detail modal
  const SkillDetailModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Skill Details</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        {selectedSkill && (
          <View style={styles.modalContent}>
            <View style={styles.skillDetailHeader}>
              <Text style={styles.skillDetailName}>{selectedSkill.name}</Text>
              {selectedSkill.verified && (
                <View style={styles.verifiedBadgeLarge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.verifiedTextLarge}>Verified</Text>
                </View>
              )}
            </View>

            <Text style={styles.skillDescription}>
              {selectedSkill.description || "No description available for this skill."}
            </Text>

            {/* Skill Stats */}
            <View style={styles.skillStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getSkillLevel(selectedSkill.id)}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getSkillProgress(selectedSkill.id)}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedSkill.endorsements || 0}</Text>
                <Text style={styles.statLabel}>Endorsements</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedSkill.tests_passed || 0}</Text>
                <Text style={styles.statLabel}>Tests Passed</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.skillActions}>
              {selectedSkill.verified ? (
                <TouchableOpacity
                  style={styles.endorseButton}
                  onPress={() => handleEndorseSkill(selectedSkill.id)}
                >
                  <Ionicons name="thumbs-up" size={20} color="#fff" />
                  <Text style={styles.endorseButtonText}>Endorse</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.verifyButtonLarge}
                  onPress={() => handleVerifySkill(selectedSkill.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.verifyButtonLargeText}>Take Verification Test</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={() => {
                  Alert.alert('Learn More', 'Navigate to skill learning resources!');
                }}
              >
                <Ionicons name="book-outline" size={20} color="#007AFF" />
                <Text style={styles.learnMoreButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>

            {/* Learning Path */}
            {selectedSkill.learning_path && (
              <View style={styles.learningPath}>
                <Text style={styles.learningPathTitle}>Learning Path</Text>
                {selectedSkill.learning_path.map((step, index) => (
                  <View key={index} style={styles.learningStep}>
                    <View style={[
                      styles.stepIndicator,
                      step.completed && styles.completedStepIndicator
                    ]}>
                      <Text style={[
                        styles.stepNumber,
                        step.completed && styles.completedStepNumber
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[
                      styles.stepTitle,
                      step.completed && styles.completedStepTitle
                    ]}>
                      {step.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <TouchableOpacity
          style={styles.addSkillButton}
          onPress={() => {
            Alert.alert('Add Skill', 'Add new skill functionality coming soon!');
          }}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FilterTabs />

      <FlatList
        data={getFilteredSkills()}
        renderItem={({ item }) => <SkillItem skill={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.skillsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.skillSeparator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No skills found</Text>
            <Text style={styles.emptyStateSubtext}>
              Start learning and add your first skill!
            </Text>
          </View>
        )}
      />

      <SkillDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addSkillButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
  },
  activeFilterTabText: {
    color: '#fff',
  },
  filterTabBadge: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  activeFilterTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  activeFilterTabBadgeText: {
    color: '#fff',
  },
  skillsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skillSeparator: {
    height: 12,
  },
  skillItem: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifiedSkillItem: {
    elevation: 5,
    shadowOpacity: 0.15,
  },
  skillGradient: {
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  verifiedSkillName: {
    color: '#fff',
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  verifiedSkillLevel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  endorsementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  endorsementCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  verifiedProgressFill: {
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  verifiedProgressText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  verifiedSkillTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skillTagText: {
    fontSize: 11,
    color: '#666',
  },
  verifiedSkillTagText: {
    color: '#fff',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  verifiedMoreTagsText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  skillDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  verifiedBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  skillDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  skillStats: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  skillActions: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  endorseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  endorseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  verifyButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  verifyButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  learnMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginLeft: 8,
  },
  learnMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  learningPath: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  learningPathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  learningStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedStepIndicator: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  completedStepNumber: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedStepTitle: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
});

export default SkillsSection;
