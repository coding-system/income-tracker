import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./BurgerMenu.module.scss";

type BurgerMenuProps = {
   isOpen: boolean;
   onClose: () => void;
};

export function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
   const [theme, setTheme] = useState<"light" | "dark">(() => {
      const current = document.documentElement.getAttribute("data-theme");
      return current === "light" ? "light" : "dark";
   });
   const [isAnimating, setIsAnimating] = useState(false);

   const handleToggleTheme = () => {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      setTheme(next === "light" ? "light" : "dark");
      setIsAnimating(true);
      window.setTimeout(() => setIsAnimating(false), 300);
   };

   return (
      <>
         <div
            className={`${styles.menu__overlay} ${!isOpen ? styles["menu__overlay--hidden"] : ""}`}
            onClick={onClose}
         />
         <aside
            className={`${styles.menu} ${!isOpen ? styles["menu--hidden"] : ""}`}
         >
            <div className={styles.menu__header}>
               <h2 className={styles.menu__title}>Меню</h2>
               <button
                  className={styles.menu__closeButton}
                  type="button"
                  aria-label="Закрыть меню"
                  onClick={onClose}
               >
                  <span className={styles.menu__closeLine} />
                  <span className={styles.menu__closeLine} />
               </button>
            </div>
            <nav className={styles.menu__nav}>
               <Link
                  to="/login"
                  className={styles.menu__link}
                  onClick={onClose}
               >
                  Вход
               </Link>
               <Link
                  to="/register"
                  className={styles.menu__link}
                  onClick={onClose}
               >
                  Регистрация
               </Link>

               <button
                  type="button"
                  className={`${styles.menu__link} ${styles.menu__themeToggle} ${
                     isAnimating ? styles["menu__themeToggle--animating"] : ""
                  }`}
                  aria-label="Сменить тему"
                  onClick={handleToggleTheme}
               >
                  <span
                     className={`${styles.menu__themeIcon} ${
                        theme === "light"
                           ? styles["menu__themeIcon--active"]
                           : styles["menu__themeIcon--inactive"]
                     } material-symbols-outlined`}
                     aria-hidden="true"
                  >
                     light_mode
                  </span>
                  <span
                     className={`${styles.menu__themeIcon} ${
                        theme === "dark"
                           ? styles["menu__themeIcon--active"]
                           : styles["menu__themeIcon--inactive"]
                     } material-symbols-outlined`}
                     aria-hidden="true"
                  >
                     dark_mode
                  </span>
               </button>
            </nav>
         </aside>
      </>
   );
}
