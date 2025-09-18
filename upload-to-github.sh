#!/bin/bash

# WorkIn - GitHub Upload Script
echo "🚀 WorkIn Platform - GitHub Upload Preparation"
echo "============================================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
*/node_modules/

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# typescript
*.tsbuildinfo

# IDE
.vscode/
.idea/

# Logs
logs
*.log

# Temporary files
*.tmp
*.temp
EOL
    echo "✅ .gitignore created"
fi

# Stage all files
echo "📝 Staging files for commit..."
git add .

# Create initial commit
echo "📝 Creating initial commit..."
git commit -m "🎉 Initial commit: WorkIn Platform

✨ Features:
- Complete skill assessment platform
- 52 tests across 17 professional sectors
- Cross-platform (Web, iOS, Android)
- Professional WorkIn branding
- MCQ test system with scoring
- Backend API integration
- Ready for production deployment

🚀 Ready to deploy on:
- Web (Netlify, Vercel, GitHub Pages)
- iOS App Store
- Google Play Store

📱 WorkIn - Transform your career with verified skills!"

echo "✅ Initial commit created"

echo ""
echo "🎯 Next Steps:"
echo "1. Create GitHub repository: https://github.com/new"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin [YOUR_REPO_URL]"
echo "4. Run: git branch -M main"
echo "5. Run: git push -u origin main"
echo ""
echo "🌐 For web deployment:"
echo "- Netlify: Upload 'dist' folder"
echo "- Vercel: cd dist && vercel --prod"
echo "- GitHub Pages: Enable in repository settings"
echo ""
echo "🎊 WorkIn Platform is ready for the world!"
