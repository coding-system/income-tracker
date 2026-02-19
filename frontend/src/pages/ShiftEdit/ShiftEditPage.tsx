import { ShiftEditForm } from "../../components/ShiftEditForm";
import styles from "./ShiftEditPage.module.scss";

export function ShiftEditPage() {
   return (
      <main className={styles.page}>
         <ShiftEditForm />
      </main>
   );
}
