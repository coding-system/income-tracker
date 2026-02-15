import { Link } from "react-router-dom";
import styles from "./BurgerMenu.module.scss";

type BurgerMenuProps = {
   isOpen: boolean;
   onClose: () => void;
};

export function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
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
               <h2 className={styles.menu__title}>Menu</h2>
               <button
                  className={styles.menu__closeButton}
                  type="button"
                  aria-label="Close menu"
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
                  Login
               </Link>
               <Link
                  to="/register"
                  className={styles.menu__link}
                  onClick={onClose}
               >
                  Register
               </Link>
            </nav>
         </aside>
      </>
   );
}
