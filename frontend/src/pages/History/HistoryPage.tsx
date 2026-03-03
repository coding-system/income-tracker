import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { HistoryChart } from "../../components/HistoryChart/HistoryChart";
import { ShiftList } from "../../components/ShiftList/ShiftList";
import {
   getStoredIncomeMode,
   setStoredIncomeMode,
   type IncomeMode,
} from "../../utils/incomeMode";
import styles from "./HistoryPage.module.scss";

type PeriodMode = "day" | "week" | "month";

type ShiftCost = {
   costTotal: number;
};

type ShiftData = {
   id: string;
   date: string;
   incomeTotal: number;
   engineHours: number | null;
   mileageKm: number | null;
   fuelings?: ShiftCost[];
   washes?: ShiftCost[];
   snacks?: ShiftCost[];
   others?: ShiftCost[];
};

type ProfileSettings = {
   dailyTargetNet?: number | null;
   hasWeeklyPlan?: boolean;
};

type ChartBucket = {
   key: string;
   label: string;
   value: number;
   start: Date;
   end: Date;
};

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

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

const getShiftIncome = (shift: ShiftData, mode: IncomeMode) => {
   if (mode === "gross") {
      return shift.incomeTotal;
   }

   return shift.incomeTotal - getCostsTotal(shift);
};

const parseDateLocal = (value: string) => {
   const parts = value.split("-").map(Number);
   if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) {
      return null;
   }

   const [year, month, day] = parts;
   return new Date(year, month - 1, day);
};

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const buildDaysBetween = (start: Date, end: Date) => {
   const result: Date[] = [];
   const current = new Date(start);
   current.setHours(0, 0, 0, 0);

   const finish = new Date(end);
   finish.setHours(0, 0, 0, 0);

   while (current <= finish) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
   }

   return result;
};

const MONTH_BUCKETS_START = new Date(2025, 10, 1);
const WEEK_BUCKETS_START = new Date(2026, 0, 5);

const startOfDay = (value: Date) => {
   const date = new Date(value);
   date.setHours(0, 0, 0, 0);
   return date;
};

const endOfDay = (value: Date) => {
   const date = new Date(value);
   date.setHours(23, 59, 59, 999);
   return date;
};

const startOfWeekMonday = (value: Date) => {
   const date = startOfDay(value);
   const day = date.getDay();
   const diff = day === 0 ? -6 : 1 - day;
   date.setDate(date.getDate() + diff);
   return date;
};

const endOfWeekMonday = (value: Date) => {
   const date = startOfWeekMonday(value);
   date.setDate(date.getDate() + 6);
   return endOfDay(date);
};

const startOfMonth = (value: Date) => {
   return new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0, 0);
};

const endOfMonth = (value: Date) => {
   return new Date(
      value.getFullYear(),
      value.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
   );
};

const isInPeriod = (value: Date, start: Date, end: Date) => {
   return (
      value.getTime() >= start.getTime() && value.getTime() <= end.getTime()
   );
};

const formatDayLabel = (value: Date) => {
   return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
   }).format(value);
};

const formatWeekLabel = (start: Date, end: Date) => {
   const startLabel = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
   }).format(start);
   const endLabel = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
   }).format(end);
   return `${startLabel}–${endLabel}`;
};

const formatMonthLabel = (value: Date) => {
   return new Intl.DateTimeFormat("ru-RU", {
      month: "short",
   }).format(value);
};

const isWithinLastSevenDays = (date: Date) => {
   const start = new Date();
   start.setHours(0, 0, 0, 0);
   start.setDate(start.getDate() - 6);

   const end = new Date();
   end.setHours(23, 59, 59, 999);

   return date >= start && date <= end;
};

const isWithinLastDays = (date: Date, days: number) => {
   const start = new Date();
   start.setHours(0, 0, 0, 0);
   start.setDate(start.getDate() - (days - 1));

   const end = new Date();
   end.setHours(23, 59, 59, 999);

   return date >= start && date <= end;
};

export function HistoryPage() {
   const [shifts, setShifts] = useState<ShiftData[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [periodMode, setPeriodMode] = useState<PeriodMode>("day");
   const [incomeMode, setIncomeMode] = useState<IncomeMode>(() => {
      return getStoredIncomeMode() ?? "gross";
   });
   const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(
      null,
   );
   const [dailyTargetNet, setDailyTargetNet] = useState<number | null>(null);
   const [hasWeeklyPlan, setHasWeeklyPlan] = useState(false);

   const shiftsWithDate = shifts
      .map((shift) => ({
         ...shift,
         parsedDate: parseDateLocal(shift.date),
      }))
      .filter(
         (shift): shift is ShiftData & { parsedDate: Date } =>
            shift.parsedDate !== null,
      );

   const buildDayBuckets = () => {
      const now = startOfDay(new Date());
      const incomeByDate = shiftsWithDate.reduce<Record<string, number>>(
         (acc, shift) => {
            const key = toIsoDate(shift.parsedDate);
            acc[key] = (acc[key] ?? 0) + getShiftIncome(shift, incomeMode);
            return acc;
         },
         {},
      );

      const oldestShiftDate =
         shiftsWithDate.length > 0
            ? startOfDay(
                 new Date(
                    Math.min(
                       ...shiftsWithDate.map((shift) =>
                          shift.parsedDate.getTime(),
                       ),
                    ),
                 ),
              )
            : (() => {
                 const fallback = new Date(now);
                 fallback.setDate(now.getDate() - 6);
                 return fallback;
              })();

      return buildDaysBetween(oldestShiftDate, now).map((dayStart) => {
         const dayEnd = endOfDay(dayStart);
         const key = toIsoDate(dayStart);
         return {
            key: `day-${key}`,
            label: formatDayLabel(dayStart),
            value: incomeByDate[key] ?? 0,
            start: dayStart,
            end: dayEnd,
         };
      });
   };

   const buildWeekBuckets = () => {
      const now = new Date();
      const currentWeekStart = startOfWeekMonday(now);
      const oldestWeekStart = startOfWeekMonday(WEEK_BUCKETS_START);
      const result: ChartBucket[] = [];

      for (
         let weekStart = new Date(oldestWeekStart);
         weekStart <= currentWeekStart;
         weekStart.setDate(weekStart.getDate() + 7)
      ) {
         const periodStart = new Date(weekStart);
         const weekEnd = endOfWeekMonday(weekStart);
         const value = shiftsWithDate.reduce((sum, shift) => {
            return isInPeriod(shift.parsedDate, periodStart, weekEnd)
               ? sum + getShiftIncome(shift, incomeMode)
               : sum;
         }, 0);

         result.push({
            key: `week-${toIsoDate(periodStart)}`,
            label: formatWeekLabel(periodStart, weekEnd),
            value,
            start: periodStart,
            end: weekEnd,
         });
      }

      return result;
   };

   const buildMonthBuckets = () => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const oldestMonthStart = startOfMonth(MONTH_BUCKETS_START);
      const result: ChartBucket[] = [];

      for (
         let periodStart = new Date(oldestMonthStart);
         periodStart <= currentMonthStart;
         periodStart.setMonth(periodStart.getMonth() + 1)
      ) {
         const monthStart = new Date(periodStart);
         const periodEnd = endOfMonth(monthStart);
         const value = shiftsWithDate.reduce((sum, shift) => {
            return isInPeriod(shift.parsedDate, periodStart, periodEnd)
               ? sum + getShiftIncome(shift, incomeMode)
               : sum;
         }, 0);

         result.push({
            key: `month-${periodStart.getFullYear()}-${periodStart.getMonth() + 1}`,
            label: formatMonthLabel(periodStart),
            value,
            start: monthStart,
            end: periodEnd,
         });
      }

      return result;
   };

   const chartBuckets =
      periodMode === "day"
         ? buildDayBuckets()
         : periodMode === "week"
           ? buildWeekBuckets()
           : buildMonthBuckets();

   const selectedBucket =
      chartBuckets.find((bucket) => bucket.key === selectedBucketKey) ??
      chartBuckets[chartBuckets.length - 1] ??
      null;

   const chartPoints = chartBuckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      value: bucket.value,
   }));

   const workedValues = chartPoints
      .map((item) => item.value)
      .filter((value) => value > 0);
   const averageGrossIncome = workedValues.length
      ? workedValues.reduce((sum, value) => sum + value, 0) /
        workedValues.length
      : null;
   const targetDailyIncome =
      hasWeeklyPlan && dailyTargetNet !== null && dailyTargetNet > 0
         ? dailyTargetNet
         : null;

   const filteredShifts = selectedBucket
      ? shiftsWithDate
           .filter((shift) =>
              isInPeriod(
                 shift.parsedDate,
                 selectedBucket.start,
                 selectedBucket.end,
              ),
           )
           .map((shift) => ({
              id: shift.id,
              date: shift.date,
              incomeTotal: shift.incomeTotal,
              engineHours: shift.engineHours,
              mileageKm: shift.mileageKm,
              fuelings: shift.fuelings,
              washes: shift.washes,
              snacks: shift.snacks,
              others: shift.others,
           }))
      : shifts;

   const weeklyGrossIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate || !isWithinLastSevenDays(shiftDate)) {
         return total;
      }

      return total + getShiftIncome(shift, incomeMode);
   }, 0);

   const lastThirtyGrossIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate || !isWithinLastDays(shiftDate, 30)) {
         return total;
      }

      return total + getShiftIncome(shift, incomeMode);
   }, 0);

   const monthLabel = new Intl.DateTimeFormat("ru-RU", {
      month: "long",
   }).format(new Date());

   const monthlyGrossIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate) {
         return total;
      }

      const now = new Date();
      if (
         shiftDate.getFullYear() !== now.getFullYear() ||
         shiftDate.getMonth() !== now.getMonth()
      ) {
         return total;
      }

      return total + getShiftIncome(shift, incomeMode);
   }, 0);

   useEffect(() => {
      const load = async () => {
         try {
            const response = await fetchWithAuth("/shifts");
            if (response.ok) {
               const data = (await response.json()) as ShiftData[];
               const sorted = [...data].sort(
                  (a, b) =>
                     new Date(b.date).getTime() - new Date(a.date).getTime(),
               );
               setShifts(sorted);
            }
            const profileResponse = await fetchWithAuth("/auth/me");
            if (profileResponse.ok) {
               const profile =
                  (await profileResponse.json()) as ProfileSettings;
               setDailyTargetNet(profile.dailyTargetNet ?? null);
               setHasWeeklyPlan(Boolean(profile.hasWeeklyPlan));
            }
         } catch {
            // ignore for now
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, []);

   useEffect(() => {
      const latestBucket = chartBuckets[chartBuckets.length - 1];
      if (!latestBucket) {
         setSelectedBucketKey(null);
         return;
      }

      if (
         !selectedBucketKey ||
         !chartBuckets.some((item) => item.key === selectedBucketKey)
      ) {
         setSelectedBucketKey(latestBucket.key);
      }
   }, [chartBuckets, selectedBucketKey]);

   useEffect(() => {
      setStoredIncomeMode(incomeMode);
   }, [incomeMode]);

   return (
      <main className={styles.page}>
         <section className={styles.page__panel}>
            <header className={styles.page__header}>
               <div className={styles.page__titleRow}>
                  <h1 className={styles.page__title}>История смен</h1>
                  <label className={styles.page__incomeLabel}>
                     <span className={styles.page__incomeText}>Доход</span>
                     <select
                        className={styles.page__incomeSelect}
                        value={incomeMode}
                        onChange={(event) =>
                           setIncomeMode(event.target.value as IncomeMode)
                        }
                     >
                        <option value="gross">Общий доход</option>
                        <option value="net">Чистый доход</option>
                     </select>
                  </label>
               </div>
               <div className={styles.page__summary}>
                  <div className={styles.page__summaryRow}>
                     <span className={styles.page__summaryLabel}>
                        Итого за 7 дней
                     </span>
                     <span className={styles.page__summaryValue}>
                        {formatMoneyWhole(weeklyGrossIncome)} ₽
                     </span>
                  </div>
                  <div className={styles.page__summaryRow}>
                     <span className={styles.page__summaryLabel}>
                        Итого за 30 дней
                     </span>
                     <span className={styles.page__summaryValue}>
                        {formatMoneyWhole(lastThirtyGrossIncome)} ₽
                     </span>
                  </div>
                  <div className={styles.page__summaryRow}>
                     <span className={styles.page__summaryLabel}>
                        Итого за {monthLabel}
                     </span>
                     <span className={styles.page__summaryValue}>
                        {formatMoneyWhole(monthlyGrossIncome)} ₽
                     </span>
                  </div>
               </div>
            </header>
            {isLoading ? (
               <p className={styles.page__empty}>Загрузка...</p>
            ) : shifts.length === 0 ? (
               <p className={styles.page__empty}>Смен пока нет.</p>
            ) : (
               <>
                  <div className={styles.page__chartHeader}>
                     <span className={styles.page__chartTitle}>График</span>
                     <label className={styles.page__modeLabel}>
                        <span className={styles.page__modeText}>Период</span>
                        <select
                           className={styles.page__modeSelect}
                           value={periodMode}
                           onChange={(event) =>
                              setPeriodMode(event.target.value as PeriodMode)
                           }
                        >
                           <option value="day">По дням</option>
                           <option value="week">По неделям</option>
                           <option value="month">По месяцам</option>
                        </select>
                     </label>
                  </div>
                  <HistoryChart
                     points={chartPoints}
                     rangeLabel={`График: ${periodMode}`}
                     selectedKey={selectedBucket?.key ?? null}
                     onSelect={setSelectedBucketKey}
                     averageValue={averageGrossIncome}
                     targetValue={
                        periodMode === "day" ? targetDailyIncome : null
                     }
                     visibleColumns={periodMode === "day" ? 7 : 4}
                  />
                  {filteredShifts.length === 0 ? (
                     <p className={styles.page__empty}>
                        За выбранный период смен нет.
                     </p>
                  ) : (
                     <ShiftList shifts={filteredShifts} />
                  )}
               </>
            )}
         </section>
      </main>
   );
}
