import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger('HTTP');
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { ip, method, originalUrl } = req;
        const statusCode = 0;
        const userAgent = req.get('user-agent') || '';
        const res = context.switchToHttp().getResponse() as Response;
        //
        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(
                        `${method} ${originalUrl} ${res.statusCode} - ${responseTime}ms - ${userAgent} ${ip}`,
                    );
                },
                error: (error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(
                        `${method} ${originalUrl} ${error.status || 500} - ${responseTime}ms - ${userAgent} ${ip}`,
                    );
                },
            }),
        );
    }
}
