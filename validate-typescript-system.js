#!/usr/bin/env node

/**
 * Validate TypeScript Error Analysis System
 * 
 * This script runs all TypeScript error analysis components to validate
 * that the complete system is working correctly.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
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

console.log(`${colors.bold}${colors.cyan}DropTidy TypeScript Error Analysis System Validation${colors.reset}`);
console.log(`${colors.cyan}==================================================${colors.reset}\n`);

// Run each component and track success
const components = [
  {
    name: "TypeScript Error Analysis Test Suite",
    command: "node test-typescript-analysis.js",
    description: "Testing the error analysis capabilities with test cases"
  },
  {
    name: "Sample Error Report Generation",
    command: "node generate-error-samples.js",
    description: "Generating sample error reports for documentation"
  },
  {
    name: "CI Integration Test",
    command: "node ci-typescript-analysis.js --mode=test --no-fail",
    description: "Testing the CI integration capabilities"
  }
];

const results = [];

for (const component of components) {
  console.log(`\n${colors.bold}${colors.blue}Running: ${component.name}${colors.reset}`);
  console.log(`${colors.blue}${"-".repeat(component.name.length + 9)}${colors.reset}`);
  console.log(`${component.description}\n`);
  
  try {
    execSync(component.command, { stdio: 'inherit' });
    console.log(`\n${colors.green}[SUCCESS]${colors.reset} ${component.name} completed successfully`);
    results.push({ name: component.name, success: true });
  } catch (error) {
    console.log(`\n${colors.red}[FAILED]${colors.reset} ${component.name} encountered errors`);
    results.push({ name: component.name, success: false, error: error.message });
  }
}

// Summary report
console.log(`\n${colors.bold}${colors.blue}Validation Summary${colors.reset}`);
console.log(`${colors.blue}=================${colors.reset}`);

let allSuccessful = true;
for (const result of results) {
  if (result.success) {
    console.log(`${colors.green}✓${colors.reset} ${result.name}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${result.name}`);
    allSuccessful = false;
  }
}

if (allSuccessful) {
  console.log(`\n${colors.bold}${colors.green}All components validated successfully!${colors.reset}`);
  console.log(`\nYour TypeScript error analysis system is ready for production use.`);
} else {
  console.log(`\n${colors.bold}${colors.yellow}Some components failed validation.${colors.reset}`);
  console.log(`\nPlease check the error messages above and fix any issues before deploying.`);
}

// Write validation report
const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
const reportFile = `typescript-validation-${timestamp}.json`;

const report = {
  timestamp: new Date().toISOString(),
  success: allSuccessful,
  components: results
};

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
console.log(`\n${colors.blue}[INFO]${colors.reset} Validation report saved to ${reportFile}`);
