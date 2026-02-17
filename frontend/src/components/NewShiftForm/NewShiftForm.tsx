import { useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import styles from "./NewShiftForm.module.scss";

const toNumberArray = (values: string[]) =>
   values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value >= 0);

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const toLabelDate = (value: Date) =>
   value.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

export function NewShiftForm() {
   const today = new Date();
   const yesterday = new Date();
   yesterday.setDate(today.getDate() - 1);

   const todayIso = toIsoDate(today);
   const yesterdayIso = toIsoDate(yesterday);

   const [date, setDate] = useState(todayIso);
   const [incomeTotal, setIncomeTotal] = useState("");
   const [mileageKm, setMileageKm] = useState("");
   const [engineHoursHours, setEngineHoursHours] = useState("");
   const [engineHoursMinutes, setEngineHoursMinutes] = useState("");
   const [tripsCount, setTripsCount] = useState("");
   const [fuelings, setFuelings] = useState<string[]>([]);
   const [washes, setWashes] = useState<string[]>([]);
   const [snacks, setSnacks] = useState<string[]>([]);
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);

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
      setter((prev) => [...prev, ""]);
   };

   const handleArrayRemove = (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      index: number,
   ) => {
      setter((prev) => prev.filter((_, i) => i !== index));
   };

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
            minutesValue < 1 ||
            minutesValue > 59
         ) {
            setStatus({ type: "error", text: "Минуты должны быть от 1 до 59" });
            setIsLoading(false);
            return;
         }

         const incomeValue = Number(incomeTotal);
         if (!Number.isFinite(incomeValue) || incomeValue <= 0) {
            setStatus({ type: "error", text: "Введите заработок больше 0" });
            setIsLoading(false);
            return;
         }

         const mileageValue = Number(mileageKm);
         if (!Number.isFinite(mileageValue) || mileageValue <= 0) {
            setStatus({ type: "error", text: "Введите пробег больше 0" });
            setIsLoading(false);
            return;
         }

         const tripsValue = Number(tripsCount);
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
         const payload = {
            date,
            incomeTotal: incomeValue,
            mileageKm: mileageValue,
            engineHours,
            tripsCount: tripsValue,
            fuelings: toNumberArray(fuelings),
            washes: toNumberArray(washes),
            snacks: toNumberArray(snacks),
         };

         const response = await fetchWithAuth("/shifts", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
         });

         if (response.status === 401) {
            throw new Error("Сессия истекла. Войдите снова.");
         }

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Ошибка сохранения");
         }

         setStatus({ type: "success", text: "Смена сохранена" });
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
            <h1 className={styles.title}>Новая смена</h1>
            <p className={styles.subtitle}>
               Заполните данные и сохраните смену.
            </p>
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
               <div className={styles.form__field}>
                  <span className={styles.form__label}>Дата</span>
                  <div className={styles.form__dateToggle}>
                     <button
                        className={`${styles.form__dateButton} ${
                           date === yesterdayIso
                              ? styles["form__dateButton--active"]
                              : ""
                        }`}
                        type="button"
                        aria-pressed={date === yesterdayIso}
                        onClick={() => setDate(yesterdayIso)}
                     >
                        {toLabelDate(yesterday)}
                     </button>
                     <button
                        className={`${styles.form__dateButton} ${
                           date === todayIso
                              ? styles["form__dateButton--active"]
                              : ""
                        }`}
                        type="button"
                        aria-pressed={date === todayIso}
                        onClick={() => setDate(todayIso)}
                     >
                        {toLabelDate(today)}
                     </button>
                  </div>
               </div>
               <div className={styles.form__field}>
                  <label className={styles.form__label} htmlFor="shift-income">
                     Заработали (₽)
                  </label>
                  <input
                     id="shift-income"
                     className={styles.form__input}
                     type="number"
                     min="1"
                     step="0.01"
                     value={incomeTotal}
                     onChange={(event) => setIncomeTotal(event.target.value)}
                     required
                  />
               </div>
               <div className={styles.form__field}>
                  <label className={styles.form__label} htmlFor="shift-mileage">
                     Пробег (км)
                  </label>
                  <input
                     id="shift-mileage"
                     className={styles.form__input}
                     type="number"
                     min="1"
                     step="1"
                     value={mileageKm}
                     onChange={(event) => setMileageKm(event.target.value)}
                     required
                  />
               </div>
               <div className={styles.form__field}>
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
                           className={styles.form__input}
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
                           className={styles.form__input}
                           type="number"
                           min="1"
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
               <div className={styles.form__field}>
                  <label className={styles.form__label} htmlFor="shift-trips">
                     Количество поездок
                  </label>
                  <input
                     id="shift-trips"
                     className={styles.form__input}
                     type="number"
                     min="1"
                     step="1"
                     value={tripsCount}
                     onChange={(event) => setTripsCount(event.target.value)}
                     required
                  />
               </div>
            </div>

            <div className={styles.form__section}>
               <div className={styles.form__sectionHeader}>
                  <h2 className={styles.form__sectionTitle}>Заправки</h2>
                  <button
                     className={styles.form__addButton}
                     type="button"
                     onClick={() => handleArrayAdd(setFuelings)}
                  >
                     + Добавить
                  </button>
               </div>
               {fuelings.length > 0 ? (
                  <div className={styles.form__list}>
                     {fuelings.map((value, index) => (
                        <div
                           className={styles.form__listItem}
                           key={`fueling-${index}`}
                        >
                           <input
                              className={styles.form__input}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Сумма"
                              value={value}
                              onChange={(event) =>
                                 handleArrayChange(
                                    setFuelings,
                                    index,
                                    event.target.value,
                                 )
                              }
                           />
                           <button
                              className={styles.form__removeButton}
                              type="button"
                              onClick={() =>
                                 handleArrayRemove(setFuelings, index)
                              }
                           >
                              Удалить
                           </button>
                        </div>
                     ))}
                  </div>
               ) : null}
            </div>

            <div className={styles.form__section}>
               <div className={styles.form__sectionHeader}>
                  <h2 className={styles.form__sectionTitle}>Мойки</h2>
                  <button
                     className={styles.form__addButton}
                     type="button"
                     onClick={() => handleArrayAdd(setWashes)}
                  >
                     + Добавить
                  </button>
               </div>
               {washes.length > 0 ? (
                  <div className={styles.form__list}>
                     {washes.map((value, index) => (
                        <div
                           className={styles.form__listItem}
                           key={`wash-${index}`}
                        >
                           <input
                              className={styles.form__input}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Сумма"
                              value={value}
                              onChange={(event) =>
                                 handleArrayChange(
                                    setWashes,
                                    index,
                                    event.target.value,
                                 )
                              }
                           />
                           <button
                              className={styles.form__removeButton}
                              type="button"
                              onClick={() =>
                                 handleArrayRemove(setWashes, index)
                              }
                           >
                              Удалить
                           </button>
                        </div>
                     ))}
                  </div>
               ) : null}
            </div>

            <div className={styles.form__section}>
               <div className={styles.form__sectionHeader}>
                  <h2 className={styles.form__sectionTitle}>Перекусы</h2>
                  <button
                     className={styles.form__addButton}
                     type="button"
                     onClick={() => handleArrayAdd(setSnacks)}
                  >
                     + Добавить
                  </button>
               </div>
               {snacks.length > 0 ? (
                  <div className={styles.form__list}>
                     {snacks.map((value, index) => (
                        <div
                           className={styles.form__listItem}
                           key={`snack-${index}`}
                        >
                           <input
                              className={styles.form__input}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Сумма"
                              value={value}
                              onChange={(event) =>
                                 handleArrayChange(
                                    setSnacks,
                                    index,
                                    event.target.value,
                                 )
                              }
                           />
                           <button
                              className={styles.form__removeButton}
                              type="button"
                              onClick={() =>
                                 handleArrayRemove(setSnacks, index)
                              }
                           >
                              Удалить
                           </button>
                        </div>
                     ))}
                  </div>
               ) : null}
            </div>

            <button
               className={styles.form__submit}
               type="submit"
               disabled={isLoading}
            >
               {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
         </form>
      </section>
   );
}
