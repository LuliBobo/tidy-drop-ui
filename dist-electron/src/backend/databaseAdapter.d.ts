import { User, ExportData, ImportResult, ExportResult } from './types.js';
export declare enum PlatformMode {
    ELECTRON = "electron",
    WEB = "web"
}
/**
 * DatabaseAdapter - cross-platform adapter for user persistence
 * Handles both Electron (file-based storage) and Web (PostgreSQL) versions
 */
export declare class DatabaseAdapter {
    private mode;
    private postgresAdapter;
    private isInitialized;
    private userDbPath;
    private backupDirPath;
    private auditLogPath;
    private currentUser;
    constructor(mode?: PlatformMode);
    /**
     * Initialize the adapter based on platform mode
     */
    initialize(postgresConfig?: Record<string, unknown>): Promise<boolean>;
    /**
     * Ensure all required directories exist (Electron mode)
     */
    private ensureDirectories;
    /**
     * Load users from storage
     */
    loadUsers(): Promise<User[]>;
    /**
     * Save users to storage
     */
    saveUsers(users: User[]): Promise<boolean>;
    /**
     * Find user by username
     */
    findUser(username: string): Promise<User | null>;
    /**
     * Add user to storage
     */
    addUser(user: User): Promise<boolean>;
    /**
     * Update existing user
     */
    updateUser(username: string, updates: Partial<User>): Promise<boolean>;
    /**
     * Delete a user
     */
    deleteUser(username: string): Promise<boolean>;
    /**
     * Set current user
     */
    setCurrentUser(user: User | null): void;
    /**
     * Get current user
     */
    getCurrentUser(): User | null;
    /**
     * Create a backup of user data
     */
    createBackup(operationType: string): Promise<boolean>;
    /**
     * Add entry to audit log
     */
    addAuditLogEntry(action: string, username: string, details?: Record<string, unknown>): Promise<boolean>;
    /**
     * Export user data
     */
    exportUserData(exportPath?: string): Promise<ExportResult>;
    /**
     * Import user data
     */
    importUserData(data: ExportData | string, mode?: 'replace' | 'merge'): Promise<ImportResult>;
}
