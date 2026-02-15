import { useEffect, useState } from "react";

const AUTH_CHANGED_EVENT = "auth-changed";

export const notifyAuthChanged = () => {
   window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const getAccessToken = () => localStorage.getItem("accessToken");

export const useAuthStatus = () => {
   const [isAuthenticated, setIsAuthenticated] = useState(() =>
      Boolean(getAccessToken()),
   );

   useEffect(() => {
      const update = () => setIsAuthenticated(Boolean(getAccessToken()));
      window.addEventListener("storage", update);
      window.addEventListener(AUTH_CHANGED_EVENT, update);

      return () => {
         window.removeEventListener("storage", update);
         window.removeEventListener(AUTH_CHANGED_EVENT, update);
      };
   }, []);

   return isAuthenticated;
};
