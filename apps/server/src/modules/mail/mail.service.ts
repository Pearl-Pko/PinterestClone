import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(@InjectQueue('email') private emailQueue: Queue) {}

    async sendPasswordResetMail(email: string, token: string) {
        await this.emailQueue.add(
            'password-reset',
            {
                email,
                token,
            },
            {
                priority: 2,
            },
        );
    }
}
