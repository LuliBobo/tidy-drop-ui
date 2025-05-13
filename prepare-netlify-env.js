// ES Module version of prepare-netlify-env.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env file for Netlify build if it doesn't exist
try {
  const envPath = path.join(__dirname, '.env');
  
  // Set environment variables
  const envContent = `# Environment variables for Netlify web build
VITE_IS_WEB_BUILD=true
VITE_APP_API_KEY=${process.env.VITE_APP_API_KEY || ''}
VITE_APP_AUTH_DOMAIN=${process.env.VITE_APP_AUTH_DOMAIN || ''}
VITE_APP_PROJECT_ID=${process.env.VITE_APP_PROJECT_ID || ''}
VITE_APP_STORAGE_BUCKET=${process.env.VITE_APP_STORAGE_BUCKET || ''}
VITE_APP_MESSAGING_SENDER_ID=${process.env.VITE_APP_MESSAGING_SENDER_ID || ''} 
VITE_APP_APP_ID=${process.env.VITE_APP_APP_ID || ''}

# This file was automatically generated during the Netlify build process
# Any changes to this file will be overwritten on the next build
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Successfully created .env file for Netlify build');
  console.log('Environment variables set:');
  console.log('- VITE_IS_WEB_BUILD=true');
  console.log('- Firebase configuration variables');
} catch (error) {
  console.error('❌ Error creating .env file:', error);
  process.exit(1);
}
