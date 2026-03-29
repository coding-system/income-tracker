import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/authClient";
import styles from "./ServiceDetailsPage.module.scss";

type ServicePart = {
   id: string;
   name: string;
   isOriginal: boolean;
   unitCost: number;
   quantity: number;
   totalCost: number;
};

type ServiceVisitDetails = {
   id: string;
   date: string;
   mileageKm: number;
   workCost: number;
   totalCost: number;
   notes: string | null;
   parts: ServicePart[];
};

const monthLabels = [
   "янв.",
   "фев.",
   "мар.",
   "апр.",
   "мая",
   "июн.",
   "июл.",
   "авг.",
   "сен.",
   "окт.",
   "ноя.",
   "дек.",
];

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

const formatMileage = (value: number) =>
   `${new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value)} км`;

const formatDateRu = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   const day = String(parsed.getDate()).padStart(2, "0");
   const month = monthLabels[parsed.getMonth()] ?? "";
   const year = parsed.getFullYear();
   return `${day} ${month} ${year}г.`;
};

export function ServiceDetailsPage() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [serviceVisit, setServiceVisit] = useState<ServiceVisitDetails | null>(
      null,
   );
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   useEffect(() => {
      const load = async () => {
         if (!id) {
            setError("Посещение сервиса не найдено");
            setIsLoading(false);
            return;
         }

         try {
            const response = await fetchWithAuth(`/service-visits/${id}`);
            if (response.status === 404) {
               setError("Посещение сервиса не найдено");
               return;
            }

            if (!response.ok) {
               setError("Не удалось загрузить посещение сервиса");
               return;
            }

            const data = (await response.json()) as ServiceVisitDetails;
            setServiceVisit(data);
         } catch {
            setError("Не удалось загрузить посещение сервиса");
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, [id]);

   const partsTotal =
      serviceVisit?.parts.reduce((sum, part) => sum + part.totalCost, 0) ?? 0;

   const handleDelete = async () => {
      if (!id) {
         setError("Посещение сервиса не найдено");
         return;
      }

      const confirmed = window.confirm(
         "Удалить посещение сервиса без возможности восстановления?",
      );
      if (!confirmed) {
         return;
      }

      setIsDeleting(true);
      try {
         const response = await fetchWithAuth(`/service-visits/${id}`, {
            method: "DELETE",
         });

         if (response.status === 401) {
            throw new Error("Сессия истекла. Войдите снова.");
         }

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Не удалось удалить сервис");
         }

         navigate("/services");
      } catch (deleteError) {
         const message =
            deleteError instanceof Error
               ? deleteError.message
               : "Не удалось удалить сервис";
         setError(message);
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <main className={styles.page}>
         <section className={styles.page__panel}>
            <div className={styles.page__actions}>
               <button
                  className={styles.page__back}
                  type="button"
                  onClick={() => navigate("/services")}
               >
                  Назад к сервису
               </button>
            </div>

            {isLoading ? (
               <p className={styles.page__empty}>Загрузка...</p>
            ) : error ? (
               <p className={styles.page__empty}>{error}</p>
            ) : serviceVisit ? (
               <section className={styles.details}>
                  <header className={styles.details__header}>
                     <div>
                        <p className={styles.details__eyebrow}>Сервис</p>
                        <h1 className={styles.details__title}>
                           {formatDateRu(serviceVisit.date)}
                        </h1>
                     </div>
                     <div className={styles.details__actions}>
                        <Link
                           className={styles.details__editButton}
                           to={`/service/${serviceVisit.id}/edit`}
                           aria-label="Редактировать сервис"
                        >
                           <span
                              className={`material-symbols-outlined ${styles.details__editIcon}`}
                           >
                              edit
                           </span>
                        </Link>
                        <button
                           className={styles.details__deleteButton}
                           type="button"
                           onClick={handleDelete}
                           aria-label="Удалить сервис"
                           disabled={isDeleting}
                        >
                           <span
                              className={`material-symbols-outlined ${styles.details__deleteIcon}`}
                           >
                              delete
                           </span>
                        </button>
                     </div>
                  </header>

                  <div className={styles.details__grid}>
                     <div className={styles.details__card}>
                        <p className={styles.details__label}>
                           Общая стоимость ремонта
                        </p>
                        <p className={styles.details__value}>
                           {formatMoneyWhole(serviceVisit.totalCost)} ₽
                        </p>
                     </div>
                     <div className={styles.details__card}>
                        <p className={styles.details__label}>
                           Стоимость работы
                        </p>
                        <p className={styles.details__value}>
                           {formatMoneyWhole(serviceVisit.workCost)} ₽
                        </p>
                     </div>
                     <div className={styles.details__card}>
                        <p className={styles.details__label}>
                           Стоимость запчастей
                        </p>
                        <p className={styles.details__value}>
                           {formatMoneyWhole(partsTotal)} ₽
                        </p>
                     </div>
                     <div className={styles.details__card}>
                        <p className={styles.details__label}>Пробег</p>
                        <p className={styles.details__value}>
                           {formatMileage(serviceVisit.mileageKm)}
                        </p>
                     </div>
                  </div>

                  {serviceVisit.notes ? (
                     <section className={styles.details__expenses}>
                        <h2 className={styles.details__subtitle}>Заметки</h2>
                        <div className={styles.details__noteCard}>
                           <p className={styles.details__noteText}>
                              {serviceVisit.notes}
                           </p>
                        </div>
                     </section>
                  ) : null}

                  <section className={styles.details__expenses}>
                     <h2 className={styles.details__subtitle}>Запчасти</h2>
                     {serviceVisit.parts.length === 0 ? (
                        <p className={styles.page__empty}>Запчастей нет.</p>
                     ) : (
                        <div className={styles.details__partsList}>
                           {serviceVisit.parts.map((part) => (
                              <article
                                 className={styles.details__partCard}
                                 key={part.id}
                              >
                                 <div className={styles.details__partHeader}>
                                    <div>
                                       <h3
                                          className={styles.details__partTitle}
                                       >
                                          {part.name}
                                       </h3>
                                       <p className={styles.details__partType}>
                                          {part.isOriginal
                                             ? "Оригинал"
                                             : "Не ориг"}
                                       </p>
                                    </div>
                                    <strong
                                       className={styles.details__partTotal}
                                    >
                                       {formatMoneyWhole(part.totalCost)} ₽
                                    </strong>
                                 </div>

                                 <div className={styles.details__partMeta}>
                                    <div
                                       className={styles.details__partMetaItem}
                                    >
                                       <span className={styles.details__label}>
                                          Цена за штуку
                                       </span>
                                       <span
                                          className={
                                             styles.details__partMetaValue
                                          }
                                       >
                                          {formatMoneyWhole(part.unitCost)} ₽
                                       </span>
                                    </div>
                                    <div
                                       className={styles.details__partMetaItem}
                                    >
                                       <span className={styles.details__label}>
                                          Количество
                                       </span>
                                       <span
                                          className={
                                             styles.details__partMetaValue
                                          }
                                       >
                                          {part.quantity}
                                       </span>
                                    </div>
                                 </div>
                              </article>
                           ))}
                        </div>
                     )}
                  </section>
               </section>
            ) : (
               <p className={styles.page__empty}>
                  Посещение сервиса не найдено
               </p>
            )}
         </section>
      </main>
   );
}
