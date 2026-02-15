import styles from "./BurgerButton.module.scss";

type BurgerButtonProps = {
   isOpen: boolean;
   onClick: () => void;
};

export function BurgerButton({ isOpen, onClick }: BurgerButtonProps) {
   return (
      <button
         className={`${styles.button} ${isOpen ? styles["button--active"] : ""}`}
         type="button"
         aria-label="Toggle menu"
         aria-expanded={isOpen}
         onClick={onClick}
      >
         <span className={styles.button__line} />
         <span className={styles.button__line} />
         <span className={styles.button__line} />
      </button>
   );
}
