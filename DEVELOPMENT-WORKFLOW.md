# DropTidy Development Workflow Guide

This guide explains how to use the various npm scripts for developing, testing, and deploying the DropTidy application across different platforms.

## Development Workflows

### Web Development

```bash
# Start Vite development server for web development
npm run dev:web

# Start Netlify dev environment (includes serverless functions)
npm run netlify:dev

# Run both web development server and Netlify functions in parallel
npm run dev:full
```

### Electron Development

```bash
# Start Electron development environment
npm run electron:dev

# Build the Electron app
npm run build:electron

# Package the Electron app for distribution
npm run package:electron
```

## Building for Different Platforms

### Building for Web Deployment

```bash
# Build the web version with Electron code modifications
npm run build:web

# Preview the Netlify deployment locally
npm run netlify:preview

# Deploy to Netlify production
npm run netlify:deploy
```

### Building for Electron

```bash
# Build the Electron application
npm run build:electron

# Package for distribution
npm run package:electron
```

## Testing

```bash
# Run all tests
npm test

# Run only frontend tests
npm run test:frontend

# Run only backend tests
npm run test:backend

# Run Netlify function tests
npm run test:functions
```

## Handling Cross-Platform Code

After making changes to the codebase that include Electron-specific functionality:

1. Test in Electron with `npm run electron:dev`
2. Test the web version with `npm run dev:web`
3. If you encounter issues with Electron-specific code in web context:
   - Use the `isElectron()` utility from `src/lib/environment.ts`
   - Provide web fallbacks for Electron functionality
   - Consider conditional imports/requires

## Web Build Process

The web build process uses `prepare-web-build.js` to:

1. Create backups of files containing Electron-specific code
2. Modify those files to be web-compatible
3. Build the application
4. (Optionally) restore backups with `npm run restore:backups`

This ensures that your code can be deployed to Netlify without TypeScript errors related to Electron APIs.
