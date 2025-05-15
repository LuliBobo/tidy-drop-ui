#!/usr/bin/env node

/**
 * Netlify TypeScript Error Handler
 * 
 * This script is designed to be run during Netlify builds to handle
 * TypeScript errors in a graceful way, providing clear reports without
 * failing the build (unless instructed to).
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

// Parse command line arguments
const args = process.argv.slice(2);
const isFatal = args.includes('--fatal');
const isVerbose = args.includes('--verbose');
const skipAnalysis = args.includes('--skip-analysis');
const skipReport = args.includes('--skip-report');

// Is this running in Netlify environment?
const isNetlify = process.env.NETLIFY === 'true';
const buildId = process.env.NETLIFY_BUILD_ID || 'local';
const siteName = process.env.SITE_NAME || 'local-site';
const deployContext = process.env.CONTEXT || 'local';

console.log(`\n${colors.bold}${colors.blue}Netlify TypeScript Error Handler${colors.reset}`);
console.log(`${colors.blue}===============================\n${colors.reset}`);
console.log(`${colors.blue}Environment:${colors.reset} ${isNetlify ? 'Netlify' : 'Local'}`);
console.log(`${colors.blue}Build ID:${colors.reset} ${buildId}`);
console.log(`${colors.blue}Site:${colors.reset} ${siteName}`);
console.log(`${colors.blue}Context:${colors.reset} ${deployContext}`);
console.log('');

// Create reports directory
const reportsDir = path.join(__dirname, 'netlify-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Skip the analysis if flag is set
if (skipAnalysis) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} Skipping TypeScript analysis due to --skip-analysis flag`);
  process.exit(0);
}

// Run the TypeScript analysis
console.log(`${colors.blue}[INFO]${colors.reset} Running TypeScript analysis...`);

try {
  // First, check if TypeScript is installed
  try {
    execSync('npx tsc --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(`${colors.yellow}[WARNING]${colors.reset} TypeScript not found. Installing...`);
    execSync('npm install --no-save typescript', { stdio: 'inherit' });
  }
  
  // Run analyze-typescript-errors.js
  const analyzeScript = path.join(__dirname, 'analyze-typescript-errors.js');
  const outputFile = path.join(reportsDir, `typescript-errors-${buildId}.json`);
  
  if (isVerbose) {
    console.log(`${colors.blue}[INFO]${colors.reset} Running: node ${analyzeScript} --output=${outputFile}`);
  }
  
  execSync(`node ${analyzeScript} --output=${outputFile}${isVerbose ? ' --verbose' : ''}`, { stdio: 'inherit' });
  
  // Check if errors were found
  const errorData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const errorCount = errorData.summary?.totalErrors || 0;
  
  // Generate a report unless skipped
  if (!skipReport) {
    console.log(`${colors.blue}[INFO]${colors.reset} Generating error report...`);
    
    // Run visualize-typescript-errors.js
    const visualizeScript = path.join(__dirname, 'visualize-typescript-errors.js');
    const reportFile = path.join(reportsDir, `typescript-errors-${buildId}.md`);
    
    execSync(`node ${visualizeScript} --input=${outputFile} --output=${reportFile}`, { stdio: 'inherit' });
    
    console.log(`${colors.green}[SUCCESS]${colors.reset} Report generated at ${reportFile}`);
  }
  
  // Log results and decide whether to fail
  if (errorCount > 0) {
    console.log(`${colors.yellow}[WARNING]${colors.reset} Found ${errorCount} TypeScript errors.`);
    
    // Create a summary file for Netlify build logs
    const logSummary = `
# TypeScript Error Summary

- Build ID: ${buildId}
- Site: ${siteName}
- Deploy context: ${deployContext}
- Time: ${new Date().toISOString()}

## Errors

Found ${errorCount} TypeScript errors.

${errorData.errors.slice(0, 5).map(error => 
  `- ${error.file}:${error.line} - ${error.message}`
).join('\n')}

${errorData.errors.length > 5 ? `\n...and ${errorData.errors.length - 5} more errors.` : ''}

## Actions

${isFatal ? '⚠️ Build will fail due to TypeScript errors. Fix them before deploying.' : 
           '⚠️ Building despite TypeScript errors. Please fix them in a future deployment.'}
`;
    
    fs.writeFileSync(path.join(reportsDir, `typescript-summary-${buildId}.md`), logSummary);
    
    // Create a marker file that Netlify can detect
    fs.writeFileSync(path.join(reportsDir, 'HAS_TS_ERRORS'), 'true');
    
    if (isFatal) {
      console.log(`${colors.red}[FATAL]${colors.reset} Build failing due to TypeScript errors and --fatal flag.`);
      process.exit(1);
    } else {
      console.log(`${colors.yellow}[WARNING]${colors.reset} Building despite TypeScript errors.`);
      console.log(`${colors.yellow}[WARNING]${colors.reset} Add --fatal flag to make the build fail on TypeScript errors.`);
    }
  } else {
    console.log(`${colors.green}[SUCCESS]${colors.reset} No TypeScript errors found!`);
    
    // Remove error marker file if it exists
    const errorMarkerFile = path.join(reportsDir, 'HAS_TS_ERRORS');
    if (fs.existsSync(errorMarkerFile)) {
      fs.unlinkSync(errorMarkerFile);
    }
  }
  
  // Always exit successfully unless --fatal is specified and errors were found
  process.exit(0);
} catch (error) {
  console.log(`${colors.red}[ERROR]${colors.reset} Failed to analyze TypeScript errors: ${error.message}`);
  
  if (isFatal) {
    process.exit(1);
  } else {
    console.log(`${colors.yellow}[WARNING]${colors.reset} Continuing build despite TypeScript analysis failure.`);
    process.exit(0);
  }
}
