import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useProfile } from '../context/ProfileContext';
import { useProfileHooks } from '../hooks/useProfileHooks';

const ProjectsPortfolio = () => {
  const { profileData } = useProfile();
  const { useProjects } = useProfileHooks();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewFilter, setViewFilter] = useState('all'); // all, featured, completed, in-progress
  
  const {
    featuredProjects,
    completedProjects,
    inProgressProjects,
    allProjects,
    getProjectStatus,
    getProjectTechStack
  } = useProjects();

  // Filter projects based on current view
  const getFilteredProjects = () => {
    switch (viewFilter) {
      case 'featured':
        return featuredProjects;
      case 'completed':
        return completedProjects;
      case 'in-progress':
        return inProgressProjects;
      default:
        return allProjects;
    }
  };

  // Handle project press
  const handleProjectPress = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  // Handle external links
  const handleOpenLink = (url, linkType) => {
    if (!url) {
      Alert.alert('Link Not Available', `${linkType} link is not available for this project.`);
      return;
    }
    
    Alert.alert(
      `Open ${linkType}`,
      `Open ${linkType.toLowerCase()} in external browser?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', style: 'default', onPress: () => Linking.openURL(url) }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'planned':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'time';
      case 'planned':
        return 'calendar-outline';
      default:
        return 'code-slash';
    }
  };

  // Project item component
  const ProjectItem = ({ project }) => {
    const status = getProjectStatus(project.id);
    const techStack = getProjectTechStack(project.id);
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);

    return (
      <TouchableOpacity 
        style={[
          styles.projectItem,
          project.featured && styles.featuredProjectItem
        ]}
        onPress={() => handleProjectPress(project)}
      >
        {project.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        {/* Project Image/Preview */}
        <View style={styles.projectImageContainer}>
          {project.image ? (
            <Image source={{ uri: project.image }} style={styles.projectImage} />
          ) : (
            <View style={styles.projectImagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#ccc" />
            </View>
          )}
          
          <View style={styles.projectImageOverlay}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Ionicons name={statusIcon} size={12} color="#fff" />
              <Text style={styles.statusText}>{status.replace('-', ' ')}</Text>
            </View>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>

          {/* Tech Stack */}
          <View style={styles.techStack}>
            {techStack.slice(0, 3).map((tech, index) => (
              <View key={index} style={styles.techTag}>
                <Text style={styles.techTagText}>{tech}</Text>
              </View>
            ))}
            {techStack.length > 3 && (
              <Text style={styles.moreTechText}>+{techStack.length - 3}</Text>
            )}
          </View>

          {/* Project Stats */}
          <View style={styles.projectStats}>
            {project.github_stars && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.statText}>{project.github_stars}</Text>
              </View>
            )}
            {project.live_demo && (
              <View style={styles.statItem}>
                <Ionicons name="globe" size={14} color="#4CAF50" />
                <Text style={styles.statText}>Live</Text>
              </View>
            )}
            {project.verified && (
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.statText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.projectActions}>
          {project.github_url && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenLink(project.github_url, 'GitHub')}
            >
              <Ionicons name="logo-github" size={16} color="#333" />
            </TouchableOpacity>
          )}
          {project.live_demo && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenLink(project.live_demo, 'Live Demo')}
            >
              <Ionicons name="globe" size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Filter tabs
  const FilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'All', count: allProjects.length },
        { key: 'featured', label: 'Featured', count: featuredProjects.length },
        { key: 'completed', label: 'Completed', count: completedProjects.length },
        { key: 'in-progress', label: 'Active', count: inProgressProjects.length }
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

  // Project detail modal
  const ProjectDetailModal = () => (
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
          <Text style={styles.modalTitle}>Project Details</Text>
          <View style={styles.modalPlaceholder} />
        </View>

        {selectedProject && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Project Hero Image */}
            <View style={styles.projectHeroContainer}>
              {selectedProject.image ? (
                <Image source={{ uri: selectedProject.image }} style={styles.projectHeroImage} />
              ) : (
                <View style={styles.projectHeroPlaceholder}>
                  <Ionicons name="image-outline" size={64} color="#ccc" />
                  <Text style={styles.heroPlaceholderText}>No preview available</Text>
                </View>
              )}
              
              {selectedProject.featured && (
                <View style={styles.featuredBadgeLarge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.featuredTextLarge}>Featured Project</Text>
                </View>
              )}
            </View>

            {/* Project Header */}
            <View style={styles.projectDetailHeader}>
              <Text style={styles.projectDetailTitle}>{selectedProject.title}</Text>
              <View style={[
                styles.statusBadgeLarge,
                { backgroundColor: getStatusColor(getProjectStatus(selectedProject.id)) }
              ]}>
                <Ionicons 
                  name={getStatusIcon(getProjectStatus(selectedProject.id))} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.statusTextLarge}>
                  {getProjectStatus(selectedProject.id).replace('-', ' ')}
                </Text>
              </View>
            </View>

            {/* Project Description */}
            <Text style={styles.projectDetailDescription}>
              {selectedProject.description}
            </Text>

            {/* Key Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Key Features</Text>
                {selectedProject.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tech Stack */}
            <View style={styles.techStackSection}>
              <Text style={styles.sectionTitle}>Technologies Used</Text>
              <View style={styles.techStackGrid}>
                {getProjectTechStack(selectedProject.id).map((tech, index) => (
                  <View key={index} style={styles.techStackItem}>
                    <Text style={styles.techStackItemText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Project Links */}
            <View style={styles.projectLinks}>
              <Text style={styles.sectionTitle}>Project Links</Text>
              <View style={styles.linksGrid}>
                {selectedProject.github_url && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleOpenLink(selectedProject.github_url, 'GitHub')}
                  >
                    <Ionicons name="logo-github" size={20} color="#333" />
                    <Text style={styles.linkButtonText}>View Code</Text>
                  </TouchableOpacity>
                )}
                
                {selectedProject.live_demo && (
                  <TouchableOpacity
                    style={[styles.linkButton, styles.liveDemoButton]}
                    onPress={() => handleOpenLink(selectedProject.live_demo, 'Live Demo')}
                  >
                    <Ionicons name="globe" size={20} color="#fff" />
                    <Text style={[styles.linkButtonText, styles.liveDemoButtonText]}>
                      Live Demo
                    </Text>
                  </TouchableOpacity>
                )}
                
                {selectedProject.documentation && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleOpenLink(selectedProject.documentation, 'Documentation')}
                  >
                    <Ionicons name="document-text" size={20} color="#007AFF" />
                    <Text style={[styles.linkButtonText, { color: '#007AFF' }]}>
                      Documentation
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Project Stats */}
            {(selectedProject.github_stars || selectedProject.completion_date || selectedProject.team_size) && (
              <View style={styles.projectStatsSection}>
                <Text style={styles.sectionTitle}>Project Statistics</Text>
                <View style={styles.statsGrid}>
                  {selectedProject.github_stars && (
                    <View style={styles.statCard}>
                      <Ionicons name="star" size={24} color="#FFD700" />
                      <Text style={styles.statValue}>{selectedProject.github_stars}</Text>
                      <Text style={styles.statLabel}>GitHub Stars</Text>
                    </View>
                  )}
                  
                  {selectedProject.completion_date && (
                    <View style={styles.statCard}>
                      <Ionicons name="calendar" size={24} color="#4CAF50" />
                      <Text style={styles.statValue}>
                        {new Date(selectedProject.completion_date).getFullYear()}
                      </Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                  )}
                  
                  {selectedProject.team_size && (
                    <View style={styles.statCard}>
                      <Ionicons name="people" size={24} color="#2196F3" />
                      <Text style={styles.statValue}>{selectedProject.team_size}</Text>
                      <Text style={styles.statLabel}>Team Size</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Achievement Badge */}
            {selectedProject.verified && (
              <View style={styles.achievementSection}>
                <View style={styles.achievementBadge}>
                  <Ionicons name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.achievementTitle}>Verified Project</Text>
                  <Text style={styles.achievementDescription}>
                    This project has been verified through code review and testing
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Projects Portfolio</Text>
        <TouchableOpacity
          style={styles.addProjectButton}
          onPress={() => {
            Alert.alert('Add Project', 'Upload new project functionality coming soon!');
          }}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FilterTabs />

      <FlatList
        data={getFilteredProjects()}
        renderItem={({ item }) => <ProjectItem project={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.projectsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.projectSeparator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No projects found</Text>
            <Text style={styles.emptyStateSubtext}>
              Start building and showcase your work!
            </Text>
          </View>
        )}
      />

      <ProjectDetailModal />
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
  addProjectButton: {
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
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectSeparator: {
    height: 16,
  },
  projectItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredProjectItem: {
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 6,
    shadowOpacity: 0.15,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  projectImageContainer: {
    position: 'relative',
    height: 120,
  },
  projectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectImageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  techTag: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  techTagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  moreTechText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
  },
  projectHeroContainer: {
    position: 'relative',
    height: 200,
  },
  projectHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectHeroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  featuredBadgeLarge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featuredTextLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  projectDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  projectDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  projectDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  techStackSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  techStackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techStackItem: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  techStackItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  projectLinks: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  liveDemoButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  liveDemoButtonText: {
    color: '#fff',
  },
  projectStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ProjectsPortfolio;
