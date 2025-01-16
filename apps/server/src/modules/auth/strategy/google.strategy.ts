import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModuleOptions, PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-oauth2';
import {
    Strategy,
    VerifyCallback,
    GoogleCallbackParameters,
} from 'passport-google-oauth20';


export interface GoogleProfile {
    id: string;
    displayName: string;
    emails: { value: string, verified: boolean }[];
    name: {
        familyName: string; // Last name
        givenName: string; // First name
    };

    photos?: { value: string }[];
    provider: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: `${configService.get<string>('SERVER_DOMAIN')}/user/google/callback`,
            callbackUrl: "",
            scope: ['email', 'profile'],


        });

        console.log('ds', configService.get<string>('GOOGLE_CLIENT_ID'));
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<any> {

        done(null, profile);
    }
}
