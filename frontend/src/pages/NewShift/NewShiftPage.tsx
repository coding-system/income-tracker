import { NewShiftForm } from "../../components/NewShiftForm";
import styles from "./NewShiftPage.module.scss";

export function NewShiftPage() {
   return (
      <main className={styles.page}>
         <NewShiftForm />
      </main>
   );
}
