import { createContext } from 'react';

export type LicenseLevel = 'free' | 'pro' | 'enterprise';

export interface LicenseContextType {
  license: LicenseLevel;
  setLicense: (license: LicenseLevel) => void;
}

export const LicenseContext = createContext<LicenseContextType>({
  license: 'free',
  setLicense: () => {},
});