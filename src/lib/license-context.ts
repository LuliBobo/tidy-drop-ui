import { createContext, useContext } from 'react';

export type LicenseLevel = 'free' | 'pro';
export type LicenseContextType = {
  license: LicenseLevel;
  setLicense: (license: LicenseLevel) => void;
};

export const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}