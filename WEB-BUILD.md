# Web Build Preparation Script

This documentation explains how to use the `prepare-web-build.js` script to make your DropTidy codebase compatible with web deployment, particularly on Netlify.

## Overview

When deploying a cross-platform Electron/React application to the web, Electron-specific code can cause TypeScript errors and runtime failures. This script automatically modifies your codebase to handle these issues before web builds.

## Features

- Automatically detects and modifies Electron-specific code for web compatibility
- Creates backups of all modified files
- Adds web fallbacks for IPC calls
- Integrates with your build process through npm scripts
- Provides detailed logs for debugging

## Usage

### Preparing for Web Build

```bash
# Run the web preparation script
npm run prepare:web

# Build for web deployment (runs prepare:web automatically)
npm run build:web
```

### Restoring from Backups

After building for the web, you can restore the original files from backups:

```bash
npm run restore:backups
```

### Integration with Netlify

The script is integrated with your Netlify configuration and will automatically run during Netlify deployments.

## How It Works

### 1. Environment Detection Update

The script first updates the `isElectron()` function in `src/lib/environment.ts` to respect the `VITE_IS_WEB_BUILD` environment variable. This ensures proper environment detection during web builds.

### 2. Code Modifications

The script then scans all TypeScript and JavaScript files in your project (excluding the main process and preload script files) and applies the following transformations:

#### Import Statements

```typescript
// Before
import { ipcRenderer } from 'electron';

// After
// WEB BUILD: Electron import removed for web deployment
```

#### Require Statements

```typescript
// Before
const { app } = require('electron');

// After
// WEB BUILD: Electron require statement removed for web deployment
```

#### IPC Renderer Calls

```typescript
// Before
const result = await window.electron?.ipcRenderer.invoke('save-settings', settings);

// After
const result = await /* WEB BUILD: Added web fallback */ (window.electron?.ipcRenderer.invoke('save-settings', settings)).catch(err => { 
  console.warn("IPC call failed in web context:", err); 
  return undefined; 
});
```

#### Electron-specific API Access

```typescript
// Before
window.electron.app.getPath('documents');

// After
/* WEB BUILD: Safe access */ (window.electron && window.electron.app.getPath || (() => Promise.resolve(undefined)))('documents');
```

## Regex Patterns Explained

1. **Electron Imports**
   ```regex
   /^import\s+.*?\s+from\s+['"]electron['"].*?;?$/gm
   ```
   This pattern matches import statements that specifically import from the 'electron' module.

2. **Electron Require Statements**
   ```regex
   /(?:const|let|var)\s+.*?\s*=\s*require\(['"]electron['"]\).*?;?$/gm
   ```
   This pattern matches CommonJS require statements for the electron module.

3. **Direct Window.Electron Usage**
   ```regex
   /(window\.electron\.)(\w+)(\.\w+\()/g
   ```
   This pattern identifies direct usage of the electron API through the window object.

4. **IPC Renderer Invoke Calls**
   ```regex
   /(window\.electron\?\.ipcRenderer\.invoke\(['"].*?['"])([^)]*)\)/g
   ```
   This pattern finds IPC invoke calls and adds error handling for web contexts.

## Best Practices

1. **Use Environment Detection**: Always check the environment before using Electron-specific APIs:
   ```typescript
   import { isElectron } from '@/lib/environment';

   if (isElectron()) {
     // Electron-specific code here
   } else {
     // Web-compatible alternative
   }
   ```

2. **Provide Web Fallbacks**: For critical functionality, provide alternative implementations:
   ```typescript
   const filePath = isElectron()
     ? await window.electron?.ipcRenderer.invoke('get-file-path')
     : await webFallbackFunction();
   ```

3. **Use Feature Detection**: Check for feature availability before using it:
   ```typescript
   if (window.electron?.ipcRenderer) {
     // Use IPC
   } else {
     // Web alternative
   }
   ```

## Troubleshooting

If you encounter issues with the script:

1. Check the log file created during the preparation process (named `web-build-modifications-{timestamp}.log`)
2. Look for errors in the console output
3. Restore from backups using `npm run restore:backups` if necessary
4. Manually verify the modified files to ensure they're working as expected

For more assistance, refer to the CROSS-PLATFORM.md and NETLIFY-DEPLOY.md documentation.
