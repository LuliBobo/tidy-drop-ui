// configProvider.ts - Configuration provider for the application
import { app } from 'electron';
import * as path from 'path';
import { electronLog } from './logger';
import { PlatformMode } from './databaseAdapter';

/**
 * Configuration provider class for the application
 * Handles different configurations for both Electron and Web platforms
 */
export class ConfigProvider {
  /**
   * Get database configuration based on platform mode
   * @param platformMode The platform mode (Electron or Web)
   * @returns Configuration object for the database adapter
   */
  static getDatabaseConfig(platformMode: PlatformMode = PlatformMode.ELECTRON): any {
    try {
      if (platformMode === PlatformMode.WEB) {
        // Web platform uses PostgreSQL
        return {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'droptidy_db',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          ssl: process.env.DB_SSL === 'true'
        };
      } else {
        // Electron platform uses file-based storage
        const appDataDir = app ? path.join(app.getPath('userData'), 'DropTidy') : '';
        return {
          userDbPath: path.join(appDataDir, 'users.json'),
          backupDirPath: path.join(appDataDir, 'backups'),
          auditLogPath: path.join(appDataDir, 'audit_log.json')
        };
      }
    } catch (error) {
      electronLog.error('Error getting database config:', error);
      return {};
    }
  }

  /**
   * Detect platform mode from environment variables
   * @returns Detected platform mode
   */
  static detectPlatformMode(): PlatformMode {
    return process.env.PLATFORM_MODE === 'web' 
      ? PlatformMode.WEB 
      : PlatformMode.ELECTRON;
  }
}
