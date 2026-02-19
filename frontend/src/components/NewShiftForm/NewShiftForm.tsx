import { fetchWithAuth } from "../../api/authClient";
import { ShiftDataForm } from "../ShiftDataForm";
import type { ShiftFormData } from "../ShiftDataForm";

export function NewShiftForm() {
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

   return <ShiftDataForm onSubmit={handleSubmit} />;
}
