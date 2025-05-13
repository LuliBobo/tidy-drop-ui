#!/usr/bin/env node

/**
 * Netlify Build Environment Preparation Script
 * 
 * This script creates a .env file for Netlify builds that sets
 * VITE_IS_WEB_BUILD=true to ensure proper environment detection.
 * 
 * This script should be run as part of the Netlify build process,
 * before the main build command.
 */

const fs = require('fs');
const path = require('path');

// Path to the .env file
const envFilePath = path.join(process.cwd(), '.env');

// Content to write to the .env file
const envContent = `# Environment variables for Netlify web build
VITE_IS_WEB_BUILD=true

# This file was automatically generated during the Netlify build process
# Any changes to this file will be overwritten on the next build
`;

try {
  // Write the .env file
  fs.writeFileSync(envFilePath, envContent);
  console.log('✅ Successfully created .env file with VITE_IS_WEB_BUILD=true');
  
  // Also log to the console for Netlify logs
  console.log('Environment variables set:');
  console.log('- VITE_IS_WEB_BUILD=true');
} catch (error) {
  console.error('❌ Failed to create .env file:', error);
  process.exit(1);
}
