# DropTidy Deployment Guide

This guide explains how to deploy the simplified DropTidy application on both web and desktop platforms.

## Branch Structure

The repository has been simplified to three branches:

- **main** - Stable core branch with the simplified application
- **local** - Testing branch for local development
- **net** - Production branch for web deployment

## Web Deployment (Netlify)

For deploying the web version of DropTidy:

1. **Prepare for deployment**:
   ```bash
   # Checkout the net branch
   git checkout net
   
   # Clean up unnecessary files
   ./cleanup.sh
   
   # Build the application
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Set environment variables if needed

3. **Domain Configuration**:
   - Set up a custom domain in Netlify settings
   - Configure DNS records as directed by Netlify

## Desktop Deployment (Electron)

For building the desktop application:

1. **Prepare for release**:
   ```bash
   # Checkout the main branch
   git checkout main
   
   # Clean up unnecessary files
   ./cleanup.sh
   ```

2. **Build for different platforms**:
   ```bash
   # Build for all platforms
   npm run electron:build
   
   # Build for specific platforms (in package.json):
   # "electron:build:mac": "npm run build && electron-builder --mac"
   # "electron:build:win": "npm run build && electron-builder --win"
   # "electron:build:linux": "npm run build && electron-builder --linux"
   ```

3. **Distribute the application**:
   - Installer packages will be in the `release` folder
   - macOS: `.dmg` and `.zip` files
   - Windows: `.exe` installer
   - Linux: `.AppImage` and `.deb` packages

## Updates and Maintenance

### Making Updates

```bash
# Always start from main for new features
git checkout main

# Create a feature branch
git checkout -b feature/your-feature-name

# After development and testing
git checkout main
git merge feature/your-feature-name

# Update testing and production branches
git checkout local
git merge main
git checkout net
git merge main
```

### Troubleshooting

If you encounter issues with the white screen problem:

1. **Web Deployment**:
   - Check browser console for errors
   - Verify that all assets are loading correctly
   - Check Content Security Policy in the index.html

2. **Electron Deployment**:
   - Enable DevTools: `mainWindow.webContents.openDevTools()`
   - Check console for errors
   - Verify the preload script is being loaded correctly

## Required Dependencies

- Node.js 16+ and npm
- For Electron builds: 
  - Windows: No specific requirements
  - macOS: Xcode Command Line Tools
  - Linux: Required libraries for Electron
- For metadata removal in Electron:
  - ExifTool (for image metadata)
  - FFmpeg (for video metadata)
