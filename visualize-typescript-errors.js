#!/usr/bin/env node

/**
 * TypeScript Error Visualization Tool for DropTidy
 * 
 * This script visualizes TypeScript errors to make them easier to understand and fix.
 * It generates an HTML report with interactive visualizations.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}DropTidy TypeScript Error Visualization${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Get TypeScript errors
console.log(`${colors.blue}[INFO]${colors.reset} Running TypeScript validation...`);

let tsOutput;
try {
  tsOutput = execSync('npx tsc -p tsconfig.web.json --noEmit', { 
    stdio: 'pipe',
    encoding: 'utf-8' 
  });
  console.log(`${colors.green}[SUCCESS]${colors.reset} No TypeScript errors found!`);
  process.exit(0);
} catch (error) {
  tsOutput = error.stdout || error.message;
  console.log(`${colors.yellow}[INFO]${colors.reset} Found TypeScript errors to analyze.`);
}

// Process command line arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--test') || process.env.FORCE_TEST_MODE === 'true';
const isSampleMode = args.includes('--sample');
const isCIMode = args.includes('--ci');

// Parse directory arguments, ensuring quotes are removed if present
const parseDir = (arg) => {
  if (!arg) return undefined;
  let dir = arg.split('=')[1];
  // Remove quotes if they exist
  if (dir && (dir.startsWith('"') || dir.startsWith("'"))) {
    dir = dir.substring(1, dir.length - 1);
  }
  return dir;
};

const testDir = parseDir(args.find(arg => arg.startsWith('--testDir=')));
const sampleDir = parseDir(args.find(arg => arg.startsWith('--sampleDir=')));
const reportDir = parseDir(args.find(arg => arg.startsWith('--reportDir=')));

// Parse TypeScript errors
console.log(`${colors.blue}[INFO]${colors.reset} Analyzing error patterns...`);

// If in test mode, use the test directory's error log
if ((isTestMode && testDir) || (isSampleMode && sampleDir) || (isCIMode && reportDir)) {
  try {
    let targetDir;
    let mode;

    if (isTestMode && testDir) {
      targetDir = testDir;
      mode = 'TEST';
    } else if (isSampleMode && sampleDir) {
      targetDir = sampleDir;
      mode = 'SAMPLE';
    } else if (isCIMode && reportDir) {
      targetDir = reportDir;
      mode = 'CI';
    }

    console.log(`${colors.blue}[${mode} MODE]${colors.reset} Using directory: ${targetDir}`);
    const errorLogPath = path.join(targetDir, 'typescript-errors.log');
    
    if (fs.existsSync(errorLogPath)) {
      tsOutput = fs.readFileSync(errorLogPath, 'utf-8');
      console.log(`${colors.green}[SUCCESS]${colors.reset} Loaded error log from ${errorLogPath}`);
    } else {
      console.log(`${colors.red}[ERROR]${colors.reset} Error log not found at ${errorLogPath}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`${colors.red}[ERROR]${colors.reset} Failed to load error log: ${error.message}`);
    process.exit(1);
  }
}

// Extract errors from TypeScript output
const errorLines = tsOutput.split('\n');
const fileErrorPattern = /(.+\.tsx?):(\d+):(\d+) - error TS(\d+): (.*)/;
const errors = [];

for (let i = 0; i < errorLines.length; i++) {
  const line = errorLines[i];
  const match = fileErrorPattern.exec(line);
  
  if (match) {
    const [_, filePath, lineNum, colNum, errorCode, errorMessage] = match;
    errors.push({
      file: filePath,
      line: parseInt(lineNum),
      column: parseInt(colNum),
      code: errorCode,
      message: errorMessage
    });
  }
}

// Error stats
const totalErrors = errors.length;
const uniqueFiles = new Set(errors.map(e => e.file)).size;
const errorTypes = {};
const fileErrorCounts = {};

errors.forEach(error => {
  // Count errors by type
  if (!errorTypes[error.code]) {
    errorTypes[error.code] = 1;
  } else {
    errorTypes[error.code]++;
  }
  
  // Count errors by file
  const fileName = path.basename(error.file);
  if (!fileErrorCounts[fileName]) {
    fileErrorCounts[fileName] = 1;
  } else {
    fileErrorCounts[fileName]++;
  }
});

// Top error types
const topErrorTypes = Object.entries(errorTypes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// Top files with errors
const topErrorFiles = Object.entries(fileErrorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// Display summary in console
console.log(`\n${colors.bold}${colors.magenta}Error Summary${colors.reset}`);
console.log(`${colors.magenta}=============${colors.reset}`);
console.log(`${colors.bold}Total Errors:${colors.reset} ${totalErrors}`);
console.log(`${colors.bold}Affected Files:${colors.reset} ${uniqueFiles}`);

console.log(`\n${colors.bold}Top Error Types:${colors.reset}`);
topErrorTypes.forEach(([code, count]) => {
  console.log(`  TS${code}: ${count} occurrences`);
});

console.log(`\n${colors.bold}Most Problematic Files:${colors.reset}`);
topErrorFiles.forEach(([file, count]) => {
  console.log(`  ${file}: ${count} errors`);
});

// Generate HTML report
console.log(`\n${colors.blue}[INFO]${colors.reset} Generating HTML visualization...`);

// Determine report file name based on mode
let reportFileName;
if (isTestMode && testDir) {
  reportFileName = path.join(testDir, 'typescript-errors-report.html');
} else if (isSampleMode && sampleDir) {
  reportFileName = path.join(sampleDir, 'typescript-errors-report.html');
} else if (isCIMode && reportDir) {
  reportFileName = path.join(reportDir, 'typescript-errors-report.html');
} else {
  reportFileName = `typescript-errors-${new Date().toISOString().replace(/[:\.]/g, '-')}.html`;
}

// Define common TypeScript error codes and possible solutions
const errorGuide = {
  '2322': 'Type assignment error - Types are incompatible, consider type conversion or using type assertions',
  '2339': 'Property does not exist - Check if you\'re using incorrect property names or accessing properties on the wrong type',
  '2307': 'Cannot find module - The module may not be installed or path is incorrect',
  '2304': 'Cannot find name - The variable or type might be undefined or need to be imported',
  '2345': 'Argument type mismatch - The argument type doesn\'t match what\'s expected by the function',
  '2741': 'Property is missing - You need to provide all required properties of an interface',
  '2531': 'Object is possibly null - Add null checks or use optional chaining',
  '2532': 'Object is possibly undefined - Add undefined checks or use optional chaining',
  '2554': 'Expected arguments - Wrong number of arguments passed to function',
  '2556': 'Expected return type - Function doesn\'t return the expected type',
  '2578': 'Unused type parameter - Remove unused generic type parameter',
  '2769': 'No overload matches - None of the function overloads match the arguments',
  '2571': 'Object might not have index signature - Use a Map or Record<K,V> instead'
};

// Create the HTML report
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DropTidy TypeScript Error Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-box {
      flex: 1;
      min-width: 300px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .blue { background-color: #e3f2fd; }
    .orange { background-color: #fff3e0; }
    .chart-container {
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 20px;
      border-radius: 8px;
    }
    .error-list {
      border-collapse: collapse;
      width: 100%;
      margin-top: 20px;
    }
    .error-list th, .error-list td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    .error-list th {
      background-color: #f2f2f2;
      position: sticky;
      top: 0;
    }
    .error-list tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .error-list tr:hover {
      background-color: #f1f1f1;
    }
    .code {
      font-family: Consolas, Monaco, 'Andale Mono', monospace;
      background-color: #f5f5f5;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .solution {
      background-color: #e8f5e9;
      padding: 10px;
      border-radius: 5px;
      margin-top: 5px;
    }
    .filter-controls {
      margin-bottom: 20px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .search {
      padding: 8px;
      width: 300px;
      margin-right: 10px;
    }
    select {
      padding: 8px;
    }
    .button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>DropTidy TypeScript Error Analysis</h1>
  <p>Report generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary-container">
    <div class="summary-box blue">
      <h2>Error Summary</h2>
      <p><strong>Total Errors:</strong> ${totalErrors}</p>
      <p><strong>Affected Files:</strong> ${uniqueFiles}</p>
    </div>
    <div class="summary-box orange">
      <h2>Quick Suggestions</h2>
      <ul>
        <li>Run with <code>npm run build:web:unified:fix</code> to apply automatic fixes</li>
        <li>Use <code>npm run build:web:unified:advanced</code> for detailed error analysis</li>
        <li>Check fixed-files directory for web-compatible versions</li>
      </ul>
    </div>
  </div>
  
  <div class="chart-container">
    <h2>Error Distribution</h2>
    <div style="display: flex; gap: 20px;">
      <div style="flex: 1;">
        <canvas id="errorTypesChart" width="400" height="300"></canvas>
      </div>
      <div style="flex: 1;">
        <canvas id="fileErrorsChart" width="400" height="300"></canvas>
      </div>
    </div>
  </div>
  
  <h2>Error Details</h2>
  
  <div class="filter-controls">
    <input type="text" id="searchInput" class="search" placeholder="Search errors...">
    <select id="errorTypeFilter">
      <option value="">All Error Types</option>
      ${Object.keys(errorTypes).map(code => `<option value="TS${code}">TS${code}</option>`).join('')}
    </select>
    <select id="fileFilter">
      <option value="">All Files</option>
      ${Object.keys(fileErrorCounts).map(file => `<option value="${file}">${file}</option>`).join('')}
    </select>
    <button class="button" onclick="resetFilters()">Reset Filters</button>
  </div>
  
  <table class="error-list" id="errorTable">
    <thead>
      <tr>
        <th>File</th>
        <th>Line:Col</th>
        <th>Error Code</th>
        <th>Message</th>
        <th>Possible Solution</th>
      </tr>
    </thead>
    <tbody>
      ${errors.map(error => {
        const fileName = path.basename(error.file);
        const solution = errorGuide[error.code] || 'Check the TypeScript documentation for this error code';
        return `
          <tr data-file="${fileName}" data-code="TS${error.code}">
            <td>${fileName}</td>
            <td>${error.line}:${error.column}</td>
            <td class="code">TS${error.code}</td>
            <td>${error.message}</td>
            <td>
              <div class="solution">${solution}</div>
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <script>
    // Initialize charts
    document.addEventListener('DOMContentLoaded', function() {
      // Error types chart
      const errorTypesCtx = document.getElementById('errorTypesChart').getContext('2d');
      new Chart(errorTypesCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(topErrorTypes.map(([code]) => `TS${code}`))},
          datasets: [{
            label: 'Number of Errors',
            data: ${JSON.stringify(topErrorTypes.map(([_, count]) => count))},
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Top Error Types'
            },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Files with errors chart
      const fileErrorsCtx = document.getElementById('fileErrorsChart').getContext('2d');
      new Chart(fileErrorsCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(topErrorFiles.map(([file]) => file))},
          datasets: [{
            label: 'Number of Errors',
            data: ${JSON.stringify(topErrorFiles.map(([_, count]) => count))},
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Most Problematic Files'
            },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Set up search and filtering
      document.getElementById('searchInput').addEventListener('input', filterTable);
      document.getElementById('errorTypeFilter').addEventListener('change', filterTable);
      document.getElementById('fileFilter').addEventListener('change', filterTable);
    });
    
    function filterTable() {
      const searchInput = document.getElementById('searchInput').value.toLowerCase();
      const errorTypeFilter = document.getElementById('errorTypeFilter').value;
      const fileFilter = document.getElementById('fileFilter').value;
      
      const rows = document.querySelectorAll('#errorTable tbody tr');
      
      rows.forEach(row => {
        const file = row.getAttribute('data-file');
        const code = row.getAttribute('data-code');
        const text = row.textContent.toLowerCase();
        
        const matchesSearch = searchInput === '' || text.includes(searchInput);
        const matchesErrorType = errorTypeFilter === '' || code === errorTypeFilter;
        const matchesFile = fileFilter === '' || file === fileFilter;
        
        if (matchesSearch && matchesErrorType && matchesFile) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
    
    function resetFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('errorTypeFilter').value = '';
      document.getElementById('fileFilter').value = '';
      filterTable();
    }
  </script>
</body>
</html>
`;

// Write the HTML report
fs.writeFileSync(reportFileName, htmlContent);

console.log(`\n${colors.green}[SUCCESS]${colors.reset} Report generated: ${reportFileName}`);
console.log(`\nOpen this file in your browser to view the interactive error analysis.`);
console.log(`You can do this by running: open ${reportFileName}`);

// Provide suggestions based on error analysis
console.log(`\n${colors.bold}${colors.magenta}Suggested Actions${colors.reset}`);
console.log(`${colors.magenta}=================${colors.reset}`);

if (topErrorTypes.some(([code]) => code === '2322')) {
  console.log(`• Run ${colors.cyan}npm run build:web:unified:fix${colors.reset} to apply automatic type conversion fixes`);
}

if (topErrorTypes.some(([code]) => code === '2339')) {
  console.log(`• Check for ${colors.cyan}Electron API${colors.reset} usage that needs web alternatives`);
}

if (topErrorFiles.length > 0) {
  console.log(`• Focus on fixing ${colors.cyan}${topErrorFiles[0][0]}${colors.reset} first (${topErrorFiles[0][1]} errors)`);
}

console.log(`• For detailed error analysis, run: ${colors.cyan}npm run build:web:unified:advanced${colors.reset}`);
console.log(`• To visualize with the full details, open ${colors.cyan}${reportFileName}${colors.reset} in your browser\n`);