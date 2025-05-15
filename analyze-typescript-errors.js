#!/usr/bin/env node

/**
 * Advanced TypeScript Error Analyzer for DropTidy
 * 
 * This script provides in-depth analysis of TypeScript errors,
 * identifies patterns, and suggests fixes based on our unified build system.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI colors for console output
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

console.log(`${colors.bold}${colors.blue}DropTidy Advanced TypeScript Error Analysis${colors.reset}`);
console.log(`${colors.blue}==========================================${colors.reset}\n`);

// Get TypeScript errors
console.log(`${colors.blue}[INFO]${colors.reset} Running TypeScript validation...`);

let tsOutput;
try {
  tsOutput = execSync('npx tsc -p tsconfig.web.json --noEmit', { 
    stdio: 'pipe',
    encoding: 'utf-8' 
  });
  console.log(`${colors.green}[SUCCESS]${colors.reset} No TypeScript errors found!`);
  process.exit(0);
} catch (error) {
  tsOutput = error.stdout || error.message;
  console.log(`${colors.yellow}[WARNING]${colors.reset} Found TypeScript errors to analyze.`);
}

// Process command line arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--test') || process.env.FORCE_TEST_MODE === 'true';
const isSampleMode = args.includes('--sample');
const isCIMode = args.includes('--ci');

// Parse directory arguments, ensuring quotes are removed if present
const parseDir = (arg) => {
  if (!arg) return undefined;
  let dir = arg.split('=')[1];
  // Remove quotes if they exist
  if (dir && (dir.startsWith('"') || dir.startsWith("'"))) {
    dir = dir.substring(1, dir.length - 1);
  }
  return dir;
};

const testDir = parseDir(args.find(arg => arg.startsWith('--testDir=')));
const sampleDir = parseDir(args.find(arg => arg.startsWith('--sampleDir=')));
const reportDir = parseDir(args.find(arg => arg.startsWith('--reportDir=')));
const isVerbose = args.includes('--verbose');
const showFixable = args.includes('--fixable');

// Parse TypeScript errors
console.log(`${colors.blue}[INFO]${colors.reset} Analyzing error patterns...`);

// If in test mode, use the test directory's error log
if ((isTestMode && testDir) || (isSampleMode && sampleDir) || (isCIMode && reportDir)) {
  try {
    let targetDir;
    let mode;

    if (isTestMode && testDir) {
      targetDir = testDir;
      mode = 'TEST';
    } else if (isSampleMode && sampleDir) {
      targetDir = sampleDir;
      mode = 'SAMPLE';
    } else if (isCIMode && reportDir) {
      targetDir = reportDir;
      mode = 'CI';
    }

    console.log(`${colors.blue}[${mode} MODE]${colors.reset} Using directory: ${targetDir}`);
    const errorLogPath = path.join(targetDir, 'typescript-errors.log');
    
    if (fs.existsSync(errorLogPath)) {
      tsOutput = fs.readFileSync(errorLogPath, 'utf-8');
      console.log(`${colors.green}[SUCCESS]${colors.reset} Loaded error log from ${errorLogPath}`);
    } else {
      console.log(`${colors.red}[ERROR]${colors.reset} Error log not found at ${errorLogPath}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}[ERROR]${colors.reset} Failed to load error log: ${error.message}`);
    process.exit(1);
  }
}

// Extract errors from TypeScript output
const errorLines = tsOutput.split('\n');
const fileErrorPattern = /(.+\.tsx?):(\d+):(\d+) - error TS(\d+): (.*)/;
const errors = [];

for (let i = 0; i < errorLines.length; i++) {
  const line = errorLines[i];
  const match = fileErrorPattern.exec(line);
  
  if (match) {
    const [_, filePath, lineNum, colNum, errorCode, errorMessage] = match;
    
    // Get the file content to provide context
    let context = '';
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const lineNumber = parseInt(lineNum, 10);
        
        // Get 2 lines before and after for context
        const startLine = Math.max(0, lineNumber - 3);
        const endLine = Math.min(lines.length - 1, lineNumber + 2);
        
        context = lines.slice(startLine, endLine + 1)
          .map((line, idx) => `${startLine + idx + 1}${startLine + idx + 1 === lineNumber ? '*' : ' '}: ${line}`)
          .join('\n');
      }
    } catch (error) {
      context = 'Could not read file content';
    }
    
    errors.push({
      file: filePath,
      line: parseInt(lineNum),
      column: parseInt(colNum),
      code: errorCode,
      message: errorMessage,
      context
    });
  }
}

// Error stats
const totalErrors = errors.length;
const uniqueFiles = new Set(errors.map(e => e.file)).size;
const errorTypes = {};
const fileErrorCounts = {};

errors.forEach(error => {
  // Count errors by type
  if (!errorTypes[error.code]) {
    errorTypes[error.code] = 1;
  } else {
    errorTypes[error.code]++;
  }
  
  // Count errors by file
  const fileName = path.basename(error.file);
  if (!fileErrorCounts[fileName]) {
    fileErrorCounts[fileName] = 1;
    fileErrorCounts[`${fileName}_errors`] = [error];
  } else {
    fileErrorCounts[fileName]++;
    fileErrorCounts[`${fileName}_errors`].push(error);
  }
});

// Detect error patterns
const errorPatterns = {
  booleanString: /Type '(true|false)' is not assignable to type 'string'/i,
  stringBoolean: /Type 'string' is not assignable to type 'boolean'/i,
  numberString: /Type 'number' is not assignable to type 'string'/i,
  electronApi: /Property '.*?' does not exist on type '.*?electronAPI'/i,
  missingModule: /Cannot find module '(electron|fs|path|child_process)'/i,
  nullAssignment: /Type 'null' is not assignable to type/i,
  propsInterface: /Property '.*?' is missing in type/i,
  objectIndex: /Element implicitly has an 'any' type because/i
};

// Count error patterns
const patternMatches = {};
Object.keys(errorPatterns).forEach(pattern => {
  patternMatches[pattern] = 0;
});

errors.forEach(error => {
  Object.entries(errorPatterns).forEach(([patternName, regex]) => {
    if (regex.test(error.message)) {
      patternMatches[patternName] = (patternMatches[patternName] || 0) + 1;
    }
  });
});

// Common error codes and descriptions
const errorDescriptions = {
  '2322': 'Type assignment error - Types are incompatible',
  '2339': 'Property does not exist on this type',
  '2307': 'Cannot find module - Missing import or package',
  '2345': 'Argument type mismatch in function call',
  '2741': 'Missing required property in object',
  '2531': 'Object is possibly null',
  '2532': 'Object is possibly undefined',
  '2769': 'No overload matches this call',
  '1005': 'Type is not a valid async function return type',
  '1109': 'Expression expected - Syntax error',
  '2304': 'Cannot find name - Variable or type may be undefined',
  '2551': 'Property does not exist on type (similar to 2339)',
  '2554': 'Expected arguments - Wrong number of arguments'
};

// Create automatic fix suggestions
function generateFixSuggestions(error) {
  const fixes = [];
  
  // Boolean to string conversion
  if (errorPatterns.booleanString.test(error.message)) {
    fixes.push({
      type: 'replace',
      description: 'Convert boolean to string representation',
      code: error.context.replace(/=\s*(true|false)/g, '= "$1"')
    });
  }
  
  // String to boolean conversion
  if (errorPatterns.stringBoolean.test(error.message)) {
    fixes.push({
      type: 'replace',
      description: 'Convert string to boolean',
      code: error.context.replace(/=\s*["']([^"']*)["']/g, (match, val) => {
        return val.toLowerCase() === 'true' ? '= true' : '= false';
      })
    });
  }
  
  // Electron API issues
  if (errorPatterns.electronApi.test(error.message)) {
    fixes.push({
      type: 'conditional',
      description: 'Add isElectron() check around Electron API usage',
      code: 'if (isElectron()) {\n  ' + error.context.split('\n')[2].trim() + '\n} else {\n  console.log("Electron API not available in web");\n}'
    });
  }
  
  // Missing module imports
  if (errorPatterns.missingModule.test(error.message)) {
    const module = error.message.match(/Cannot find module '([^']+)'/)[1];
    
    if (module === 'path') {
      fixes.push({
        type: 'import',
        description: 'Replace Node.js path with path-browserify',
        code: "import path from 'path-browserify';"
      });
    } else {
      fixes.push({
        type: 'conditional',
        description: `Add conditional import for ${module}`,
        code: `// Use polyfill or conditional import for ${module}\nimport { isElectron } from '@/lib/environment';\n\n// Then use conditionally:\n// if (isElectron()) { ... } else { ... }`
      });
    }
  }
  
  // Null/undefined assignments
  if (errorPatterns.nullAssignment.test(error.message)) {
    fixes.push({
      type: 'nullable',
      description: 'Use type union with null/undefined or add null check',
      code: '// Option 1: Update type definition to accept null\n// type YourType = string | null;\n\n// Option 2: Add null check\nif (value !== null) {\n  // Use value here\n}'
    });
  }
  
  return fixes;
}

// Generate fixes for all errors
const errorFixes = {};
errors.forEach(error => {
  const fixes = generateFixSuggestions(error);
  if (fixes.length > 0) {
    const key = `${path.basename(error.file)}:${error.line}`;
    errorFixes[key] = fixes;
  }
});

// Top error types
const topErrorTypes = Object.entries(errorTypes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// Top files with errors
const topErrorFiles = Object.entries(fileErrorCounts)
  .filter(([key]) => !key.endsWith('_errors'))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// Top error patterns
const topPatterns = Object.entries(patternMatches)
  .sort((a, b) => b[1] - a[1])
  .filter(([_, count]) => count > 0)
  .slice(0, 5);

// Calculate how many errors can be automatically fixed
const fixableErrorCount = Object.values(errorFixes).reduce((sum, fixes) => sum + (fixes.length > 0 ? 1 : 0), 0);

// Display summary in console
console.log(`\n${colors.bold}${colors.magenta}Error Analysis Summary${colors.reset}`);
console.log(`${colors.magenta}====================${colors.reset}`);
console.log(`${colors.bold}Total Errors:${colors.reset} ${totalErrors}`);
console.log(`${colors.bold}Affected Files:${colors.reset} ${uniqueFiles}`);
console.log(`${colors.bold}Automatically Fixable:${colors.reset} ${fixableErrorCount} errors (${Math.round(fixableErrorCount/totalErrors*100)}%)`);

console.log(`\n${colors.bold}Top Error Types:${colors.reset}`);
topErrorTypes.forEach(([code, count]) => {
  const description = errorDescriptions[code] || 'Unknown error type';
  console.log(`  TS${code} (${count} occurrences): ${description}`);
});

console.log(`\n${colors.bold}Top Error Patterns:${colors.reset}`);
topPatterns.forEach(([pattern, count]) => {
  console.log(`  ${pattern}: ${count} occurrences`);
});

console.log(`\n${colors.bold}Most Problematic Files:${colors.reset}`);
topErrorFiles.forEach(([file, count]) => {
  console.log(`  ${file}: ${count} errors`);
});

// Detailed file analysis for the worst offenders
console.log(`\n${colors.bold}${colors.cyan}Detailed Error Analysis${colors.reset}`);
console.log(`${colors.cyan}=======================${colors.reset}`);

// Loop through top 2 problematic files
topErrorFiles.slice(0, 2).forEach(([file, count]) => {
  console.log(`\n${colors.bold}File: ${file} (${count} errors)${colors.reset}`);
  
  // Get errors for this file
  const fileErrors = fileErrorCounts[`${file}_errors`];
  if (!fileErrors || fileErrors.length === 0) return;
  
  // Group errors by type
  const errorsByType = {};
  fileErrors.forEach(error => {
    if (!errorsByType[error.code]) {
      errorsByType[error.code] = [];
    }
    errorsByType[error.code].push(error);
  });
  
  // Show error examples by type
  Object.entries(errorsByType).forEach(([code, typeErrors]) => {
    const description = errorDescriptions[code] || 'Unknown error type';
    console.log(`\n  ${colors.yellow}TS${code}:${colors.reset} ${description} (${typeErrors.length} occurrences)`);
    
    // Show first error example
    const example = typeErrors[0];
    console.log(`\n  ${colors.bold}Example at line ${example.line}:${colors.reset}`);
    console.log(`    ${example.message}`);
    console.log(`\n    ${colors.cyan}Context:${colors.reset}`);
    console.log(`      ${example.context.split('\n').join('\n      ')}`);
    
    // Show fix suggestions
    const key = `${file}:${example.line}`;
    const fixes = errorFixes[key];
    if (fixes && fixes.length > 0) {
      console.log(`\n    ${colors.green}Suggested Fix:${colors.reset}`);
      console.log(`      ${fixes[0].description}`);
      console.log(`\n      ${colors.cyan}Code:${colors.reset}`);
      console.log(`        ${fixes[0].code.split('\n').join('\n        ')}`);
    }
  });
});

// Generate comprehensive recommendations
console.log(`\n${colors.bold}${colors.green}Recommended Actions${colors.reset}`);
console.log(`${colors.green}===================${colors.reset}`);

// Specific recommendations based on error patterns
if (patternMatches.booleanString > 0 || patternMatches.stringBoolean > 0) {
  console.log(`• ${colors.bold}Type Conversions:${colors.reset} Run ${colors.cyan}npm run build:web:unified:fix${colors.reset} to automatically fix type conversion issues`);
}

if (patternMatches.electronApi > 0) {
  console.log(`• ${colors.bold}Electron API:${colors.reset} Create web-compatible versions in ${colors.cyan}fixed-files/${colors.reset} directory for components using Electron APIs`);
}

if (patternMatches.missingModule > 0) {
  console.log(`• ${colors.bold}Node.js Modules:${colors.reset} Replace Node.js module imports with browser-compatible alternatives`);
}

if (patternMatches.propsInterface > 0) {
  console.log(`• ${colors.bold}Interface Properties:${colors.reset} Ensure all required properties are provided for component props`);
}

// General recommendations
console.log(`• ${colors.bold}Quick Build:${colors.reset} Use ${colors.cyan}npm run build:web:unified:bypass${colors.reset} to temporarily bypass TypeScript checks for development`);
console.log(`• ${colors.bold}Complete Fix:${colors.reset} Use ${colors.cyan}npm run build:web:unified:advanced${colors.reset} for comprehensive error handling`);
console.log(`• ${colors.bold}File Focus:${colors.reset} Prioritize fixing ${colors.cyan}${topErrorFiles[0]?.[0] || 'N/A'}${colors.reset} as it contains the most errors`);

console.log(`\n${colors.bold}${colors.blue}Next Steps${colors.reset}`);
console.log(`${colors.blue}==========${colors.reset}`);
console.log(`1. Run ${colors.cyan}node visualize-typescript-errors.js${colors.reset} for interactive error visualization`);
console.log(`2. Use ${colors.cyan}npm run benchmark:unified${colors.reset} to compare build performance options`);
console.log(`3. Check ${colors.cyan}TYPESCRIPT-TROUBLESHOOTING.md${colors.reset} for detailed error solutions\n`);

// Generate error report file
let reportPath;
if (isTestMode && testDir) {
  reportPath = path.join(testDir, 'typescript-analysis.json');
} else if (isSampleMode && sampleDir) {
  reportPath = path.join(sampleDir, 'typescript-analysis.json');
} else if (isCIMode && reportDir) {
  reportPath = path.join(reportDir, 'typescript-analysis.json');
} else {
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
  reportPath = `typescript-analysis-${timestamp}.json`;
}

const report = {
  summary: {
    totalErrors,
    uniqueFiles,
    fixableErrors: fixableErrorCount,
    timestamp: new Date().toISOString()
  },
  errorTypes: Object.entries(errorTypes).map(([code, count]) => ({
    code: `TS${code}`,
    count,
    description: errorDescriptions[code] || 'Unknown error type'
  })),
  patterns: Object.entries(patternMatches)
    .filter(([_, count]) => count > 0)
    .map(([pattern, count]) => ({ pattern, count })),
  problematicFiles: Object.entries(fileErrorCounts)
    .filter(([key]) => !key.endsWith('_errors'))
    .map(([file, count]) => ({ file, count })),
  fixes: Object.keys(errorFixes).length
};

// Save the report
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`${colors.green}[SUCCESS]${colors.reset} Saved analysis report to ${reportPath}`);
console.log(`Report saved to ${reportFileName}`);

// Show command tips
console.log(`\n${colors.bold}Tip:${colors.reset} To visualize errors in a browser, run: ${colors.cyan}node visualize-typescript-errors.js${colors.reset}`);