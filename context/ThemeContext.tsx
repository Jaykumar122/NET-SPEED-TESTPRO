import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const DARK = {
  bg: "#060612",
  card: "#0E0E20",
  elevated: "#161628",
  border: "#1E1E38",
  muted: "#2A2A48",
  cyan: "#00E5FF",
  purple: "#A855F7",
  lime: "#84CC16",
  orange: "#F97316",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
  yellow: "#FACC15",
  pink: "#EC4899",
  teal: "#14B8A6",
  indigo: "#6366F1",
  text: "#F0F4FF",
  textSub: "#7880A8",
  textGhost: "#2E3058",
  tabBar: "#080816",
  tabBorder: "#1A1A30",
  isDark: true,
} as const;

export const LIGHT = {
  bg: "#F9FAFB",
  card: "#FFFFFF",
  elevated: "#F3F4F6",
  border: "#E5E7EB",
  muted: "#D1D5DB",
  cyan: "#0891B2",
  purple: "#7C3AED",
  lime: "#65A30D",
  orange: "#EA580C",
  green: "#16A34A",
  red: "#DC2626",
  blue: "#2563EB",
  yellow: "#D97706",
  pink: "#DB2777",
  teal: "#0D9488",
  indigo: "#4F46E5",
  text: "#111827",
  textSub: "#6B7280",
  textGhost: "#9CA3AF",
  tabBar: "#FFFFFF",
  tabBorder: "#E5E7EB",
  isDark: false,
} as const;

export type Theme = typeof DARK;

interface Ctx {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<Ctx>({
  theme: DARK,
  isDark: true,
  toggle: () => {},
});

const KEY = "st_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === "light") {
        setIsDark(false);
        setColorScheme("light");
      } else {
        setColorScheme("dark");
      }
    });
  }, [setColorScheme]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      AsyncStorage.setItem(KEY, newIsDark ? "dark" : "light");
      setColorScheme(newIsDark ? "dark" : "light");
      return newIsDark;
    });
  }, [setColorScheme]);

  return (
    <ThemeCtx.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
