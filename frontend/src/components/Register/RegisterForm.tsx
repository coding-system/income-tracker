import styles from "./RegisterForm.module.scss";

export function RegisterForm() {
   return (
      <section className={styles.register}>
         <header className={styles.register__header}>
            <h2 className={styles.register__title}>Регистрация</h2>
            <p className={styles.register__subtitle}>
               Начните вести учет сразу
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
                  Пароль
               </label>
               <input
                  id="register-password"
                  className={styles.register__input}
                  type="password"
                  placeholder="Минимум 6 символов"
               />
            </div>
            <div className={styles.register__actions}>
               <button className={styles.register__button} type="button">
                  Зарегистрироваться
               </button>
               <button className={styles.register__buttonGhost} type="button">
                  Перейти ко входу
               </button>
            </div>
         </form>
      </section>
   );
}
