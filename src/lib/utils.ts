import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LicenseLevel, LICENSE_FEATURES } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const DAILY_QUOTA_KEY = 'tidy-drop-daily-quota';
const LICENSE_KEY = 'tidy-drop-license';

interface DailyQuota {
  date: string;
  count: number;
}

export function getCurrentLicense(): LicenseLevel {
  return (localStorage.getItem(LICENSE_KEY) as LicenseLevel) || 'free';
}

export function setLicense(level: LicenseLevel): void {
  localStorage.setItem(LICENSE_KEY, level);
}

export function getDailyQuota(): DailyQuota {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(DAILY_QUOTA_KEY);
  
  if (stored) {
    const quota: DailyQuota = JSON.parse(stored);
    if (quota.date === today) {
      return quota;
    }
  }
  
  // Reset quota for new day
  const newQuota = { date: today, count: 0 };
  localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(newQuota));
  return newQuota;
}

export function incrementDailyQuota(): void {
  const quota = getDailyQuota();
  quota.count += 1;
  localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(quota));
}

export function checkDailyQuotaExceeded(): boolean {
  const license = getCurrentLicense();
  const quota = getDailyQuota();
  return quota.count >= LICENSE_FEATURES[license].maxFilesPerDay;
}

export function getRemainingQuota(): number {
  const license = getCurrentLicense();
  const quota = getDailyQuota();
  const maxFiles = LICENSE_FEATURES[license].maxFilesPerDay;
  return maxFiles === Infinity ? Infinity : Math.max(0, maxFiles - quota.count);
}
