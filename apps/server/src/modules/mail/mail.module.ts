import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './mail.consumer';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: configService.get<string>("SMTP_URI"),
                defaults: {
                    from: `No Reply<${configService.get<string>('MAIL_FROM')}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new EjsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService], // Inject ConfigService into the factory
        }),
        BullModule.registerQueue( {
           name: "email",
        })
    ],
    providers: [MailService, MailConsumer],
    exports: [MailService],
})
export class MailModule {}
