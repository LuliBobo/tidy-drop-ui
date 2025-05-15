#!/usr/bin/env node

/**
 * TypeScript File Validator
 * 
 * This tool validates specified TypeScript files for errors and provides
 * focused error reports. It's useful for checking specific files or 
 * components during development without running a full build.
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

// Parse command line arguments
const args = process.argv.slice(2);
const files = args.filter(arg => !arg.startsWith('--'));
const isVerbose = args.includes('--verbose');
const isQuiet = args.includes('--quiet');
const noFix = args.includes('--no-fix');
const help = args.includes('--help') || args.includes('-h');

// Print help
if (help || (!files.length && !args.includes('--latest'))) {
  console.log(`
${colors.bold}TypeScript File Validator${colors.reset}

Validates specific TypeScript files for errors and provides focused error reports.

${colors.bold}Usage:${colors.reset}
  node validate-typescript-file.js <file1> <file2> [options]
  node validate-typescript-file.js --latest [options]

${colors.bold}Options:${colors.reset}
  --verbose      Show detailed output
  --quiet        Show only errors, not success messages
  --no-fix       Don't suggest fixes for errors
  --latest       Validate files changed in the most recent commit
  --help, -h     Show this help message

${colors.bold}Examples:${colors.reset}
  node validate-typescript-file.js src/components/Button.tsx
  node validate-typescript-file.js src/components/*.tsx --verbose
  node validate-typescript-file.js --latest
  `);
  process.exit(0);
}

console.log(`${colors.bold}${colors.blue}TypeScript File Validator${colors.reset}`);
console.log(`${colors.blue}========================${colors.reset}\n`);

// Check for --latest flag to validate files from the last commit
if (args.includes('--latest')) {
  try {
    const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    const changedFiles = gitOutput
      .split('\n')
      .filter(file => file.match(/\.(ts|tsx)$/))
      .map(file => file.trim());
    
    if (changedFiles.length === 0) {
      console.log(`${colors.yellow}[WARNING]${colors.reset} No TypeScript files changed in the latest commit.`);
      process.exit(0);
    }
    
    files.push(...changedFiles);
    console.log(`${colors.blue}[INFO]${colors.reset} Validating ${files.length} files from the latest commit.`);
  } catch (error) {
    console.log(`${colors.red}[ERROR]${colors.reset} Failed to get latest changed files: ${error.message}`);
    process.exit(1);
  }
}

// Expand any glob patterns in file arguments
let expandedFiles = [];
for (const filePattern of files) {
  if (filePattern.includes('*')) {
    try {
      const globOutput = execSync(`find ${path.dirname(filePattern)} -name "${path.basename(filePattern)}"`, { encoding: 'utf8' });
      const matches = globOutput.split('\n').filter(Boolean);
      expandedFiles.push(...matches);
    } catch (error) {
      console.log(`${colors.red}[ERROR]${colors.reset} Failed to expand glob pattern ${filePattern}: ${error.message}`);
    }
  } else {
    expandedFiles.push(filePattern);
  }
}

// Filter to only .ts and .tsx files that exist
expandedFiles = expandedFiles
  .filter(file => file.match(/\.(ts|tsx)$/))
  .filter(file => fs.existsSync(file));

if (expandedFiles.length === 0) {
  console.log(`${colors.red}[ERROR]${colors.reset} No valid TypeScript files found to validate.`);
  process.exit(1);
}

// Create a temporary tsconfig for validating just these files
const tempDir = path.join(__dirname, '.ts-validate-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const tempTsConfigPath = path.join(tempDir, 'tsconfig.json');
const baseConfig = require(path.join(__dirname, 'tsconfig.web.json'));

// Create a new tsconfig that includes only the specified files
const tempConfig = {
  ...baseConfig,
  include: expandedFiles,
  exclude: []
};

fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempConfig, null, 2));

if (isVerbose) {
  console.log(`${colors.blue}[INFO]${colors.reset} Created temporary tsconfig at ${tempTsConfigPath}`);
  console.log(`${colors.blue}[INFO]${colors.reset} Validating the following files:`);
  expandedFiles.forEach(file => console.log(`  - ${file}`));
}

// Run tsc on the specified files
try {
  console.log(`${colors.blue}[INFO]${colors.reset} Running TypeScript validation on ${expandedFiles.length} files...`);
  const tscOutput = execSync(`npx tsc -p ${tempTsConfigPath} --noEmit`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  if (!isQuiet) {
    console.log(`${colors.green}[SUCCESS]${colors.reset} All files validated successfully!\n`);
  }
  
  // Clean up
  fs.rmSync(tempDir, { recursive: true });
  process.exit(0);
} catch (error) {
  const errorOutput = error.stdout.toString();
  console.log(`${colors.red}[ERROR]${colors.reset} TypeScript validation found errors:\n`);
  
  // Parse error output
  const fileErrorPattern = /(.+\.tsx?):(\d+):(\d+) - error TS(\d+): (.*)/g;
  let match;
  const errors = [];
  
  while ((match = fileErrorPattern.exec(errorOutput)) !== null) {
    const [_, filePath, line, column, code, message] = match;
    errors.push({
      file: filePath,
      line: parseInt(line),
      column: parseInt(column),
      code: code,
      message: message
    });
  }
  
  // Group errors by file
  const fileErrors = errors.reduce((acc, error) => {
    const file = path.relative(process.cwd(), error.file);
    if (!acc[file]) {
      acc[file] = [];
    }
    acc[file].push(error);
    return acc;
  }, {});
  
  // Display errors by file
  Object.entries(fileErrors).forEach(([file, errors]) => {
    console.log(`${colors.bold}${colors.yellow}${file}${colors.reset} (${errors.length} errors)`);
    console.log(`${colors.yellow}${'-'.repeat(file.length + errors.length.toString().length + 10)}${colors.reset}`);
    
    errors.forEach(error => {
      console.log(`${colors.bold}Line ${error.line}:${error.column}${colors.reset} - TS${error.code}: ${error.message}`);
      
      // Show context if verbose
      if (isVerbose) {
        try {
          const fileContent = fs.readFileSync(error.file, 'utf8');
          const lines = fileContent.split('\n');
          const lineIndex = error.line - 1;
          const startLine = Math.max(0, lineIndex - 2);
          const endLine = Math.min(lines.length - 1, lineIndex + 2);
          
          console.log(`\n${colors.blue}Context:${colors.reset}`);
          for (let i = startLine; i <= endLine; i++) {
            const lineNum = i + 1;
            if (lineNum === error.line) {
              console.log(`${colors.red}${lineNum.toString().padStart(4)} | ${lines[i]}${colors.reset}`);
              // Print marker for column position
              console.log(`${' '.repeat(4)} | ${' '.repeat(error.column - 1)}${colors.red}^${colors.reset}`);
            } else {
              console.log(`${lineNum.toString().padStart(4)} | ${lines[i]}`);
            }
          }
          console.log('');
        } catch (e) {
          // Ignore errors reading the file
        }
      }
      
      // Suggest fixes if not disabled
      if (!noFix) {
        switch (error.code) {
          case '2307': // Cannot find module
            console.log(`${colors.cyan}Possible fix:${colors.reset} Check import path or install the missing package`);
            break;
          case '2322': // Type mismatch
            console.log(`${colors.cyan}Possible fix:${colors.reset} Convert types or use explicit type casting`);
            break;
          case '2339': // Property does not exist
            console.log(`${colors.cyan}Possible fix:${colors.reset} Check for typos or add the property to the interface`);
            break;
          case '2345': // Argument type mismatch
            console.log(`${colors.cyan}Possible fix:${colors.reset} Ensure argument types match the function signature`);
            break;
          case '2741': // Missing required property
            console.log(`${colors.cyan}Possible fix:${colors.reset} Add the required property to the object literal`);
            break;
        }
      }
      
      console.log('');
    });
  });
  
  // Clean up
  fs.rmSync(tempDir, { recursive: true });
  process.exit(1);
}
