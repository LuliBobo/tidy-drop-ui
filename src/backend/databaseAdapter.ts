// Universal database adapter for cross-platform support
import { app } from 'electron';
import fs from 'fs-extra';
import * as path from 'path';
import { electronLog } from './logger.js';
// import { PostgresAdapter } from './postgresAdapter'; // Excluded from Electron build
import { User, AuditLogEntry, ExportData, ImportResult, ExportResult } from './types.js';

// Enum for platform mode
export enum PlatformMode {
  ELECTRON = 'electron',
  WEB = 'web'
}

/**
 * DatabaseAdapter - cross-platform adapter for user persistence
 * Handles both Electron (file-based storage) and Web (PostgreSQL) versions
 */
export class DatabaseAdapter {
  private mode: PlatformMode;
  private postgresAdapter: any | null = null; // Dynamic type for cross-platform compatibility
  private isInitialized = false;
  
  // Paths for Electron mode
  private userDbPath: string = '';
  private backupDirPath: string = '';
  private auditLogPath: string = '';
  
  // Current user cache
  private currentUser: User | null = null;
  
  constructor(mode: PlatformMode = PlatformMode.ELECTRON) {
    this.mode = mode;
    
    if (this.mode === PlatformMode.ELECTRON) {
      // Set up file paths for Electron mode
      if (app) {
        const appDataDir = path.join(app.getPath('userData'), 'DropTidy');
        this.userDbPath = path.join(appDataDir, 'users.json');
        this.backupDirPath = path.join(appDataDir, 'backups');
        this.auditLogPath = path.join(appDataDir, 'audit_log.json');
      } else {
        electronLog.error('Failed to initialize DatabaseAdapter: app is not available');
      }
    }
  }
  
  /**
   * Initialize the adapter based on platform mode
   */
  async initialize(postgresConfig?: Record<string, unknown>): Promise<boolean> {
    try {
      if (this.mode === PlatformMode.WEB) {
        // In Electron builds, web mode is not supported
        electronLog.warn('Web mode not supported in Electron build, falling back to Electron mode');
        this.mode = PlatformMode.ELECTRON;
      }
      
      // Electron mode
      this.ensureDirectories();
      this.isInitialized = true;
      return true;
    } catch (error) {
      electronLog.error('Error initializing DatabaseAdapter:', error);
      return false;
    }
  }
  
  /**
   * Ensure all required directories exist (Electron mode)
   */
  private ensureDirectories(): void {
    if (this.mode === PlatformMode.ELECTRON) {
      const dirPaths = [
        path.dirname(this.userDbPath),
        this.backupDirPath,
        path.dirname(this.auditLogPath)
      ];
      
      for (const dirPath of dirPaths) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    }
  }
  
  /**
   * Load users from storage
   */
  async loadUsers(): Promise<User[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.getAllUsers();
      } else {
        // Electron file-based mode
        if (fs.existsSync(this.userDbPath)) {
          const data = fs.readFileSync(this.userDbPath, 'utf8');
          return JSON.parse(data);
        }
        return [];
      }
    } catch (error) {
      electronLog.error('Error loading users:', error);
      return [];
    }
  }
  
  /**
   * Save users to storage
   */
  async saveUsers(users: User[]): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        // Delete all and re-add for consistency
        for (const user of users) {
          if (!(await this.postgresAdapter.updateUser(user.username, user))) {
            await this.postgresAdapter.addUser(user);
          }
        }
        return true;
      } else {
        // Electron file-based mode
        fs.writeFileSync(this.userDbPath, JSON.stringify(users, null, 2));
        return true;
      }
    } catch (error) {
      electronLog.error('Error saving users:', error);
      return false;
    }
  }

  /**
   * Find user by username
   */
  async findUser(username: string): Promise<User | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.findUser(username);
      } else {
        // Electron file-based mode
        const users = await this.loadUsers();
        return users.find(user => user.username === username) || null;
      }
    } catch (error) {
      electronLog.error('Error finding user:', error);
      return null;
    }
  }
  
  /**
   * Add user to storage
   */
  async addUser(user: User): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.addUser(user);
      } else {
        // Electron file-based mode
        const users = await this.loadUsers();
        users.push(user);
        return await this.saveUsers(users);
      }
    } catch (error) {
      electronLog.error('Error adding user:', error);
      return false;
    }
  }
  
  /**
   * Update existing user
   */
  async updateUser(username: string, updates: Partial<User>): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.updateUser(username, updates);
      } else {
        // Electron file-based mode
        const users = await this.loadUsers();
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
          return false;
        }
        
        users[userIndex] = { ...users[userIndex], ...updates };
        
        // If the updated user is the current user, update the cache
        if (this.currentUser && this.currentUser.username === username) {
          this.currentUser = { ...this.currentUser, ...updates };
        }
        
        return await this.saveUsers(users);
      }
    } catch (error) {
      electronLog.error('Error updating user:', error);
      return false;
    }
  }
  
  /**
   * Delete a user
   */
  async deleteUser(username: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.deleteUser(username);
      } else {
        // Electron file-based mode
        const users = await this.loadUsers();
        const filteredUsers = users.filter(user => user.username !== username);
        
        if (users.length === filteredUsers.length) {
          // User was not found
          return false;
        }
        
        // If the deleted user is the current user, clear the cache
        if (this.currentUser && this.currentUser.username === username) {
          this.currentUser = null;
        }
        
        return await this.saveUsers(filteredUsers);
      }
    } catch (error) {
      electronLog.error('Error deleting user:', error);
      return false;
    }
  }
  
  /**
   * Set current user
   */
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }
  
  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  /**
   * Create a backup of user data
   */
  async createBackup(operationType: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        return await this.postgresAdapter.createBackup(operationType);
      } else {
        // Electron file-based mode
        if (!fs.existsSync(this.userDbPath)) {
          electronLog.warn('Cannot create backup: User database file does not exist');
          return false;
        }
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDirPath)) {
          fs.mkdirSync(this.backupDirPath, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `users-backup-${operationType}-${timestamp}.json`;
        const backupPath = path.join(this.backupDirPath, backupFileName);
        
        // Make a copy
        fs.copyFileSync(this.userDbPath, backupPath);
        
        // Limit the number of backups (keep only 10 newest)
        const backupFiles = fs.readdirSync(this.backupDirPath)
          .filter(file => file.startsWith(`users-backup-${operationType}`))
          .map(file => ({
            name: file,
            path: path.join(this.backupDirPath, file),
            time: fs.statSync(path.join(this.backupDirPath, file)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time); // Sort newest first
        
        // Clean up old backups
        if (backupFiles.length > 10) {
          for (let i = 10; i < backupFiles.length; i++) {
            fs.unlinkSync(backupFiles[i].path);
          }
        }
        
        // Add audit log entry for the backup
        this.addAuditLogEntry('backup_created', 'system', {
          operationType,
          backupPath
        });
        
        return true;
      }
    } catch (error) {
      electronLog.error('Error creating backup:', error);
      return false;
    }
  }
  
  /**
   * Add entry to audit log
   */
  async addAuditLogEntry(
    action: string,
    username: string,
    details?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        const performedBy = this.currentUser ? this.currentUser.username : null;
        return await this.postgresAdapter.addAuditLog(action, username, performedBy, details);
      } else {
        // Electron file-based mode
        // Ensure directory exists
        const dirPath = path.dirname(this.auditLogPath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Load existing log entries
        let auditLog: AuditLogEntry[] = [];
        if (fs.existsSync(this.auditLogPath)) {
          try {
            const data = fs.readFileSync(this.auditLogPath, 'utf8');
            auditLog = JSON.parse(data);
          } catch (e) {
            electronLog.error('Error parsing audit log, creating new one:', e);
          }
        }
        
        // Add new entry
        const newEntry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          action,
          username,
          performedBy: this.currentUser ? this.currentUser.username : null,
          details
        };
        auditLog.push(newEntry);
        
        // Save updated log
        fs.writeFileSync(this.auditLogPath, JSON.stringify(auditLog, null, 2));
        return true;
      }
    } catch (error) {
      electronLog.error('Error adding audit log entry:', error);
      return false;
    }
  }
  
  /**
   * Export user data
   */
  async exportUserData(exportPath?: string): Promise<ExportResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      // Create backup before export
      await this.createBackup('export');
      
      const users = await this.loadUsers();
      
      // Create export object with metadata
      const exportData: ExportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          recordCount: users.length,
          platform: this.mode
        },
        users
      };
      
      if (this.mode === PlatformMode.WEB) {
        // For web version, return data directly
        return {
          success: true,
          data: exportData
        };
      } else if (exportPath) {
        // For Electron, save to file if path provided
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        
        // Add audit log entry
        await this.addAuditLogEntry('export_users', 'all', { exportPath });
        
        return {
          success: true,
          message: `Exported ${users.length} user records to ${exportPath}`
        };
      } else {
        // Just return the data if no path specified
        return {
          success: true,
          data: exportData
        };
      }
    } catch (error) {
      electronLog.error('Error exporting user data:', error);
      return {
        success: false,
        message: `Failed to export user data: ${error}`
      };
    }
  }
  
  /**
   * Import user data
   */
  async importUserData(
    data: ExportData | string,
    mode: 'replace' | 'merge' = 'merge'
  ): Promise<ImportResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('DatabaseAdapter not initialized');
      }
      
      // Create backup before import
      await this.createBackup('import');
      
      let importData: {users: User[], metadata?: any};
      
      // Handle string input (file path)
      if (typeof data === 'string') {
        if (this.mode !== PlatformMode.ELECTRON) {
          throw new Error('File path import only supported in Electron mode');
        }
        
        if (!fs.existsSync(data)) {
          return {
            success: false,
            message: 'Import file does not exist'
          };
        }
        
        const fileContent = fs.readFileSync(data, 'utf8');
        importData = JSON.parse(fileContent);
      } else {
        importData = data;
      }
      
      // Validate import data
      if (!importData.users || !Array.isArray(importData.users)) {
        return {
          success: false,
          message: 'Invalid import file format'
        };
      }
      
      // Validate user data structure
      for (const user of importData.users) {
        if (!user.username || !user.password || !user.role) {
          return {
            success: false,
            message: 'Invalid user data in import file'
          };
        }
        
        if (user.role !== 'admin' && user.role !== 'user') {
          return {
            success: false,
            message: `Invalid role for user ${user.username}`
          };
        }
      }
      
      let importedCount = 0;
      let updatedCount = 0;
      
      if (this.mode === PlatformMode.WEB && this.postgresAdapter) {
        const result = await this.postgresAdapter.importUsers(importData, mode);
        importedCount = result.importedCount;
        updatedCount = result.updatedCount;
      } else {
        // Electron file-based mode
        let resultUsers: User[];
        
        if (mode === 'replace') {
          // Complete replacement
          resultUsers = [...importData.users];
          importedCount = resultUsers.length;
        } else {
          // Merge with existing data
          const currentUsers = await this.loadUsers();
          resultUsers = [...currentUsers];
          
          for (const importedUser of importData.users) {
            const existingUserIndex = resultUsers.findIndex(
              u => u.username === importedUser.username
            );
            
            if (existingUserIndex >= 0) {
              // Update existing user
              resultUsers[existingUserIndex] = importedUser;
              updatedCount++;
            } else {
              // Add new user
              resultUsers.push(importedUser);
              importedCount++;
            }
          }
        }
        
        // Save the updated users
        await this.saveUsers(resultUsers);
      }
      
      // Add audit log entry
      await this.addAuditLogEntry('import_users', 'all', {
        importSource: typeof data === 'string' ? data : 'direct_data',
        mode,
        importedCount,
        updatedCount
      });
      
      return {
        success: true,
        message: `Import successful. ${importedCount} users added, ${updatedCount} users updated.`,
        importedCount,
        updatedCount
      };
    } catch (error) {
      electronLog.error('Error importing user data:', error);
      return {
        success: false,
        message: `Failed to import user data: ${error}`
      };
    }
  }
}
