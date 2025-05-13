/**
 * Web Environment Test Script
 * 
 * This script tests the web environment functionality of DropTidy
 * without requiring an actual Electron environment. It simulates
 * the web environment by setting VITE_IS_WEB_BUILD=true.
 */

import { isElectron, isWeb, safeIpcInvoke } from '../src/lib/environment';
import { expect, test, describe, beforeAll, afterAll } from 'vitest';

// Force web environment for these tests
beforeAll(() => {
  // Set environment variable for tests
  process.env.VITE_IS_WEB_BUILD = 'true';
  
  // Also attempt to set in globalThis
  if (globalThis.import && globalThis.import.meta) {
    globalThis.import.meta.env = globalThis.import.meta.env || {};
    globalThis.import.meta.env.VITE_IS_WEB_BUILD = 'true';
  }
});

afterAll(() => {
  // Clean up
  delete process.env.VITE_IS_WEB_BUILD;
});

describe('Web Environment Detection', () => {
  test('isElectron() should return false when VITE_IS_WEB_BUILD is true', () => {
    expect(isElectron()).toBe(false);
  });
  
  test('isWeb() should return true when VITE_IS_WEB_BUILD is true', () => {
    expect(isWeb()).toBe(true);
  });
});

describe('Safe IPC Invocation', () => {
  test('safeIpcInvoke should use web fallback when in web environment', async () => {
    // Create a mock fallback function
    const mockFallback = async () => 'web fallback result';
    
    // Invoke safeIpcInvoke with the mock fallback
    const result = await safeIpcInvoke('test-channel', [], mockFallback);
    
    // Expect the fallback function to be called
    expect(result).toBe('web fallback result');
  });
});

describe('ElectronFallbacks', () => {
  test('ElectronFallbacks openFolder should not throw in web environment', async () => {
    // Import the ElectronFallbacks module
    const { openFolder } = await import('../src/components/ElectronFallbacks');
    
    // Call openFolder - it should not throw an error
    await expect(openFolder('/test/path')).resolves.not.toThrow();
  });
  
  test('ElectronFallbacks getPath should return web fallback paths', async () => {
    // Import the ElectronFallbacks module
    const { getPath } = await import('../src/components/ElectronFallbacks');
    
    // Get some paths and check they return web fallbacks
    expect(getPath('home')).toBe('/home');
    expect(getPath('downloads')).toBe('/downloads');
  });
});
