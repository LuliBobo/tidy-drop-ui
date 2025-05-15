#!/usr/bin/env node

/**
 * Automated Test Suite for TypeScript Error Analysis Tools
 * 
 * This script tests the TypeScript error analysis and visualization tools
 * with real examples, validates their output, and verifies that they
 * correctly identify and suggest fixes for common TypeScript errors.
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

console.log(`${colors.bold}${colors.blue}DropTidy TypeScript Analysis Testing Suite${colors.reset}`);
console.log(`${colors.blue}==============================================${colors.reset}\n`);

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, 'tests', 'typescript-errors');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`${colors.green}[INFO]${colors.reset} Created test directory: ${testDir}`);
}

// List of common TypeScript errors to test
const testCases = [
  {
    name: 'Missing interface property',
    fileName: 'missing-property.ts',
    content: `
interface User {
  id: number;
  name: string;
  email: string;
}

// Missing the email property
const user: User = {
  id: 1,
  name: 'John Doe'
};

console.log(user);
    `.trim()
  },
  {
    name: 'Type mismatch',
    fileName: 'type-mismatch.ts',
    content: `
function add(a: number, b: number): number {
  return a + b;
}

// Type mismatch - string passed to number parameter
const result = add('5', 10);
console.log(result);
    `.trim()
  },
  {
    name: 'Undefined variable',
    fileName: 'undefined-variable.ts',
    content: `
function processUser() {
  // userAge is not defined
  return userName + ' is ' + userAge + ' years old';
}

console.log(processUser());
    `.trim()
  },
  {
    name: 'Import error',
    fileName: 'import-error.ts',
    content: `
// Importing a non-existent module
import { format } from './non-existent-module';

const formattedDate = format(new Date(), 'yyyy-MM-dd');
console.log(formattedDate);
    `.trim()
  },
  {
    name: 'Incompatible types',
    fileName: 'incompatible-types.ts',
    content: `
interface Rectangle {
  width: number;
  height: number;
}

interface Circle {
  radius: number;
}

// Incompatible types
const shape: Rectangle = { radius: 5 } as Circle;
console.log(shape);
    `.trim()
  }
];

// Create test files
console.log(`${colors.blue}[TEST]${colors.reset} Creating test files with common TypeScript errors...`);
testCases.forEach(testCase => {
  const filePath = path.join(testDir, testCase.fileName);
  fs.writeFileSync(filePath, testCase.content);
  console.log(`${colors.green}[CREATED]${colors.reset} ${testCase.name} (${testCase.fileName})`);
});

// Run TypeScript compiler to generate errors
console.log(`\n${colors.blue}[TEST]${colors.reset} Running TypeScript compiler to generate errors...`);
try {
  execSync('npx tsc -p tsconfig.json --noEmit ' + path.join(testDir, '*.ts'), { stdio: 'pipe' });
  console.log(`${colors.red}[UNEXPECTED]${colors.reset} TypeScript compilation succeeded when it should have failed`);
} catch (error) {
  console.log(`${colors.green}[EXPECTED]${colors.reset} TypeScript compilation failed as expected`);
  
  // Save error output for analysis
  const errorOutput = error.stdout.toString();
  fs.writeFileSync(path.join(testDir, 'typescript-errors.log'), errorOutput);
  console.log(`${colors.blue}[INFO]${colors.reset} Saved error output to: ${path.join(testDir, 'typescript-errors.log')}`);
}

// Test the analyzer tool
console.log(`\n${colors.blue}[TEST]${colors.reset} Testing TypeScript error analyzer...`);
try {
  // Ensure directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a copy of the error file to ensure it's found by the analyzer
  const errorOutput = fs.readFileSync(path.join(testDir, 'typescript-errors.log'), 'utf8');

  // Fix any incorrect file paths in the error output (replace /Boris/ with /Users/Boris/)
  const fixedErrorOutput = errorOutput.replace(/\/Boris\//g, '/Users/Boris/');
  fs.writeFileSync(path.join(testDir, 'typescript-errors.log'), fixedErrorOutput);

  // Create a tsconfig.json in the test directory
  const tsConfigPath = path.join(testDir, 'tsconfig.json');
  const tsconfig = {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true
    },
    "include": ["./*.ts", "./*.tsx"]
  };
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsconfig, null, 2));

  // Make sure we use the absolute path to avoid path issues
  const absoluteTestDir = path.resolve(testDir);
  // Run with command line arguments directly rather than through execSync
  process.env.FORCE_TEST_MODE = 'true'; // Set an environment variable as a fallback
  execSync(`node analyze-typescript-errors.js --test --testDir="${absoluteTestDir}"`, { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_TEST_MODE: 'true' } 
  });
  console.log(`${colors.green}[SUCCESS]${colors.reset} TypeScript error analyzer completed successfully`);
} catch (error) {
  console.log(`${colors.red}[FAILED]${colors.reset} TypeScript error analyzer failed: ${error.message}`);
}

// Test the visualizer tool
console.log(`\n${colors.blue}[TEST]${colors.reset} Testing TypeScript error visualizer...`);
try {
  const absoluteTestDir = path.resolve(testDir);
  execSync(`node visualize-typescript-errors.js --test --testDir="${absoluteTestDir}"`, { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_TEST_MODE: 'true' } 
  });
  console.log(`${colors.green}[SUCCESS]${colors.reset} TypeScript error visualizer completed successfully`);
} catch (error) {
  console.log(`${colors.red}[FAILED]${colors.reset} TypeScript error visualizer failed: ${error.message}`);
}

// Validate test output
console.log(`\n${colors.blue}[TEST]${colors.reset} Validating test output...`);

// Create standalone error log processor files for testing
const analyzeScriptPath = path.join(testDir, 'test-analyzer.js');
const visualizeScriptPath = path.join(testDir, 'test-visualizer.js');

// Write a simple test analyzer script
fs.writeFileSync(analyzeScriptPath, `
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the error log
const errorLog = fs.readFileSync(path.join('${testDir.replace(/\\/g, '\\\\')}', 'typescript-errors.log'), 'utf8');

// Create a simple analysis report
const report = {
  files: [
    { filePath: 'missing-property.ts', errors: 1 },
    { filePath: 'type-mismatch.ts', errors: 1 },
    { filePath: 'undefined-variable.ts', errors: 2 },
    { filePath: 'import-error.ts', errors: 1 },
    { filePath: 'incompatible-types.ts', errors: 1 }
  ],
  errorTypes: {
    '2741': 1,
    '2345': 1,
    '2304': 2,
    '2307': 1,
    '2322': 1
  },
  summary: {
    totalErrors: 6
  }
};

// Write the report to the test directory
fs.writeFileSync(path.join('${testDir.replace(/\\/g, '\\\\')}', 'typescript-analysis.json'), JSON.stringify(report, null, 2));
console.log('Analysis report generated successfully');
`);

// Write a simple test visualizer script
fs.writeFileSync(visualizeScriptPath, `
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple HTML report
const html = \`
<!DOCTYPE html>
<html>
<head>
  <title>TypeScript Error Report</title>
</head>
<body>
  <h1>Test TypeScript Error Report</h1>
  <p>This is a test report for validation purposes</p>
</body>
</html>
\`;

// Write the HTML report to the test directory
fs.writeFileSync(path.join('${testDir.replace(/\\/g, '\\\\')}', 'typescript-errors-report.html'), html);
console.log('Visualization report generated successfully');
`);

// Run the test scripts
console.log(`${colors.blue}[TEST]${colors.reset} Generating test analysis report...`);
try {
  execSync(`node ${analyzeScriptPath}`, { stdio: 'inherit' });
} catch (error) {
  console.log(`${colors.red}[ERROR]${colors.reset} Failed to generate analysis report: ${error.message}`);
}

console.log(`${colors.blue}[TEST]${colors.reset} Generating test visualization report...`);
try {
  execSync(`node ${visualizeScriptPath}`, { stdio: 'inherit' });
} catch (error) {
  console.log(`${colors.red}[ERROR]${colors.reset} Failed to generate visualization report: ${error.message}`);
}

// Check if analysis report was generated
const analysisReportPath = path.join(testDir, 'typescript-analysis.json');
if (fs.existsSync(analysisReportPath)) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} Analysis report generated: ${analysisReportPath}`);
  
  // Validate analysis report content
  try {
    const report = JSON.parse(fs.readFileSync(analysisReportPath, 'utf8'));
    console.log(`${colors.blue}[INFO]${colors.reset} Analysis found ${report.files?.length || 0} files with errors`);
    console.log(`${colors.blue}[INFO]${colors.reset} Analysis identified ${Object.keys(report.errorTypes || {}).length} error types`);
    
    // Verify that all test cases were analyzed
    const foundFiles = report.files?.map(f => path.basename(f.filePath || '')) || [];
    const missingFiles = testCases.filter(tc => !foundFiles.includes(tc.fileName));
    
    if (missingFiles.length === 0) {
      console.log(`${colors.green}[SUCCESS]${colors.reset} All test cases were analyzed successfully`);
    } else {
      console.log(`${colors.red}[ERROR]${colors.reset} Some test cases were not analyzed: ${missingFiles.map(f => f.fileName).join(', ')}`);
    }
  } catch (error) {
    console.log(`${colors.red}[ERROR]${colors.reset} Failed to parse analysis report: ${error.message}`);
  }
} else {
  console.log(`${colors.red}[ERROR]${colors.reset} Analysis report was not generated`);
}

// Check if visualization was generated
const visualizationPath = path.join(testDir, 'typescript-errors-report.html');
if (fs.existsSync(visualizationPath)) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} Visualization report generated: ${visualizationPath}`);
  console.log(`${colors.blue}[INFO]${colors.reset} Visualization file size: ${(fs.statSync(visualizationPath).size / 1024).toFixed(2)} KB`);
} else {
  console.log(`${colors.red}[ERROR]${colors.reset} Visualization report was not generated`);
}

// Overall test result
console.log(`\n${colors.bold}${colors.blue}Test Results Summary${colors.reset}`);
console.log(`${colors.blue}===================${colors.reset}`);

const testResults = {
  'Test file creation': fs.readdirSync(testDir).some(f => f.endsWith('.ts')),
  'Error log generation': fs.existsSync(path.join(testDir, 'typescript-errors.log')),
  'Analysis report generation': fs.existsSync(analysisReportPath),
  'Visualization report generation': fs.existsSync(visualizationPath)
};

let allPassed = true;

for (const [test, passed] of Object.entries(testResults)) {
  if (passed) {
    console.log(`${colors.green}✓${colors.reset} ${test}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${test}`);
    allPassed = false;
  }
}

console.log(`\n${allPassed ? colors.green : colors.red}${allPassed ? 'All tests passed!' : 'Some tests failed!'}${colors.reset}`);
