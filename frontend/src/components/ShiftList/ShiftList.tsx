import { ShiftCard } from "../ShiftCard/ShiftCard";
import styles from "./ShiftList.module.scss";

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

type ShiftListProps = {
   shifts: ShiftData[];
};

export function ShiftList({ shifts }: ShiftListProps) {
   return (
      <section className={styles.list}>
         <div className={styles.header}>
            <span className={styles.header__cell}>Дата</span>
            <span className={styles.header__cell}>Чистыми</span>
            <span className={styles.header__cell}>Доход в час</span>
         </div>
         {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
         ))}
      </section>
   );
}
