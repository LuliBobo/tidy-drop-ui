#!/usr/bin/env node
// fix-typescript-errors.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix FileCleaner.tsx
const fileCleanerPath = path.resolve(__dirname, 'src/components/FileCleaner.tsx');
let fileCleanerContent = fs.readFileSync(fileCleanerPath, 'utf8');

// Remove unused CleanResult interface and replace with comment
fileCleanerContent = fileCleanerContent.replace(/interface CleanResult \{[\s\S]*?\}/m, 
  '// CleanResult type is defined in the global window.electron interface');

// Add null checks for all window.electron usages and handle potential undefined results
const electronPatterns = [
  { 
    pattern: /const result = await window\.electron\.ipcRenderer\.invoke\('clean-image'/g,
    replacement: 'const result = await window.electron?.ipcRenderer.invoke(\'clean-image\''
  },
  { 
    pattern: /window\.electron\.app\.openFolder\(outputDir\)/g,
    replacement: 'window.electron?.app.openFolder(outputDir)'
  },
  { 
    pattern: /const result = await window\.electron\.ipcRenderer\.invoke\(\s*'clean-video'/g,
    replacement: 'const result = await window.electron?.ipcRenderer.invoke(\n        \'clean-video\''
  }
];

// Fix result undefined errors
const resultChecks = [
  {
    pattern: /if \(result\.success\)/g,
    replacement: 'if (result && result.success)'
  },
  {
    pattern: /if \(result\.convertedPath\)/g,
    replacement: 'if (result && result.convertedPath)'
  },
  {
    pattern: /if \(autoOpenFolder && result\.success\)/g,
    replacement: 'if (autoOpenFolder && result && result.success)'
  },
  {
    // Replace all direct references to result properties with safe access
    pattern: /result\.(originalSize|cleanedSize|metadata|convertedPath|success)/g,
    replacement: 'result?.$1'
  }
];

// Apply electron patterns
for (const { pattern, replacement } of electronPatterns) {
  fileCleanerContent = fileCleanerContent.replace(pattern, replacement);
}

// Apply result undefined checks
for (const { pattern, replacement } of resultChecks) {
  fileCleanerContent = fileCleanerContent.replace(pattern, replacement);
}

// Write changes back to file
fs.writeFileSync(fileCleanerPath, fileCleanerContent);

console.log('Fixed TypeScript errors in FileCleaner.tsx');

// Exit with success code
process.exit(0);