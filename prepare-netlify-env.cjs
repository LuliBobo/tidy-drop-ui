#!/usr/bin/env node

/**
 * Netlify Build Environment Preparation Script
 * 
 * This script:
 * 1. Creates a .env file for Netlify builds with VITE_IS_WEB_BUILD=true
 * 2. Prepares the environment for TypeScript error analysis
 * 
 * This script should be run as part of the Netlify build process,
 * before the main build command.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`\n${colors.bold}${colors.blue}Preparing Netlify environment${colors.reset}\n`);

// Path to the .env file
const envFilePath = path.join(process.cwd(), '.env');

// Content to write to the .env file
const envContent = `# Environment variables for Netlify web build
VITE_IS_WEB_BUILD=true
VITE_APP_API_KEY=${process.env.VITE_APP_API_KEY || ''}
VITE_APP_AUTH_DOMAIN=${process.env.VITE_APP_AUTH_DOMAIN || ''}
VITE_APP_PROJECT_ID=${process.env.VITE_APP_PROJECT_ID || ''}
VITE_APP_STORAGE_BUCKET=${process.env.VITE_APP_STORAGE_BUCKET || ''}
VITE_APP_MESSAGING_SENDER_ID=${process.env.VITE_APP_MESSAGING_SENDER_ID || ''} 
VITE_APP_APP_ID=${process.env.VITE_APP_APP_ID || ''}
VITE_TYPESCRIPT_ANALYSIS=true

# This file was automatically generated during the Netlify build process
# Any changes to this file will be overwritten on the next build
`;

try {
  // Write the .env file
  fs.writeFileSync(envFilePath, envContent);
  console.log(`${colors.green}✅ Successfully created .env file for Netlify build${colors.reset}`);
  
  // Also log to the console for Netlify logs
  console.log('Environment variables set:');
  console.log('- VITE_IS_WEB_BUILD=true');
  console.log('- VITE_TYPESCRIPT_ANALYSIS=true');
  console.log('- Firebase configuration variables');
} catch (error) {
  console.error(`${colors.red}❌ Error creating .env file:${colors.reset}`, error);
  process.exit(1);
}

// ========== TypeScript Analysis Environment Setup ==========
console.log(`\n${colors.bold}${colors.blue}Setting up TypeScript analysis environment${colors.reset}`);

// Create necessary directories for TypeScript analysis
const directories = [
  'netlify-reports',
  'ci-reports',
  'tmp'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`${colors.blue}[INFO]${colors.reset} Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Ensure typescript is installed
try {
  console.log(`${colors.blue}[INFO]${colors.reset} Checking TypeScript installation...`);
  execSync('npx tsc --version', { stdio: 'pipe' });
  console.log(`${colors.green}[SUCCESS]${colors.reset} TypeScript is installed.`);
} catch (error) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} TypeScript not found, installing...`);
  try {
    execSync('npm install --no-save typescript@latest', { stdio: 'inherit' });
  } catch (err) {
    console.log(`${colors.yellow}[WARNING]${colors.reset} Could not install TypeScript, continuing anyway.`);
  }
}

// Ensure analysis scripts are executable
const scripts = [
  'netlify-typescript-handler.js',
  'analyze-typescript-errors.js',
  'visualize-typescript-errors.js',
  'ci-typescript-analysis.js'
];

scripts.forEach(script => {
  const scriptPath = path.join(process.cwd(), script);
  if (fs.existsSync(scriptPath)) {
    console.log(`${colors.blue}[INFO]${colors.reset} Making script executable: ${script}`);
    try {
      fs.chmodSync(scriptPath, 0o755);
    } catch (error) {
      console.log(`${colors.yellow}[WARNING]${colors.reset} Failed to make ${script} executable: ${error.message}`);
    }
  } else {
    console.log(`${colors.yellow}[WARNING]${colors.reset} Script not found: ${script}`);
  }
});

// Create Netlify build metadata file
const buildMeta = {
  buildId: process.env.NETLIFY_BUILD_ID || 'unknown',
  deployUrl: process.env.DEPLOY_URL || 'unknown',
  siteName: process.env.SITE_NAME || 'unknown',
  context: process.env.CONTEXT || 'unknown',
  timestamp: new Date().toISOString(),
  branch: process.env.BRANCH || 'unknown',
  commitRef: process.env.COMMIT_REF || 'unknown'
};

const metaPath = path.join(process.cwd(), 'netlify-reports', 'build-meta.json');
fs.writeFileSync(metaPath, JSON.stringify(buildMeta, null, 2));
console.log(`${colors.blue}[INFO]${colors.reset} Netlify build metadata written to: ${metaPath}`);

console.log(`${colors.green}✅ Environment preparation complete${colors.reset}\n`);
