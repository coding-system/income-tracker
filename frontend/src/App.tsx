import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader/AppHeader";
import styles from "./App.module.scss";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { RegisterPage } from "./pages/Register/RegisterPage";

function App() {
   const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

   return (
      <div className={styles.app}>
         <AppHeader />
         <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
               path="/profile"
               element={
                  isAuthenticated ? (
                     <ProfilePage />
                  ) : (
                     <Navigate to="/login" replace />
                  )
               }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      </div>
   );
}

export default App;
