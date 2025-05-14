/**
 * Restore Original Files
 * 
 * This script restores the original versions of files that were replaced
 * with web-compatible versions during the web build process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as globModule from 'glob';
const glob = globModule;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all backup files
const backupFiles = glob.sync('src/**/*.electron-backup', { cwd: __dirname });

console.log('Restoring original files from backups...');

for (const backupFile of backupFiles) {
  const originalFile = backupFile.replace('.electron-backup', '');
  const backupPath = path.join(__dirname, backupFile);
  const originalPath = path.join(__dirname, originalFile);
  
  try {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, originalPath);
      console.log(`Restored: ${originalFile}`);
      
      // Optionally remove backup files
      // fs.unlinkSync(backupPath);
      // console.log(`Removed backup: ${backupFile}`);
    }
  } catch (error) {
    console.error(`Error restoring ${originalFile}:`, error);
  }
}

console.log('Restore complete!');
