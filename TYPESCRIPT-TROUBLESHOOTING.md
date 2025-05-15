# Troubleshooting TypeScript Errors in DropTidy Web Builds

This guide provides practical solutions for common TypeScript errors encountered when building DropTidy for web deployment.

## Common Error Patterns and Solutions

### 1. Boolean/String Type Mismatches

**Error Example:**
```
Error: Type 'boolean' is not assignable to type 'string'. (TS2322)
```

**Cause:** In many cases, Electron APIs expect booleans, while web equivalents expect strings.

**Solution:**
```typescript
// Before (causes error)
<Component cleaned={true} />

// After (fixed)
<Component cleaned="true" />
```

**Fix with Unified Build:**
```bash
npm run build:web:unified:fix
```

### 2. Electron API Access

**Error Example:**
```
Error: Property 'openFolder' does not exist on type '{}'. (TS2339)
```

**Cause:** Attempting to use Electron APIs that don't exist in web context.

**Solution:**
```typescript
// Before (causes error)
electronAPI.openFolder();

// After (fixed)
if (isElectron()) {
  electronAPI.openFolder();
} else {
  console.log("This feature is only available in the desktop app");
  // Provide web alternative or feedback
}
```

**Fix with Unified Build:**
Replace the file with a web-compatible version in the `fixed-files/` directory.

### 3. Node.js Module Imports

**Error Example:**
```
Error: Cannot find module 'fs' or its corresponding type declarations. (TS2307)
```

**Cause:** Importing Node.js modules that aren't available in the browser.

**Solution:**
```typescript
// Before (causes error)
import fs from 'fs';
import path from 'path';

// After (fixed)
import path from 'path-browserify';
// Use browser-compatible alternatives for fs
// or conditional imports:
const fs = isElectron() ? require('fs') : null;
```

**Fix with Unified Build:**
The unified build automatically handles many import replacements.

### 4. Component Prop Type Mismatches

**Error Example:**
```
Error: Type '{ isOpen: boolean; onClose: () => void; }' is not assignable to type... (TS2322)
```

**Cause:** Different component libraries may have slightly different prop naming conventions.

**Solution:**
```typescript
// Before (causes error)
<FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

// After (fixed)
<FeedbackForm open={isFeedbackOpen} onOpenChange={() => setIsFeedbackOpen(false)} />
```

**Fix with Unified Build:**
Add specific fixes to `config.typescriptFixes` in `unified-web-build.js`.

### 5. Missing Interface Properties

**Error Example:**
```
Error: Property 'width' is missing in type '{ height: number; }' but required in type 'ImageDimensions'. (TS2741)
```

**Cause:** Incomplete implementation of interfaces.

**Solution:**
```typescript
// Before (causes error)
const dimensions: ImageDimensions = { height: 100 };

// After (fixed)
const dimensions: ImageDimensions = { height: 100, width: 0 };
```

## Advanced Error Analysis

For more complex TypeScript errors, use the advanced error analysis:

```bash
node unified-web-build.js --fix --verbose --log
```

This will generate a detailed error analysis report showing:
- Files with the most errors
- Common error patterns
- Suggestions for fixes
- Detected TypeScript error codes

## When Automatic Fixes Don't Work

If automatic fixes don't resolve the issues:

1. **Create web-specific versions:**
   - Create a web-compatible version in the `fixed-files/` directory
   - Add the file to `config.fixedFiles` in `unified-web-build.js`

2. **Use bypass mode as a last resort:**
   ```bash
   npm run build:web:unified:bypass
   ```

3. **Add custom TypeScript fixes:**
   ```javascript
   // In unified-web-build.js
   typescriptFixes: [
     {
       filePattern: 'path/to/problematic/file.tsx',
       fixes: [
         {
           search: /pattern-causing-error/g,
           replace: 'fixed-pattern'
         }
       ]
     }
   ]
   ```