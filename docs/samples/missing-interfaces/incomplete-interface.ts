interface UserData {
  id: string;
  name: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: string;
  notifications: boolean;
  saveHistory: boolean; // Only used in desktop version
  localStoragePath: string; // Only relevant in desktop version
}

function createUserPreferences(): UserPreferences {
  return {
    theme: "light",
    notifications: true,
    // Missing required properties for desktop
  };
}