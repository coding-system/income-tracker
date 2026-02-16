import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterForm.module.scss";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function RegisterForm() {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [name, setName] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [status, setStatus] = useState<{
      type: "error" | "success";
      text: string;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setStatus(null);

      if (!name.trim()) {
         setStatus({ type: "error", text: "Введите имя" });
         return;
      }

      if (password !== confirmPassword) {
         setStatus({ type: "error", text: "Пароли не совпадают" });
         return;
      }

      setIsLoading(true);
      try {
         const response = await fetch(`${apiBase}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, password }),
         });

         if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Ошибка регистрации");
         }

         setStatus({ type: "success", text: "Пользователь создан" });
         setPassword("");
         setConfirmPassword("");
      } catch (error) {
         const message =
            error instanceof Error ? error.message : "Ошибка регистрации";
         setStatus({ type: "error", text: message });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <section className={styles.register}>
         <header className={styles.register__header}>
            <h2 className={styles.register__title}>Регистрация</h2>
            <p className={styles.register__subtitle}>
               Начните вести учет сразу
            </p>
         </header>
         <form className={styles.register__form} onSubmit={handleSubmit}>
            {status ? (
               <div
                  className={`${styles.register__status} ${
                     status.type === "error"
                        ? styles["register__status--error"]
                        : styles["register__status--success"]
                  }`}
               >
                  {status.text}
               </div>
            ) : null}
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-name"
               >
                  Имя
               </label>
               <input
                  id="register-name"
                  className={styles.register__input}
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
               />
            </div>
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-email"
               >
                  Email
               </label>
               <input
                  id="register-email"
                  className={styles.register__input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
               />
            </div>
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-password"
               >
                  Пароль
               </label>
               <input
                  id="register-password"
                  className={styles.register__input}
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
               />
            </div>
            <div className={styles.register__row}>
               <label
                  className={styles.register__label}
                  htmlFor="register-confirm"
               >
                  Подтвердите пароль
               </label>
               <input
                  id="register-confirm"
                  className={styles.register__input}
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
               />
            </div>
            <div className={styles.register__actions}>
               <button
                  className={styles.register__button}
                  type="submit"
                  disabled={isLoading}
               >
                  {isLoading ? "Загрузка..." : "Зарегистрироваться"}
               </button>
               <button
                  className={styles.register__buttonGhost}
                  type="button"
                  onClick={() => navigate("/login")}
               >
                  Перейти ко входу
               </button>
            </div>
         </form>
      </section>
   );
}
