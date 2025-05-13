#!/usr/bin/env node

/**
 * DropTidy Web Build Bypass Script
 * 
 * This script bypasses TypeScript compilation and directly runs the Vite build.
 * Use this when you want to get a working web build without fixing all TypeScript errors.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⚠️ Running web build with TypeScript checks disabled');

// Run the web file replacements first
console.log('🔄 Running web file replacements...');
try {
  execSync('node use-web-files.js', { stdio: 'inherit' });
  console.log('✅ File replacements completed successfully');
} catch (error) {
  console.error('❌ Error running web file replacements:', error);
  process.exit(1);
}

// Run Vite build directly with web flag
console.log('🔧 Building web version with Vite...');
try {
  execSync('npx cross-env VITE_IS_WEB_BUILD=true vite build', { stdio: 'inherit' });
  console.log('✅ Web build completed successfully');
} catch (error) {
  console.error('❌ Error in Vite build:', error);
  process.exit(1);
}

console.log('🎉 Web build completed! You can find the output in the dist directory.');
console.log('⚠️ Note: TypeScript checking was bypassed. This is only recommended for testing.');
