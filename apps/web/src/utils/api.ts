import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useRefreshToken } from "../service/useUser";
import { clearSession } from "../actions/auth";
import { redirect } from "next/navigation";

const api = axios.create({ baseURL: "/api" });



export default api;
