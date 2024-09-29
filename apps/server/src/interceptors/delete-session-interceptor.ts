import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Response,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RemoveSessionInterceptor implements NestInterceptor {
    constructor() {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const response: ExpressResponse = ctx.getResponse<ExpressResponse>();

        return next.handle().pipe(
            tap(() => {
                response.clearCookie('access_token');
                response.clearCookie('refresh_token');
            }),
        );
    }
}
