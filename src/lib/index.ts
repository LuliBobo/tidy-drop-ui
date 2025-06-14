/**
 * Main lib index file
 * Re-exports all consolidated modules
 */

// Re-export consolidated modules
export * from './utils';

// Re-export license context directly (since contexts/index.ts is empty)
export { LicenseContext, LicenseContextType, LicenseLevel } from './license-context';
