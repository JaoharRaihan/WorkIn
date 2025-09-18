import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context
import { AppProvider } from './app/context/AppContext';
import { NotificationProvider } from './app/context/NotificationContext';
import { ProfileProvider } from './app/context/ProfileContext';
import { FeedProvider } from './app/context/FeedContext';
import { HRProvider } from './app/context/HRContext';
import { RoadmapProvider } from './app/context/RoadmapContext';
import { VerificationProvider } from './app/context/VerificationContext';
import { CommunityProvider } from './app/context/CommunityContext';

// Navigation
import AppNavigator from './app/navigation/AppNavigator';
import ErrorBoundary from './app/components/ErrorBoundary';

export default function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <ProfileProvider>
          <FeedProvider>
            <HRProvider>
              <RoadmapProvider>
                <VerificationProvider>
                  <CommunityProvider>
                    <SafeAreaProvider>
                      <NavigationContainer>
                        <ErrorBoundary>
                          <StatusBar style="auto" />
                          <AppNavigator />
                        </ErrorBoundary>
                      </NavigationContainer>
                    </SafeAreaProvider>
                  </CommunityProvider>
                </VerificationProvider>
              </RoadmapProvider>
            </HRProvider>
          </FeedProvider>
        </ProfileProvider>
      </NotificationProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
