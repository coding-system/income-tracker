import { Link } from "react-router-dom";
import styles from "./HomePage.module.scss";

export function HomePage() {
   return (
      <main className={styles.home}>
         <section className={styles.home__hero}>
            <div className={styles.home__heroContent}>
               <p className={styles.home__eyebrow}>Деньги под контролем</p>
               <h1 className={styles.home__title}>
                  Приведите доходы в порядок и держите цель в фокусе
               </h1>
               <p className={styles.home__subtitle}>
                  Простой трекер доходов, расходов и целей. Записывайте операции
                  за 20 секунд и видьте динамику за день, неделю и месяц.
               </p>
               <div className={styles.home__actions}>
                  <Link className={styles.home__primaryAction} to="/register">
                     Начать учет
                  </Link>
                  <Link className={styles.home__secondaryAction} to="/login">
                     Войти
                  </Link>
               </div>
            </div>
         
         </section>
      </main>
   );
}
