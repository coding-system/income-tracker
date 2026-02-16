import type { CSSProperties } from "react";
import styles from "./ShiftCard.module.scss";

type ShiftCost = {
   costTotal: number;
};

type ShiftData = {
   id: string;
   date: string;
   incomeTotal: number;
   engineHours: number | null;
   fuelings?: ShiftCost[];
};

const formatDate = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   return parsed.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
   });
};

const formatMoney = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
   }).format(value);

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

export function ShiftCard({ shift }: { shift: ShiftData }) {
   const fuelTotal =
      shift.fuelings?.reduce((sum, item) => sum + item.costTotal, 0) ?? 0;
   const netIncome = Math.max(0, shift.incomeTotal - fuelTotal);
   const incomePerHour =
      shift.engineHours && shift.engineHours > 0
         ? netIncome / shift.engineHours
         : 0;
   const minIncomePerHour = 500;
   const maxIncomePerHour = 1500;
   const normalized =
      (incomePerHour - minIncomePerHour) /
      (maxIncomePerHour - minIncomePerHour);
   const barPercent = Math.min(Math.max(normalized, 0), 1) * 100;
   const barStyle = { "--bar-width": `${barPercent}%` } as CSSProperties;

   return (
      <article className={styles.card}>
         <div className={styles.card__cell}>{formatDate(shift.date)}</div>
         <div className={styles.card__cell}>{formatMoney(netIncome)} ₽</div>
         <div
            className={`${styles.card__cell} ${styles["card__cell--income"]}`}
         >
            <span>{formatMoneyWhole(incomePerHour)} ₽</span>
            <span className={styles.card__bar} style={barStyle}>
               <span className={styles.card__barFill} />
            </span>
         </div>
      </article>
   );
}
