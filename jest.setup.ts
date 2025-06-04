import '@testing-library/jest-dom';

// Mock global objects that might be needed in tests
global.window = Object.create(window);
global.document = document;

// Mock Electron APIs if needed
global.electronAPI = {
  cleanImage: jest.fn(),
  cleanVideo: jest.fn(),
  createZip: jest.fn(),
  readMetadata: jest.fn(),
  openFolder: jest.fn(),
  showItemInFolder: jest.fn(),
  loadSettings: jest.fn(),
  saveSettings: jest.fn(),
  selectDirectory: jest.fn(),
  sendFeedback: jest.fn(),
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  checkAuth: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserRole: jest.fn(),
  initiatePasswordReset: jest.fn(),
  completePasswordReset: jest.fn(),
  exportUserData: jest.fn(),
  importUserData: jest.fn(),
};

// Suppress console.warn and console.error during tests
// unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
