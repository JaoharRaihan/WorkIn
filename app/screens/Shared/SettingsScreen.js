import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import Card from '../../components/Card';
import Button from '../../components/Button';

// Context
import { useApp, APP_MODES } from '../../context/AppContext';

const SettingsScreen = ({ navigation }) => {
  const { user, switchMode, mode, logout } = useApp();

  const handleModeSwitch = () => {
    const newMode = mode === APP_MODES.CANDIDATE ? APP_MODES.HR : APP_MODES.CANDIDATE;
    switchMode(newMode);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support feature coming soon!');
  };

  const handleAbout = () => {
    Alert.alert(
      'About SkillNet',
      'SkillNet v1.0.0\n\nA learning and verified hiring social platform connecting candidates and HR/recruiters.\n\nBuilt with React Native'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Account Section */}
        <Card title="Account" style={styles.sectionCard}>
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.currentMode}>
                Current Mode: {mode === APP_MODES.CANDIDATE ? 'Candidate' : 'HR/Recruiter'}
              </Text>
            </View>
          </View>
          
          <View style={styles.accountActions}>
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={handleEditProfile}
              style={styles.accountButton}
            />
            <Button
              title={`Switch to ${mode === APP_MODES.CANDIDATE ? 'HR' : 'Candidate'} Mode`}
              variant="primary"
              onPress={handleModeSwitch}
              style={styles.accountButton}
            />
          </View>
        </Card>

        {/* Preferences Section */}
        <Card title="Preferences" style={styles.sectionCard}>
          <View style={styles.preferencesList}>
            <Button
              title="Notifications"
              variant="secondary"
              onPress={handleNotifications}
              style={styles.preferenceButton}
            />
            <Button
              title="Privacy Settings"
              variant="secondary"
              onPress={handlePrivacy}
              style={styles.preferenceButton}
            />
          </View>
        </Card>

        {/* Mode-specific Settings */}
        {mode === APP_MODES.CANDIDATE ? (
          <Card title="Candidate Settings" style={styles.sectionCard}>
            <View style={styles.preferencesList}>
              <Button
                title="Learning Preferences"
                variant="secondary"
                onPress={() => Alert.alert('Learning', 'Learning preferences coming soon!')}
                style={styles.preferenceButton}
              />
              <Button
                title="Profile Visibility"
                variant="secondary"
                onPress={() => Alert.alert('Visibility', 'Profile visibility settings coming soon!')}
                style={styles.preferenceButton}
              />
              <Button
                title="Job Alerts"
                variant="secondary"
                onPress={() => Alert.alert('Alerts', 'Job alerts settings coming soon!')}
                style={styles.preferenceButton}
              />
            </View>
          </Card>
        ) : (
          <Card title="HR Settings" style={styles.sectionCard}>
            <View style={styles.preferencesList}>
              <Button
                title="Search Preferences"
                variant="secondary"
                onPress={() => Alert.alert('Search', 'Search preferences coming soon!')}
                style={styles.preferenceButton}
              />
              <Button
                title="Candidate Filters"
                variant="secondary"
                onPress={() => Alert.alert('Filters', 'Candidate filters coming soon!')}
                style={styles.preferenceButton}
              />
              <Button
                title="Company Profile"
                variant="secondary"
                onPress={() => Alert.alert('Company', 'Company profile settings coming soon!')}
                style={styles.preferenceButton}
              />
            </View>
          </Card>
        )}

        {/* Support Section */}
        <Card title="Support & Info" style={styles.sectionCard}>
          <View style={styles.preferencesList}>
            <Button
              title="Help & Support"
              variant="secondary"
              onPress={handleSupport}
              style={styles.preferenceButton}
            />
            <Button
              title="About SkillNet"
              variant="secondary"
              onPress={handleAbout}
              style={styles.preferenceButton}
            />
          </View>
        </Card>

        {/* Logout */}
        <Card style={styles.logoutCard}>
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
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
  sectionCard: {
    marginHorizontal: 0,
    marginBottom: 20,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  currentMode: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  accountActions: {
    gap: 12,
  },
  accountButton: {
    marginBottom: 0,
  },
  preferencesList: {
    gap: 12,
  },
  preferenceButton: {
    marginBottom: 0,
  },
  logoutCard: {
    marginHorizontal: 0,
    marginBottom: 20,
  },
  logoutButton: {
    marginBottom: 0,
  },
});

export default SettingsScreen;
