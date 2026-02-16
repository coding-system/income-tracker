import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../hooks/useAuthStatus";
import styles from "./LoginForm.module.scss";

type TokenPair = {
   accessToken: string;
   refreshToken: string;
};

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function LoginForm() {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setStatus(null);

      setIsLoading(true);
      try {
         const response = await fetch(`${apiBase}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
         });

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Ошибка входа");
         }

         const tokens = (await response.json()) as TokenPair;
         localStorage.setItem("accessToken", tokens.accessToken);
         localStorage.setItem("refreshToken", tokens.refreshToken);
         notifyAuthChanged();

         setStatus({ type: "success", text: "Вход выполнен" });
         setPassword("");
         navigate("/profile", { replace: true });
      } catch (error) {
         const message =
            error instanceof Error ? error.message : "Ошибка входа";
         setStatus({ type: "error", text: message });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <section className={styles.login}>
         <header className={styles.login__header}>
            <h2 className={styles.login__title}>С возвращением</h2>
            <p className={styles.login__subtitle}>Войдите, чтобы продолжить</p>
         </header>
         <form className={styles.login__form} onSubmit={handleSubmit}>
            {status ? (
               <div
                  className={`${styles.login__status} ${
                     status.type === "error"
                        ? styles["login__status--error"]
                        : styles["login__status--success"]
                  }`}
               >
                  {status.text}
               </div>
            ) : null}
            <div className={styles.login__row}>
               <label className={styles.login__label} htmlFor="login-email">
                  Email
               </label>
               <input
                  id="login-email"
                  className={styles.login__input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
               />
            </div>
            <div className={styles.login__actions}>
               <button
                  className={styles.login__button}
                  type="submit"
                  disabled={isLoading}
               >
                  {isLoading ? "Загрузка..." : "Войти"}
               </button>
               <button
                  className={styles.login__buttonGhost}
                  type="button"
                  onClick={() => navigate("/register")}
               >
                  Создать аккаунт
               </button>
            </div>
         </form>
      </section>
   );
}
