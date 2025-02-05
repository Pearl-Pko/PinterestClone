import {User, Post, Prisma, $Enums, Gender, Account} from "@prisma/client";
import {z} from "zod";
import {
    IsArray,
    IsDate,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    Length,
    Matches,
    MaxDate,
    MinLength,
} from "class-validator";
import {PartialType, PickType} from "nestjs-mapped-types";
import {Exclude, Expose, Transform, Type} from "class-transformer";
import {IsStrongPassword} from "./util";

@Exclude()
export class UserEntity implements User {
    @IsUUID()
    @Expose({
        groups: ["user", "token", "user.private", "user.embed"],
    })
    id: string;

    @IsEmail()
    @IsOptional()
    @Expose({groups: ["token", "user.private"]})
    email: string | null;

    @IsNotEmpty()
    @Length(2, 30)
    @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message:
            "Username must be a slug: lowercase letters, numbers, and hyphens only.",
    })
    @Expose({groups: ["user", "token", "user.private", "user.embed"]})
    username: string;

    @IsOptional()
    @Expose({
        groups: ["user", "token", "user.private", "user.embed"],
    })
    first_name: string | null;

    @IsOptional()
    @Expose({
        groups: ["user", "token", "user.private", "user.embed"],
    })
    last_name: string | null;

    @IsOptional()
    @Expose({groups: ["user", "token", "user.private", "user.embed"]})
    displayPhoto: string | null;

    @IsOptional()
    @Expose({groups: ["user", "user.private"]})
    language: string | null;

    @IsOptional()
    @Expose({groups: ["user", "user.private"]})
    about: string | null;

    @IsOptional()
    @Expose({groups: ["user", "user.private"]})
    website: string | null;

    @IsNotEmpty()
    @IsStrongPassword()
    @IsOptional()
    @Exclude({toPlainOnly: true})
    password: string | null;

    @IsOptional()
    @Expose({groups: ["user.private"]})
    @Type(() => Date)
    @IsDate({message: "Date must be a valid ISO8601 string"})
    @MaxDate(() => new Date(), {
        message: "Date of birth cannot be in the future",
    })
    date_of_birth: Date | null;

    @Expose({groups: ["user.private"]})
    @IsEnum(Gender)
    gender: Gender | null;

    @IsOptional()
    @Expose({groups: ["user.private"]})
    country: string | null;

    @IsDate()
    @Expose({groups: ["user.private"]})
    created_at: Date;

    @IsDate()
    @IsNotEmpty()
    @Expose({groups: ["user.private"]})
    updated_at: Date;

    @IsOptional()
    @Exclude()
    reset_token: string | null;

    @IsOptional()
    @Exclude()
    reset_token_expires_at: Date | null;

    @Exclude()
    @IsArray()
    Account?: Account[];

    @Expose({
        name: "full_name",
        groups: ["user", "user.private", "token", "user.embed"],
    })
    getFullName() {
        return this.first_name + " " + this.last_name;
    }

    @Expose({name: "hasPassword", groups: ["user.private"]})
    getHasPassword() {
        return !!this.password;
    }

    @Expose({name: "providers", groups: ["user.private"]})
    getProviders() {
        return new Set(this.Account?.map((account) => account.provider));
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
    @Expose()
    email: string;
    password: string;
}

export class LoginUserDto
    extends PickType(UserEntity, ["email", "password"] as const)
    implements Omit<Prisma.UserCreateInput, "username">
{
    @Expose()
    email: string;
}

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

export class EditProfileDto extends PartialType(
    PickType(UserEntity, [
        "first_name",
        "last_name",
        "language",
        "about",
        "website",
        "date_of_birth",
        "gender",
        "country",
    ] as const)
) {}

export class ChangeUsernameDto extends PickType(UserEntity, [
    "username",
] as const) {
    @Expose()
    username: string;
}
