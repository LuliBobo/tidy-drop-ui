# Best Practices for Electron/Web Compatibility

This guide outlines best practices for developing code that works across both Electron desktop and web environments in the DropTidy application.

## Core Principles

1. **Always check the environment before using Electron APIs**
2. **Provide web fallbacks for all platform-specific features**
3. **Keep platform-specific code isolated and replaceable**
4. **Communicate platform limitations to users clearly**

## Code Patterns

### 1. Environment Detection

Always use environment detection functions to check if code is running in an Electron context:

```typescript
import { isElectron } from '@/lib/environment';

if (isElectron()) {
  // Electron-specific code
} else {
  // Web-friendly alternative
}
```

### 2. API Abstraction

Create abstraction layers for platform-specific features:

```typescript
// Bad: Direct Electron API usage
const result = await window.electron.ipcRenderer.invoke('read-file', filePath);

// Good: Abstracted API with fallbacks
import { readFile } from '@/components/ElectronFallbacks';
const result = await readFile(filePath);
```

### 3. Dynamic Imports

Use dynamic imports for Electron-specific modules:

```typescript
// Bad: Static import
import { shell } from 'electron';

// Good: Dynamic import with environment check
if (isElectron()) {
  const { shell } = await import('electron');
  // Use shell
}
```

### 4. Graceful Degradation

Provide graceful fallbacks for features that aren't available:

```typescript
async function openExternalLink(url: string): Promise<void> {
  if (isElectron()) {
    const { shell } = await import('electron');
    await shell.openExternal(url);
  } else {
    // Web fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
```

### 5. User Communication

Clearly communicate platform differences to users:

```typescript
function exportFile() {
  if (isElectron()) {
    // Implement full file download
  } else {
    toast({
      title: "Web Version",
      description: "In the web version, files will download to your browser's default location",
      variant: "default"
    });
    // Implement browser download
  }
}
```

### 6. Component Conditionals

Use conditional rendering for platform-specific UI elements:

```tsx
function Toolbar() {
  const isElectronApp = isElectron();
  
  return (
    <div className="toolbar">
      {isElectronApp && (
        <button onClick={openDevTools}>Developer Tools</button>
      )}
      <button onClick={isElectronApp ? saveToFile : saveToCloud}>
        {isElectronApp ? "Save to File" : "Save to Cloud"}
      </button>
    </div>
  );
}
```

### 7. Type Safety

Ensure proper TypeScript definitions for cross-platform code:

```typescript
// Define interfaces for your platform abstraction
interface FileSystem {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<void>;
  // Other methods...
}

// Implement for each platform
const electronFS: FileSystem = {
  readFile: async (path) => {
    return await window.electron.ipcRenderer.invoke('read-file', path);
  },
  writeFile: async (path, data) => {
    await window.electron.ipcRenderer.invoke('write-file', path, data);
  }
};

const webFS: FileSystem = {
  readFile: async (path) => {
    // Web implementation (maybe using IndexedDB)
    return "";
  },
  writeFile: async (path, data) => {
    // Web implementation
  }
};

// Export the right implementation
export const fs = isElectron() ? electronFS : webFS;
```

## Testing

1. **Test both environments**: Regularly test both the Electron and web versions of your application.

2. **Use environment-specific tests**: Write tests that verify your code works in both environments.

3. **Mock platform APIs**: Use mocks for platform-specific APIs in tests.

## Build Process

1. **Environment variables**: Use `VITE_IS_WEB_BUILD=true` to conditionally include code.

2. **File replacements**: Use the fix-netlify-build.js script to replace problematic files for web builds.

3. **TypeScript configurations**: Maintain separate TypeScript configurations for web and Electron builds.

## Common Pitfalls

1. **Directly accessing window.electron**: Always check if it exists first.

2. **Assuming file system access**: Web browsers have limited file system access.

3. **Importing Electron modules at the top level**: This will break web builds.

4. **Not testing both environments**: Something that works in Electron may not work in a browser.

## Further Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [DEFINITIVE-NETLIFY-GUIDE.md](./DEFINITIVE-NETLIFY-GUIDE.md) - Our guide for deployment
