# SkillNet Deployment Guide

## Overview
This guide covers deployment options for the SkillNet application, including both frontend (React Native) and backend (Node.js) components.

## Prerequisites

### Development Environment
- Node.js 16+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL 12+ (for production database)
- Git

### Production Environment
- Server with Node.js 16+
- PostgreSQL database
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Frontend Deployment

### 1. Expo App Store Deployment

#### Build for iOS
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Build for Android
```bash
# Build for Android
eas build --platform android

# For Google Play Store
eas build --platform android --profile production
```

#### App Store Submission
```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

### 2. Web Deployment

#### Build for Web
```bash
# Install web dependencies
npx expo install react-dom react-native-web

# Build web version
npx expo export:web

# Deploy to Netlify/Vercel/AWS S3
# Upload the 'dist' folder to your hosting provider
```

### 3. Standalone App (Development)
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Backend Deployment

### 1. Environment Setup

#### Production Environment Variables
Create `.env` file in server directory:
```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-app-domain.com

# Database
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=skillnet_production
DB_USER=skillnet_user
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# AWS S3 (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=skillnet-production-uploads

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Database Setup

#### PostgreSQL Setup
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Create database and user
CREATE DATABASE skillnet_production;
CREATE USER skillnet_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE skillnet_production TO skillnet_user;

# Run schema
psql -h localhost -U skillnet_user -d skillnet_production -f database/schema.sql
```

### 3. Server Deployment Options

#### Option 1: Traditional VPS/Dedicated Server

##### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

##### Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd skillnet-app

# Install dependencies
cd server
npm install --production

# Start with PM2
pm2 start index.js --name "skillnet-api"
pm2 startup
pm2 save
```

##### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option 2: Docker Deployment

##### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

##### Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_NAME=skillnet
      - DB_USER=skillnet
      - DB_PASSWORD=password
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: skillnet
      POSTGRES_USER: skillnet
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

##### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f api
```

#### Option 3: Cloud Platform Deployment

##### Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create skillnet-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

##### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init skillnet-api

# Create environment
eb create production

# Deploy
eb deploy
```

##### Google Cloud Platform
```bash
# Install gcloud CLI
# Create App Engine app
gcloud app create

# Create app.yaml
cat > app.yaml << EOF
runtime: nodejs18

env_variables:
  NODE_ENV: production
  JWT_SECRET: your-jwt-secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
EOF

# Deploy
gcloud app deploy
```

## Database Migration

### Running Migrations
```bash
# Development
npm run migrate

# Production
NODE_ENV=production npm run migrate
```

### Backup and Restore
```bash
# Backup
pg_dump -h localhost -U skillnet_user skillnet_production > backup.sql

# Restore
psql -h localhost -U skillnet_user skillnet_production < backup.sql
```

## Monitoring and Maintenance

### Health Checks
- API health endpoint: `GET /health`
- Database connection monitoring
- Error tracking with services like Sentry

### Performance Monitoring
- Use PM2 monitoring for Node.js
- Database query optimization
- CDN for static assets

### Security
- Regular dependency updates
- SSL certificate renewal
- Database security patches
- API rate limiting

## Scaling Considerations

### Load Balancing
- Use Nginx or cloud load balancers
- Multiple API server instances
- Database read replicas

### Caching
- Redis for session management
- API response caching
- CDN for static assets

### File Storage
- AWS S3 for production file uploads
- Image optimization service
- Backup strategy for user data

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Check database credentials
   - Verify network connectivity
   - Review firewall settings

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

3. **Performance Issues**
   - Monitor database queries
   - Check memory usage
   - Review API response times

### Log Management
```bash
# PM2 logs
pm2 logs skillnet-api

# Docker logs
docker-compose logs -f api

# System logs
tail -f /var/log/nginx/error.log
```

## Rollback Strategy

### Quick Rollback
```bash
# PM2
pm2 stop skillnet-api
git checkout previous-working-commit
npm install
pm2 start skillnet-api

# Docker
docker-compose down
git checkout previous-working-commit
docker-compose up -d
```

### Database Rollback
- Maintain database backups before deployments
- Use migration rollback scripts
- Test rollback procedures regularly

## Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify backup completion

### Weekly
- Security updates
- Performance review
- Database maintenance

### Monthly
- Dependency updates
- Security audit
- Capacity planning review
