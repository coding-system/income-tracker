import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/authClient";
import {
   ServiceVisitForm,
   type ServiceVisitFormData,
} from "../ServiceVisitForm/ServiceVisitForm";

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

export function ServiceEditForm() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [initialData, setInitialData] = useState<ServiceVisitFormData | null>(
      null,
   );
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

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
            setInitialData({
               id: data.id,
               date: toInputDate(data.date),
               mileageKm: data.mileageKm,
               workCost: data.workCost,
               notes: data.notes ?? undefined,
               parts: data.parts.map((part) => ({
                  name: part.name,
                  unitCost: part.unitCost,
                  quantity: part.quantity,
                  isOriginal: part.isOriginal,
               })),
            });
         } catch {
            setError("Не удалось загрузить посещение сервиса");
         } finally {
            setIsLoading(false);
         }
      };

      void load();
   }, [id]);

   const handleSubmit = async (payload: ServiceVisitFormData) => {
      if (!id) {
         throw new Error("Посещение сервиса не найдено");
      }

      const body = { ...payload };
      delete body.id;

      const response = await fetchWithAuth(`/service-visits/${id}`, {
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

      navigate(`/service/${id}`);
   };

   if (isLoading) {
      return <p>Загрузка...</p>;
   }

   if (error) {
      return <p>{error}</p>;
   }

   if (!initialData) {
      return <p>Посещение сервиса не найдено</p>;
   }

   return (
      <ServiceVisitForm
         initialData={initialData}
         onSubmit={handleSubmit}
         submitLabel="Сохранить"
         title="Редактировать сервис"
         subtitle="Обновите данные и сохраните изменения."
         successMessage="Посещение сервиса обновлено"
      />
   );
}
