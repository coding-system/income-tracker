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
};

export function ProfilePage() {
   const navigate = useNavigate();
   const isAuthenticated = useAuthStatus();
   const [profile, setProfile] = useState<ProfileData | null>(null);
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
            if (data.name) {
               localStorage.setItem("userName", data.name);
            }
            localStorage.setItem("userEmail", data.email);
         } catch {
            // ignore and keep cached values
         }
      };

      void loadProfile();
   }, []);

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
                  <p className={styles.profile__label}>Статус</p>
                  <p className={styles.profile__value}>Активный пользователь</p>
               </div>
               <div className={styles.profile__infoItem}>
                  <p className={styles.profile__label}>План</p>
                  <p className={styles.profile__value}>Стандартный</p>
               </div>
               <div className={styles.profile__infoItem}>
                  <p className={styles.profile__label}>Регион</p>
                  <p className={styles.profile__value}>Россия</p>
               </div>
            </div>
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
