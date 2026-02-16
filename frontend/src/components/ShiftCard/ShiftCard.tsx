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
   const baseIncomePerHour = 1000;
   const maxIncomePerHour = 1500;
   const halfRange = maxIncomePerHour - baseIncomePerHour;
   const clampedIncome = Math.min(
      Math.max(incomePerHour, minIncomePerHour),
      maxIncomePerHour,
   );
   const delta = (clampedIncome - baseIncomePerHour) / halfRange;
   const barWidth = Math.abs(delta) * 50;
   const barStart = delta >= 0 ? 50 : 50 - barWidth;

   let red = 255;
   let green = 0;
   let blue = 0;

   if (clampedIncome <= baseIncomePerHour) {
      const t =
         (clampedIncome - minIncomePerHour) /
         (baseIncomePerHour - minIncomePerHour);
      red = Math.round(255 * (1 - t));
      green = Math.round(255 * t);
      blue = 0;
   } else {
      const t =
         (clampedIncome - baseIncomePerHour) /
         (maxIncomePerHour - baseIncomePerHour);
      red = 0;
      green = 255;
      blue = Math.round(255 * t);
   }

   const barStyle = {
      "--bar-start": `${barStart}%`,
      "--bar-width": `${barWidth}%`,
      "--bar-red": red,
      "--bar-green": green,
      "--bar-blue": blue,
   } as CSSProperties;

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
