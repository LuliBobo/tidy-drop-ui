# Cross-Platform Development Guide for DropTidy

This guide outlines best practices for developing features that work in both Electron desktop and web environments.

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

## Build Process

Our `prepare-web-build.js` script automatically transforms Electron-specific code for web deployment. However, it's better to write cross-platform code from the start using our utilities.

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
