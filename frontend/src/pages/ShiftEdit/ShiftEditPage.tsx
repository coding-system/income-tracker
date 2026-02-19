import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/authClient";
import { NewShiftForm } from "../../components/NewShiftForm";
import type { ShiftFormData } from "../../components/NewShiftForm";
import styles from "./ShiftEditPage.module.scss";

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

const toInputDate = (value: string) => {
   if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
   }

   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   const local = new Date(
      parsed.getTime() - parsed.getTimezoneOffset() * 60000,
   );
   return local.toISOString().slice(0, 10);
};

const mapCosts = (items?: ShiftCost[]) => items?.map((item) => item.costTotal);

export function ShiftEditPage() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [initialData, setInitialData] = useState<ShiftFormData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

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
            setInitialData({
               id: data.id,
               date: toInputDate(data.date),
               incomeTotal: data.incomeTotal,
               mileageKm: data.mileageKm ?? 0,
               engineHours: data.engineHours ?? 0,
               tripsCount: data.tripsCount ?? 0,
               fuelings: mapCosts(data.fuelings),
               washes: mapCosts(data.washes),
               snacks: mapCosts(data.snacks),
               others: mapCosts(data.others),
            });
         } catch {
            setError("Не удалось загрузить смену");
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, [id]);

   const handleSubmit = async (payload: ShiftFormData) => {
      if (!id) {
         throw new Error("Смена не найдена");
      }

      const body = { ...payload };
      delete body.id;
      const response = await fetchWithAuth(`/shifts/${id}`, {
         method: "PATCH",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(body),
      });

      if (response.status === 401) {
         throw new Error("Сессия истекла. Войдите снова.");
      }

      if (!response.ok) {
         const message = await response.text();
         throw new Error(message || "Ошибка сохранения");
      }

      navigate(`/shift/${id}`);
   };

   return (
      <main className={styles.page}>
         {isLoading ? (
            <p>Загрузка...</p>
         ) : error ? (
            <p>{error}</p>
         ) : initialData ? (
            <NewShiftForm
               initialData={initialData}
               onSubmit={handleSubmit}
               submitLabel="Сохранить изменения"
               title="Редактировать смену"
               subtitle="Обновите данные и сохраните изменения."
               successMessage="Смена обновлена"
            />
         ) : (
            <p>Смена не найдена</p>
         )}
      </main>
   );
}
