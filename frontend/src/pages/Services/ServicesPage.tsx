import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../api/authClient";
import styles from "./ServicesPage.module.scss";

type ServiceVisit = {
   id: string;
   date: string;
   mileageKm: number;
   totalCost: number;
};

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

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

const formatMileage = (value: number) => {
   return `${new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value)} км`;
};

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

export function ServicesPage() {
   const navigate = useNavigate();
   const [serviceVisits, setServiceVisits] = useState<ServiceVisit[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const load = async () => {
         try {
            const response = await fetchWithAuth("/service-visits");
            if (!response.ok) {
               return;
            }

            const data = (await response.json()) as ServiceVisit[];
            const sorted = [...data].sort(
               (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setServiceVisits(sorted);
         } catch {
            // ignore for now
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, []);

   return (
      <main className={styles.page}>
         <section className={styles.panel}>
            <header className={styles.header}>
               <h1 className={styles.title}>Сервис</h1>
               <p className={styles.subtitle}>
                  Все посещения сервиса в одном списке.
               </p>
            </header>

            <div className={styles.page__toolbar}>
               <Link to="/service/new" className={styles.page__addButton}>
                  Добавить тех обслуживание
               </Link>
            </div>

            {isLoading ? (
               <p className={styles.page__empty}>Загрузка...</p>
            ) : serviceVisits.length === 0 ? (
               <p className={styles.page__empty}>Посещений сервиса пока нет.</p>
            ) : (
               <div className={styles.page__list}>
                  {serviceVisits.map((visit) => (
                     <button
                        className={styles.page__row}
                        key={visit.id}
                        type="button"
                        onClick={() => navigate(`/service/${visit.id}`)}
                     >
                        <span className={styles.page__rowDate}>
                           {formatDateRu(visit.date)}
                        </span>
                        <div className={styles.page__rowMeta}>
                           <span className={styles.page__rowAmount}>
                              {formatMoneyWhole(visit.totalCost)} ₽
                           </span>
                           <span className={styles.page__rowMileage}>
                              {formatMileage(visit.mileageKm)}
                           </span>
                        </div>
                     </button>
                  ))}
               </div>
            )}
         </section>
      </main>
   );
}
