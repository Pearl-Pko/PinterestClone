import { $Enums, Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto implements Omit<Prisma.UserCreateInput, 'username'> {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}
