import { Link } from "react-router-dom";
import avatarPlaceholder from "../../assets/images/profile-blank.png";
import styles from "./HeaderAuth.module.scss";

export function HeaderAuth() {
   const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

   if (isAuthenticated) {
      return (
         <Link className={styles["header-auth__avatar-link"]} to="/profile">
            <span
               className={styles["header-auth__avatar"]}
               aria-label="Профиль"
            >
               <img
                  className={styles["header-auth__avatar-image"]}
                  src={avatarPlaceholder}
                  alt="Аватар"
               />
            </span>
         </Link>
      );
   }

   return (
      <Link className={styles["header-auth__login"]} to="/login">
         <span className={styles["header-auth__login-text"]}>Войти</span>
      </Link>
   );
}
