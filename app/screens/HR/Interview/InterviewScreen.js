import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';

const InterviewScreen = () => {
  const [interviewRequests, setInterviewRequests] = useState([
    {
      id: 1,
      candidateName: 'Sarah Johnson',
      candidateId: 1,
      position: 'React Native Developer',
      requestDate: '2024-08-28',
      status: 'pending',
      scheduledDate: null,
      skills: ['React Native', 'JavaScript', 'UI/UX'],
      avatar: 'SJ',
      message: 'Hi Sarah, we were impressed by your React Native projects and would love to discuss an opportunity with our team.',
    },
    {
      id: 2,
      candidateName: 'Michael Chen',
      candidateId: 3,
      position: 'Senior Mobile Developer',
      requestDate: '2024-08-25',
      status: 'accepted',
      scheduledDate: '2024-09-02 10:00 AM',
      skills: ['Mobile Dev', 'React', 'Swift'],
      avatar: 'MC',
      message: 'Hello Michael, your experience with mobile development aligns perfectly with our Senior Mobile Developer role.',
    },
    {
      id: 3,
      candidateName: 'Anonymous Candidate #247',
      candidateId: 2,
      position: 'Full Stack Developer',
      requestDate: '2024-08-23',
      status: 'declined',
      scheduledDate: null,
      skills: ['Full Stack', 'Node.js', 'Python'],
      avatar: '#247',
      message: 'We are looking for a skilled Full Stack Developer and your profile matches our requirements.',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { id: 'all', label: 'All', count: interviewRequests.length },
    { id: 'pending', label: 'Pending', count: interviewRequests.filter(r => r.status === 'pending').length },
    { id: 'accepted', label: 'Accepted', count: interviewRequests.filter(r => r.status === 'accepted').length },
    { id: 'declined', label: 'Declined', count: interviewRequests.filter(r => r.status === 'declined').length },
  ];

  const filteredRequests = selectedStatus === 'all' 
    ? interviewRequests 
    : interviewRequests.filter(request => request.status === selectedStatus);

  const handleCancelRequest = (requestId) => {
    Alert.alert(
      'Cancel Interview Request',
      'Are you sure you want to cancel this interview request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            setInterviewRequests(prev => prev.filter(r => r.id !== requestId));
          }
        },
      ]
    );
  };

  const handleReschedule = (requestId) => {
    Alert.alert('Reschedule', 'Interview rescheduling feature coming soon!');
  };

  const handleFollowUp = (requestId) => {
    Alert.alert('Follow Up', 'Follow-up message feature coming soon!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'declined': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Response';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      default: return status;
    }
  };

  const renderStatus = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        selectedStatus === item.id && styles.statusButtonActive,
      ]}
      onPress={() => setSelectedStatus(item.id)}
    >
      <Text
        style={[
          styles.statusText,
          selectedStatus === item.id && styles.statusTextActive,
        ]}
      >
        {item.label} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderRequest = ({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.candidateInfo}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateAvatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.candidateDetails}>
            <Text style={styles.candidateName}>{item.candidateName}</Text>
            <Text style={styles.position}>{item.position}</Text>
            <Text style={styles.requestDate}>Requested on {item.requestDate}</Text>
          </View>
        </View>
        <Badge 
          text={getStatusText(item.status)} 
          variant={getStatusColor(item.status)} 
          size="small" 
        />
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageLabel}>Your message:</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>

      {/* Skills */}
      <View style={styles.skillsContainer}>
        {item.skills.map((skill, index) => (
          <Badge key={index} text={skill} variant="skill" size="small" />
        ))}
      </View>

      {/* Scheduled Date */}
      {item.scheduledDate && (
        <View style={styles.scheduledContainer}>
          <Text style={styles.scheduledLabel}>Scheduled for:</Text>
          <Text style={styles.scheduledDate}>{item.scheduledDate}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.requestActions}>
        {item.status === 'pending' && (
          <>
            <Button
              title="Follow Up"
              variant="outline"
              size="small"
              onPress={() => handleFollowUp(item.id)}
            />
            <Button
              title="Cancel"
              variant="danger"
              size="small"
              onPress={() => handleCancelRequest(item.id)}
            />
          </>
        )}
        
        {item.status === 'accepted' && (
          <>
            <Button
              title="Reschedule"
              variant="outline"
              size="small"
              onPress={() => handleReschedule(item.id)}
            />
            <Button
              title="Join Meeting"
              variant="primary"
              size="small"
              onPress={() => Alert.alert('Meeting', 'Meeting link feature coming soon!')}
            />
          </>
        )}
        
        {item.status === 'declined' && (
          <Button
            title="Remove"
            variant="secondary"
            size="small"
            onPress={() => handleCancelRequest(item.id)}
          />
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Interview Requests</Text>
        <Text style={styles.subtitle}>Manage your interview pipeline</Text>
      </View>

      {/* Status Filter */}
      <View style={styles.statusContainer}>
        <FlatList
          data={statusOptions}
          renderItem={renderStatus}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusList}
        />
      </View>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.requestsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No interview requests</Text>
          <Text style={styles.emptySubtitle}>
            {selectedStatus === 'all' 
              ? "You haven't sent any interview requests yet" 
              : `No ${selectedStatus} interview requests`
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
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
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusList: {
    paddingVertical: 10,
    gap: 12,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  statusTextActive: {
    color: '#ffffff',
  },
  requestsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    marginVertical: 8,
    marginHorizontal: 0,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candidateInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  candidateAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  candidateAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  messageContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  scheduledContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  scheduledLabel: {
    fontSize: 12,
    color: '#34C759',
    marginBottom: 4,
  },
  scheduledDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default InterviewScreen;
