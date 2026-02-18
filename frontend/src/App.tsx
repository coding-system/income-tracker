import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader/AppHeader";
import { useAuthStatus } from "./hooks/useAuthStatus";
import styles from "./App.module.scss";
import { HomePage } from "./pages/Home/HomePage";
import { HistoryPage } from "./pages/History/HistoryPage";
import { LoginPage } from "./pages/Login/LoginPage";
import { NewShiftPage } from "./pages/NewShift/NewShiftPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { RegisterPage } from "./pages/Register/RegisterPage";
import { ShiftDetailsPage } from "./pages/ShiftDetails/ShiftDetailsPage";

function App() {
   const isAuthenticated = useAuthStatus();

   return (
      <div className={styles.app}>
         <AppHeader />
         <main className={styles.app__content}>
            <Routes>
               <Route path="/" element={<HomePage />} />
               <Route
                  path="/login"
                  element={
                     isAuthenticated ? (
                        <Navigate to="/profile" replace />
                     ) : (
                        <LoginPage />
                     )
                  }
               />
               <Route
                  path="/register"
                  element={
                     isAuthenticated ? (
                        <Navigate to="/profile" replace />
                     ) : (
                        <RegisterPage />
                     )
                  }
               />
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
               <Route
                  path="/history"
                  element={
                     isAuthenticated ? (
                        <HistoryPage />
                     ) : (
                        <Navigate to="/login" replace />
                     )
                  }
               />
               <Route
                  path="/history/:id"
                  element={
                     isAuthenticated ? (
                        <ShiftDetailsPage />
                     ) : (
                        <Navigate to="/login" replace />
                     )
                  }
               />
               <Route
                  path="/shifts/new"
                  element={
                     isAuthenticated ? (
                        <NewShiftPage />
                     ) : (
                        <Navigate to="/login" replace />
                     )
                  }
               />
               <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
         </main>
      </div>
   );
}

export default App;
