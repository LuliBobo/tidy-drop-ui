#!/usr/bin/env node

/**
 * test-netlify-build.js
 * 
 * This script tests the Netlify build process locally to ensure everything works
 * before deploying. It runs all the steps in sequence and reports on success or failure.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output formatting
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

// Helper function to run a command and return its output
function runCommand(command, options = {}) {
  console.log(`${colors.blue}Running:${colors.reset} ${command}`);
  try {
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`${colors.red}Command failed:${colors.reset} ${command}`);
      console.error(`${colors.red}Error:${colors.reset} ${error.message}`);
    }
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.message,
      code: error.status || 1
    };
  }
}

// Main test function
async function testNetlifyBuild() {
  console.log(`\n${colors.bold}${colors.magenta}=== Testing Netlify Build Process ===${colors.reset}\n`);
  
  const startTime = Date.now();
  const steps = [];
  let allSuccess = true;
  
  // Step 1: Restore any existing backups to ensure a clean state
  console.log(`\n${colors.cyan}Step 1: Restoring original files from backups${colors.reset}`);
  const restoreResult = runCommand('node restore-netlify-backups.js', { ignoreError: true });
  steps.push({
    name: 'Restore backups',
    success: true, // Always consider this successful since it's preparatory
    duration: ((Date.now() - startTime) / 1000).toFixed(2)
  });
  
  // Step 2: Run prepare-netlify-env.cjs
  console.log(`\n${colors.cyan}Step 2: Setting up environment variables${colors.reset}`);
  const stepStartTime = Date.now();
  const envResult = runCommand('node prepare-netlify-env.cjs');
  steps.push({
    name: 'Environment setup',
    success: envResult.success,
    duration: ((Date.now() - stepStartTime) / 1000).toFixed(2),
    error: envResult.error
  });
  allSuccess = allSuccess && envResult.success;
  
  // Step 3: Run fix-netlify-build.js
  console.log(`\n${colors.cyan}Step 3: Running fix-netlify-build.js${colors.reset}`);
  const fixStartTime = Date.now();
  const fixResult = runCommand('node fix-netlify-build.js');
  steps.push({
    name: 'Fix web files',
    success: fixResult.success,
    duration: ((Date.now() - fixStartTime) / 1000).toFixed(2),
    error: fixResult.error
  });
  allSuccess = allSuccess && fixResult.success;
  
  // Step 4: Run TypeScript compilation
  console.log(`\n${colors.cyan}Step 4: Running TypeScript compilation${colors.reset}`);
  const tscStartTime = Date.now();
  const tscResult = runCommand('cross-env VITE_IS_WEB_BUILD=true tsc -p tsconfig.web.json');
  steps.push({
    name: 'TypeScript compilation',
    success: tscResult.success,
    duration: ((Date.now() - tscStartTime) / 1000).toFixed(2),
    error: tscResult.error
  });
  allSuccess = allSuccess && tscResult.success;
  
  // Step 5: Run Vite build
  console.log(`\n${colors.cyan}Step 5: Running Vite build${colors.reset}`);
  const viteStartTime = Date.now();
  const viteResult = runCommand('cross-env VITE_IS_WEB_BUILD=true vite build');
  steps.push({
    name: 'Vite build',
    success: viteResult.success,
    duration: ((Date.now() - viteStartTime) / 1000).toFixed(2),
    error: viteResult.error
  });
  allSuccess = allSuccess && viteResult.success;
  
  // Step 6: Restore original files
  console.log(`\n${colors.cyan}Step 6: Restoring original files${colors.reset}`);
  const restoreFinalTime = Date.now();
  runCommand('node restore-netlify-backups.js');
  steps.push({
    name: 'Restore original files',
    success: true,
    duration: ((Date.now() - restoreFinalTime) / 1000).toFixed(2)
  });
  
  // Print report
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bold}${colors.magenta}=== Netlify Build Test Report ===${colors.reset}\n`);
  
  for (const step of steps) {
    const statusColor = step.success ? colors.green : colors.red;
    const status = step.success ? 'SUCCESS' : 'FAILED';
    console.log(`${colors.bold}${step.name}:${colors.reset} ${statusColor}${status}${colors.reset} (${step.duration}s)`);
    if (!step.success && step.error) {
      console.log(`  ${colors.red}Error:${colors.reset} ${step.error}`);
    }
  }
  
  console.log(`\n${colors.bold}Total duration:${colors.reset} ${totalDuration}s`);
  console.log(`${colors.bold}Overall status:${colors.reset} ${allSuccess ? colors.green + 'SUCCESS' : colors.red + 'FAILED'}${colors.reset}\n`);
  
  if (allSuccess) {
    console.log(`${colors.green}✓ The Netlify build process is working correctly!${colors.reset}`);
    console.log(`${colors.cyan}You can now deploy to Netlify with confidence.${colors.reset}\n`);
    console.log(`To deploy, run: ${colors.yellow}npm run netlify:deploy${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ The Netlify build process has issues that need to be fixed.${colors.reset}`);
    console.log(`${colors.yellow}Please review the errors above and fix them before deploying.${colors.reset}\n`);
  }
  
  return allSuccess;
}

// Run the test
testNetlifyBuild().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
