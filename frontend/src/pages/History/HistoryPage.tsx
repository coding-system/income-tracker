import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { HistoryChart } from "../../components/HistoryChart/HistoryChart";
import { ShiftList } from "../../components/ShiftList/ShiftList";
import styles from "./HistoryPage.module.scss";

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

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

const parseDateLocal = (value: string) => {
   const parts = value.split("-").map(Number);
   if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) {
      return null;
   }

   const [year, month, day] = parts;
   return new Date(year, month - 1, day);
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
   const [rangeDays, setRangeDays] = useState<7 | 15 | 30>(15);
   const [dailyTargetNet, setDailyTargetNet] = useState<number | null>(null);
   const [hasWeeklyPlan, setHasWeeklyPlan] = useState(false);

   const grossIncomeByDate = shifts.reduce<Record<string, number>>(
      (acc, shift) => {
         acc[shift.date] = (acc[shift.date] ?? 0) + shift.incomeTotal;
         return acc;
      },
      {},
   );

   const lastDays = buildLastDays(rangeDays);
   const chartPoints = lastDays.map((date) => ({
      date,
      value: grossIncomeByDate[date] ?? 0,
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

   const weeklyGrossIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate || !isWithinLastSevenDays(shiftDate)) {
         return total;
      }

      return total + shift.incomeTotal;
   }, 0);

   const lastThirtyGrossIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate || !isWithinLastDays(shiftDate, 30)) {
         return total;
      }

      return total + shift.incomeTotal;
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

      return total + shift.incomeTotal;
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

   return (
      <main className={styles.page}>
         <section className={styles.page__panel}>
            <header className={styles.page__header}>
               <h1 className={styles.page__title}>История смен</h1>
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
                     <div className={styles.page__chartToggle}>
                        <button
                           className={`${styles.page__chartButton} ${
                              rangeDays === 7
                                 ? styles["page__chartButton--active"]
                                 : ""
                           }`}
                           type="button"
                           onClick={() => setRangeDays(7)}
                        >
                           7 дней
                        </button>
                        <button
                           className={`${styles.page__chartButton} ${
                              rangeDays === 15
                                 ? styles["page__chartButton--active"]
                                 : ""
                           }`}
                           type="button"
                           onClick={() => setRangeDays(15)}
                        >
                           15 дней
                        </button>
                        <button
                           className={`${styles.page__chartButton} ${
                              rangeDays === 30
                                 ? styles["page__chartButton--active"]
                                 : ""
                           }`}
                           type="button"
                           onClick={() => setRangeDays(30)}
                        >
                           30 дней
                        </button>
                     </div>
                  </div>
                  <HistoryChart
                     points={chartPoints}
                     rangeLabel={`График за ${rangeDays} дней`}
                     averageValue={averageGrossIncome}
                     targetValue={targetDailyIncome}
                  />
                  <ShiftList shifts={shifts} />
               </>
            )}
         </section>
      </main>
   );
}
