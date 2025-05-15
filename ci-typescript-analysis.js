#!/usr/bin/env node

/**
 * CI Integration for TypeScript Error Analysis
 * 
 * This script is designed to run in CI/CD environments like GitHub Actions
 * to analyze TypeScript errors, generate reports, and provide feedback for pull requests.
 * It ensures that web deployment issues related to TypeScript are caught early.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}DropTidy TypeScript CI Integration${colors.reset}`);
console.log(`${colors.blue}====================================${colors.reset}\n`);

// Parse command line arguments
const args = process.argv.slice(2);
const ciMode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'github';
const shouldFail = !args.includes('--no-fail');
const verbose = args.includes('--verbose');
const isNetlifyMode = ciMode === 'netlify';

// Create reports directory
const reportDir = path.join(__dirname, 'ci-reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Function to run TypeScript check and get errors
function runTypeScriptCheck() {
  try {
    console.log(`${colors.blue}[CI]${colors.reset} Running TypeScript validation...`);
    execSync('npx tsc -p tsconfig.web.json --noEmit', { 
      stdio: 'pipe',
      encoding: 'utf-8' 
    });
    console.log(`${colors.green}[SUCCESS]${colors.reset} No TypeScript errors found!`);
    return { success: true, output: '' };
  } catch (error) {
    const output = error.stdout || error.message;
    console.log(`${colors.yellow}[WARNING]${colors.reset} Found TypeScript errors to analyze.`);
    return { success: false, output };
  }
}

// Function to generate GitHub Actions annotations
function createGitHubAnnotations(errors) {
  const annotationsPath = path.join(reportDir, 'typescript-errors.md');
  let annotationsContent = '# TypeScript Error Analysis\n\n';
  
  if (errors.length > 0) {
    annotationsContent += '## Errors by File\n\n';
    
    // Group errors by file
    const fileErrors = {};
    errors.forEach(error => {
      if (!fileErrors[error.file]) {
        fileErrors[error.file] = [];
      }
      fileErrors[error.file].push(error);
    });
    
    // Generate annotations for each file
    Object.entries(fileErrors).forEach(([file, fileErrors]) => {
      annotationsContent += `### ${path.basename(file)}\n\n`;
      
      fileErrors.forEach(error => {
        const location = `Line ${error.line}, Column ${error.column}`;
        annotationsContent += `- **TS${error.code}** (${location}): ${error.message}\n`;
        
        // Add code snippet if available
        if (error.codeContext) {
          annotationsContent += '  ```typescript\n';
          annotationsContent += `  ${error.codeContext.trim()}\n`;
          annotationsContent += '  ```\n';
        }
        
        // Add fix suggestion if available
        if (error.suggestion) {
          annotationsContent += `  **Suggestion**: ${error.suggestion}\n`;
        }
        
        annotationsContent += '\n';
      });
    });
  } else {
    annotationsContent += '✅ No TypeScript errors found! Your code is ready for deployment.\n';
  }
  
  fs.writeFileSync(annotationsPath, annotationsContent);
  
  // When running in GitHub Actions, output workflow commands
  if (process.env.GITHUB_ACTIONS === 'true') {
    errors.forEach(error => {
      // Format for GitHub Actions
      const message = error.message.replace(/"/g, '\\"');
      const file = error.file.replace(/"/g, '\\"');
      console.log(`::warning file=${file},line=${error.line},col=${error.column}::TS${error.code}: ${message}`);
    });
  }
  
  return annotationsPath;
}

// Function to analyze errors
function analyzeErrors(tsOutput) {
  const errors = [];
  const errorLines = tsOutput.split('\n');
  const fileErrorPattern = /(.+\.tsx?):(\d+):(\d+) - error TS(\d+): (.*)/;
  
  for (let i = 0; i < errorLines.length; i++) {
    const line = errorLines[i];
    const match = fileErrorPattern.exec(line);
    
    if (match) {
      const [_, filePath, lineNum, colNum, errorCode, errorMessage] = match;
      
      // Try to get code context
      let codeContext = '';
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const lineIndex = parseInt(lineNum, 10) - 1;
        const contextStart = Math.max(0, lineIndex - 2);
        const contextEnd = Math.min(lines.length - 1, lineIndex + 2);
        codeContext = lines.slice(contextStart, contextEnd + 1).join('\n');
      } catch (e) {
        // Ignore if file cannot be read
      }
      
      const error = {
        file: filePath,
        line: parseInt(lineNum, 10),
        column: parseInt(colNum, 10),
        code: errorCode,
        message: errorMessage,
        codeContext
      };
      
      // Add fix suggestion based on error code
      switch (errorCode) {
        case '2307': // Cannot find module
          error.suggestion = 'Create a web-compatible version of this module or install the missing dependency';
          break;
        case '2322': // Type assignment error
          error.suggestion = 'Check type compatibility or add type conversion';
          break;
        case '2339': // Property does not exist
          error.suggestion = 'Verify property name or implement missing property';
          break;
        case '2345': // Argument type mismatch
          error.suggestion = 'Ensure argument types match the function signature';
          break;
        default:
          // No specific suggestion
      }
      
      errors.push(error);
    }
  }
  
  return errors;
}

// Main function
async function main() {
  try {
    // Run TypeScript check
    const { success, output } = runTypeScriptCheck();
    
    // If successful, exit early
    if (success) {
      process.exit(0);
    }
    
    // Analyze errors
    const errors = analyzeErrors(output);
    
    // Save raw error output
    const errorLogPath = path.join(reportDir, 'typescript-errors.log');
    fs.writeFileSync(errorLogPath, output);
    
    // Generate report based on CI system
    let reportPath;
    if (ciMode === 'github') {
      reportPath = createGitHubAnnotations(errors);
    } else if (ciMode === 'netlify') {
      // Create Netlify-specific report
      reportPath = path.join(reportDir, 'typescript-errors-netlify.json');
      
      // Create a build log that Netlify will display in the UI
      const netlifyLog = `## TypeScript Error Report for Netlify
      
Total errors: ${errors.length}
Files with errors: ${Object.keys(errors.reduce((acc, e) => { acc[e.file] = true; return acc; }, {})).length}

Most common errors:
${Object.entries(errors.reduce((acc, e) => { 
  acc[`TS${e.code}`] = (acc[`TS${e.code}`] || 0) + 1; 
  return acc; 
}, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code, count]) => `- ${code}: ${count} occurrences`).join('\n')}

The build will continue using automatic TypeScript error handling.
`;
      
      // Write the log to a file that will be included in the Netlify build output
      fs.writeFileSync('typescript-errors-netlify.log', netlifyLog);
      console.log('\n' + netlifyLog);
      
      // Also save the detailed error report
      fs.writeFileSync(reportPath, JSON.stringify(errors, null, 2));
    } else {
      reportPath = path.join(reportDir, 'typescript-errors.json');
      fs.writeFileSync(reportPath, JSON.stringify(errors, null, 2));
    }
    
    // Run visualizer and analyzer in CI mode
    console.log(`${colors.blue}[CI]${colors.reset} Running detailed TypeScript error analysis...`);
    try {
      execSync(`node analyze-typescript-errors.js --ci --reportDir=${reportDir}`, { stdio: verbose ? 'inherit' : 'pipe' });
      execSync(`node visualize-typescript-errors.js --ci --reportDir=${reportDir}`, { stdio: verbose ? 'inherit' : 'pipe' });
    } catch (error) {
      console.log(`${colors.yellow}[WARNING]${colors.reset} Error analysis tools encountered issues: ${error.message}`);
    }
    
    // Display summary
    const errorsByFile = errors.reduce((acc, error) => {
      const file = path.basename(error.file);
      acc[file] = (acc[file] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n${colors.bold}${colors.blue}TypeScript Error Summary${colors.reset}`);
    console.log(`${colors.blue}========================${colors.reset}`);
    console.log(`Total errors: ${colors.bold}${errors.length}${colors.reset}`);
    console.log(`Files affected: ${colors.bold}${Object.keys(errorsByFile).length}${colors.reset}`);
    
    if (Object.keys(errorsByFile).length > 0) {
      console.log(`\nTop files with errors:`);
      Object.entries(errorsByFile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([file, count]) => {
          console.log(`  ${colors.yellow}${file}${colors.reset}: ${count} errors`);
        });
    }
    
    console.log(`\n${colors.blue}[CI]${colors.reset} Reports saved to: ${reportDir}`);
    
    // Exit with appropriate code
    if (shouldFail && errors.length > 0) {
      console.log(`\n${colors.red}[FAILED]${colors.reset} TypeScript validation failed with ${errors.length} errors`);
      process.exit(1);
    } else {
      console.log(`\n${colors.yellow}[WARNING]${colors.reset} TypeScript validation found ${errors.length} errors, but CI continues`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}[ERROR]${colors.reset} CI script failed: ${error.message}`);
    process.exit(1);
  }
}

main();
