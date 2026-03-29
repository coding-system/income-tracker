import { useEffect, useState } from "react";
import styles from "./ShiftDataForm.module.scss";

const toNumberArray = (values: string[]) =>
   values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .map((value) => Math.round(Number(value)))
      .filter((value) => Number.isFinite(value) && value >= 0);

const toDigitsOnly = (value: string) => value.replace(/\D+/g, "");

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const formatDateRu = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   }).format(parsed);
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
   onSuccess?: (payload: ShiftFormData) => Promise<void> | void;
   showSuccessStatus?: boolean;
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
   onSuccess,
   showSuccessStatus = true,
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
   const [step, setStep] = useState(0);

   const steps = [
      {
         title: "Дата смены",
         hint: "Выберите день, за который сохраняете данные.",
      },
      { title: "Заработок", hint: "Укажите общий заработок за смену." },
      {
         title: "Пробег и поездки",
         hint: "Добавьте километры и количество заказов.",
      },
      { title: "Моточасы", hint: "Введите часы и минуты работы." },
      { title: "Расходы", hint: "Заполните категории расходов." },
      {
         title: "Итог",
         hint: "Проверьте данные перед сохранением смены.",
      },
   ];

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

   useEffect(() => {
      if (!status || status.type !== "error") {
         return;
      }

      const timeoutId = window.setTimeout(() => {
         setStatus((current) =>
            current && current.type === "error" ? null : current,
         );
      }, 3000);

      return () => {
         window.clearTimeout(timeoutId);
      };
   }, [status]);

   const handleArrayChange = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      index: number,
      value: string,
   ) => {
      const sanitized = toDigitsOnly(value);
      setter((prev) => prev.map((item, i) => (i === index ? sanitized : item)));
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

   const fuelingsTotal = expenseTotal(fuelings);
   const washesTotal = expenseTotal(washes);
   const snacksTotal = expenseTotal(snacks);
   const othersTotal = expenseTotal(others);
   const totalExpenses =
      fuelingsTotal + washesTotal + snacksTotal + othersTotal;
   const incomeValue = Math.round(Number(incomeTotal));
   const netIncome =
      Number.isFinite(incomeValue) && incomeValue > 0
         ? incomeValue - totalExpenses
         : null;

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
                           type="text"
                           inputMode="numeric"
                           pattern="[0-9]*"
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

   const validateStep = (stepToValidate: number) => {
      if (stepToValidate === 0) {
         if (!date) {
            setStatus({ type: "error", text: "Выберите дату смены" });
            return false;
         }
         return true;
      }

      if (stepToValidate === 1) {
         const incomeValue = Math.round(Number(incomeTotal));
         if (!Number.isFinite(incomeValue) || incomeValue <= 0) {
            setStatus({ type: "error", text: "Введите заработок больше 0" });
            return false;
         }
         return true;
      }

      if (stepToValidate === 2) {
         const mileageValue = Math.round(Number(mileageKm));
         if (!Number.isFinite(mileageValue) || mileageValue <= 0) {
            setStatus({ type: "error", text: "Введите пробег больше 0" });
            return false;
         }

         const tripsValue = Math.round(Number(tripsCount));
         if (!Number.isFinite(tripsValue) || tripsValue <= 0) {
            setStatus({
               type: "error",
               text: "Введите количество поездок больше 0",
            });
            return false;
         }

         return true;
      }

      if (stepToValidate === 3) {
         const hoursValue = Number(engineHoursHours);
         const minutesValue = Number(engineHoursMinutes);

         if (
            !Number.isFinite(hoursValue) ||
            hoursValue < 1 ||
            hoursValue > 24
         ) {
            setStatus({ type: "error", text: "Часы должны быть от 1 до 24" });
            return false;
         }

         if (
            !Number.isFinite(minutesValue) ||
            minutesValue < 0 ||
            minutesValue > 59
         ) {
            setStatus({ type: "error", text: "Минуты должны быть от 0 до 59" });
            return false;
         }

         return true;
      }

      return true;
   };

   const handleNextStep = () => {
      setStatus(null);
      if (!validateStep(step)) {
         return;
      }

      const nextStep = Math.min(step + 1, steps.length - 1);
      setStep(nextStep);
   };

   const handlePrevStep = () => {
      setStatus(null);
      const prevStep = Math.max(step - 1, 0);
      setStep(prevStep);
   };

   const handleSubmit = async () => {
      setStatus(null);

      if (step !== steps.length - 1) {
         return;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         setStatus({ type: "error", text: "Сначала войдите в аккаунт" });
         return;
      }

      if (
         !validateStep(0) ||
         !validateStep(1) ||
         !validateStep(2) ||
         !validateStep(3)
      ) {
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
         await onSuccess?.(payload);

         if (showSuccessStatus) {
            setStatus({ type: "success", text: successMessage });
         }

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
            setStep(0);
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

         <form
            className={styles.form}
            onSubmit={(event) => {
               event.preventDefault();
            }}
         >
            <div className={styles.wizard__progress}>
               {steps.map((item, index) => (
                  <button
                     key={item.title}
                     type="button"
                     className={`${styles.wizard__dot} ${
                        index <= step ? styles["wizard__dot--active"] : ""
                     }`}
                     onClick={() => {
                        if (index < step) {
                           setStatus(null);
                           setStep(index);
                        }
                     }}
                     aria-label={`Шаг ${index + 1}: ${item.title}`}
                  />
               ))}
            </div>
            <div className={styles.wizard__footer}>
               <div className={styles.wizard__actions}>
                  <button
                     className={`${styles.wizard__button} ${styles["wizard__button--ghost"]}`}
                     type="button"
                     onClick={handlePrevStep}
                     disabled={step === 0 || isLoading}
                  >
                     Назад
                  </button>

                  {step < steps.length - 1 ? (
                     <button
                        className={styles.wizard__button}
                        type="button"
                        onClick={handleNextStep}
                        disabled={isLoading}
                     >
                        Продолжить
                     </button>
                  ) : (
                     <button
                        className={styles.form__submit}
                        type="button"
                        onClick={() => {
                           void handleSubmit();
                        }}
                        disabled={isLoading}
                     >
                        {isLoading ? "Сохранение..." : submitLabel}
                     </button>
                  )}
               </div>

               <div
                  className={`${styles.wizard__statusPanel} ${
                     status ? styles["wizard__statusPanel--visible"] : ""
                  } ${
                     status?.type === "error"
                        ? styles["wizard__statusPanel--error"]
                        : styles["wizard__statusPanel--success"]
                  }`}
               >
                  <span className={styles.wizard__statusText}>
                     {status?.text ?? ""}
                  </span>

                  {status?.type === "success" ? (
                     <button
                        className={styles.wizard__button}
                        type="button"
                        onClick={() => setStatus(null)}
                     >
                        Продолжить
                     </button>
                  ) : null}
               </div>
            </div>

            <div className={styles.wizard__card}>
               <div className={styles.wizard__meta}>
                  <span className={styles.wizard__stepLabel}>
                     Шаг {step + 1} из {steps.length}
                  </span>
                  <h2 className={styles.wizard__stepTitle}>
                     {steps[step].title}
                  </h2>
                  <p className={styles.wizard__stepHint}>{steps[step].hint}</p>
               </div>

               <div key={step} className={styles.wizard__stage}>
                  {step === 0 ? (
                     <div className={styles.form__field}>
                        <label
                           className={styles.form__label}
                           htmlFor="shift-date"
                        >
                           Дата
                        </label>
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
                  ) : null}

                  {step === 1 ? (
                     <div className={styles.form__field}>
                        <label
                           className={styles.form__label}
                           htmlFor="shift-income"
                        >
                           Заработали (₽)
                        </label>
                        <input
                           id="shift-income"
                           className={styles.form__input}
                           type="text"
                           inputMode="numeric"
                           pattern="[0-9]*"
                           placeholder="Например, 4800"
                           value={incomeTotal}
                           onChange={(event) =>
                              setIncomeTotal(toDigitsOnly(event.target.value))
                           }
                           required
                        />
                     </div>
                  ) : null}

                  {step === 2 ? (
                     <div className={styles.form__grid}>
                        <div className={styles.form__field}>
                           <label
                              className={styles.form__label}
                              htmlFor="shift-mileage"
                           >
                              Пробег (км)
                           </label>
                           <input
                              id="shift-mileage"
                              className={styles.form__input}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Например, 180"
                              value={mileageKm}
                              onChange={(event) =>
                                 setMileageKm(toDigitsOnly(event.target.value))
                              }
                              required
                           />
                        </div>

                        <div className={styles.form__field}>
                           <label
                              className={styles.form__label}
                              htmlFor="shift-trips"
                           >
                              Поездки (шт)
                           </label>
                           <input
                              id="shift-trips"
                              className={styles.form__input}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Например, 14"
                              value={tripsCount}
                              onChange={(event) =>
                                 setTripsCount(toDigitsOnly(event.target.value))
                              }
                              required
                           />
                        </div>
                     </div>
                  ) : null}

                  {step === 3 ? (
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
                              className={styles.form__input}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="1-24"
                              value={engineHoursHours}
                              onChange={(event) =>
                                 setEngineHoursHours(
                                    toDigitsOnly(event.target.value),
                                 )
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
                              className={styles.form__input}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="0-59"
                              value={engineHoursMinutes}
                              onChange={(event) =>
                                 setEngineHoursMinutes(
                                    toDigitsOnly(event.target.value),
                                 )
                              }
                              required
                           />
                        </div>
                     </div>
                  ) : null}

                  {step === 4 ? (
                     <div className={styles.expenseGrid}>
                        {renderExpenseSection(
                           "Заправки",
                           fuelings,
                           setFuelings,
                           "fueling",
                        )}
                        {renderExpenseSection(
                           "Мойки",
                           washes,
                           setWashes,
                           "wash",
                        )}
                        {renderExpenseSection(
                           "Перекусы",
                           snacks,
                           setSnacks,
                           "snack",
                        )}
                        {renderExpenseSection(
                           "Другое",
                           others,
                           setOthers,
                           "other",
                        )}
                     </div>
                  ) : null}

                  {step === 5 ? (
                     <div className={styles.summary}>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Дата</span>
                           <span className={styles.summary__value}>
                              {formatDateRu(date)}
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>
                              Заработок
                           </span>
                           <span className={styles.summary__value}>
                              {incomeTotal || "0"} ₽
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Пробег</span>
                           <span className={styles.summary__value}>
                              {mileageKm || "0"} км
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>
                              Поездки
                           </span>
                           <span className={styles.summary__value}>
                              {tripsCount || "0"} шт
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>
                              Моточасы
                           </span>
                           <span className={styles.summary__value}>
                              {engineHoursHours || "0"} ч{" "}
                              {engineHoursMinutes || "0"} мин
                           </span>
                        </div>

                        <div className={styles.summary__divider} />

                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>
                              Заправки
                           </span>
                           <span className={styles.summary__value}>
                              {fuelingsTotal} ₽
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Мойки</span>
                           <span className={styles.summary__value}>
                              {washesTotal} ₽
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>
                              Перекусы
                           </span>
                           <span className={styles.summary__value}>
                              {snacksTotal} ₽
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Другое</span>
                           <span className={styles.summary__value}>
                              {othersTotal} ₽
                           </span>
                        </div>

                        <div className={styles.summary__divider} />

                        <div
                           className={`${styles.summary__row} ${styles["summary__row--strong"]}`}
                        >
                           <span className={styles.summary__label}>
                              Итого расходов
                           </span>
                           <span className={styles.summary__value}>
                              {totalExpenses} ₽
                           </span>
                        </div>
                        <div
                           className={`${styles.summary__row} ${styles["summary__row--accent"]}`}
                        >
                           <span className={styles.summary__label}>
                              Чистый доход
                           </span>
                           <span className={styles.summary__value}>
                              {netIncome ?? 0} ₽
                           </span>
                        </div>
                     </div>
                  ) : null}
               </div>
            </div>
         </form>
      </section>
   );
}
