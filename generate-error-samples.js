#!/usr/bin/env node

/**
 * Generate Sample TypeScript Error Reports
 * 
 * This script creates sample TypeScript error reports for documentation purposes.
 * It generates common error scenarios and produces visualizations and analysis reports
 * that can be included in documentation and guides.
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

console.log(`${colors.bold}${colors.magenta}DropTidy Sample Error Report Generator${colors.reset}`);
console.log(`${colors.magenta}=========================================${colors.reset}\n`);

// Create sample directory
const sampleDir = path.join(__dirname, 'docs', 'samples');
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
  console.log(`${colors.green}[INFO]${colors.reset} Created sample directory: ${sampleDir}`);
}

// Define sample error categories with examples
const errorCategories = [
  {
    name: "Import Errors",
    description: "Errors related to importing modules that are available in Node.js/Electron but not in the web browser.",
    examples: [
      {
        fileName: "electron-import.ts",
        content: `
import { ipcRenderer } from 'electron';

export function sendMessage(channel: string, message: any) {
  ipcRenderer.send(channel, message);
}

export function listenForResponse(channel: string, callback: (response: any) => void) {
  ipcRenderer.on(channel, (_, response) => callback(response));
}
        `.trim()
      },
      {
        fileName: "fs-module-import.ts",
        content: `
import * as fs from 'fs';
import * as path from 'path';

export function readConfigFile(configPath: string) {
  const fullPath = path.resolve(configPath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}
        `.trim()
      }
    ]
  },
  {
    name: "Type Mismatches",
    description: "Type compatibility issues that frequently occur in cross-platform environments.",
    examples: [
      {
        fileName: "platform-specific-props.tsx",
        content: `
interface Props {
  onFileSelect: (filePath: string) => void;
  allowedExtensions: string[];
  maxFileSize: number; // In bytes
  isElectron: boolean;
}

export function FilePicker(props: Props) {
  if (props.isElectron) {
    return <ElectronFilePicker 
      onSelect={props.onFileSelect}
      extensions={props.allowedExtensions}
      maxSize={props.maxFileSize}
    />;
  } else {
    // Web version doesn't have maxFileSize validation at selection time
    return <WebFilePicker 
      onSelect={props.onFileSelect}
      extensions={props.allowedExtensions}
    />;
  }
}
        `.trim()
      },
      {
        fileName: "boolean-string-conversion.ts",
        content: `
// Config might be a string in web but boolean in electron
interface ElectronConfig {
  enableFeature: boolean;
}

interface WebConfig {
  enableFeature: string; // "true" or "false" as string
}

function processConfig(config: ElectronConfig) {
  if (config.enableFeature) {
    // Do something
  }
}

const webConfig: WebConfig = {
  enableFeature: "true"
};

// Type error: string is not assignable to boolean
processConfig(webConfig);
        `.trim()
      }
    ]
  },
  {
    name: "Missing Interfaces",
    description: "Errors that occur when interfaces are incomplete for web or electron versions.",
    examples: [
      {
        fileName: "incomplete-interface.ts",
        content: `
interface UserData {
  id: string;
  name: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: string;
  notifications: boolean;
  saveHistory: boolean; // Only used in desktop version
  localStoragePath: string; // Only relevant in desktop version
}

function createUserPreferences(): UserPreferences {
  return {
    theme: "light",
    notifications: true,
    // Missing required properties for desktop
  };
}
        `.trim()
      }
    ]
  },
  {
    name: "Platform-specific APIs",
    description: "Errors when using APIs that are only available on specific platforms.",
    examples: [
      {
        fileName: "menu-creation.ts",
        content: `
import { Menu, MenuItem } from 'electron';

export function createApplicationMenu(appName: string) {
  const template = [
    {
      label: appName,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
        `.trim()
      },
      {
        fileName: "navigator-api.ts",
        content: `
// This will work in web but not in a standard Node.js environment
export function checkOnline(): boolean {
  return navigator.onLine;
}

export function getGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
}
        `.trim()
      }
    ]
  }
];

// Create sample files and error outputs for each category
console.log(`${colors.blue}[SAMPLES]${colors.reset} Generating sample error files...\n`);

errorCategories.forEach(category => {
  // Create category directory
  const categoryDir = path.join(sampleDir, category.name.toLowerCase().replace(/\s+/g, '-'));
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir);
  }

  console.log(`${colors.cyan}${category.name}${colors.reset}`);
  console.log(`${"=".repeat(category.name.length)}`);
  
  // Create README for the category
  const readmeContent = `# ${category.name}\n\n${category.description}\n\n## Examples\n\n`;
  fs.writeFileSync(path.join(categoryDir, 'README.md'), readmeContent);
  
  // Create example files
  category.examples.forEach(example => {
    const filePath = path.join(categoryDir, example.fileName);
    fs.writeFileSync(filePath, example.content);
    console.log(`${colors.green}[CREATED]${colors.reset} ${example.fileName}`);
    
    // Create tsconfig for this category
    const tsconfigPath = path.join(categoryDir, 'tsconfig.json');
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
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
      },
      "include": ["./*.ts", "./*.tsx"]
    };
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  });
});

// Generate error outputs and analysis for each category
console.log(`\n${colors.blue}[ANALYSIS]${colors.reset} Generating error analysis for samples...\n`);

errorCategories.forEach(category => {
  const categoryDir = path.join(sampleDir, category.name.toLowerCase().replace(/\s+/g, '-'));
  
  console.log(`${colors.cyan}Analyzing ${category.name}...${colors.reset}`);
  
  try {
    // Run TypeScript on the category files and capture errors
    try {
      execSync(`npx tsc -p ${categoryDir}/tsconfig.json --noEmit`, { stdio: 'pipe' });
    } catch (error) {
      // Save the error output
      const errorOutput = error.stdout.toString();
      // Fix any incorrect file paths in the error output (replace /Boris/ with /Users/Boris/)
      const fixedErrorOutput = errorOutput.replace(/\/Boris\//g, '/Users/Boris/');
      fs.writeFileSync(path.join(categoryDir, 'typescript-errors.log'), fixedErrorOutput);
    }
    
    // Run our analysis tools on the error output
    try {
      const absoluteCategoryDir = path.resolve(categoryDir);
      execSync(`node analyze-typescript-errors.js --sample --sampleDir="${absoluteCategoryDir}"`, { stdio: 'pipe' });
      console.log(`${colors.green}[SUCCESS]${colors.reset} Generated analysis for ${category.name}`);
    } catch (error) {
      console.log(`${colors.red}[ERROR]${colors.reset} Failed to analyze ${category.name}: ${error.message}`);
    }
    
    // Run visualization tool on the error output
    try {
      const absoluteCategoryDir = path.resolve(categoryDir);
      execSync(`node visualize-typescript-errors.js --sample --sampleDir="${absoluteCategoryDir}"`, { stdio: 'pipe' });
      console.log(`${colors.green}[SUCCESS]${colors.reset} Generated visualization for ${category.name}`);
    } catch (error) {
      console.log(`${colors.red}[ERROR]${colors.reset} Failed to visualize ${category.name}: ${error.message}`);
    }
    
    // Add analysis and visualization info to the README
    const readmePath = path.join(categoryDir, 'README.md');
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    
    readmeContent += `\n## Error Analysis\n\n`;
    readmeContent += `These examples demonstrate typical TypeScript errors encountered when building for web deployment.\n\n`;
    readmeContent += `- [View Error Log](./typescript-errors.log)\n`;
    readmeContent += `- [View Error Analysis](./typescript-analysis.json)\n`;
    readmeContent += `- [View Error Visualization](./typescript-errors-report.html)\n\n`;
    
    readmeContent += `## How to Fix\n\n`;
    readmeContent += `### General Approaches\n\n`;
    
    // Add category-specific fix recommendations
    switch(category.name) {
      case "Import Errors":
        readmeContent += "1. Create web-specific alternatives for Node.js/Electron modules\n";
        readmeContent += "2. Use dynamic imports with try/catch for platform detection\n";
        readmeContent += "3. Create abstraction layers for platform-specific functionality\n";
        break;
      case "Type Mismatches":
        readmeContent += "1. Define platform-agnostic interfaces that both implementations can satisfy\n";
        readmeContent += "2. Use type casting when necessary with appropriate runtime checks\n";
        readmeContent += "3. Create utility functions for type conversions between platforms\n";
        break;
      case "Missing Interfaces":
        readmeContent += "1. Make platform-specific properties optional in shared interfaces\n";
        readmeContent += "2. Create platform-specific interfaces that extend from a base interface\n";
        readmeContent += "3. Use conditional types to adjust interfaces based on platform\n";
        break;
      case "Platform-specific APIs":
        readmeContent += "1. Create facade services that provide unified APIs but different implementations\n";
        readmeContent += "2. Use dependency injection to supply platform-specific implementations\n";
        readmeContent += "3. Use feature detection instead of platform detection when possible\n";
        break;
    }
    
    fs.writeFileSync(readmePath, readmeContent);
  } catch (error) {
    console.log(`${colors.red}[ERROR]${colors.reset} Failed processing ${category.name}: ${error.message}`);
  }
});

// Generate main index for all samples
console.log(`\n${colors.blue}[DOCS]${colors.reset} Generating documentation index...\n`);

let indexContent = `# TypeScript Error Samples for DropTidy\n\n`;
indexContent += `This directory contains sample TypeScript errors and their analysis for documentation purposes.\n\n`;
indexContent += `## Error Categories\n\n`;

errorCategories.forEach(category => {
  const dirName = category.name.toLowerCase().replace(/\s+/g, '-');
  indexContent += `### [${category.name}](./${dirName}/)\n\n`;
  indexContent += `${category.description}\n\n`;
  indexContent += `Example files:\n\n`;
  
  category.examples.forEach(example => {
    indexContent += `- [${example.fileName}](./${dirName}/${example.fileName})\n`;
  });
  
  indexContent += `\n[View detailed analysis](./${dirName}/README.md)\n\n`;
});

indexContent += `## Using These Samples\n\n`;
indexContent += `These samples demonstrate common TypeScript errors encountered when adapting an Electron application for web deployment. `;
indexContent += `Each category includes:\n\n`;
indexContent += `- Example TypeScript files that produce errors\n`;
indexContent += `- Raw TypeScript error output\n`;
indexContent += `- Analysis of error patterns and suggestions\n`;
indexContent += `- Interactive HTML visualization of errors\n`;
indexContent += `- Recommendations for fixing each type of error\n\n`;
indexContent += `Use these examples to understand common error patterns and how to address them in your own code.\n`;

fs.writeFileSync(path.join(sampleDir, 'README.md'), indexContent);
console.log(`${colors.green}[CREATED]${colors.reset} Documentation index`);

console.log(`\n${colors.bold}${colors.green}Sample error reports generated successfully!${colors.reset}`);
console.log(`Files available in: ${colors.cyan}${sampleDir}${colors.reset}\n`);
