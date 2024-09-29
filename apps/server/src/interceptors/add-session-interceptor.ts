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
import { AccessTokenDTO, RefreshTokenDto, Tokens } from '@server/types/auth';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AddSessionInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const response: ExpressResponse = ctx.getResponse<ExpressResponse>();
        const request: Request = ctx.getRequest<Request>();

        return next.handle().pipe(
            tap((data: Tokens) => {
                if (!data) return;

                const { access_token, refresh_token } = data;

                if (access_token) {

                    const decodedAccessToken = this.jwtService.decode(access_token) as AccessTokenDTO;

                    response.cookie('access_token', access_token, {
                        httpOnly: true,
                        sameSite: 'strict',
                        // secure: true, // enable in prod
                        expires: new Date(decodedAccessToken.exp * 1000), 
                    });
                }
                if (refresh_token) {
                    const decodedRefreshToken = this.jwtService.decode(refresh_token) as RefreshTokenDto;

                    response.cookie('refresh_token', refresh_token, {
                        httpOnly: true,
                        sameSite: 'strict',
                        // secure: true
                        expires: new Date(decodedRefreshToken.exp * 1000)
                    });
                }
            }),
        );
    }
}
