import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';
import mockFs from 'mock-fs';

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((key: string) => {
      if (key === 'userData') return '/mock/userData';
      if (key === 'home') return '/mock/home';
      return '/mock/path';
    }),
  },
}));

// The functions we need to test
const APP_DATA_DIR = path.join('/mock/userData', 'DropTidy');
const CONFIG_PATH = path.join(APP_DATA_DIR, 'config.json');

const DEFAULT_SETTINGS = {
  outputDir: path.join('/mock/home', 'Cleaned'),
  autoOpenFolder: false
};

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function loadSettings() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const settingsData = fs.readFileSync(CONFIG_PATH, 'utf8');
      const settings = JSON.parse(settingsData);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // If file doesn't exist or there's an error, create it with default settings
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

describe('Config File Creation', () => {
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

  test('should create config.json with default settings if it does not exist', () => {
    // First check config doesn't exist
    expect(fs.existsSync(CONFIG_PATH)).toBe(false);
    
    // Load settings should create the file
    const settings = loadSettings();
    
    // Verify file was created with default settings
    expect(fs.existsSync(CONFIG_PATH)).toBe(true);
    expect(settings).toEqual(DEFAULT_SETTINGS);
    
    // Read the actual file to verify contents
    const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsedSettings = JSON.parse(fileContent);
    expect(parsedSettings).toEqual(DEFAULT_SETTINGS);
  });

  test('should load existing settings and merge with defaults', () => {
    const customSettings = { outputDir: '/custom/path', newSetting: true };
    const expectedSettings = { ...DEFAULT_SETTINGS, ...customSettings };
    
    // Create config file with custom settings
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(customSettings), 'utf8');
    
    // Load settings
    const settings = loadSettings();
    
    // Verify loaded settings are merged with defaults
    expect(settings).toEqual(expectedSettings);
  });

  test('should handle malformed JSON in config file', () => {
    // Create config file with invalid JSON
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, 'not valid json', 'utf8');
    
    // Load settings should replace the corrupted file with defaults
    const settings = loadSettings();
    
    // Verify default settings are returned and file is fixed
    expect(settings).toEqual(DEFAULT_SETTINGS);
    const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsedSettings = JSON.parse(fileContent);
    expect(parsedSettings).toEqual(DEFAULT_SETTINGS);
  });
});