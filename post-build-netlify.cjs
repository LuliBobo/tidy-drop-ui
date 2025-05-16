#!/usr/bin/env node

/**
 * Post-build script to enhance Netlify deployment
 * This ensures necessary files are in the build directory
 * Using .cjs extension for CommonJS syntax compatibility
 */

const fs = require('fs');
const path = require('path');

// Publish directory from netlify.toml
const PUBLISH_DIR = path.join(__dirname, 'dist', 'renderer');

console.log('Running post-build enhancements for Netlify deployment...');

// Ensure directory exists
if (!fs.existsSync(PUBLISH_DIR)) {
  console.error(`Build directory ${PUBLISH_DIR} does not exist!`);
  process.exit(1);
}

// Create _redirects file
const redirectsPath = path.join(PUBLISH_DIR, '_redirects');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log(`Created ${redirectsPath}`);

// Copy debug script to build directory
const debugScriptSource = path.join(__dirname, 'public', 'debug-netlify.js');
const debugScriptDest = path.join(PUBLISH_DIR, 'debug-netlify.js');

if (fs.existsSync(debugScriptSource)) {
  fs.copyFileSync(debugScriptSource, debugScriptDest);
  console.log(`Copied debug script to ${debugScriptDest}`);
} else {
  console.warn(`Debug script not found at ${debugScriptSource}`);
}

// Create a netlify.json file with build metadata for troubleshooting
const buildMeta = {
  timestamp: new Date().toISOString(),
  node_version: process.version,
  platform: process.platform,
  env_variables: {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VITE_IS_WEB_BUILD: process.env.VITE_IS_WEB_BUILD || 'unknown'
  }
};

const buildMetaPath = path.join(PUBLISH_DIR, 'netlify-meta.json');
fs.writeFileSync(buildMetaPath, JSON.stringify(buildMeta, null, 2));
console.log(`Created build metadata at ${buildMetaPath}`);

console.log('Post-build enhancements completed successfully!');
