import {Exclude, Expose, Type} from "class-transformer";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import {IsNumber, IsOptional, Min} from "class-validator";
import {PostEntity} from "./post";

export class PaginatedQuery {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @IsNumber({}, {message: "limit must be a number"})
    limit: number = 10;
}

export class PaginatedResponse<T> {
    limit: number;
    data: T[];
    page: number;
    totalCount: number;
}

export class ApiResponse<T = void> {
    status: "pending" | "success" | "failed";
    message: string;
    // @Type(() => T, {

    // })
    // @Type((options) => (options?.newObject as ApiResponse<T>)?.type || Function)
    data?: T;

    
    constructor(partial: Partial<ApiResponse<T>>) {
        Object.assign(this, partial);
    }
}

export class LoginToken {
    access_token: string;
    refresh_token: string;
    // data: U
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isStrongPassword",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== "string") {
                        return false;
                    }

                    // Define your strong password criteria
                    const hasUpperCase = /[A-Z]/.test(value);
                    const hasLowerCase = /[a-z]/.test(value);
                    const hasNumber = /[0-9]/.test(value);
                    const hasSpecialChar =
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
                    const isLongEnough = value.length >= 6;
                    return (
                        hasUpperCase &&
                        hasLowerCase &&
                        hasNumber &&
                        hasSpecialChar &&
                        isLongEnough
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain at least 6 characters, including uppercase, lowercase, number, and a special character`;
                },
            },
        });
    };
}
