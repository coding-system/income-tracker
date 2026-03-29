export type ShiftCost = {
   costTotal: number;
};

export type ShiftData = {
   id: string;
   date: string;
   incomeTotal: number;
   fuelings?: ShiftCost[];
   washes?: ShiftCost[];
   snacks?: ShiftCost[];
   others?: ShiftCost[];
};

export type ProfileSettings = {
   dailyTargetNet?: number | null;
   workDaysPerWeek?: number | null;
   hasWeeklyPlan?: boolean;
};

export type WeeklyPlanModalState = {
   title: string;
   subtitle?: string;
   weekLabel?: string;
   todayIncome?: number;
   dailyTarget?: number;
   todayDelta?: number;
   actualIncome?: number;
   expectedIncome?: number;
   weeklyTarget?: number;
   workedDays?: number;
   workDaysPerWeek?: number;
   actualProgressPercent?: number;
   expectedProgressPercent?: number;
   delta?: number;
   isAheadOfPlan: boolean;
   hasPlan: boolean;
};

const parseDateLocal = (value: string) => {
   const parts = value.split("-").map(Number);
   if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) {
      return null;
   }

   const [year, month, day] = parts;
   return new Date(year, month - 1, day);
};

const startOfDay = (value: Date) => {
   const next = new Date(value);
   next.setHours(0, 0, 0, 0);
   return next;
};

const endOfDay = (value: Date) => {
   const next = new Date(value);
   next.setHours(23, 59, 59, 999);
   return next;
};

const startOfWeekMonday = (value: Date) => {
   const next = startOfDay(value);
   const day = next.getDay();
   const diff = day === 0 ? -6 : 1 - day;
   next.setDate(next.getDate() + diff);
   return next;
};

const endOfWeekMonday = (value: Date) => {
   const next = startOfWeekMonday(value);
   next.setDate(next.getDate() + 6);
   return endOfDay(next);
};

const isInPeriod = (value: Date, start: Date, end: Date) => {
   return (
      value.getTime() >= start.getTime() && value.getTime() <= end.getTime()
   );
};

const getCostsTotal = (shift: ShiftData) => {
   const totalFueling = (shift.fuelings ?? []).reduce(
      (sum, item) => sum + item.costTotal,
      0,
   );
   const totalWashes = (shift.washes ?? []).reduce(
      (sum, item) => sum + item.costTotal,
      0,
   );
   const totalSnacks = (shift.snacks ?? []).reduce(
      (sum, item) => sum + item.costTotal,
      0,
   );
   const totalOthers = (shift.others ?? []).reduce(
      (sum, item) => sum + item.costTotal,
      0,
   );

   return totalFueling + totalWashes + totalSnacks + totalOthers;
};

const getShiftNetIncome = (shift: ShiftData) => {
   return shift.incomeTotal - getCostsTotal(shift);
};

const clampPercent = (value: number) => {
   return Math.max(0, Math.min(100, value));
};

const formatWeekLabel = (start: Date, end: Date) => {
   const formatter = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
   });

   return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const buildWeeklyPlanModalState = (
   shifts: ShiftData[],
   profile: ProfileSettings,
   shiftDate: string,
): WeeklyPlanModalState => {
   const referenceDate = parseDateLocal(shiftDate);
   if (!referenceDate) {
      return {
         title: "Смена сохранена",
         subtitle: "Не удалось определить неделю для расчета плана.",
         isAheadOfPlan: false,
         hasPlan: false,
      };
   }

   const weekStart = startOfWeekMonday(referenceDate);
   const weekEnd = endOfWeekMonday(referenceDate);
   const dayStart = startOfDay(referenceDate);
   const dayEnd = endOfDay(referenceDate);
   const weekShifts = shifts.filter((shift) => {
      const parsedDate = parseDateLocal(shift.date);
      return parsedDate ? isInPeriod(parsedDate, weekStart, weekEnd) : false;
   });
   const dayShifts = shifts.filter((shift) => {
      const parsedDate = parseDateLocal(shift.date);
      return parsedDate ? isInPeriod(parsedDate, dayStart, dayEnd) : false;
   });

   const actualIncome = weekShifts.reduce(
      (sum, shift) => sum + getShiftNetIncome(shift),
      0,
   );
   const todayIncome = dayShifts.reduce(
      (sum, shift) => sum + getShiftNetIncome(shift),
      0,
   );
   const workedDays = weekShifts.length;
   const dailyTargetNet = profile.dailyTargetNet ?? null;
   const workDaysPerWeek = profile.workDaysPerWeek ?? null;
   const hasPlan =
      Boolean(profile.hasWeeklyPlan) &&
      dailyTargetNet !== null &&
      dailyTargetNet > 0 &&
      workDaysPerWeek !== null &&
      workDaysPerWeek > 0;

   if (!hasPlan || dailyTargetNet === null || workDaysPerWeek === null) {
      return {
         title: "Смена сохранена",
         subtitle: "Недельный план не настроен в профиле.",
         weekLabel: formatWeekLabel(weekStart, weekEnd),
         todayIncome,
         dailyTarget: dailyTargetNet ?? undefined,
         actualIncome,
         workedDays,
         isAheadOfPlan: false,
         hasPlan: false,
      };
   }

   const weeklyTarget = dailyTargetNet * workDaysPerWeek;
   const expectedIncome = Math.min(weeklyTarget, workedDays * dailyTargetNet);
   const todayDelta = todayIncome - dailyTargetNet;
   const delta = actualIncome - expectedIncome;
   const isAheadOfPlan = actualIncome >= expectedIncome;

   return {
      title: isAheadOfPlan ? "Норма выполнена" : "Норма не выполнена",
      weekLabel: formatWeekLabel(weekStart, weekEnd),
      todayIncome,
      dailyTarget: dailyTargetNet,
      todayDelta,
      actualIncome,
      expectedIncome,
      weeklyTarget,
      workedDays,
      workDaysPerWeek,
      actualProgressPercent: clampPercent((actualIncome / weeklyTarget) * 100),
      expectedProgressPercent: clampPercent(
         (expectedIncome / weeklyTarget) * 100,
      ),
      delta,
      isAheadOfPlan,
      hasPlan: true,
   };
};
