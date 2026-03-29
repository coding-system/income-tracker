import { ServiceVisitForm } from "../../components/ServiceVisitForm/ServiceVisitForm";
import styles from "./ServiceNewPage.module.scss";

export function ServiceNewPage() {
   return (
      <main className={styles.page}>
         <ServiceVisitForm />
      </main>
   );
}
