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
   - Use exiftool to verify metadata removal: `exiftool downloaded-file.jpg`

3. **Upload Test Video**
   - Drag and drop test-video.mp4 into the application
   - Verify that the file is displayed in the UI
   - Click the "Clean" button
   - Verify that the cleaning process completes successfully
   - Download the cleaned file
   - Use exiftool to verify metadata removal: `exiftool downloaded-file.mp4`

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
