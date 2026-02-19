import { Link } from "react-router-dom";
import styles from "./ShiftDetails.module.scss";

type ShiftCost = {
   costTotal: number;
};

type ShiftDetailsData = {
   id: string;
   date: string;
   incomeTotal: number;
   engineHours: number | null;
   mileageKm: number | null;
   tripsCount: number | null;
   fuelings?: ShiftCost[];
   washes?: ShiftCost[];
   snacks?: ShiftCost[];
   others?: ShiftCost[];
};

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

const formatDateLong = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   return parsed.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
   });
};

const sumCosts = (items?: ShiftCost[]) =>
   items?.reduce((sum, item) => sum + item.costTotal, 0) ?? 0;

const formatEngineHours = (value: number | null) => {
   if (!value || value <= 0) {
      return "0 ч 0 мин";
   }

   const totalMinutes = Math.round(value * 60);
   const hours = Math.floor(totalMinutes / 60);
   const minutes = totalMinutes % 60;
   return `${hours} ч ${minutes} мин`;
};

export function ShiftDetails({
   shift,
   onDelete,
   isDeleting = false,
}: {
   shift: ShiftDetailsData;
   onDelete?: () => void;
   isDeleting?: boolean;
}) {
   const fuelTotal = sumCosts(shift.fuelings);
   const washTotal = sumCosts(shift.washes);
   const snackTotal = sumCosts(shift.snacks);
   const otherTotal = sumCosts(shift.others);
   const totalCosts = fuelTotal + washTotal + snackTotal + otherTotal;
   const grossIncome = shift.incomeTotal;
   const netIncome = Math.max(0, grossIncome - totalCosts);
   const incomePerHour =
      shift.engineHours && shift.engineHours > 0
         ? grossIncome / shift.engineHours
         : 0;

   return (
      <section className={styles.details}>
         <header className={styles.details__header}>
            <h1 className={styles.details__title}>
               {formatDateLong(shift.date)}
            </h1>
            <div className={styles.details__actions}>
               <Link
                  className={styles.details__editButton}
                  to={`/shift/${shift.id}/edit`}
                  aria-label="Редактировать смену"
               >
                  <span
                     className={`material-symbols-outlined ${styles.details__editIcon}`}
                  >
                     edit
                  </span>
               </Link>
               {onDelete ? (
                  <button
                     className={styles.details__deleteButton}
                     type="button"
                     onClick={onDelete}
                     aria-label="Удалить смену"
                     disabled={isDeleting}
                  >
                     <span
                        className={`material-symbols-outlined ${styles.details__deleteIcon}`}
                     >
                        delete
                     </span>
                  </button>
               ) : null}
            </div>
         </header>

         <div className={styles.details__grid}>
            <div className={styles.details__card}>
               <p className={styles.details__label}>Общий доход</p>
               <p className={styles.details__value}>
                  {formatMoneyWhole(grossIncome)} ₽
               </p>
            </div>
            <div className={styles.details__card}>
               <p className={styles.details__label}>Моточасы</p>
               <p className={styles.details__value}>
                  {formatEngineHours(shift.engineHours)}
               </p>
            </div>
            <div className={styles.details__card}>
               <p className={styles.details__label}>Чистыми</p>
               <p className={styles.details__value}>
                  {formatMoneyWhole(netIncome)} ₽
               </p>
            </div>

            <div className={styles.details__card}>
               <p className={styles.details__label}>Пробег</p>
               <p className={styles.details__value}>
                  {shift.mileageKm ?? 0} км
               </p>
            </div>
            <div className={styles.details__card}>
               <p className={styles.details__label}>Доход в час</p>
               <p className={styles.details__value}>
                  {formatMoneyWhole(incomePerHour)} ₽
               </p>
            </div>
            <div className={styles.details__card}>
               <p className={styles.details__label}>Поездки</p>
               <p className={styles.details__value}>{shift.tripsCount ?? 0}</p>
            </div>
         </div>

         <section className={styles.details__expenses}>
            <h2 className={styles.details__subtitle}>Расходы</h2>
            <div className={styles.details__expenseGrid}>
               <div className={styles.details__expenseItem}>
                  <p className={styles.details__label}>Заправка</p>
                  <p className={styles.details__value}>
                     <span
                        className={`material-symbols-outlined ${styles.details__icon}`}
                     >
                        local_gas_station
                     </span>
                     {formatMoneyWhole(fuelTotal)} ₽
                  </p>
               </div>
               <div className={styles.details__expenseItem}>
                  <p className={styles.details__label}>Мойка</p>
                  <p className={styles.details__value}>
                     <span
                        className={`material-symbols-outlined ${styles.details__icon}`}
                     >
                        local_car_wash
                     </span>
                     {formatMoneyWhole(washTotal)} ₽
                  </p>
               </div>
               <div className={styles.details__expenseItem}>
                  <p className={styles.details__label}>Еда</p>
                  <p className={styles.details__value}>
                     <span
                        className={`material-symbols-outlined ${styles.details__icon}`}
                     >
                        local_dining
                     </span>
                     {formatMoneyWhole(snackTotal)} ₽
                  </p>
               </div>
               <div className={styles.details__expenseItem}>
                  <p className={styles.details__label}>Другое</p>
                  <p className={styles.details__value}>
                     <span
                        className={`material-symbols-outlined ${styles.details__icon}`}
                     >
                        store
                     </span>
                     {formatMoneyWhole(otherTotal)} ₽
                  </p>
               </div>
            </div>
         </section>
      </section>
   );
}
