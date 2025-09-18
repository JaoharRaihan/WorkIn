# SkillNet Testing Guide

## Overview
This guide covers testing strategies, setup, and execution for the SkillNet application including unit tests, integration tests, and end-to-end testing.

## Testing Stack

### Frontend (React Native)
- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing utilities
- **Detox**: End-to-end testing for React Native
- **MSW (Mock Service Worker)**: API mocking

### Backend (Node.js)
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion testing
- **pg-mem**: In-memory PostgreSQL for testing
- **Factory functions**: Test data generation

## Test Setup

### Install Dependencies

#### Frontend Testing Dependencies
```bash
cd skillnet-app
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo detox
```

#### Backend Testing Dependencies
```bash
cd server
npm install --save-dev jest supertest pg-mem @types/supertest
```

### Jest Configuration

#### Frontend (jest.config.js)
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/tests/setup.js'
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    '!app/**/*.styles.js',
    '!app/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Backend (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

## Frontend Testing

### Test Setup File (app/tests/setup.js)
```javascript
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

// Global test utilities
global.mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'candidate',
};

global.mockRoadmap = {
  id: 1,
  title: 'Test Roadmap',
  description: 'Test roadmap description',
  category: 'web_development',
  difficulty: 'beginner',
};
```

### Component Testing Examples

#### Button Component Test
```javascript
// app/components/__tests__/Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles', () => {
    const { getByTestId } = render(
      <Button 
        title="Primary Button" 
        variant="primary" 
        onPress={() => {}} 
        testID="primary-button"
      />
    );
    
    const button = getByTestId('primary-button');
    expect(button.props.style).toMatchObject({
      backgroundColor: '#007AFF',
    });
  });

  it('is disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button 
        title="Loading Button" 
        onPress={mockOnPress}
        loading={true}
        testID="loading-button"
      />
    );
    
    const button = getByTestId('loading-button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

#### Screen Component Test
```javascript
// app/screens/Candidate/__tests__/LearnScreen.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppProvider } from '../../../context/AppContext';
import LearnScreen from '../LearnScreen';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  getRoadmaps: jest.fn(() => Promise.resolve({
    roadmaps: [
      {
        id: 1,
        title: 'React Fundamentals',
        description: 'Learn React basics',
        category: 'web_development',
        difficulty: 'beginner',
      }
    ],
    pagination: { total_pages: 1 }
  })),
}));

const renderWithProvider = (component) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('LearnScreen', () => {
  it('renders loading state initially', () => {
    const { getByTestId } = renderWithProvider(<LearnScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays roadmaps after loading', async () => {
    const { getByText, queryByTestId } = renderWithProvider(<LearnScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('React Fundamentals')).toBeTruthy();
    });
  });

  it('handles search functionality', async () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(<LearnScreen />);
    
    const searchInput = getByPlaceholderText('Search roadmaps...');
    fireEvent.changeText(searchInput, 'React');
    
    await waitFor(() => {
      expect(getByText('React Fundamentals')).toBeTruthy();
    });
  });
});
```

### Context Testing
```javascript
// app/context/__tests__/AppContext.test.js
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppProvider, useAppContext } from '../AppContext';

const TestComponent = () => {
  const { mode, toggleMode, user, setUser } = useAppContext();
  
  return (
    <>
      <Text testID="current-mode">{mode}</Text>
      <Button testID="toggle-mode" onPress={toggleMode} title="Toggle" />
    </>
  );
};

describe('AppContext', () => {
  it('provides default values', () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    expect(getByTestId('current-mode')).toHaveTextContent('CANDIDATE');
  });

  it('toggles mode correctly', async () => {
    const { getByTestId } = render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    const toggleButton = getByTestId('toggle-mode');
    const modeText = getByTestId('current-mode');
    
    expect(modeText).toHaveTextContent('CANDIDATE');
    
    await act(async () => {
      fireEvent.press(toggleButton);
    });
    
    expect(modeText).toHaveTextContent('HR');
  });
});
```

### API Service Testing
```javascript
// app/services/__tests__/apiService.test.js
import apiService from '../apiService';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('makes GET request correctly', async () => {
    const mockResponse = { roadmaps: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiService.getRoadmaps();
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/roadmaps',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('handles authentication token', async () => {
    const mockToken = 'test-token';
    const mockResponse = { user: {} };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await apiService.getUserProfile(mockToken);
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/profile',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
      })
    );
  });

  it('handles API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    });

    await expect(apiService.getRoadmaps()).rejects.toThrow('Bad Request');
  });
});
```

## Backend Testing

### Test Setup (server/tests/setup.js)
```javascript
const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');

// Create in-memory database
const db = newDb();

// Load schema
const schemaSQL = fs.readFileSync(
  path.join(__dirname, '../database/schema.sql'),
  'utf8'
);

db.public.query(schemaSQL);

// Export database connection
module.exports = {
  db,
  getConnection: () => db.adapters.createPg(),
};
```

### Model Testing
```javascript
// server/tests/models/User.test.js
const User = require('../../src/models/User');
const { getConnection } = require('../setup');

describe('User Model', () => {
  let db;

  beforeAll(() => {
    db = getConnection();
  });

  beforeEach(async () => {
    // Clear users table
    await db.query('DELETE FROM users');
  });

  describe('create', () => {
    it('creates a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'candidate'
      };

      const user = await User.create(userData, db);

      expect(user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'candidate'
      });
      expect(user.id).toBeDefined();
      expect(user.password).toBeUndefined(); // Should not return password
    });

    it('throws error for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'candidate'
      };

      await User.create(userData, db);
      
      await expect(User.create(userData, db)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('finds user by email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'candidate'
      };

      await User.create(userData, db);
      const user = await User.findByEmail('john@example.com', db);

      expect(user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'candidate'
      });
    });

    it('returns null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com', db);
      expect(user).toBeNull();
    });
  });
});
```

### Route Testing
```javascript
// server/tests/routes/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const { getConnection } = require('../setup');

describe('Auth Routes', () => {
  let db;

  beforeAll(() => {
    db = getConnection();
  });

  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'candidate'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'candidate'
        }
      });
      expect(response.body.token).toBeDefined();
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'john@example.com'
          // Missing name, password, role
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'password' }),
          expect.objectContaining({ field: 'role' })
        ])
      );
    });

    it('prevents duplicate email registration', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'candidate'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'candidate'
        });
    });

    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          email: 'john@example.com'
        }
      });
      expect(response.body.token).toBeDefined();
    });

    it('rejects invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });
});
```

### Middleware Testing
```javascript
// server/tests/middleware/auth.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

describe('Auth Middleware', () => {
  let validToken;
  let expiredToken;

  beforeAll(() => {
    validToken = jwt.sign(
      { userId: 1, role: 'candidate' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    expiredToken = jwt.sign(
      { userId: 1, role: 'candidate' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );
  });

  it('allows access with valid token', async () => {
    await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  it('rejects request without token', async () => {
    await request(app)
      .get('/api/users/profile')
      .expect(401);
  });

  it('rejects request with invalid token', async () => {
    await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('rejects request with expired token', async () => {
    await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
```

## End-to-End Testing

### Detox Configuration
```javascript
// .detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  configurations: {
    'ios.sim.debug': {
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/SkillNet.app',
      build: 'xcodebuild -workspace ios/SkillNet.xcworkspace -scheme SkillNet -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    'android.emu.debug': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_30'
      }
    }
  }
};
```

### E2E Test Examples
```javascript
// e2e/auth.e2e.js
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should allow user to sign up', async () => {
    await element(by.id('signup-button')).tap();
    
    await element(by.id('name-input')).typeText('John Doe');
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('role-candidate')).tap();
    
    await element(by.id('submit-signup')).tap();
    
    await expect(element(by.text('Learn'))).toBeVisible();
  });

  it('should allow user to log in', async () => {
    await element(by.id('login-button')).tap();
    
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('password123');
    
    await element(by.id('submit-login')).tap();
    
    await expect(element(by.text('Learn'))).toBeVisible();
  });

  it('should toggle between candidate and HR mode', async () => {
    // Login first
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-login')).tap();
    
    // Check candidate mode
    await expect(element(by.text('Learn'))).toBeVisible();
    
    // Toggle to HR mode
    await element(by.id('profile-tab')).tap();
    await element(by.id('mode-toggle')).tap();
    
    // Check HR mode
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });
});

// e2e/learning.e2e.js
describe('Learning Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login as candidate
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('john@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-login')).tap();
  });

  it('should display roadmaps', async () => {
    await element(by.id('learn-tab')).tap();
    await expect(element(by.id('roadmaps-list'))).toBeVisible();
  });

  it('should allow enrollment in roadmap', async () => {
    await element(by.id('learn-tab')).tap();
    await element(by.id('roadmap-1')).tap();
    await element(by.id('enroll-button')).tap();
    
    await expect(element(by.text('Enrolled'))).toBeVisible();
  });

  it('should track progress', async () => {
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('progress-section'))).toBeVisible();
    await expect(element(by.text('1 Roadmap'))).toBeVisible();
  });
});
```

## Test Data Factories

### User Factory
```javascript
// tests/factories/userFactory.js
const bcrypt = require('bcrypt');

const userFactory = {
  build: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'candidate',
    ...overrides
  }),

  buildWithHashedPassword: async (overrides = {}) => {
    const user = userFactory.build(overrides);
    user.password = await bcrypt.hash(user.password, 10);
    return user;
  },

  create: async (overrides = {}, db) => {
    const user = await userFactory.buildWithHashedPassword(overrides);
    return await User.create(user, db);
  }
};

module.exports = userFactory;
```

### Roadmap Factory
```javascript
// tests/factories/roadmapFactory.js
const roadmapFactory = {
  build: (overrides = {}) => ({
    title: 'Test Roadmap',
    description: 'Test roadmap description',
    category: 'web_development',
    difficulty: 'beginner',
    estimated_duration: '4 weeks',
    skills: ['JavaScript', 'React'],
    ...overrides
  }),

  create: async (overrides = {}, db) => {
    const roadmap = roadmapFactory.build(overrides);
    return await Roadmap.create(roadmap, db);
  }
};

module.exports = roadmapFactory;
```

## Performance Testing

### Load Testing with Artillery
```yaml
# performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/roadmaps"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

## Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:performance": "artillery run performance/load-test.yml",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: skillnet_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DB_HOST: localhost
        DB_USER: postgres
        DB_PASSWORD: postgres
        DB_NAME: skillnet_test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  e2e:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup iOS Simulator
      run: |
        xcrun simctl create "iPhone 14" "iPhone 14"
        xcrun simctl boot "iPhone 14"
    
    - name: Build for testing
      run: npm run test:e2e:build
    
    - name: Run E2E tests
      run: npm run test:e2e
```

## Test Best Practices

### General Guidelines
1. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Test Isolation**: Each test should be independent
3. **Descriptive Names**: Test names should describe the expected behavior
4. **Mock External Dependencies**: Use mocks for API calls, databases, etc.
5. **Test Coverage**: Aim for 80%+ coverage but focus on critical paths

### Frontend Testing
1. **User-Centric Testing**: Test from user's perspective
2. **Component Testing**: Test component behavior, not implementation
3. **State Management**: Test context and state changes
4. **Navigation**: Test navigation flows and route parameters

### Backend Testing
1. **Database Testing**: Use in-memory database for tests
2. **API Testing**: Test all HTTP methods and status codes
3. **Authentication**: Test protected routes and permissions
4. **Error Handling**: Test error scenarios and edge cases

### Performance Considerations
1. **Test Speed**: Keep tests fast with proper mocking
2. **Parallel Execution**: Run tests in parallel when possible
3. **Resource Cleanup**: Clean up resources after tests
4. **Test Data**: Use factories for consistent test data

## Debugging Tests

### Common Issues
1. **Async Operations**: Use proper async/await or waitFor
2. **Timer Issues**: Mock timers when testing time-dependent code
3. **Network Requests**: Mock all external API calls
4. **State Persistence**: Clear state between tests

### Debugging Tools
- `console.log` for debugging test failures
- `screen.debug()` for React Native Testing Library
- `--verbose` flag for detailed Jest output
- VS Code Jest extension for interactive debugging
