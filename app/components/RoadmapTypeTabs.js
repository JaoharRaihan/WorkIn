import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RoadmapTypeTabs = ({ selectedType, onTypeChange, freeCount = 0, premiumCount = 0 }) => {
  const tabs = [
    {
      id: 'free',
      title: 'Basic',
      subtitle: `${freeCount} roadmaps`,
      icon: 'library-outline',
      color: '#007AFF',
      gradient: ['#007AFF', '#0056CC']
    },
    {
      id: 'premium',
      title: 'Enhanced',
      subtitle: `${premiumCount} with external courses`,
      icon: 'diamond-outline',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED']
    }
  ];

  const renderTab = (tab) => {
    const isSelected = selectedType === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tab, isSelected && styles.selectedTab]}
        onPress={() => onTypeChange(tab.id)}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <LinearGradient
            colors={tab.gradient}
            style={styles.selectedTabGradient}
          >
            <View style={styles.tabContent}>
              <Ionicons name={tab.icon.replace('-outline', '')} size={20} color="#fff" />
              <Text style={[styles.tabTitle, styles.selectedTabTitle]}>{tab.title}</Text>
              <Text style={[styles.tabSubtitle, styles.selectedTabSubtitle]}>{tab.subtitle}</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.tabContent}>
            <Ionicons name={tab.icon} size={20} color="#8E8E93" />
            <Text style={styles.tabTitle}>{tab.title}</Text>
            <Text style={styles.tabSubtitle}>{tab.subtitle}</Text>
          </View>
        )}
        
        {tab.id === 'premium' && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
      
      {/* Selection Indicator */}
      <View style={styles.indicatorContainer}>
        <Animated.View 
          style={[
            styles.indicator,
            {
              left: selectedType === 'free' ? '2%' : '52%',
              backgroundColor: selectedType === 'free' ? '#007AFF' : '#FF6B35'
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E8ED',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedTabGradient: {
    flex: 1,
    borderRadius: 8,
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginTop: 4,
  },
  selectedTabTitle: {
    color: '#ffffff',
  },
  tabSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  selectedTabSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1A1D29',
  },
  indicatorContainer: {
    position: 'relative',
    height: 3,
    marginTop: 8,
  },
  indicator: {
    position: 'absolute',
    width: '46%',
    height: 3,
    borderRadius: 1.5,
    transition: 'left 0.3s ease',
  },
});

export default RoadmapTypeTabs;
