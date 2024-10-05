import api from "../utils/api"

export const useLogin = async (data: {}) => {
    return await api.post("user/login", data)
}

export const useSignUp = async (data: {}) => {
    return await api.post("user/signup", data)
}

export const useSignOut  = async () => {
    return await api.post("user/logout");
}

export const useRefreshToken = async () => {
    return await api.post("user/refresh");
}
