import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const TestLeaderboardScreen = () => {
  const navigation = useNavigation();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [userRank, setUserRank] = useState(null);

  const categories = [
    { id: 'overall', name: 'Overall', icon: 'trophy' },
    { id: 'frontend', name: 'Frontend', icon: 'phone-portrait' },
    { id: 'backend', name: 'Backend', icon: 'server' },
    { id: 'programming', name: 'Programming', icon: 'code-slash' },
    { id: 'datascience', name: 'Data Science', icon: 'analytics' },
    { id: 'design', name: 'Design', icon: 'color-palette' }
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      // Mock leaderboard data - in real app, fetch from API
      const mockData = [
        {
          id: 1,
          rank: 1,
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b638b2c6?w=150',
          score: 2847,
          testsCompleted: 18,
          badgesEarned: 12,
          avgScore: 92,
          specialization: 'Full-Stack Developer',
          location: 'San Francisco, CA',
          verified: true,
          recentBadges: ['React Expert', 'Node.js Master', 'Algorithm Pro']
        },
        {
          id: 2,
          rank: 2,
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          score: 2756,
          testsCompleted: 16,
          badgesEarned: 11,
          avgScore: 89,
          specialization: 'Data Scientist',
          location: 'New York, NY',
          verified: true,
          recentBadges: ['Python Expert', 'ML Specialist', 'Data Analyst']
        },
        {
          id: 3,
          rank: 3,
          name: 'Emily Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          score: 2693,
          testsCompleted: 15,
          badgesEarned: 10,
          avgScore: 91,
          specialization: 'Frontend Developer',
          location: 'Austin, TX',
          verified: true,
          recentBadges: ['React Native Pro', 'UI/UX Designer', 'CSS Master']
        },
        {
          id: 4,
          rank: 4,
          name: 'Michael Kim',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          score: 2581,
          testsCompleted: 14,
          badgesEarned: 9,
          avgScore: 87,
          specialization: 'Backend Developer',
          location: 'Seattle, WA',
          verified: false,
          recentBadges: ['Node.js Expert', 'Database Pro', 'API Designer']
        },
        {
          id: 5,
          rank: 5,
          name: 'Jessica Liu',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          score: 2467,
          testsCompleted: 13,
          badgesEarned: 8,
          avgScore: 85,
          specialization: 'DevOps Engineer',
          location: 'Denver, CO',
          verified: true,
          recentBadges: ['Docker Expert', 'Kubernetes Pro', 'CI/CD Master']
        },
        // Current user
        {
          id: 'current-user',
          rank: 28,
          name: 'You',
          avatar: null,
          score: 1834,
          testsCompleted: 8,
          badgesEarned: 5,
          avgScore: 82,
          specialization: 'Frontend Developer',
          location: 'Your Location',
          verified: false,
          isCurrentUser: true,
          recentBadges: ['React Native Basics', 'JavaScript Expert']
        }
      ];
      
      setLeaderboardData(mockData.filter(item => item.id !== 'current-user'));
      setUserRank(mockData.find(item => item.id === 'current-user'));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#8E8E93';
    }
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.activeCategoryTab
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={16} 
        color={selectedCategory === category.id ? '#FFFFFF' : '#8E8E93'} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.activeCategoryText
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <Card style={[
      styles.leaderboardCard,
      item.rank <= 3 && styles.topRankCard
    ]}>
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankText,
          { color: getRankColor(item.rank) }
        ]}>
          {getRankIcon(item.rank)}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Ionicons name="person" size={24} color="#8E8E93" />
            </View>
          )}
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
            )}
          </View>
          <Text style={styles.userSpecialization}>{item.specialization}</Text>
          <Text style={styles.userLocation}>{item.location}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.score.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.testsCompleted}</Text>
          <Text style={styles.statLabel}>Tests</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.badgesEarned}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.avgScore}%</Text>
          <Text style={styles.statLabel}>Avg</Text>
        </View>
      </View>
      
      {item.recentBadges && item.recentBadges.length > 0 && (
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>Recent Badges:</Text>
          <View style={styles.badgesList}>
            {item.recentBadges.slice(0, 3).map((badge, idx) => (
              <Badge key={idx} text={badge} variant="verified" size="small" />
            ))}
          </View>
        </View>
      )}
    </Card>
  );

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
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryTab(item)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {/* User's Current Rank */}
      {userRank && (
        <Card style={styles.userRankCard}>
          <View style={styles.userRankHeader}>
            <Ionicons name="person-circle" size={24} color="#007AFF" />
            <Text style={styles.userRankTitle}>Your Rank</Text>
          </View>
          <View style={styles.userRankInfo}>
            <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
            <View style={styles.userRankStats}>
              <Text style={styles.userRankText}>
                {userRank.score.toLocaleString()} points • {userRank.testsCompleted} tests completed
              </Text>
              <Text style={styles.userRankText}>
                {userRank.badgesEarned} badges earned • {userRank.avgScore}% average score
              </Text>
            </View>
          </View>
        </Card>
      )}
      
      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="podium-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No rankings available</Text>
            <Text style={styles.emptySubtext}>
              Complete some tests to join the leaderboard
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  infoButton: {
    padding: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCategoryTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userRankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  userRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 16,
  },
  userRankStats: {
    flex: 1,
  },
  userRankText: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardCard: {
    marginBottom: 12,
    padding: 16,
  },
  topRankCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  rankContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginRight: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  userSpecialization: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  badgesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  badgesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TestLeaderboardScreen;
