const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Define allowed file types based on upload type
    const allowedTypes = {
      'profile': /jpeg|jpg|png|gif/,
      'post': /jpeg|jpg|png|gif|mp4|mov/,
      'document': /pdf|doc|docx/,
      'project': /.*/, // Allow all file types for projects
      'test_submission': /.*/ // Allow all file types for test submissions
    };

    const uploadType = req.body.type || 'profile';
    const allowedPattern = allowedTypes[uploadType] || /jpeg|jpg|png/;
    
    const extname = allowedPattern.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedPattern.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${uploadType} upload`));
    }
  }
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;
    
    // In a real app, save file info to database
    const fileInfo = {
      id: Date.now(),
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      type: 'profile_picture',
      uploadedAt: new Date()
    };

    console.log('Profile picture uploaded:', fileInfo);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      file: {
        id: fileInfo.id,
        filename: fileInfo.filename,
        url: `/api/upload/file/${fileInfo.filename}`,
        size: fileInfo.size
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload post media
router.post('/post-media', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, mediaType } = req.body;
    
    const fileInfo = {
      id: Date.now(),
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      type: 'post_media',
      mediaType: mediaType,
      uploadedAt: new Date()
    };

    console.log('Post media uploaded:', fileInfo);

    res.json({
      success: true,
      message: 'Post media uploaded successfully',
      file: {
        id: fileInfo.id,
        filename: fileInfo.filename,
        url: `/api/upload/file/${fileInfo.filename}`,
        mediaType: fileInfo.mediaType,
        size: fileInfo.size
      }
    });
  } catch (error) {
    console.error('Post media upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload project files
router.post('/project-files', auth, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { userId, projectId } = req.body;
    
    const fileInfos = req.files.map(file => ({
      id: Date.now() + Math.random(),
      userId: userId,
      projectId: projectId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      type: 'project_file',
      uploadedAt: new Date()
    }));

    console.log('Project files uploaded:', fileInfos);

    res.json({
      success: true,
      message: 'Project files uploaded successfully',
      files: fileInfos.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: `/api/upload/file/${file.filename}`,
        size: file.size
      }))
    });
  } catch (error) {
    console.error('Project files upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload document (resume, certificate, etc.)
router.post('/document', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, type } = req.body;
    
    const fileInfo = {
      id: Date.now(),
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      type: 'document',
      documentType: type,
      uploadedAt: new Date()
    };

    console.log('Document uploaded:', fileInfo);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      file: {
        id: fileInfo.id,
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        url: `/api/upload/file/${fileInfo.filename}`,
        documentType: fileInfo.documentType,
        size: fileInfo.size
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload test submission files
router.post('/test-submission', auth, upload.array('submission_files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { userId, testId } = req.body;
    
    const fileInfos = req.files.map(file => ({
      id: Date.now() + Math.random(),
      userId: userId,
      testId: testId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      type: 'test_submission',
      uploadedAt: new Date()
    }));

    console.log('Test submission files uploaded:', fileInfos);

    res.json({
      success: true,
      message: 'Test submission uploaded successfully',
      files: fileInfos.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: `/api/upload/file/${file.filename}`,
        size: file.size
      }))
    });
  } catch (error) {
    console.error('Test submission upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve uploaded files
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Delete uploaded file
router.delete('/file/:fileId', auth, (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;
    
    // In a real app, check if user owns the file and delete from database
    console.log(`Deleting file ${fileId} for user ${userId}`);
    
    // Delete physical file
    // const filePath = path.join(__dirname, '../uploads', filename);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get user's uploaded files
router.get('/user/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    
    // Mock user files - in a real app, query from database
    const mockFiles = [
      {
        id: 1,
        filename: 'profile-123.jpg',
        originalName: 'profile.jpg',
        type: 'profile_picture',
        size: 245760,
        uploadedAt: new Date(Date.now() - 86400000),
        url: '/api/upload/file/profile-123.jpg'
      },
      {
        id: 2,
        filename: 'resume-123.pdf',
        originalName: 'resume.pdf',
        type: 'document',
        documentType: 'resume',
        size: 1048576,
        uploadedAt: new Date(Date.now() - 172800000),
        url: '/api/upload/file/resume-123.pdf'
      }
    ];

    let filteredFiles = mockFiles;
    if (type && type !== 'all') {
      filteredFiles = mockFiles.filter(file => file.type === type);
    }

    res.json(filteredFiles);
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ error: 'Failed to get user files' });
  }
});

// Cancel upload (for future implementation with upload progress)
router.delete('/cancel/:uploadId', auth, (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // In a real app, cancel ongoing upload
    console.log(`Cancelling upload ${uploadId}`);
    
    res.json({
      success: true,
      message: 'Upload cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel upload error:', error);
    res.status(500).json({ error: 'Failed to cancel upload' });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Upload failed' });
});

module.exports = router;
