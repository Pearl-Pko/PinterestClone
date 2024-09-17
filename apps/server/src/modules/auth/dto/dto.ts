import { IsNotEmpty } from "class-validator";

export class ChangePassword {
    @IsNotEmpty()
    oldPassword: string;

    @IsNotEmpty()
    newPassword: string;
}