import { $Enums, Prisma } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto implements Prisma.UserCreateInput {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    user_name: string;

    @IsOptional()
    first_name?: string;

    @IsOptional()
    last_name?: string;

    @IsOptional()
    about?: string;

    @IsOptional()
    website?: string;

    @IsOptional()
    date_of_birth?: string;

    @IsOptional()
    country?: string;
}
