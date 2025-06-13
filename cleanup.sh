#!/bin/bash
# Cleanup extra files script - simplified deployment for DropTidy

# Go to project root
cd "$(dirname "$0")"

echo "Cleaning up unnecessary files for deployment..."

# Remove unnecessary files
rm -rf .github
rm -f CROSS-PLATFORM-GUIDE.md DEFINITIVE-NETLIFY-*.md DEVELOPMENT-WORKFLOW.md
rm -f ELECTRON-*.md ENHANCED-PRELOAD-*.md IMPLEMENTATION-SUMMARY*.md
rm -f MANUAL-WEB-FIX.md NETLIFY-DEPLOY.md PRELOAD-*.md
rm -f TESTING.md TROUBLESHOOTING-NETLIFY.md TS-ERROR-*.md
rm -f TYPESCRIPT-*.md UNIFIED-WEB-BUILD.md WEB-*.md
rm -f apply-web-fixes.js benchmark-unified-build.js build-web-bypass-ts.js
rm -f ci-typescript-analysis.js debug-*.js fix-*.js
rm -f generate-error-samples.js manual-web-fix.js netlify-typescript-handler.js
rm -f post-build-netlify.*js prepare-netlify-env.cjs
rm -f restore-*.js test-*.js unified-web-build.js
rm -f use-web-files.js validate-*.js visualize-typescript-errors.js
rm -rf tests test-output fixed-files

echo "Cleanup complete!"
