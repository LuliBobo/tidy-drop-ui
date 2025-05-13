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
VITE_APP_API_KEY=${process.env.VITE_APP_API_KEY || ''}
VITE_APP_AUTH_DOMAIN=${process.env.VITE_APP_AUTH_DOMAIN || ''}
VITE_APP_PROJECT_ID=${process.env.VITE_APP_PROJECT_ID || ''}
VITE_APP_STORAGE_BUCKET=${process.env.VITE_APP_STORAGE_BUCKET || ''}
VITE_APP_MESSAGING_SENDER_ID=${process.env.VITE_APP_MESSAGING_SENDER_ID || ''} 
VITE_APP_APP_ID=${process.env.VITE_APP_APP_ID || ''}

# This file was automatically generated during the Netlify build process
# Any changes to this file will be overwritten on the next build
`;

try {
  // Write the .env file
  fs.writeFileSync(envFilePath, envContent);
  console.log('✅ Successfully created .env file for Netlify build');
  
  // Also log to the console for Netlify logs
  console.log('Environment variables set:');
  console.log('- VITE_IS_WEB_BUILD=true');
  console.log('- Firebase configuration variables');
} catch (error) {
  console.error('❌ Error creating .env file:', error);
  process.exit(1);
}
