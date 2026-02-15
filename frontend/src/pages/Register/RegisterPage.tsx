import styles from "./RegisterPage.module.scss";
import { RegisterForm } from "../../components/Register/RegisterForm";

export function RegisterPage() {
   return (
      <main className={styles.page}>
         <div className={styles.page__panel}>
            <RegisterForm />
         </div>
      </main>
   );
}
