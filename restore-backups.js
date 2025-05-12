#!/usr/bin/env node

/**
 * Script to restore files from .electron-backup files
 */

import fs from 'fs/promises';
import { glob } from 'glob';

async function restoreBackups() {
  console.log('Restoring files from backups...');
  
  try {
    // Find all backup files
    const backupFiles = await glob('**/*.electron-backup', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    
    console.log(`Found ${backupFiles.length} backup files.`);
    
    // Restore each file
    for (const backupFile of backupFiles) {
      const originalFile = backupFile.replace('.electron-backup', '');
      console.log(`Restoring ${originalFile}`);
      await fs.rename(backupFile, originalFile);
    }
    
    console.log('Restoration complete!');
  } catch (error) {
    console.error('Error restoring backups:', error);
    process.exit(1);
  }
}

restoreBackups();
