import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Components
import Card from '../../../components/Card';

// Context
import { useApp } from '../../../context/AppContext';
import { useProfile } from '../../../context/ProfileContext';

const ProfileScreen = ({ navigation }) => {
  const { user } = useApp();
  const { stats, badges } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  // Mock user data
  const mockUser = {
    id: 1,
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    avatar: 'https://via.placeholder.com/100x100/007AFF/ffffff?text=JD',
    title: 'Full Stack Developer',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    bio: 'Passionate developer with expertise in React, Node.js, and mobile development. Always eager to learn new technologies and solve complex problems.',
  };

  const mockStats = {
    testsCompleted: 15,
    skillsVerified: 8,
    projectsSubmitted: 5,
    totalXP: 2450,
    rank: 'Advanced',
    streak: 12,
  };

  const mockSkills = [
    { name: 'JavaScript', level: 85, verified: true },
    { name: 'React', level: 90, verified: true },
    { name: 'Node.js', level: 80, verified: true },
    { name: 'Python', level: 75, verified: false },
    { name: 'UI/UX Design', level: 70, verified: false },
  ];

  const mockBadges = [
    { id: 1, name: 'JavaScript Expert', icon: 'code', color: '#F7DF1E', earned: true },
    { id: 2, name: 'React Master', icon: 'layers', color: '#61DAFB', earned: true },
    { id: 3, name: 'Problem Solver', icon: 'puzzle', color: '#4CAF50', earned: true },
    { id: 4, name: 'Team Player', icon: 'people', color: '#FF9800', earned: false },
  ];

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewTests = () => {
    navigation.navigate('TestHistory');
  };

  const handleViewProjects = () => {
    navigation.navigate('Projects');
  };

  const renderProfileHeader = () => (
    <Card style={styles.headerCard}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.title}>{mockUser.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.location}>{mockUser.location}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.bio}>{mockUser.bio}</Text>
    </Card>
  );

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockStats.testsCompleted}</Text>
          <Text style={styles.statLabel}>Tests Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockStats.skillsVerified}</Text>
          <Text style={styles.statLabel}>Skills Verified</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockStats.projectsSubmitted}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockStats.totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>
    </Card>
  );

  const renderSkillsSection = () => (
    <Card style={styles.skillsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {mockSkills.slice(0, 3).map((skill, index) => (
        <View key={index} style={styles.skillItem}>
          <View style={styles.skillHeader}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.skillMeta}>
              <Text style={styles.skillLevel}>{skill.level}%</Text>
              {skill.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              )}
            </View>
          </View>
          <View style={styles.skillBar}>
            <View
              style={[
                styles.skillProgress,
                { width: `${skill.level}%` }
              ]}
            />
          </View>
        </View>
      ))}
    </Card>
  );

  const renderBadgesSection = () => (
    <Card style={styles.badgesCard}>
      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgesGrid}>
        {mockBadges.map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badgeItem,
              !badge.earned && styles.badgeItemDisabled
            ]}
          >
            <View
              style={[
                styles.badgeIcon,
                { backgroundColor: badge.earned ? badge.color + '20' : '#f0f0f0' }
              ]}
            >
              <FontAwesome5
                name={badge.icon}
                size={20}
                color={badge.earned ? badge.color : '#ccc'}
              />
            </View>
            <Text
              style={[
                styles.badgeName,
                !badge.earned && styles.badgeNameDisabled
              ]}
            >
              {badge.name}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionItem} onPress={handleViewTests}>
          <Ionicons name="clipboard-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Test History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={handleViewProjects}>
          <Ionicons name="folder-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('Verification')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Verify Skills</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderStatsOverview()}
        {renderSkillsSection()}
        {renderBadgesSection()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerCard: {
    marginBottom: 15,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCard: {
    marginBottom: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  skillsCard: {
    marginBottom: 15,
    padding: 20,
  },
  skillItem: {
    marginBottom: 15,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  skillBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  badgesCard: {
    marginBottom: 15,
    padding: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeItemDisabled: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  badgeNameDisabled: {
    color: '#ccc',
  },
  actionsCard: {
    marginBottom: 15,
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default ProfileScreen;
