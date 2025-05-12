#!/usr/bin/env node

/**
 * DropTidy Web Build Preparation Script
 * 
 * This script modifies the codebase to make it compatible with web deployment by:
 * 1. Temporarily disabling or modifying Electron-specific imports and code
 * 2. Creating web-compatible alternatives for Electron-specific functionality
 * 3. Preserving the original functionality where possible
 * 
 * Usage: 
 *   node prepare-web-build.js
 * 
 * Run this script before building for web deployment.
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
  // Directories to scan for files
  directories: ['src'],
  
  // Files and directories to always ignore
  ignorePatterns: [
    'src/main/**/*',         // Electron main process files
    'src/preload/**/*',      // Electron preload scripts
    'src/electron.js',       // Main Electron entry
    'src/types/global.d.ts', // Global type definitions
    'electron-builder.js',   // Electron builder config
    '**/node_modules/**/*'   // Node modules
  ],
  
  // Backup extension to use when backing up modified files
  backupExtension: '.electron-backup',
  
  // Whether to create backups of modified files
  createBackups: true,
  
  // Whether to write detailed logs to a file
  writeLogFile: true,
  
  // Log file path
  logFile: 'web-build-modifications.log'
};

// Counters for logging
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  electronImportsFound: 0,
  ipcCallsFound: 0,
  errorCount: 0
};

// Replacements configuration - each entry defines a pattern and its replacement
const replacements = [
  // 1. Replace Electron imports with comments
  {
    name: 'Electron module imports',
    // Match lines like: import { app, BrowserWindow } from 'electron'
    pattern: /^import\s+.*?\s+from\s+['"]electron['"].*?;?$/gm,
    replacement: '// WEB BUILD: Electron import removed for web deployment',
    description: 'Remove direct electron imports'
  },
  
  // 2. Replace Electron require statements with comments
  {
    name: 'Electron require statements',
    // Match lines like: const { ipcRenderer } = require('electron')
    pattern: /(?:const|let|var)\s+.*?\s*=\s*require\(['"]electron['"]\).*?;?$/gm,
    replacement: '// WEB BUILD: Electron require statement removed for web deployment',
    description: 'Remove electron require statements'
  },
  
  // 3. Replace specific Electron-related imports 
  {
    name: 'Electron-related package imports',
    // Match imports from other electron-related packages
    pattern: /^import\s+.*?\s+from\s+['"](@electron\/remote|electron-log|electron-store)['"].*?;?$/gm,
    replacement: '// WEB BUILD: Electron-related package import removed for web deployment',
    description: 'Remove imports from electron-related packages'
  },
  
  // 4. Replace direct window.electron usage with safe access
  {
    name: 'Direct window.electron usage',
    // Match direct access to window.electron
    pattern: /(window\.electron\.)(\w+)(\.\w+\()/g,
    replacement: '/* WEB BUILD: Safe access */ (window.electron && window.electron.$2$3 || (() => Promise.resolve(undefined)))',
    description: 'Make window.electron access safe for web'
  },
  
  // 5. Handle IPC renderer invoke calls
  {
    name: 'IPC renderer invoke with fallback',
    // Match lines that use window.electron?.ipcRenderer.invoke
    pattern: /(window\.electron\?\.ipcRenderer\.invoke\(['"].*?['"])([^)]*)\)/g,
    replacement: '/* WEB BUILD: Added web fallback */ ($1$2).catch(err => { console.warn("IPC call failed in web context:", err); return undefined; })',
    description: 'Add error handling to IPC calls'
  },
  
  // 6. Replace IPC renderer on/once event handlers
  {
    name: 'IPC event handlers',
    // Match IPC .on and .once event handlers
    pattern: /(window\.electron\?\.ipcRenderer\.)(?:on|once)\(['"]([^'"]+)['"],\s*(.*?)\)/g,
    replacement: '/* WEB BUILD: Disabled IPC event handler for "$2" */ $1on?.("$2", $3) /* Safe for web */',
    description: 'Make IPC event handlers safe for web'
  },
  
  // 7. Handle Electron-specific functions with safe alternatives
  {
    name: 'Electron-specific API calls',
    pattern: /(?:app|shell|dialog|nativeImage|screen|powerMonitor|clipboard)\.(\w+)\(/g,
    replacement: '/* WEB BUILD: Disabled Electron API */ (()=>undefined)(',
    description: 'Disable Electron-specific API calls'
  }
];

// Logger utility
const logger = {
  log: (message) => {
    console.log(message);
    if (config.writeLogFile) {
      fs.appendFileSync(config.logFile, message + '\n');
    }
  },
  
  info: (message) => {
    const formattedMessage = chalk.blue(`[INFO] ${message}`);
    console.log(formattedMessage);
    if (config.writeLogFile) {
      fs.appendFileSync(config.logFile, `[INFO] ${message}\n`);
    }
  },
  
  success: (message) => {
    const formattedMessage = chalk.green(`[SUCCESS] ${message}`);
    console.log(formattedMessage);
    if (config.writeLogFile) {
      fs.appendFileSync(config.logFile, `[SUCCESS] ${message}\n`);
    }
  },
  
  warning: (message) => {
    const formattedMessage = chalk.yellow(`[WARNING] ${message}`);
    console.log(formattedMessage);
    if (config.writeLogFile) {
      fs.appendFileSync(config.logFile, `[WARNING] ${message}\n`);
    }
  },
  
  error: (message, error) => {
    const formattedMessage = chalk.red(`[ERROR] ${message}`);
    console.error(formattedMessage);
    if (error) console.error(error);
    if (config.writeLogFile) {
      fs.appendFileSync(config.logFile, `[ERROR] ${message}\n`);
      if (error) fs.appendFileSync(config.logFile, `${error.stack || error}\n`);
    }
    stats.errorCount++;
  }
};

/**
 * Find all TypeScript and JavaScript files in specified directories,
 * excluding files that match ignore patterns.
 */
async function findFiles() {
  const files = [];
  
  for (const dir of config.directories) {
    try {
      const pattern = `${dir}/**/*.{ts,tsx,js,jsx}`;
      const foundFiles = await glob(pattern, {
        ignore: config.ignorePatterns,
        absolute: true
      });
      files.push(...foundFiles);
    } catch (error) {
      logger.error(`Error finding files in directory: ${dir}`, error);
    }
  }
  
  return files;
}

/**
 * Process a file by applying all configured replacements.
 * 
 * @param {string} filePath - Path to the file to process
 */
async function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    // Read file content
    const content = await readFile(filePath, 'utf8');
    let modifiedContent = content;
    let isModified = false;
    
    // Apply each replacement pattern
    for (const replacement of replacements) {
      const originalContent = modifiedContent;
      
      // Apply the replacement
      modifiedContent = modifiedContent.replace(replacement.pattern, (match) => {
        logger.info(`Found in ${path.basename(filePath)}: ${replacement.name} - "${match.trim()}"`);
        
        // Count specific types of findings
        if (replacement.name.includes('import') || replacement.name.includes('require')) {
          stats.electronImportsFound++;
        } else if (replacement.name.includes('IPC')) {
          stats.ipcCallsFound++;
        }
        
        return replacement.replacement;
      });
      
      // Check if this pattern made any changes
      if (originalContent !== modifiedContent) {
        isModified = true;
      }
    }
    
    // Create backup and write modified content if changed
    if (isModified) {
      stats.filesModified++;
      
      // Create backup if configured
      if (config.createBackups) {
        const backupPath = `${filePath}${config.backupExtension}`;
        await writeFile(backupPath, content, 'utf8');
        logger.info(`Created backup: ${backupPath}`);
      }
      
      // Write modified content
      await writeFile(filePath, modifiedContent, 'utf8');
      logger.success(`Modified: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error processing file: ${filePath}`, error);
  }
}

/**
 * Specialized function to update the isElectron function in environment.ts
 * to respect the VITE_IS_WEB_BUILD environment variable.
 */
async function updateEnvironmentDetection() {
  const filePath = path.join(process.cwd(), 'src/lib/environment.ts');
  
  try {
    if (!fs.existsSync(filePath)) {
      logger.warning(`Environment detection file not found: ${filePath}`);
      return;
    }
    
    const content = await readFile(filePath, 'utf8');
    
    // Check if the file already has the web build check
    if (content.includes('import.meta.env.VITE_IS_WEB_BUILD')) {
      logger.info('Environment detection already supports web build flag.');
      return;
    }
    
    // Find the isElectron function
    const isElectronFuncPattern = /export\s+function\s+isElectron\(\)\s*:\s*boolean\s*\{[\s\S]+?\}/;
    const match = content.match(isElectronFuncPattern);
    
    if (!match) {
      logger.warning('Could not find isElectron function in environment.ts');
      return;
    }
    
    // Original function content
    const originalFunc = match[0];
    
    // Modified function with web build environment variable check
    const modifiedFunc = originalFunc.replace(
      /export\s+function\s+isElectron\(\)\s*:\s*boolean\s*\{/,
      `export function isElectron(): boolean {
  // WEB BUILD: Check for web build environment variable first
  if (import.meta.env && import.meta.env.VITE_IS_WEB_BUILD === 'true') {
    console.debug('Running in web mode due to VITE_IS_WEB_BUILD=true');
    return false;
  }
  
  // Original detection logic continues below`
    );
    
    // Create backup if configured
    if (config.createBackups) {
      const backupPath = `${filePath}${config.backupExtension}`;
      await writeFile(backupPath, content, 'utf8');
      logger.info(`Created backup of environment.ts: ${backupPath}`);
    }
    
    // Replace the function in the file
    const updatedContent = content.replace(originalFunc, modifiedFunc);
    await writeFile(filePath, updatedContent, 'utf8');
    logger.success('Updated environment detection to support web build flag.');
    
  } catch (error) {
    logger.error('Error updating environment detection:', error);
  }
}

/**
 * Main function that orchestrates the web build preparation process.
 */
async function main() {
  // Initialize log file if configured
  if (config.writeLogFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    config.logFile = `web-build-modifications-${timestamp}.log`;
    fs.writeFileSync(config.logFile, `DropTidy Web Build Preparation Log - ${new Date().toISOString()}\n\n`);
  }
  
  logger.log(chalk.bold.blue('=== DropTidy Web Build Preparation ==='));
  logger.log('Starting web build preparation...');
  
  try {
    // Update environment detection to respect VITE_IS_WEB_BUILD
    await updateEnvironmentDetection();
    
    // Find all TypeScript and JavaScript files
    const files = await findFiles();
    logger.info(`Found ${files.length} files to process`);
    
    // Process each file
    for (const file of files) {
      await processFile(file);
    }
    
    // Log stats
    logger.log('\n' + chalk.bold.blue('=== Processing Statistics ==='));
    logger.log(chalk.bold(`Files processed: ${stats.filesProcessed}`));
    logger.log(chalk.bold(`Files modified: ${stats.filesModified}`));
    logger.log(chalk.bold(`Electron imports found: ${stats.electronImportsFound}`));
    logger.log(chalk.bold(`IPC calls found: ${stats.ipcCallsFound}`));
    logger.log(chalk.bold(`Errors encountered: ${stats.errorCount}`));
    
    logger.success('Web build preparation complete!');
    
    if (stats.errorCount > 0) {
      logger.warning(`Completed with ${stats.errorCount} errors. Check the log for details.`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unhandled error during web build preparation:', error);
    process.exit(1);
  }
}

// Run the script
main();
