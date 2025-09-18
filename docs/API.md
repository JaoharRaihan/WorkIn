# SkillNet API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "candidate" // or "hr"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/refresh
Refresh access token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Management

#### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "candidate",
  "bio": "Software developer passionate about React Native",
  "location": "San Francisco, CA",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience_level": "intermediate",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Senior software developer",
  "location": "San Francisco, CA",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "experience_level": "senior"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Senior software developer",
    "location": "San Francisco, CA",
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "experience_level": "senior",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

## Learning Roadmaps

#### GET /roadmaps
Get all available learning roadmaps.

**Query Parameters:**
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty level
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "roadmaps": [
    {
      "id": 1,
      "title": "Frontend Development",
      "description": "Complete guide to modern frontend development",
      "category": "web_development",
      "difficulty": "beginner",
      "estimated_duration": "12 weeks",
      "skills": ["HTML", "CSS", "JavaScript", "React"],
      "modules_count": 8,
      "enrolled_count": 1250,
      "rating": 4.8,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 45,
    "has_next": true,
    "has_prev": false
  }
}
```

#### GET /roadmaps/:id
Get specific roadmap details.

**Response (200):**
```json
{
  "id": 1,
  "title": "Frontend Development",
  "description": "Complete guide to modern frontend development",
  "category": "web_development",
  "difficulty": "beginner",
  "estimated_duration": "12 weeks",
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "modules": [
    {
      "id": 1,
      "title": "HTML Fundamentals",
      "description": "Learn the basics of HTML",
      "order": 1,
      "estimated_duration": "1 week",
      "lessons": [
        {
          "id": 1,
          "title": "Introduction to HTML",
          "type": "video",
          "duration": "30 minutes",
          "order": 1
        }
      ]
    }
  ],
  "enrolled_count": 1250,
  "rating": 4.8,
  "reviews_count": 340,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### POST /roadmaps/:id/enroll
Enroll in a roadmap.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (201):**
```json
{
  "message": "Successfully enrolled in roadmap",
  "enrollment": {
    "id": 1,
    "user_id": 1,
    "roadmap_id": 1,
    "status": "active",
    "progress": 0,
    "enrolled_at": "2024-01-15T10:30:00Z"
  }
}
```

## Progress Tracking

#### GET /progress/roadmaps
Get user's roadmap progress.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "enrollments": [
    {
      "id": 1,
      "roadmap": {
        "id": 1,
        "title": "Frontend Development",
        "category": "web_development"
      },
      "status": "active",
      "progress": 65,
      "modules_completed": 5,
      "total_modules": 8,
      "time_spent": "45 hours",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-20T14:30:00Z"
    }
  ]
}
```

#### POST /progress/lesson/:id/complete
Mark a lesson as completed.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "time_spent": 30, // minutes
  "notes": "Great introduction to HTML basics"
}
```

**Response (200):**
```json
{
  "message": "Lesson marked as completed",
  "progress": {
    "lesson_id": 1,
    "completed_at": "2024-01-15T10:30:00Z",
    "time_spent": 30,
    "roadmap_progress": 15
  }
}
```

## Skill Testing

#### GET /tests
Get available skill tests.

**Query Parameters:**
- `skill` (optional): Filter by skill
- `difficulty` (optional): Filter by difficulty
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "tests": [
    {
      "id": 1,
      "title": "JavaScript Fundamentals",
      "description": "Test your basic JavaScript knowledge",
      "skill": "JavaScript",
      "difficulty": "beginner",
      "questions_count": 20,
      "duration": 30,
      "attempts_allowed": 3,
      "passing_score": 70,
      "taken_count": 5420,
      "average_score": 76.5
    }
  ]
}
```

#### GET /tests/:id
Get test details.

**Response (200):**
```json
{
  "id": 1,
  "title": "JavaScript Fundamentals",
  "description": "Test your basic JavaScript knowledge",
  "skill": "JavaScript",
  "difficulty": "beginner",
  "questions_count": 20,
  "duration": 30,
  "attempts_allowed": 3,
  "passing_score": 70,
  "instructions": "Answer all questions to the best of your ability...",
  "sample_questions": [
    {
      "question": "What is the output of console.log(typeof null)?",
      "options": ["null", "undefined", "object", "boolean"]
    }
  ]
}
```

#### POST /tests/:id/start
Start a test session.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (201):**
```json
{
  "session": {
    "id": "sess_123456",
    "test_id": 1,
    "started_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-15T11:00:00Z",
    "questions": [
      {
        "id": 1,
        "question": "What is the output of console.log(typeof null)?",
        "options": [
          { "id": "a", "text": "null" },
          { "id": "b", "text": "undefined" },
          { "id": "c", "text": "object" },
          { "id": "d", "text": "boolean" }
        ]
      }
    ]
  }
}
```

#### POST /tests/sessions/:sessionId/submit
Submit test answers.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": "c"
    }
  ]
}
```

**Response (200):**
```json
{
  "result": {
    "score": 85,
    "passed": true,
    "correct_answers": 17,
    "total_questions": 20,
    "time_taken": 25,
    "skill_verified": true,
    "certificate_id": "cert_123456",
    "completed_at": "2024-01-15T10:55:00Z"
  }
}
```

## HR/Recruiter Endpoints

#### GET /hr/candidates
Search for candidates.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `skills` (optional): Comma-separated skills
- `experience_level` (optional): Experience level
- `location` (optional): Location filter
- `verified_skills` (optional): Only verified skills
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "candidates": [
    {
      "id": 1,
      "name": "John Doe",
      "location": "San Francisco, CA",
      "experience_level": "senior",
      "skills": [
        {
          "name": "JavaScript",
          "verified": true,
          "score": 85,
          "verified_at": "2024-01-15T10:30:00Z"
        }
      ],
      "bio": "Senior software developer",
      "availability": "open_to_work",
      "match_score": 92
    }
  ],
  "filters": {
    "skills": ["JavaScript", "React", "Node.js"],
    "experience_levels": ["junior", "mid", "senior"],
    "locations": ["San Francisco, CA", "New York, NY"]
  }
}
```

#### POST /hr/candidates/:id/save
Save candidate to favorites.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "notes": "Excellent JavaScript skills, good culture fit"
}
```

**Response (201):**
```json
{
  "message": "Candidate saved successfully",
  "saved_candidate": {
    "id": 1,
    "candidate_id": 1,
    "hr_id": 2,
    "notes": "Excellent JavaScript skills, good culture fit",
    "saved_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /hr/saved-candidates
Get saved candidates.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "saved_candidates": [
    {
      "id": 1,
      "candidate": {
        "id": 1,
        "name": "John Doe",
        "skills": ["JavaScript", "React"],
        "experience_level": "senior"
      },
      "notes": "Excellent JavaScript skills",
      "saved_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /hr/interviews
Schedule an interview.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "candidate_id": 1,
  "position": "Senior Frontend Developer",
  "interview_type": "technical",
  "scheduled_at": "2024-01-20T14:00:00Z",
  "duration": 60,
  "notes": "Focus on React and state management"
}
```

**Response (201):**
```json
{
  "message": "Interview scheduled successfully",
  "interview": {
    "id": 1,
    "candidate_id": 1,
    "hr_id": 2,
    "position": "Senior Frontend Developer",
    "interview_type": "technical",
    "scheduled_at": "2024-01-20T14:00:00Z",
    "duration": 60,
    "status": "scheduled",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Analytics

#### GET /analytics/dashboard
Get dashboard analytics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "candidate_analytics": {
    "total_roadmaps": 3,
    "completed_roadmaps": 1,
    "total_tests": 12,
    "passed_tests": 8,
    "verified_skills": 5,
    "learning_streak": 15,
    "total_learning_time": "120 hours"
  },
  "hr_analytics": {
    "total_searches": 45,
    "saved_candidates": 12,
    "scheduled_interviews": 8,
    "completed_interviews": 5,
    "successful_hires": 2
  }
}
```

## File Upload

#### POST /upload/avatar
Upload user avatar.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'avatar' field containing image file
```

**Response (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://your-cdn.com/avatars/user_1_avatar.jpg"
}
```

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid token"
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "retry_after": 300
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Search endpoints**: 60 requests per minute per user
- **General endpoints**: 100 requests per minute per user
- **Upload endpoints**: 10 requests per minute per user

## Webhook Events

### Skill Verification
Triggered when a user passes a skill test.

```json
{
  "event": "skill.verified",
  "data": {
    "user_id": 1,
    "skill": "JavaScript",
    "score": 85,
    "verified_at": "2024-01-15T10:30:00Z"
  }
}
```

### Roadmap Completion
Triggered when a user completes a learning roadmap.

```json
{
  "event": "roadmap.completed",
  "data": {
    "user_id": 1,
    "roadmap_id": 1,
    "completion_time": "8 weeks",
    "completed_at": "2024-01-15T10:30:00Z"
  }
}
```

## SDK Examples

### JavaScript/React Native
```javascript
import { SkillNetAPI } from '@skillnet/api-client';

const api = new SkillNetAPI({
  baseURL: 'https://api.skillnet.com',
  token: 'your-jwt-token'
});

// Get roadmaps
const roadmaps = await api.roadmaps.getAll();

// Enroll in roadmap
await api.roadmaps.enroll(roadmapId);

// Search candidates (HR)
const candidates = await api.hr.searchCandidates({
  skills: ['JavaScript', 'React'],
  experience_level: 'senior'
});
```

### cURL Examples
```bash
# Login
curl -X POST https://api.skillnet.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get roadmaps
curl -X GET https://api.skillnet.com/api/roadmaps \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Start test
curl -X POST https://api.skillnet.com/api/tests/1/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
