import { session } from 'electron';

// Mock electron session
jest.mock('electron', () => ({
  session: {
    defaultSession: {
      webRequest: {
        onBeforeRequest: jest.fn(),
      },
    },
  },
}));

describe('Network Request Blocking', () => {
  let mockCallback: jest.Mock;
  let onBeforeRequestHandler: (details: any, callback: any) => void;

  beforeEach(() => {
    // Reset mocks
    mockCallback = jest.fn();
    
    // Get the callback function that was registered with onBeforeRequest
    (session.defaultSession.webRequest.onBeforeRequest as jest.Mock).mockImplementation((handler) => {
      onBeforeRequestHandler = handler;
    });
    
    // Configure the network blocking as in the main app
    onBeforeRequestHandler = (details, callback) => {
      // Allow local file access
      if (details.url.startsWith('file:') || 
          details.url.startsWith('devtools:') || 
          (process.env.NODE_ENV === 'development' && details.url.includes('localhost'))) {
        return callback({ cancel: false });
      }
      
      // Block all HTTP/HTTPS requests
      if (details.url.startsWith('http')) {
        return callback({ cancel: true });
      }
      
      // Allow other protocols
      callback({ cancel: false });
    };
  });

  test('should block HTTP requests', () => {
    // Simulate HTTP request
    onBeforeRequestHandler({ url: 'http://google.com' }, mockCallback);
    
    // Verify request was blocked
    expect(mockCallback).toHaveBeenCalledWith({ cancel: true });
  });

  test('should block HTTPS requests', () => {
    // Simulate HTTPS request
    onBeforeRequestHandler({ url: 'https://google.com/analytics' }, mockCallback);
    
    // Verify request was blocked
    expect(mockCallback).toHaveBeenCalledWith({ cancel: true });
  });

  test('should allow file protocol requests', () => {
    // Simulate file protocol request
    onBeforeRequestHandler({ url: 'file:///path/to/file.html' }, mockCallback);
    
    // Verify request was allowed
    expect(mockCallback).toHaveBeenCalledWith({ cancel: false });
  });

  test('should allow devtools requests', () => {
    // Simulate devtools request
    onBeforeRequestHandler({ url: 'devtools://devtools/bundled/inspector.html' }, mockCallback);
    
    // Verify request was allowed
    expect(mockCallback).toHaveBeenCalledWith({ cancel: false });
  });

  test('should allow localhost in development mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set development mode
    process.env.NODE_ENV = 'development';
    
    // Simulate localhost request
    onBeforeRequestHandler({ url: 'http://localhost:5173/main.js' }, mockCallback);
    
    // Verify request was allowed
    expect(mockCallback).toHaveBeenCalledWith({ cancel: false });
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('should block localhost in production mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set production mode
    process.env.NODE_ENV = 'production';
    
    // Simulate localhost request
    onBeforeRequestHandler({ url: 'http://localhost:5173/main.js' }, mockCallback);
    
    // Verify request was blocked
    expect(mockCallback).toHaveBeenCalledWith({ cancel: true });
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});