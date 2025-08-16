"use client";

import React from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove("light", "dark");
  if (body) body.classList.remove("light", "dark");
  if (theme === "dark") {
    root.classList.add("dark");
    if (body) body.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.style.colorScheme = "light";
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>("light");

  React.useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") || localStorage.getItem("wbjeeTheme")) as ThemeMode | null;
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: ThemeMode = saved ?? (prefersDark ? "dark" : "light");
      setThemeState(initial);
      applyThemeClass(initial);
    } catch {
      setThemeState("light");
      applyThemeClass("light");
    }
  }, []);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    try {
      localStorage.setItem("theme", t);
      localStorage.setItem("wbjeeTheme", t);
    } catch {}
    applyThemeClass(t);
  };

  const toggleTheme = React.useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within Providers");
  return ctx;
} 