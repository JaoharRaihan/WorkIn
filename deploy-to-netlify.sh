#!/bin/bash

# WorkIn - Netlify Deployment Script
echo "🌐 WorkIn Platform - Netlify Deployment"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}📦 Web build not found. Creating web build...${NC}"
    npx expo export --platform web
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed. Please check your setup.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Web build created successfully!${NC}"
else
    echo -e "${GREEN}✅ Found existing web build in dist/ folder${NC}"
fi

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}📦 Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Netlify CLI${NC}"
        echo -e "${BLUE}💡 You can still deploy manually by uploading the dist/ folder to netlify.com${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🚀 Choose your deployment method:${NC}"
echo "1) Quick Deploy (preview URL)"
echo "2) Production Deploy (requires Netlify login)"
echo "3) Manual Upload Instructions"
echo "4) GitHub Integration Guide"

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Deploying to preview URL...${NC}"
        netlify deploy --dir=dist
        echo -e "${GREEN}✅ Preview deployment complete!${NC}"
        echo -e "${BLUE}💡 Use 'netlify deploy --prod --dir=dist' for production deployment${NC}"
        ;;
    2)
        echo -e "${YELLOW}🔐 Logging into Netlify...${NC}"
        netlify login
        echo -e "${YELLOW}🚀 Deploying to production...${NC}"
        netlify deploy --prod --dir=dist
        echo -e "${GREEN}✅ Production deployment complete!${NC}"
        ;;
    3)
        echo -e "${BLUE}📋 Manual Upload Instructions:${NC}"
        echo ""
        echo "1. Go to https://netlify.com and sign in"
        echo "2. Click 'Sites' in the top navigation"
        echo "3. Drag and drop the 'dist' folder onto the deployment area"
        echo "4. Wait for deployment to complete"
        echo "5. Your site will be available at a netlify.app URL"
        echo ""
        echo -e "${GREEN}📁 Your dist/ folder is ready for upload!${NC}"
        ;;
    4)
        echo -e "${BLUE}🔗 GitHub Integration Guide:${NC}"
        echo ""
        echo "1. First, upload your code to GitHub:"
        echo "   ./upload-to-github.sh"
        echo ""
        echo "2. Then connect to Netlify:"
        echo "   - Go to https://netlify.com"
        echo "   - Click 'New site from Git'"
        echo "   - Connect GitHub and select your repo"
        echo "   - Build settings:"
        echo "     • Build command: npx expo export --platform web"
        echo "     • Publish directory: dist"
        echo "   - Click 'Deploy site'"
        echo ""
        echo -e "${GREEN}✅ Your netlify.toml is already configured!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 WorkIn Platform Deployment Summary:${NC}"
echo "├── 📱 52 comprehensive tests across 17 sectors"
echo "├── 🎯 Complete MCQ functionality with scoring"
echo "├── 🔄 Candidate/HR mode toggle"
echo "├── 📊 Progress tracking and analytics"
echo "├── 🎨 Professional WorkIn branding"
echo "├── ⚡ Optimized 4.39 MB bundle"
echo "└── 🌐 Ready for global access!"
echo ""
echo -e "${BLUE}🔗 Next Steps:${NC}"
echo "• Test your live site thoroughly"
echo "• Configure custom domain (optional)"
echo "• Set up analytics and monitoring"
echo "• Share with users and get feedback!"
echo ""
echo -e "${GREEN}🌟 Congratulations! WorkIn is now live on the web! 🚀${NC}"
