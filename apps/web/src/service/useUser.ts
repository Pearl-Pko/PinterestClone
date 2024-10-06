import { ForgotPasswordDto, UserEntityDto, UserEntitySerializer } from "@schema/user";
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
    return (await api.post("user/forgot-password", data)).data
}