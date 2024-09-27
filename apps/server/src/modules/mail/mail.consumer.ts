import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordResetJob } from '@server/types/mail';
import { Job } from 'bullmq';


@Processor("email")
export class MailConsumer extends WorkerHost {
    constructor(private mailService: MailerService, private configService: ConfigService) {
        super();
    }
    async process(job: Job, token?: string): Promise<any> {
        switch (job.name) {
            case "password-reset": 
                await this.sendPasswordResetMail(job);
        }
    }

    async sendPasswordResetMail(job: Job<PasswordResetJob>) {
        const {email, token} = job.data;

        const resetUrl = `${this.configService.get<string>("WEB_DOMAIN")}/reset-password?token=${token}`;

        try {
            const result = await this.mailService.sendMail({
                to: `<${email}>`,
                subject: "Password Reset Request",
                template: "./password-reset",
                context: {
                    resetUrl: resetUrl
                }
            })
        }
        catch (error) {
            throw error;
        }
    }
}
