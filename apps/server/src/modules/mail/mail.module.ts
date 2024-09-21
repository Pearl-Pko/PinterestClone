import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
              transport: {
                host: configService.get<string>('MAIL_HOST'), 
                port: configService.get<number>('MAIL_PORT'), 
                secure: false, 
                auth: {
                  user: configService.get<string>('MAIL_USER'),
                  pass: configService.get<string>('MAIL_PASSWORD'),
                 },
              },
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
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
