import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVerification } from '../context/VerificationContext';
import { useProfile } from '../context/ProfileContext';

const { width } = Dimensions.get('window');

export default function VerificationDashboardScreen({ navigation }) {
  const {
    identityVerification,
    skillVerifications,
    projectVerifications,
    endorsements,
    blockchainCredentials,
    trustScoreBreakdown,
    getTrustScorePercentage,
    getVerificationSummary,
    generateVerificationReport,
  } = useVerification();

  const { profileData } = useProfile();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const trustScore = getTrustScorePercentage();
  const verificationSummary = getVerificationSummary();

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'analytics-outline' },
    { id: 'skills', title: 'Skills', icon: 'checkmark-circle-outline' },
    { id: 'projects', title: 'Projects', icon: 'folder-outline' },
    { id: 'endorsements', title: 'Endorsements', icon: 'people-outline' },
    { id: 'blockchain', title: 'Blockchain', icon: 'cube-outline' },
  ];

  const getTrustLevelInfo = (score) => {
    if (score >= 80) return { level: 'Premium', color: '#34C759', icon: 'shield-checkmark' };
    if (score >= 60) return { level: 'Enhanced', color: '#007AFF', icon: 'shield' };
    if (score >= 40) return { level: 'Basic', color: '#FF9500', icon: 'shield-outline' };
    return { level: 'Unverified', color: '#FF3B30', icon: 'alert-circle-outline' };
  };

  const trustLevelInfo = getTrustLevelInfo(trustScore);

  const handleGenerateReport = (reportType) => {
    const reportHash = generateVerificationReport({
      reportType,
      requestedBy: profileData.id,
      includeDetails: reportType === 'comprehensive',
    });

    Alert.alert(
      'Verification Report Generated',
      `Report ID: ${reportHash}\n\nThis report can be shared with employers to verify your skills and achievements.`,
      [
        { text: 'Share Report', onPress: () => shareVerificationReport(reportHash) },
        { text: 'OK', style: 'default' }
      ]
    );
    setShowReportModal(false);
  };

  const shareVerificationReport = (reportHash) => {
    // In a real app, this would share the report
    Alert.alert('Share Report', `Verification report ${reportHash} would be shared with selected employers.`);
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Trust Score Card */}
      <View style={styles.trustScoreCard}>
        <View style={styles.trustScoreHeader}>
          <Ionicons name={trustLevelInfo.icon} size={32} color={trustLevelInfo.color} />
          <View style={styles.trustScoreInfo}>
            <Text style={styles.trustScoreTitle}>Trust Score</Text>
            <Text style={[styles.trustScoreLevel, { color: trustLevelInfo.color }]}>
              {trustLevelInfo.level}
            </Text>
          </View>
          <Text style={styles.trustScoreValue}>{trustScore}/100</Text>
        </View>
        
        <View style={styles.trustScoreProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${trustScore}%`, backgroundColor: trustLevelInfo.color }]} />
          </View>
        </View>

        <Text style={styles.trustScoreDescription}>
          {trustScore >= 80 ? 'Premium verification level. Highest trust for employers.' :
           trustScore >= 60 ? 'Enhanced verification. Strong credibility for hiring.' :
           trustScore >= 40 ? 'Basic verification. Continue building your profile.' :
           'Build your trust score by completing verifications.'}
        </Text>
      </View>

      {/* Trust Score Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Trust Score Breakdown</Text>
        {Object.entries(trustScoreBreakdown).map(([key, value]) => {
          if (key === 'totalScore') return null;
          const maxValue = key === 'identityVerification' ? 25 :
                          key === 'skillVerifications' ? 30 :
                          key === 'projectVerifications' ? 20 :
                          key === 'peerEndorsements' ? 10 :
                          key === 'mentorEndorsements' ? 10 : 5;
          
          const percentage = (value / maxValue) * 100;
          const categoryName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          return (
            <View key={key} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>{categoryName}</Text>
                <Text style={styles.breakdownValue}>{value}/{maxValue}</Text>
              </View>
              <View style={styles.breakdownProgress}>
                <View style={[styles.breakdownFill, { width: `${percentage}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.statValue}>{skillVerifications.length}</Text>
          <Text style={styles.statLabel}>Skills Verified</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="folder" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{projectVerifications.length}</Text>
          <Text style={styles.statLabel}>Projects Verified</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#FF9500" />
          <Text style={styles.statValue}>{endorsements.peer.length + endorsements.mentor.length}</Text>
          <Text style={styles.statLabel}>Endorsements</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cube" size={24} color="#5856D6" />
          <Text style={styles.statValue}>{blockchainCredentials.length}</Text>
          <Text style={styles.statLabel}>Blockchain Verified</Text>
        </View>
      </View>

      {/* Generate Report Button */}
      <TouchableOpacity style={styles.generateReportButton} onPress={() => setShowReportModal(true)}>
        <Ionicons name="document-text" size={20} color="#fff" />
        <Text style={styles.generateReportText}>Generate Verification Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSkillsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Skill Verifications</Text>
      {skillVerifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No skill verifications yet</Text>
          <Text style={styles.emptySubtext}>Complete tests and projects to verify your skills</Text>
        </View>
      ) : (
        skillVerifications.map((verification) => (
          <TouchableOpacity
            key={verification.id}
            style={styles.verificationCard}
            onPress={() => {
              setSelectedVerification(verification);
              setShowDetailModal(true);
            }}
          >
            <View style={styles.verificationHeader}>
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>{verification.skillName}</Text>
                <Text style={styles.verificationMethod}>
                  Verified via {verification.verificationMethod}
                </Text>
              </View>
              <View style={styles.verificationLevel}>
                <Text style={[
                  styles.levelBadge,
                  { 
                    backgroundColor: verification.verificationLevel === 'expert' ? '#34C759' :
                                   verification.verificationLevel === 'advanced' ? '#007AFF' : '#FF9500'
                  }
                ]}>
                  {verification.verificationLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.verificationScore}>
              <Text style={styles.scoreText}>Score: {verification.score}/{verification.maxScore}</Text>
              <Text style={styles.verificationDate}>
                {new Date(verification.verifiedAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderProjectsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Project Verifications</Text>
      {projectVerifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No project verifications yet</Text>
          <Text style={styles.emptySubtext}>Submit projects for peer and mentor review</Text>
        </View>
      ) : (
        projectVerifications.map((verification) => (
          <TouchableOpacity
            key={verification.id}
            style={styles.verificationCard}
            onPress={() => {
              setSelectedVerification(verification);
              setShowDetailModal(true);
            }}
          >
            <View style={styles.verificationHeader}>
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>{verification.projectTitle}</Text>
                <Text style={styles.verificationMethod}>
                  Reviewed by {verification.reviewedBy}
                </Text>
              </View>
            </View>
            <View style={styles.verificationScore}>
              <Text style={styles.scoreText}>Score: {verification.score}/{verification.maxScore}</Text>
              <Text style={styles.verificationDate}>
                {new Date(verification.verifiedAt).toLocaleDateString()}
              </Text>
            </View>
            {verification.feedback && (
              <Text style={styles.feedbackText} numberOfLines={2}>
                "{verification.feedback}"
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderEndorsementsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Endorsements</Text>
      
      {/* Mentor Endorsements */}
      <Text style={styles.sectionTitle}>Mentor Endorsements</Text>
      {endorsements.mentor.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptySubtext}>No mentor endorsements yet</Text>
        </View>
      ) : (
        endorsements.mentor.map((endorsement) => (
          <View key={endorsement.id} style={styles.endorsementCard}>
            <View style={styles.endorsementHeader}>
              <Ionicons name="school" size={20} color="#34C759" />
              <View style={styles.endorserInfo}>
                <Text style={styles.endorserName}>{endorsement.mentorName}</Text>
                <Text style={styles.endorserTitle}>{endorsement.mentorCredentials}</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={12}
                    color={i < endorsement.rating ? '#FFD700' : '#e0e0e0'}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.skillEndorsed}>{endorsement.skillName}</Text>
            <Text style={styles.endorsementText}>"{endorsement.endorsementText}"</Text>
            <Text style={styles.endorsementDate}>
              {new Date(endorsement.endorsedAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}

      {/* Peer Endorsements */}
      <Text style={styles.sectionTitle}>Peer Endorsements</Text>
      {endorsements.peer.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptySubtext}>No peer endorsements yet</Text>
        </View>
      ) : (
        endorsements.peer.map((endorsement) => (
          <View key={endorsement.id} style={styles.endorsementCard}>
            <View style={styles.endorsementHeader}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <View style={styles.endorserInfo}>
                <Text style={styles.endorserName}>{endorsement.endorserName}</Text>
                <Text style={styles.endorserTitle}>{endorsement.relationship}</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={12}
                    color={i < endorsement.rating ? '#FFD700' : '#e0e0e0'}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.skillEndorsed}>{endorsement.skillName}</Text>
            <Text style={styles.endorsementText}>"{endorsement.endorsementText}"</Text>
            <Text style={styles.endorsementDate}>
              {new Date(endorsement.endorsedAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderBlockchainTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Blockchain Credentials</Text>
      {blockchainCredentials.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No blockchain credentials yet</Text>
          <Text style={styles.emptySubtext}>Complete advanced verifications to earn blockchain credentials</Text>
        </View>
      ) : (
        blockchainCredentials.map((credential) => (
          <View key={credential.id} style={styles.blockchainCard}>
            <View style={styles.blockchainHeader}>
              <Ionicons name="cube" size={24} color="#5856D6" />
              <View style={styles.blockchainInfo}>
                <Text style={styles.blockchainTitle}>{credential.credentialType}</Text>
                <Text style={styles.blockchainIssuer}>Issued by {credential.issuer}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            </View>
            <View style={styles.blockchainDetails}>
              <Text style={styles.blockchainNetwork}>Network: {credential.blockchainNetwork}</Text>
              <Text style={styles.blockchainHash} numberOfLines={1}>
                Hash: {credential.transactionHash}
              </Text>
              <Text style={styles.blockchainDate}>
                Verified: {new Date(credential.verifiedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'skills': return renderSkillsTab();
      case 'projects': return renderProjectsTab();
      case 'endorsements': return renderEndorsementsTab();
      case 'blockchain': return renderBlockchainTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Center</Text>
        <TouchableOpacity onPress={() => setShowReportModal(true)}>
          <Ionicons name="document-text-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={selectedTab === tab.id ? '#007AFF' : '#666'}
              />
              <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Report Generation Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Generate Report</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Generate a verification report to share with employers and demonstrate your verified skills and achievements.
            </Text>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => handleGenerateReport('summary')}
            >
              <Ionicons name="document-outline" size={24} color="#007AFF" />
              <View style={styles.reportOptionInfo}>
                <Text style={styles.reportOptionTitle}>Summary Report</Text>
                <Text style={styles.reportOptionDescription}>
                  Quick overview of verification status and trust score
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => handleGenerateReport('comprehensive')}
            >
              <Ionicons name="documents" size={24} color="#34C759" />
              <View style={styles.reportOptionInfo}>
                <Text style={styles.reportOptionTitle}>Comprehensive Report</Text>
                <Text style={styles.reportOptionDescription}>
                  Detailed verification records, scores, and endorsements
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Verification Details</Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedVerification && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.detailTitle}>
                {selectedVerification.skillName || selectedVerification.projectTitle}
              </Text>
              <Text style={styles.detailMethod}>
                Verified via {selectedVerification.verificationMethod || selectedVerification.method}
              </Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Score</Text>
                <Text style={styles.detailText}>
                  {selectedVerification.score}/{selectedVerification.maxScore} 
                  ({Math.round((selectedVerification.score / selectedVerification.maxScore) * 100)}%)
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Verified By</Text>
                <Text style={styles.detailText}>
                  {selectedVerification.verifiedBy || selectedVerification.reviewedBy}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Date</Text>
                <Text style={styles.detailText}>
                  {new Date(selectedVerification.verifiedAt).toLocaleDateString()}
                </Text>
              </View>

              {selectedVerification.feedback && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Feedback</Text>
                  <Text style={styles.detailText}>{selectedVerification.feedback}</Text>
                </View>
              )}

              {selectedVerification.evidence && selectedVerification.evidence.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Evidence</Text>
                  {selectedVerification.evidence.map((item, index) => (
                    <Text key={index} style={styles.evidenceItem}>• {item}</Text>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  trustScoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustScoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trustScoreTitle: {
    fontSize: 16,
    color: '#666',
  },
  trustScoreLevel: {
    fontSize: 20,
    fontWeight: '700',
  },
  trustScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  trustScoreProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  trustScoreDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  breakdownProgress: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  generateReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  generateReportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptySection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  verificationMethod: {
    fontSize: 14,
    color: '#666',
  },
  verificationLevel: {
    marginLeft: 12,
  },
  levelBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  verificationScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  verificationDate: {
    fontSize: 12,
    color: '#999',
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  endorsementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  endorsementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  endorserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  endorserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  endorserTitle: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  skillEndorsed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  endorsementText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  endorsementDate: {
    fontSize: 12,
    color: '#999',
  },
  blockchainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#5856D6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockchainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  blockchainIssuer: {
    fontSize: 14,
    color: '#666',
  },
  blockchainDetails: {
    marginTop: 8,
  },
  blockchainNetwork: {
    fontSize: 12,
    color: '#5856D6',
    marginBottom: 4,
  },
  blockchainHash: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  blockchainDate: {
    fontSize: 12,
    color: '#999',
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportOptionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  reportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reportOptionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  detailMethod: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  evidenceItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
