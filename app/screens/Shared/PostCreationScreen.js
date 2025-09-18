import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
// import { Video } from 'expo-av'; // Temporarily disabled for build
import { performanceMonitor } from '../../utils/performanceMonitor';

const { width, height } = Dimensions.get('window');

const PostCreationScreen = ({ navigation, route }) => {
  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [postType, setPostType] = useState('milestone'); // milestone, project, tip, challenge, insight
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  
  const textInputRef = useRef();
  const videoRef = useRef();

  const postTypes = [
    { id: 'milestone', title: 'Milestone', icon: 'trophy', color: '#FFD700', description: 'Share your achievement' },
    { id: 'project', title: 'Project', icon: 'folder', color: '#007AFF', description: 'Showcase your work' },
    { id: 'tip', title: 'Mentor Tip', icon: 'bulb', color: '#FF6B35', description: 'Share knowledge' },
    { id: 'challenge', title: 'Challenge', icon: 'flash', color: '#AF52DE', description: 'Create a puzzle' },
    { id: 'insight', title: 'AI Insight', icon: 'bulb', color: '#34C759', description: 'Share learning' },
  ];

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to upload media.');
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    performanceMonitor.trackUserAction('image_picker_open');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          type: 'image',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }));
        
        setSelectedMedia(prev => [...prev, ...newMedia]);
        setShowMediaOptions(false);
        performanceMonitor.trackUserAction('images_selected', { count: newMedia.length });
      }
    } catch (error) {
      performanceMonitor.trackError(error, 'image_picker');
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleVideoPicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    performanceMonitor.trackUserAction('video_picker_open');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia = {
          id: Date.now(),
          type: 'video',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        };
        
        setSelectedMedia(prev => [...prev, newMedia]);
        setShowMediaOptions(false);
        performanceMonitor.trackUserAction('video_selected', { duration: asset.duration });
      }
    } catch (error) {
      performanceMonitor.trackError(error, 'video_picker');
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleCameraPicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    performanceMonitor.trackUserAction('camera_open');
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia = {
          id: Date.now(),
          type: asset.type === 'video' ? 'video' : 'image',
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        };
        
        setSelectedMedia(prev => [...prev, newMedia]);
        setShowMediaOptions(false);
        performanceMonitor.trackUserAction('camera_capture', { type: newMedia.type });
      }
    } catch (error) {
      performanceMonitor.trackError(error, 'camera_picker');
      Alert.alert('Error', 'Failed to capture media');
    }
  };

  const removeMedia = (mediaId) => {
    setSelectedMedia(prev => prev.filter(media => media.id !== mediaId));
    performanceMonitor.trackUserAction('media_removed');
  };

  const handleSubmitPost = async () => {
    if (!postText.trim() && selectedMedia.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or media to your post.');
      return;
    }

    setIsSubmitting(true);
    performanceMonitor.trackUserAction('post_submit_start', {
      type: postType,
      hasText: !!postText.trim(),
      mediaCount: selectedMedia.length,
      textLength: postText.length,
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPost = {
        id: Date.now(),
        type: postType,
        content: postText,
        media: selectedMedia,
        user: {
          id: 'current_user',
          name: 'Current User',
          avatar: 'https://via.placeholder.com/100',
        },
        timestamp: new Date().toISOString(),
        reactions: {},
        comments: [],
        saves: 0,
        shares: 0,
      };

      performanceMonitor.trackUserAction('post_submit_success', {
        type: postType,
        mediaCount: selectedMedia.length,
      });

      // Navigate back and pass the new post
      navigation.goBack();
      if (route.params?.onPostCreated) {
        route.params.onPostCreated(newPost);
      }

    } catch (error) {
      performanceMonitor.trackError(error, 'post_submission');
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMediaPreview = () => {
    if (selectedMedia.length === 0) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreview}>
        {selectedMedia.map((media) => (
          <View key={media.id} style={styles.mediaItem}>
            {media.type === 'image' ? (
              <Image source={{ uri: media.uri }} style={styles.previewImage} />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: media.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => removeMedia(media.id)}
            >
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <View style={styles.mediaTypeIndicator}>
              <Ionicons 
                name={media.type === 'image' ? 'image' : 'videocam'} 
                size={12} 
                color="#fff" 
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderMediaOptions = () => {
    if (!showMediaOptions) return null;

    return (
      <View style={styles.mediaOptionsOverlay}>
        <TouchableOpacity 
          style={styles.mediaOptionsBackdrop}
          onPress={() => setShowMediaOptions(false)}
        />
        <View style={styles.mediaOptionsContainer}>
          <TouchableOpacity style={styles.mediaOption} onPress={handleCameraPicker}>
            <LinearGradient colors={['#FF6B35', '#FF4500']} style={styles.mediaOptionGradient}>
              <Ionicons name="camera" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.mediaOptionText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaOption} onPress={handleImagePicker}>
            <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.mediaOptionGradient}>
              <Ionicons name="images" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.mediaOptionText}>Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaOption} onPress={handleVideoPicker}>
            <LinearGradient colors={['#AF52DE', '#8E44AD']} style={styles.mediaOptionGradient}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.mediaOptionText}>Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleSubmitPost} 
          style={[styles.headerButton, styles.submitButton, (!postText.trim() && selectedMedia.length === 0) && styles.submitButtonDisabled]}
          disabled={(!postText.trim() && selectedMedia.length === 0) || isSubmitting}
        >
          <Text style={[styles.submitButtonText, (!postText.trim() && selectedMedia.length === 0) && styles.submitButtonTextDisabled]}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post Type Selection */}
        <View style={styles.postTypeSection}>
          <Text style={styles.sectionTitle}>Post Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postTypeScroll}>
            {postTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.postTypeCard,
                  postType === type.id && styles.postTypeCardSelected
                ]}
                onPress={() => setPostType(type.id)}
              >
                <View style={[styles.postTypeIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon} size={20} color="#fff" />
                </View>
                <Text style={[styles.postTypeTitle, postType === type.id && styles.postTypeSelected]}>
                  {type.title}
                </Text>
                <Text style={styles.postTypeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Text Input */}
        <View style={styles.textSection}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder={`What would you like to share about your ${postTypes.find(t => t.id === postType)?.title.toLowerCase()}?`}
            placeholderTextColor="#999"
            value={postText}
            onChangeText={setPostText}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{postText.length}/500</Text>
        </View>

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Media Actions */}
        <View style={styles.mediaActions}>
          <TouchableOpacity 
            style={styles.addMediaButton}
            onPress={() => setShowMediaOptions(true)}
          >
            <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.addMediaGradient}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addMediaText}>Add Media</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Media Options Modal */}
      {renderMediaOptions()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5E7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  postTypeSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  postTypeScroll: {
    flexDirection: 'row',
  },
  postTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  postTypeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  postTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  postTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  postTypeSelected: {
    color: '#007AFF',
  },
  postTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  textSection: {
    padding: 16,
    paddingTop: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
  mediaPreview: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaItem: {
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  previewVideo: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  mediaTypeIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 4,
  },
  mediaActions: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  addMediaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addMediaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addMediaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mediaOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mediaOptionsBackdrop: {
    flex: 1,
  },
  mediaOptionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mediaOption: {
    alignItems: 'center',
  },
  mediaOptionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mediaOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default PostCreationScreen;
