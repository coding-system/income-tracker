export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

export const getStoredTheme = (): ThemeMode | null => {
   try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
   } catch {
      return null;
   }
};

export const setStoredTheme = (theme: ThemeMode) => {
   try {
      localStorage.setItem(STORAGE_KEY, theme);
   } catch {
      // ignore storage errors
   }
};

export const applyTheme = (theme: ThemeMode) => {
   document.documentElement.setAttribute("data-theme", theme);
};

export const getInitialTheme = (): ThemeMode => {
   const stored = getStoredTheme();
   if (stored) {
      return stored;
   }

   const current = document.documentElement.getAttribute("data-theme");
   return current === "light" ? "light" : "dark";
};
