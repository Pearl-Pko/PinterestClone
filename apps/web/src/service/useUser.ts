import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SetPasswordDto,
  UnlinkProviderDto,
  UserEntityDto,
} from "@schema/user";
import api from "../utils/api";
import { classToPlain, instanceToPlain } from "class-transformer";

export const useLogin = async (data: {}) => {
  return await api.post("user/login", data);
};

export const useSignUp = async (data: {}) => {
  return await api.post("user/signup", data);
};

export const useSignOut = async () => {
  return await api.post("user/logout");
};

export const useRefreshToken = async () => {
  return await api.post("user/refresh");
};

export const useGetProfile = async () => {
  return (await api.get("user/profile")).data as UserEntityDto;
};

export const useForgotPassword = async (data: ForgotPasswordDto) => {
  return (await api.post("user/forgot-password", data)).data;
};

export const useResetPassword = async (data: ResetPasswordDto) => {
  return (await api.post("user/reset-password", data)).data;
};

export const useUnlinkProvider = async (data: UnlinkProviderDto) => {
  return (await api.post("user/unlink-provider", data)).data;
};

export const useSetPassword = async (data: SetPasswordDto) => {
  return (await api.post("user/set-password", data)).data;
};