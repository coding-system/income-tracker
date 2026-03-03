export type IncomeMode = "gross" | "net";

const STORAGE_KEY = "historyIncomeMode";

export const getStoredIncomeMode = (): IncomeMode | null => {
   try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "gross" || value === "net" ? value : null;
   } catch {
      return null;
   }
};

export const setStoredIncomeMode = (incomeMode: IncomeMode) => {
   try {
      localStorage.setItem(STORAGE_KEY, incomeMode);
   } catch {
      // ignore storage errors
   }
};
