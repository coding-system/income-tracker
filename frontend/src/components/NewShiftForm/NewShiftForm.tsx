import { useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { ShiftDataForm } from "../ShiftDataForm";
import type { ShiftFormData } from "../ShiftDataForm";
import { ShiftResultModal } from "../ShiftResultModal/ShiftResultModal";
import {
   buildWeeklyPlanModalState,
   type ProfileSettings,
   type ShiftData,
   type WeeklyPlanModalState,
} from "../ShiftResultModal/shiftResultModalState";

export function NewShiftForm() {
   const [modalState, setModalState] = useState<WeeklyPlanModalState | null>(
      null,
   );

   const handleSubmit = async (payload: ShiftFormData) => {
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
   };

   const handleSuccess = async (payload: ShiftFormData) => {
      try {
         const [shiftsResponse, profileResponse] = await Promise.all([
            fetchWithAuth("/shifts"),
            fetchWithAuth("/auth/me"),
         ]);

         const shifts = shiftsResponse.ok
            ? ((await shiftsResponse.json()) as ShiftData[])
            : [];
         const profile = profileResponse.ok
            ? ((await profileResponse.json()) as ProfileSettings)
            : {};

         setModalState(
            buildWeeklyPlanModalState(shifts, profile, payload.date),
         );
      } catch {
         setModalState({
            title: "Смена сохранена",
            subtitle: "Не удалось загрузить прогресс недели прямо сейчас.",
            isAheadOfPlan: false,
            hasPlan: false,
         });
      }
   };

   return (
      <>
         <ShiftDataForm
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            showSuccessStatus={false}
         />

         {modalState ? (
            <ShiftResultModal
               state={modalState}
               onClose={() => setModalState(null)}
            />
         ) : null}
      </>
   );
}
