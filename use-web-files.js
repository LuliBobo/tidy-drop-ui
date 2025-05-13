#!/usr/bin/env node

/**
 * DropTidy Web Build Fixer Script
 * 
 * This script replaces problematic files with web-compatible versions
 * before running the TypeScript compiler and Vite build steps.
 * 
 * Usage: node use-web-files.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileMappings = [
  {
    source: 'src/components/ElectronFallbacks.web.tsx',
    target: 'src/components/ElectronFallbacks.tsx'
  },
  {
    source: 'src/lib/environment.web.ts',
    target: 'src/lib/environment.ts'
  },
  {
    source: 'src/backend/logger.web.ts',
    target: 'src/backend/logger.ts'
  },
  {
    source: 'src/backend/cleaner.web.ts',
    target: 'src/backend/cleaner.ts'
  }
];

// Copy web files to their target locations
console.log('Replacing files with web-compatible versions...');

for (const mapping of fileMappings) {
  try {
    const sourcePath = path.join(__dirname, mapping.source);
    const targetPath = path.join(__dirname, mapping.target);
    
    if (fs.existsSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(targetPath, content);
      console.log(`✓ Replaced ${mapping.target} with web version`);
    } else {
      console.error(`⨯ Source file not found: ${mapping.source}`);
    }
  } catch (error) {
    console.error(`Error copying ${mapping.source} to ${mapping.target}:`, error);
  }
}

console.log('Done replacing files.');
