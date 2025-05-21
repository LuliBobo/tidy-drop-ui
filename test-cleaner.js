// test-cleaner.js
// Simple script to test the metadata cleaning functionality

import { readMetadata, cleanImage, cleanVideo, createZipExport } from './src/backend/cleaner.js';
import path from 'path';
import fs from 'fs-extra';

const TEST_DIR = path.join(process.cwd(), 'test-images');
const OUTPUT_DIR = path.join(process.cwd(), 'test-output');

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

async function runTests() {
  console.log('Starting DropTidy Metadata Removal Tests');
  console.log('=======================================');
  
  // Test 1: Read metadata from an image
  console.log('\n🔍 TEST 1: Reading Image Metadata');
  const imagePath = path.join(TEST_DIR, 'test-image.jpg');
  console.log(`Reading metadata from: ${imagePath}`);
  const imageMetadata = await readMetadata(imagePath);
  console.log('Metadata found:');
  console.log(JSON.stringify(imageMetadata, null, 2).substring(0, 500) + '...');
  
  // Test 2: Clean image and verify metadata removal
  console.log('\n🧹 TEST 2: Cleaning Image Metadata');
  // Copy the image to avoid modifying the original test file
  const imageTestCopy = path.join(OUTPUT_DIR, 'test-image-copy.jpg');
  fs.copyFileSync(imagePath, imageTestCopy);
  console.log(`Cleaning metadata from: ${imageTestCopy}`);
  const imageCleanResult = await cleanImage(imageTestCopy);
  console.log('Clean result:', imageCleanResult);
  
  // Verify the image was cleaned
  console.log('Verifying metadata removal...');
  const cleanedImageMetadata = await readMetadata(imageTestCopy);
  console.log('Remaining metadata:');
  console.log(JSON.stringify(cleanedImageMetadata, null, 2));
  
  // Test 3: Test video cleaning
  console.log('\n🎬 TEST 3: Cleaning Video Metadata');
  const videoPath = path.join(TEST_DIR, 'test-video.mp4');
  const cleanedVideoPath = path.join(OUTPUT_DIR, 'cleaned-test-video.mp4');
  console.log(`Original video: ${videoPath}`);
  console.log(`Target cleaned video: ${cleanedVideoPath}`);
  
  // Read original video metadata
  const videoMetadata = await readMetadata(videoPath);
  console.log('Original video metadata:');
  console.log(JSON.stringify(videoMetadata, null, 2).substring(0, 500) + '...');
  
  // Clean the video
  console.log('Cleaning video metadata...');
  const videoCleanResult = await cleanVideo(videoPath, cleanedVideoPath);
  console.log('Clean result:', videoCleanResult);
  
  // Verify the video was cleaned
  console.log('Verifying video metadata removal...');
  const cleanedVideoMetadata = await readMetadata(cleanedVideoPath);
  console.log('Remaining metadata:');
  console.log(JSON.stringify(cleanedVideoMetadata, null, 2));
  
  // Test 4: Create a ZIP export
  console.log('\n📦 TEST 4: Creating ZIP Export');
  const filesToExport = [imageTestCopy, cleanedVideoPath];
  console.log(`Creating ZIP with files: ${filesToExport.join(', ')}`);
  const zipPath = await createZipExport(filesToExport);
  console.log(`ZIP created at: ${zipPath}`);
  
  console.log('\n✅ All tests completed!');
}

// Create test output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
