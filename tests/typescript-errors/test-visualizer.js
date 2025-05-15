
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple HTML report
const html = `
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
`;

// Write the HTML report to the test directory
fs.writeFileSync(path.join('/Users/Boris/Documents/GitHub/tidy-drop-ui/tests/typescript-errors', 'typescript-errors-report.html'), html);
console.log('Visualization report generated successfully');
