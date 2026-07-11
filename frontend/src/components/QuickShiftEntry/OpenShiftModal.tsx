import type { OpenShiftDraft } from "../../utils/openShiftDraft";
import styles from "./OpenShiftModal.module.scss";

type OpenShiftModalProps = {
   draft: OpenShiftDraft;
   isLoading: boolean;
   status: { type: "error" | "success"; text: string } | null;
   onClose: () => void;
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

const formatDateRu = (isoDate: string) => {
   const [year, month, day] = isoDate.split("-").map(Number);
   const value = new Date(year, month - 1, day);
   return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
   }).format(value);
};

const renderExpenseRow = (label: string, values: number[]) => {
   if (values.length === 0) {
      return null;
   }

   return (
      <div className={styles.modal__row}>
         <span className={styles.modal__label}>{label}</span>
         <span className={styles.modal__value}>
            {values.join(" + ")} = {sum(values)} ₽
         </span>
      </div>
   );
};

export function OpenShiftModal({
   draft,
   isLoading,
   status,
   onClose,
   onCloseShift,
   onDiscard,
}: OpenShiftModalProps) {
   const expensesTotal =
      sum(draft.fuelings) + sum(draft.washes) + sum(draft.snacks) + sum(draft.others);

   return (
      <div className={styles.modal} role="presentation" onClick={onClose}>
         <section
            className={styles.modal__dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="open-shift-modal-title"
            onClick={(event) => event.stopPropagation()}
         >
            <button
               className={styles.modal__close}
               type="button"
               aria-label="Закрыть окно"
               onClick={onClose}
            >
               <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="open-shift-modal-title" className={styles.modal__title}>
               Открытая смена
            </h2>
            <p className={styles.modal__date}>{formatDateRu(draft.date)}</p>

            <div className={styles.modal__section}>
               <div className={styles.modal__row}>
                  <span className={styles.modal__label}>Доход</span>
                  <span className={styles.modal__value}>
                     {draft.incomeTotal ?? "—"} ₽
                  </span>
               </div>
               <div className={styles.modal__row}>
                  <span className={styles.modal__label}>Пробег</span>
                  <span className={styles.modal__value}>
                     {draft.mileageKm ?? "—"} км
                  </span>
               </div>
               <div className={styles.modal__row}>
                  <span className={styles.modal__label}>Поездки</span>
                  <span className={styles.modal__value}>
                     {draft.tripsCount ?? "—"}
                  </span>
               </div>
               <div className={styles.modal__row}>
                  <span className={styles.modal__label}>Часы</span>
                  <span className={styles.modal__value}>
                     {draft.engineHours !== undefined
                        ? formatHours(draft.engineHours)
                        : "—"}
                  </span>
               </div>
            </div>

            {expensesTotal > 0 ? (
               <div className={styles.modal__section}>
                  {renderExpenseRow("Заправки", draft.fuelings)}
                  {renderExpenseRow("Мойки", draft.washes)}
                  {renderExpenseRow("Еда", draft.snacks)}
                  {renderExpenseRow("Другое", draft.others)}
                  <div
                     className={`${styles.modal__row} ${styles["modal__row--strong"]}`}
                  >
                     <span className={styles.modal__label}>Итого расходов</span>
                     <span className={styles.modal__value}>
                        {expensesTotal} ₽
                     </span>
                  </div>
               </div>
            ) : null}

            {status ? (
               <p
                  className={`${styles.modal__status} ${
                     status.type === "error"
                        ? styles["modal__status--error"]
                        : styles["modal__status--success"]
                  }`}
               >
                  {status.text}
               </p>
            ) : null}

            <div className={styles.modal__actions}>
               <button
                  className={styles.modal__primary}
                  type="button"
                  onClick={onCloseShift}
                  disabled={isLoading}
               >
                  {isLoading ? "Сохранение..." : "Закрыть смену"}
               </button>
               <button
                  className={styles.modal__danger}
                  type="button"
                  onClick={onDiscard}
                  disabled={isLoading}
               >
                  Удалить черновик
               </button>
            </div>
         </section>
      </div>
   );
}
