import styles from "./RegisterForm.module.scss";

export function RegisterForm() {
   return (
      <section className={styles.register}>
         <header className={styles.register__header}>
            <h2 className={styles.register__title}>Create account</h2>
            <p className={styles.register__subtitle}>
               Start tracking daily entries
            </p>
         </header>
         <form className={styles.register__form}>
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-email"
               >
                  Email
               </label>
               <input
                  id="register-email"
                  className={styles.register__input}
                  type="email"
                  placeholder="you@example.com"
               />
            </div>
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-password"
               >
                  Password
               </label>
               <input
                  id="register-password"
                  className={styles.register__input}
                  type="password"
                  placeholder="At least 6 characters"
               />
            </div>
            <div className={styles.register__actions}>
               <button className={styles.register__button} type="button">
                  Register
               </button>
               <button className={styles.register__buttonGhost} type="button">
                  Go to login
               </button>
            </div>
         </form>
      </section>
   );
}
