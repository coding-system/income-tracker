import { useState } from "react";
import { fetchWithAuth } from "../../api/authClient";
import { parseShiftText } from "../../utils/parseShiftText";
import {
   clearOpenShiftDraft,
   createOpenShiftDraft,
   loadOpenShiftDraft,
   mergeParsedIntoDraft,
   saveOpenShiftDraft,
   type OpenShiftDraft,
} from "../../utils/openShiftDraft";
import { ShiftResultModal } from "../ShiftResultModal/ShiftResultModal";
import {
   buildWeeklyPlanModalState,
   type ProfileSettings,
   type ShiftData,
   type WeeklyPlanModalState,
} from "../ShiftResultModal/shiftResultModalState";
import { OpenShiftModal } from "./OpenShiftModal";
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
   const [draft, setDraft] = useState<OpenShiftDraft | null>(() =>
      loadOpenShiftDraft(),
   );
   const [text, setText] = useState("");
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [modalState, setModalState] = useState<WeeklyPlanModalState | null>(
      null,
   );

   const today = new Date();
   const todayIso = toIsoDate(today);

   const handleOpenShift = () => {
      const newDraft = createOpenShiftDraft(todayIso);
      saveOpenShiftDraft(newDraft);
      setDraft(newDraft);
      setStatus(null);
   };

   const closeDraft = async (draftToClose: OpenShiftDraft) => {
      setStatus(null);

      const missing: string[] = [];
      if (!draftToClose.incomeTotal || draftToClose.incomeTotal <= 0) {
         missing.push("заработок (например, «4800 рублей»)");
      }
      if (!draftToClose.mileageKm || draftToClose.mileageKm <= 0) {
         missing.push("пробег (например, «120 километров»)");
      }
      if (!draftToClose.tripsCount || draftToClose.tripsCount <= 0) {
         missing.push("количество поездок (например, «15 поездок»)");
      }
      if (!draftToClose.engineHours || draftToClose.engineHours <= 0) {
         missing.push("время в работе (например, «5 часов 12 минут»)");
      }

      if (missing.length > 0) {
         setStatus({
            type: "error",
            text: `Не удалось распознать: ${missing.join(", ")}`,
         });
         return;
      }

      if (draftToClose.engineHours && draftToClose.engineHours > 24) {
         setStatus({ type: "error", text: "Время в работе больше 24 часов" });
         return;
      }

      setIsLoading(true);
      try {
         const response = await fetchWithAuth("/shifts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               date: draftToClose.date,
               incomeTotal: draftToClose.incomeTotal,
               mileageKm: draftToClose.mileageKm,
               engineHours: draftToClose.engineHours,
               tripsCount: draftToClose.tripsCount,
               fuelings: draftToClose.fuelings,
               washes: draftToClose.washes,
               snacks: draftToClose.snacks,
               others: draftToClose.others,
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

         clearOpenShiftDraft();
         setDraft(null);
         setText("");
         setIsDetailsOpen(false);
         setModalState(
            buildWeeklyPlanModalState(shifts, profile, draftToClose.date),
         );
      } catch (error) {
         const message =
            error instanceof Error ? error.message : "Ошибка сохранения";
         setStatus({ type: "error", text: message });
      } finally {
         setIsLoading(false);
      }
   };

   const handleAddText = async () => {
      setStatus(null);

      if (!draft) {
         return;
      }

      if (!text.trim()) {
         setStatus({ type: "error", text: "Введите текст" });
         return;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
         setStatus({ type: "error", text: "Сначала войдите в аккаунт" });
         return;
      }

      const parsed = parseShiftText(text);
      const hasAnyData =
         parsed.incomeTotal !== undefined ||
         parsed.mileageKm !== undefined ||
         parsed.tripsCount !== undefined ||
         parsed.engineHours !== undefined ||
         (parsed.fuelings && parsed.fuelings.length > 0) ||
         (parsed.washes && parsed.washes.length > 0) ||
         (parsed.snacks && parsed.snacks.length > 0) ||
         (parsed.others && parsed.others.length > 0) ||
         parsed.closeShift;

      if (!hasAnyData) {
         setStatus({
            type: "error",
            text: "Не удалось ничего распознать в тексте",
         });
         return;
      }

      const merged = mergeParsedIntoDraft(draft, parsed);
      saveOpenShiftDraft(merged);
      setDraft(merged);
      setText("");

      if (parsed.closeShift) {
         await closeDraft(merged);
         return;
      }

      setStatus({ type: "success", text: "Добавлено в смену" });
   };

   const handleDiscardDraft = () => {
      if (!window.confirm("Удалить черновик смены без сохранения?")) {
         return;
      }

      clearOpenShiftDraft();
      setDraft(null);
      setIsDetailsOpen(false);
      setStatus(null);
      setText("");
   };

   if (!draft) {
      return (
         <section className={styles.quickEntry}>
            <p className={styles.quickEntry__date}>{formatDateRu(today)}</p>
            <button
               className={styles.quickEntry__submit}
               type="button"
               onClick={handleOpenShift}
            >
               Открыть смену
            </button>

            {modalState ? (
               <ShiftResultModal
                  state={modalState}
                  onClose={() => setModalState(null)}
               />
            ) : null}
         </section>
      );
   }

   return (
      <section className={styles.quickEntry}>
         <button
            className={styles.quickEntry__detailsFab}
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            disabled={isLoading}
         >
            <span className="material-symbols-outlined">assignment</span>
            Детали смены
         </button>

         <p className={styles.quickEntry__date}>{formatDateRu(today)}</p>

         <textarea
            className={styles.quickEntry__textarea}
            placeholder="Добавьте ещё: «поел на 150», «заправка 2000», или продиктуйте остаток и «закрыть смену»"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
         />

         <div className={styles.quickEntry__footer}>
            <button
               className={styles.quickEntry__submit}
               type="button"
               onClick={() => {
                  void handleAddText();
               }}
               disabled={isLoading}
            >
               {isLoading ? "Сохранение..." : "Добавить"}
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

         {isDetailsOpen ? (
            <OpenShiftModal
               draft={draft}
               isLoading={isLoading}
               status={status}
               onClose={() => setIsDetailsOpen(false)}
               onCloseShift={() => {
                  void closeDraft(draft);
               }}
               onDiscard={handleDiscardDraft}
            />
         ) : null}

         {modalState ? (
            <ShiftResultModal
               state={modalState}
               onClose={() => setModalState(null)}
            />
         ) : null}
      </section>
   );
}
