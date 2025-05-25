// auth.ts - Backend funkcie pre autentifikáciu
import { electronLog } from './logger';
import { DatabaseAdapter, PlatformMode } from './databaseAdapter';
import { User, AuditLogEntry } from './types';

// Universal database adapter
const dbAdapter = new DatabaseAdapter(PlatformMode.ELECTRON);

// Initialize the adapter
(async () => {
  await dbAdapter.initialize();
  electronLog.info('Database adapter initialized');
})();

// Stav aktuálneho používateľa
let currentUser: User | null = null;

// Konfigurácia bezpečnosti pre prihlásenie
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5, // Maximálny počet pokusov o prihlásenie
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minút v milisekundách
};

/**
 * Validácia hesla
 * @param password Heslo na validáciu
 * @returns Objekt s výsledkom validácie a prípadnou chybovou správou
 */
const validatePassword = (password: string): { valid: boolean; message?: string } => {
  // Minimálna dĺžka hesla
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Kontrola prítomnosti veľkého písmena
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Kontrola prítomnosti malého písmena
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Kontrola prítomnosti číslice
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  // Kontrola prítomnosti špeciálneho znaku
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

// Registrácia nového používateľa
export const registerUser = async (username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; message?: string }> => {
  try {
    // Validácia používateľského mena
    if (username.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters long' };
    }
    
    // Validácia hesla
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }
    
    const users = await dbAdapter.loadUsers();
    
    // Kontrola existujúceho používateľa
    if (users.some(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Ak je to prvý používateľ v systéme, automaticky ho nastavíme ako admina
    const assignedRole = users.length === 0 ? 'admin' : role;
    
    // Create backup before adding user
    await dbAdapter.createBackup('user_registration');
    
    // Add user to database
    const newUser: User = { 
      username, 
      password, 
      role: assignedRole,
      failedLoginAttempts: 0,
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };
    
    const success = await dbAdapter.addUser(newUser);
    
    if (success) {
      // Add audit log entry
      await dbAdapter.addAuditLogEntry('register', username, { role: assignedRole });
      return { success: true };
    }
    
    return { success: false, message: 'Failed to register user' };
  } catch (error) {
    electronLog.error('Error registering user:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
};

// Overenie používateľa pri prihlásení
export const verifyUser = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const user = await dbAdapter.findUser(username);
    
    // Používateľ neexistuje
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    // Kontrola, či nie je účet uzamknutý
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / (60 * 1000));
      return { 
        success: false, 
        message: `Account is locked. Try again in ${remainingMinutes} minute(s).` 
      };
    }
    
    // Správne heslo - úspešné prihlásenie
    if (user.password === password) {
      // Reset počítadla neúspešných pokusov
      if (user.failedLoginAttempts) {
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLogin = new Date().toISOString();
        await dbAdapter.updateUser(username, user);
      }
      
      currentUser = user;
      dbAdapter.setCurrentUser(user);
      
      // Log successful login
      await dbAdapter.addAuditLogEntry('login', username, { success: true });
      
      return { success: true };
    }
    
    // Nesprávne heslo - zaznamenanie neúspešného pokusu
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    
    // Ak je prekročený maximálny počet pokusov, uzamknutie účtu
    if (user.failedLoginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      await dbAdapter.updateUser(username, user);
      
      // Log account lockout
      await dbAdapter.addAuditLogEntry('account_lockout', username, { 
        reason: 'Too many failed login attempts' 
      });
      
      return { 
        success: false, 
        message: `Too many failed attempts. Account is locked for 15 minutes.`
      };
    }
    
    await dbAdapter.updateUser(username, user);
    
    // Log failed login attempt
    await dbAdapter.addAuditLogEntry('login_failed', username, { 
      attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts 
    });
    
    return { 
      success: false, 
      message: `Invalid password. ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts} attempts remaining.`
    };
  } catch (error) {
    electronLog.error('Error verifying user:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};

// Odhlásenie používateľa
export const logoutUser = async (): Promise<boolean> => {
  try {
    // Log the logout action if a user is currently logged in
    if (currentUser) {
      await dbAdapter.addAuditLogEntry('logout', currentUser.username);
    }
    
    currentUser = null;
    dbAdapter.setCurrentUser(null);
    return true;
  } catch (error) {
    electronLog.error('Error logging out user:', error);
    return false;
  }
};

// Kontrola, či je používateľ prihlásený
export const isUserLoggedIn = (): boolean => {
  return currentUser !== null;
};

// Získať meno prihláseného používateľa
export const getCurrentUsername = (): string | null => {
  return currentUser ? currentUser.username : null;
};

// Získať zoznam všetkých používateľov - pre admin rozhranie
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await dbAdapter.loadUsers();
  } catch (error) {
    electronLog.error('Error getting all users:', error);
    return [];
  }
};

// Aktualizácia používateľa - pre admin rozhranie
export const updateUser = async (username: string, updatedData: { password?: string; role?: 'admin' | 'user' }): Promise<boolean> => {
  try {
    const user = await dbAdapter.findUser(username);
    
    if (!user) {
      return false;
    }
    
    // Create backup before updating user
    await dbAdapter.createBackup('user_update');
    
    // Update only provided fields
    const updates: Partial<User> = {};
    
    if (updatedData.password) {
      updates.password = updatedData.password;
    }
    
    if (updatedData.role) {
      updates.role = updatedData.role;
    }
    
    const success = await dbAdapter.updateUser(username, updates);
    
    // If the updated user is the current user, update the currentUser object
    if (success && currentUser && currentUser.username === username) {
      currentUser = { ...currentUser, ...updates };
      dbAdapter.setCurrentUser(currentUser);
    }
    
    if (success) {
      // Add audit log entry
      await dbAdapter.addAuditLogEntry('update', username, updatedData);
    }
    
    return success;
  } catch (error) {
    electronLog.error('Error updating user:', error);
    return false;
  }
};

// Vymazanie používateľa - pre admin rozhranie
export const deleteUser = async (username: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Cannot delete yourself
    if (currentUser && currentUser.username === username) {
      return { success: false, error: 'Cannot delete your own account' };
    }
    
    const users = await dbAdapter.loadUsers();
    const userToDelete = users.find(user => user.username === username);
    
    // Check if user exists
    if (!userToDelete) {
      return { success: false, error: 'User not found' };
    }
    
    // Check if this is the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = users.filter(user => user.role === 'admin').length;
      if (adminCount <= 1) {
        return { 
          success: false, 
          error: 'Cannot delete the last administrator account' 
        };
      }
    }
    
    // Create backup before deleting user
    await dbAdapter.createBackup('user_deletion');
    
    // Delete user and log the action
    const success = await dbAdapter.deleteUser(username);
    
    if (success) {
      // Add audit log entry
      await dbAdapter.addAuditLogEntry('delete', username, { 
        deletedBy: getCurrentUsername() 
      });
    }
    
    return { success };
  } catch (error) {
    electronLog.error('Error deleting user:', error);
    return { success: false, error: `An error occurred: ${error}` };
  }
};

// Získať rolu aktuálneho používateľa
export const getCurrentUserRole = (): string | null => {
  return currentUser ? currentUser.role : null;
};

// Kontrola či je používateľ admin
export const isCurrentUserAdmin = (): boolean => {
  return currentUser?.role === 'admin';
};

// Pre uloženie dočasných kódov na resetovanie hesla
interface ResetPasswordCode {
  username: string;
  code: string;
  expiresAt: number;
}

let resetCodes: ResetPasswordCode[] = [];

/**
 * Generovanie náhodného resetovacieho kódu
 */
const generateResetCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Vyčistenie vypršaných resetovacích kódov
 */
const cleanupExpiredResetCodes = (): void => {
  const now = Date.now();
  resetCodes = resetCodes.filter(item => item.expiresAt > now);
};

/**
 * Zahájenie procesu resetovania hesla pre konkrétneho používateľa
 * @param username Používateľské meno
 * @returns Objekt s výsledkom operácie a prípadným resetovacím kódom
 */
export const initiatePasswordReset = async (username: string): Promise<{ success: boolean; code?: string; message?: string }> => {
  try {
    // Odstránenie starých kódov
    cleanupExpiredResetCodes();
    
    const user = await dbAdapter.findUser(username);
    
    // Používateľ neexistuje
    if (!user) {
      // Pre bezpečnosť vrátime úspech aj keď používateľ neexistuje
      // aby útočník nevedel, či používateľ existuje alebo nie
      return { success: true, message: 'If the account exists, a reset code has been generated.' };
    }
    
    // Vygenerovanie a uloženie resetovacieho kódu
    const code = generateResetCode();
    const expiresAt = Date.now() + (30 * 60 * 1000); // Platnosť 30 minút
    
    // Odstránenie starých kódov pre tohto používateľa
    resetCodes = resetCodes.filter(item => item.username !== username);
    
    // Uloženie nového kódu
    resetCodes.push({
      username,
      code,
      expiresAt
    });
    
    // Log the password reset initiation
    await dbAdapter.addAuditLogEntry('password_reset_initiated', username);
    
    // V reálnej aplikácii by sa kód poslal e-mailom
    // Tu ho vrátime, aby sme ho mohli použiť v demo režime
    return { success: true, code };
  } catch (error) {
    electronLog.error('Error initiating password reset:', error);
    return { success: false, message: 'An error occurred during password reset' };
  }
};

/**
 * Dokončenie procesu resetovania hesla zadaním kódu a nového hesla
 * @param username Používateľské meno
 * @param code Resetovací kód
 * @param newPassword Nové heslo
 * @returns Objekt s výsledkom operácie
 */
export const completePasswordReset = async (username: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Odstránenie starých kódov
    cleanupExpiredResetCodes();
    
    // Nájdenie platného kódu
    const resetEntry = resetCodes.find(
      entry => entry.username === username && 
      entry.code === code && 
      entry.expiresAt > Date.now()
    );
    
    if (!resetEntry) {
      return { success: false, message: 'Invalid or expired reset code' };
    }
    
    // Validácia nového hesla
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }
    
    const user = await dbAdapter.findUser(username);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Create backup before password reset
    await dbAdapter.createBackup('password_reset');
    
    // Aktualizácia hesla a odomknutie účtu
    const updates = {
      password: newPassword,
      failedLoginAttempts: 0,
      lockedUntil: undefined
    };
    
    const success = await dbAdapter.updateUser(username, updates);
    
    if (!success) {
      return { success: false, message: 'Failed to update password' };
    }
    
    // Odstránenie použitého kódu
    resetCodes = resetCodes.filter(entry => entry.username !== username);
    
    // Log the successful password reset
    await dbAdapter.addAuditLogEntry('password_reset_completed', username);
    
    return { success: true, message: 'Password has been reset successfully' };
  } catch (error) {
    electronLog.error('Error completing password reset:', error);
    return { success: false, message: 'An error occurred during password reset' };
  }
};

/**
 * Exportovanie používateľských dát do súboru
 * @param exportPath Cesta, kam sa majú dáta exportovať
 * @returns Objekt s výsledkom exportu
 */
export const exportUserData = async (exportPath: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await dbAdapter.exportUserData(exportPath);
    return result;
  } catch (error) {
    electronLog.error('Error exporting user data:', error);
    return { success: false, message: `Failed to export user data: ${error}` };
  }
};

/**
 * Importovanie používateľských dát zo súboru
 * @param importPath Cesta k súboru s dátami na import
 * @param mode Režim importu - 'replace' nahradí všetky existujúce dáta, 'merge' ich zlúči
 * @returns Objekt s výsledkom importu
 */
export const importUserData = async (importPath: string, mode: 'replace' | 'merge' = 'merge'): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await dbAdapter.importUserData(importPath, mode);
    return result;
  } catch (error) {
    electronLog.error('Error importing user data:', error);
    return { success: false, message: `Failed to import user data: ${error}` };
  }
};

// Add functions to query and manage audit logs
export const getAuditLogs = async (): Promise<unknown[]> => {
  // This functionality can be implemented in the future
  // For now, we'll return an empty array
  return [];
};
