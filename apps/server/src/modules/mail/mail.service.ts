import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(private mailService: MailerService, private configService: ConfigService) {}

    async sendPasswordResetMail(email: string, token: string) {

        const resetUrl = `${this.configService.get<string>("WEB_DOMAIN")}/reset-password?token=${token}`;

        await this.mailService.sendMail({
            to: `<${email}>`,
            subject: "Password Reset Request",
            template: "./password-reset",
            context: {
                resetUrl: resetUrl
            }
        })
    }
}
