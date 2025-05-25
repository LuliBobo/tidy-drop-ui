// Common types for the application

// User type
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

// Audit log entry
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  username: string;
  performedBy: string | null;
  details?: Record<string, unknown>;
}

// Export data structure
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

// Import result
export interface ImportResult {
  success: boolean;
  message?: string;
  importedCount?: number;
  updatedCount?: number;
}

// Export result
export interface ExportResult {
  success: boolean;
  data?: ExportData;
  message?: string;
}

// PostgreSQL configuration
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}
