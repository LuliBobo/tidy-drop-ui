# DropTidy Web Deployment Guide

This guide explains how to deploy your DropTidy application to Netlify, ensuring proper handling of Electron-specific code in the web environment.

## Understanding Web vs Electron Builds

DropTidy is designed to run in two environments:

1. **Electron Desktop App**: The full-featured desktop application with access to file system and native APIs
2. **Web Application**: A web-based version hosted on Netlify with fallbacks for desktop-specific features

The key to making this work is proper **environment detection** and **conditional code execution**.

## Deployment Steps

### 1. Prepare Your Code for Web Deployment

Before deploying, make sure your code is ready for the web environment:

```bash
# Run the web preparation script
npm run prepare:web

# Build specifically for web with environment variables set
npm run build:web
```

The `prepare:web` script modifies your codebase to be compatible with web deployment by:
- Creating backups of files containing Electron-specific code
- Modifying those files to be web-compatible
- Adding web fallbacks for Electron-specific functionality

### 2. Test Your Web Build Locally

Before deploying to Netlify, test your web build locally:

```bash
# Run a local development server with web environment
npm run dev:web

# Test with Netlify functions (if you're using them)
npm run netlify:dev

# Or run both together
npm run dev:full
```

### 3. Deploy to Netlify

Once you're satisfied with your local testing, deploy to Netlify:

```bash
# Preview the deployment first (creates a draft URL)
npm run netlify:preview

# Deploy to production
npm run netlify:deploy
```

Alternatively, you can deploy through the Netlify dashboard by connecting your GitHub repository.

## Key Files and Their Purposes

### 1. `netlify.toml`

This is the Netlify configuration file that specifies:
- Build commands and settings
- Redirect rules for SPA routing
- Environment variables for the build process
- Function configuration

### 2. `src/lib/environment.ts`

This utility provides:
- Functions to detect the current environment (`isElectron()`, `isWeb()`)
- Safe ways to invoke Electron IPC methods with web fallbacks
- Helper for conditional imports using `importElectron()`

### 3. `prepare-web-build.js`

This script automatically modifies your codebase for web compatibility by:
- Scanning for Electron-specific code
- Creating backups of affected files
- Making necessary modifications for web compatibility

### 4. `restore-backups.js`

After building for web deployment, you can restore the original files:

```bash
npm run restore:backups
```

## Troubleshooting Common Issues

### 1. Typescript Errors During Build

If you're experiencing TypeScript errors related to Electron imports:

- Make sure to use the `importElectron()` utility for conditional imports
- Check that `VITE_IS_WEB_BUILD` is properly set during builds
- Verify that your `isElectron()` function checks for this environment variable

### 2. IPC Calls Failing in Web Environment

For components that use Electron IPC:

- Always use the `safeIpcInvoke()` function with a web fallback
- Check the environment with `if (import.meta.env.VITE_IS_WEB_BUILD === 'true')` for direct web code

### 3. Function Timeout Issues

If your Netlify functions are timing out:

- Check the `[functions]` section in `netlify.toml` is correctly formatted
- Use function-specific timeout configuration: `[functions.my-function] timeout = 10`

## Best Practices

1. **Use Environment Detection**: Always check the environment before using Electron-specific APIs
   ```typescript
   import { isElectron } from '@/lib/environment';

   if (isElectron()) {
     // Electron-specific code
   } else {
     // Web-compatible alternative
   }
   ```

2. **Provide Web Fallbacks**: For critical functionality, always provide web alternatives
   ```typescript
   const result = await safeIpcInvoke('some-channel', args, webFallbackFunction);
   ```

3. **Use Feature Detection**: Check for feature availability before using it
   ```typescript
   if (window.electron?.ipcRenderer) {
     // Use IPC
   } else {
     // Web alternative
   }
   ```

4. **Test Both Environments**: Regularly test in both Electron and web contexts
   ```bash
   # Test Electron version
   npm run electron:dev
   
   # Test web version
   npm run dev:web
   ```

By following these guidelines, you'll ensure your DropTidy application works seamlessly in both desktop and web environments!
