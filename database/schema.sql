-- SkillNet Database Schema
-- PostgreSQL Database Structure

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'candidate', -- 'candidate' or 'hr'
    bio TEXT,
    location VARCHAR(255),
    profile_pic VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmaps table
CREATE TABLE roadmaps (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    json_data JSONB, -- Contains steps, requirements, etc.
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roadmap progress tracking
CREATE TABLE user_roadmap_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed_steps JSONB, -- Array of completed step IDs
    heatmap_data JSONB, -- Learning activity data
    badges_earned JSONB, -- Array of earned badges
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, roadmap_id)
);

-- Tests table
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'mcq', 'coding', 'project'
    questions JSONB NOT NULL, -- Array of questions
    time_limit INTEGER, -- Time limit in minutes
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User test results
CREATE TABLE user_test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB, -- User's answers
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken INTEGER -- Time taken in seconds
);

-- HR saved candidates
CREATE TABLE hr_saved_candidates (
    id SERIAL PRIMARY KEY,
    hr_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hr_id, candidate_id)
);

-- Interview requests
CREATE TABLE interview_requests (
    id SERIAL PRIMARY KEY,
    hr_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentor reviews/endorsements
CREATE TABLE mentor_reviews (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    comment TEXT,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User projects
CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies JSONB, -- Array of technologies used
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    image_urls JSONB, -- Array of image URLs
    status VARCHAR(50) DEFAULT 'completed', -- 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(255) NOT NULL,
    badge_type VARCHAR(50) NOT NULL, -- 'skill', 'achievement', 'milestone'
    earned_from VARCHAR(50), -- 'test', 'project', 'roadmap'
    reference_id INTEGER, -- ID of test, project, or roadmap that earned the badge
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feed/Activity table
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'badge_earned', 'test_passed', 'project_completed', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB, -- Additional data specific to activity type
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_roadmap_progress_user_id ON user_roadmap_progress(user_id);
CREATE INDEX idx_user_test_results_user_id ON user_test_results(user_id);
CREATE INDEX idx_hr_saved_candidates_hr_id ON hr_saved_candidates(hr_id);
CREATE INDEX idx_interview_requests_hr_id ON interview_requests(hr_id);
CREATE INDEX idx_interview_requests_candidate_id ON interview_requests(candidate_id);
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);

-- Sample data inserts
INSERT INTO users (name, email, password_hash, role, bio, location) VALUES
('John Doe', 'john@example.com', '$2a$12$hashedpassword', 'candidate', 'Passionate React Native developer', 'San Francisco, CA'),
('Jane Smith', 'jane@example.com', '$2a$12$hashedpassword', 'hr', 'Senior Talent Acquisition Specialist', 'New York, NY');

INSERT INTO roadmaps (title, description, json_data, is_premium) VALUES
('React Native Development', 'Master mobile app development with React Native', 
 '{"steps": [{"id": 1, "title": "JavaScript Fundamentals", "duration": "2 weeks"}, {"id": 2, "title": "React Basics", "duration": "3 weeks"}]}', 
 FALSE),
('Full Stack JavaScript', 'Complete web development with MERN stack',
 '{"steps": [{"id": 1, "title": "HTML/CSS/JS", "duration": "4 weeks"}, {"id": 2, "title": "React Frontend", "duration": "6 weeks"}]}',
 TRUE);
