import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AccessTokenDTO } from '@schema/auth';

export type OAuthState = {
    userId?: string;
    source: "link" | "signin";
    redirectAddress?: string;
}

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
    constructor(private configService: ConfigService) {
        super();
    }

    getAuthenticateOptions(
        context: ExecutionContext,
    ): IAuthModuleOptions | undefined {
        const request = context.switchToHttp().getRequest();
        const referer = request.headers.referer || request.headers.referrer;

        const user = request?.user as Partial<AccessTokenDTO>;
        const state = JSON.stringify({
            userId: user?.sub,
            source:
                request.path === '/user/google'
                    ? 'signin'
                    : request.path === '/user/google/link'
                      ? 'link'
                      : '',
            redirectAddress: referer
        } as OAuthState);
        return {
            state: Buffer.from(state).toString("base64url"),
        };
    }
}
