# Troubleshooting Guide for DropTidy Netlify Deployment

This guide provides solutions for common issues you might encounter when deploying DropTidy to Netlify.

## TypeScript Error Troubleshooting

### 1. "Cannot find module 'electron'" Errors

**Symptoms:**
- TypeScript errors mentioning 'electron' module not being found
- Build failures related to Electron imports

**Solutions:**

1. **Check if fixed-files version exists:**
   ```bash
   ls -la fixed-files/
   ```
   If a web-compatible version doesn't exist for the problematic file, create one.

2. **Add the file to fix-netlify-build.js:**
   ```javascript
   const filesToFix = [
     // existing entries
     'path/to/your/problematic/file.ts',
   ];
   ```

3. **Create a fixed version manually:**
   ```bash
   # First examine the original file
   cat src/path/to/problematic/file.ts
   
   # Then create a web-compatible version
   nano fixed-files/file.ts
   ```

### 2. Type Incompatibility Errors

**Symptoms:**
- "Type X is not assignable to type Y" errors
- "Property does not exist on type" errors

**Solutions:**

1. **Update interface definitions:**
   Check for type incompatibilities and create a fixed file with updated types.
   For example, if a component expects `cleaned: string | number` but receives `cleaned: boolean`:

   ```typescript
   // Original interface
   interface Metadata {
     cleaned: string | number;
   }
   
   // Fixed interface
   interface Metadata {
     cleaned: string | number | boolean;
   }
   ```

2. **Fix component props:**
   If component props changed between Electron and web versions, update the prop names in your fixed files.
   For example:

   ```tsx
   // Original component usage
   <FeedbackForm isOpen={true} onClose={() => {}} />
   
   // Fixed component usage
   <FeedbackForm open={true} onOpenChange={() => {}} />
   ```

## Build Process Troubleshooting

### 1. Script Execution Failures

**Symptoms:**
- "Command failed" errors during build
- Scripts not executing properly

**Solutions:**

1. **Check file permissions:**
   ```bash
   chmod +x fix-netlify-build.js restore-netlify-backups.js
   ```

2. **Run scripts individually to debug:**
   ```bash
   node fix-netlify-build.js
   ```

3. **Run the test script:**
   ```bash
   npm run test:netlify
   ```

### 2. Backup and Restore Issues

**Symptoms:**
- Original files not properly restored
- Error messages about missing backup files

**Solutions:**

1. **Check backup files:**
   ```bash
   find src -name "*.electron-backup"
   ```

2. **Manually restore if needed:**
   ```bash
   cp src/path/to/file.ts.electron-backup src/path/to/file.ts
   ```

3. **Reset all files:**
   If your repository is in a clean state, you can reset all files:
   ```bash
   git checkout -- src/
   ```

## Netlify-Specific Issues

### 1. Build Command Not Working

**Symptoms:**
- Netlify deploys fail with command errors
- Command not recognized

**Solutions:**

1. **Check netlify.toml:**
   Make sure the build command is correct:
   ```toml
   command = "node prepare-netlify-env.cjs && npm run build:web:netlify"
   ```

2. **Verify package.json scripts:**
   ```json
   "build:web:netlify": "node fix-netlify-build.js && cross-env VITE_IS_WEB_BUILD=true tsc -p tsconfig.web.json && cross-env VITE_IS_WEB_BUILD=true vite build"
   ```

3. **Check Node.js version:**
   Make sure the Node.js version on Netlify is compatible with your scripts.
   In netlify.toml:
   ```toml
   [build.environment]
     NODE_VERSION = "18"
   ```

### 2. Environment Variable Issues

**Symptoms:**
- Features not working correctly in the deployed app
- Inconsistent behavior between local and deployed versions

**Solutions:**

1. **Check environment variables:**
   Verify that the prepare-netlify-env.cjs script is creating the .env file correctly.

2. **Set environment variables in Netlify UI:**
   You can set environment variables in the Netlify dashboard under:
   Site settings > Build & deploy > Environment

3. **Add logging to debug:**
   Add console.log statements to check environment variables in the running app.

## Runtime Issues

### 1. Features Not Working in Web Version

**Symptoms:**
- Features that work in Electron don't work in the web version
- Blank screens or JavaScript errors in the browser console

**Solutions:**

1. **Check browser console:**
   Open the deployed site and check the browser console for errors.

2. **Implement graceful fallbacks:**
   Make sure all Electron-specific features have proper web fallbacks.

3. **Test locally first:**
   Always test the web version locally before deploying:
   ```bash
   npm run dev:web
   ```

### 2. API Calls Failing

**Symptoms:**
- API calls that work in Electron fail in the web version
- Network errors in the console

**Solutions:**

1. **Check CORS settings:**
   If your app makes API calls, make sure the API endpoints allow CORS from your Netlify domain.

2. **Use Netlify functions:**
   For API calls that can't be made directly from the browser, consider using Netlify Functions as proxies.

3. **Update API endpoints:**
   Make sure your web version points to the correct API endpoints.

## Testing Your Fix

1. **Run the test script:**
   ```bash
   npm run test:netlify
   ```

2. **Preview locally:**
   ```bash
   npm run build:web:netlify && npx vite preview --outDir dist/renderer
   ```

3. **Deploy a preview:**
   ```bash
   npm run netlify:preview
   ```

If you're still encountering issues after trying these solutions, refer to the source code for more detailed information or consult the more comprehensive guides:

- [DEFINITIVE-NETLIFY-GUIDE.md](./DEFINITIVE-NETLIFY-GUIDE.md)
- [ELECTRON-WEB-COMPATIBILITY.md](./ELECTRON-WEB-COMPATIBILITY.md)
