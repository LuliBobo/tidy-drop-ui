// License and subscription types
export type LicenseLevel = 'free' | 'pro';

// Feature flags interface to control what features are available at each license level
export interface LicenseFeatures {
  maxFilesPerDay: number;
  allowBatchProcessing: boolean;
  allowVideoProcessing: boolean;
  allowCustomExport: boolean;
}

// License feature configurations
export const LICENSE_FEATURES: Record<LicenseLevel, LicenseFeatures> = {
  free: {
    maxFilesPerDay: 5,
    allowBatchProcessing: false,
    allowVideoProcessing: false,
    allowCustomExport: false,
  },
  pro: {
    maxFilesPerDay: Infinity,
    allowBatchProcessing: true,
    allowVideoProcessing: true,
    allowCustomExport: true,
  },
};