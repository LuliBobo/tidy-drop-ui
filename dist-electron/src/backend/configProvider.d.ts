import { PlatformMode } from './databaseAdapter.js';
/**
 * Configuration provider class for the application
 * Handles different configurations for both Electron and Web platforms
 */
export declare class ConfigProvider {
    /**
     * Get database configuration based on platform mode
     * @param platformMode The platform mode (Electron or Web)
     * @returns Configuration object for the database adapter
     */
    static getDatabaseConfig(platformMode?: PlatformMode): any;
    /**
     * Detect platform mode from environment variables
     * @returns Detected platform mode
     */
    static detectPlatformMode(): PlatformMode;
}
