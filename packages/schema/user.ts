import { User, Post, Prisma, $Enums } from "@prisma/client";
import {z} from "zod"
import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID,  } from 'class-validator';

// z.object({
//     id: z.string(),
//     email: z.string().email(),
//     username: z.string(),
//     first_name: z.string(),
//     last_name: z.string(),
//     about: z.string(),
//     website: z.string(), 
//     password: z.string(),
//     date_of_birth: z.string(),
//     gender: z.string(),
//     country: z.string(),
//     created_at: z.string().datetime(),
//     updated_at: z.string().datetime(),
//     reset_token: z.string(), 
//     reset_token_expires_at: z.string().datetime()
// }) satisfies z.ZodType<User>
// const GenderEnum = z.enum(['Male', 'Female', 'Other']); 

// export const UserEntity = z.object({
//     id: z.string().uuid(), 
//     email: z.string().email(), 
//     username: z.string(), 
//     first_name: z.string().nullable(),
//     last_name: z.string().nullable(), 
//     about: z.string().nullable(),
//     website: z.string().url().nullable(),
//     password: z.string(), 
//     date_of_birth: z.coerce.date().nullable(), 
//     gender: GenderEnum.nullable(), 
//     country: z.string().nullable(), 
//     created_at: z.date(), 
//     updated_at: z.date(), //
//     reset_token: z.string().nullable(), 
//     reset_token_expires_at: z.coerce.date().nullable(), 
  
// }) satisfies z.ZodType<User>



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

    @IsNotEmpty()
    created_at: Date;

    @IsNotEmpty()
    updated_at: Date;

    @IsOptional()
    reset_token: string | null;


    @IsOptional()
    reset_token_expires_at: Date | null;
} 


export class CreateUserDto extends PickType(UserEntity, ["email", "password"] as const) implements Omit<Prisma.UserCreateInput, 'username'> {}

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