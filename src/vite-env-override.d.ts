/// <reference types="vite/client" />

/**
 * Custom environment variables for Vite
 * This extends the ImportMetaEnv interface from Vite to include our custom environment variables
 */
interface ImportMetaEnv {
  /**
   * Flag indicating if the build is specifically for web deployment
   * Used to conditionally handle Electron-specific code during web builds
   * Set to 'true' during Netlify builds or when using npm run build:web
   */
  readonly VITE_IS_WEB_BUILD?: string;
  
  /**
   * Other environment variables can be added here
   */
  // readonly VITE_API_URL?: string;
}

/**
 * Extend the import.meta object with our env property
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
