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

  // 4. Handle function calls to window.electron in various contexts
  {
    name: 'Window.electron function calls',
    pattern: /(const|let|var)?\s*(\w+)\s*=\s*(?:await\s+)?(window\.electron[?.][^;()]*\([^;)]*\))/g,
    replacement: (match, declType, varName, funcCall) => {
      // For variable declarations (const result = window.electron...)
      if (declType) {
        return `${declType} ${varName} = /* WEB VERSION */ (false && ${funcCall}) ?? (() => { 
          console.log("Electron API not available in web version"); 
          return undefined; 
        })()`;
      }
      // For standalone function calls
      return `/* WEB VERSION */ (false && ${funcCall}) ?? (() => { 
        console.log("Electron API not available in web version"); 
      })()`;
    },
    description: 'Make window.electron function calls safe with proper fallbacks'
  },

  // 5. Handle if/then blocks that use window.electron with proper syntax preservation
  {
    name: 'Electron API in if conditions',
    pattern: /if\s*\(\s*window\.electron[^)]*\)\s*\{([^}]*)\}/g,
    replacement: (match, blockContent) => {
      return `if (false /* WEB VERSION: Electron check disabled */) {${blockContent}}`;
    },
    description: 'Preserve if blocks but disable Electron conditions'
  },

  // 6. Ensure window.electron property access is safe
  {
    name: 'Window.electron property access',
    pattern: /window\.electron\.(\w+)\.(\w+)(?!\()/g,
    replacement: '/* WEB VERSION */ (window.electron?.$1?.$2 ?? undefined)',
    description: 'Make window.electron property access safe'
  },

  // 7. Enhanced pattern for IPC invoke with proper TypeScript safety
  {
    name: 'IPC renderer invoke with typed fallback',
    pattern: /(await\s+)?window\.electron[?]?\.ipcRenderer\.invoke\(['"]([^'"]+)['"]([^)]*)\)/g,
    replacement: (match, awaitPrefix, channel, args) => {
      const await_ = awaitPrefix || '';
      return `${await_}safeIpcInvoke('${channel}'${args}, async () => { 
        console.log("Web fallback for IPC channel: ${channel}"); 
        return undefined; 
      })`;
    },
    description: 'Replace direct IPC calls with safeIpcInvoke utility'
  },

  // 8. Handle IPC renderer event handlers
  {
    name: 'IPC event handler registration',
    pattern: /(window\.electron[?]?\.ipcRenderer\.)(?:on|once)\(['"]([^'"]+)['"],\s*([\w.]+|(?:function\s*\([^)]*\)\s*\{[^}]*\}))\)/g,
    replacement: 'safeIpcOn("$2", $3)',
    description: 'Replace IPC event handlers with safeIpcOn utility'
  },

  // 9. Handle environment detection in if/else blocks
  {
    name: 'Environment detection if/else',
    pattern: /if\s*\(\s*(isElectron\(\)|!isWeb\(\))\s*\)\s*\{([\s\S]*?)\}\s*else\s*\{([\s\S]*?)\}/g,
    replacement: (match, condition, electronCode, webCode) => {
      // Keep the entire block intact, the isElectron() function will properly handle the environment
      return match;
    },
    description: 'Preserve environment detection blocks'
  },

  // 10. Handle standalone Electron API calls
  {
    name: 'Standalone Electron API calls',
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
    
    // First check if the file is importing or using environment utilities
    const usesEnvironmentUtils = (/isElectron|isWeb|safeIpcInvoke|safeIpcOn/).test(content);

    // Add environment utility imports if the file will need them
    if (!usesEnvironmentUtils && 
        (/window\.electron/).test(content) && 
        !(/['"]@\/lib\/environment['"]/).test(content)) {
      // Needs environment utilities but doesn't import them - add the import
      if (isTypescriptFile(filePath) && hasElectronUsage(content)) {
        const importStatement = "import { isElectron, safeIpcInvoke, safeIpcOn } from '@/lib/environment';\n";
        modifiedContent = addImport(modifiedContent, importStatement);
        isModified = true;
        logger.info(`Added environment utilities import to ${path.basename(filePath)}`);
      }
    }
    
    // Apply each replacement pattern
    for (const replacement of replacements) {
      const originalContent = modifiedContent;
      
      // Apply the replacement - if it's a function, use it, otherwise use it as a string
      if (typeof replacement.replacement === 'function') {
        modifiedContent = modifiedContent.replace(replacement.pattern, (...args) => {
          const match = args[0];
          logger.info(`Found in ${path.basename(filePath)}: ${replacement.name} - "${match.trim().slice(0, 100)}..."`);
          
          // Count specific types of findings
          if (replacement.name.includes('import') || replacement.name.includes('require')) {
            stats.electronImportsFound++;
          } else if (replacement.name.includes('IPC')) {
            stats.ipcCallsFound++;
          }
          
          return replacement.replacement(...args);
        });
      } else {
        modifiedContent = modifiedContent.replace(replacement.pattern, (match) => {
          logger.info(`Found in ${path.basename(filePath)}: ${replacement.name} - "${match.trim().slice(0, 100)}..."`);
          
          // Count specific types of findings
          if (replacement.name.includes('import') || replacement.name.includes('require')) {
            stats.electronImportsFound++;
          } else if (replacement.name.includes('IPC')) {
            stats.ipcCallsFound++;
          }
          
          return replacement.replacement;
        });
      }
      
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
      
      // Check for TypeScript errors in the modified file
      if (isTypescriptFile(filePath)) {
        try {
          await validateTypescriptSyntax(filePath);
        } catch (tsError) {
          logger.warning(`TypeScript errors detected in modified file: ${path.basename(filePath)}`);
          logger.warning(tsError.message);
        }
      }
    }
  } catch (error) {
    logger.error(`Error processing file: ${filePath}`, error);
  }
}

/**
 * Check if a file is a TypeScript file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if the file is a TypeScript file
 */
function isTypescriptFile(filePath) {
  return /\.(ts|tsx)$/.test(filePath);
}

/**
 * Check if the content has Electron usage
 * @param {string} content - The file content
 * @returns {boolean} - True if the content has Electron usage
 */
function hasElectronUsage(content) {
  return (/window\.electron/).test(content);
}

/**
 * Add an import statement after the last import or at the top of the file
 * @param {string} content - The file content
 * @param {string} importStatement - The import statement to add
 * @returns {string} - The modified content
 */
function addImport(content, importStatement) {
  // Find the position after the last import statement
  const importRegex = /^import\s+.*?from\s+['"].*?['"];?$/gm;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 0) {
    // Get the last import statement and its position
    const lastMatch = matches[matches.length - 1];
    const insertPosition = lastMatch.index + lastMatch[0].length;
    
    // Insert the new import after the last import
    return content.slice(0, insertPosition) + '\n' + importStatement + content.slice(insertPosition);
  } else {
    // If no imports found, add at the top of the file
    return importStatement + content;
  }
}

/**
 * Validate TypeScript syntax of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<void>} - Resolves if file has valid syntax, rejects with error otherwise
 */
async function validateTypescriptSyntax(filePath) {
  // This is a placeholder for a real TypeScript validator
  // In a real implementation, you might use the TypeScript Compiler API
  // or a command line call to tsc to validate the syntax
  
  // Here we'll just do some basic checks
  const content = await readFile(filePath, 'utf8');
  
  // Check for common TypeScript syntax errors
  const problems = [];
  
  if (content.includes('await') && !content.match(/async\s+/) && !content.match(/\.then\(/)) {
    problems.push('Found await without async keyword');
  }
  
  if ((content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length) {
    problems.push('Mismatched curly braces');
  }
  
  if ((content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length) {
    problems.push('Mismatched parentheses');
  }
  
  // Look for incomplete if statements
  if (content.match(/if\s*\([^{]*\)\s*(?!\{)/)) {
    problems.push('Incomplete if statement (missing brackets)');
  }
  
  // Look for incomplete else statements
  if (content.match(/else\s*(?!\{)/)) {
    problems.push('Incomplete else statement (missing brackets)');
  }
  
  if (problems.length > 0) {
    throw new Error(`TypeScript syntax problems detected: ${problems.join('; ')}`);
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

/**
 * Creates a web-compatible fallbacks module if it doesn't exist in the project
 */
async function ensureFallbacksExist() {
  const fallbacksPath = path.join(process.cwd(), 'src/components/ElectronFallbacks.tsx');
  const environmentPath = path.join(process.cwd(), 'src/lib/environment.ts');
  
  // If ElectronFallbacks.tsx doesn't exist, create it
  if (!fs.existsSync(fallbacksPath)) {
    logger.info('Creating ElectronFallbacks.tsx module...');
    
    const fallbacksContent = `/**
 * Electron API Fallbacks for Web Deployment
 * 
 * This module provides web-safe fallbacks for Electron APIs that can be used
 * during web deployment. It helps maintain TypeScript integrity by providing
 * proper function signatures and behavior.
 */

import { toast } from '@/hooks/use-toast';
import { isElectron } from '@/lib/environment';

/**
 * Opens a folder in the system file explorer
 * Falls back to a toast message in web environment
 */
export async function openFolder(folderPath: string): Promise<void> {
  if (!isElectron()) {
    toast({
      title: "Web Version",
      description: "Opening folders is only available in the desktop app",
      variant: "default"
    });
    return;
  }
  
  try {
    await window.electron?.app.openFolder(folderPath);
  } catch (error) {
    console.error("Error opening folder:", error);
    toast({
      title: "Error",
      description: "Failed to open folder",
      variant: "destructive"
    });
  }
}

/**
 * Shows an item in the system file explorer
 * Falls back to a toast message in web environment
 */
export async function showItemInFolder(filePath: string): Promise<void> {
  if (!isElectron()) {
    toast({
      title: "Web Version",
      description: "Showing files in folder is only available in the desktop app",
      variant: "default"
    });
    return;
  }
  
  try {
    await window.electron?.app.showItemInFolder(filePath);
  } catch (error) {
    console.error("Error showing item in folder:", error);
    toast({
      title: "Error",
      description: "Failed to show item in folder",
      variant: "destructive"
    });
  }
}

/**
 * Gets a path from the system
 * Falls back to a reasonable default in web environment
 */
export function getPath(name: string): string {
  if (!isElectron()) {
    const webFallbacks: Record<string, string> = {
      'home': '/home',
      'appData': '/appData',
      'userData': '/userData',
      'temp': '/temp',
      'downloads': '/downloads',
      'documents': '/documents'
    };
    
    return webFallbacks[name] || '/';
  }
  
  try {
    return window.electron?.app.getPath(name) || '/';
  } catch (error) {
    console.error(\`Error getting path for \${name}:\`, error);
    return '/';
  }
}

/**
 * Creates a zip file from multiple files
 * Falls back to a toast message in web environment
 */
export async function createZip(filePaths: string[]): Promise<string | undefined> {
  if (!isElectron()) {
    toast({
      title: "Web Version",
      description: "Creating ZIP archives is only available in the desktop app",
      variant: "default"
    });
    return undefined;
  }
  
  try {
    return await window.electron?.ipcRenderer.invoke('create-zip', filePaths);
  } catch (error) {
    console.error("Error creating ZIP:", error);
    toast({
      title: "Error",
      description: "Failed to create ZIP archive",
      variant: "destructive"
    });
    return undefined;
  }
}`;
    
    await writeFile(fallbacksPath, fallbacksContent, 'utf8');
    logger.success('Created ElectronFallbacks.tsx');
  }

  // Check if environment.ts exists and has required functions
  if (fs.existsSync(environmentPath)) {
    const envContent = await readFile(environmentPath, 'utf8');
    
    // If it doesn't have safeIpcInvoke, add it
    if (!envContent.includes('safeIpcInvoke')) {
      logger.warning('environment.ts found but missing safeIpcInvoke function.');
    }
    
    // If it doesn't have isElectron, add it
    if (!envContent.includes('isElectron()')) {
      logger.warning('environment.ts found but missing isElectron function.');
    }
  }
}

// Run the script
main().then(async () => {
  await ensureFallbacksExist();
  logger.info('Finished preparing for web build');
});
