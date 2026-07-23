import type { ParsedShiftFields } from "./parseShiftText";

export type OpenShiftDraft = {
   date: string;
   openedAt: string;
   incomeTotal?: number;
   mileageKm?: number;
   tripsCount?: number;
   engineHours?: number;
   fuelings: number[];
   washes: number[];
   snacks: number[];
   others: number[];
};

const STORAGE_KEY = "openShiftDraft";

export const createOpenShiftDraft = (date: string): OpenShiftDraft => ({
   date,
   openedAt: new Date().toISOString(),
   fuelings: [],
   washes: [],
   snacks: [],
   others: [],
});

export const loadOpenShiftDraft = (): OpenShiftDraft | null => {
   const raw = localStorage.getItem(STORAGE_KEY);
   if (!raw) {
      return null;
   }

   try {
      const parsed = JSON.parse(raw) as OpenShiftDraft;
      if (!parsed || typeof parsed.date !== "string") {
         return null;
      }
      return {
         ...parsed,
         fuelings: parsed.fuelings ?? [],
         washes: parsed.washes ?? [],
         snacks: parsed.snacks ?? [],
         others: parsed.others ?? [],
      };
   } catch {
      return null;
   }
};

export const saveOpenShiftDraft = (draft: OpenShiftDraft) => {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const clearOpenShiftDraft = () => {
   localStorage.removeItem(STORAGE_KEY);
};

export const mergeParsedIntoDraft = (
   draft: OpenShiftDraft,
   parsed: ParsedShiftFields,
): OpenShiftDraft => ({
   ...draft,
   date: parsed.date ?? draft.date,
   incomeTotal: parsed.incomeTotal ?? draft.incomeTotal,
   mileageKm: parsed.mileageKm ?? draft.mileageKm,
   tripsCount: parsed.tripsCount ?? draft.tripsCount,
   engineHours: parsed.engineHours ?? draft.engineHours,
   fuelings: parsed.fuelings
      ? [...draft.fuelings, ...parsed.fuelings]
      : draft.fuelings,
   washes: parsed.washes ? [...draft.washes, ...parsed.washes] : draft.washes,
   snacks: parsed.snacks ? [...draft.snacks, ...parsed.snacks] : draft.snacks,
   others: parsed.others ? [...draft.others, ...parsed.others] : draft.others,
});
