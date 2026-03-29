import { fetchWithAuth } from "../../api/authClient";
import { ServiceVisitForm } from "../../components/ServiceVisitForm/ServiceVisitForm";
import styles from "./ServiceNewPage.module.scss";

export function ServiceNewPage() {
   const handleSubmit = async (
      payload: import("../../components/ServiceVisitForm/ServiceVisitForm").ServiceVisitFormData,
   ) => {
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
   };

   return (
      <main className={styles.page}>
         <ServiceVisitForm onSubmit={handleSubmit} />
      </main>
   );
}
