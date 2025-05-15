# Cross-Platform Development Guide for DropTidy

This guide outlines best practices for developing features that work in both Electron desktop and web environments, with special emphasis on TypeScript error prevention and handling.

## Environment Detection

We use environment detection utilities in `src/lib/environment.ts` to determine whether the code is running in an Electron environment or web browser.

```typescript
// Check for Electron environment
import { isElectron } from '@/lib/environment';

if (isElectron()) {
  // Electron-specific code
} else {
  // Web-specific code
}
```

## Using Electron APIs Safely

### Approach 1: Safe Dynamic Imports

For importing Electron modules, use the dynamic import utility:

```typescript
import { importElectron } from '@/lib/environment';

async function myFunction() {
  // This will only attempt to import in Electron and returns null in web
  const electron = await importElectron<typeof import('electron')>('electron');
  
  if (electron) {
    // Use Electron APIs safely
    const { BrowserWindow } = electron;
    // ...
  } else {
    // Web fallback
    // ...
  }
}
```

### Approach 2: Safe IPC Invocation

For IPC calls, use the `safeIpcInvoke` utility which handles web environments gracefully:

```typescript
import { safeIpcInvoke } from '@/lib/environment';

async function saveUserSettings(settings) {
  const result = await safeIpcInvoke(
    'save-settings',                 // IPC channel name
    [settings],                      // Arguments to pass
    async () => {                    // Web fallback function
      // Store in localStorage for web
      localStorage.setItem('settings', JSON.stringify(settings));
      return true;
    }
  );
  
  return result;
}
```

### Approach 3: ElectronFallbacks Utility

For common Electron operations, use the utilities in `ElectronFallbacks.tsx`:

```typescript
import { openFolder, showItemInFolder, getPath } from '@/components/ElectronFallbacks';

// Opens folder in file explorer or shows a toast in web
await openFolder('/path/to/folder');

// Shows item in file explorer or shows a toast in web
await showItemInFolder('/path/to/file.txt');

// Gets system path or returns web-safe default
const downloadsPath = getPath('downloads');
```

## TypeScript Error Prevention

When developing cross-platform components, follow these guidelines to prevent TypeScript errors:

### 1. Use Union Types for Platform Differences

When properties or return values differ between platforms, use union types:

```typescript
// Instead of forcing a single type
function getFileSize(): number {
  // This will fail on web!
  return isElectron() ? fs.statSync(path).size : 0;
}

// Use union types
function getFileSize(): number | null {
  return isElectron() ? fs.statSync(path).size : null;
}
```

### 2. Avoid Direct Type Assignments Between Platforms

Be cautious with boolean/string conversions:

```typescript
// Problematic - can cause TypeScript errors
const cleaned = isElectron() ? cleanResult.success : "true";

// Better approach - consistent types
const cleaned = isElectron() ? String(cleanResult.success) : "true";
```

### 3. Create Platform-Specific Interfaces

Use interfaces that abstract platform differences:

```typescript
// Define common interface
interface FileHandler {
  openFile: (path: string) => Promise<void>;
  saveFile: (data: Blob) => Promise<string>;
}

// Implement for Electron
class ElectronFileHandler implements FileHandler {
  // ...implementation
}

// Implement for Web
class WebFileHandler implements FileHandler {
  // ...implementation
}

// Factory function
function getFileHandler(): FileHandler {
  return isElectron() ? new ElectronFileHandler() : new WebFileHandler();
}
```

### 4. Use Optional Properties for Platform-Specific Features

```typescript
interface AppConfig {
  theme: string;
  // Optional for web where it doesn't apply
  autoStart?: boolean;
}
```

## Build Process

Our unified web build system (`unified-web-build.js`) automatically transforms Electron-specific code for web deployment and handles TypeScript errors. However, it's better to write cross-platform code from the start using our utilities.

### Advanced Error Detection

Our build system includes sophisticated TypeScript error detection:

1. Identifies common error patterns (boolean/string mismatches, Electron API usage)
2. Applies automatic fixes when possible
3. Generates detailed error reports and visualizations
4. Provides targeted suggestions for complex issues

### Specifying Web Environment

During web builds, we set the `VITE_IS_WEB_BUILD=true` environment variable, which our utilities detect to ensure proper behavior.

## Component Examples

### Example 1: FeedbackForm Component

```tsx
function FeedbackForm() {
  const submitFeedback = async (feedback) => {
    // Safely handle submission in both environments
    return await safeIpcInvoke(
      'submit-feedback',
      [feedback],
      async () => {
        // In web, use fetch API instead
        const response = await fetch('/api/feedback', {
          method: 'POST',
          body: JSON.stringify(feedback)
        });
        return response.ok;
      }
    );
  };
}
```

### Example 2: Settings Component

```tsx
function SettingsComponent() {
  const handleSelectFolder = async () => {
    return await safeIpcInvoke(
      'select-directory',
      [],
      async () => {
        // Web fallback - show toast and return mock path
        toast({
          title: "Web Version Limitation",
          description: "Folder selection is only available in the desktop app",
        });
        return "/Downloads/DropTidy";
      }
    );
  };
}
```

## Testing Cross-Platform Code

Always test your code in both environments:

```bash
# Test in Electron (desktop)
npm run dev

# Test in Web browser
npm run dev:web
```

## TypeScript Declaration Files

For proper TypeScript support of environment variables, we've created `src/vite-env-override.d.ts` which extends the Vite types:

```typescript
interface ImportMetaEnv {
  readonly VITE_IS_WEB_BUILD?: string;
  // Add other environment variables here
}
```

## Best Practices Summary

1. **Never directly import Electron modules** - Use `importElectron` instead
2. **Always provide web fallbacks** - Every Electron-specific feature should have a web equivalent
3. **Use the provided utilities** - Take advantage of `safeIpcInvoke`, `ElectronFallbacks`, etc.
4. **Early environment detection** - Check for web/Electron early and branch accordingly
5. **Graceful degradation** - Web versions should provide reasonable alternatives with clear messaging
6. **Clear user messaging** - When a feature is limited in web, inform users about desktop capabilities
7. **Test in both environments** - Always verify behavior in both web and desktop versions
8. **Use TypeScript error analysis tools** - Leverage our error detection and visualization tools

## Error Analysis and Visualization Tools

We've developed sophisticated tools to help identify and fix TypeScript errors in cross-platform code:

### Error Analysis

Run the TypeScript error analyzer to get detailed insights:

```bash
npm run analyze:ts
```

This tool will:
- Identify all TypeScript errors in your web build
- Group errors by file and error type
- Identify common error patterns (boolean/string mismatches, Electron API issues)
- Generate fix suggestions for common error types
- Recommend prioritization based on error frequency and fixability

Example output:
```
Error Analysis Summary
====================
Total Errors: 12
Affected Files: 3
Automatically Fixable: 8 errors (66%)

Top Error Types:
  TS2322 (7 occurrences): Type assignment error - Types are incompatible
  TS2339 (4 occurrences): Property does not exist on this type
  TS2345 (1 occurrences): Argument type mismatch in function call

Top Error Patterns:
  booleanString: 5 occurrences
  electronApi: 4 occurrences
  propsInterface: 3 occurrences
```

### Error Visualization

Generate an interactive HTML visualization of TypeScript errors:

```bash
npm run visualize:ts
```

This creates an HTML report with:
- Interactive charts showing error distribution
- Searchable and filterable error list
- Code context for each error
- Suggested fixes for common error patterns
- One-click filter by file or error type

### Unified Testing and Analysis

To check your code thoroughly, use:

```bash
npm run web:analyze:errors
```

This combines both tools for the most comprehensive analysis.

## Next Steps

For more detailed information on handling TypeScript errors in cross-platform development, see:

- [TYPESCRIPT-ERROR-HANDLING-GUIDE.md](TYPESCRIPT-ERROR-HANDLING-GUIDE.md) - Complete guide to error handling
- [UNIFIED-WEB-BUILD.md](UNIFIED-WEB-BUILD.md) - Details on our unified build system
- [WEB-DEPLOYMENT-CHECKLIST.md](WEB-DEPLOYMENT-CHECKLIST.md) - Deployment preparation checklist
