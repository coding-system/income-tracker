import { ServiceEditForm } from "../../components/ServiceEditForm/ServiceEditForm";
import styles from "./ServiceEditPage.module.scss";

export function ServiceEditPage() {
   return (
      <main className={styles.page}>
         <ServiceEditForm />
      </main>
   );
}
