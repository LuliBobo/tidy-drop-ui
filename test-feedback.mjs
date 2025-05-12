#!/usr/bin/env node

/**
 * Test script for the feedback serverless function
 * 
 * Usage:
 *   node test-feedback.mjs
 * 
 * This script simulates a request to the feedback serverless function
 * and logs the response. It's useful for local testing during development.
 */

import { handler } from './netlify/functions/feedback.js';

// Create a valid test request
const validRequestEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message for the feedback function.',
    category: 'other'
  })
};

// Create an invalid test request (missing email)
const invalidRequestEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    name: 'Test User',
    message: 'This message is missing an email address.'
  })
};

// Create a non-POST request
const wrongMethodEvent = {
  httpMethod: 'GET'
};

// Context object for the function
const context = {};

async function runTests() {
  console.log('Testing feedback serverless function...\n');

  // Test valid request
  console.log('Test Case 1: Valid request');
  try {
    const response = await handler(validRequestEvent, context);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.parse(response.body));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n---\n');

  // Test invalid request
  console.log('Test Case 2: Invalid request (missing email)');
  try {
    const response = await handler(invalidRequestEvent, context);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.parse(response.body));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n---\n');

  // Test wrong method
  console.log('Test Case 3: Wrong HTTP method (GET)');
  try {
    const response = await handler(wrongMethodEvent, context);
    console.log('Status Code:', response.statusCode);
    console.log('Response:', JSON.parse(response.body));
  } catch (error) {
    console.error('Error:', error);
  }
}

runTests().catch(console.error);
