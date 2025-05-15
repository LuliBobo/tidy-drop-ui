# DropTidy Web Build Quick Guide

This guide provides simple instructions for building and deploying DropTidy to the web using our unified approach.

## Common Web Build Commands

### Development

| Task | Command | Description |
|------|---------|-------------|
| Test web build locally | `npm run dev:web` | Start web version in development mode |
| Test build process | `npm run test:unified` | Run tests for the unified build process |

### Building

| Task | Command | Description |
|------|---------|-------------|
| Standard web build | `npm run build:web:unified` | Build web version using unified approach |
| Build with TypeScript fixes | `npm run build:web:unified:fix` | Build web version with automatic TS fixes |
| Build bypassing TypeScript | `npm run build:web:unified:bypass` | Build web version skipping TypeScript checking |

### Deployment

| Task | Command | Description |
|------|---------|-------------|
| Preview deployment | `npm run netlify:preview` | Build and deploy to Netlify preview URL |
| Production deployment | `npm run netlify:deploy` | Build and deploy to Netlify production |

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors during build:

1. Try building with automatic fixes: `npm run build:web:unified:fix`
2. Check error logs in the web-build-unified-*.log file
3. If errors are Electron-specific, use bypass mode: `npm run build:web:unified:bypass`
4. Update fixed files in the `fixed-files/` directory for persistent issues

### File Recovery

If build process corrupts files:

1. Restore from backups: `npm run restore:netlify:backups`
2. Verify files are restored to their original state

## Best Practices

1. Always test web builds locally before deploying
2. Add web-compatible versions of new Electron-dependent files
3. Follow cross-platform coding guidelines in `ELECTRON-WEB-COMPATIBILITY.md`
4. Update the unified build script when adding major new features

## Further Information

For more details, see the comprehensive documentation:

- `UNIFIED-WEB-BUILD.md` - Detailed unified build documentation
- `ELECTRON-WEB-COMPATIBILITY.md` - Cross-platform coding guidelines
- `DEFINITIVE-NETLIFY-GUIDE.md` - Netlify deployment guide
