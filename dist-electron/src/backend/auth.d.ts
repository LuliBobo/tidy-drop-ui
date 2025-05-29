import { User } from './types.js';
export declare const registerUser: (username: string, password: string, role?: "admin" | "user") => Promise<{
    success: boolean;
    message?: string;
}>;
export declare const verifyUser: (username: string, password: string) => Promise<{
    success: boolean;
    message?: string;
}>;
export declare const logoutUser: () => Promise<boolean>;
export declare const isUserLoggedIn: () => boolean;
export declare const getCurrentUsername: () => string | null;
export declare const getAllUsers: () => Promise<User[]>;
export declare const updateUser: (username: string, updatedData: {
    password?: string;
    role?: "admin" | "user";
}) => Promise<boolean>;
export declare const deleteUser: (username: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const getCurrentUserRole: () => string | null;
export declare const isCurrentUserAdmin: () => boolean;
/**
 * Zahájenie procesu resetovania hesla pre konkrétneho používateľa
 * @param username Používateľské meno
 * @returns Objekt s výsledkom operácie a prípadným resetovacím kódom
 */
export declare const initiatePasswordReset: (username: string) => Promise<{
    success: boolean;
    code?: string;
    message?: string;
}>;
/**
 * Dokončenie procesu resetovania hesla zadaním kódu a nového hesla
 * @param username Používateľské meno
 * @param code Resetovací kód
 * @param newPassword Nové heslo
 * @returns Objekt s výsledkom operácie
 */
export declare const completePasswordReset: (username: string, code: string, newPassword: string) => Promise<{
    success: boolean;
    message?: string;
}>;
/**
 * Exportovanie používateľských dát do súboru
 * @param exportPath Cesta, kam sa majú dáta exportovať
 * @returns Objekt s výsledkom exportu
 */
export declare const exportUserData: (exportPath: string) => Promise<{
    success: boolean;
    message?: string;
}>;
/**
 * Importovanie používateľských dát zo súboru
 * @param importPath Cesta k súboru s dátami na import
 * @param mode Režim importu - 'replace' nahradí všetky existujúce dáta, 'merge' ich zlúči
 * @returns Objekt s výsledkom importu
 */
export declare const importUserData: (importPath: string, mode?: "replace" | "merge") => Promise<{
    success: boolean;
    message?: string;
}>;
export declare const getAuditLogs: () => Promise<unknown[]>;
