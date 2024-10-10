import type { LoginUserDto } from "@schema/user";

type SessionContextType = {
    login: (user: LoginUserDto) => void;
    signup: () => void;
    refreshToken: () => void;
    logout: () => void;

}