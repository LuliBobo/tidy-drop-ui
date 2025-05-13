// Updates to prepare-web-build.js

// Add these patterns to your replacements array:

// Better handling for window.electron.app method calls
{
  name: 'Electron app methods with fallbacks',
  pattern: /window\.electron(?:\?\.|\.)(app)\.(openFolder|showItemInFolder|getPath)\((.*?)\);?/g,
  replacement: (match, appObj, method, args) => {
    return `// WEB-SAFE: Using ElectronFallbacks
import { ${method} } from '@/components/ElectronFallbacks';
await ${method}(${args});`;
  },
  description: 'Replace Electron app methods with safe fallbacks'
},

// Better handling for IPC renderer invoke with strongly typed fallbacks
{
  name: 'IPC renderer invoke with typed fallbacks',
  pattern: /window\.electron(?:\?\.|\.)(ipcRenderer)\.invoke\(['"]([a-zA-Z-]+)['"],?\s?(.*?)\);?/g,
  replacement: (match, ipcObj, channel, args) => {
    // Special case for common channels
    if (channel === 'load-settings') {
      return `// WEB-SAFE: Using ElectronFallbacks
import { loadSettings } from '@/components/ElectronFallbacks';
await loadSettings(${args || '{}'});`;
    }
    else if (channel === 'save-settings') {
      return `// WEB-SAFE: Using ElectronFallbacks
import { saveSettings } from '@/components/ElectronFallbacks';
await saveSettings(${args});`;
    }
    else if (channel === 'select-directory') {
      return `// WEB-SAFE: Using ElectronFallbacks
import { selectDirectory } from '@/components/ElectronFallbacks';
await selectDirectory(${args || ''});`;
    }
    
    // Generic case for other channels
    return `// WEB-SAFE: Using safeIpcInvoke
import { safeIpcInvoke } from '@/lib/environment';
await safeIpcInvoke('${channel}', [${args}], async () => {
  console.log('Web fallback for ${channel}');
  return undefined;
});`;
  },
  description: 'Replace IPC invoke calls with safe fallbacks'
}
