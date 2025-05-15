# DropTidy Development Workflow Guide

This guide explains how to use the various npm scripts for developing, testing, and deploying the DropTidy application across different platforms, with special focus on our enhanced unified build system with advanced TypeScript error detection and handling.

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

## Enhanced Unified Build System

Our unified build system provides a robust solution for building DropTidy across platforms, with advanced TypeScript error handling and automatic fixes.

### Testing the Build System

Before deployment, always test the build process:

```bash
# Run the unified build test script (interactive)
npm run test:unified

# Test with dry run (non-destructive)
node unified-web-build.js --dry-run --verbose
```

### Building for Web Deployment

```bash
# Standard unified web build
npm run build:web:unified

# Build with TypeScript fixes (recommended for most cases)
npm run build:web:unified:fix

# Build with enhanced TypeScript error analysis and reporting
npm run build:web:unified:advanced

# Build bypassing TypeScript checks (use only if needed)
npm run build:web:unified:bypass

# Legacy build method (not recommended)
npm run build:web
```

### Deployment Options

```bash
# Preview the Netlify deployment using advanced build
npm run netlify:preview

# Deploy to Netlify production with advanced error handling
npm run netlify:deploy

# Check Netlify deployment status
npm run netlify:status

# Open the Netlify dashboard
npm run netlify:open
```

### Building for Electron

```bash
# Build the Electron application
npm run build:electron

# Package for distribution
npm run package:electron
```

## TypeScript Error Handling

Our enhanced unified build system includes advanced TypeScript error detection, analysis, and automatic fixing capabilities.

### Error Analysis

When TypeScript errors occur during build:

1. The system analyzes error patterns
2. Provides suggestions based on error types
3. Attempts automatic fixes for common issues
4. Generates detailed error reports

### Common Error Patterns and Solutions

| Error Pattern | Detection | Solution |
|---------------|-----------|----------|
| Boolean vs String type mismatch | `Type 'boolean' is not assignable to type 'string'` | Use string conversion (`"true"` instead of `true`) |
| Electron API calls | `Property does not exist on electronAPI` | Create web fallbacks in fixed-files directory |
| Node.js module imports | `Cannot find module 'fs'` | Use browser-compatible alternatives |

### Managing Error Logs

Error logs are automatically saved when using the `--log` option:

```bash
# View the latest error log
ls -la web-build-unified-*.log | tail -1 | xargs cat
```

## Cross-Platform Development Best Practices

### File Organization

1. **Platform Detection**:
   ```typescript
   import { isWeb } from '@/lib/environment';
   
   if (isWeb()) {
     // Web-specific code
   } else {
     // Electron-specific code
   }
   ```

2. **Fixed Files**:
   For complex components that need significant changes, create web-specific versions in the `fixed-files/` directory.
   
   Steps to add a new fixed file:
   
   ```bash
   # 1. Create a new web-compatible version
   touch fixed-files/MyComponent.tsx
   
   # 2. Edit the file with web-compatible implementation
   code fixed-files/MyComponent.tsx
   
   # 3. Add the file to config.fixedFiles in unified-web-build.js
   # Example: 'src/components/MyComponent.tsx'
   
   # 4. Test the build with your new fixed file
   node unified-web-build.js --dry-run --verbose
   ```

3. **Feature Adaptation**:
   ```typescript
   function saveFile(content) {
     if (isWeb()) {
       // Use browser download API
       const blob = new Blob([content]);
       const url = URL.createObjectURL(blob);
       // ...
     } else {
       // Use Electron API
       electronAPI.saveFile(content);
     }
   }
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
   - Use the `isWeb()` utility from `src/lib/environment.web.ts`
   - Provide web fallbacks for Electron functionality
   - Consider conditional imports/requires
   - Create fixed files for components with complex differences

### Recovery from Build Issues

If the build process corrupts your files:

```bash
# Restore all files from backups
npm run restore:netlify:backups

# or
npm run restore:web:backups

# or restore all backups
npm run restore:backups
```

### Checking for TypeScript Errors

```bash
# Run TypeScript check only
npx tsc -p tsconfig.web.json --noEmit

# Analyze errors with our enhanced build script
node unified-web-build.js --verbose --log
```

### Deployment Checklist

Before deploying to Netlify, follow these steps:

1. Test the application locally in web mode
2. Run `npm run test:unified` to verify the build process
3. Check for TypeScript errors with `--verbose` mode
4. Test the application on the preview URL
5. Follow the [Web Deployment Checklist](WEB-DEPLOYMENT-CHECKLIST.md)

## Web Build Process

The web build process uses `prepare-web-build.js` to:

1. Create backups of files containing Electron-specific code
2. Modify those files to be web-compatible
3. Build the application
4. (Optionally) restore backups with `npm run restore:backups`

This ensures that your code can be deployed to Netlify without TypeScript errors related to Electron APIs.
