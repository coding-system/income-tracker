import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
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

export function HistoryPage() {
   const [shifts, setShifts] = useState<ShiftData[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const weeklyNetIncome = shifts.reduce((total, shift) => {
      const shiftDate = parseDateLocal(shift.date);
      if (!shiftDate || !isWithinLastSevenDays(shiftDate)) {
         return total;
      }

      const fuelTotal =
         shift.fuelings?.reduce((sum, item) => sum + item.costTotal, 0) ?? 0;
      const netIncome = Math.max(0, shift.incomeTotal - fuelTotal);
      return total + netIncome;
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
                  <span className={styles.page__summaryLabel}>
                     Итого за 7 дней
                  </span>
                  <span className={styles.page__summaryValue}>
                     {formatMoneyWhole(weeklyNetIncome)} ₽
                  </span>
               </div>
            </header>
            {isLoading ? (
               <p className={styles.page__empty}>Загрузка...</p>
            ) : shifts.length === 0 ? (
               <p className={styles.page__empty}>Смен пока нет.</p>
            ) : (
               <ShiftList shifts={shifts} />
            )}
         </section>
      </main>
   );
}
