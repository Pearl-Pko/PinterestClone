import { User, Post, Prisma, $Enums } from "@prisma/client";
import {z} from "zod"
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID,  } from 'class-validator';
import { PickType } from "nestjs-mapped-types";
import { Exclude, Expose } from "class-transformer";

export class UserEntity implements User {
    @IsUUID()
    id: string;

    @IsEmail() 
    email: string;

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
    password: string;

    @IsOptional()
    date_of_birth: Date | null;

    @IsEnum(["Male", "Female", "Other"])
    gender: $Enums.Gender | null;

    @IsOptional()
    country: string | null;

    @IsDate()
    created_at: Date;

    @IsDate()
    @IsNotEmpty()
    updated_at: Date;

    @IsOptional()
    reset_token: string | null;


    @IsOptional()
    reset_token_expires_at: Date | null;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
      }
} 


// export type UserEntityDto = {

// }

export type UserEntityDto = Omit<UserEntity, "password" | "reset_token" | "reset_token_expires_at"> & {full_name: string}

export class UserEntitySerializer extends UserEntity  {
    @Exclude()
    password: string;

    @Exclude() 
    reset_token: string | null;

    @Exclude()
    reset_token_expires_at: Date | null;

    @Expose({name: "full_name"})
    getFullName() {
        return this.first_name + " " + this.last_name
    }
}

type a = Partial<UserEntity>



export class CreateUserDto extends PickType(UserEntity, ["email", "password"] as const) implements Omit<Prisma.UserCreateInput, 'username'> {}

export class LoginUserDto extends PickType(UserEntity, ["email", "password"] as const) implements Omit<Prisma.UserCreateInput, 'username'> {}


export class ChangePassword {
    @IsNotEmpty()
    oldPassword: string;

    @IsNotEmpty()
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
    newPassword: string;
}

