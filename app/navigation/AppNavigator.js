import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Context
import { useApp, APP_MODES } from '../context/AppContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Candidate Screens
import CandidateFeedScreen from '../screens/Candidate/Feed/FeedScreen';
import NewLearnScreen from '../screens/Candidate/Learn/NewLearnScreen';
import CandidateTestsScreen from '../screens/Tests/TestsScreen';
import CandidateProfileScreen from '../screens/Candidate/Profile/ProfileScreen';

// Roadmap Screens
import RoadmapDetailScreen from '../screens/RoadmapDetailScreen';

// Verification Screens
import VerificationDashboardScreen from '../screens/VerificationDashboardScreen';

// Community Screens (integrated into Feed)
import LiveChallengeScreen from '../screens/Candidate/Community/LiveChallengeScreen';
import MentorMarketplaceScreen from '../screens/Candidate/Community/MentorMarketplaceScreen';

// HR Screens
import HRDashboardScreen from '../screens/HR/Dashboard/HRDashboardScreen';
import HRSavedScreen from '../screens/HR/Saved/SavedScreen';
import HRInterviewScreen from '../screens/HR/Interview/InterviewScreen';
import HRCandidateProfileScreen from '../screens/HR/CandidateProfileScreen';

// Test Screens
import TestDetailScreen from '../screens/Tests/TestDetailScreen';
import MCQTestScreen from '../screens/Tests/MCQTestScreen';
import CodingTestScreen from '../screens/Tests/CodingTestScreen';
import ProjectUploadScreen from '../screens/Tests/ProjectUploadScreen';
import TestResultsScreen from '../screens/Tests/TestResultsScreen';
import TestHistoryScreen from '../screens/Tests/TestHistoryScreen';
import TestLeaderboardScreen from '../screens/Tests/TestLeaderboardScreen';
import TestPreparationScreen from '../screens/Tests/TestPreparationScreen';
import TestAnalyticsScreen from '../screens/Tests/TestAnalyticsScreen';
import PreTestScreen from '../screens/Tests/PreTestScreen';

// Shared Screens
import SettingsScreen from '../screens/Shared/SettingsScreen';
import PostCreationScreen from '../screens/Shared/PostCreationScreen';
import GlobalSearchScreen from '../screens/Shared/GlobalSearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Candidate Tab Navigator
function CandidateTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={CandidateFeedScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={NewLearnScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Tests" 
        component={CandidateTestsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "clipboard" : "clipboard-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={CandidateProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// HR Tab Navigator
function HRTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HRDashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={HRSavedScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "bookmark" : "bookmark-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Interview" 
        component={HRInterviewScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, mode } = useApp();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {mode === APP_MODES.CANDIDATE ? (
        <Stack.Screen name="CandidateTabs" component={CandidateTabNavigator} />
      ) : (
        <Stack.Screen name="HRTabs" component={HRTabNavigator} />
      )}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PostCreation" component={PostCreationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
      <Stack.Screen name="RoadmapDetail" component={RoadmapDetailScreen} />
      <Stack.Screen name="VerificationDashboard" component={VerificationDashboardScreen} />

      <Stack.Screen name="LiveChallenge" component={LiveChallengeScreen} />
      <Stack.Screen name="MentorMarketplace" component={MentorMarketplaceScreen} />
      <Stack.Screen name="TestDetail" component={TestDetailScreen} />
      <Stack.Screen name="MCQTest" component={MCQTestScreen} />
      <Stack.Screen name="CodingTest" component={CodingTestScreen} />
      <Stack.Screen name="ProjectUpload" component={ProjectUploadScreen} />
      <Stack.Screen name="TestResults" component={TestResultsScreen} />
      <Stack.Screen name="TestHistory" component={TestHistoryScreen} />
      <Stack.Screen name="TestLeaderboard" component={TestLeaderboardScreen} />
      <Stack.Screen name="TestPreparation" component={TestPreparationScreen} />
      <Stack.Screen name="TestAnalytics" component={TestAnalyticsScreen} />
      <Stack.Screen name="PreTest" component={PreTestScreen} />
    </Stack.Navigator>
  );
}
