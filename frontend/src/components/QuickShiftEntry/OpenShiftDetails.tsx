import type { OpenShiftDraft } from "../../utils/openShiftDraft";
import styles from "./OpenShiftDetails.module.scss";

type OpenShiftDetailsProps = {
   draft: OpenShiftDraft;
   isLoading: boolean;
   status: { type: "error" | "success"; text: string } | null;
   onCloseShift: () => void;
   onDiscard: () => void;
};

const sum = (values: number[]) => values.reduce((total, item) => total + item, 0);

const formatHours = (value: number) => {
   const totalMinutes = Math.round(value * 60);
   const hours = Math.floor(totalMinutes / 60);
   const minutes = totalMinutes % 60;
   return `${hours}:${String(minutes).padStart(2, "0")}`;
};

export function OpenShiftDetails({
   draft,
   isLoading,
   status,
   onCloseShift,
   onDiscard,
}: OpenShiftDetailsProps) {
   const fuelingsTotal = sum(draft.fuelings);
   const washesTotal = sum(draft.washes);
   const snacksTotal = sum(draft.snacks);
   const othersTotal = sum(draft.others);

   return (
      <section className={styles.details}>
         <div className={styles.details__chips}>
            <span
               className={`${styles.details__chip} ${styles["details__chip--income"]}`}
            >
               Доход: {draft.incomeTotal ?? "—"} ₽
            </span>
            <span
               className={`${styles.details__chip} ${styles["details__chip--mileage"]}`}
            >
               Пробег: {draft.mileageKm ?? "—"} км
            </span>
            <span className={styles.details__chip}>
               Поездки: {draft.tripsCount ?? "—"}
            </span>
            <span
               className={`${styles.details__chip} ${styles["details__chip--hours"]}`}
            >
               Часы:{" "}
               {draft.engineHours !== undefined
                  ? formatHours(draft.engineHours)
                  : "—"}
            </span>
            {fuelingsTotal > 0 ? (
               <span
                  className={`${styles.details__chip} ${styles["details__chip--fuel"]}`}
               >
                  Заправки: {fuelingsTotal} ₽
               </span>
            ) : null}
            {washesTotal > 0 ? (
               <span className={styles.details__chip}>
                  Мойки: {washesTotal} ₽
               </span>
            ) : null}
            {snacksTotal > 0 ? (
               <span
                  className={`${styles.details__chip} ${styles["details__chip--snack"]}`}
               >
                  Перекусы: {snacksTotal} ₽
               </span>
            ) : null}
            {othersTotal > 0 ? (
               <span className={styles.details__chip}>
                  Другое: {othersTotal} ₽
               </span>
            ) : null}
         </div>

         {status ? (
            <p
               className={`${styles.details__status} ${
                  status.type === "error"
                     ? styles["details__status--error"]
                     : styles["details__status--success"]
               }`}
            >
               {status.text}
            </p>
         ) : null}

         <div className={styles.details__actions}>
            <button
               className={styles.details__primary}
               type="button"
               onClick={onCloseShift}
               disabled={isLoading}
            >
               {isLoading ? "Сохранение..." : "Закрыть смену"}
            </button>
            <button
               className={styles.details__danger}
               type="button"
               onClick={onDiscard}
               disabled={isLoading}
            >
               Удалить черновик
            </button>
         </div>
      </section>
   );
}
