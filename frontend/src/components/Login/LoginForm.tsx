import styles from "./LoginForm.module.scss";

export function LoginForm() {
   return (
      <section className={styles.login}>
         <header className={styles.login__header}>
            <h2 className={styles.login__title}>С возвращением</h2>
            <p className={styles.login__subtitle}>Войдите, чтобы продолжить</p>
         </header>
         <form className={styles.login__form}>
            <div className={styles.login__row}>
               <label className={styles.login__label} htmlFor="login-email">
                  Email
               </label>
               <input
                  id="login-email"
                  className={styles.login__input}
                  type="email"
                  placeholder="you@example.com"
               />
            </div>
            <div className={styles.login__row}>
               <label className={styles.login__label} htmlFor="login-password">
                  Пароль
               </label>
               <input
                  id="login-password"
                  className={styles.login__input}
                  type="password"
                  placeholder="Ваш пароль"
               />
            </div>
            <div className={styles.login__actions}>
               <button className={styles.login__button} type="button">
                  Войти
               </button>
               <button className={styles.login__buttonGhost} type="button">
                  Создать аккаунт
               </button>
            </div>
         </form>
      </section>
   );
}
