import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule {}
