#!/bin/bash

# SkillNet Quick Deployment Script
# This script builds and deploys the SkillNet app to Netlify

echo "🚀 Starting SkillNet Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "App.js" ]; then
    print_error "Please run this script from the SkillNet project root directory"
    exit 1
fi

print_status "Checking project structure..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not found. Installing..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

print_success "Dependencies are ready"

# Clean previous build
print_status "Cleaning previous build..."
rm -rf dist/
rm -rf .expo/

# Build for web
print_status "Building web version..."
npm run build:web

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the errors above."
    exit 1
fi

print_success "Build completed successfully!"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    print_error "Build output not found. Something went wrong."
    exit 1
fi

# Get build size
BUILD_SIZE=$(du -sh dist/ | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_warning "Netlify CLI not found. Please choose deployment method:"
    echo ""
    echo "Option 1: Install Netlify CLI and deploy"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify deploy --prod --dir=dist"
    echo ""
    echo "Option 2: Manual upload"
    echo "  Go to netlify.com and drag/drop the 'dist' folder"
    echo ""
    echo "Option 3: Git-based deployment"
    echo "  Push to GitHub and connect repository to Netlify"
    echo ""
    print_warning "Build is ready in 'dist' folder - choose your deployment method!"
    exit 0
fi

# Deploy with Netlify CLI
print_status "Deploying to Netlify..."

# Check if user is logged in
netlify status &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Please login to Netlify first:"
    echo "  netlify login"
    exit 1
fi

# Deploy
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment successful!"
    echo ""
    echo "Your SkillNet app is now live!"
    echo "Check your Netlify dashboard for the URL."
    echo ""
    echo "Next steps:"
    echo "1. Test all functionality on the live site"
    echo "2. Deploy the backend API (server folder)"
    echo "3. Update API endpoints in the frontend"
    echo "4. Set up custom domain (optional)"
    echo ""
    print_success "Welcome to the future of learning and hiring! 🚀"
else
    print_error "Deployment failed. Please check the errors above."
    exit 1
fi
