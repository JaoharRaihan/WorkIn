import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useVerification } from '../../context/VerificationContext';
import { useProfile } from '../../context/ProfileContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ComprehensiveVerificationScreen({ navigation }) {
  const {
    verificationRequests,
    verificationHistory,
    availableVerifications,
    submitVerificationRequest,
    uploadVerificationEvidence,
    getVerificationStatus,
    loading,
  } = useVerification();

  const { user, skills, projects, badges } = useProfile();

  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    evidence: '',
    description: '',
    additionalNotes: '',
  });

  const verificationTypes = [
    {
      id: 'skill',
      title: 'Skill Verification',
      description: 'Verify your technical skills through practical assessments',
      icon: 'code',
      color: '#007AFF',
      available: skills.length > 0,
    },
    {
      id: 'project',
      title: 'Project Verification',
      description: 'Verify your projects through code review and demonstration',
      icon: 'folder-open',
      color: '#4CAF50',
      available: projects.length > 0,
    },
    {
      id: 'experience',
      title: 'Experience Verification',
      description: 'Verify your work experience through employer confirmation',
      icon: 'briefcase',
      color: '#FF6B35',
      available: true,
    },
    {
      id: 'education',
      title: 'Education Verification',
      description: 'Verify your educational background and certifications',
      icon: 'graduation-cap',
      color: '#9C27B0',
      available: true,
    },
    {
      id: 'achievement',
      title: 'Achievement Verification',
      description: 'Verify your awards, certifications, and achievements',
      icon: 'trophy',
      color: '#FFD700',
      available: badges.length > 0,
    },
  ];

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      case 'in_review': return '#2196F3';
      default: return '#666';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      case 'in_review': return 'search';
      default: return 'help-circle';
    }
  };

  const handleVerificationRequest = (verificationType) => {
    setSelectedVerification(verificationType);
    setShowSubmissionModal(true);
  };

  const submitVerification = async () => {
    if (!selectedVerification || !submissionData.description.trim()) {
      Alert.alert('Error', 'Please provide all required information');
      return;
    }

    try {
      await submitVerificationRequest({
        type: selectedVerification.id,
        userId: user.id,
        ...submissionData,
      });

      Alert.alert(
        'Success',
        'Verification request submitted successfully! We will review it within 3-5 business days.',
        [{ text: 'OK', onPress: () => setShowSubmissionModal(false) }]
      );

      // Reset form
      setSubmissionData({
        evidence: '',
        description: '',
        additionalNotes: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit verification request. Please try again.');
    }
  };

  const renderVerificationCard = (verification) => {
    const userVerification = verificationHistory.find(v => v.type === verification.id);
    const status = userVerification?.status || 'not_started';

    return (
      <TouchableOpacity
        key={verification.id}
        style={[
          styles.verificationCard,
          !verification.available && styles.disabledCard
        ]}
        onPress={() => verification.available && handleVerificationRequest(verification)}
        disabled={!verification.available || status === 'verified'}
      >
        <LinearGradient
          colors={[verification.color + '20', verification.color + '05']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: verification.color + '20' }]}>
              <FontAwesome5 name={verification.icon} size={24} color={verification.color} />
            </View>
            <View style={styles.cardStatus}>
              <Ionicons 
                name={getVerificationStatusIcon(status)} 
                size={16} 
                color={getVerificationStatusColor(status)} 
              />
              <Text style={[styles.statusText, { color: getVerificationStatusColor(status) }]}>
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{verification.title}</Text>
          <Text style={styles.cardDescription}>{verification.description}</Text>

          {!verification.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>
                Complete your profile to enable this verification
              </Text>
            </View>
          )}

          {status === 'verified' && userVerification && (
            <View style={styles.verifiedInfo}>
              <Text style={styles.verifiedText}>
                ✓ Verified on {new Date(userVerification.verifiedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.verifierText}>
                Verified by {userVerification.verifier}
              </Text>
            </View>
          )}

          {status === 'pending' && (
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingText}>
                📋 Submitted on {new Date(userVerification.submittedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.pendingSubtext}>
                Review in progress...
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSubmissionModal = () => (
    <Modal
      visible={showSubmissionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSubmissionModal(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {selectedVerification?.title} Request
          </Text>
          <TouchableOpacity
            style={styles.modalSubmitButton}
            onPress={submitVerification}
          >
            <Text style={styles.modalSubmitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={styles.formTextArea}
              multiline
              numberOfLines={4}
              value={submissionData.description}
              onChangeText={(text) => setSubmissionData(prev => ({ ...prev, description: text }))}
              placeholder="Describe what you want to verify and why..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Evidence Links</Text>
            <TextInput
              style={styles.formInput}
              value={submissionData.evidence}
              onChangeText={(text) => setSubmissionData(prev => ({ ...prev, evidence: text }))}
              placeholder="Links to portfolio, GitHub, certificates, etc."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Additional Notes</Text>
            <TextInput
              style={styles.formTextArea}
              multiline
              numberOfLines={3}
              value={submissionData.additionalNotes}
              onChangeText={(text) => setSubmissionData(prev => ({ ...prev, additionalNotes: text }))}
              placeholder="Any additional information you'd like to provide..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>Verification Guidelines</Text>
            {selectedVerification?.id === 'skill' && (
              <View style={styles.guidelinesList}>
                <Text style={styles.guideline}>• Provide links to projects demonstrating the skill</Text>
                <Text style={styles.guideline}>• Include relevant certifications or courses</Text>
                <Text style={styles.guideline}>• Be specific about your experience level</Text>
                <Text style={styles.guideline}>• Mention any professional use of the skill</Text>
              </View>
            )}
            {selectedVerification?.id === 'project' && (
              <View style={styles.guidelinesList}>
                <Text style={styles.guideline}>• Provide GitHub repository or live demo links</Text>
                <Text style={styles.guideline}>• Explain your role and contributions</Text>
                <Text style={styles.guideline}>• Include technical details and challenges overcome</Text>
                <Text style={styles.guideline}>• Mention technologies and tools used</Text>
              </View>
            )}
            {selectedVerification?.id === 'experience' && (
              <View style={styles.guidelinesList}>
                <Text style={styles.guideline}>• Provide company details and your role</Text>
                <Text style={styles.guideline}>• Include employment dates and duration</Text>
                <Text style={styles.guideline}>• Describe key responsibilities and achievements</Text>
                <Text style={styles.guideline}>• Provide contact information for verification</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Build Trust & Credibility</Text>
          <Text style={styles.introText}>
            Verify your skills, projects, and experience to increase your hirability score 
            and stand out to potential employers.
          </Text>
        </View>

        <View style={styles.verificationsSection}>
          <Text style={styles.sectionTitle}>Available Verifications</Text>
          {verificationTypes.map(renderVerificationCard)}
        </View>

        {verificationHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Verification History</Text>
            {verificationHistory.map((verification, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons 
                    name={getVerificationStatusIcon(verification.status)} 
                    size={16} 
                    color={getVerificationStatusColor(verification.status)} 
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>
                    {verification.type.replace('_', ' ').toUpperCase()} Verification
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </Text>
                  {verification.feedback && (
                    <Text style={styles.historyFeedback}>{verification.feedback}</Text>
                  )}
                </View>
                <View style={[styles.historyStatus, { backgroundColor: getVerificationStatusColor(verification.status) + '20' }]}>
                  <Text style={[styles.historyStatusText, { color: getVerificationStatusColor(verification.status) }]}>
                    {verification.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {renderSubmissionModal()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verificationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  verificationCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardGradient: {
    padding: 16,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  unavailableText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  verifiedInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  verifierText: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
  },
  pendingInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  pendingSubtext: {
    fontSize: 10,
    color: '#FF9800',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
  },
  guidelinesSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  guidelinesList: {
    marginLeft: 8,
  },
  guideline: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyFeedback: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
