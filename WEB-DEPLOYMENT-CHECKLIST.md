# DropTidy Web Deployment Checklist

This checklist helps ensure a successful deployment of DropTidy to Netlify or other web hosting platforms.

## Pre-Deployment Tasks

- [ ] Ensure all changes are committed to Git
- [ ] Test the application locally in web mode (`npm run dev:web`)
- [ ] Check for any TypeScript errors with our validation tools 
- [ ] Verify all fixed files are up to date in the `fixed-files/` directory
- [ ] Test the build process locally with dry run:
    ```bash
    node unified-web-build.js --dry-run --verbose
    ```
- [ ] Run the complete test build:
    ```bash
    npm run test:unified
    ```

## Deployment Process

### 1. Prepare the Build

- [ ] Update any environment configurations
- [ ] Run the advanced build process:
    ```bash
    npm run build:web:unified:advanced
    ```
- [ ] If TypeScript errors occur, check the error analysis in the log
- [ ] Fix any reported issues or create web-compatible versions

### 2. Deploy to Netlify

- [ ] Use our Netlify deployment command:
    ```bash
    npm run netlify:preview
    ```
- [ ] Review the preview URL to verify functionality
- [ ] Check browser console for any runtime errors
- [ ] Test all features that have web alternatives

### 3. Production Deployment

- [ ] Deploy to production:
    ```bash
    npm run netlify:deploy
    ```
- [ ] Verify the production URL
- [ ] Test key user flows on various browsers and devices

## Post-Deployment Verification

- [ ] Verify metadata removal functionality works in the web version
- [ ] Check that file uploading works correctly
- [ ] Confirm fallbacks for Electron-specific features show appropriate messages
- [ ] Verify that dark/light mode works correctly
- [ ] Test responsive layout on mobile, tablet and desktop

## Troubleshooting

If deployment fails:

1. Check build logs for TypeScript errors
2. Review the error analysis output in the log file
3. Try the fallback bypass approach:
    ```bash
    npm run build:web:unified:bypass
    ```
4. Restore any corrupted files:
    ```bash
    npm run restore:netlify:backups
    ```

## New Feature Development

When adding new features that require both web and desktop support:

1. Implement the feature with platform detection:
    ```typescript
    import { isWeb } from '@/lib/environment';
    
    function myFeature() {
      if (isWeb()) {
        // Web implementation
      } else {
        // Desktop implementation
      }
    }
    ```

2. Create web-compatible versions of any new files in `fixed-files/`
3. Update the unified build script to include any new files:
    ```javascript
    // In unified-web-build.js
    fixedFiles: [
      // Existing files...
      'src/path/to/new-file.ts'
    ]
    ```

## Script Reference

| Command | Purpose |
|---------|---------|
| `npm run build:web:unified` | Standard web build with TypeScript validation |
| `npm run build:web:unified:fix` | Build with automatic TypeScript fixes |
| `npm run build:web:unified:advanced` | Build with enhanced error detection |
| `npm run build:web:unified:bypass` | Build bypassing TypeScript validation |
| `npm run netlify:preview` | Deploy to Netlify preview URL |
| `npm run netlify:deploy` | Deploy to Netlify production |
| `npm run test:unified` | Test the unified build process |
| `npm run restore:netlify:backups` | Restore original files from backups |

---

This checklist ensures a systematic approach to deploying DropTidy, reducing the risk of deployment issues.
