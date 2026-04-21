import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark';

interface ThemeContextValue {
  themePreference: ThemePreference;
  isLoading: boolean;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  toggleThemePreference: () => Promise<void>;
}

const THEME_PREFERENCE_KEY = 'theme_preference';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restorePreference() {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (!mounted) return;
        if (stored === 'light' || stored === 'dark') {
          setThemePreferenceState(stored);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restorePreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemePreference = async (value: ThemePreference) => {
    setThemePreferenceState(value);
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, value);
  };

  const toggleThemePreference = async () => {
    const next = themePreference === 'dark' ? 'light' : 'dark';
    await setThemePreference(next);
  };

  const value = useMemo(
    () => ({
      themePreference,
      isLoading,
      setThemePreference,
      toggleThemePreference,
    }),
    [themePreference, isLoading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used inside ThemeProvider');
  }
  return ctx;
}

export { THEME_PREFERENCE_KEY };
