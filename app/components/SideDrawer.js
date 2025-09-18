import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SideDrawer = ({ type, visible, onClose, data = [] }) => {
  if (!visible) return null;

  // Mock data moved inside component
  const activeFriends = [
    {
      id: '1',
      name: 'Sarah Chen 🚀',
      avatar: '👩‍💻',
      currentActivity: 'Crushing React Native 💯',
      isOnline: true,
      isFollowing: true
    },
    {
      id: '2',
      name: 'Alex Rodriguez ⭐',
      avatar: '👨‍🎨',
      currentActivity: 'Building fire portfolio 🔥',
      isOnline: false,
      lastSeen: '2h ago',
      isFollowing: true
    },
    {
      id: '3',
      name: 'Emma Davis 💎',
      avatar: '👩‍💼',
      currentActivity: 'Acing JS quiz 📚',
      isOnline: true,
      isFollowing: false
    }
  ];

  const suggestedFriends = [
    {
      id: '4',
      name: 'Mike Johnson 💻',
      avatar: '👨‍💼',
      reason: 'Also coding React magic ⚛️',
    },
    {
      id: '5',
      name: 'Lisa Wang 🌟',
      avatar: '👩‍🔬',
      reason: 'Google engineer vibes ✨',
    },
  ];

  const studyGroups = [
    {
      id: '1',
      name: 'React Squad ⚛️',
      icon: '🚀',
      memberCount: 1234,
      hasNewActivity: true,
    },
    {
      id: '2',
      name: 'Design Gang 🎨',
      icon: '✨',
      memberCount: 567,
      hasNewActivity: false,
    },
  ];

  const recentMessages = [
    {
      id: '1',
      name: 'Sarah Chen 💫',
      avatar: '👩‍💻',
      lastMessage: 'Yo! How did your React test go? 🤔',
      time: '2m',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Alex Rodriguez 🎯',
      avatar: '👨‍🎨',
      lastMessage: 'Wanna collab on that sick project? 🔥',
      time: '1h',
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Emma Davis 💖',
      avatar: '👩‍💼',
      lastMessage: 'Study sesh tonight? Let\'s get it! 💪',
      time: '3h',
      unreadCount: 1,
    },
  ];

  const mentorMessages = [
    {
      id: '1',
      name: 'Dr. Maria Garcia 🏆',
      avatar: '👩‍🏫',
      lastMessage: 'Incredible progress on your roadmap! 🚀',
    },
    {
      id: '2',
      name: 'John Smith 💡',
      avatar: '👨‍💼',
      lastMessage: 'Here\'s some fire Node.js resources 🔥',
    },
  ];

  const groupChats = [
    {
      id: '1',
      name: 'Frontend Squad 💻',
      icon: '🚀',
      lastMessage: 'Anyone down for study session? 📚',
      memberCount: '12',
      isActive: true,
    },
    {
      id: '2',
      name: 'Career Switchers 🔄',
      icon: '💫',
      lastMessage: 'Amazing interview tips dropped! 💯',
      memberCount: '45',
      isActive: false,
    },
  ];

  const renderFriendsDrawer = () => (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>👥 Squad & Connections</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
        {/* Active Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Squad Online</Text>
          {activeFriends.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.friendItem}>
              <Text style={styles.friendAvatar}>{friend.avatar}</Text>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendStatus}>{friend.currentActivity}</Text>
              </View>
              <View style={styles.friendActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="chatbubble" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="videocam" size={16} color="#34C759" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Discover People</Text>
          {suggestedFriends.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.friendItem}>
              <Text style={styles.friendAvatar}>{friend.avatar}</Text>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendReason}>{friend.reason}</Text>
              </View>
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Learning Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Study Squads</Text>
          {studyGroups.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupItem}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>{group.memberCount} members</Text>
              </View>
              <View style={styles.groupStatus}>
                {group.hasNewActivity && <View style={styles.activityDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="person-add" size={20} color="#007AFF" />
          <Text style={styles.footerActionText}>Find Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="people" size={20} color="#007AFF" />
          <Text style={styles.footerActionText}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMessagesDrawer = () => (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>💬 DMs & Chats</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
        {/* Recent Conversations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Recent Convos</Text>
          {recentMessages.map((message) => (
            <TouchableOpacity key={message.id} style={styles.messageItem}>
              <Text style={styles.messageAvatar}>{message.avatar}</Text>
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  <Text style={styles.messageTime}>{message.time}</Text>
                </View>
                <Text style={styles.messagePreview} numberOfLines={1}>
                  {message.lastMessage}
                </Text>
              </View>
              {message.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{message.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Mentor Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Mentor Vibes</Text>
          {mentorMessages.map((message) => (
            <TouchableOpacity key={message.id} style={styles.messageItem}>
              <Text style={styles.messageAvatar}>{message.avatar}</Text>
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  <Text style={styles.mentorBadge}>MENTOR</Text>
                </View>
                <Text style={styles.messagePreview} numberOfLines={1}>
                  {message.lastMessage}
                </Text>
              </View>
              <TouchableOpacity style={styles.quickReplyButton}>
                <Ionicons name="send" size={16} color="#007AFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Group Chats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Squad Chats</Text>
          {groupChats.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.messageItem}>
              <Text style={styles.messageAvatar}>{chat.icon}</Text>
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{chat.name}</Text>
                  <Text style={styles.memberCount}>{chat.memberCount}</Text>
                </View>
                <Text style={styles.messagePreview} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              {chat.isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Message Actions */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="create" size={20} color="#007AFF" />
          <Text style={styles.footerActionText}>New Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="videocam" size={20} color="#007AFF" />
          <Text style={styles.footerActionText}>Video Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: visible ? 1 : 0,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <Animated.View
        style={[
          styles.drawer,
          type === 'friends' ? styles.leftDrawer : styles.rightDrawer,
        ]}
      >
        {type === 'friends' ? renderFriendsDrawer() : renderMessagesDrawer()}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  leftDrawer: {
    left: 0,
  },
  rightDrawer: {
    right: 0,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#f8f9fa',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  drawerBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Friend item styles
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  friendReason: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
  },
  quickAction: {
    padding: 8,
    marginLeft: 4,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Group item styles
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  groupStatus: {
    width: 20,
    alignItems: 'center',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  
  // Message item styles
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  mentorBadge: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  quickReplyButton: {
    padding: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginLeft: 8,
  },
  
  // Footer styles
  drawerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    backgroundColor: '#f8f9fa',
  },
  footerAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  footerActionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SideDrawer;
