#!/usr/bin/env node

/**
 * DropTidy Web Fixes Application Script
 * 
 * This script applies fixes for the web build by:
 * 1. Copying the fixed TypeScript files to replace the originals
 * 2. Only applies the changes when building for web
 * 
 * Usage: 
 *   node apply-web-fixes.js
 * 
 * Run this script before running prepare-web-build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM file/directory URLs to paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to fix mapping (source → destination)
const fixedFiles = {
  'src/backend/cleaner.fixed.ts': 'src/backend/cleaner.ts',
  'src/backend/logger.fixed.ts': 'src/backend/logger.ts'
};

// Check if we're in a web build
const isWebBuild = process.env.VITE_IS_WEB_BUILD === 'true';

if (!isWebBuild) {
  console.log('Not a web build, skipping fixes');
  process.exit(0);
}

console.log('Applying web build fixes...');

// Apply the fixes
for (const [source, destination] of Object.entries(fixedFiles)) {
  const sourcePath = path.join(__dirname, source);
  const destPath = path.join(__dirname, destination);
  
  try {
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source file not found: ${sourcePath}`);
      continue;
    }
    
    // Create backup of original file if it exists
    if (fs.existsSync(destPath)) {
      const backupPath = `${destPath}.electron-backup`;
      console.log(`Creating backup: ${backupPath}`);
      fs.copyFileSync(destPath, backupPath);
    }
    
    // Copy fixed file to destination
    console.log(`Applying fix: ${sourcePath} → ${destPath}`);
    fs.copyFileSync(sourcePath, destPath);
    
  } catch (error) {
    console.error(`Error processing ${source}:`, error);
  }
}

console.log('Web fixes applied successfully!');
