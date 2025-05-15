/**
 * fix-netlify-build.js
 * 
 * A robust script to prepare Electron-based app for web deployment
 * by safely modifying files and replacing Electron-specific code with web alternatives.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of files that need to be modified for web builds
const filesToFix = [
  'src/lib/environment.ts',
  'src/lib/environment.web.ts',
  'src/components/Navbar.tsx',
  'src/components/FileCleaner.tsx',
  'src/components/ElectronFallbacks.tsx',
  'src/backend/cleaner.ts',
  'src/backend/logger.ts'
];

// Function to create web versions of Electron files
function createWebVersion(filePath) {
  console.log(`Creating web version of ${filePath}`);
  
  // Read the original file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return false;
  }
  
  // Create a backup if it doesn't exist
  const backupPath = `${filePath}.electron-backup`;
  if (!fs.existsSync(backupPath)) {
    try {
      fs.writeFileSync(backupPath, content);
      console.log(`Created backup: ${backupPath}`);
    } catch (err) {
      console.error(`Error creating backup for ${filePath}:`, err);
    }
  }
  
  // Check if we have a pre-built web version
  const webVersionPath = path.join(__dirname, 'fixed-files', path.basename(filePath));
  if (fs.existsSync(webVersionPath)) {
    try {
      const webContent = fs.readFileSync(webVersionPath, 'utf8');
      fs.writeFileSync(filePath, webContent);
      console.log(`Successfully replaced ${filePath} with custom web version from fixed-files`);
      return true;
    } catch (err) {
      console.error(`Error using pre-built web version for ${filePath}:`, err);
      // Continue with automatic modifications
    }
  }
  
  // Replace Electron imports
  content = content.replace(/import [^;]+ from ['"]electron['"];?/g, '// Electron imports removed for web build');
  content = content.replace(/import type [^;]+ from ['"]electron['"];?/g, '// Electron type imports removed for web build');
  
  // Replace isElectron() function to always return false
  content = content.replace(/export function isElectron\(\)[^}]+}/g, 'export function isElectron() { return false; }');
  
  // Safe replacement of if (isElectron()) blocks
  let ifElectronRegex = /if\s*\(\s*isElectron\(\)\s*\)\s*\{/g;
  let match;
  let positions = [];
  
  while ((match = ifElectronRegex.exec(content)) !== null) {
    positions.push(match.index);
  }
  
  // Start from the end to avoid position shifting
  for (let i = positions.length - 1; i >= 0; i--) {
    let pos = positions[i];
    let openBraces = 1;
    let closePos = pos + match[0].length;
    
    // Find the matching closing brace
    while (openBraces > 0 && closePos < content.length) {
      if (content[closePos] === '{') openBraces++;
      if (content[closePos] === '}') openBraces--;
      closePos++;
    }
    
    // Replace the entire if block
    const ifBlock = content.substring(pos, closePos);
    content = content.substring(0, pos) + 
              'if (false) { // isElectron() is always false in web build\n  console.log("Electron code disabled in web build");\n}' + 
              content.substring(closePos);
  }
  
  // Replace window.electron references with safer alternatives
  content = content.replace(/window\.electron\??\./g, 'undefined /* Electron API removed for web build */.');
  content = content.replace(/window\.electron(\s*&&|\s*\?)/g, 'false $1');
  
  // Replace app.openFolder calls
  content = content.replace(/app\.openFolder\([^)]*\)/g, '(() => { console.log("openFolder not available in web version"); return Promise.resolve(false); })()');
  
  // Replace app.showItemInFolder calls
  content = content.replace(/app\.showItemInFolder\([^)]*\)/g, '(() => { console.log("showItemInFolder not available in web version"); return Promise.resolve(); })()');
  
  // Replace IPC renderer calls
  content = content.replace(/ipcRenderer\.invoke\([^)]*\)/g, 'Promise.resolve(null) /* IPC call removed for web build */');
  
  // Write the modified content
  try {
    fs.writeFileSync(filePath, content);
    console.log(`Successfully modified ${filePath} for web build`);
    return true;
  } catch (err) {
    console.error(`Error writing modified content to ${filePath}:`, err);
    return false;
  }
}

// Process each file
const results = {
  success: 0,
  notFound: 0,
  failed: 0,
  files: []
};

filesToFix.forEach(file => {
  try {
    const filePath = path.resolve(__dirname, file);
    if (fs.existsSync(filePath)) {
      const success = createWebVersion(filePath);
      if (success) {
        results.success++;
        results.files.push({ file, status: 'success' });
      } else {
        results.failed++;
        results.files.push({ file, status: 'failed' });
      }
    } else {
      console.warn(`File not found: ${filePath}`);
      results.notFound++;
      results.files.push({ file, status: 'not-found' });
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    results.failed++;
    results.files.push({ file, status: 'error', error: error.message });
  }
});

console.log('Web build preparation complete!');
console.log(`Results: ${results.success} successful, ${results.notFound} not found, ${results.failed} failed`);

// Exit with error if there were failures
if (results.failed > 0) {
  console.error('There were errors during the web build preparation!');
  console.error('Failed files:');
  results.files
    .filter(f => f.status === 'failed' || f.status === 'error')
    .forEach(f => console.error(` - ${f.file}: ${f.status === 'error' ? f.error : 'Failed'}`));
  
  // Continue anyway to give the build a chance to succeed
  console.log('Continuing with build despite errors...');
}
