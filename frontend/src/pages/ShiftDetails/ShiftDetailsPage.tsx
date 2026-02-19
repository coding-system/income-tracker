import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/authClient";
import { ShiftDetails } from "../../components/ShiftDetails/ShiftDetails";
import styles from "./ShiftDetailsPage.module.scss";

type ShiftCost = {
   costTotal: number;
};

type ShiftDetailsData = {
   id: string;
   date: string;
   incomeTotal: number;
   engineHours: number | null;
   mileageKm: number | null;
   tripsCount: number | null;
   fuelings?: ShiftCost[];
   washes?: ShiftCost[];
   snacks?: ShiftCost[];
   others?: ShiftCost[];
};

export function ShiftDetailsPage() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [shift, setShift] = useState<ShiftDetailsData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   useEffect(() => {
      const load = async () => {
         if (!id) {
            setError("Смена не найдена");
            setIsLoading(false);
            return;
         }

         try {
            const response = await fetchWithAuth(`/shifts/${id}`);
            if (response.status === 404) {
               setError("Смена не найдена");
               return;
            }
            if (!response.ok) {
               setError("Не удалось загрузить смену");
               return;
            }

            const data = (await response.json()) as ShiftDetailsData;
            setShift(data);
         } catch {
            setError("Не удалось загрузить смену");
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, [id]);

   const handleDelete = async () => {
      if (!id) {
         setError("Смена не найдена");
         return;
      }

      const confirmed = window.confirm(
         "Удалить смену без возможности восстановления?",
      );
      if (!confirmed) {
         return;
      }

      setIsDeleting(true);
      try {
         const response = await fetchWithAuth(`/shifts/${id}`, {
            method: "DELETE",
         });

         if (response.status === 401) {
            throw new Error("Сессия истекла. Войдите снова.");
         }

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Не удалось удалить смену");
         }

         navigate("/history");
      } catch (deleteError) {
         const message =
            deleteError instanceof Error
               ? deleteError.message
               : "Не удалось удалить смену";
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
                  onClick={() => navigate("/history")}
               >
                  Назад к истории
               </button>
            </div>
            {isLoading ? (
               <p className={styles.page__empty}>Загрузка...</p>
            ) : error ? (
               <p className={styles.page__empty}>{error}</p>
            ) : shift ? (
               <ShiftDetails
                  shift={shift}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
               />
            ) : (
               <p className={styles.page__empty}>Смена не найдена</p>
            )}
         </section>
      </main>
   );
}
