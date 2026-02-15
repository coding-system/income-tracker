import { useState } from "react";
import { BurgerButton } from "../BurgerButton/BurgerButton";
import { BurgerMenu } from "../BurgerMenu/BurgerMenu";
import styles from "./AppHeader.module.scss";

export function AppHeader() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   const handleToggleMenu = () => {
      setIsMenuOpen((prev) => !prev);
   };

   const handleCloseMenu = () => {
      setIsMenuOpen(false);
   };

   return (
      <>
         <header className={styles.header}>
            <div className={styles.header__brand}>
               <span className={styles.header__title}>Income Tracker</span>
            </div>
            <div className={styles.header__actions}>
               <BurgerButton isOpen={isMenuOpen} onClick={handleToggleMenu} />
            </div>
         </header>
         <BurgerMenu isOpen={isMenuOpen} onClose={handleCloseMenu} />
      </>
   );
}
