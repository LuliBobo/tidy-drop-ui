# Drop Tidy Web Build Guide

This guide provides instructions for building and deploying the web version of Drop Tidy.

## Web Build Methods

We now have two approaches for building the web version:

### 1. Automated Web Build Preparation (Original)

```bash
npm run build:web
```

This approach:
- Uses `prepare-web-build.js` to modify Electron-specific code
- Uses `use-web-files.js` to replace some files with web-compatible versions
- Can lead to TypeScript syntax errors in some cases

### 2. Manual Web Build Preparation (Recommended)

```bash
npm run build:web:manual
```

This approach:
- Uses pre-built web-compatible versions of problematic files from the `fixed-files` directory
- Provides complete replacements for problematic components
- Is more reliable and less prone to syntax errors

## Manual Web Build Process

The manual web build process involves the following steps:

1. Run the standard web preparation script (handles environment variables)
2. Replace problematic files with web-compatible versions from `fixed-files/`
3. Build the app with the TypeScript compiler
4. Build the app with Vite

### Key Files

- `manual-web-fix.js`: Replaces files with web-compatible versions
- `fixed-files/`: Contains web-compatible versions of problematic files
- `restore-web-backups.js`: Restores original files from backups

## Workflow for Development

### Web Development

1. Make changes to files in the `src/` directory
2. Test Electron version with `npm run electron:dev`
3. For web testing, use `npm run dev:web`
4. Build for web deployment with `npm run build:web:manual`
5. Check your build in `dist/renderer/`

### Updating Web-Compatible Files

When you need to update the web-compatible versions:

1. Make changes to the original files in `src/`
2. Create or update corresponding web versions in `fixed-files/`
3. Test with `npm run build:web:manual`
4. Restore originals with `npm run restore:web:backups`

## Netlify Deployment

The Netlify deployment process uses the manual web build method:

1. Sets up the environment variables
2. Replaces files with web-compatible versions
3. Builds the app
4. Deploys to Netlify

The `netlify.toml` configuration file is already set up to use this process.

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors during the web build:

1. Check if the error is in a file that needs a web-compatible version
2. Create a web-compatible version in `fixed-files/`
3. Add the file to `manual-web-fix.js`
4. Try the build again

### Missing Backup Files

If original files aren't being restored:

1. Check if backup files exist with `.electron-backup` extension
2. If not, rerun `npm run fix:web:manual` to create backups
3. Then run `npm run restore:web:backups`

## Contributing

When contributing new features:

1. Make sure they work in both Electron and web environments
2. For Electron-specific features, provide web-friendly fallbacks
3. Update web-compatible versions in `fixed-files/` if needed
