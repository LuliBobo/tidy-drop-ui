/**
 * Manual Web Fix Script
 * 
 * This script replaces problematic files with web-compatible versions
 * to avoid TypeScript errors during the web build process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to replace with fixed versions
const filesToReplace = [
  {
    path: 'src/lib/environment.ts',
    fixedPath: 'fixed-files/environment.ts'
  },
  {
    path: 'src/components/Navbar.tsx',
    fixedPath: 'fixed-files/Navbar.tsx'
  },
  {
    path: 'src/components/FileCleaner.tsx',
    fixedPath: 'fixed-files/FileCleaner.tsx'
  }
];

// Create backups and replace with fixed versions
for (const file of filesToReplace) {
  const filePath = path.join(__dirname, file.path);
  const fixedPath = path.join(__dirname, file.fixedPath);
  
  try {
    // Create backup if it doesn't exist
    const backupPath = `${filePath}.electron-backup`;
    if (fs.existsSync(filePath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`Created backup: ${backupPath}`);
    }
    
    // Check if fixed file exists
    if (!fs.existsSync(fixedPath)) {
      console.error(`Fixed file not found: ${fixedPath}`);
      continue;
    }
    
    // Read and write fixed content
    const fixedContent = fs.readFileSync(fixedPath, 'utf8');
    fs.writeFileSync(filePath, fixedContent);
    console.log(`Replaced ${filePath} with fixed version`);
  } catch (error) {
    console.error(`Error processing ${file.path}:`, error);
  }
}

console.log('Manual web fix complete!');
