// auth.ts - Backend funkcie pre autentifikáciu
import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';
import { electronLog } from './logger';

// Typová definícia pre používateľa
interface User {
  username: string;
  password: string; // V reálnej aplikácii by tu malo byť hašované heslo
  role: 'admin' | 'user'; // Role pre kontrolu oprávnení
  failedLoginAttempts?: number; // Počet neúspešných pokusov o prihlásenie
  lockedUntil?: number; // Timestamp, dokedy je účet uzamknutý
}

// Stav aktuálneho používateľa
let currentUser: User | null = null;

// Konfigurácia bezpečnosti pre prihlásenie
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5, // Maximálny počet pokusov o prihlásenie
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minút v milisekundách
};

// Cesta k súboru s používateľmi
const USER_DB_PATH = path.join(app.getPath('userData'), 'DropTidy', 'users.json');

// Zabezpečiť existenciu priečinka
const ensureUserDirectory = () => {
  const dirPath = path.dirname(USER_DB_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Načítanie používateľov zo súboru
const loadUsers = (): User[] => {
  try {
    ensureUserDirectory();
    if (fs.existsSync(USER_DB_PATH)) {
      const data = fs.readFileSync(USER_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    electronLog.error('Error loading users:', error);
    return [];
  }
};

// Uloženie používateľov do súboru
const saveUsers = (users: User[]) => {
  try {
    ensureUserDirectory();
    fs.writeFileSync(USER_DB_PATH, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    electronLog.error('Error saving users:', error);
    return false;
  }
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
export const registerUser = (username: string, password: string, role: 'admin' | 'user' = 'user'): { success: boolean; message?: string } => {
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
    
    const users = loadUsers();
    
    // Kontrola existujúceho používateľa
    if (users.some(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Ak je to prvý používateľ v systéme, automaticky ho nastavíme ako admina
    const assignedRole = users.length === 0 ? 'admin' : role;
    
    // V reálnej aplikácii by sa heslo malo hašovať
    users.push({ 
      username, 
      password, 
      role: assignedRole,
      failedLoginAttempts: 0 
    });
    saveUsers(users);
    
    return { success: true };
  } catch (error) {
    electronLog.error('Error registering user:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
};

// Overenie používateľa pri prihlásení
export const verifyUser = (username: string, password: string): { success: boolean; message?: string } => {
  try {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username);
    
    // Používateľ neexistuje
    if (userIndex === -1) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const user = users[userIndex];
    
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
        saveUsers(users);
      }
      
      currentUser = user;
      return { success: true };
    }
    
    // Nesprávne heslo - zaznamenanie neúspešného pokusu
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    
    // Ak je prekročený maximálny počet pokusov, uzamknutie účtu
    if (user.failedLoginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      saveUsers(users);
      return { 
        success: false, 
        message: `Too many failed attempts. Account is locked for 15 minutes.`
      };
    }
    
    saveUsers(users);
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
export const logoutUser = (): boolean => {
  try {
    currentUser = null;
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
export const getAllUsers = (): User[] => {
  try {
    return loadUsers();
  } catch (error) {
    electronLog.error('Error getting all users:', error);
    return [];
  }
};

// Aktualizácia používateľa - pre admin rozhranie
export const updateUser = (username: string, updatedData: { password?: string; role?: 'admin' | 'user' }): boolean => {
  try {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username);
    
    if (userIndex === -1) {
      return false;
    }
    
    // Update only provided fields
    if (updatedData.password) {
      users[userIndex].password = updatedData.password;
    }
    
    if (updatedData.role) {
      users[userIndex].role = updatedData.role;
    }
    
    // If the updated user is the current user, update the currentUser object
    if (currentUser && currentUser.username === username) {
      currentUser = { ...users[userIndex] };
    }
    
    saveUsers(users);
    return true;
  } catch (error) {
    electronLog.error('Error updating user:', error);
    return false;
  }
};

// Vymazanie používateľa - pre admin rozhranie
export const deleteUser = (username: string): { success: boolean; error?: string } => {
  try {
    // Cannot delete yourself
    if (currentUser && currentUser.username === username) {
      return { success: false, error: 'Cannot delete your own account' };
    }
    
    const users = loadUsers();
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
    
    const filteredUsers = users.filter(user => user.username !== username);
    saveUsers(filteredUsers);
    return { success: true };
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
export const initiatePasswordReset = (username: string): { success: boolean; code?: string; message?: string } => {
  try {
    // Odstránenie starých kódov
    cleanupExpiredResetCodes();
    
    const users = loadUsers();
    const user = users.find(user => user.username === username);
    
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
export const completePasswordReset = (username: string, code: string, newPassword: string): { success: boolean; message?: string } => {
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
    
    // Update hesla
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.username === username);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    // Aktualizácia hesla a odomknutie účtu
    users[userIndex].password = newPassword;
    users[userIndex].failedLoginAttempts = 0;
    users[userIndex].lockedUntil = undefined;
    
    saveUsers(users);
    
    // Odstránenie použitého kódu
    resetCodes = resetCodes.filter(entry => entry.username !== username);
    
    return { success: true, message: 'Password has been reset successfully' };
  } catch (error) {
    electronLog.error('Error completing password reset:', error);
    return { success: false, message: 'An error occurred during password reset' };
  }
};
