#!/bin/bash
# test-cleaner.sh - Shell script to test metadata cleaning functionality

echo "DropTidy Metadata Removal Test"
echo "============================="

# Define paths
TEST_DIR="/Users/Boris/Documents/GitHub/tidy-drop-ui/test-images"
OUTPUT_DIR="/Users/Boris/Documents/GitHub/tidy-drop-ui/test-output"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Test 1: Check existing metadata
echo -e "\n🔍 TEST 1: Reading Original Metadata"
echo "Reading metadata from test image"
exiftool -json "$TEST_DIR/test-image.jpg" > "$OUTPUT_DIR/original-image-metadata.json"
echo "Original metadata saved to $OUTPUT_DIR/original-image-metadata.json"

# Test 2: Clean image and verify metadata removal
echo -e "\n🧹 TEST 2: Cleaning Image Metadata"
cp "$TEST_DIR/test-image.jpg" "$OUTPUT_DIR/test-image-copy.jpg"
echo "Copied test image to $OUTPUT_DIR/test-image-copy.jpg"
echo "Cleaning metadata..."
exiftool -all= -overwrite_original "$OUTPUT_DIR/test-image-copy.jpg"

# Verify image was cleaned
echo "Verifying metadata removal..."
exiftool -json "$OUTPUT_DIR/test-image-copy.jpg" > "$OUTPUT_DIR/cleaned-image-metadata.json"
echo "Cleaned metadata saved to $OUTPUT_DIR/cleaned-image-metadata.json"
echo "Comparing metadata counts:"
ORIG_COUNT=$(grep -c ":" "$OUTPUT_DIR/original-image-metadata.json")
CLEANED_COUNT=$(grep -c ":" "$OUTPUT_DIR/cleaned-image-metadata.json")
echo "Original metadata entries: $ORIG_COUNT"
echo "Cleaned metadata entries: $CLEANED_COUNT"
echo "Reduction: $(($ORIG_COUNT - $CLEANED_COUNT)) entries"

# Test 3: Clean video and verify metadata removal
echo -e "\n🎬 TEST 3: Cleaning Video Metadata"
echo "Reading metadata from test video"
exiftool -json "$TEST_DIR/test-video.mp4" > "$OUTPUT_DIR/original-video-metadata.json"
echo "Original metadata saved to $OUTPUT_DIR/original-video-metadata.json"

echo "Cleaning video metadata..."
ffmpeg -i "$TEST_DIR/test-video.mp4" -map_metadata -1 -c:v copy -c:a copy "$OUTPUT_DIR/cleaned-test-video.mp4" -y > /dev/null 2>&1

# Verify video was cleaned
echo "Verifying video metadata removal..."
exiftool -json "$OUTPUT_DIR/cleaned-test-video.mp4" > "$OUTPUT_DIR/cleaned-video-metadata.json"
echo "Cleaned metadata saved to $OUTPUT_DIR/cleaned-video-metadata.json"
echo "Comparing metadata counts:"
ORIG_VIDEO_COUNT=$(grep -c ":" "$OUTPUT_DIR/original-video-metadata.json")
CLEANED_VIDEO_COUNT=$(grep -c ":" "$OUTPUT_DIR/cleaned-video-metadata.json")
echo "Original video metadata entries: $ORIG_VIDEO_COUNT"
echo "Cleaned video metadata entries: $CLEANED_VIDEO_COUNT"
echo "Reduction: $(($ORIG_VIDEO_COUNT - $CLEANED_VIDEO_COUNT)) entries"

# Test 4: Create a ZIP file
echo -e "\n📦 TEST 4: Creating ZIP Export"
echo "Creating ZIP archive with cleaned files..."
cd "$OUTPUT_DIR" && zip cleaned-files.zip test-image-copy.jpg cleaned-test-video.mp4 > /dev/null 2>&1
echo "ZIP created at: $OUTPUT_DIR/cleaned-files.zip"

echo -e "\n✅ All tests completed!"
echo "Check the $OUTPUT_DIR directory for test results and cleaned files."
