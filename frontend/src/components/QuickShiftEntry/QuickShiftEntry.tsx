import { useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { parseShiftText } from "../../utils/parseShiftText";
import { ShiftResultModal } from "../ShiftResultModal/ShiftResultModal";
import {
   buildWeeklyPlanModalState,
   type ProfileSettings,
   type ShiftData,
   type WeeklyPlanModalState,
} from "../ShiftResultModal/shiftResultModalState";
import styles from "./QuickShiftEntry.module.scss";

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const formatDateRu = (value: Date) =>
   new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long",
   }).format(value);

export function QuickShiftEntry() {
   const [text, setText] = useState("");
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [modalState, setModalState] = useState<WeeklyPlanModalState | null>(
      null,
   );

   const today = new Date();
   const todayIso = toIsoDate(today);

   const handleSubmit = async () => {
      setStatus(null);

      if (!text.trim()) {
         setStatus({ type: "error", text: "Опишите смену текстом" });
         return;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         setStatus({ type: "error", text: "Сначала войдите в аккаунт" });
         return;
      }

      const parsed = parseShiftText(text);
      const missing: string[] = [];
      if (!parsed.incomeTotal || parsed.incomeTotal <= 0) {
         missing.push("заработок (например, «4800 рублей»)");
      }
      if (!parsed.mileageKm || parsed.mileageKm <= 0) {
         missing.push("пробег (например, «120 километров»)");
      }
      if (!parsed.tripsCount || parsed.tripsCount <= 0) {
         missing.push("количество поездок (например, «15 поездок»)");
      }
      if (!parsed.engineHours || parsed.engineHours <= 0) {
         missing.push("время в работе (например, «5 часов 12 минут»)");
      }

      if (missing.length > 0) {
         setStatus({
            type: "error",
            text: `Не удалось распознать: ${missing.join(", ")}`,
         });
         return;
      }

      if (parsed.engineHours && parsed.engineHours > 24) {
         setStatus({ type: "error", text: "Время в работе больше 24 часов" });
         return;
      }

      setIsLoading(true);
      try {
         const response = await fetchWithAuth("/shifts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               date: todayIso,
               incomeTotal: parsed.incomeTotal,
               mileageKm: parsed.mileageKm,
               engineHours: parsed.engineHours,
               tripsCount: parsed.tripsCount,
               fuelings: parsed.fuelings,
               washes: parsed.washes,
               snacks: parsed.snacks,
               others: parsed.others,
            }),
         });

         if (response.status === 401) {
            throw new Error("Сессия истекла. Войдите снова.");
         }

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Ошибка сохранения");
         }

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

         setModalState(buildWeeklyPlanModalState(shifts, profile, todayIso));
         setText("");
      } catch (error) {
         const message =
            error instanceof Error ? error.message : "Ошибка сохранения";
         setStatus({ type: "error", text: message });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <section className={styles.quickEntry}>
         <p className={styles.quickEntry__date}>{formatDateRu(today)}</p>

         <textarea
            className={styles.quickEntry__textarea}
            placeholder="Например: заработал 4800 рублей, сто двадцать километров, пятнадцать поездок, пять часов двенадцать минут, заправился на 1500, поел на 150"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
         />

         <div className={styles.quickEntry__footer}>
            <button
               className={styles.quickEntry__submit}
               type="button"
               onClick={() => {
                  void handleSubmit();
               }}
               disabled={isLoading}
            >
               {isLoading ? "Сохранение..." : "Отправить"}
            </button>

            {status ? (
               <span
                  className={`${styles.quickEntry__status} ${
                     status.type === "error"
                        ? styles["quickEntry__status--error"]
                        : styles["quickEntry__status--success"]
                  }`}
               >
                  {status.text}
               </span>
            ) : null}
         </div>

         {modalState ? (
            <ShiftResultModal
               state={modalState}
               onClose={() => setModalState(null)}
            />
         ) : null}
      </section>
   );
}
