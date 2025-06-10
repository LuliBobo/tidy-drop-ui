import { createContext, useContext } from 'react';

export type LicenseLevel = 'free' | 'premium' | 'enterprise';

export interface LicenseContextType {
  license: LicenseLevel;
  setLicense: (license: LicenseLevel) => void;
}

export const LicenseContext = createContext<LicenseContextType>({
  license: 'free',
  setLicense: () => {},
});

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseContext.Provider');
  }
  return context;
};
