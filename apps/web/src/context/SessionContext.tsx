"use client";

import { createContext } from "react";
import { useLogin } from "../service/useUser";
import { CreateUserSchema } from "../schema/user";

interface Props {
  children: React.ReactNode;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ children }: Props) => {
  const login = async (user: CreateUserSchema) => {
    // useLogin();
  };

  const signup = async () => {

  };

  const refreshToken = async () => {

  };

  const logout = async () => {
  };

  return <SessionContext.Provider value={{ login, signup, refreshToken, logout }}>
    {children}
  </SessionContext.Provider>;
};
