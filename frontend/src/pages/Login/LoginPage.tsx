import styles from "./LoginPage.module.scss";
import { LoginForm } from "../../components/Login/LoginForm";

export function LoginPage() {
   return (
      <main className={styles.page}>
         <div className={styles.page__panel}>
            <LoginForm />
         </div>
      </main>
   );
}
