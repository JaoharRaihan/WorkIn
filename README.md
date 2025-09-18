<<<<<<< HEAD
=======
<<<<<<< HEAD
# WorkIn
No CVs, no spam — just learning, progress, and real hiring.
=======
>>>>>>> 4e834ef
# WorkIn - Professional Skills & Verified Hiring Platform 🚀

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌐 Live Demo
**Experience WorkIn Platform Live**: [https://workin-platform.netlify.app](https://workin-platform.netlify.app)

**WorkIn** is a revolutionary professional platform that eliminates traditional job postings and applications by replacing them with **verified skills**, **project portfolios**, **comprehensive testing**, and **real-time progress tracking**.

## 🎯 Core Concept

**WorkIn transforms hiring by focusing on PROOF, not promises.**

- **👨‍💼 Candidate Mode** → Learn skills, take verified tests, build portfolio, track progress
- **🏢 HR Mode** → Search verified candidates, view skill proofs, request interviews instantly
- **📱 Social Feed** → Fun-with-learning experience, skill endorsements, community engagement

## ✨ Key Features

### Candidate Features
- 📚 **Learning Roadmaps**: Structured skill development paths
- 🎯 **Skill Tests**: MCQ, coding challenges, and project uploads
- 🏆 **Verified Badges**: Earn credible skill certifications
- 📱 **Progress Feed**: Gamified learning milestones and achievements
- 👤 **Profile Showcase**: Display verified skills and projects

### HR Features
- 🔍 **Smart Candidate Search**: Filter by skills, experience, location
- 📊 **HR Dashboard**: Metrics, saved candidates, recent searches
- 💾 **Candidate Management**: Save and organize potential hires
- 📅 **Interview Requests**: Send and manage interview invitations
- 🎯 **Anonymous Discovery**: View skills before revealing identity

### Unique Features
- 🔄 **Mode Toggle**: Seamless switching between candidate and HR views
- 🎮 **Gamification**: Badges, milestones, and progress tracking
- ✅ **Verified Skills**: Trusted skill verification through tests and projects
- 🤝 **Mentor Network**: Peer and mentor endorsements
- 🔒 **Anonymous Profiles**: Privacy-first candidate discovery

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for routing
- **React Context** for state management
- **AsyncStorage** for data persistence

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **Helmet** for security

### Planned Integrations
- **Firebase/Auth0** for authentication
- **AWS S3** for file storage
- **Stripe** for premium features

## 📁 Project Structure

```
skillnet-app/
├── app/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   │   ├── Auth/           # Login, signup screens
│   │   ├── Candidate/      # Candidate mode screens
│   │   ├── HR/             # HR mode screens
│   │   └── Shared/         # Shared screens (settings)
│   ├── context/            # React context providers
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API service functions
│   └── utils/              # Utility functions
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillnet-app
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment setup**
   ```bash
   # Copy environment file in server directory
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

4. **Start the development servers**
   ```bash
   # Start backend server (in one terminal)
   cd server
   npm run dev
   
   # Start React Native app (in another terminal)
   npm start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### User Endpoints
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/toggleMode` - Switch between candidate/HR mode

### Roadmap Endpoints
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id` - Get specific roadmap
- `POST /api/roadmaps/:id/progress` - Update learning progress

### Test Endpoints
- `GET /api/tests` - Get available tests
- `POST /api/tests/:id/submit` - Submit test answers

### HR Endpoints
- `GET /api/hr/candidates` - Search candidates
- `POST /api/hr/saveCandidate` - Save candidate
- `POST /api/hr/interviewRequest` - Send interview request

## 🎨 Design System

### Colors
- **Primary**: #007AFF (iOS Blue)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)
- **Danger**: #FF3B30 (Red)
- **Background**: #F2F2F7 (Light Gray)

### Typography
- **Headers**: System Bold
- **Body**: System Regular
- **Captions**: System Light

## 🚦 Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper TypeScript types
- Follow React Native best practices
- Write self-documenting code

### State Management
- Use React Context for global state
- Local state for component-specific data
- Implement proper error handling

### Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end testing for critical flows

## 🔒 Security Features

- JWT token authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- Environment variable protection

## 📱 Supported Platforms

- iOS (iPhone, iPad)
- Android (Phone, Tablet)
- Web (Progressive Web App)

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- [x] Basic authentication
- [x] Mode switching functionality
- [x] Candidate learning interface
- [x] HR dashboard and search
- [x] Core navigation

### Phase 2 (Enhanced Features)
- [ ] Real database integration (PostgreSQL)
- [ ] File upload capabilities
- [ ] Push notifications
- [ ] Advanced search filters

### Phase 3 (Advanced Features)
- [ ] AI-powered candidate matching
- [ ] Video interview integration
- [ ] Advanced analytics dashboard
- [ ] Premium subscription features

### Phase 4 (Scale)
- [ ] Multi-language support
- [ ] Company profile pages
- [ ] Integration with job boards
- [ ] Mobile app store deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React Native, UI/UX
- **Backend Development**: Node.js, API Design
- **Database Design**: PostgreSQL, Data Architecture
- **DevOps**: Deployment, CI/CD

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**SkillNet** - Bridging the gap between learning and hiring through verified skills and meaningful connections.
<<<<<<< HEAD
=======
>>>>>>> 6a13641 (🎉 WorkIn Platform - Initial commit)
>>>>>>> 4e834ef
