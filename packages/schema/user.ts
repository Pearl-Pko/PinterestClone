import {User, Post, Prisma, $Enums, Gender, Account} from "@prisma/client";
import {z} from "zod";
import {
    IsArray,
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsUUID,
} from "class-validator";
import {PickType} from "nestjs-mapped-types";
import {Exclude, Expose} from "class-transformer";
import {IsStrongPassword} from "./util";

export class UserEntity implements User {
    @IsUUID()
    id: string;

    @IsEmail()
    @IsOptional()
    email: string | null;

    @IsNotEmpty()
    username: string;

    @IsOptional()
    first_name: string | null;

    @IsOptional()
    last_name: string | null;

    @IsOptional()
    about: string | null;

    @IsOptional()
    website: string | null;

    @IsNotEmpty()
    @IsStrongPassword()
    @IsOptional()
    @Exclude({toPlainOnly: true})
    password: string | null;

    @IsOptional()
    date_of_birth: Date | null;

    @IsEnum(Gender)
    gender: Gender | null;

    @IsOptional()
    country: string | null;

    @IsDate()
    created_at: Date;

    @IsDate()
    @IsNotEmpty()
    updated_at: Date;

    @IsOptional()
    @Exclude()
    reset_token: string | null;

    @IsOptional()
    @Exclude()
    reset_token_expires_at: Date | null;

    @Exclude()
    @IsArray()
    Account: Account[];

    @Expose({name: "full_name"})
    getFullName() {
        return this.first_name + " " + this.last_name;
    }

    @Expose({name: "hasPassword"})
    getHasPassword() {
        return !!this.password;
    }

    @Expose({name: "providers"})
    getProviders() {
        return new Set(this.Account.map((account) => account.provider));
    }

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}

// export type UserEntityDto = {

// }

export type UserEntityDto = Omit<
    UserEntity,
    "password" | "reset_token" | "reset_token_expires_at"
> & {full_name: string; providers: string[]; hasPassword: boolean};

type a = Partial<UserEntity>;

export class CreateUserDto
    extends PickType(UserEntity, ["email", "password"] as const)
    implements Omit<Prisma.UserCreateInput, "username">
{
    email: string;
    password: string;
}

export class LoginUserDto
    extends PickType(UserEntity, ["email", "password"] as const)
    implements Omit<Prisma.UserCreateInput, "username"> {}

export class ChangePassword {
    @IsNotEmpty()
    oldPassword: string;

    @IsStrongPassword()
    newPassword: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @IsStrongPassword()
    newPassword: string;
}

export class UnlinkProviderDto {
    @IsNotEmpty()
    provider: string;
}

export class SetPasswordDto {
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
}
