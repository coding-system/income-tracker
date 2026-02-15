import { getAccessToken, notifyAuthChanged } from "../hooks/useAuthStatus";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type TokenPair = {
   accessToken: string;
   refreshToken: string;
};

export const clearAuth = () => {
   localStorage.removeItem("accessToken");
   localStorage.removeItem("refreshToken");
   localStorage.removeItem("userName");
   localStorage.removeItem("userEmail");
   notifyAuthChanged();
};

const refreshAccessToken = async () => {
   const refreshToken = localStorage.getItem("refreshToken");
   if (!refreshToken) {
      clearAuth();
      return false;
   }

   try {
      const response = await fetch(`${apiBase}/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
         clearAuth();
         return false;
      }

      const tokens = (await response.json()) as TokenPair;
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      notifyAuthChanged();
      return true;
   } catch {
      clearAuth();
      return false;
   }
};

export const fetchWithAuth = async (path: string, init?: RequestInit) => {
   const accessToken = getAccessToken();
   if (!accessToken) {
      throw new Error("NO_AUTH");
   }

   const headers = new Headers(init?.headers);
   headers.set("Authorization", `Bearer ${accessToken}`);

   const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers,
   });

   if (response.status !== 401) {
      return response;
   }

   const refreshed = await refreshAccessToken();
   if (!refreshed) {
      return response;
   }

   const retryHeaders = new Headers(init?.headers);
   retryHeaders.set("Authorization", `Bearer ${getAccessToken()}`);

   return fetch(`${apiBase}${path}`, {
      ...init,
      headers: retryHeaders,
   });
};
