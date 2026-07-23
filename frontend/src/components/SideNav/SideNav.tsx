import { useState } from "react";
import { Link } from "react-router-dom";
import { clearAuth } from "../../api/authClient";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { applyTheme, getInitialTheme, setStoredTheme } from "../../utils/theme";
import styles from "./SideNav.module.scss";

export function SideNav() {
   const isAuthenticated = useAuthStatus();
   const [theme, setTheme] = useState<"light" | "dark">(() =>
      getInitialTheme(),
   );
   const [isAnimating, setIsAnimating] = useState(false);

   const handleToggleTheme = () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
      setTheme(next === "light" ? "light" : "dark");
      setIsAnimating(true);
      window.setTimeout(() => setIsAnimating(false), 300);
   };

   const handleLogout = () => {
      clearAuth();
   };

   return (
      <aside className={styles.sideNav}>
         <Link className={styles.sideNav__brand} to="/">
            <span className={styles.sideNav__brandSecondary}>income</span>
         </Link>

         <nav className={styles.sideNav__nav}>
            <Link to="/" className={styles.sideNav__link}>
               <span className="material-symbols-outlined">home</span>
               Главная
            </Link>

            {isAuthenticated ? (
               <>
                  <Link to="/profile" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">person</span>
                     Профиль
                  </Link>
                  <Link to="/shift/new" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">
                        local_taxi
                     </span>
                     Новая смена
                  </Link>
                  <Link to="/services" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">build</span>
                     Сервис
                  </Link>
                  <Link to="/history" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">
                        import_contacts
                     </span>
                     История
                  </Link>
                  <button
                     type="button"
                     className={`${styles.sideNav__link} ${styles.sideNav__logout}`}
                     onClick={handleLogout}
                  >
                     <span className="material-symbols-outlined">logout</span>
                     Выйти
                  </button>
               </>
            ) : (
               <>
                  <Link to="/login" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">login</span>
                     Вход
                  </Link>
                  <Link to="/register" className={styles.sideNav__link}>
                     <span className="material-symbols-outlined">
                        app_registration
                     </span>
                     Регистрация
                  </Link>
               </>
            )}
         </nav>

         <button
            type="button"
            className={`${styles.sideNav__link} ${styles.sideNav__themeToggle} ${
               isAnimating ? styles["sideNav__themeToggle--animating"] : ""
            }`}
            aria-label="Сменить тему"
            onClick={handleToggleTheme}
         >
            <span className={styles.sideNav__themeIconStack}>
               <span
                  className={`${styles.sideNav__themeIcon} ${
                     theme === "light"
                        ? styles["sideNav__themeIcon--active"]
                        : styles["sideNav__themeIcon--inactive"]
                  } material-symbols-outlined`}
                  aria-hidden="true"
               >
                  light_mode
               </span>
               <span
                  className={`${styles.sideNav__themeIcon} ${
                     theme === "dark"
                        ? styles["sideNav__themeIcon--active"]
                        : styles["sideNav__themeIcon--inactive"]
                  } material-symbols-outlined`}
                  aria-hidden="true"
               >
                  dark_mode
               </span>
            </span>
            Тема
         </button>
      </aside>
   );
}
