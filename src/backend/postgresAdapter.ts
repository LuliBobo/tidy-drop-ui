// PostgreSQL adapter for web version
import { electronLog } from './logger';
import { User, PostgresConfig, ExportData } from './types';

/**
 * Class to handle PostgreSQL database operations for web version.
 * This is a simplified example. In a real application, you'd want to use
 * a proper ORM like TypeORM, Prisma, or Sequelize.
 */
export class PostgresAdapter {
  private config: PostgresConfig;
  private pg: any; // Will hold the 'pg' module when loaded
  private pool: any; // Connection pool

  constructor(config: PostgresConfig) {
    this.config = config;
  }

  /**
   * Initialize the PostgreSQL connection
   */
  async initialize(): Promise<boolean> {
    try {
      // Dynamic import of pg module (only used in web version)
      const pgModule = await import('pg');
      this.pg = pgModule.default || pgModule;
      
      // Create a connection pool
      this.pool = new this.pg.Pool(this.config);
      
      // Test connection
      await this.pool.query('SELECT NOW()');
      
      // Ensure the users table exists
      await this.createTablesIfNeeded();
      
      return true;
    } catch (error) {
      electronLog.error('Failed to initialize PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Create necessary tables if they don't exist
   */
  private async createTablesIfNeeded(): Promise<void> {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          username VARCHAR(255) PRIMARY KEY,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          failed_login_attempts INTEGER DEFAULT 0,
          locked_until BIGINT,
          status VARCHAR(50) DEFAULT 'active',
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create audit log table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          action VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL,
          performed_by VARCHAR(255),
          details JSONB
        )
      `);

      // Create backup history table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS backup_history (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          operation_type VARCHAR(255) NOT NULL,
          backup_name VARCHAR(255) NOT NULL,
          performed_by VARCHAR(255),
          details JSONB
        )
      `);
    } catch (error) {
      electronLog.error('Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          username, 
          password, 
          role, 
          failed_login_attempts as "failedLoginAttempts", 
          locked_until as "lockedUntil",
          status,
          last_login as "lastLogin",
          created_at as "createdAt"
        FROM users
      `);
      
      return result.rows;
    } catch (error) {
      electronLog.error('Error getting users from PostgreSQL:', error);
      return [];
    }
  }

  /**
   * Add a new user
   */
  async addUser(user: User): Promise<boolean> {
    try {
      await this.pool.query(`
        INSERT INTO users(
          username, password, role, failed_login_attempts, locked_until, status, last_login, created_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        user.username,
        user.password,
        user.role,
        user.failedLoginAttempts || 0,
        user.lockedUntil,
        user.status || 'active',
        user.lastLogin,
        user.createdAt || new Date().toISOString()
      ]);
      
      return true;
    } catch (error) {
      electronLog.error('Error adding user to PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(username: string, updates: Partial<User>): Promise<boolean> {
    try {
      // Build dynamic update query based on provided fields
      const setClauses: string[] = [];
      const values: any[] = [username];
      let paramIndex = 2;

      if (updates.password) {
        setClauses.push(`password = $${paramIndex++}`);
        values.push(updates.password);
      }
      
      if (updates.role) {
        setClauses.push(`role = $${paramIndex++}`);
        values.push(updates.role);
      }
      
      if (updates.failedLoginAttempts !== undefined) {
        setClauses.push(`failed_login_attempts = $${paramIndex++}`);
        values.push(updates.failedLoginAttempts);
      }
      
      if (updates.lockedUntil !== undefined) {
        setClauses.push(`locked_until = $${paramIndex++}`);
        values.push(updates.lockedUntil);
      }
      
      if (updates.status) {
        setClauses.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }
      
      if (updates.lastLogin) {
        setClauses.push(`last_login = $${paramIndex++}`);
        values.push(updates.lastLogin);
      }
      
      if (setClauses.length === 0) {
        return true; // Nothing to update
      }

      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')} 
        WHERE username = $1
      `;
      
      await this.pool.query(query, values);
      return true;
    } catch (error) {
      electronLog.error('Error updating user in PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(username: string): Promise<boolean> {
    try {
      await this.pool.query('DELETE FROM users WHERE username = $1', [username]);
      return true;
    } catch (error) {
      electronLog.error('Error deleting user from PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Find a user by username
   */
  async findUser(username: string): Promise<User | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          username, 
          password, 
          role, 
          failed_login_attempts as "failedLoginAttempts", 
          locked_until as "lockedUntil",
          status,
          last_login as "lastLogin",
          created_at as "createdAt"
        FROM users 
        WHERE username = $1
      `, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      electronLog.error('Error finding user in PostgreSQL:', error);
      return null;
    }
  }

  /**
   * Add entry to audit log
   */
  async addAuditLog(
    action: string, 
    username: string, 
    performedBy: string | null,
    details?: object
  ): Promise<boolean> {
    try {
      await this.pool.query(`
        INSERT INTO audit_log(action, username, performed_by, details)
        VALUES($1, $2, $3, $4)
      `, [
        action, 
        username, 
        performedBy,
        details ? JSON.stringify(details) : null
      ]);
      
      return true;
    } catch (error) {
      electronLog.error('Error adding audit log entry to PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Create a backup of user data
   */
  async createBackup(operationType: string): Promise<boolean> {
    try {
      // In PostgreSQL we can create a timestamped backup table
      const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
      const backupTableName = `users_backup_${operationType}_${timestamp}`;
      
      await this.pool.query(`
        CREATE TABLE ${backupTableName} AS 
        SELECT * FROM users
      `);
      
      // Record backup in history
      await this.pool.query(`
        INSERT INTO backup_history(operation_type, backup_name, performed_by)
        VALUES($1, $2, $3)
      `, [operationType, backupTableName, '']);
      
      return true;
    } catch (error) {
      electronLog.error('Error creating backup in PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Export users to a JSON format
   */
  async exportUsers(): Promise<ExportData> {
    try {
      const users = await this.getAllUsers();
      
      return {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          recordCount: users.length
        },
        users
      };
    } catch (error) {
      electronLog.error('Error exporting users from PostgreSQL:', error);
      return { 
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          recordCount: 0
        }, 
        users: [] 
      };
    }
  }

  /**
   * Import users from a JSON format
   */
  async importUsers(
    data: {users: User[], metadata?: object},
    mode: 'replace' | 'merge' = 'merge'
  ): Promise<{success: boolean, importedCount: number, updatedCount: number}> {
    try {
      // Create backup before import
      await this.createBackup('import');
      
      let importedCount = 0;
      let updatedCount = 0;
      
      if (mode === 'replace') {
        // Delete all existing users
        await this.pool.query('TRUNCATE TABLE users');
        
        // Insert all imported users
        for (const user of data.users) {
          await this.addUser(user);
          importedCount++;
        }
      } else { // merge
        for (const user of data.users) {
          const existingUser = await this.findUser(user.username);
          
          if (existingUser) {
            await this.updateUser(user.username, user);
            updatedCount++;
          } else {
            await this.addUser(user);
            importedCount++;
          }
        }
      }
      
      return { success: true, importedCount, updatedCount };
    } catch (error) {
      electronLog.error('Error importing users to PostgreSQL:', error);
      return { success: false, importedCount: 0, updatedCount: 0 };
    }
  }

  /**
   * Close the PostgreSQL connection pool
   */
  async close(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
      }
    } catch (error) {
      electronLog.error('Error closing PostgreSQL connection pool:', error);
    }
  }
}
