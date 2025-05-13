#!/usr/bin/env node

/**
 * DropTidy Focused Web Fixes Script
 * 
 * This script specifically targets and fixes the TypeScript errors
 * in the problematic files without modifying other code.
 */

const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  {
    path: 'src/components/ElectronFallbacks.tsx',
    fixes: [
      {
        // Replace Electron API calls with direct mocks
        search: /getElectron\(\)\.\/\* WEB BUILD: Disabled Electron API \*\/ \(\(\)=>undefined\)\((.*?)\)/g,
        replace: 'electronAPI.app.openFolder($1)'
      }
    ]
  },
  {
    path: 'src/lib/environment.ts',
    fixes: [
      {
        // Fix incomplete else statement
        search: /\} else \{\n(.*?if \(webFallback && typeof webFallback === 'function'\) \{\n\})/gs,
        replace: '} else {\n  if (webFallback && typeof webFallback === \'function\') {'
      }
    ]
  }
];

// Process each file
files.forEach((file) => {
  const filePath = path.join(__dirname, file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file.path}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  file.fixes.forEach((fix) => {
    const newContent = content.replace(fix.search, fix.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file.path}`);
  } else {
    console.log(`No changes needed in: ${file.path}`);
  }
});

console.log('Focused fixes applied!');
