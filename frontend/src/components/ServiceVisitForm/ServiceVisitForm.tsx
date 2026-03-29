import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import styles from "./ServiceVisitForm.module.scss";

type ServicePartDraft = {
   key: string;
   name: string;
   unitCost: string;
   quantity: string;
   isOriginal: boolean;
};

type ServiceVisitFormData = {
   date: string;
   mileageKm: number;
   workCost: number;
   notes?: string;
   parts: Array<{
      name: string;
      unitCost: number;
      quantity: number;
      isOriginal: boolean;
   }>;
};

const toDigitsOnly = (value: string) => value.replace(/\D+/g, "");

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const createPartDraft = (): ServicePartDraft => ({
   key: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
   name: "",
   unitCost: "",
   quantity: "1",
   isOriginal: false,
});

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

const getPartTotal = (part: ServicePartDraft) => {
   const unitCost = Math.round(Number(part.unitCost));
   const quantity = Math.round(Number(part.quantity));

   if (
      !Number.isFinite(unitCost) ||
      unitCost < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 1
   ) {
      return 0;
   }

   return unitCost * quantity;
};

export function ServiceVisitForm() {
   const todayIso = toIsoDate(new Date());
   const [date, setDate] = useState(todayIso);
   const [mileageKm, setMileageKm] = useState("");
   const [parts, setParts] = useState<ServicePartDraft[]>([]);
   const [workCost, setWorkCost] = useState("");
   const [notes, setNotes] = useState("");
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [step, setStep] = useState(0);

   const steps = [
      {
         title: "Дата",
         hint: "Выберите день посещения сервиса.",
      },
      {
         title: "Пробег",
         hint: "Укажите пробег автомобиля на этот момент.",
      },
      {
         title: "Запчасти",
         hint: "Добавьте позиции, цену, количество и отметку оригинал или нет.",
      },
      {
         title: "Работа",
         hint: "Введите стоимость работ и заметки, если они нужны.",
      },
      {
         title: "Итог",
         hint: "Проверьте данные перед сохранением посещения.",
      },
   ];

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

   const handlePartChange = (
      key: string,
      field: keyof Omit<ServicePartDraft, "key">,
      value: string | boolean,
   ) => {
      setParts((current) =>
         current.map((part) => {
            if (part.key !== key) {
               return part;
            }

            if (field === "isOriginal") {
               return { ...part, isOriginal: Boolean(value) };
            }

            if (field === "unitCost" || field === "quantity") {
               return { ...part, [field]: toDigitsOnly(String(value)) };
            }

            return { ...part, [field]: String(value) };
         }),
      );
   };

   const handleAddPart = () => {
      setParts((current) => [createPartDraft(), ...current]);
   };

   const handleRemovePart = (key: string) => {
      setParts((current) => current.filter((part) => part.key !== key));
   };

   const partsTotal = parts.reduce((sum, part) => sum + getPartTotal(part), 0);
   const workCostValue = Math.round(Number(workCost));
   const totalCost =
      partsTotal +
      (Number.isFinite(workCostValue) && workCostValue >= 0
         ? workCostValue
         : 0);

   const validateStep = (stepToValidate: number) => {
      if (stepToValidate === 0) {
         if (!date) {
            setStatus({ type: "error", text: "Выберите дату посещения" });
            return false;
         }

         return true;
      }

      if (stepToValidate === 1) {
         const mileageValue = Math.round(Number(mileageKm));
         if (!Number.isFinite(mileageValue) || mileageValue < 0) {
            setStatus({ type: "error", text: "Введите корректный пробег" });
            return false;
         }

         return true;
      }

      if (stepToValidate === 2) {
         for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];

            if (!part.name.trim()) {
               setStatus({
                  type: "error",
                  text: `Заполните название у запчасти ${index + 1}`,
               });
               return false;
            }

            const unitCost = Math.round(Number(part.unitCost));
            if (!Number.isFinite(unitCost) || unitCost < 0) {
               setStatus({
                  type: "error",
                  text: `Укажите цену у запчасти ${index + 1}`,
               });
               return false;
            }

            const quantity = Math.round(Number(part.quantity));
            if (!Number.isFinite(quantity) || quantity < 1) {
               setStatus({
                  type: "error",
                  text: `Количество у запчасти ${index + 1} должно быть больше 0`,
               });
               return false;
            }
         }

         return true;
      }

      if (stepToValidate === 3) {
         const nextWorkCost = Math.round(Number(workCost));
         if (!Number.isFinite(nextWorkCost) || nextWorkCost < 0) {
            setStatus({ type: "error", text: "Введите стоимость работы" });
            return false;
         }

         if (parts.length === 0 && nextWorkCost === 0) {
            setStatus({
               type: "error",
               text: "Добавьте хотя бы одну запчасть или стоимость работы",
            });
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

      setStep((current) => Math.min(current + 1, steps.length - 1));
   };

   const handlePrevStep = () => {
      setStatus(null);
      setStep((current) => Math.max(current - 1, 0));
   };

   const handleSubmit = async () => {
      setStatus(null);

      if (step !== steps.length - 1) {
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
         const payload: ServiceVisitFormData = {
            date,
            mileageKm: Math.round(Number(mileageKm)),
            workCost: Math.round(Number(workCost)),
            parts: parts.map((part) => ({
               name: part.name.trim(),
               unitCost: Math.round(Number(part.unitCost)),
               quantity: Math.round(Number(part.quantity)),
               isOriginal: part.isOriginal,
            })),
         };

         const trimmedNotes = notes.trim();
         if (trimmedNotes) {
            payload.notes = trimmedNotes;
         }

         const response = await fetchWithAuth("/service-visits", {
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

         setStatus({ type: "success", text: "Посещение сервиса сохранено" });
         setDate(todayIso);
         setMileageKm("");
         setParts([]);
         setWorkCost("");
         setNotes("");
         setStep(0);
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
            <h1 className={styles.title}>Новый сервис</h1>
            <p className={styles.subtitle}>
               Заполните данные о посещении сервиса.
            </p>
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
                        {isLoading ? "Сохранение..." : "Сохранить"}
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
                           htmlFor="service-date"
                        >
                           Дата
                        </label>
                        <input
                           id="service-date"
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
                           htmlFor="service-mileage"
                        >
                           Пробег, км
                        </label>
                        <input
                           id="service-mileage"
                           className={styles.form__input}
                           type="text"
                           inputMode="numeric"
                           pattern="[0-9]*"
                           placeholder="Например, 185000"
                           value={mileageKm}
                           onChange={(event) =>
                              setMileageKm(toDigitsOnly(event.target.value))
                           }
                           required
                        />
                     </div>
                  ) : null}

                  {step === 2 ? (
                     <section className={styles.partsCard}>
                        <header className={styles.partsCard__header}>
                           <div className={styles.partsCard__headMain}>
                              <h2 className={styles.partsCard__title}>
                                 Запчасти
                              </h2>
                              <div className={styles.partsCard__meta}>
                                 <span className={styles.partsCard__badge}>
                                    {parts.length} поз.
                                 </span>
                                 <span
                                    className={`${styles.partsCard__badge} ${styles["partsCard__badge--total"]}`}
                                 >
                                    {partsTotal} ₽
                                 </span>
                              </div>
                           </div>
                           <button
                              className={styles.form__addButton}
                              type="button"
                              onClick={handleAddPart}
                           >
                              + Добавить
                           </button>
                        </header>

                        {parts.length > 0 ? (
                           <div className={styles.partsCard__list}>
                              {parts.map((part, index) => (
                                 <div
                                    className={styles.partCard}
                                    key={part.key}
                                 >
                                    <div className={styles.partCard__header}>
                                       <div>
                                          <div
                                             className={styles.partCard__label}
                                          >
                                             Запчасть {index + 1}
                                          </div>
                                          <div
                                             className={styles.partCard__name}
                                          >
                                             {part.name.trim() ||
                                                "Новая позиция"}
                                          </div>
                                       </div>
                                       <button
                                          className={styles.form__removeButton}
                                          type="button"
                                          aria-label={`Удалить запчасть ${index + 1}`}
                                          onClick={() =>
                                             handleRemovePart(part.key)
                                          }
                                       >
                                          <span
                                             className={`material-symbols-outlined ${styles.form__removeIcon}`}
                                          >
                                             delete
                                          </span>
                                       </button>
                                    </div>

                                    <div className={styles.form__field}>
                                       <label
                                          className={styles.form__label}
                                          htmlFor={`part-name-${part.key}`}
                                       >
                                          Название
                                       </label>
                                       <input
                                          id={`part-name-${part.key}`}
                                          className={styles.form__input}
                                          type="text"
                                          placeholder="Например, масляный фильтр"
                                          value={part.name}
                                          onChange={(event) =>
                                             handlePartChange(
                                                part.key,
                                                "name",
                                                event.target.value,
                                             )
                                          }
                                       />
                                    </div>

                                    <div className={styles.form__grid}>
                                       <div className={styles.form__field}>
                                          <label
                                             className={styles.form__label}
                                             htmlFor={`part-cost-${part.key}`}
                                          >
                                             Цена за штуку
                                          </label>
                                          <input
                                             id={`part-cost-${part.key}`}
                                             className={styles.form__input}
                                             type="text"
                                             inputMode="numeric"
                                             pattern="[0-9]*"
                                             placeholder="Сумма"
                                             value={part.unitCost}
                                             onChange={(event) =>
                                                handlePartChange(
                                                   part.key,
                                                   "unitCost",
                                                   event.target.value,
                                                )
                                             }
                                          />
                                       </div>

                                       <div className={styles.form__field}>
                                          <label
                                             className={styles.form__label}
                                             htmlFor={`part-quantity-${part.key}`}
                                          >
                                             Количество
                                          </label>
                                          <input
                                             id={`part-quantity-${part.key}`}
                                             className={styles.form__input}
                                             type="text"
                                             inputMode="numeric"
                                             pattern="[0-9]*"
                                             placeholder="1"
                                             value={part.quantity}
                                             onChange={(event) =>
                                                handlePartChange(
                                                   part.key,
                                                   "quantity",
                                                   event.target.value,
                                                )
                                             }
                                          />
                                       </div>
                                    </div>

                                    <div className={styles.form__field}>
                                       <label
                                          className={styles.form__label}
                                          htmlFor={`part-original-${part.key}`}
                                       >
                                          Тип
                                       </label>
                                       <select
                                          id={`part-original-${part.key}`}
                                          className={styles.form__input}
                                          value={
                                             part.isOriginal ? "true" : "false"
                                          }
                                          onChange={(event) =>
                                             handlePartChange(
                                                part.key,
                                                "isOriginal",
                                                event.target.value === "true",
                                             )
                                          }
                                       >
                                          <option value="false">Не ориг</option>
                                          <option value="true">Оригинал</option>
                                       </select>
                                    </div>

                                    <div className={styles.partCard__footer}>
                                       <span
                                          className={
                                             styles.partCard__totalLabel
                                          }
                                       >
                                          Сумма позиции
                                       </span>
                                       <strong
                                          className={
                                             styles.partCard__totalValue
                                          }
                                       >
                                          {getPartTotal(part)} ₽
                                       </strong>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className={styles.partsCard__empty}>
                              Пока пусто. Нажмите «Добавить», если покупали
                              запчасти.
                           </p>
                        )}
                     </section>
                  ) : null}

                  {step === 3 ? (
                     <div className={styles.form__grid}>
                        <div className={styles.form__field}>
                           <label
                              className={styles.form__label}
                              htmlFor="service-work-cost"
                           >
                              Работа (₽)
                           </label>
                           <input
                              id="service-work-cost"
                              className={styles.form__input}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Например, 1500"
                              value={workCost}
                              onChange={(event) =>
                                 setWorkCost(toDigitsOnly(event.target.value))
                              }
                           />
                        </div>

                        <div
                           className={`${styles.form__field} ${styles["form__field--wide"]}`}
                        >
                           <label
                              className={styles.form__label}
                              htmlFor="service-notes"
                           >
                              Заметки
                           </label>
                           <textarea
                              id="service-notes"
                              className={`${styles.form__input} ${styles.form__textarea}`}
                              placeholder="Например, замена масла и фильтров"
                              value={notes}
                              onChange={(event) => setNotes(event.target.value)}
                           />
                        </div>
                     </div>
                  ) : null}

                  {step === 4 ? (
                     <div className={styles.summary}>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Дата</span>
                           <span className={styles.summary__value}>
                              {formatDateRu(date)}
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
                              Запчасти
                           </span>
                           <span className={styles.summary__value}>
                              {partsTotal} ₽
                           </span>
                        </div>
                        <div className={styles.summary__row}>
                           <span className={styles.summary__label}>Работа</span>
                           <span className={styles.summary__value}>
                              {Number.isFinite(workCostValue)
                                 ? workCostValue
                                 : 0}{" "}
                              ₽
                           </span>
                        </div>
                        <div className={styles.summary__divider} />
                        <div
                           className={`${styles.summary__row} ${styles["summary__row--strong"]} ${styles["summary__row--accent"]}`}
                        >
                           <span className={styles.summary__label}>Итого</span>
                           <span className={styles.summary__value}>
                              {totalCost} ₽
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
