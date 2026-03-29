import styles from "./ShiftResultModal.module.scss";
import type { WeeklyPlanModalState } from "./shiftResultModalState";

type ShiftResultModalProps = {
   state: WeeklyPlanModalState;
   onClose: () => void;
};

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

export function ShiftResultModal({ state, onClose }: ShiftResultModalProps) {
   const iconName =
      state.hasPlan && !state.isAheadOfPlan ? "cancel" : "check_circle";
   const todayDeltaPrefix = state.todayDelta && state.todayDelta > 0 ? "+" : "";
   const weekDeltaPrefix = state.delta && state.delta > 0 ? "+" : "";
   const weekValue = state.actualIncome ?? 0;
   const todayTargetValue = state.dailyTarget ?? 0;

   return (
      <div className={styles.modal} role="presentation" onClick={onClose}>
         <section
            className={styles.modal__dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-shift-result-title"
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

            <div
               className={`${styles.modal__iconWrap} ${
                  state.hasPlan && !state.isAheadOfPlan
                     ? styles["modal__iconWrap--negative"]
                     : ""
               }`}
            >
               <span
                  className={`material-symbols-outlined ${styles.modal__icon}`}
               >
                  {iconName}
               </span>
            </div>

            <div className={styles.modal__header}>
               {state.workedDays !== undefined &&
               state.workDaysPerWeek !== undefined ? (
                  <p className={styles.modal__topMeta}>
                     День {state.workedDays} из {state.workDaysPerWeek}
                  </p>
               ) : null}
               <h2
                  id="new-shift-result-title"
                  className={`${styles.modal__title} ${
                     state.hasPlan && !state.isAheadOfPlan
                        ? styles["modal__title--warning"]
                        : ""
                  }`}
               >
                  {state.title}
               </h2>
               {state.subtitle ? (
                  <p className={styles.modal__subtitle}>{state.subtitle}</p>
               ) : null}
               {state.weekLabel ? (
                  <p className={styles.modal__weekLabel}>
                     {state.weekLabel}
                  </p>
               ) : null}
            </div>

            {state.hasPlan &&
            state.actualIncome !== undefined &&
            state.expectedIncome !== undefined &&
            state.weeklyTarget !== undefined &&
            state.actualProgressPercent !== undefined &&
            state.expectedProgressPercent !== undefined ? (
               <>
                  <div className={styles.modal__progressBlock}>
                     {state.todayIncome !== undefined ? (
                        <div className={styles.modal__todayBlock}>
                           <strong className={styles.modal__todayValue}>
                              {formatMoneyWhole(state.todayIncome)} / {" "}
                              {formatMoneyWhole(todayTargetValue)} ₽
                           </strong>
                           {state.todayDelta !== undefined ? (
                              <span
                                 className={`${styles.modal__todayDelta} ${
                                    state.todayDelta >= 0
                                       ? styles["modal__todayDelta--positive"]
                                       : styles["modal__todayDelta--negative"]
                                 }`}
                              >
                                 {todayDeltaPrefix}
                                 {formatMoneyWhole(state.todayDelta)} ₽
                              </span>
                           ) : null}
                        </div>
                     ) : null}
                     <div className={styles.modal__progressHeader}>
                        <span className={styles.modal__progressValue}>
                           {formatMoneyWhole(weekValue)} / {" "}
                           {formatMoneyWhole(state.weeklyTarget)} ₽
                        </span>
                     </div>
                     <div className={styles.modal__progressTrack}>
                        <div
                           className={styles.modal__progressExpected}
                           style={{
                              width: `${state.expectedProgressPercent}%`,
                           }}
                        />
                        <div
                           className={styles.modal__progressActual}
                           style={{ width: `${state.actualProgressPercent}%` }}
                        />
                     </div>
                     <strong
                        className={`${styles.modal__delta} ${styles.modal__weekDelta} ${
                           state.isAheadOfPlan
                              ? styles["modal__delta--positive"]
                              : styles["modal__delta--negative"]
                        }`}
                     >
                        {weekDeltaPrefix}
                        {formatMoneyWhole(state.delta ?? 0)} ₽ к плану недели
                     </strong>
                  </div>
               </>
            ) : (
               <div className={styles.modal__fallback}>
                  <p className={styles.modal__fallbackText}>
                     Настройте недельный план в профиле, чтобы видеть сравнение
                     факта и нормы после каждой смены.
                  </p>
               </div>
            )}

            <button
               className={styles.modal__action}
               type="button"
               onClick={onClose}
            >
               Продолжить
            </button>
         </section>
      </div>
   );
}
