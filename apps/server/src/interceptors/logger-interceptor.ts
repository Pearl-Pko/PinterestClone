import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger('HTTP');
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';

        const now = Date.now();

        return next.handle().pipe(
            finalize(() => {
                const { statusCode } = res;
                const responseTime = Date.now() - now;
                this.logger.log(
                    `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${userAgent} ${ip}`,
                );
            }),
        );
    }
}
