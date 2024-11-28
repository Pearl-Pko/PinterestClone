import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

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
    limit: number = 10


}

export class PaginatedResponse<T> {
    limit: number;
    data: T[];
    page: number;
    totalCount: number;
}

export class ApiResponse<T = void> {
    status: boolean;
    message: string;
    data?: T 
}