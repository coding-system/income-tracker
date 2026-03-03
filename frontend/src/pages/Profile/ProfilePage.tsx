import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarPlaceholder from "../../assets/images/profile-blank.png";
import { clearAuth, fetchWithAuth } from "../../api/authClient";
import { getAccessToken, useAuthStatus } from "../../hooks/useAuthStatus";
import styles from "./ProfilePage.module.scss";

type ProfileData = {
   userId: string;
   email: string;
   name: string | null;
   dailyTargetNet?: number | null;
   workDaysPerWeek?: number | null;
   hasWeeklyPlan?: boolean;
};

const formatMoneyWhole = (value: number) =>
   new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);

export function ProfilePage() {
   const navigate = useNavigate();
   const isAuthenticated = useAuthStatus();
   const [profile, setProfile] = useState<ProfileData | null>(null);
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [dailyTargetNet, setDailyTargetNet] = useState("");
   const [workDaysPerWeek, setWorkDaysPerWeek] = useState("");
   const [hasWeeklyPlan, setHasWeeklyPlan] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);
   const userName =
      profile?.name ?? localStorage.getItem("userName") ?? "Пользователь";
   const userEmail =
      profile?.email ?? localStorage.getItem("userEmail") ?? "user@example.com";

   useEffect(() => {
      const accessToken = getAccessToken();
      if (!accessToken) {
         return;
      }

      const loadProfile = async () => {
         try {
            const response = await fetchWithAuth("/auth/me");

            if (response.status === 401) {
               clearAuth();
               navigate("/login", { replace: true });
               return;
            }

            if (!response.ok) {
               return;
            }

            const data = (await response.json()) as ProfileData;
            setProfile(data);
            setDailyTargetNet(
               data.dailyTargetNet !== null && data.dailyTargetNet !== undefined
                  ? String(Math.round(data.dailyTargetNet))
                  : "",
            );
            setWorkDaysPerWeek(
               data.workDaysPerWeek !== null &&
                  data.workDaysPerWeek !== undefined
                  ? String(data.workDaysPerWeek)
                  : "",
            );
            setHasWeeklyPlan(Boolean(data.hasWeeklyPlan));
            if (data.name) {
               localStorage.setItem("userName", data.name);
            }
            localStorage.setItem("userEmail", data.email);
         } catch {
            // ignore and keep cached values
         }
      };

      void loadProfile();
   }, [navigate]);

   const handleLogout = async () => {
      try {
         await fetchWithAuth("/auth/logout", { method: "POST" });
      } catch {
         // ignore logout errors
      }

      clearAuth();
      navigate("/login", { replace: true });
   };

   if (!isAuthenticated) {
      return null;
   }

   const parsedDailyTarget = dailyTargetNet.trim()
      ? Number(dailyTargetNet.replace(/\s/g, ""))
      : null;
   const parsedWorkDays = workDaysPerWeek.trim()
      ? Number(workDaysPerWeek.replace(/\s/g, ""))
      : null;
   const weeklyTarget =
      hasWeeklyPlan && parsedDailyTarget !== null && parsedWorkDays !== null
         ? parsedDailyTarget * parsedWorkDays
         : null;

   const handleSaveSettings = async () => {
      setIsSaving(true);
      setSaveError(null);

      const dailyValue =
         parsedDailyTarget !== null && !Number.isNaN(parsedDailyTarget)
            ? parsedDailyTarget
            : null;
      const daysValue =
         parsedWorkDays !== null && !Number.isNaN(parsedWorkDays)
            ? Math.round(parsedWorkDays)
            : null;

      try {
         const response = await fetchWithAuth("/users/settings", {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               dailyTargetNet: dailyValue,
               workDaysPerWeek: daysValue,
               hasWeeklyPlan,
            }),
         });

         if (!response.ok) {
            setSaveError("Не удалось сохранить настройки.");
            return;
         }

         setProfile((prev) =>
            prev
               ? {
                    ...prev,
                    dailyTargetNet: dailyValue,
                    workDaysPerWeek: daysValue,
                    hasWeeklyPlan,
                 }
               : prev,
         );
      } catch {
         setSaveError("Не удалось сохранить настройки.");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <main className={styles.profile}>
         <section className={styles.profile__card}>
            <div className={styles.profile__header}>
               <div className={styles.profile__avatar}>
                  <img
                     className={styles.profile__avatarImage}
                     src={avatarPlaceholder}
                     alt="Аватар"
                  />
               </div>
               <div className={styles.profile__identity}>
                  <h1 className={styles.profile__name}>{userName}</h1>
                  <p className={styles.profile__email}>{userEmail}</p>
               </div>
            </div>
            <div className={styles.profile__infoGrid}>
               <div className={styles.profile__infoItem}>
                  <p className={styles.profile__label}>Недельный план</p>
                  <p className={styles.profile__value}>
                     {hasWeeklyPlan && weeklyTarget !== null
                        ? `${formatMoneyWhole(weeklyTarget)} ₽`
                        : "Выключен"}
                  </p>
               </div>
            </div>
            <section className={styles.profile__settings}>
               <div className={styles.profile__settingsHeader}>
                  <div>
                     <p className={styles.profile__label}>Настройки</p>
                     <p className={styles.profile__settingsHint}>
                        Норма дохода и план на неделю.
                     </p>
                  </div>
                  <button
                     className={styles.profile__settingsToggle}
                     type="button"
                     onClick={() => setIsSettingsOpen((prev) => !prev)}
                  >
                     {isSettingsOpen ? "Скрыть" : "Настроить"}
                  </button>
               </div>
               {isSettingsOpen ? (
                  <div className={styles.profile__settingsGrid}>
                     <label className={styles.profile__settingsCheckbox}>
                        <input
                           className={styles.profile__settingsCheckboxInput}
                           type="checkbox"
                           checked={hasWeeklyPlan}
                           onChange={(event) =>
                              setHasWeeklyPlan(event.target.checked)
                           }
                        />
                        <span className={styles.profile__settingsCheckboxText}>
                           Недельный план активен
                        </span>
                     </label>
                     {hasWeeklyPlan ? (
                        <>
                           <label className={styles.profile__settingsField}>
                              <span className={styles.profile__settingsLabel}>
                                 Норма в день (чистыми)
                              </span>
                              <input
                                 className={styles.profile__settingsInput}
                                 type="number"
                                 min={0}
                                 step={100}
                                 value={dailyTargetNet}
                                 onChange={(event) =>
                                    setDailyTargetNet(event.target.value)
                                 }
                                 placeholder="0"
                              />
                           </label>
                           <label className={styles.profile__settingsField}>
                              <span className={styles.profile__settingsLabel}>
                                 Дней в неделю
                              </span>
                              <input
                                 className={styles.profile__settingsInput}
                                 type="number"
                                 min={1}
                                 max={7}
                                 step={1}
                                 value={workDaysPerWeek}
                                 onChange={(event) =>
                                    setWorkDaysPerWeek(event.target.value)
                                 }
                                 placeholder="0"
                              />
                           </label>
                           <div className={styles.profile__settingsField}>
                              <span className={styles.profile__settingsLabel}>
                                 Норма в неделю
                              </span>
                              <p className={styles.profile__settingsValue}>
                                 {weeklyTarget !== null
                                    ? `${formatMoneyWhole(weeklyTarget)} ₽`
                                    : "—"}
                              </p>
                           </div>
                        </>
                     ) : null}
                     {saveError ? (
                        <p className={styles.profile__settingsError}>
                           {saveError}
                        </p>
                     ) : null}
                     <div className={styles.profile__settingsActions}>
                        <button
                           className={styles.profile__settingsSave}
                           type="button"
                           onClick={handleSaveSettings}
                           disabled={isSaving}
                        >
                           {isSaving ? "Сохранение..." : "Сохранить"}
                        </button>
                     </div>
                  </div>
               ) : null}
            </section>
            <div className={styles.profile__actions}>
               <button
                  className={styles.profile__logout}
                  type="button"
                  onClick={handleLogout}
               >
                  Выйти
               </button>
            </div>
         </section>
      </main>
   );
}
