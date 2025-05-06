import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';
import mockFs from 'mock-fs';

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/userData'),
  },
}));

// Mock license functions similar to what would be in main.ts
const LICENSE_PATH = path.join('/mock/userData', 'DropTidy', 'license.json');
const APP_DATA_DIR = path.join('/mock/userData', 'DropTidy');

interface License {
  key: string;
  plan: 'free' | 'pro' | 'enterprise';
  expiresAt: string;
  features: string[];
  userId: string;
}

function saveLicense(license: License): boolean {
  try {
    fs.ensureDirSync(APP_DATA_DIR);
    fs.writeFileSync(LICENSE_PATH, JSON.stringify(license, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving license:', error);
    return false;
  }
}

function loadLicense(): License | null {
  try {
    if (fs.existsSync(LICENSE_PATH)) {
      const licenseData = fs.readFileSync(LICENSE_PATH, 'utf8');
      return JSON.parse(licenseData);
    }
  } catch (error) {
    console.error('Error loading license:', error);
  }
  return null;
}

describe('License Upgrade', () => {
  beforeEach(() => {
    // Setup mock filesystem
    mockFs({
      [APP_DATA_DIR]: {},
    });
  });

  afterEach(() => {
    // Restore real filesystem
    mockFs.restore();
  });

  test('should save license to disk', () => {
    // Create a mock license
    const mockLicense: License = {
      key: 'license-key-123',
      plan: 'pro',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      features: ['unlimited-files', 'batch-processing', 'priority-support'],
      userId: 'user-123',
    };
    
    // Save the license
    const result = saveLicense(mockLicense);
    
    // Verify license was saved successfully
    expect(result).toBe(true);
    expect(fs.existsSync(LICENSE_PATH)).toBe(true);
    
    // Verify license content
    const savedLicense = JSON.parse(fs.readFileSync(LICENSE_PATH, 'utf8'));
    expect(savedLicense).toEqual(mockLicense);
  });

  test('should read license from disk', () => {
    // Create a mock license and save it directly to the file system
    const mockLicense: License = {
      key: 'license-key-123',
      plan: 'enterprise',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['unlimited-files', 'batch-processing', 'priority-support', 'custom-branding'],
      userId: 'user-123',
    };
    
    fs.ensureDirSync(APP_DATA_DIR);
    fs.writeFileSync(LICENSE_PATH, JSON.stringify(mockLicense), 'utf8');
    
    // Load the license
    const loadedLicense = loadLicense();
    
    // Verify loaded license matches what was saved
    expect(loadedLicense).toEqual(mockLicense);
  });

  test('should return null when license file does not exist', () => {
    // Try to load license when file doesn't exist
    const loadedLicense = loadLicense();
    
    // Verify null is returned
    expect(loadedLicense).toBeNull();
  });

  test('should handle invalid JSON in license file', () => {
    // Create invalid license file
    fs.ensureDirSync(APP_DATA_DIR);
    fs.writeFileSync(LICENSE_PATH, 'not valid json', 'utf8');
    
    // Try to load license
    const loadedLicense = loadLicense();
    
    // Verify null is returned
    expect(loadedLicense).toBeNull();
  });

  test('should update existing license when saving new one', () => {
    // Create initial license
    const initialLicense: License = {
      key: 'old-key',
      plan: 'free',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: ['basic-cleaning'],
      userId: 'user-123',
    };
    
    fs.ensureDirSync(APP_DATA_DIR);
    fs.writeFileSync(LICENSE_PATH, JSON.stringify(initialLicense), 'utf8');
    
    // Create upgraded license
    const upgradedLicense: License = {
      key: 'new-pro-key',
      plan: 'pro',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['unlimited-files', 'batch-processing', 'priority-support'],
      userId: 'user-123',
    };
    
    // Save the upgraded license
    saveLicense(upgradedLicense);
    
    // Load and verify it was updated
    const loadedLicense = loadLicense();
    expect(loadedLicense).toEqual(upgradedLicense);
  });
});