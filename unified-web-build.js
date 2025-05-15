#!/usr/bin/env node

/**
 * unified-web-build.js
 * 
 * A comprehensive solution for DropTidy web builds that combines:
 * - File replacements (from use-web-files.js)
 * - TypeScript error fixing (from fix-typescript-errors.js)
 * - Direct file modifications (from fix-netlify-build.js)
 * 
 * This script can be used for both development and Netlify deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  fix: args.includes('--fix') || args.includes('-f'),
  bypass: args.includes('--bypass-ts') || args.includes('-b'),
  skipRestore: args.includes('--skip-restore'),
  log: args.includes('--log') || args.includes('-l'),
  dryRun: args.includes('--dry-run'),
  skipTypeCheck: args.includes('--skip-typecheck') || args.includes('-s')
};

// Configuration
const config = {
  // Files that should be replaced with web-specific versions
  fixedFiles: [
    'src/lib/environment.ts',
    'src/lib/environment.web.ts',
    'src/components/Navbar.tsx',
    'src/components/FileCleaner.tsx',
    'src/components/ElectronFallbacks.tsx',
    'src/backend/cleaner.ts',
    'src/backend/logger.ts'
  ],
  
  // TypeScript auto-fixes for common errors
  typescriptFixes: [
    {
      filePattern: 'src/components/ElectronFallbacks.tsx',
      fixes: [
        {
          search: /electronAPI\.\(\(\) => \{.*?\}\)\(\);/g,
          replace: 'electronAPI.openFolder();'
        },
        {
          search: /electronAPI\.\(\(.*?\) => \{.*?\}\)\(.*?\);/g,
          replace: 'electronAPI.showItemInFolder(filePath);'
        },
        {
          search: /const \[api, setAPI\] = useState<any>\(null\);/g,
          replace: 'const [api] = useState({isWeb: true, isElectron: false});'
        }
      ]
    },
    {
      filePattern: 'src/components/Navbar.tsx',
      fixes: [
        {
          search: /<DropTidyLogo className="h-6 w-6" \/>/g,
          replace: '<DropTidyLogo size={24} />'
        },
        {
          search: /isOpen=\{isFeedbackOpen\}/g,
          replace: 'open={isFeedbackOpen}'
        },
        {
          search: /onClose=\{\(\) => setIsFeedbackOpen\(false\)\}/g,
          replace: 'onOpenChange={() => setIsFeedbackOpen(false)}'
        }
      ]
    },
    {
      filePattern: 'src/components/FileCleaner.tsx',
      fixes: [
        {
          search: /metadata\?: \{ \[key: string\]: string \| number \};/g,
          replace: 'metadata?: { [key: string]: string | number | boolean };'
        },
        {
          search: /cleaned: true/g,
          replace: 'cleaned: "true"'
        }
      ]
    }
  ],
  
  // Files to check for import replacements
  importReplacements: {
    'electron': {
      replace: true,
      comment: '// Electron imports removed for web build'
    },
    'fs': {
      replace: true,
      comment: '// Node.js fs module import removed for web build'
    },
    'path': {
      replace: false,
      webAlternative: "import path from 'path-browserify';"
    }
  }
};

// Create log file
const timestamp = new Date().toISOString();
const logFileName = `web-build-unified-${timestamp.replace(/[:\.]/g, '-')}.log`;
const logFilePath = path.join(__dirname, logFileName);
let logContent = `DropTidy Unified Web Build Log - ${timestamp}\n\n`;

// Helper functions
function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    heading: `${colors.bold}${colors.magenta}===`,
  }[type] || `${colors.blue}[INFO]${colors.reset}`;
  
  const formattedMessage = type === 'heading' 
    ? `${prefix} ${message} ${colors.magenta}===${colors.reset}`
    : `${prefix} ${message}`;
  
  console.log(formattedMessage);
  logContent += `${type.toUpperCase()}: ${message}\n`;
}

function createBackup(filePath) {
  const backupPath = `${filePath}.electron-backup`;
  if (!fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(filePath, backupPath);
      log(`Created backup: ${backupPath}`, 'info');
      return true;
    } catch (err) {
      log(`Error creating backup for ${filePath}: ${err.message}`, 'error');
      return false;
    }
  }
  return true;
}

function applyFixedFile(filePath) {
  const baseName = path.basename(filePath);
  const webVersionPath = path.join(__dirname, 'fixed-files', baseName);
  
  if (fs.existsSync(webVersionPath)) {
    try {
      const webContent = fs.readFileSync(webVersionPath, 'utf8');
      
      if (!options.dryRun) {
        fs.writeFileSync(filePath, webContent);
      }
      
      log(`Replaced ${filePath} with version from fixed-files/${baseName}`, 'success');
      return true;
    } catch (err) {
      log(`Error using fixed version for ${filePath}: ${err.message}`, 'error');
      return false;
    }
  } else {
    log(`No fixed version found for ${baseName}`, 'warning');
    return false;
  }
}

function applyTypescriptFixes(filePath, content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // Find applicable fixes for this file
  const fileFixConfig = config.typescriptFixes.find(
    fix => filePath.endsWith(fix.filePattern) || filePath.includes(fix.filePattern)
  );
  
  if (!fileFixConfig) {
    return { content: fixedContent, fixCount };
  }
  
  for (const fix of fileFixConfig.fixes) {
    const originalContent = fixedContent;
    fixedContent = fixedContent.replace(fix.search, fix.replace);
    
    if (originalContent !== fixedContent) {
      fixCount++;
      log(`Applied TypeScript fix to ${path.basename(filePath)}: ${fix.search}`, 'info');
    }
  }
  
  return { content: fixedContent, fixCount };
}

function fixImports(filePath, content) {
  let fixedContent = content;
  let importFixCount = 0;
  
  // Handle import replacements
  for (const [moduleName, config] of Object.entries(config.importReplacements)) {
    const importRegex = new RegExp(`import\\s+.*?\\s+from\\s+['"]${moduleName}['"]\\s*;?`, 'g');
    const typeImportRegex = new RegExp(`import\\s+type\\s+.*?\\s+from\\s+['"]${moduleName}['"]\\s*;?`, 'g');
    
    if (config.replace) {
      // Replace with comment
      const originalContent = fixedContent;
      fixedContent = fixedContent.replace(importRegex, config.comment);
      fixedContent = fixedContent.replace(typeImportRegex, config.comment);
      
      if (originalContent !== fixedContent) {
        importFixCount++;
        log(`Replaced ${moduleName} imports in ${path.basename(filePath)}`, 'info');
      }
    } else if (config.webAlternative) {
      // Replace with web alternative
      const originalContent = fixedContent;
      fixedContent = fixedContent.replace(importRegex, config.webAlternative);
      
      if (originalContent !== fixedContent) {
        importFixCount++;
        log(`Replaced ${moduleName} import with web alternative in ${path.basename(filePath)}`, 'info');
      }
    }
  }
  
  return { content: fixedContent, importFixCount };
}

// Helper to analyze TypeScript errors and extract patterns
function analyzeTypeScriptErrors(errorOutput) {
  const results = {
    files: [],
    errorTypes: {},
    suggestions: [],
    commonPatterns: {},
    fixableProblemCount: 0
  };
  
  // Extract file paths and error messages
  const errorLines = errorOutput.split('\n');
  const fileErrorPattern = /(.+\.tsx?):(\d+):(\d+) - error TS(\d+): (.*)/;
  
  // Common error patterns to look for
  const commonErrorPatterns = {
    'electronApiCall': /Property '.*?' does not exist on type '.*?electronAPI'/i,
    'booleanString': /Type '(true|false)' is not assignable to type 'string'/i,
    'stringBoolean': /Type 'string' is not assignable to type 'boolean'/i,
    'numberString': /Type 'number' is not assignable to type 'string'/i,
    'objectTypeMismatch': /Type '.*?' is missing the following properties from type '.*?'/i,
    'libraryMissing': /Cannot find module '(electron|fs|path|child_process|crypto)'/i,
    'nullUndefined': /Type 'null' is not assignable to type/i
  };
  
  for (let i = 0; i < errorLines.length; i++) {
    const line = errorLines[i];
    const match = fileErrorPattern.exec(line);
    
    if (match) {
      const [_, filePath, lineNum, colNum, errorCode, errorMessage] = match;
      const simplePath = path.basename(filePath);
      
      // Add to file list if not already there
      if (!results.files.find(f => f.path === simplePath)) {
        results.files.push({
          path: simplePath,
          fullPath: filePath,
          errors: []
        });
      }
      
      // Add error to the file
      const fileEntry = results.files.find(f => f.path === simplePath);
      fileEntry.errors.push({
        line: parseInt(lineNum, 10),
        column: parseInt(colNum, 10),
        code: errorCode,
        message: errorMessage
      });
      
      // Count error types
      if (!results.errorTypes[errorCode]) {
        results.errorTypes[errorCode] = 1;
      } else {
        results.errorTypes[errorCode]++;
      }
      
      // Check for common patterns in the error message
      for (const [patternName, pattern] of Object.entries(commonErrorPatterns)) {
        if (pattern.test(errorMessage)) {
          if (!results.commonPatterns[patternName]) {
            results.commonPatterns[patternName] = {
              count: 1,
              examples: [{ filePath: simplePath, line: lineNum, message: errorMessage }]
            };
          } else {
            results.commonPatterns[patternName].count++;
            // Add example if we don't have many yet
            if (results.commonPatterns[patternName].examples.length < 3) {
              results.commonPatterns[patternName].examples.push({ 
                filePath: simplePath, 
                line: lineNum, 
                message: errorMessage 
              });
            }
          }
          
          // Count this as potentially fixable if it's a type we know how to fix
          if (['booleanString', 'stringBoolean', 'numberString', 'electronApiCall'].includes(patternName)) {
            results.fixableProblemCount++;
          }
          
          break; // Only count first matching pattern for this error
        }
      }
    }
  }
  
  // Generate suggestions based on error patterns
  if (results.errorTypes['2322']) {
    results.suggestions.push('Run with --fix option to attempt automatic type fixes for type mismatches');
    
    // More specific suggestions based on common patterns
    if (results.commonPatterns['booleanString'] || results.commonPatterns['stringBoolean']) {
      results.suggestions.push('Boolean/string type conflicts detected - consider using string representations ("true"/"false")');
    }
    
    if (results.commonPatterns['numberString']) {
      results.suggestions.push('Number/string type conflicts detected - consider using string.toString() conversions');
    }
  }
  
  if (results.errorTypes['2339'] && results.commonPatterns['electronApiCall']) {
    results.suggestions.push('Electron API calls need web-compatible alternatives - consider creating mock implementations');
  }
  
  if (results.commonPatterns['libraryMissing']) {
    results.suggestions.push('Node.js modules need web-compatible alternatives (path-browserify, fs-extra-browserify)');
  }
  
  if (results.errorTypes['1003']) {
    results.suggestions.push('Syntax errors detected that may need manual fixing');
  }
  
  // Add general suggestions
  if (results.fixableProblemCount > 0) {
    results.suggestions.push(`Approximately ${results.fixableProblemCount} errors can be fixed automatically`);
  }
  
  if (Object.keys(results.errorTypes).length > 0) {
    results.suggestions.push('Consider using --bypass-ts if errors are in Electron-specific code');
    
    // If there are many errors, suggest focusing on most common
    if (Object.keys(results.errorTypes).reduce((sum, key) => sum + results.errorTypes[key], 0) > 10) {
      const topErrors = Object.entries(results.errorTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
      
      results.suggestions.push(`Focus on fixing TS${topErrors[0][0]} errors first (${topErrors[0][1]} occurrences)`);
    }
  }
  
  return results;
}

// Main function to process a file
function processFile(filePath) {
  log(`Processing ${filePath}`, 'info');
  
  // Read the original file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    log(`Error reading ${filePath}: ${err.message}`, 'error');
    return false;
  }
  
  // Create a backup before modifying
  if (!createBackup(filePath)) {
    return false;
  }
  
  // Try to use a pre-built web version first
  if (applyFixedFile(filePath)) {
    return true;
  }
  
  // Apply TypeScript fixes
  const { content: tsFixedContent, fixCount } = applyTypescriptFixes(filePath, content);
  content = tsFixedContent;
  
  // Fix imports
  const { content: importFixedContent, importFixCount } = fixImports(filePath, content);
  content = importFixedContent;
  
  // Only write the file if we made changes
  if (fixCount > 0 || importFixCount > 0) {
    if (!options.dryRun) {
      try {
        fs.writeFileSync(filePath, content);
        log(`Modified ${filePath} with ${fixCount} TypeScript fixes and ${importFixCount} import fixes`, 'success');
        return true;
      } catch (err) {
        log(`Error writing to ${filePath}: ${err.message}`, 'error');
        return false;
      }
    } else {
      log(`Would modify ${filePath} with ${fixCount} TypeScript fixes and ${importFixCount} import fixes (dry run)`, 'info');
      return true;
    }
  }
  
  log(`No changes needed for ${filePath}`, 'info');
  return true;
}

// Restore backups
function restoreBackups() {
  log('Restoring files from backups...', 'heading');
  
  try {
    const backupFiles = fs.readdirSync('src')
      .filter(file => file.endsWith('.electron-backup'))
      .map(file => path.join('src', file));
      
    let restoredCount = 0;
    let errorCount = 0;
    
    for (const backupFile of backupFiles) {
      const originalFile = backupFile.replace('.electron-backup', '');
      const backupPath = path.join(__dirname, backupFile);
      const originalPath = path.join(__dirname, originalFile);
      
      try {
        if (!options.dryRun) {
          fs.copyFileSync(backupPath, originalPath);
        }
        log(`Restored ${originalFile}`, 'success');
        restoredCount++;
      } catch (error) {
        log(`Error restoring ${originalFile}: ${error.message}`, 'error');
        errorCount++;
      }
    }
    
    log(`Restore complete! Restored ${restoredCount} file(s) with ${errorCount} error(s).`, 'heading');
  } catch (error) {
    log(`Error finding backup files: ${error.message}`, 'error');
  }
}

// Run script
async function main() {
  log('DropTidy Unified Web Build', 'heading');
  
  if (options.verbose) {
    log(`Options: ${JSON.stringify(options, null, 2)}`, 'info');
  }
  
  // Process the fixed files
  let successCount = 0;
  let failCount = 0;
  
  for (const file of config.fixedFiles) {
    const filePath = path.resolve(__dirname, file);
    if (fs.existsSync(filePath)) {
      const success = processFile(filePath);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      log(`File not found: ${filePath}`, 'warning');
      failCount++;
    }
  }
  
  log(`Processing complete! ${successCount} files processed successfully, ${failCount} failed.`, 'heading');
  
  // TypeScript validation check
  if (!options.dryRun && !options.bypass && !options.skipTypeCheck) {
    log('Validating TypeScript compilation...', 'info');
    try {
      // Run tsc in noEmit mode to check for errors without generating output
      execSync('npx tsc -p tsconfig.web.json --noEmit', { 
        stdio: 'pipe',
        encoding: 'utf-8' 
      });
      log('TypeScript validation successful! No errors found.', 'success');
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      log('TypeScript validation found errors:', 'error');
      
      // Analyze common patterns in TypeScript errors
      const errorAnalysis = analyzeTypeScriptErrors(errorOutput);
      log(`Error Analysis: ${errorAnalysis.files.length} problematic files identified`, 'info');
      
      // Show summary of problems
      log('--- TypeScript Error Analysis ---', 'heading');
      log(`Found ${Object.values(errorAnalysis.errorTypes).reduce((sum, count) => sum + count, 0)} total errors`, 'info');
      log(`Approximately ${errorAnalysis.fixableProblemCount} errors can be fixed automatically`, 'info');
      
      // Show file breakdown
      log('Files with most errors:', 'info');
      errorAnalysis.files
        .sort((a, b) => b.errors.length - a.errors.length)
        .slice(0, 5)
        .forEach(file => {
          log(`  ${file.path}: ${file.errors.length} errors`, 'info');
        });
      
      // Show error type breakdown
      log('Top error types:', 'info');
      Object.entries(errorAnalysis.errorTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([errorCode, count]) => {
          log(`  TS${errorCode}: ${count} occurrences`, 'info');
        });
      
      // Show common patterns
      if (Object.keys(errorAnalysis.commonPatterns).length > 0) {
        log('Common error patterns detected:', 'info');
        Object.entries(errorAnalysis.commonPatterns)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 3)
          .forEach(([pattern, data]) => {
            log(`  ${pattern}: ${data.count} occurrences`, 'info');
            if (options.verbose && data.examples.length > 0) {
              log(`    Example: ${data.examples[0].filePath}:${data.examples[0].line}`, 'info');
            }
          });
      }
      
      // Add suggestions to the console
      log('Suggestions:', 'warning');
      errorAnalysis.suggestions.forEach(suggestion => {
        log(`  • ${suggestion}`, 'warning');
      });
      
      if (options.verbose) {
        log('Detailed error output:', 'info');
        log(errorOutput, 'error');
      }
      
      // Add the error analysis to log
      logContent += '\n\nTypeScript Error Analysis:\n';
      logContent += JSON.stringify(errorAnalysis, null, 2);
      
      if (options.fix) {
        log('Attempting automatic TypeScript fixes based on error analysis...', 'info');
        
        // Apply additional fixes based on error analysis
        for (const file of errorAnalysis.files) {
          const filePath = path.resolve(__dirname, file.fullPath);
          if (!fs.existsSync(filePath)) continue;
          
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            let modified = content;
            let fixesApplied = 0;
            
            // Apply specific fixes based on identified patterns
            if (errorAnalysis.commonPatterns['booleanString']) {
              // Convert boolean literals to string literals
              modified = modified.replace(/([^"']):(\s*)(true|false)\b/g, (match, prefix, space, value) => {
                fixesApplied++;
                return `${prefix}:${space}"${value}"`;
              });
            }
            
            if (errorAnalysis.commonPatterns['numberString']) {
              // Add toString() to number values assigned to string contexts
              modified = modified.replace(/([^"']):(\s*)(\d+)([,}\]])/g, (match, prefix, space, value, suffix) => {
                fixesApplied++;
                return `${prefix}:${space}"${value}"${suffix}`;
              });
            }
            
            if (fixesApplied > 0 && modified !== content) {
              log(`Applied ${fixesApplied} automatic fixes to ${file.path}`, 'success');
              if (!options.dryRun) {
                fs.writeFileSync(filePath, modified);
              }
            }
          } catch (err) {
            log(`Error applying automatic fixes to ${file.path}: ${err.message}`, 'error');
          }
        }
      }
      
      // Return failure unless we're skipping TypeScript
      if (!options.skipRestore) {
        restoreBackups();
      }
      process.exit(1);
    }
  }
  
  // Save the log file
  if (options.log) {
    try {
      fs.writeFileSync(logFilePath, logContent);
      log(`Log saved to ${logFileName}`, 'success');
    } catch (err) {
      log(`Failed to save log file: ${err.message}`, 'error');
    }
  }
  
  // Restore backups if needed
  if (!options.skipRestore) {
    process.on('exit', () => {
      if (process.exitCode !== 0) {
        log('Process exited with error, restoring backups...', 'warning');
        restoreBackups();
      }
    });
  }
  
  // Return success/failure
  return failCount === 0;
}

// Run the script and handle errors
main().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  if (!options.skipRestore) {
    restoreBackups();
  }
  process.exit(1);
});
