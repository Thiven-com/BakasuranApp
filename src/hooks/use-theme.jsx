import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import Colors from "../constants/Colors";

// ============================================================
// PALETTES
// Both palettes set the text colors explicitly, so the screen
// is readable no matter what values constants/Colors has.
// ============================================================

export const darkColors = {
  ...Colors,

  white: "#FFFFFF",
  text: "#FFFFFF",
  backgroundElement: Colors.surface,
  backgroundSelected: Colors.card,

  textPrimary: "#FFFFFF",
  textSecondary: "#B5B5BA",
  textMuted: "#8A8A90",
};

export const lightColors = {
  ...Colors,

  background: "#F5F6F8",
  backgroundSecondary: "#FFFFFF",
  backgroundElement: "#F0F0F3",
  backgroundSelected: "#E0E1E6",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  border: "#E5E7EB",
  divider: "#EEF0F3",

  gold: "#946200",
  success: Colors.successDark,
  text: "#111827",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#6B7280",
};

// ============================================================
// CONTEXT
// ============================================================

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
});

// ============================================================
// PROVIDER  (wrap your whole app with this in app/_layout.jsx)
// ============================================================

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      colors: isDark ? darkColors : lightColors,
    }),
    [isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
