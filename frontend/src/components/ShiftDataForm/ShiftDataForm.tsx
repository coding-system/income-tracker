import { useEffect, useState } from "react";
import styles from "./ShiftDataForm.module.scss";

const toNumberArray = (values: string[]) =>
   values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .map((value) => Math.round(Number(value)))
      .filter((value) => Number.isFinite(value) && value >= 0);

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

export type ShiftFormData = {
   id?: string;
   date: string;
   incomeTotal: number;
   mileageKm: number;
   engineHours: number;
   tripsCount: number;
   fuelings?: number[];
   washes?: number[];
   snacks?: number[];
   others?: number[];
};

type ShiftDataFormProps = {
   initialData?: ShiftFormData | null;
   onSubmit: (payload: ShiftFormData) => Promise<void>;
   submitLabel?: string;
   title?: string;
   subtitle?: string;
   successMessage?: string;
};

const splitEngineHours = (value: number | null | undefined) => {
   if (!value || value <= 0) {
      return { hours: "", minutes: "" };
   }

   const totalMinutes = Math.round(value * 60);
   const hours = Math.floor(totalMinutes / 60);
   const minutes = totalMinutes % 60;
   return {
      hours: String(hours),
      minutes: String(minutes),
   };
};

export function ShiftDataForm({
   initialData,
   onSubmit,
   submitLabel = "Сохранить",
   title = "Новая смена",
   subtitle = "Заполните данные и сохраните смену.",
   successMessage = "Смена сохранена",
}: ShiftDataFormProps) {
   const today = new Date();
   const todayIso = toIsoDate(today);

   const [date, setDate] = useState(initialData?.date ?? todayIso);
   const [incomeTotal, setIncomeTotal] = useState(
      initialData ? String(initialData.incomeTotal) : "",
   );
   const [mileageKm, setMileageKm] = useState(
      initialData ? String(initialData.mileageKm) : "",
   );
   const initialEngine = splitEngineHours(initialData?.engineHours);
   const [engineHoursHours, setEngineHoursHours] = useState(
      initialEngine.hours,
   );
   const [engineHoursMinutes, setEngineHoursMinutes] = useState(
      initialEngine.minutes,
   );
   const [tripsCount, setTripsCount] = useState(
      initialData ? String(initialData.tripsCount) : "",
   );
   const [fuelings, setFuelings] = useState<string[]>(
      initialData?.fuelings?.map(String) ?? [],
   );
   const [washes, setWashes] = useState<string[]>(
      initialData?.washes?.map(String) ?? [],
   );
   const [snacks, setSnacks] = useState<string[]>(
      initialData?.snacks?.map(String) ?? [],
   );
   const [others, setOthers] = useState<string[]>(
      initialData?.others?.map(String) ?? [],
   );
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (!initialData) {
         return;
      }

      setDate(initialData.date);
      setIncomeTotal(String(initialData.incomeTotal));
      setMileageKm(String(initialData.mileageKm));
      setTripsCount(String(initialData.tripsCount));

      const nextEngine = splitEngineHours(initialData.engineHours);
      setEngineHoursHours(nextEngine.hours);
      setEngineHoursMinutes(nextEngine.minutes);

      setFuelings(initialData.fuelings?.map(String) ?? []);
      setWashes(initialData.washes?.map(String) ?? []);
      setSnacks(initialData.snacks?.map(String) ?? []);
      setOthers(initialData.others?.map(String) ?? []);
   }, [initialData]);

   const handleArrayChange = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      index: number,
      value: string,
   ) => {
      setter((prev) => prev.map((item, i) => (i === index ? value : item)));
   };

   const handleArrayAdd = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
   ) => {
      setter((prev) => ["", ...prev]);
   };

   const handleArrayRemove = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      index: number,
   ) => {
      setter((prev) => prev.filter((_, i) => i !== index));
   };

   const expenseTotal = (values: string[]) =>
      toNumberArray(values).reduce((sum, value) => sum + value, 0);

   const renderExpenseSection = (
      sectionTitle: string,
      values: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      keyPrefix: string,
   ) => (
      <section className={styles.expenseCard}>
         <header className={styles.expenseCard__header}>
            <div className={styles.expenseCard__headMain}>
               <h2 className={styles.expenseCard__title}>{sectionTitle}</h2>
               <div className={styles.expenseCard__meta}>
                  <span className={styles.expenseCard__badge}>
                     {values.length} поз.
                  </span>
                  <span
                     className={`${styles.expenseCard__badge} ${styles["expenseCard__badge--total"]}`}
                  >
                     {expenseTotal(values)} ₽
                  </span>
               </div>
            </div>
            <button
               className={styles.form__addButton}
               type="button"
               onClick={() => handleArrayAdd(setter)}
            >
               + Добавить
            </button>
         </header>

         {values.length > 0 ? (
            <div className={styles.expenseCard__list}>
               {values.map((value, index) => (
                  <div
                     className={styles.expenseCard__item}
                     key={`${keyPrefix}-${index}`}
                  >
                     <label
                        className={styles.expenseCard__itemLabel}
                        htmlFor={`${keyPrefix}-${index}`}
                     >
                        Позиция {index + 1}
                     </label>
                     <div className={styles.expenseCard__itemRow}>
                        <input
                           id={`${keyPrefix}-${index}`}
                           className={styles.form__input}
                           type="number"
                           min="0"
                           step="1"
                           placeholder="Сумма"
                           value={value}
                           onChange={(event) =>
                              handleArrayChange(
                                 setter,
                                 index,
                                 event.target.value,
                              )
                           }
                        />
                        <button
                           className={styles.form__removeButton}
                           type="button"
                           aria-label={`Удалить позицию ${index + 1}`}
                           onClick={() => handleArrayRemove(setter, index)}
                        >
                           <span
                              className={`material-symbols-outlined ${styles.form__removeIcon}`}
                           >
                              delete
                           </span>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <p className={styles.expenseCard__empty}>
               Пока пусто. Нажмите «Добавить», если были расходы.
            </p>
         )}
      </section>
   );

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setStatus(null);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         setStatus({ type: "error", text: "Сначала войдите в аккаунт" });
         return;
      }

      setIsLoading(true);
      try {
         const hoursValue = Number(engineHoursHours);
         const minutesValue = Number(engineHoursMinutes);

         if (
            !Number.isFinite(hoursValue) ||
            hoursValue < 1 ||
            hoursValue > 24
         ) {
            setStatus({ type: "error", text: "Часы должны быть от 1 до 24" });
            setIsLoading(false);
            return;
         }

         if (
            !Number.isFinite(minutesValue) ||
            minutesValue < 0 ||
            minutesValue > 59
         ) {
            setStatus({ type: "error", text: "Минуты должны быть от 0 до 59" });
            setIsLoading(false);
            return;
         }

         const incomeValue = Math.round(Number(incomeTotal));
         if (!Number.isFinite(incomeValue) || incomeValue <= 0) {
            setStatus({ type: "error", text: "Введите заработок больше 0" });
            setIsLoading(false);
            return;
         }

         const mileageValue = Math.round(Number(mileageKm));
         if (!Number.isFinite(mileageValue) || mileageValue <= 0) {
            setStatus({ type: "error", text: "Введите пробег больше 0" });
            setIsLoading(false);
            return;
         }

         const tripsValue = Math.round(Number(tripsCount));
         if (!Number.isFinite(tripsValue) || tripsValue <= 0) {
            setStatus({
               type: "error",
               text: "Введите количество поездок больше 0",
            });
            setIsLoading(false);
            return;
         }

         const engineHours = Number(
            (hoursValue + minutesValue / 60).toFixed(2),
         );
         const payload: ShiftFormData = {
            id: initialData?.id,
            date,
            incomeTotal: incomeValue,
            mileageKm: mileageValue,
            engineHours,
            tripsCount: tripsValue,
            fuelings: toNumberArray(fuelings),
            washes: toNumberArray(washes),
            snacks: toNumberArray(snacks),
            others: toNumberArray(others),
         };

         await onSubmit(payload);

         setStatus({ type: "success", text: successMessage });
         if (!initialData) {
            setDate(todayIso);
            setIncomeTotal("");
            setMileageKm("");
            setEngineHoursHours("");
            setEngineHoursMinutes("");
            setTripsCount("");
            setFuelings([]);
            setWashes([]);
            setSnacks([]);
            setOthers([]);
         }
      } catch (error) {
         const message =
            error instanceof Error ? error.message : "Ошибка сохранения";
         setStatus({ type: "error", text: message });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <section className={styles.panel}>
         <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
         </header>
         <form className={styles.form} onSubmit={handleSubmit}>
            {status ? (
               <div
                  className={`${styles.form__status} ${
                     status.type === "error"
                        ? styles["form__status--error"]
                        : styles["form__status--success"]
                  }`}
               >
                  {status.text}
               </div>
            ) : null}

            <div className={styles.form__grid}>
               <div
                  className={`${styles.form__field} ${styles["form__field--wide"]}`}
               >
                  <span className={styles.form__label}>Дата</span>
                  <input
                     id="shift-date"
                     className={styles.form__input}
                     type="date"
                     value={date}
                     max={todayIso}
                     onChange={(event) => setDate(event.target.value)}
                     required
                  />
               </div>

               <div
                  className={`${styles.form__field} ${styles["form__field--wide"]}`}
               >
                  <label className={styles.form__label} htmlFor="shift-income">
                     Заработали (₽)
                  </label>
                  <input
                     id="shift-income"
                     className={styles.form__input}
                     type="number"
                     min="1"
                     step="1"
                     value={incomeTotal}
                     onChange={(event) => setIncomeTotal(event.target.value)}
                     required
                  />
               </div>

               <div
                  className={`${styles.form__field} ${styles["form__field--compact"]}`}
               >
                  <label className={styles.form__label} htmlFor="shift-mileage">
                     Пробег (км)
                  </label>
                  <input
                     id="shift-mileage"
                     className={`${styles.form__input} ${styles["form__input--short"]}`}
                     type="number"
                     min="1"
                     step="1"
                     value={mileageKm}
                     onChange={(event) => setMileageKm(event.target.value)}
                     required
                  />
               </div>

               <div
                  className={`${styles.form__field} ${styles["form__field--compact"]}`}
               >
                  <label className={styles.form__label} htmlFor="shift-trips">
                     Поездки (шт)
                  </label>
                  <input
                     id="shift-trips"
                     className={`${styles.form__input} ${styles["form__input--short"]}`}
                     type="number"
                     min="1"
                     step="1"
                     value={tripsCount}
                     onChange={(event) => setTripsCount(event.target.value)}
                     required
                  />
               </div>

               <div
                  className={`${styles.form__field} ${styles["form__field--wide"]}`}
               >
                  <label className={styles.form__label} htmlFor="shift-hours">
                     Моточасы
                  </label>
                  <div className={styles.form__inlineInputs}>
                     <div className={styles.form__inlineField}>
                        <label
                           className={styles.form__inlineLabel}
                           htmlFor="shift-hours"
                        >
                           Часы
                        </label>
                        <input
                           id="shift-hours"
                           className={`${styles.form__input} ${styles["form__input--short"]}`}
                           type="number"
                           min="1"
                           max="24"
                           step="1"
                           value={engineHoursHours}
                           onChange={(event) =>
                              setEngineHoursHours(event.target.value)
                           }
                           required
                        />
                     </div>
                     <div className={styles.form__inlineField}>
                        <label
                           className={styles.form__inlineLabel}
                           htmlFor="shift-minutes"
                        >
                           Минуты
                        </label>
                        <input
                           id="shift-minutes"
                           className={`${styles.form__input} ${styles["form__input--short"]}`}
                           type="number"
                           min="0"
                           max="59"
                           step="1"
                           value={engineHoursMinutes}
                           onChange={(event) =>
                              setEngineHoursMinutes(event.target.value)
                           }
                           required
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className={styles.expenseGrid}>
               {renderExpenseSection(
                  "Заправки",
                  fuelings,
                  setFuelings,
                  "fueling",
               )}
               {renderExpenseSection("Мойки", washes, setWashes, "wash")}
               {renderExpenseSection("Перекусы", snacks, setSnacks, "snack")}
               {renderExpenseSection("Другое", others, setOthers, "other")}
            </div>

            <button
               className={styles.form__submit}
               type="submit"
               disabled={isLoading}
            >
               {isLoading ? "Сохранение..." : submitLabel}
            </button>
         </form>
      </section>
   );
}
