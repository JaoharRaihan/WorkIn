import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ProjectUploadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { testId, test } = route.params || {};
  
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    technologies: '',
    challenges: '',
    learnings: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [projectRequirements, setProjectRequirements] = useState([]);
  const [completedRequirements, setCompletedRequirements] = useState(new Set());

  useEffect(() => {
    if (test) {
      generateProjectRequirements();
      setTimeRemaining(test.duration * 60 * 60); // Convert hours to seconds for project tests
    }
  }, [test]);

  // Timer effect for project deadline
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      Alert.alert(
        'Time\'s Up!',
        'The project deadline has been reached. Please submit your work.',
        [{ text: 'OK', onPress: () => setShowSubmitModal(true) }]
      );
    }
  }, [timeRemaining]);

  const generateProjectRequirements = () => {
    const requirementSets = {
      web: [
        {
          id: 1,
          title: "Responsive Design",
          description: "Your project must be responsive and work on mobile, tablet, and desktop devices",
          required: true,
          points: 20
        },
        {
          id: 2,
          title: "Modern CSS",
          description: "Use modern CSS features like Grid, Flexbox, or CSS-in-JS",
          required: true,
          points: 15
        },
        {
          id: 3,
          title: "Interactive Features",
          description: "Include user interactions, animations, or dynamic content",
          required: true,
          points: 25
        },
        {
          id: 4,
          title: "Code Quality",
          description: "Clean, well-structured, and commented code",
          required: true,
          points: 20
        },
        {
          id: 5,
          title: "Performance",
          description: "Optimized images, efficient code, fast loading times",
          required: false,
          points: 10
        },
        {
          id: 6,
          title: "Accessibility",
          description: "WCAG compliance, semantic HTML, keyboard navigation",
          required: false,
          points: 10
        }
      ],
      programming: [
        {
          id: 1,
          title: "Core Functionality",
          description: "All required features work correctly without bugs",
          required: true,
          points: 30
        },
        {
          id: 2,
          title: "Code Architecture",
          description: "Well-organized, modular code with clear separation of concerns",
          required: true,
          points: 25
        },
        {
          id: 3,
          title: "Error Handling",
          description: "Proper error handling and validation throughout the application",
          required: true,
          points: 20
        },
        {
          id: 4,
          title: "Documentation",
          description: "Clear README with setup instructions and API documentation",
          required: true,
          points: 15
        },
        {
          id: 5,
          title: "Testing",
          description: "Unit tests covering core functionality",
          required: false,
          points: 10
        }
      ],
      mobile: [
        {
          id: 1,
          title: "Native Features",
          description: "Use platform-specific features (camera, GPS, push notifications, etc.)",
          required: true,
          points: 25
        },
        {
          id: 2,
          title: "UI/UX Design",
          description: "Intuitive interface following platform design guidelines",
          required: true,
          points: 25
        },
        {
          id: 3,
          title: "Performance",
          description: "Smooth animations, efficient memory usage, fast startup",
          required: true,
          points: 20
        },
        {
          id: 4,
          title: "Data Management",
          description: "Proper state management and data persistence",
          required: true,
          points: 20
        },
        {
          id: 5,
          title: "Offline Support",
          description: "App works without internet connection for core features",
          required: false,
          points: 10
        }
      ]
    };

    const requirements = requirementSets[test.category] || requirementSets.programming;
    setProjectRequirements(requirements);
  };

  const handleInputChange = (field, value) => {
    setProjectDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-zip-compressed', 'text/*', 'application/json'],
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled && result.assets) {
        setUploadedFiles(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickScreenshot = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload screenshots');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true
      });

      if (!result.canceled) {
        setScreenshots(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick screenshot');
    }
  };

  const takeScreenshot = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take screenshots');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshots(prev => [...prev, result]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take screenshot');
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRequirement = (requirementId) => {
    setCompletedRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementId)) {
        newSet.delete(requirementId);
      } else {
        newSet.add(requirementId);
      }
      return newSet;
    });
  };

  const validateSubmission = () => {
    const errors = [];
    
    if (!projectDetails.title.trim()) {
      errors.push('Project title is required');
    }
    
    if (!projectDetails.description.trim()) {
      errors.push('Project description is required');
    }
    
    if (!projectDetails.githubUrl.trim() && uploadedFiles.length === 0) {
      errors.push('Either GitHub URL or project files must be provided');
    }
    
    const requiredRequirements = projectRequirements.filter(req => req.required);
    const completedRequired = requiredRequirements.filter(req => completedRequirements.has(req.id));
    
    if (completedRequired.length < requiredRequirements.length) {
      errors.push(`Complete all required features (${completedRequired.length}/${requiredRequirements.length})`);
    }
    
    return errors;
  };

  const submitProject = async () => {
    const errors = validateSubmission();
    
    if (errors.length > 0) {
      Alert.alert('Submission Error', errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate project submission and evaluation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const totalPoints = projectRequirements
        .filter(req => completedRequirements.has(req.id))
        .reduce((sum, req) => sum + req.points, 0);
      
      const maxPoints = projectRequirements.reduce((sum, req) => sum + req.points, 0);
      const score = Math.round((totalPoints / maxPoints) * 100);
      const passed = score >= (test.passingScore || 70);
      const timeTaken = Math.round(((test.duration * 60 * 60) - timeRemaining) / 3600); // Convert to hours
      
      // Calculate breakdown by requirement categories
      const breakdown = {
        functionality: 0,
        design: 0,
        codeQuality: 0,
        performance: 0
      };
      
      projectRequirements.forEach(req => {
        if (completedRequirements.has(req.id)) {
          const category = req.category || 'functionality';
          breakdown[category] = (breakdown[category] || 0) + req.points;
        }
      });
      
      // Convert to percentages
      Object.keys(breakdown).forEach(key => {
        const categoryMax = projectRequirements
          .filter(req => (req.category || 'functionality') === key)
          .reduce((sum, req) => sum + req.points, 0);
        breakdown[key] = categoryMax > 0 ? Math.round((breakdown[key] / categoryMax) * 100) : 0;
      });
      
      const results = {
        score,
        correctAnswers: completedRequirements.size,
        totalQuestions: projectRequirements.length,
        passed,
        timeTaken,
        breakdown,
        badgeEarned: passed,
        attemptNumber: (test.attempts || 0) + 1,
        testType: 'Project',
        completedAt: new Date().toISOString(),
        projectDetails,
        uploadedFiles: uploadedFiles.length,
        screenshots: screenshots.length,
        totalPoints,
        maxPoints
      };
      
      // Navigate to results screen
      navigation.replace('TestResults', { 
        testResults: results, 
        test: test 
      });
      
    } catch (error) {
      Alert.alert('Submission Failed', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!test) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project test not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{test.title}</Text>
          <Text style={styles.headerSubtitle}>Project Submission</Text>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time" size={16} color="#64748b" />
          <Text style={[styles.timerText, timeRemaining < 3600 && styles.timerWarning]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Requirements</Text>
          <Text style={styles.sectionDescription}>
            Complete the checklist below as you build your project
          </Text>
          
          {projectRequirements.map(requirement => (
            <TouchableOpacity
              key={requirement.id}
              style={styles.requirementItem}
              onPress={() => toggleRequirement(requirement.id)}
            >
              <View style={styles.requirementHeader}>
                <View style={styles.requirementLeft}>
                  <Ionicons 
                    name={completedRequirements.has(requirement.id) ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={completedRequirements.has(requirement.id) ? "#10b981" : "#d1d5db"} 
                  />
                  <View style={styles.requirementInfo}>
                    <Text style={styles.requirementTitle}>
                      {requirement.title}
                      {requirement.required && <Text style={styles.requiredIndicator}> *</Text>}
                    </Text>
                    <Text style={styles.requirementDescription}>{requirement.description}</Text>
                  </View>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{requirement.points}pts</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project Title *</Text>
            <TextInput
              style={styles.textInput}
              value={projectDetails.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter your project title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={projectDetails.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your project, its purpose, and key features"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GitHub Repository URL</Text>
            <TextInput
              style={styles.textInput}
              value={projectDetails.githubUrl}
              onChangeText={(value) => handleInputChange('githubUrl', value)}
              placeholder="https://github.com/username/repository"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Live Demo URL</Text>
            <TextInput
              style={styles.textInput}
              value={projectDetails.liveUrl}
              onChangeText={(value) => handleInputChange('liveUrl', value)}
              placeholder="https://your-demo-site.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Technologies Used</Text>
            <TextInput
              style={styles.textInput}
              value={projectDetails.technologies}
              onChangeText={(value) => handleInputChange('technologies', value)}
              placeholder="React, Node.js, MongoDB, etc."
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Challenges & Solutions</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={projectDetails.challenges}
              onChangeText={(value) => handleInputChange('challenges', value)}
              placeholder="Describe the main challenges you faced and how you solved them"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Key Learnings</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={projectDetails.learnings}
              onChangeText={(value) => handleInputChange('learnings', value)}
              placeholder="What did you learn from this project?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* File Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Files</Text>
          <Text style={styles.sectionDescription}>
            Upload your project files or provide a GitHub repository URL
          </Text>

          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={24} color="#3b82f6" />
            <Text style={styles.uploadButtonText}>Upload Project Files</Text>
            <Text style={styles.uploadButtonSubtext}>ZIP, source files, documentation</Text>
          </TouchableOpacity>

          {uploadedFiles.length > 0 && (
            <View style={styles.filesList}>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Ionicons name="document" size={20} color="#64748b" />
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{Math.round(file.size / 1024)}KB</Text>
                  <TouchableOpacity onPress={() => removeFile(index)}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Screenshots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screenshots</Text>
          <Text style={styles.sectionDescription}>
            Add screenshots or images of your project
          </Text>

          <View style={styles.screenshotButtons}>
            <TouchableOpacity style={styles.screenshotButton} onPress={pickScreenshot}>
              <Ionicons name="images-outline" size={20} color="#3b82f6" />
              <Text style={styles.screenshotButtonText}>Choose Images</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.screenshotButton} onPress={takeScreenshot}>
              <Ionicons name="camera-outline" size={20} color="#3b82f6" />
              <Text style={styles.screenshotButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {screenshots.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshotsList}>
              {screenshots.map((screenshot, index) => (
                <View key={index} style={styles.screenshotItem}>
                  <Image source={{ uri: screenshot.uri }} style={styles.screenshotImage} />
                  <TouchableOpacity 
                    style={styles.removeScreenshot}
                    onPress={() => removeScreenshot(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setShowSubmitModal(true)}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>Submit Project</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Project</Text>
            <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Submission Summary</Text>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Project Title:</Text>
                <Text style={styles.summaryValue}>{projectDetails.title || 'Not provided'}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Requirements Completed:</Text>
                <Text style={styles.summaryValue}>
                  {completedRequirements.size} of {projectRequirements.length}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Files Uploaded:</Text>
                <Text style={styles.summaryValue}>{uploadedFiles.length} files</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Screenshots:</Text>
                <Text style={styles.summaryValue}>{screenshots.length} images</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                Once submitted, you cannot make any changes to your project. Make sure everything is complete.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Review Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
                onPress={submitProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Submit Final Project</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#ef4444',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  requirementItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requirementLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  requirementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  requiredIndicator: {
    color: '#ef4444',
  },
  requirementDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  pointsBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filesList: {
    marginTop: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  screenshotButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  screenshotButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  screenshotButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  screenshotsList: {
    marginTop: 12,
  },
  screenshotItem: {
    position: 'relative',
    marginRight: 12,
  },
  screenshotImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  removeScreenshot: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
  },
  submitSection: {
    padding: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  summarySection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#d97706',
    marginLeft: 8,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ProjectUploadScreen;
