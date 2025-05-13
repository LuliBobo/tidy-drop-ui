#!/usr/bin/env node

/**
 * DropTidy Web Fixes Script
 * 
 * This script fixes TypeScript syntax errors in web-build related files
 * by properly implementing web fallbacks for Electron-specific code.
 * 
 * Usage: 
 *   node apply-web-fixes.js
 * 
 * Run this script after prepare-web-build.js if you encounter TypeScript errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { promisify } from 'util';
import chalk from 'chalk';

// Convert ESM file/directory URLs to paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  // Files to fix
  filesToFix: [
    'src/components/ElectronFallbacks.tsx',
    'src/lib/environment.ts',
    'src/components/Navbar.tsx',
    'src/backend/logger.ts',
    'src/backend/cleaner.ts'
  ],
  
  // Log file path
  logFile: 'web-build-fixes.log'
};

// Counters for logging
const stats = {
  filesProcessed: 0,
  filesFixed: 0,
  errorCount: 0
};

// Logger utility
const logger = {
  log: (message) => {
    console.log(message);
    fs.appendFileSync(config.logFile, message + '\n', 'utf8');
  },
  info: (message) => {
    const formattedMessage = chalk.blue(`[INFO] ${message}`);
    console.log(formattedMessage);
    fs.appendFileSync(config.logFile, `[INFO] ${message}\n`, 'utf8');
  },
  success: (message) => {
    const formattedMessage = chalk.green(`[SUCCESS] ${message}`);
    console.log(formattedMessage);
    fs.appendFileSync(config.logFile, `[SUCCESS] ${message}\n`, 'utf8');
  },
  warn: (message) => {
    const formattedMessage = chalk.yellow(`[WARNING] ${message}`);
    console.log(formattedMessage);
    fs.appendFileSync(config.logFile, `[WARNING] ${message}\n`, 'utf8');
  },
  error: (message) => {
    const formattedMessage = chalk.red(`[ERROR] ${message}`);
    console.log(formattedMessage);
    fs.appendFileSync(config.logFile, `[ERROR] ${message}\n`, 'utf8');
  }
};

// Initialize log file
fs.writeFileSync(config.logFile, `DropTidy Web Fixes - ${new Date().toISOString()}\n`, 'utf8');

// Fixes for each file
const fixes = {
  // Fix for ElectronFallbacks.tsx
  'src/components/ElectronFallbacks.tsx': async (content) => {
    // This file appears to be correct already
    return content;
  },
  
  // Fix for environment.ts
  'src/lib/environment.ts': async (content) => {
    // Fix any incomplete if/else statements by ensuring they have proper blocks
    let fixedContent = content;
    
    // Fix if statements without braces
    fixedContent = fixedContent.replace(
      /if\s*\(\s*(isElectron\(\)|!isWeb\(\)|import\.meta\.env\.VITE_IS_WEB_BUILD\s*===\s*['"]true['"]\s*)\s*\)\s*([^{\n].*?)(?=\n)/g, 
      'if ($1) {\n  $2\n}'
    );
    
    // Fix else statements without braces
    fixedContent = fixedContent.replace(
      /}\s*else\s+([^{\n].*?)(?=\n)/g,
      '} else {\n  $1\n}'
    );
    
    // Add missing closing braces for if/else blocks
    fixedContent = fixedContent.replace(
      /if\s*\([^{]*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*$/g,
      match => match + '\n}'
    );
    
    return fixedContent;
  },
  
  // Fix for Navbar.tsx
  'src/components/Navbar.tsx': async (content) => {
    // Fix any incomplete if/else statements
    let fixedContent = content;
    
    // Fix if statements without braces
    fixedContent = fixedContent.replace(
      /if\s*\(\s*(isElectron\(\)|!isWeb\(\)|import\.meta\.env\.VITE_IS_WEB_BUILD\s*===\s*['"]true['"]\s*)\s*\)\s*([^{\n].*?)(?=\n)/g, 
      'if ($1) {\n  $2\n}'
    );
    
    // Fix else statements without braces
    fixedContent = fixedContent.replace(
      /}\s*else\s+([^{\n].*?)(?=\n)/g,
      '} else {\n  $1\n}'
    );
    
    // Add missing closing braces for if/else blocks
    fixedContent = fixedContent.replace(
      /if\s*\([^{]*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*$/g,
      match => match + '\n}'
    );
    
    return fixedContent;
  },
  
  // Fix for logger.ts
  'src/backend/logger.ts': async (content) => {
    // For logger.ts, replace the file with a web-compatible version
    return `// Web-compatible logger implementation
// Original filename: src/backend/logger.ts

// Import path-browserify instead of node:path for web compatibility
import * as path from 'path-browserify';

// Define log interfaces
interface CleaningLogEntry {
  inputPath: string;
  outputPath: string;
  status: "success";
  timestamp: string;
  fileType: "image" | "video";
  originalSize?: number;
  cleanedSize?: number;
}

// Web-compatible logger
const webLogger = {
  info: (message: string) => console.info('[INFO]', message),
  warn: (message: string) => console.warn('[WARN]', message),
  error: (message: string) => console.error('[ERROR]', message),
  debug: (message: string) => console.debug('[DEBUG]', message),
  transports: {
    file: {
      getFile: () => null,
      resolvePathFn: () => '',
      level: 'info' as const,
      format: '',
      maxSize: 0,
      sync: false
    },
    console: {
      level: 'info' as const
    }
  }
};

// Export web-compatible logger
export const electronLog = webLogger;

// Web-compatible log function
export const appendToCleaningLog = (entry: CleaningLogEntry): void => {
  try {
    const logData = JSON.stringify(entry);
    localStorage.setItem(\`cleaning-log-\${Date.now()}\`, logData);
    console.log('Cleaning log entry saved:', entry);
  } catch (error) {
    console.error('Failed to append to cleaning log:', error);
  }
};`;
  },
  
  // Fix for cleaner.ts
  'src/backend/cleaner.ts': async (content) => {
    // For cleaner.ts, provide web-compatible implementation
    let fixedContent = content;
    
    // Replace electron-log import with web-compatible implementation
    fixedContent = fixedContent.replace(
      /import electronLog from ['"]electron-log['"];/g,
      `// Web compatible logger
const electronLog = {
  info: (message: string) => console.info('[INFO]', message),
  warn: (message: string) => console.warn('[WARN]', message),
  error: (message: string) => console.error('[ERROR]', message),
  debug: (message: string) => console.debug('[DEBUG]', message),
  transports: {
    file: {
      resolvePathFn: () => '',
      level: 'info' as const,
      format: '',
      maxSize: 0,
      sync: false
    },
    console: {
      level: 'info' as const
    }
  }
};`
    );
    
    // Replace child_process import with web-compatible implementation
    fixedContent = fixedContent.replace(
      /import\s+{\s*spawn\s*}\s*from\s+['"]child_process['"]/g,
      `// Web-compatible placeholder for child_process
// Note: This will purposefully fail in web environments
const spawn = () => {
  const process = {
    stdout: {
      on: (event: string, callback: (data: any) => void) => {}
    },
    stderr: {
      on: (event: string, callback: (data: any) => void) => {}
    },
    on: (event: string, callback: (code: number) => void) => {
      if (event === 'close') {
        setTimeout(() => callback(1), 100); // Simulate failure
      }
    }
  };
  return process as any;
};`
    );
    
    // Fix if statements without braces
    fixedContent = fixedContent.replace(
      /if\s*\(\s*(isElectron\(\)|!isWeb\(\)|import\.meta\.env\.VITE_IS_WEB_BUILD\s*===\s*['"]true['"]\s*)\s*\)\s*([^{\n].*?)(?=\n)/g, 
      'if ($1) {\n  $2\n}'
    );
    
    // Fix else statements without braces
    fixedContent = fixedContent.replace(
      /}\s*else\s+([^{\n].*?)(?=\n)/g,
      '} else {\n  $1\n}'
    );
    
    // Add missing closing braces for if/else blocks
    fixedContent = fixedContent.replace(
      /if\s*\([^{]*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*$/g,
      match => match + '\n}'
    );
    
    return fixedContent;
  }
};

// Main function to fix all files
async function fixWebBuildIssues() {
  try {
    logger.info('Starting to fix web build TypeScript issues');
    
    // Process each file
    for (const filePath of config.filesToFix) {
      try {
        const fullPath = path.join(__dirname, filePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          logger.warn(`File ${filePath} does not exist, skipping`);
          continue;
        }
        
        // Read file content
        const content = await readFile(fullPath, 'utf8');
        stats.filesProcessed++;
        
        // Apply fixes
        if (fixes[filePath]) {
          logger.info(`Fixing ${filePath}`);
          const fixedContent = await fixes[filePath](content);
          
          // Write fixed content
          await writeFile(fullPath, fixedContent, 'utf8');
          stats.filesFixed++;
          logger.success(`Fixed ${filePath}`);
        } else {
          logger.warn(`No fix defined for ${filePath}, skipping`);
        }
      } catch (error) {
        logger.error(`Error fixing ${filePath}: ${error.message}`);
        stats.errorCount++;
      }
    }
    
    // Log summary
    logger.info('\nFix Summary:');
    logger.info(`Files processed: ${stats.filesProcessed}`);
    logger.info(`Files fixed: ${stats.filesFixed}`);
    logger.info(`Errors: ${stats.errorCount}`);
    
    if (stats.errorCount === 0 && stats.filesFixed > 0) {
      logger.success('\nAll files fixed successfully!');
      logger.info('\nNext steps:');
      logger.info('1. Run "npm run build:web" to build the web version');
      logger.info('2. Test the web build locally using "npx vite preview --outDir dist"');
      logger.info('3. If everything works, deploy to Netlify');
    } else if (stats.errorCount > 0) {
      logger.error('\nSome files could not be fixed. Check the log file for details.');
    }
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
  }
}

// Run the fixer
fixWebBuildIssues();