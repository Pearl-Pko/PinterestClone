"use client";

import { createContext, useEffect } from "react";
import { useLogin, useRefreshToken } from "../service/useUser";
import { CreateUserSchema } from "../schema/user";
import api from "../utils/api";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import { clearSession } from "../actions/auth";

interface Props {
  children: React.ReactNode;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ children }: Props) => {
  const router = useRouter();
  const login = async (user: CreateUserSchema) => {};

  const signup = async () => {};

  const refreshToken = async () => {};

  const logout = async () => {
    await clearSession();
    // useLogin();
    router.push("/login");
  };

  useEffect(() => {
    const instanceId = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };
        if (
          error.response?.status === 401 &&
          error?.config?.url !== "auth/refresh"
        ) {
          try {
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              await useRefreshToken();
              return api(originalRequest);
            }
          } catch (error) {
            await logout();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(instanceId);
  }, [api]);

  return (
    <SessionContext.Provider value={{ login, signup, refreshToken, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
