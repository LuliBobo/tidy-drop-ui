#!/usr/bin/env node

/**
 * Unified Web Build Performance Benchmark
 * 
 * This script benchmarks different build configurations to help optimize the build process.
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 DropTidy Unified Web Build Performance Benchmark');
console.log('====================================================\n');

// Define build configurations to benchmark
const buildConfigs = [
  {
    name: 'Standard Build',
    command: 'node unified-web-build.js --dry-run',
    description: 'Basic unified web build without fixes'
  },
  {
    name: 'TypeScript Fixes',
    command: 'node unified-web-build.js --dry-run --fix',
    description: 'Build with TypeScript fixes'
  },
  {
    name: 'Advanced Error Analysis',
    command: 'node unified-web-build.js --dry-run --fix --verbose',
    description: 'Build with advanced error analysis'
  },
  {
    name: 'Bypass TypeScript',
    command: 'node unified-web-build.js --dry-run --bypass-ts',
    description: 'Build bypassing TypeScript checks'
  }
];

// Track benchmark results
const results = [];

// Run each benchmark
for (const config of buildConfigs) {
  console.log(`\n🔄 Running benchmark: ${config.name}`);
  console.log(`Description: ${config.description}`);
  console.log(`Command: ${config.command}`);
  
  try {
    // Measure execution time
    const startTime = process.hrtime.bigint();
    
    // Execute the build command with suppressed output
    execSync(`${config.command} > /dev/null 2>&1`);
    
    // Calculate elapsed time
    const endTime = process.hrtime.bigint();
    const elapsedMs = Number(endTime - startTime) / 1000000;
    
    results.push({
      name: config.name,
      elapsedMs,
      success: true
    });
    
    console.log(`✅ Completed in ${elapsedMs.toFixed(2)}ms`);
  } catch (error) {
    results.push({
      name: config.name,
      elapsedMs: null,
      success: false,
      error: error.message
    });
    
    console.log('❌ Failed');
    console.log(`Error: ${error.message}`);
  }
}

// Display benchmark summary
console.log('\n\n📊 Benchmark Results');
console.log('===================\n');

console.log('| Build Configuration | Time (ms) | Status |');
console.log('|---------------------|-----------|--------|');

for (const result of results) {
  const time = result.success ? result.elapsedMs.toFixed(2) : 'N/A';
  const status = result.success ? '✅ Success' : '❌ Failed';
  
  console.log(`| ${result.name.padEnd(20)} | ${time.padEnd(9)} | ${status} |`);
}

// Save benchmark results to file
const timestamp = new Date().toISOString().replace(/:/g, '-');
const resultJson = JSON.stringify(results, null, 2);

try {
  fs.writeFileSync(`build-benchmark-${timestamp}.json`, resultJson);
  console.log(`\nBenchmark data saved to build-benchmark-${timestamp}.json`);
} catch (error) {
  console.log('\nFailed to save benchmark data:', error.message);
}

console.log('\n🏁 Benchmark completed!');
console.log('\nRecommendations:');
console.log('- For fastest builds: Use Standard Build or Bypass TypeScript');
console.log('- For best error detection: Use Advanced Error Analysis');
console.log('- For balance of speed and safety: Use TypeScript Fixes');
