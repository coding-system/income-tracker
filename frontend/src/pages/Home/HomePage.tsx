import { QuickShiftEntry } from "../../components/QuickShiftEntry";
import styles from "./HomePage.module.scss";

export function HomePage() {
   return (
      <main className={styles.home}>
         <QuickShiftEntry />
      </main>
   );
}
