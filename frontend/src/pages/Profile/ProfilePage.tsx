import avatarPlaceholder from "../../assets/images/profile-blank.png";
import styles from "./ProfilePage.module.scss";

export function ProfilePage() {
   const userName = localStorage.getItem("userName") ?? "Пользователь";
   const userEmail = localStorage.getItem("userEmail") ?? "user@example.com";

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
         </section>
      </main>
   );
}
