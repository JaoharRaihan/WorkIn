import apiService from './apiService';

class FileUploadService {
  // Upload profile picture
  async uploadProfilePicture(userId, imageUri) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${userId}_${Date.now()}.jpg`,
      });
      formData.append('userId', userId);
      formData.append('type', 'profile');

      const response = await apiService.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }

  // Upload post images/videos
  async uploadPostMedia(userId, mediaUri, mediaType = 'image') {
    try {
      const formData = new FormData();
      const extension = mediaType === 'image' ? '.jpg' : '.mp4';
      const mimeType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';
      
      formData.append('file', {
        uri: mediaUri,
        type: mimeType,
        name: `post_${userId}_${Date.now()}${extension}`,
      });
      formData.append('userId', userId);
      formData.append('type', 'post');
      formData.append('mediaType', mediaType);

      const response = await apiService.post('/upload/post-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Post media upload error:', error);
      throw error;
    }
  }

  // Upload project files
  async uploadProjectFiles(userId, projectId, files) {
    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`files`, {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || `project_file_${index}`,
        });
      });
      
      formData.append('userId', userId);
      formData.append('projectId', projectId);
      formData.append('type', 'project');

      const response = await apiService.post('/upload/project-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Project files upload error:', error);
      throw error;
    }
  }

  // Upload resume/documents
  async uploadDocument(userId, documentUri, documentType = 'resume') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: documentUri,
        type: 'application/pdf',
        name: `${documentType}_${userId}_${Date.now()}.pdf`,
      });
      formData.append('userId', userId);
      formData.append('type', documentType);

      const response = await apiService.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  // Upload test submission files (for coding tests)
  async uploadTestSubmission(userId, testId, submissionFiles) {
    try {
      const formData = new FormData();
      
      submissionFiles.forEach((file, index) => {
        formData.append(`submission_files`, {
          uri: file.uri,
          type: file.type || 'text/plain',
          name: file.name || `submission_${index}`,
        });
      });
      
      formData.append('userId', userId);
      formData.append('testId', testId);
      formData.append('type', 'test_submission');

      const response = await apiService.post('/upload/test-submission', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error('Test submission upload error:', error);
      throw error;
    }
  }

  // Get upload progress for a specific upload
  getUploadProgress(uploadId) {
    // This would be implemented with WebSocket or polling
    // For now, return a mock progress
    return {
      uploadId,
      progress: 0,
      status: 'pending' // pending, uploading, completed, failed
    };
  }

  // Cancel upload
  async cancelUpload(uploadId) {
    try {
      const response = await apiService.delete(`/upload/cancel/${uploadId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel upload error:', error);
      throw error;
    }
  }

  // Delete uploaded file
  async deleteFile(fileId, userId) {
    try {
      const response = await apiService.delete(`/upload/file/${fileId}`, {
        data: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  // Get user's uploaded files
  async getUserFiles(userId, type = 'all') {
    try {
      const response = await apiService.get(`/upload/user/${userId}`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Get user files error:', error);
      throw error;
    }
  }

  // Compress image before upload
  async compressImage(imageUri, quality = 0.8) {
    try {
      // This would use a library like expo-image-manipulator
      // For now, return the original URI
      return imageUri;
    } catch (error) {
      console.error('Image compression error:', error);
      return imageUri;
    }
  }

  // Validate file size and type
  validateFile(file, maxSizeMB = 10, allowedTypes = []) {
    const validations = {
      isValid: true,
      errors: []
    };

    // Check file size
    if (file.size && file.size > maxSizeMB * 1024 * 1024) {
      validations.isValid = false;
      validations.errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (allowedTypes.length > 0 && file.type && !allowedTypes.includes(file.type)) {
      validations.isValid = false;
      validations.errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    return validations;
  }
}

export default new FileUploadService();
