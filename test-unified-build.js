#!/usr/bin/env node

/**
 * Test Unified Web Build Script
 * 
 * This script tests the unified web build approach with dry-run mode
 * to verify that the process works correctly without modifying files.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('\n🔍 Testing Unified Web Build in dry-run mode...\n');

// Get the latest log file if it exists
function getLatestLogFile() {
  try {
    const logFiles = fs.readdirSync('.')
      .filter(file => file.startsWith('web-build-unified-') && file.endsWith('.log'))
      .sort()
      .reverse();
    
    return logFiles.length > 0 ? logFiles[0] : null;
  } catch (error) {
    return null;
  }
}

// Display error analysis summary if available
function showErrorAnalysis() {
  const latestLog = getLatestLogFile();
  if (!latestLog) return;
  
  try {
    const logContent = fs.readFileSync(latestLog, 'utf8');
    const analysisMatch = logContent.match(/TypeScript Error Analysis:([\s\S]+?)(?=\n\n|\n$|$)/);
    
    if (analysisMatch && analysisMatch[1]) {
      console.log('\n📊 Error Analysis Summary from Last Run:\n');
      console.log(analysisMatch[1].trim());
      console.log('\nSee the full log in:', latestLog);
    }
  } catch (error) {
    // Silently ignore if we can't read the log
  }
}

try {
  // Run in dry-run mode with verbose output
  execSync('node unified-web-build.js --dry-run --verbose', { 
    stdio: 'inherit' 
  });
  console.log('\n✅ Dry run completed successfully!\n');
  
  // Show error analysis if available
  showErrorAnalysis();
  
  // Display options with detailed explanations
  console.log('\n📋 Available Build Options:\n');
  
  console.log('1) Run the full unified web build');
  console.log('   - Standard build with TypeScript validation');
  console.log('   - No automatic fixes applied');
  console.log('   - Best for clean codebases with no TypeScript issues\n');
  
  console.log('2) Run the unified web build with TypeScript fixes');
  console.log('   - Applies automatic fixes for common TypeScript issues');
  console.log('   - Handles boolean/string conversion issues');
  console.log('   - Fixes Electron API compatibility problems\n');
  
  console.log('3) Run the unified web build bypassing TypeScript');
  console.log('   - Skips TypeScript checking completely');
  console.log('   - Use only when other options fail');
  console.log('   - May result in runtime errors if TypeScript issues exist\n');
  
  console.log('4) Run the unified web build with advanced error analysis');
  console.log('   - Provides detailed analysis of TypeScript errors');
  console.log('   - Shows patterns and suggestions for fixing issues');
  console.log('   - Applies sophisticated automatic fixes');
  console.log('   - Includes comprehensive logging\n');
  
  console.log('5) Exit without building\n');
  
  console.log('\nRun the desired option with:');
  console.log('1) npm run build:web:unified');
  console.log('2) npm run build:web:unified:fix');
  console.log('3) npm run build:web:unified:bypass');
  console.log('4) npm run build:web:unified:advanced');
  console.log('4) npm run build:web:unified:advanced');
  
} catch (error) {
  console.error('\n❌ Dry run failed with error:', error.message);
  console.log('\nPlease check the issues and fix them before proceeding.');
  process.exit(1);
}
