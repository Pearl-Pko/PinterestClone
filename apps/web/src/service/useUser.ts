import api from "../utils/api"

export const useLogin = async (data: {}) => {
    return await api.post("auth/login", data)
}

export const useSignUp = async (data: {}) => {
    return await api.post("auth/signup", data)
}
