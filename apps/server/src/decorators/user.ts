import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
    <T>(data: unknown, ctx: ExecutionContext): T => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as T; // Cast the request.user to type T
    },
);
