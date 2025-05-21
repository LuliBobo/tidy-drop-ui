#!/bin/bash
# run-app-test.sh - Script to run the DropTidy application for manual testing

echo "Starting DropTidy Application for Manual Testing"
echo "==============================================="

# Navigate to the project directory
cd /Users/Boris/Documents/GitHub/tidy-drop-ui

# Check if the test files exist and remind the user
if [ -d "test-images" ] && [ "$(ls -A test-images)" ]; then
  echo "Test files are ready in test-images directory:"
  ls -la test-images
else
  echo "Warning: No test files found in test-images directory."
fi

# Create a test plan for manual testing
cat > manual-test-plan.md << EOF
# DropTidy Manual Testing Plan

## Test Files
The following test files are available in the test-images directory:
- test-image.jpg (JPEG with GPS metadata)
- test-image2.jpg (JPEG with camera information)
- test-video.mp4 (MP4 video with metadata)

## Manual Test Steps
1. **Start the application**
2. **Upload Test Image**
   - Drag and drop test-image.jpg into the application
   - Verify that the file is displayed in the UI
   - Check that metadata is properly extracted and displayed
   - Click the "Clean" button
   - Verify that the cleaning process completes successfully
   - Download the cleaned file
   - Use exiftool to verify metadata removal: \`exiftool downloaded-file.jpg\`

3. **Upload Test Video**
   - Drag and drop test-video.mp4 into the application
   - Verify that the file is displayed in the UI
   - Click the "Clean" button
   - Verify that the cleaning process completes successfully
   - Download the cleaned file
   - Use exiftool to verify metadata removal: \`exiftool downloaded-file.mp4\`

4. **Batch Processing**
   - Upload multiple files at once
   - Use the "Clean All" button
   - Verify that all files are processed correctly
   - Create a ZIP export
   - Extract and verify the cleaned files

5. **Error Handling**
   - Try uploading an unsupported file format
   - Verify that appropriate error messages are displayed
   - Try cleaning a file that's too large
   - Check how the application handles unexpected errors

## Notes
- Record any issues or unexpected behavior
- Note the effectiveness of metadata removal for each file type
- Check the application logs for any errors or warnings
EOF

echo "Created manual test plan: manual-test-plan.md"

# Check if npm and node are installed
if command -v npm >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    echo "Starting the application in development mode..."
    echo "To run the app: npm run electron:dev"
    echo "You can manually run this command in a new terminal, or press CTRL+C to exit"
    npm run electron:dev
else
    echo "Error: npm and/or node not found. Please install Node.js and npm."
    exit 1
fi
