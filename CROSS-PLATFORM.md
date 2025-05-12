# DropTidy Cross-Platform Application

DropTidy is a privacy-focused application that runs as both an Electron desktop app and a web application hosted on Netlify.

## Features

- Remove metadata from images and videos
- Face blurring capabilities
- Watermark management
- Local processing for maximum privacy
- Cross-platform support (Desktop and Web)

## Architecture

DropTidy is built with a cross-platform architecture:

- **Electron App**: Full-featured desktop application with direct file system access
- **Web App**: Browser-based version with equivalent functionality
- **Shared Components**: React components that work in both environments
- **Environment Detection**: Utilities to detect and adapt to the current environment

## Development

### Prerequisites

- Node.js (v18+)
- npm or Yarn or Bun

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/tidy-drop-ui.git

# Install dependencies
cd tidy-drop-ui
npm install

# Start development server
npm run dev

# Start Electron development environment
npm run electron:dev
```

### Environment Detection

The application uses the `environment.ts` utility to detect whether it's running in Electron or a web browser and adapt accordingly.

Example usage:

```typescript
import { isElectron, safeIpcInvoke } from '@/lib/environment';

// Check environment
if (isElectron()) {
  console.log('Running in Electron');
}

// Safe IPC access with web fallback
const result = await safeIpcInvoke('channel-name', [...args], webFallback);
```

### Netlify Functions

The web version uses Netlify serverless functions to handle operations that require backend processing:

- `feedback.js`: Processes feedback form submissions

To test the Netlify functions locally:

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Run the local development server with Netlify Functions
npm run netlify:dev

# Test a specific function
npm run test:functions
```

## Building for Production

### Electron App

```bash
npm run build:electron
```

### Web App (Netlify)

```bash
npm run build
```

The web version will be automatically deployed by Netlify when changes are pushed to the main branch.

## Environment Configuration

### Electron App

Environment variables for the Electron app are loaded from `.env` files during build.

### Web App (Netlify)

Environment variables for the Netlify functions are configured in the Netlify dashboard or in `netlify.toml` for development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please ensure your code works in both Electron and web environments before submitting.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
