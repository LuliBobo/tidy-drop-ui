export interface User {
    username: string;
    password: string;
    role: 'admin' | 'user';
    failedLoginAttempts?: number;
    lockedUntil?: number;
    status?: 'active' | 'inactive';
    lastLogin?: string;
    createdAt?: string;
}
export interface AuditLogEntry {
    timestamp: string;
    action: string;
    username: string;
    performedBy: string | null;
    details?: Record<string, unknown>;
}
export interface ExportData {
    metadata: {
        exportDate: string;
        version: string;
        recordCount: number;
        platform?: string;
        [key: string]: unknown;
    };
    users: User[];
}
export interface ImportResult {
    success: boolean;
    message?: string;
    importedCount?: number;
    updatedCount?: number;
}
export interface ExportResult {
    success: boolean;
    data?: ExportData;
    message?: string;
}
export interface PostgresConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
}
