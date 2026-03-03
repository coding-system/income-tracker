import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { HistoryChart } from "../../components/HistoryChart/HistoryChart";
import { ShiftList } from "../../components/ShiftList/ShiftList";
import styles from "./HistoryPage.module.scss";

type PeriodMode = "day" | "week" | "month";
type IncomeMode = "gross" | "net";

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

const buildLastDays = (count: number) => {
   const days: string[] = [];
   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const toLocalIso = (value: Date) => {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
   };

   for (let offset = count - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      days.push(toLocalIso(date));
   }

   return days;
};

export function HistoryPage() {
   const [shifts, setShifts] = useState<ShiftData[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [periodMode, setPeriodMode] = useState<PeriodMode>("day");
   const [incomeMode, setIncomeMode] = useState<IncomeMode>("gross");
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
      const result: ChartBucket[] = [];

      for (let index = 6; index >= 0; index -= 1) {
         const date = new Date(now);
         date.setDate(now.getDate() - index);
         const dayStart = startOfDay(date);
         const dayEnd = endOfDay(date);
         const value = shiftsWithDate.reduce((sum, shift) => {
            return isInPeriod(shift.parsedDate, dayStart, dayEnd)
               ? sum + getShiftIncome(shift, incomeMode)
               : sum;
         }, 0);

         result.push({
            key: `day-${toIsoDate(dayStart)}`,
            label: formatDayLabel(dayStart),
            value,
            start: dayStart,
            end: dayEnd,
         });
      }

      return result;
   };

   const buildWeekBuckets = () => {
      const now = new Date();
      const currentWeekStart = startOfWeekMonday(now);
      const result: ChartBucket[] = [];

      for (let index = 3; index >= 0; index -= 1) {
         const weekStart = new Date(currentWeekStart);
         weekStart.setDate(currentWeekStart.getDate() - index * 7);
         const weekEnd = endOfWeekMonday(weekStart);
         const value = shiftsWithDate.reduce((sum, shift) => {
            return isInPeriod(shift.parsedDate, weekStart, weekEnd)
               ? sum + getShiftIncome(shift, incomeMode)
               : sum;
         }, 0);

         result.push({
            key: `week-${toIsoDate(weekStart)}`,
            label: formatWeekLabel(weekStart, weekEnd),
            value,
            start: weekStart,
            end: weekEnd,
         });
      }

      return result;
   };

   const buildMonthBuckets = () => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const result: ChartBucket[] = [];

      for (let index = 3; index >= 0; index -= 1) {
         const monthStart = new Date(currentMonthStart);
         monthStart.setMonth(currentMonthStart.getMonth() - index);
         const periodStart = startOfMonth(monthStart);
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
            start: periodStart,
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
           .map((shift) => {
              const { parsedDate: _parsedDate, ...rest } = shift;
              return rest;
           })
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
   }, [periodMode, shifts.length]);

   return (
      <main className={styles.page}>
         <section className={styles.page__panel}>
            <header className={styles.page__header}>
               <div className={styles.page__titleRow}>
                  <h1 className={styles.page__title}>История смен</h1>
                  <label className={styles.page__incomeLabel}>
                     <span className={styles.page__incomeText}>Показывать</span>
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
