/**
 * restore-netlify-backups.js
 * 
 * Restores original files after using fix-netlify-build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as globModule from 'glob';
const glob = globModule;

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all backup files created by fix-netlify-build.js
const backupFiles = glob.sync('src/**/*.electron-backup', { cwd: __dirname });

console.log('Restoring original files from backups...');
let restoredCount = 0;
let errorCount = 0;

for (const backupFile of backupFiles) {
  const originalFile = backupFile.replace('.electron-backup', '');
  const backupPath = path.join(__dirname, backupFile);
  const originalPath = path.join(__dirname, originalFile);
  
  try {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, originalPath);
      console.log(`Restored: ${originalFile}`);
      restoredCount++;
    }
  } catch (error) {
    console.error(`Error restoring ${originalFile}:`, error);
    errorCount++;
  }
}

console.log(`Restore complete! Restored ${restoredCount} file(s) with ${errorCount} error(s).`);
